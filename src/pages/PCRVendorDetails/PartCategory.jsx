import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Save, X, PlusSquare } from 'lucide-react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getPCRPartCategoryMasterList,
    savePCRPartCategoryMaster
} from '../../api/pcrApi'

import './PartCategory.css'

const PAGE_SIZE = 10

const INITIAL_FORM = {
    partCode: '',
    partCategory: '',
    subCategory: ''
}

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

function getField(row, ...keys) {
    for (const key of keys) {
        if (row?.[key] !== undefined && row?.[key] !== null) {
            return row[key]
        }
    }

    return ''
}

function PartCategory({ onBack }) {
    const userId = getSessionValue('userId', 'UserID')

    const [searchText, setSearchText] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')

    const [records, setRecords] = useState([])
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

    useEffect(() => {
    if (!message || messageType !== 'success') return

    const timeoutId = setTimeout(() => {
        setMessage('')
        setMessageType('')
    }, 2000)

    return () => clearTimeout(timeoutId)
}, [message, messageType])
    

    // =========================================
    // LOAD MASTER RECORDS
    // =========================================
    const loadRecords = useCallback(async (search = '', options = {}) => {
    const { suppressError = false } = options

    setLoading(true)

    try {
        const response = await getPCRPartCategoryMasterList(search)

        setRecords(getArray(response))
        setCurrentPage(1)
    } catch (error) {
        console.error('Error loading PCR Part Category Master:', error)
        setRecords([])

        if (!suppressError) {
            showMessage(
                error?.message ||
                    'Unable to load records. Please try again.',
                'error'
            )
        }
    } finally {
        setLoading(false)
    }
    }, [showMessage])

    useEffect(() => {
        loadRecords('')
    }, [loadRecords])

    // =========================================
    // RECORD FIELD HELPERS
    // =========================================
    function getRecordId(record) {
        return getField(record, 'Id', 'ID', 'id')
    }

    function getPartCode(record) {
        return getField(record, 'PartCode', 'partCode', 'partcode')
    }

    function getPartCategory(record) {
        return getField(
            record,
            'PartCategory',
            'partCategory',
            'partcategory'
        )
    }

    function getSubCategory(record) {
        return getField(
            record,
            'SubCategory',
            'subCategory',
            'subcatgory'
        )
    }

    function getSerialNumber(record, index) {
        const slno = getField(record, 'Slno', 'slno', 'SLNO')

        return slno !== '' && slno !== null
            ? slno
            : (currentPage - 1) * PAGE_SIZE + index + 1
    }

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

        resetForm()
        await loadRecords(search)
    }

    async function handleResetSearch() {
        setSearchText('')
        setAppliedSearch('')
        setMessage('')
        setMessageType('')

        resetForm()
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
    // Clear any previous message immediately
    setMessage('')
    setMessageType('')

    const id = getRecordId(record)

    if (id === '' || id === null || id === undefined) {
        console.error('Part Category record ID is missing:', record)
        showMessage('Record ID was not found.', 'error')
        return
    }

    setEditingId(id)

    setForm({
        partCode: String(getPartCode(record) ?? ''),
        partCategory: String(getPartCategory(record) ?? ''),
        subCategory: String(getSubCategory(record) ?? '')
    })

    setFieldErrors({})
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

        if (!form.partCategory.trim()) {
            errors.partCategory =
                editingId !== null
                    ? 'Part category is required!!'
                    : 'Part Category is required!!'
        }

        if (!form.subCategory.trim()) {
            errors.subCategory = 'Sub Category is required!!'
        }

        if (form.partCode.trim().length > 32) {
            errors.partCode = 'Part Code cannot exceed 32 characters.'
        }

        if (form.partCategory.trim().length > 64) {
            errors.partCategory =
                'Part Category cannot exceed 64 characters.'
        }

        if (form.subCategory.trim().length > 10) {
            errors.subCategory =
                'Sub Category cannot exceed 10 characters.'
        }

        setFieldErrors(errors)

        return Object.keys(errors).length === 0
    }

    // =========================================
    // SAVE / UPDATE
    // =========================================
    async function handleSave(event) {
    event.preventDefault()

    setMessage('')
    setMessageType('')

    if (!validateForm()) return

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
        const action = editingId !== null ? 2 : 1

        const payload = {
            Id: Number(editingId) || 0,
            PartCode: form.partCode.trim(),
            PartCategory: form.partCategory.trim(),
            SubCategory: form.subCategory.trim()
        }

        const response = await savePCRPartCategoryMaster(
            payload,
            action,
            loggedInUserId
        )

        console.log('Save API response:', response)

        const isSuccess =
            response?.IsSuccess ??
            response?.isSuccess ??
            response?.Success ??
            response?.success

        const responseMessage =
            response?.Message ??
            response?.message ??
            ''
console.log('Success flag:', isSuccess)
console.log('Response message:', responseMessage)
        const messageText = String(responseMessage).trim().toUpperCase()

const hasSuccessMessage =
    messageText.includes('RECORD ADDED SUCCESSFULLY') ||
    messageText.includes('RECORD UPDATED SUCCESSFULLY')

const succeeded =
    isSuccess === true ||
    isSuccess === 'true' ||
    isSuccess === 1 ||
    isSuccess === '1' ||
    hasSuccessMessage

if (!succeeded) {
    throw new Error(
        responseMessage || 'Unable to save the record.'
    )
}

showMessage(
    responseMessage ||
        (action === 2
            ? 'RECORD UPDATED SUCCESSFULLY!!'
            : 'RECORD ADDED SUCCESSFULLY!!'),
    'success'
)

resetForm()

await loadRecords(appliedSearch, { suppressError: true })
        // Show success only after the API confirms success
        showMessage(
            responseMessage ||
                (action === 2
                    ? 'RECORD UPDATED SUCCESSFULLY!!'
                    : 'RECORD ADDED SUCCESSFULLY!!'),
            'success'
        )

        resetForm()

        // Refresh once without overwriting the success message
        await loadRecords(appliedSearch, { suppressError: true })
    } catch (error) {
        console.error('Error saving PCR Part Category:', error)

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
    // RENDER FORM INPUT
    // =========================================
    function renderInput(name, placeholder, maxLength, label) {
        return (
            <>
                <input
                    type="text"
                    name={name}
                    className="pcr-category-grid-input"
                    value={form[name]}
                    onChange={handleFieldChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    aria-label={label}
                    disabled={saving}
                />

                {fieldErrors[name] && (
                    <span className="pcr-category-field-error">
                        {fieldErrors[name]}
                    </span>
                )}
            </>
        )
    }

    // =========================================
    // ADD NEW ROW
    // =========================================
    function renderFormRow() {
        return (
            <tr className="pcr-category-footer-row">
                <td></td>

                <td>
                    {renderInput(
                        'partCode',
                        'Enter part code',
                        32,
                        'Part Code'
                    )}
                </td>

                <td>
                    {renderInput(
                        'partCategory',
                        'Enter part category',
                        64,
                        'Part Category'
                    )}
                </td>

                <td>
                    {renderInput(
                        'subCategory',
                        'Enter sub category',
                        10,
                        'Sub Category'
                    )}
                </td>

                <td className="pcr-category-actions-cell">
                    <button
                        type="submit"
                        className="pcr-category-icon-button pcr-category-add-button"
                        title="Add New"
                        aria-label="Add new category"
                        disabled={saving}
                    >
                        <PlusSquare size={19} />
                    </button>
                </td>
            </tr>
        )
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

        return records.slice(startIndex, startIndex + PAGE_SIZE)
    }, [records, currentPage])

    function changePage(page) {
        if (page < 1 || page > totalPages) return

        resetForm()
        setCurrentPage(page)
    }

    // =========================================
    // UI
    // =========================================
    return (
        <DashboardLayout title="PCR Part Category">
            <div className="pcr-category-page">
                <div className="pcr-category-page-header">
                    <button
                        type="button"
                        className="technician-edit-back-btn"
                        onClick={onBack}
                        disabled={saving}
                    >
                        Back
                    </button>
                </div>

                {message && (
                    <div
                        className={`pcr-category-message ${
                            messageType === 'success'
                                ? 'success'
                                : 'error'
                        }`}
                        role="status"
                    >
                        {message}
                    </div>
                )}

                <section className="pcr-category-panel">
                    <form
                        className="pcr-category-search-form"
                        onSubmit={handleSearch}
                    >
                        <div className="pcr-category-search-field">
                            <input
                                type="text"
                                placeholder="Enter part code.."
                                value={searchText}
                                onChange={event =>
                                    setSearchText(event.target.value)
                                }
                                maxLength={20}
                                aria-label="Search by Part Code"
                            />
                        </div>

                        <div className="pcr-category-search-actions">
                            <button
                                type="submit"
                                className="pcr-category-primary-button"
                                disabled={loading || saving}
                            >
                                SEARCH
                            </button>

                            <button
                                type="button"
                                className="pcr-category-secondary-button"
                                onClick={handleResetSearch}
                                disabled={loading || saving}
                            >
                                RESET
                            </button>
                        </div>
                    </form>
                </section>

                <section className="pcr-category-panel">
                    <form onSubmit={handleSave}>
                        <div className="pcr-category-table-container">
                            <table className="pcr-category-table">
                                <thead>
                                    <tr>
                                        <th>SL.NO</th>
                                        <th>Part Code</th>
                                        <th>Part Category</th>
                                        <th>Sub Category</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="pcr-category-empty">
                                                Loading records...
                                            </td>
                                        </tr>
                                    ) : paginatedRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="pcr-category-empty">
                                                No records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRecords.map((record, index) => {
                                            const recordId = getRecordId(record)

                                            const isEditing =
                                                editingId !== null &&
                                                String(editingId) === String(recordId)

                                            return (
                                                <tr
                                                    key={recordId ?? `${getPartCode(record)}-${index}`}
                                                    className={
                                                        isEditing
                                                            ? 'pcr-category-editing-row'
                                                            : ''
                                                    }
                                                >
                                                    <td>
                                                        {getSerialNumber(record, index)}
                                                    </td>

                                                    <td>
                                                        {isEditing
                                                            ? renderInput(
                                                                'partCode',
                                                                'Enter part code',
                                                                32,
                                                                'Edit Part Code'
                                                            )
                                                            : getPartCode(record)}
                                                    </td>

                                                    <td>
                                                        {isEditing
                                                            ? renderInput(
                                                                'partCategory',
                                                                'Enter part category',
                                                                64,
                                                                'Edit Part Category'
                                                            )
                                                            : getPartCategory(record)}
                                                    </td>

                                                    <td>
                                                        {isEditing
                                                            ? renderInput(
                                                                'subCategory',
                                                                'Enter sub category',
                                                                10,
                                                                'Edit Sub Category'
                                                            )
                                                            : getSubCategory(record)}
                                                    </td>

                                                    <td className="pcr-category-actions-cell">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    type="submit"
                                                                    className="pcr-category-icon-button pcr-category-save-button"
                                                                    title="Save"
                                                                    aria-label="Save changes"
                                                                    disabled={saving}
                                                                >
                                                                    <Save size={17} />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="pcr-category-icon-button pcr-category-cancel-button"
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
                                                                    className="pcr-category-icon-button pcr-category-edit-button"
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
                                        })
                                    )}

                                    {editingId === null && renderFormRow()}
                                </tbody>
                            </table>
                        </div>
                    </form>

                    <div className="pcr-category-pagination">
                        <button
                            type="button"
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1 || loading || saving}
                        >
                            Previous
                        </button>

                        <span className="pcr-category-page-info">
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

export default PartCategory