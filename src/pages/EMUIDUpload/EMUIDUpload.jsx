
import { useEffect, useRef, useState } from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import './EMUIDUpload.css'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarDays, Download } from 'lucide-react'

import {
    getEmuidList,
    uploadEmuidFile,
    downloadEmuidFile,
    updateEmuidReview
} from '../../api/emuidUploadApi'


function EMUIDUpload() {

    // =========================================
    // STATE
    // =========================================

    const [period, setPeriod] = useState('')

    const [approvalType, setApprovalType] =
        useState('EMUID')

    const [fileName, setFileName] =
        useState('')

    const [remark] =
        useState(
            'HouseKeeping(no table updated or changed)'
        )

    const [selectedFile, setSelectedFile] =
        useState(null)

    const [searchLogType, setSearchLogType] =
        useState('0')

    const [records, setRecords] =
        useState([])

    const [message, setMessage] =
        useState('')

    const [messageType, setMessageType] =
        useState('')

    const [editingId, setEditingId] =
        useState(null)

    const [reviewRemark, setReviewRemark] =
        useState('')

    const fileInputRef =
        useRef(null)


    // =========================================
    // DATE RANGE: TODAY - 1 YEAR TO TODAY
    // =========================================

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const minSelectableDate = new Date(today)

    minSelectableDate.setFullYear(
        minSelectableDate.getFullYear() - 1
    )


    // =========================================
    // GET SESSION USER ID
    // =========================================

    const getSessionUserId = () => {

        return (
            sessionStorage.getItem('userId') ||
            sessionStorage.getItem('UserID') ||
            sessionStorage.getItem('userID') ||
            sessionStorage.getItem('UserId') ||
            ''
        )

    }


    // =========================================
    // INITIAL LOAD
    // Same as Web Forms Page_Load
    // =========================================

    useEffect(() => {

        loadRecords('0')

    }, [])


    // =========================================
    // LOAD RECORDS
    // GET /api/pam/FireFighter/list
    // =========================================

    const loadRecords = async (logType) => {

        try {

            const response =
                await getEmuidList(logType)

            const mappedRecords =
                response.map(record => ({

                    id:
                        record.id ??
                        record.Id,

                    pDate:
                        formatDate(
                            record.pDate ??
                            record.PDate
                        ),

                    purpose:
                        record.fileName ??
                        record.FileName ??
                        '',

                    pName:
                        'Emergency User Id',

                    logType:
                        record.logType ??
                        record.LogType ??
                        'EMUID',

                    remark:
                        record.remark ??
                        record.Remark ??
                        'HouseKeeping(no table updated or changed)',

                    revieweddt:
                        record.reviewedRemark ??
                        record.ReviewedRemark ??
                        '',

                    reviewedDate:
                        record.reviewedDt ??
                        record.ReviewedDt ??
                        '',

                    userName:
                        record.reviewer ??
                        record.Reviewer ??
                        ''

                }))


            setRecords(mappedRecords)

        } catch (error) {

            console.error(
                'Error loading EMUID records:',
                error
            )

            setRecords([])

            showMessage(
                error.message ||
                'Unable to load records.',
                'danger'
            )

        }

    }


    // =========================================
    // MESSAGE
    // =========================================

    const showMessage = (
        text,
        type
    ) => {

        setMessage(text)

        setMessageType(type)

    }


    // =========================================
    // DATE FORMAT
    // =========================================

    const formatDate = (value) => {

        if (!value) {
            return ''
        }

        const date = new Date(value)

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value

        }

        const day =
            String(
                date.getDate()
            ).padStart(2, '0')


        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ]


        const month =
            monthNames[
                date.getMonth()
            ]


        const year =
            date.getFullYear()


        return `${day}-${month}-${year}`

    }


    // =========================================
    // DATE PICKER HELPERS
    // =========================================

    const parseDate = (value) => {

        if (!value) return null

        const [year, month, day] =
            value.split('-').map(Number)

        if (!year || !month || !day) return null

        return new Date(
            year,
            month - 1,
            day
        )

    }


    const formatInputDate = (date) => {

        if (!date) return ''

        const year =
            date.getFullYear()

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, '0')

        const day =
            String(
                date.getDate()
            ).padStart(2, '0')

        return `${year}-${month}-${day}`

    }


    // =========================================
    // FILE CHANGE
    // =========================================

    const handleFileChange = (event) => {

        const file =
            event.target.files?.[0]


        if (!file) {

            setSelectedFile(null)

            return

        }


        setSelectedFile(file)

        setFileName(
            file.name
        )

    }


    // =========================================
    // UPLOAD
    // POST /api/pam/FireFighter/upload
    // =========================================

    const handleUpload = async () => {

        showMessage(
            '',
            ''
        )


        // =====================================
        // VALIDATION
        // =====================================

        if (!period) {

            showMessage(
                'Please select Period.',
                'danger'
            )

            return

        }


        if (!approvalType) {

            showMessage(
                'Please select Type.',
                'danger'
            )

            return

        }


        if (!fileName.trim()) {

            showMessage(
                'Please enter File Name.',
                'danger'
            )

            return

        }


        if (!selectedFile) {

            showMessage(
                'Please select a file.',
                'danger'
            )

            return

        }


        const userId =
            getSessionUserId()


        if (!userId || Number(userId) <= 0) {

            showMessage(
                'User ID is missing. Please login again.',
                'danger'
            )

            return

        }


        // =====================================
        // API UPLOAD
        // =====================================

        try {

            const response =
                await uploadEmuidFile({

                    period: period,

                    logType: approvalType,

                    fileName: fileName.trim(),

                    createdBy: userId,

                    file: selectedFile

                })


            const isSuccess =
                response.isSuccess ??
                response.IsSuccess ??
                true


            if (!isSuccess) {

                showMessage(
                    response.message ||
                    response.Message ||
                    'Unable to upload file.',
                    'danger'
                )

                return

            }


            showMessage(
                response.message ||
                response.Message ||
                'Data save successfully.',
                'success'
            )


            // =====================================
            // RESET UPLOAD FORM
            // =====================================

            setPeriod('')

            setFileName('')

            setSelectedFile(null)


            if (fileInputRef.current) {

                fileInputRef.current.value = ''

            }


            // =====================================
            // REFRESH GRID
            // =====================================

            await loadRecords('0')

        } catch (error) {

            console.error(
                'EMUID upload error:',
                error
            )

            showMessage(
                error.message ||
                'Unable to upload file.',
                'danger'
            )

        }

    }


    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async () => {

        showMessage('', '')


        // Log Type Validation

        if (!searchLogType || searchLogType === '0') {

            showMessage(
                'Please give Log type.',
                'danger'
            )

            return

        }


        await loadRecords(searchLogType)

    }


    // =========================================
    // DOWNLOAD
    // GET /api/pam/FireFighter/download/{id}
    // =========================================

    const handleDownload = async (record) => {

        showMessage('', '')

        try {

            await downloadEmuidFile(
                record.id,
                record.logType || 'EMUID'
            )

        } catch (error) {

            console.error(
                'EMUID download error:',
                error
            )

            showMessage(
                error.message ||
                'Unable to download file.',
                'danger'
            )

        }

    }


    // =========================================
    // EDIT REVIEW REMARK
    // =========================================

    const handleEdit = (record) => {

        setEditingId(
            record.id
        )

        setReviewRemark(
            record.revieweddt || ''
        )

        showMessage(
            '',
            ''
        )

    }


    // =========================================
    // UPDATE REVIEW REMARK
    // POST /api/pam/FireFighter/review
    // Same as gvPAMView_RowUpdating
    // =========================================

    const handleUpdate = async (recordId) => {

        try {

            const response =
                await updateEmuidReview(
                    recordId,
                    reviewRemark
                )


            const isSuccess =
                response.isSuccess ??
                response.IsSuccess ??
                true


            if (!isSuccess) {

                showMessage(
                    response.message ||
                    response.Message ||
                    'Unable to update review remark.',
                    'danger'
                )

                return

            }


            setEditingId(null)

            setReviewRemark('')


            showMessage(
                response.message ||
                response.Message ||
                'Data updated successfully',
                'success'
            )


            await loadRecords(
                searchLogType
            )

        } catch (error) {

            console.error(
                'EMUID review update error:',
                error
            )

            showMessage(
                error.message ||
                'Unable to update review remark.',
                'danger'
            )

        }

    }


    // =========================================
    // CANCEL EDIT
    // =========================================

    const handleCancelEdit = () => {

        setEditingId(null)

        setReviewRemark('')

        showMessage(
            '',
            ''
        )

    }


    // =========================================
    // RENDER
    // =========================================

    return (

        <DashboardLayout title="Fire Fighter - Details Upload">

            <div className="emuid-upload-page">


                {/* =====================================
                    UPLOAD SECTION
                ====================================== */}

                <div className="emuid-card">

                    {/* MESSAGE */}

                    {message && (

                        <div
                            className={
                                `emuid-alert emuid-alert-${messageType}`
                            }
                        >
                            {message}
                        </div>

                    )}


                    {/* UPLOAD FORM */}

                    <div className="emuid-form">


                        {/* =================================
                            FIRST ROW
                            PERIOD | TYPE | FILE NAME
                        ================================== */}

                        <div className="emuid-form-top-row">


                            

                            {/* PERIOD */}

                            <div className="emuid-form-row">

                                <label>
                                    Period
                                </label>

                                <div className="emuid-field">

                                    <div className="emuid-date-picker-container">

                                        <DatePicker
                                            selected={parseDate(period)}
                                            onChange={(date) =>
                                                setPeriod(formatInputDate(date))
                                            }
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Select Period"
                                            className="emuid-date-control"
                                            wrapperClassName="emuid-date-picker-wrapper"
                                            showPopperArrow={false}
                                            autoComplete="off"
                                            isClearable={false}
                                            minDate={minSelectableDate}
                                            maxDate={today}
                                        />

                                        <button
                                            type="button"
                                            className="emuid-calendar-icon"
                                            aria-label="Open Period calendar"
                                            onClick={(event) => {
                                                event.currentTarget
                                                    .parentElement
                                                    ?.querySelector('input')
                                                    ?.focus()
                                            }}
                                        >
                                            <CalendarDays size={16} />
                                        </button>

                                    </div>

                                </div>

                            </div>


                            {/* TYPE */}

                            <div className="emuid-form-row">

                                <label>
                                    Type
                                </label>

                                <div className="emuid-field">

                                    <select
                                        className="emuid-input"
                                        value={approvalType}
                                        onChange={(event) =>
                                            setApprovalType(
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="EMUID">
                                            Emergency User Id
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* FILE NAME */}

                            <div className="emuid-form-row">

                                <label>
                                    File Name
                                </label>

                                <div className="emuid-field">

                                    <input
                                        type="text"
                                        className="emuid-input"
                                        placeholder="Enter file name"
                                        value={fileName}
                                        onChange={(event) =>
                                            setFileName(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* =================================
                            SECOND ROW
                            REMARK
                        ================================== */}

                        <div className="emuid-form-row emuid-full-row">

                            <label>
                                Remark
                            </label>

                            <div className="emuid-field">

                                <input
                                    type="text"
                                    className="emuid-input"
                                    value={remark}
                                    disabled
                                />

                            </div>

                        </div>


                        {/* =================================
                            THIRD ROW
                            UPLOAD FILE | UPLOAD BUTTON
                        ================================== */}

                        <div className="emuid-file-upload-row">

                            {/* UPLOAD FILE */}

                            <div className="emuid-form-row emuid-file-upload-field">

                                <label>
                                    Upload File
                                </label>

                                <div className="emuid-field">

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="emuid-file-input"
                                        onChange={handleFileChange}
                                    />

                                </div>

                            </div>

                            {/* UPLOAD BUTTON */}

                            <div className="emuid-file-upload-button">

                                <button
                                    type="button"
                                    className="emuid-btn emuid-btn-success"
                                    onClick={handleUpload}
                                >
                                    Upload
                                </button>

                            </div>

                        </div>


                        

                    </div>

                </div>


                {/* =====================================
                    SEARCH SECTION
                ====================================== */}

                <div className="emuid-card emuid-search-card">

                    <div className="emuid-search-row">

                        <div className="emuid-search-field">

                            <label>
                                Log Type
                            </label>

                            <select
                                className="emuid-input"
                                value={searchLogType}
                                onChange={(event) =>
                                    setSearchLogType(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="0">
                                    --select log type--
                                </option>

                                <option value="EMUID">
                                    Emergency User Id
                                </option>

                            </select>

                        </div>


                        <div className="emuid-search-button">

                            <button
                                type="button"
                                className="emuid-btn emuid-btn-primary"
                                onClick={
                                    handleSearch
                                }
                            >
                                Search
                            </button>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    RESULTS GRID
                ====================================== */}

                <div className="emuid-card emuid-grid-card">

                    <div className="emuid-table-wrapper">

                        <table className="emuid-table">

                            <thead>

                                <tr>

                                    <th>Period</th>

                                    <th>File Name</th>

                                    <th>Log Type</th>

                                    <th>Remark</th>

                                    <th>Download</th>

                                    <th>Reviewed Remark</th>

                                    <th>Reviewer</th>

                                    {/* <th>Edit</th> */}

                                </tr>

                            </thead>


                            <tbody>

                                {records.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="no-record-found emuid-no-data"
                                        >
                                            No records found
                                        </td>

                                    </tr>

                                ) : (

                                    records.map(record => (

                                        <tr key={record.id}>

                                            {/* PERIOD */}

                                            <td>
                                                {record.pDate}
                                            </td>


                                            {/* FILE NAME */}

                                            <td>
                                                {record.purpose}
                                            </td>


                                            {/* LOG TYPE */}

                                            <td>
                                                {record.pName}
                                            </td>


                                            {/* REMARK */}

                                            <td>
                                                {record.remark}
                                            </td>


                                            {/* DOWNLOAD */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="emuid-download-btn"
                                                    title="Download"
                                                    aria-label="Download file"
                                                    onClick={() =>
                                                        handleDownload(record)
                                                    }
                                                >
                                                    <Download size={15} />
                                                </button>

                                            </td>


                                            {/* REVIEWED REMARK */}

                                            <td>

                                                {editingId === record.id ? (

                                                    <input
                                                        type="text"
                                                        className="emuid-review-input"
                                                        value={reviewRemark}
                                                        onChange={(event) =>
                                                            setReviewRemark(
                                                                event.target.value
                                                            )
                                                        }
                                                    />

                                                ) : (

                                                    record.revieweddt
                                                        ? record.revieweddt
                                                        : ''

                                                )}

                                            </td>


                                            {/* REVIEWER */}

                                            <td>
                                                {record.userName}
                                            </td>


                                            {/* EDIT */}

                                            {/* <td>

                                                {editingId === record.id ? (

                                                    <div className="emuid-edit-actions">

                                                        <button
                                                            type="button"
                                                            className="emuid-btn emuid-btn-update"
                                                            onClick={() =>
                                                                handleUpdate(record.id)
                                                            }
                                                        >
                                                            Update
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="emuid-btn emuid-btn-cancel"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Cancel
                                                        </button>

                                                    </div>

                                                ) : (

                                                    <button
                                                        type="button"
                                                        className="emuid-btn emuid-btn-edit"
                                                        onClick={() =>
                                                            handleEdit(record)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                )}

                                            </td> */}

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </DashboardLayout>

    )

}


export default EMUIDUpload
