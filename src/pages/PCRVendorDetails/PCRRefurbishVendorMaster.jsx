import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Save, X, PlusSquare } from 'lucide-react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getPCRRefurbishVendorMasterList,
    getPCRConfigVendors,
    savePCRRefurbishVendorMaster
} from '../../api/pcrApi'

import './PCRRefurbishVendorMaster.css'

const PAGE_SIZE = 10

const INITIAL_FORM = {
    partCode: '',
    vendorCode: ''
}

// Handles API responses containing Data/data or direct arrays.
function getArray(response) {
    if (Array.isArray(response)) return response

    const candidates = [
        response?.Data,
        response?.data,
        response?.Items,
        response?.items,
        response?.Results,
        response?.results,
        response?.$values,
        response?.Data?.$values,
        response?.data?.$values
    ]

    return candidates.find(Array.isArray) || []
}

function getSessionValue(...keys) {
    for (const key of keys) {
        const value = sessionStorage.getItem(key)

        if (value !== null && value !== '') {
            return value
        }
    }

    return ''
}

// Reads API properties while supporting different JSON casing.
function getField(row, ...keys) {
    for (const key of keys) {
        if (row?.[key] !== undefined && row?.[key] !== null) {
            return row[key]
        }
    }

    return ''
}

function PCRRefurbishVendorMaster({ onBack }) {
    const userId = getSessionValue('userId', 'UserID')

    const [searchText, setSearchText] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')

    const [records, setRecords] = useState([])
    const [vendors, setVendors] = useState([])

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [editingId, setEditingId] = useState(null)

    const [form, setForm] = useState({ ...INITIAL_FORM })
    const [fieldErrors, setFieldErrors] = useState({})

    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')

    const showMessage = useCallback((text, type = 'error') => {
        setMessage(text)
        setMessageType(type)
    }, [])

    // =========================================
    // LOAD VENDORS
    // API returns PcrLookupDto: Value, Text
    // =========================================
    const loadVendors = useCallback(async () => {
        try {
            const response = await getPCRConfigVendors()
            setVendors(getArray(response))
        } catch (error) {
            console.error('Error loading PCR vendors:', error)
            setVendors([])

            showMessage(
                error?.message ||
                    'Unable to load vendors. Please try again.',
                'error'
            )
        }
    }, [showMessage])

    // =========================================
    // LOAD MASTER RECORDS
    // =========================================
    const loadRecords = useCallback(async (search = '') => {
        setLoading(true)

        try {
            const response =
                await getPCRRefurbishVendorMasterList(search)

            setRecords(getArray(response))
            setCurrentPage(1)
        } catch (error) {
            console.error(
                'Error loading PCR Refurbish Vendor Master:',
                error
            )

            setRecords([])

            showMessage(
                error?.message ||
                    'Unable to load records. Please try again.',
                'error'
            )
        } finally {
            setLoading(false)
        }
    }, [showMessage])

    useEffect(() => {
        loadVendors()
        loadRecords('')
    }, [loadVendors, loadRecords])

    // =========================================
    // RESET FORM
    // =========================================
    function resetForm() {
        setEditingId(null)
        setForm({ ...INITIAL_FORM })
        setFieldErrors({})
    }

    // =========================================
    // SEARCH
    // =========================================
    async function handleSearch(event) {
        event.preventDefault()

        const search = searchText.trim()

        setAppliedSearch(search)
        setMessage('')
        setMessageType('')

        await loadRecords(search)
    }

    async function handleResetSearch() {
        setSearchText('')
        setAppliedSearch('')
        setMessage('')
        setMessageType('')

        await loadRecords('')
    }

    // =========================================
    // ADD NEW
    // =========================================
    function handleAddNew() {
        resetForm()
        setMessage('')
        setMessageType('')
    }

    // =========================================
    // EDIT RECORD
    // =========================================
    function handleEdit(record) {
    const id = getRecordId(record)

    if (id === '' || id === null || id === undefined) {
        console.error('Record ID is missing:', record)
        return
    }

    setEditingId(id)

    setForm({
        partCode: String(getPartCode(record) ?? ''),
        vendorCode: String(getVendorCode(record) ?? '')
    })

    setFieldErrors({})
    setMessage('')
    setMessageType('')
    }

    // =========================================
    // FIELD CHANGE
    // =========================================
    function handleFieldChange(event) {
        const { name, value } = event.target

        setForm(previous => ({
            ...previous,
            [name]: value
        }))

        setFieldErrors(previous => ({
            ...previous,
            [name]: ''
        }))

        setMessage('')
        setMessageType('')
    }

    // =========================================
    // VALIDATION
    // =========================================
    function validateForm() {
        const errors = {}

        if (!form.partCode.trim()) {
            errors.partCode = 'Part Code is required!!'
        }

        if (
            !form.vendorCode ||
            String(form.vendorCode) === '0'
        ) {
            errors.vendorCode = 'Vendor is required!!'
        }

        setFieldErrors(errors)

        return Object.keys(errors).length === 0
    }

    // =========================================
    // SAVE / UPDATE
    // =========================================
    async function handleSave(event) {
        console.log('SAVE HANDLER TRIGGERED')
        event.preventDefault()

        setMessage('')
        setMessageType('')

        if (!validateForm()) {
            return
        }

        const loggedInUserId = Number(userId)

        if (!Number.isInteger(loggedInUserId) || loggedInUserId <= 0) {
            showMessage(
                'Valid logged-in User ID was not found. Please log in again.',
                'error'
            )
            return
        }

        setSaving(true)

        try {
            // PcrLookupDto properties are Value and Text.
            const selectedVendor = vendors.find(vendor => {
                const id = getField(
                    vendor,
                    'Value',
                    'value'
                )

                return String(id) === String(form.vendorCode)
            })

            const vendorName = getField(
                selectedVendor,
                'Text',
                'text'
            )

            if (!vendorName) {
                throw new Error(
                    'Please select a valid vendor.'
                )
            }

            const action = editingId !== null ? 2 : 1

            // VendorCode must remain a string.
            // UserId and Action are added by the API helper.
            const payload = {
                Id: Number(editingId) || 0,
                PartCode: form.partCode.trim(),
                VendorCode: String(form.vendorCode),
                VendorName: String(vendorName)
            }

            const response = await savePCRRefurbishVendorMaster(
                payload,
                action,
                loggedInUserId
            )

            // API returns { IsSuccess, Status, Message }.
            const isSuccess =
                response?.IsSuccess ??
                response?.isSuccess ??
                response?.Success ??
                response?.success

            const responseMessage =
                response?.Message ??
                response?.message ??
                ''

            if (isSuccess !== true) {
                throw new Error(
                    responseMessage ||
                        'Unable to save the record.'
                )
            }

            showMessage(
                    responseMessage ||
                        (action === 2
                            ? 'RECORD UPDATED SUCCESSFULLY!!'
                            : 'RECORD ADDED SUCCESSFULLY!!'),
                    'success'
                )

                setTimeout(() => {
                    setMessage('')
                    setMessageType('')
                }, 2000)

            resetForm()

            // Refresh the currently applied search results.
            await loadRecords(appliedSearch)
        } catch (error) {
            console.error(
                'Error saving PCR vendor record:',
                error
            )

            showMessage(
                error?.message ||
                    'SOMETHING WENT WRONG, PLEASE CONTACT ADMIN!!',
                'error'
            )
        } finally {
            setSaving(false)
        }
    }

    // =========================================
    // CANCEL EDIT
    // =========================================
    function handleCancelEdit() {
        resetForm()
        setMessage('')
        setMessageType('')
    }

    // =========================================
    // PAGINATION
    // =========================================
    const totalPages = Math.max(
        1,
        Math.ceil(records.length / PAGE_SIZE)
    )

    const paginatedRecords = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE

        return records.slice(
            startIndex,
            startIndex + PAGE_SIZE
        )
    }, [records, currentPage])

    function changePage(page) {
        if (page < 1 || page > totalPages) {
            return
        }

        resetForm()
        setCurrentPage(page)
    }

    // =========================================
    // RECORD FIELD HELPERS
    // =========================================
    function getRecordId(record) {
        return getField(
            record,
            'Id',
            'ID',
            'id',
            'PCRRefurbishVendorMasterId'
        )
    }

    function getPartCode(record) {
        return getField(
            record,
            'PartCode',
            'partCode',
            'Partcode'
        )
    }

    function getVendorCode(record) {
        return getField(
            record,
            'VendorCode',
            'vendorCode',
            'config_id',
            'ConfigId',
            'VendorId',
            'vendorId'
        )
    }

    function getVendorName(record) {
        return getField(
            record,
            'VendorName',
            'vendorName',
            'Name',
            'name'
        )
    }

    // =========================================
    // VENDOR DROPDOWN OPTIONS
    // =========================================
    function renderVendorOptions() {
        return vendors.map((vendor, index) => {
            const vendorId = getField(
                vendor,
                'Value',
                'value'
            )

            const vendorName = getField(
                vendor,
                'Text',
                'text'
            )

            return (
                <option
                    key={vendorId || `vendor-${index}`}
                    value={vendorId}
                >
                    {vendorName}
                </option>
            )
        })
    }

    // =========================================
    // ADD NEW FORM ROW
    // =========================================
    function renderFormRow() {
        return (
            <tr className="pcr-refurbish-footer-row">
                <td></td>

                <td>
                    <input
                        type="text"
                        name="partCode"
                        className="pcr-refurbish-grid-input"
                        value={form.partCode}
                        onChange={handleFieldChange}
                        placeholder="Enter part code"
                        maxLength={20}
                        aria-label="Part Code"
                        disabled={saving}
                    />

                    {fieldErrors.partCode && (
                        <span className="pcr-refurbish-field-error">
                            {fieldErrors.partCode}
                        </span>
                    )}
                </td>

                <td>
                    <select
                        name="vendorCode"
                        className="pcr-refurbish-grid-select"
                        value={form.vendorCode || '0'}
                        onChange={handleFieldChange}
                        aria-label="Vendor"
                        disabled={saving}
                    >
                        <option value="0">--Select--</option>
                        {renderVendorOptions()}
                    </select>

                    {fieldErrors.vendorCode && (
                        <span className="pcr-refurbish-field-error">
                            {fieldErrors.vendorCode}
                        </span>
                    )}
                </td>

                <td className="pcr-refurbish-actions-cell">
                    <button
                        type="submit"
                        className="pcr-refurbish-icon-button pcr-refurbish-add-button"
                        title="Add New"
                        aria-label="Add New"
                        disabled={saving}
                    >
                        <PlusSquare size={19} />
                    </button>
                </td>
            </tr>
        )
    }

    // =========================================
    // UI
    // =========================================
    return (
        <DashboardLayout title="PCR Refurbish Vendor Master">
            <div className="pcr-refurbish-page">
                <div className="pcr-refurbish-page-header">
                    <button
                        type="button"
                        className="technician-edit-back-btn"
                        onClick={onBack}
                    >
                        Back
                    </button>
                </div>

                {message && (
                    <div
                        className={`pcr-refurbish-message ${
                            messageType === 'success'
                                ? 'success'
                                : 'error'
                        }`}
                        role="status"
                    >
                        {message}
                    </div>
                )}

                <section className="pcr-refurbish-panel">
                    <form
                        className="pcr-refurbish-search-form"
                        onSubmit={handleSearch}
                    >
                        <div className="pcr-refurbish-search-field">
                            <input
                                id="pcrPartCodeSearch"
                                type="text"
                                placeholder="Enter part code.."
                                value={searchText}
                                onChange={event =>
                                    setSearchText(event.target.value)
                                }
                                maxLength={20}
                            />
                        </div>

                        <div className="pcr-refurbish-search-actions">
                            <button
                                type="submit"
                                className="pcr-refurbish-primary-button"
                                disabled={loading || saving}
                            >
                                SEARCH
                            </button>

                            <button
                                type="button"
                                className="pcr-refurbish-secondary-button"
                                onClick={handleResetSearch}
                                disabled={loading || saving}
                            >
                                RESET
                            </button>
                        </div>
                    </form>
                </section>

                <section className="pcr-refurbish-panel">
                    <form onSubmit={handleSave}>
                        <div className="pcr-refurbish-table-container">
                            <table className="pcr-refurbish-table">
                                <thead>
                                    <tr>
                                        <th>SL.NO</th>
                                        <th>Part Code</th>
                                        <th>Vendor</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="pcr-refurbish-empty"
                                            >
                                                Loading records...
                                            </td>
                                        </tr>
                                    ) : paginatedRecords.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="pcr-refurbish-empty"
                                            >
                                                No records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRecords.map(
                                            (record, index) => {
                                                const recordId =
                                                    getRecordId(record)

                                                const isEditing =
                                                    editingId !== null &&
                                                    String(editingId) ===
                                                        String(recordId)

                                                return (
                                                    <tr
                                                        key={
                                                            recordId ??
                                                            `${getPartCode(record)}-${index}`
                                                        }
                                                        className={
                                                            isEditing
                                                                ? 'pcr-refurbish-editing-row'
                                                                : ''
                                                        }
                                                    >
                                                        <td>
                                                            {(currentPage - 1) *
                                                                PAGE_SIZE +
                                                                index +
                                                                1}
                                                        </td>

                                                        <td>
                                                            {isEditing ? (
                                                                <>
                                                                    <input
                                                                        type="text"
                                                                        name="partCode"
                                                                        className="pcr-refurbish-grid-input"
                                                                        value={form.partCode}
                                                                        onChange={handleFieldChange}
                                                                        maxLength={20}
                                                                        aria-label="Edit Part Code"
                                                                        disabled={saving}
                                                                    />

                                                                    {fieldErrors.partCode && (
                                                                        <span className="pcr-refurbish-field-error">
                                                                            {fieldErrors.partCode}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                getPartCode(record)
                                                            )}
                                                        </td>

                                                        <td>
                                                            {isEditing ? (
                                                                <>
                                                                    <select
                                                                        name="vendorCode"
                                                                        className="pcr-refurbish-grid-select"
                                                                        value={form.vendorCode || '0'}
                                                                        onChange={handleFieldChange}
                                                                        aria-label="Edit Vendor"
                                                                        disabled={saving}
                                                                    >
                                                                        <option value="0">
                                                                            --Select--
                                                                        </option>
                                                                        {renderVendorOptions()}
                                                                    </select>

                                                                    {fieldErrors.vendorCode && (
                                                                        <span className="pcr-refurbish-field-error">
                                                                            {fieldErrors.vendorCode}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                getVendorName(record)
                                                            )}
                                                        </td>

                                                        <td className="pcr-refurbish-actions-cell">
                                                            {isEditing ? (
                                                                <>
                                                                    <button
                                                                        type="submit"
                                                                        className="pcr-refurbish-icon-button pcr-refurbish-save-button"
                                                                        title="Save"
                                                                        aria-label="Save changes"
                                                                        disabled={saving}
                                                                    >
                                                                        <Save size={17} />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="pcr-refurbish-icon-button pcr-refurbish-cancel-button"
                                                                        title="Cancel"
                                                                        aria-label="Cancel editing"
                                                                        onClick={handleCancelEdit}
                                                                        disabled={saving}
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    className="pcr-refurbish-icon-button pcr-refurbish-edit-button"
                                                                    title="Edit"
                                                                    aria-label="Edit record"
                                                                    onClick={(event) => {
                                                                        event.preventDefault()
                                                                        event.stopPropagation()
                                                                        handleEdit(record)
                                                                    }}
                                                                    disabled={saving || editingId !== null}
                                                                >
                                                                    <Pencil size={17} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        )
                                    )}

                                    {editingId === null && renderFormRow()}
                                </tbody>
                            </table>
                        </div>
                    </form>

                    <div className="pcr-refurbish-pagination">
                        <button
                            type="button"
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1 || loading || saving}
                        >
                            Previous
                        </button>

                        <span className="pcr-refurbish-page-info">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() => changePage(currentPage + 1)}
                            disabled={
                                currentPage === totalPages ||
                                loading ||
                                saving
                            }
                        >
                            Next
                        </button>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    )
}

export default PCRRefurbishVendorMaster