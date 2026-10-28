import { useState } from 'react'
import './UploadMSMEDoc.css'

import {
    searchVendorMsme,
    uploadVendorMsme
} from '../../api/msmeApi'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

// Keep this list aligned with the legacy normalFileAllowedExtn
// configuration used by UploadMSMEDoc.aspx.
const ALLOWED_FILE_EXTENSIONS = [
    'pdf',
    'jpg',
    'jpeg',
    'png',
    'doc',
    'docx'
]

const MAX_FILE_SIZE = 3 * 1024 * 1024

function UploadMSMEDoc() {
    // =========================================
    // SESSION VALUES
    // =========================================

    const userId = sessionStorage.getItem('userId') || ''

    // =========================================
    // SEARCH STATE
    // =========================================

    const [refNo, setRefNo] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)

    // =========================================
    // MESSAGE STATE
    // =========================================

    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // =========================================
    // ROW FORM STATE
    // =========================================

    const [rowForms, setRowForms] = useState({})
    const [uploadingId, setUploadingId] = useState(null)
    const [uploadSuccessId, setUploadSuccessId] = useState(null)

    // =========================================
    // HELPERS
    // =========================================

    const getValue = (item, ...keys) => {
        for (const key of keys) {
            if (item?.[key] !== undefined && item?.[key] !== null) {
                return item[key]
            }
        }

        return ''
    }

    const getRowForm = (item) => {
        const id = String(getValue(item, 'Id', 'id'))

        return rowForms[id] || {
            msmeRegNo: getValue(item, 'MSMERegNo', 'msmeRegNo'),
            file: null,
            validationError: '',
            uploadMessage: ''
        }
    }

    const updateRowForm = (item, updates) => {
        const id = String(getValue(item, 'Id', 'id'))

        setRowForms((previous) => ({
            ...previous,
            [id]: {
                ...(
                    previous[id] || {
                        msmeRegNo: getValue(
                            item,
                            'MSMERegNo',
                            'msmeRegNo'
                        ),
                        file: null,
                        validationError: '',
                        uploadMessage: ''
                    }
                ),
                ...updates
            }
        }))
    }

    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async () => {
        setError('')
        setMessage('')
        setResults([])
        setRowForms({})
        setUploadSuccessId(null)
        setShowResults(true)

        if (!refNo.trim()) {
            setError('Please enter Ref No.')
            return
        }

        if (!/^\d+$/.test(refNo.trim())) {
            setError('Ref No must contain numbers only.')
            return
        }

        try {
            setLoading(true)

            const response = await searchVendorMsme(refNo.trim())

            const records = Array.isArray(response.Data)
                ? response.Data
                : Array.isArray(response.data)
                    ? response.data
                    : []

            setResults(records)

            if (records.length === 0) {
                setMessage(
                    response.Message ||
                    response.message ||
                    'NO RECORDS FOUND!!'
                )
            }
        } catch (err) {
            console.error('MSME search error:', err)

            setResults([])
            setError(err.message || 'Unable to search vendor.')
        } finally {
            setLoading(false)
        }
    }

    // =========================================
    // CLEAR
    // =========================================

    const handleClear = () => {
        setRefNo('')
        setResults([])
        setRowForms({})
        setError('')
        setMessage('')
        setShowResults(false)
        setUploadSuccessId(null)
    }

    // =========================================
    // REGISTRATION NUMBER CHANGE
    // =========================================

    const handleRegNoChange = (item, value) => {
        updateRowForm(item, {
            msmeRegNo: value.toUpperCase(),
            validationError: '',
            uploadMessage: ''
        })
    }

    // =========================================
    // FILE VALIDATION
    // =========================================

    const handleFileChange = (item, file) => {
        if (!file) {
            updateRowForm(item, {
                file: null,
                validationError: '',
                uploadMessage: ''
            })
            return
        }

        const extension = file.name
            .split('.')
            .pop()
            .toLowerCase()

        if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
            updateRowForm(item, {
                file: null,
                validationError:
                    `Invalid file type. Allowed formats: ${ALLOWED_FILE_EXTENSIONS.join(', ')}.`,
                uploadMessage: ''
            })
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            updateRowForm(item, {
                file: null,
                validationError: 'Maximum upload size allowed is 3 MB.',
                uploadMessage: ''
            })
            return
        }

        updateRowForm(item, {
            file,
            validationError: '',
            uploadMessage: ''
        })
    }

    // =========================================
    // UPLOAD
    // =========================================

    const handleUpload = async (item) => {
        const id = String(getValue(item, 'Id', 'id'))
        const form = getRowForm(item)

        setError('')
        setMessage('')
        updateRowForm(item, {
            validationError: '',
            uploadMessage: ''
        })

        if (!form.msmeRegNo.trim()) {
            updateRowForm(item, {
                validationError:
                    'Please enter the MSME Registration Number.'
            })
            return
        }

        const registrationNumber = form.msmeRegNo.trim()

        if (!/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(registrationNumber)) {
            updateRowForm(item, {
                validationError:
                    'Invalid UDYAM number format. Format should be: UDYAM-XX-YY-XXXXXXX'
            })
            return
        }

        if (!form.file) {
            updateRowForm(item, {
                validationError: 'Please upload the MSME document.'
            })
            return
        }

        if (!userId) {
            updateRowForm(item, {
                validationError:
                    'Unable to identify the logged-in user. Please log in again.'
            })
            return
        }

        try {
            setUploadingId(id)

            const response = await uploadVendorMsme({
                refId: Number(getValue(item, 'Id', 'id')),
                msmeRegNo: registrationNumber,
                userId,
                uploadId: getValue(item, 'UploadId', 'uploadId'),
                file: form.file
            })

            const successMessage =
                response.Message ||
                response.message ||
                'Uploaded Successfully.'

            updateRowForm(item, {
                uploadMessage: successMessage,
                validationError: '',
                file: null
            })

            setUploadSuccessId(id)

            // Update the row with the returned UploadId, so subsequent
            // uploads reuse the existing document identifier.
            setResults((previous) =>
                previous.map((row) => {
                    const rowId = String(getValue(row, 'Id', 'id'))

                    return rowId === id
                        ? {
                            ...row,
                            UploadId:
                                response.UploadId ||
                                response.uploadId ||
                                getValue(row, 'UploadId', 'uploadId')
                        }
                        : row
                })
            )
        } catch (err) {
            console.error('MSME upload error:', err)

            updateRowForm(item, {
                validationError:
                    err.message || 'Unable to upload MSME document.'
            })
        } finally {
            setUploadingId(null)
        }
    }

    // =========================================
    // UI
    // =========================================

    return (
        <DashboardLayout title="Upload MSME Doc">
            <div className="msme-page">

                {/* PAGE HEADING */}
                

                {/* SEARCH FORM */}
                <div className="msme-card">
                    <div className="msme-section-heading">
                        Search Vendor
                    </div>

                    <div className="msme-search-form">
                        <div className="msme-field">
                            <label htmlFor="msmeRefNo">
                                Ref No <span className="msme-required">*</span>
                            </label>

                            <input
                                id="msmeRefNo"
                                type="text"
                                inputMode="numeric"
                                value={refNo}
                                maxLength={18}
                                placeholder="Enter Ref No"
                                onChange={(event) => {
                                    const value = event.target.value

                                    if (/^\d*$/.test(value)) {
                                        setRefNo(value)
                                        setError('')
                                        setMessage('')
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        handleSearch()
                                    }
                                }}
                            />
                        </div>

                        <div className="msme-search-buttons">
                            <button
                                type="button"
                                className="msme-button msme-button-primary"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>

                            <button
                                type="button"
                                className="msme-button msme-button-secondary"
                                onClick={handleClear}
                                disabled={loading}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="msme-alert msme-alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div
                            className={`msme-alert ${
                                results.length > 0
                                    ? 'msme-alert-success'
                                    : 'msme-alert-info'
                            }`}
                            role="status"
                        >
                            {message}
                        </div>
                    )}
                </div>

                {/* SEARCH RESULTS */}
                {showResults && (
                    <div className="msme-card msme-results-card">
                        <div className="msme-section-heading">
                            Vendor Details
                            {results.length > 0 && (
                                <span className="msme-record-count">
                                    {results.length}{' '}
                                    {results.length === 1 ? 'record' : 'records'}
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <div className="msme-loading">
                                <span className="msme-spinner"></span>
                                <span>Searching vendor details...</span>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="msme-table-wrapper">
                                <table className="msme-table">
                                    <thead>
                                        <tr>
                                            <th>Ref No</th>
                                            <th>Vendor Code</th>
                                            <th>Name</th>
                                            <th>Address</th>
                                            <th>MSME Reg No.</th>
                                            <th>MSME Doc Upload</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {results.map((item, index) => {
                                            const id = String(
                                                getValue(item, 'Id', 'id')
                                            )
                                            const form = getRowForm(item)
                                            const isUploading = uploadingId === id

                                            return (
                                                <tr key={`${id}-${index}`}>
                                                    <td>{id}</td>

                                                    <td>
                                                        {getValue(
                                                            item,
                                                            'VendorCode',
                                                            'vendorCode',
                                                            'vendorcode'
                                                        )}
                                                    </td>

                                                    <td>
                                                        {getValue(
                                                            item,
                                                            'Name',
                                                            'name'
                                                        )}
                                                    </td>

                                                    <td className="msme-address">
                                                        {getValue(
                                                            item,
                                                            'Address',
                                                            'address'
                                                        )}
                                                    </td>

                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="msme-table-input"
                                                            value={form.msmeRegNo}
                                                            maxLength={20}
                                                            placeholder="UDYAM-XX-YY-XXXXXXX"
                                                            onChange={(event) =>
                                                                handleRegNoChange(
                                                                    item,
                                                                    event.target.value
                                                                )
                                                            }
                                                            disabled={isUploading}
                                                        />
                                                    </td>

                                                    <td>
                                                        <input
                                                            type="file"
                                                            className="msme-file-input"
                                                            accept={ALLOWED_FILE_EXTENSIONS
                                                                .map((ext) => `.${ext}`)
                                                                .join(',')}
                                                            onChange={(event) => {
                                                                handleFileChange(
                                                                    item,
                                                                    event.target.files?.[0] || null
                                                                )

                                                                // Allows selecting the same file again.
                                                                event.target.value = ''
                                                            }}
                                                            disabled={isUploading}
                                                        />

                                                        {form.file && (
                                                            <div className="msme-selected-file">
                                                                {form.file.name}
                                                            </div>
                                                        )}

                                                        <small className="msme-file-help">
                                                            Maximum 3 MB
                                                        </small>
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="msme-button msme-button-primary msme-upload-button"
                                                            onClick={() =>
                                                                handleUpload(item)
                                                            }
                                                            disabled={isUploading}
                                                        >
                                                            {isUploading
                                                                ? 'Uploading...'
                                                                : 'Upload'}
                                                        </button>

                                                        {form.validationError && (
                                                            <div
                                                                className="msme-row-error"
                                                                role="alert"
                                                            >
                                                                {form.validationError}
                                                            </div>
                                                        )}

                                                        {form.uploadMessage && (
                                                            <div
                                                                className="msme-row-success"
                                                                role="status"
                                                            >
                                                                {form.uploadMessage}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="msme-no-records">
                                NO RECORDS FOUND!!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default UploadMSMEDoc