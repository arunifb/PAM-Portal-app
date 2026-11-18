
import { useEffect, useRef, useState } from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import './EMUIDUpload.css'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarDays, Download } from 'lucide-react'


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
    // MOCK DATA
    // =========================================

    const mockRecords = [
        {
            id: 1,
            pDate: '18-Nov-2026',
            purpose: 'Emergency_User_Id.xlsx',
            pName: 'Emergency User Id',
            revieweddt: '',
            userName: 'Admin'
        }
    ]


    // =========================================
    // INITIAL LOAD
    // Same as Web Forms Page_Load
    // =========================================

    useEffect(() => {

        loadRecords('0')

    }, [])


    // =========================================
    // LOAD RECORDS
    // =========================================

    const loadRecords = (logType) => {

        /*
         * Backend API is not ready.
         *
         * For now, use local/mock records.
         *
         * Later this function will call:
         *
         * getPAMRequisition(logType)
         */

        if (logType === '0') {

            setRecords(mockRecords)

            return

        }


        const filteredRecords =
            mockRecords.filter(
                record =>
                    record.pName ===
                    'Emergency User Id'
            )

        setRecords(filteredRecords)

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


        const date =
            new Date(value)


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

    const [year, month, day] = value.split('-').map(Number)

    if (!year || !month || !day) return null

    return new Date(year, month - 1, day)
}

const formatInputDate = (date) => {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

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
    // =========================================

    const handleUpload = () => {

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


        // =====================================
        // MOCK UPLOAD
        // =====================================

        const newRecord = {

            id:
                Date.now(),

            pDate:
                formatDate(period),

            purpose:
                fileName,

            pName:
                'Emergency User Id',

            revieweddt:
                '',

            userName:
                'Current User'

        }


        setRecords(prev => [
            newRecord,
            ...prev
        ])


        showMessage(
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

    }


    // =========================================
// SEARCH
// =========================================

const handleSearch = () => {

    showMessage('', '')

    // Log Type Validation
    if (!searchLogType || searchLogType === '0') {

        showMessage(
            'Please give Log type.',
            'danger'
        )

        return
    }

    loadRecords(searchLogType)

}


    // =========================================
    // DOWNLOAD
    // =========================================

    const handleDownload = (record) => {

        /*
         * Backend API is not ready.
         *
         * The legacy application uses Response.WriteFile().
         *
         * For now we create a small local file
         * so the Download button can be tested.
         */

        const content =
            `Emergency User Id File\n\nFile Name: ${record.purpose}`


        const blob =
            new Blob(
                [content],
                {
                    type:
                        'text/plain'
                }
            )


        const url =
            window.URL.createObjectURL(
                blob
            )


        const link =
            document.createElement('a')


        link.href = url

        link.download =
            record.purpose ||
            'EMUID_File.txt'


        document.body.appendChild(
            link
        )


        link.click()


        document.body.removeChild(
            link
        )


        window.URL.revokeObjectURL(
            url
        )

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
    // Same as gvPAMView_RowUpdating
    // =========================================

    const handleUpdate = (recordId) => {

        setRecords(prev =>
            prev.map(record => {

                if (
                    record.id ===
                    recordId
                ) {

                    return {
                        ...record,
                        revieweddt:
                            reviewRemark
                    }

                }

                return record

            })
        )


        setEditingId(null)

        setReviewRemark('')


        showMessage(
            'Data updated successfully',
            'success'
        )

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
                                            className="emuid-no-data"
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
                                                HouseKeeping(no table updated or changed)
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
