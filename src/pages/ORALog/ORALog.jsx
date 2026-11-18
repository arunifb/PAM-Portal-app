
import { useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import { CalendarDays, Download } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import 'react-datepicker/dist/react-datepicker.css'
import './ORALog.css'

const FIXED_REMARK = 'HouseKeeping(no table updated or changed)'

// Default Period: 18 November 2025
const DEFAULT_PERIOD = '2025-11-18'

const INITIAL_RECORDS = [
    {
        id: 1,
        pDate: '18-Nov-2026',
        purpose: 'ORA_DB_Log.xlsx',
        pName: 'ORA DB Log',
        remark: FIXED_REMARK,
        revieweddt: '',
        userName: 'Admin',
        docUpload: 'ORA_DB_Log.xlsx',
        pType: 'ORADBLOG'
    },
    {
        id: 2,
        pDate: '17-Nov-2026',
        purpose: 'Critical_Activity.xlsx',
        pName: 'Critical basis activity',
        remark: FIXED_REMARK,
        revieweddt: 'Checked',
        userName: 'Reviewer',
        docUpload: 'Critical_Activity.xlsx',
        pType: 'CBA'
    }
]

function parseDate(value) {
    if (!value) return null

    const [year, month, day] = value.split('-').map(Number)

    if (!year || !month || !day) return null

    return new Date(year, month - 1, day)
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

    if (!date || Number.isNaN(date.getTime())) return value

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace(/ /g, '-')
}

function ORALog() {
    const [period, setPeriod] = useState(DEFAULT_PERIOD)
    const [approvalType, setApprovalType] = useState('ORADBLOG')
    const [fileName, setFileName] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)

    const [searchLogType, setSearchLogType] = useState('0')
    const [records, setRecords] = useState([])
    const [filteredRecords, setFilteredRecords] = useState([])

    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')

    const [editingId, setEditingId] = useState(null)
    const [reviewRemark, setReviewRemark] = useState('')

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
        loadRecords('0')
    }, [])

    const showMessage = (text, type = '') => {
        setMessage(text)
        setMessageType(type)
    }

    // Initial mock data loading
    // Replace with API integration when backend API is ready.
    const loadRecords = (logType = '0') => {
        const data = INITIAL_RECORDS

        const filtered = logType === '0'
            ? data
            : data.filter(item => item.pType === logType)

        setRecords(data)
        setFilteredRecords(filtered)
    }

    // Reset upload form
    const resetUploadForm = () => {
        setPeriod(DEFAULT_PERIOD)
        setApprovalType('ORADBLOG')
        setFileName('')
        setSelectedFile(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // File selection
    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null

        setSelectedFile(file)

        if (file && !fileName.trim()) {
            setFileName(file.name)
        }
    }

    // Upload
    const handleUpload = (event) => {
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

        const newRecord = {
            id: Date.now(),
            pDate: formatDisplayDate(period),
            purpose: fileName.trim(),
            pName: approvalType === 'ORADBLOG'
                ? 'ORA DB Log'
                : 'Critical basis activity',
            remark: FIXED_REMARK,
            revieweddt: '',
            userName: '',
            docUpload: selectedFile.name,
            pType: approvalType,
            file: selectedFile
        }

        const updatedRecords = [newRecord, ...records]

        setRecords(updatedRecords)

        const filtered = updatedRecords.filter(
            item => searchLogType === '0' || item.pType === searchLogType
        )

        setFilteredRecords(filtered)

        showMessage('Data save successfully.', 'success')
        resetUploadForm()
    }

    // Search
    const handleSearch = () => {
        showMessage('', '')

        if (!searchLogType || searchLogType === '0') {
            showMessage('Please select Log Type.', 'danger')
            return
        }

        const filtered = records.filter(
            item => item.pType === searchLogType
        )

        setFilteredRecords(filtered)
    }

    // Download
    const handleDownload = (record) => {
        showMessage('', '')

        if (!record.file) {
            showMessage(
                'This is a sample record. No actual uploaded file is available.',
                'warning'
            )
            return
        }

        const fileUrl = URL.createObjectURL(record.file)
        const link = document.createElement('a')

        link.href = fileUrl
        link.download = record.docUpload || record.purpose

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(fileUrl)
    }

    // Edit review remark
    const handleEdit = (record) => {
        setEditingId(record.id)
        setReviewRemark(record.revieweddt || '')
    }

    // Cancel edit
    const handleCancel = () => {
        setEditingId(null)
        setReviewRemark('')
    }

    // Update review remark
    const handleUpdate = (id) => {
        if (!reviewRemark.trim()) {
            showMessage('Please enter Reviewed Remark.', 'danger')
            return
        }

        const updatedRecords = records.map(item =>
            item.id === id
                ? { ...item, revieweddt: reviewRemark.trim() }
                : item
        )

        setRecords(updatedRecords)

        const filtered = updatedRecords.filter(
            item => searchLogType === '0' || item.pType === searchLogType
        )

        setFilteredRecords(filtered)

        setEditingId(null)
        setReviewRemark('')

        showMessage('Data updated successfully.', 'success')
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
                                        <option value="ORADBLOG">
                                            ORA DB Log
                                        </option>

                                        <option value="CBA">
                                            Critical basis activity
                                        </option>
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
                                >
                                    Upload
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

                                <option value="ORADBLOG">
                                    ORA DB Log
                                </option>
                            </select>
                        </div>

                        <div className="oralog-search-action">
                            <button
                                type="button"
                                className="oralog-btn oralog-btn-secondary"
                                onClick={handleSearch}
                            >
                                Search
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
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map(record => (
                                        <tr key={record.id}>
                                            <td>{record.pDate}</td>
                                            <td>{record.purpose}</td>
                                            <td>{record.pName}</td>

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
                                                    <>
                                                        {record.revieweddt}
                                                        {record.revieweddt && ` (${FIXED_REMARK})`}
                                                    </>
                                                )}
                                            </td>

                                            <td>{record.userName}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="oralog-no-data">
                                            No records found.
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
