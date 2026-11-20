import { useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import { CalendarDays, Download } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import 'react-datepicker/dist/react-datepicker.css'
import './ORALog.css'

import {
    getOraLogTypes,
    getOraLogList,
    uploadOraLog,
    downloadOraLog,
    updateOraLogReview
} from '../../api/oraLogApi'

const FIXED_REMARK = 'HouseKeeping(no table updated or changed)'

// Default Period: 18 November 2025
const DEFAULT_PERIOD = ''

const MAX_FILE_SIZE = 10 * 1024 * 1024

function parseDate(value) {
    if (!value) return null

    // Handles both yyyy-MM-dd and API ISO date values.
    const datePart = String(value).split('T')[0]
    const [year, month, day] = datePart.split('-').map(Number)

    if (!year || !month || !day) return null

    const date = new Date(year, month - 1, day)

    return Number.isNaN(date.getTime()) ? null : date
}

function formatInputDate(date) {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function formatDisplayDate(value) {
    if (!value) return ''

    const date = parseDate(value)

    if (!date) return value

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace(/ /g, '-')
}

function getSessionUserId() {
    return (
        sessionStorage.getItem('userId') ||
        sessionStorage.getItem('UserID') ||
        sessionStorage.getItem('userID') ||
        sessionStorage.getItem('UserId') ||
        ''
    )
}

// Map API response fields to the existing grid structure.
function mapApiRecord(item) {
    return {
        id: item.id ?? item.Id ?? item.ID ?? item.requisitionId ?? item.RequisitionId,
        pDate: formatDisplayDate(item.pDate ?? item.PDate),
        purpose: item.fileName ?? item.FileName ?? '',
        logType: item.logType ?? item.LogType ?? '',
        pType: item.pType ?? item.PType ?? '',
        remark: item.remark ?? item.Remark ?? FIXED_REMARK,
        revieweddt: item.reviewedDt ?? item.ReviewedDt ?? '',
        reviewedRemark: item.reviewedRemark ?? item.ReviewedRemark ?? '',
        userName: item.reviewer ?? item.Reviewer ?? '',
        docUpload: item.docUpload ?? item.DocUpload ?? ''
    }
}

function ORALog() {
    const [period, setPeriod] = useState(DEFAULT_PERIOD)
    const [approvalType, setApprovalType] = useState('ORADBLOG')
    const [fileName, setFileName] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)

    const [logTypes, setLogTypes] = useState([])
    const [searchLogType, setSearchLogType] = useState('0')

    const [records, setRecords] = useState([])
    const [filteredRecords, setFilteredRecords] = useState([])

    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')

    const [editingId, setEditingId] = useState(null)
    const [reviewRemark, setReviewRemark] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const fileInputRef = useRef(null)

    // =========================================
    // DATE RANGE: TODAY - 1 YEAR TO TODAY
    // =========================================

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const minSelectableDate = new Date(today)
    minSelectableDate.setFullYear(
        minSelectableDate.getFullYear() - 1
    )

    useEffect(() => {
        loadLogTypes()
        loadRecords('0')
    }, [])

    const showMessage = (text, type = '') => {
        setMessage(text)
        setMessageType(type)
    }

    // =========================================
    // LOAD LOG TYPES
    // =========================================

    const loadLogTypes = async () => {
        try {
            const data = await getOraLogTypes()

            const types = Array.isArray(data) ? data : []

            setLogTypes(types.map(item => ({
                value: item.value ?? item.Value,
                text: item.text ?? item.Text
            })))
        } catch (error) {
            console.error('ORA Log types error:', error)
            showMessage(
                error.message || 'Unable to load Log Types.',
                'danger'
            )
        }
    }

    // =========================================
    // LOAD RECORDS
    // =========================================

    const loadRecords = async (logType = '0') => {
        try {
            setIsLoading(true)

            const data = await getOraLogList(logType)

            const mappedRecords = data.map(mapApiRecord)

            setRecords(mappedRecords)
            setFilteredRecords(mappedRecords)
        } catch (error) {
            console.error('ORA Log list error:', error)

            setRecords([])
            setFilteredRecords([])

            showMessage(
                error.message || 'Unable to load ORA DB Log records.',
                'danger'
            )
        } finally {
            setIsLoading(false)
        }
    }

    // =========================================
    // RESET UPLOAD FORM
    // =========================================

    const resetUploadForm = () => {
        setPeriod(DEFAULT_PERIOD)
        setApprovalType('ORADBLOG')
        setFileName('')
        setSelectedFile(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // =========================================
    // FILE SELECTION
    // =========================================

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null

        setSelectedFile(file)

        if (file && !fileName.trim()) {
            setFileName(file.name)
        }

        if (file && file.size > MAX_FILE_SIZE) {
            showMessage('Maximum upload size allowed is 10MB.', 'danger')
            setSelectedFile(null)
            event.target.value = ''
        } else {
            showMessage('', '')
        }
    }

    // =========================================
    // UPLOAD
    // =========================================

    const handleUpload = async (event) => {
        event.preventDefault()
        showMessage('', '')

        if (!period) {
            showMessage('Please select Period.', 'danger')
            return
        }

        if (!approvalType) {
            showMessage('Please select Type.', 'danger')
            return
        }

        if (!fileName.trim()) {
            showMessage('Please enter File Name.', 'danger')
            return
        }

        if (!selectedFile) {
            showMessage('Please select a file to upload.', 'danger')
            return
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            showMessage('Maximum upload size allowed is 10MB.', 'danger')
            return
        }

        const userId = Number(getSessionUserId())

        if (!userId || userId <= 0) {
            showMessage(
                'User ID is missing. Please login again.',
                'danger'
            )
            return
        }

        try {
            setIsUploading(true)

            const result = await uploadOraLog({
                period,
                logType: approvalType,
                fileName: fileName.trim(),
                createdBy: userId,
                file: selectedFile
            })

            showMessage(
                result.message || 'Data save successfully.',
                'success'
            )

            resetUploadForm()

            // Refresh the currently selected grid filter.
            await loadRecords(searchLogType)
        } catch (error) {
            console.error('ORA Log upload error:', error)

            showMessage(
                error.message || 'Unable to upload file.',
                'danger'
            )
        } finally {
            setIsUploading(false)
        }
    }

    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async () => {
        showMessage('', '')

        if (!searchLogType || searchLogType === '0') {
            showMessage('Please select Log Type.', 'danger')
            return
        }

        await loadRecords(searchLogType)
    }

    // =========================================
    // DOWNLOAD
    // =========================================

    const handleDownload = async (record) => {
    showMessage('', '')

    console.log('ORA Log Download Record:', record)
    console.log('Download ID:', record?.id)
    console.log('Download LogType:', record?.logType)

    try {
        if (!record?.id) {
            showMessage('Record ID is missing. Cannot download file.', 'danger')
            return
        }

        await downloadOraLog(record.id, record.logType)
    } catch (error) {
        console.error('ORA Log download error:', error)

        showMessage(
            error.message || 'Unable to download file.',
            'danger'
        )
    }
}

    // =========================================
    // EDIT REVIEW REMARK
    // =========================================

    const handleEdit = (record) => {
        setEditingId(record.id)
        setReviewRemark(record.revieweddt || '')
        showMessage('', '')
    }

    // =========================================
    // CANCEL REVIEW EDIT
    // =========================================

    const handleCancel = () => {
        setEditingId(null)
        setReviewRemark('')
    }

    // =========================================
    // UPDATE REVIEW REMARK
    // =========================================

    const handleUpdate = async (id) => {
        if (!reviewRemark.trim()) {
            showMessage('Please enter Reviewed Remark.', 'danger')
            return
        }

        try {
            const result = await updateOraLogReview(
                id,
                reviewRemark.trim()
            )

            setEditingId(null)
            setReviewRemark('')

            showMessage(
                result.message || 'Data updated successfully.',
                'success'
            )

            await loadRecords(searchLogType)
        } catch (error) {
            console.error('ORA Log review update error:', error)

            showMessage(
                error.message || 'Unable to update Reviewed Remark.',
                'danger'
            )
        }
    }

    // Get friendly type name for the grid.
    const getLogTypeText = (value) => {
        const matchingType = logTypes.find(
            item => item.value === value
        )

        return matchingType?.text || value || ''
    }

    return (
        <DashboardLayout title="ORA DB Log Report">
            <div className="oralog-page">

                {/* Upload Form */}
                <div className="oralog-card">
                    <form onSubmit={handleUpload}>

                        <div className="oralog-form-top-row">

                            {/* Period */}
                            <div className="oralog-form-row">
                                <label>Period</label>

                                <div className="oralog-field">
                                    <div className="oralog-date-picker-container">
                                        <DatePicker
                                            selected={parseDate(period)}
                                            onChange={(date) =>
                                                setPeriod(formatInputDate(date))
                                            }
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Select Period"
                                            className="oralog-date-control"
                                            wrapperClassName="oralog-date-picker-wrapper"
                                            showPopperArrow={false}
                                            autoComplete="off"
                                            isClearable={false}
                                            minDate={minSelectableDate}
                                            maxDate={today}
                                        />

                                        <button
                                            type="button"
                                            className="oralog-calendar-icon"
                                            aria-label="Open Period calendar"
                                            onClick={(event) => {
                                                event.currentTarget.parentElement
                                                    ?.querySelector('input')
                                                    ?.focus()
                                            }}
                                        >
                                            <CalendarDays size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Type */}
                            <div className="oralog-form-row">
                                <label>Type</label>

                                <div className="oralog-field">
                                    <select
                                        className="oralog-control"
                                        value={approvalType}
                                        onChange={(event) =>
                                            setApprovalType(event.target.value)
                                        }
                                    >
                                        {logTypes.map(type => (
                                            <option
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.text}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* File Name */}
                            <div className="oralog-form-row">
                                <label>File Name</label>

                                <div className="oralog-field">
                                    <input
                                        type="text"
                                        className="oralog-control"
                                        value={fileName}
                                        onChange={(event) =>
                                            setFileName(event.target.value)
                                        }
                                        placeholder="Enter File Name"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Remark */}
                        <div className="oralog-form-row oralog-full-row">
                            <label>Remark</label>

                            <div className="oralog-field">
                                <input
                                    type="text"
                                    className="oralog-control"
                                    value={FIXED_REMARK}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="oralog-file-upload-row">
                            <div className="oralog-form-row">
                                <label>Upload File</label>

                                <div className="oralog-field">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="oralog-control oralog-file-control"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="oralog-upload-actions">
                                <button
                                    type="submit"
                                    className="oralog-btn oralog-btn-success"
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Message */}
                {message && (
                    <div className={`oralog-message oralog-message-${messageType}`}>
                        {message}
                    </div>
                )}

                {/* Search and Results */}
                <div className="oralog-card oralog-grid-card">

                    <div className="oralog-search-row">

                        <div className="oralog-search-field">
                            <label>Log Type</label>

                            <select
                                className="oralog-control"
                                value={searchLogType}
                                onChange={(event) =>
                                    setSearchLogType(event.target.value)
                                }
                            >
                                <option value="0">
                                    --select log type --
                                </option>

                                {logTypes.map(type => (
                                    <option
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="oralog-search-action">
                            <button
                                type="button"
                                className="oralog-btn oralog-btn-secondary"
                                onClick={handleSearch}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Search'}
                            </button>
                        </div>

                    </div>

                    {/* Results Table */}
                    <div className="oralog-table-wrapper">
                        <table className="oralog-table">

                            <thead>
                                <tr>
                                    <th>Period</th>
                                    <th>File Name</th>
                                    <th>Log Type</th>
                                    <th>Remark</th>
                                    <th>Download</th>
                                    <th>Reviewed Remark</th>
                                    <th>Reviewer</th>
                                    {/* <th>Action</th> */}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map(record => (
                                        <tr key={record.id}>
                                            <td>{record.pDate}</td>

                                            <td>{record.purpose}</td>

                                            <td>{getLogTypeText(record.logType)}</td>

                                            <td>
                                                <span className="oralog-remark-label">
                                                    {record.remark}
                                                </span>
                                            </td>

                                            <td className="oralog-download-cell">
                                                <button
                                                    type="button"
                                                    className="oralog-download-btn"
                                                    title="Download"
                                                    onClick={() => handleDownload(record)}
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </td>

                                            <td>
                                                {editingId === record.id ? (
                                                    <input
                                                        type="text"
                                                        className="oralog-control oralog-review-input"
                                                        value={reviewRemark}
                                                        onChange={(event) =>
                                                            setReviewRemark(event.target.value)
                                                        }
                                                        placeholder="Enter Reviewed Remark"
                                                    />
                                                ) : (
                                                    record.revieweddt
                                                )}
                                            </td>

                                            <td>{record.userName}</td>

                                            {/* <td>
                                                {editingId === record.id ? (
                                                    <div className="oralog-action-buttons">
                                                        <button
                                                            type="button"
                                                            className="oralog-btn oralog-btn-success"
                                                            onClick={() => handleUpdate(record.id)}
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="oralog-btn oralog-btn-secondary"
                                                            onClick={handleCancel}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="oralog-btn oralog-btn-secondary"
                                                        onClick={() => handleEdit(record)}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </td> */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className={`no-record-found oralog-no-data ${
                                                isLoading ? 'oralog-loading-text' : ''
                                            }`}
                                        >
                                            {isLoading
                                                ? 'Loading records...'
                                                : 'No records found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>

                    <div className="oralog-table-footer">
                        <span>
                            Showing {filteredRecords.length} record(s)
                        </span>
                    </div>

                </div>

            </div>
        </DashboardLayout>
    )
}

export default ORALog