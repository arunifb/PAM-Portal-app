import { useRef, useState } from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    uploadCheckTicketStatus,
    exportCheckTicketStatus
} from '../../api/checkTicketStatusApi'

import './CheckTicketStatus.css'

// =====================================================
// CHECK TICKET STATUS
// =====================================================

function CheckTicketStatus() {

    // =====================================================
    // STATE
    // =====================================================

    const [selectedFile, setSelectedFile] = useState(null)
    const [rows, setRows] = useState([])

    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const fileInputRef = useRef(null)

    // =====================================================
    // FILE CHANGE
    // =====================================================

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]

        setError('')
        setSuccess('')

        if (!file) {
            setSelectedFile(null)
            return
        }

        const fileName = file.name.toLowerCase()

        if (
            !fileName.endsWith('.xls') &&
            !fileName.endsWith('.xlsx')
        ) {
            setSelectedFile(null)

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

            setError('Only .xls or .xlsx files are allowed.')

            return
        }

        setSelectedFile(file)
    }

    // =====================================================
    // UPLOAD
    // =====================================================

    const handleUpload = async () => {
        setError('')
        setSuccess('')

        if (!selectedFile) {
            setError('Please select a file.')
            return
        }

        try {
            setLoading(true)

            const data = await uploadCheckTicketStatus(selectedFile)

            const resultRows =
                Array.isArray(data.Data)
                    ? data.Data
                    : Array.isArray(data.data)
                        ? data.data
                        : []

            setRows(resultRows)

            setSuccess(
                data.Message ||
                data.message ||
                `${resultRows.length} record(s) found.`
            )

        } catch (err) {
            console.error('Check Ticket Status upload error:', err)

            setRows([])

            setError(
                err.message ||
                'Unable to process the uploaded file.'
            )

        } finally {
            setLoading(false)
        }
    }

    // =====================================================
    // DOWNLOAD
    // =====================================================

    const handleDownload = async () => {
        setError('')
        setSuccess('')

        if (!rows.length) {
            setError('No data available to download.')
            return
        }

        try {
            setDownloading(true)

            const blob = await exportCheckTicketStatus(rows)

            const url = window.URL.createObjectURL(blob)

            const link = document.createElement('a')

            link.href = url
            link.download = 'Ticket Status.xlsx'

            document.body.appendChild(link)

            link.click()

            link.remove()

            window.URL.revokeObjectURL(url)

            setSuccess('Ticket Status.xlsx downloaded successfully.')

        } catch (err) {
            console.error('Check Ticket Status download error:', err)

            setError(
                err.message ||
                'Unable to download ticket status report.'
            )

        } finally {
            setDownloading(false)
        }
    }

    // =====================================================
    // RESET
    // =====================================================

    const handleReset = () => {
        setSelectedFile(null)
        setRows([])
        setError('')
        setSuccess('')

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (value) => {
        if (!value) {
            return ''
        }

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return value
        }

        const day = String(date.getDate()).padStart(2, '0')

        const months = [
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

        const month = months[date.getMonth()]

        const year = date.getFullYear()

        return `${day}-${month}-${year}`
    }

    // =====================================================
    // TABLE VALUE
    // =====================================================

    const getValue = (row, key) => {
        if (!row) {
            return ''
        }

        return row[key] ?? ''
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <DashboardLayout title="Check Ticket Status With Spare">

            <div className="check-ticket-status-page">

                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="check-ticket-status-header">

                    

                </div>

                {/* =====================================================
                    UPLOAD SECTION
                ===================================================== */}

                <div className="check-ticket-upload-card">

                    <div className="check-ticket-upload-row">

                        <div className="check-ticket-file-wrapper">

                            <label
                                htmlFor="checkTicketStatusFile"
                                className="check-ticket-label"
                            >
                                Select Excel File
                            </label>

                            <input
                                ref={fileInputRef}
                                id="checkTicketStatusFile"
                                type="file"
                                className="form-control"
                                accept=".xls,.xlsx"
                                onChange={handleFileChange}
                            />

                        </div>

                        <div className="check-ticket-upload-actions">

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={
                                    loading ||
                                    !selectedFile
                                }
                            >
                                {loading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        />

                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-upload me-2" />

                                        Upload
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleReset}
                                disabled={
                                    loading ||
                                    downloading
                                }
                            >
                                <i className="fa fa-refresh me-2" />

                                Reset
                            </button>

                            {rows.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleDownload}
                                    disabled={
                                        loading ||
                                        downloading
                                    }
                                >
                                    {downloading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            />

                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-download me-2" />

                                            Download
                                        </>
                                    )}
                                </button>
                            )}

                        </div>

                    </div>

                    {selectedFile && (
                        <div className="selected-file-name">
                            Selected file:
                            <strong>
                                {selectedFile.name}
                            </strong>
                        </div>
                    )}

                </div>

                {/* =====================================================
                    ERROR MESSAGE
                ===================================================== */}

                {error && (
                    <div
                        className="alert alert-danger check-ticket-alert"
                        role="alert"
                    >
                        <i
                            className="fa fa-exclamation-circle me-2"
                            aria-hidden="true"
                        />

                        {error}
                    </div>
                )}

                {/* =====================================================
                    SUCCESS MESSAGE
                ===================================================== */}

                {success && !error && (
                    <div
                        className="alert alert-success check-ticket-alert"
                        role="alert"
                    >
                        <i
                            className="fa fa-check-circle me-2"
                            aria-hidden="true"
                        />

                        {success}
                    </div>
                )}

                {/* =====================================================
                    RESULT COUNT
                ===================================================== */}

                {rows.length > 0 && (
                    <div className="check-ticket-result-info">
                        <strong>
                            {rows.length}
                        </strong>

                        {' '}record(s) found.
                    </div>
                )}

                {/* =====================================================
                    RESULT TABLE
                ===================================================== */}

                {rows.length > 0 && (
                    <div className="check-ticket-table-card">

                        <div className="check-ticket-table-wrapper">

                            <table className="table table-striped table-bordered check-ticket-table">

                                <thead>

                                    <tr>
                                        <th>Ticket No</th>
                                        <th>Service Type</th>
                                        <th>Status</th>
                                        <th>Branch</th>
                                        <th>Franchise</th>
                                        <th>Customer Code</th>
                                        <th>Customer Name</th>
                                        <th>Pincode</th>
                                        <th>Product</th>
                                        <th>Serial Number</th>
                                        <th>DOP</th>
                                        <th>DOI</th>
                                        <th>Dealer Name</th>
                                        <th>Pending Reason</th>
                                        <th>Call Book Date</th>
                                        <th>Soft Closure Date</th>
                                        <th>CLOSED_TIME</th>
                                        <th>Spare</th>
                                        <th>SpareDesc</th>
                                        <th>Created By</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {rows.map((row, index) => (

                                        <tr key={index}>

                                            {/* Ticket No */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'TicketNo'
                                                )}
                                            </td>

                                            {/* Service Type */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'ServiceType'
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="ticket-status-cell">
                                                {getValue(
                                                    row,
                                                    'Status'
                                                )}
                                            </td>

                                            {/* Branch */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'Branch'
                                                )}
                                            </td>

                                            {/* Franchise */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'Franchise'
                                                )}
                                            </td>

                                            {/* Customer Code */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'CustomerCode'
                                                )}
                                            </td>

                                            {/* Customer Name */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'CustomerName'
                                                )}
                                            </td>

                                            {/* Pincode */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'Pincode'
                                                )}
                                            </td>

                                            {/* Product */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'Product'
                                                )}
                                            </td>

                                            {/* Serial Number */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'SerialNumber'
                                                )}
                                            </td>

                                            {/* DOP */}
                                            <td>
                                                {formatDate(
                                                    getValue(
                                                        row,
                                                        'DOP'
                                                    )
                                                )}
                                            </td>

                                            {/* DOI */}
                                            <td>
                                                {formatDate(
                                                    getValue(
                                                        row,
                                                        'DOI'
                                                    )
                                                )}
                                            </td>

                                            {/* Dealer Name */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'DealerName'
                                                )}
                                            </td>

                                            {/* Pending Reason */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'PendingReason'
                                                )}
                                            </td>

                                            {/* Call Book Date */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'CallBookDate'
                                                )}
                                            </td>

                                            {/* Soft Closure Date */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'SoftClosureDate'
                                                )}
                                            </td>

                                            {/* Closed Time */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'ClosedTime'
                                                )}
                                            </td>

                                            {/* Spare */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'Spare'
                                                )}
                                            </td>

                                            {/* Spare Description */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'SpareDesc'
                                                )}
                                            </td>

                                            {/* Created By */}
                                            <td>
                                                {getValue(
                                                    row,
                                                    'CreatedBy'
                                                )}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>
                )}

                {/* =====================================================
                    NO DATA
                ===================================================== */}

                {!loading &&
                    !error &&
                    selectedFile &&
                    rows.length === 0 &&
                    success && (
                        <div className="check-ticket-no-data">
                            No records found.
                        </div>
                    )}

            </div>

        </DashboardLayout>
    )
}

export default CheckTicketStatus