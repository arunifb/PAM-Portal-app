import { useMemo, useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import {
    getPCRDetail,
    savePCREdit,
    markPCRUncreditable
} from '../../api/pcrApi'
import './PCREdit.css'

// =========================================
// HELPER: GET MACHINE MANUFACTURING DATE
// =========================================

function getMachineMfgDate(serialNo = '') {
    const serial = String(serialNo ?? '')

    if (serial.length !== 18) return ''

    const datePart = serial.substring(
        serial.length - 12,
        serial.length - 6
    )

    if (!/^\d{6}$/.test(datePart)) return ''

    const yearPart = Number(datePart.substring(0, 2))
    const year = yearPart >= 50 ? 1900 + yearPart : 2000 + yearPart
    const month = Number(datePart.substring(2, 4))
    const day = Number(datePart.substring(4, 6))

    const date = new Date(year, month - 1, day)

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return ''
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// =========================================
// HELPER: CALCULATE DAYS DIFFERENCE
// =========================================

function calculateDaysDiffer(machineDate, spareDate) {
    if (!machineDate || !spareDate) return ''

    const machine = new Date(`${machineDate}T00:00:00`)
    const spare = new Date(`${spareDate}T00:00:00`)

    if (
        Number.isNaN(machine.getTime()) ||
        Number.isNaN(spare.getTime())
    ) {
        return ''
    }

    return Math.ceil(
        (machine.getTime() - spare.getTime()) / 86400000
    )
}

// =========================================
// HELPER: FORMAT DATE
// =========================================

function formatDate(value) {
    if (!value) return ''

    const text = String(value)

    // Avoid timezone shifts for ISO date-only values.
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        const [year, month, day] = text.split('-')
        return `${day}/${month}/${year}`
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return text

    return date.toLocaleDateString('en-GB')
}

// =========================================
// HELPER: NORMALIZE DATE FOR INPUT TYPE DATE
// =========================================

function toDateInputValue(value) {
    if (!value) return ''

    const text = String(value)

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return text
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
        return text.substring(0, 10)
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

// =========================================
// HELPER: GET FIRST AVAILABLE API FIELD
// =========================================

function getValue(source, keys, fallback = '') {
    for (const key of keys) {
        const value = source?.[key]

        if (value !== undefined && value !== null) {
            return value
        }
    }

    return fallback
}

// =========================================
// MAP API RESPONSE TO FORM FIELDS
// =========================================

function mapPCRRecord(detail, previous = {}) {
    return {
        ...previous,
        ...detail,

        refId: getValue(
            detail,
            ['RefId', 'refId'],
            previous.refId ?? previous.RefId ?? ''
        ),

        spuNo: getValue(
            detail,
            ['SpuNo', 'SPUNo', 'SPUNumber', 'SpuNumber', 'spuNo'],
            previous.spuNo
        ),

        branchName: getValue(
            detail,
            ['BranchName', 'Branch', 'branchName'],
            previous.branchName
        ),

        franchise: getValue(
            detail,
            ['Franchise', 'FranchiseName', 'franchise'],
            previous.franchise
        ),

        vendor: getValue(
            detail,
            ['Vendor', 'VendorName', 'vendor'],
            previous.vendor
        ),

        product: getValue(
            detail,
            ['Product', 'ProductName', 'product'],
            previous.product
        ),

        serviceFinding: getValue(
            detail,
            ['ServiceFinding', 'ServiceFindingName', 'serviceFinding'],
            previous.serviceFinding
        ),

        machineStatus: getValue(
            detail,
            ['MachineStatus', 'MachineStatusName', 'machineStatus'],
            previous.machineStatus
        ),

        model: getValue(
            detail,
            ['Model', 'ModelName', 'model'],
            previous.model
        ),

        serialNo: getValue(
            detail,
            ['SerialNo', 'SerialNumber', 'SerialNo1', 'serialNo'],
            previous.serialNo
        ),

        ticketNo: getValue(
            detail,
            ['TicketNo', 'TicketNumber', 'CallNo', 'ticketNo'],
            previous.ticketNo
        ),

        spare: getValue(
            detail,
            ['Spare', 'SpareName', 'spare'],
            previous.spare
        ),

        spareDescription: getValue(
            detail,
            ['SpareDescription', 'SpareDesc', 'spareDescription'],
            previous.spareDescription
        ),

        quantity: getValue(
            detail,
            ['Quantity', 'Qty', 'quantity'],
            previous.quantity
        ),

        price: getValue(
            detail,
            ['Price', 'TRFPrice', 'TRF_PRICE', 'price'],
            previous.price
        ),

        cbd: getValue(
            detail,
            ['CBD', 'Cbd', 'cbd'],
            previous.cbd
        ),

        doi: getValue(
            detail,
            ['DOI', 'Doi', 'doi'],
            previous.doi
        ),

        callClosedDate: getValue(
            detail,
            ['CallClosedDate', 'CallCloseDate', 'callClosedDate'],
            previous.callClosedDate
        ),

        franchiseRemark: getValue(
            detail,
            ['FranchiseRemark', 'franchiseRemark'],
            previous.franchiseRemark
        ),

        marking: getValue(
            detail,
            ['Marking', 'marking'],
            previous.marking
        ),

        status: getValue(
            detail,
            ['Status', 'StatusName', 'status'],
            previous.status
        ),

        totalValue: getValue(
            detail,
            ['TotalValue', 'TotalAmount', 'totalValue'],
            previous.totalValue
        ),

        branchRemark: getValue(
            detail,
            ['BranchRemark', 'branchRemark'],
            previous.branchRemark
        ),

        spareMfgDate: toDateInputValue(
            getValue(
                detail,
                ['SpareMfgDate', 'SpareManufacturingDate', 'spareMfgDate'],
                previous.spareMfgDate
            )
        )
    }
}

// =========================================
// READ-ONLY FIELD
// =========================================

function ReadOnlyField({ label, value }) {
    return (
        <label className="pcr-edit-field">
            <span>{label}</span>
            <input
                type="text"
                value={value ?? ''}
                readOnly
            />
        </label>
    )
}

// =========================================
// PCR EDIT COMPONENT
// =========================================

function PCREdit({ record, onBack }) {
    const initialRecord = useMemo(() => ({
        spuNo: '',
        branchName: '',
        franchise: '',
        vendor: '',
        product: '',
        serviceFinding: '',
        machineStatus: '',
        model: '',
        serialNo: '',
        ticketNo: '',
        spare: '',
        spareDescription: '',
        quantity: '',
        price: '',
        cbd: '',
        doi: '',
        callClosedDate: '',
        franchiseRemark: '',
        marking: '',
        totalValue: '',
        status: '',
        branchRemark: '',
        spareMfgDate: '',
        ...(record ?? {})
    }), [record])

    const [form, setForm] = useState(() => ({ ...initialRecord }))
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showUncreditableModal, setShowUncreditableModal] = useState(false)
    const [uncreditableProcessing, setUncreditableProcessing] = useState(false)

    useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
        setMessage('')
    }, 2000)

    return () => clearTimeout(timer)
    }, [message])

    // =========================================
    // FETCH PCR DETAIL FROM API
    // =========================================

    useEffect(() => {
        const refId =
            record?.refId ??
            record?.RefId ??
            record?.refID ??
            record?.REFID

        setForm({ ...initialRecord })
        setErrors({})
        setMessage('')

        if (
            refId === undefined ||
            refId === null ||
            String(refId).trim() === ''
        ) {
            setMessage('PCR record ID is missing.')
            return
        }

        let cancelled = false

        const fetchPCRDetail = async () => {
            setLoading(true)

            try {
                const result = await getPCRDetail(refId)

                if (cancelled) return

                const success =
                    result?.isSuccess ??
                    result?.IsSuccess

                if (success === false) {
                    setMessage(
                        result?.message ||
                        result?.Message ||
                        'Unable to load PCR details.'
                    )
                    return
                }

                const responseData =
                    result?.data ??
                    result?.Data

                const detail = Array.isArray(responseData)
                    ? responseData[0]
                    : responseData

                if (!detail) {
                    setMessage('No PCR details found.')
                    return
                }

                setForm(previous =>
                    mapPCRRecord(detail, previous)
                )
            } catch (error) {
                if (!cancelled) {
                    setMessage(
                        error?.message ||
                        'Unable to load PCR details.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchPCRDetail()

        return () => {
            cancelled = true
        }
    }, [record, initialRecord])
    

    // =========================================
    // DERIVED VALUES
    // =========================================

    const machineMfgDate = useMemo(
        () => getMachineMfgDate(form.serialNo),
        [form.serialNo]
    )

    const daysDiffer = useMemo(
        () => calculateDaysDiffer(
            machineMfgDate,
            form.spareMfgDate
        ),
        [machineMfgDate, form.spareMfgDate]
    )

    // =========================================
    // UPDATE FORM FIELD
    // =========================================

    const updateField = (name, value) => {
        setForm(previous => ({
            ...previous,
            [name]: value
        }))

        setErrors(previous => ({
            ...previous,
            [name]: ''
        }))

        setMessage('')
    }

    // =========================================
    // SAVE PCR EDIT
    // =========================================

    const handleSave = async event => {
        event.preventDefault()

        const nextErrors = {}

        if (!String(form.branchRemark ?? '').trim()) {
            nextErrors.branchRemark = 'Please fill this'
        }

        setErrors(nextErrors)
        setMessage('')

        if (Object.keys(nextErrors).length > 0) return

        const refId = Number(
            form.refId ??
            form.RefId ??
            record?.refId ??
            record?.RefId
        )

        const updatedBy = Number(
            sessionStorage.getItem('userId') ||
            sessionStorage.getItem('UserID')
        )

        const marking = String(
            form.marking ??
            form.Marking ??
            ''
        ).trim()

        if (!Number.isInteger(refId) || refId <= 0) {
            setMessage('Valid PCR record ID is missing.')
            return
        }

        if (!Number.isInteger(updatedBy) || updatedBy <= 0) {
            setMessage('Logged-in user ID is missing.')
            return
        }

        if (!marking) {
            setMessage('Marking is missing for this record.')
            return
        }

        setSaving(true)

        try {
            const result = await savePCREdit({
                RefId: refId,
                Marking: marking,
                BranchRemark: form.branchRemark.trim(),
                UpdatedBy: updatedBy,
                SpareMfgDate: form.spareMfgDate || null
            })

            const success =
                result?.isSuccess ??
                result?.IsSuccess

            if (success === false) {
                throw new Error(
                    result?.message ||
                    result?.Message ||
                    'Unable to save PCR details.'
                )
            }

            setMessage(
                result?.message ||
                result?.Message ||
                'PCR details updated successfully.'
            )
        } catch (error) {
            setMessage(
                error?.message ||
                'Unable to save PCR details.'
            )
        } finally {
            setSaving(false)
        }
    }

    // =========================================
    // MARK AS UNCREDITABLE
    // =========================================

    // =========================================
// MARK AS UNCREDITABLE
// =========================================

const handleUncreditable = () => {
    setMessage('')
    setShowUncreditableModal(true)
}

const closeUncreditableModal = () => {
    if (uncreditableProcessing) return
    setShowUncreditableModal(false)
}

const confirmUncreditable = async () => {
    const refId = Number(
        form.refId ??
        form.RefId ??
        record?.refId ??
        record?.RefId
    )

    const updatedBy = Number(
        sessionStorage.getItem('userId') ||
        sessionStorage.getItem('UserID')
    )

    if (!Number.isInteger(refId) || refId <= 0) {
        setMessage('Valid PCR record ID is missing.')
        setShowUncreditableModal(false)
        return
    }

    if (!Number.isInteger(updatedBy) || updatedBy <= 0) {
        setMessage('Logged-in user ID is missing.')
        setShowUncreditableModal(false)
        return
    }

    setUncreditableProcessing(true)
    setSaving(true)
    setMessage('')

    try {
        const result = await markPCRUncreditable({
            RefId: refId,
            UpdatedBy: updatedBy
        })

        const success = result?.isSuccess ?? result?.IsSuccess

        if (success === false) {
            throw new Error(
                result?.message ||
                result?.Message ||
                'Unable to mark PCR component as uncreditable.'
            )
        }

        setMessage(
            result?.message ||
            result?.Message ||
            'PCR component marked as uncreditable successfully.'
        )

        setShowUncreditableModal(false)
    } catch (error) {
        setMessage(
            error?.message ||
            'Unable to mark PCR component as uncreditable.'
        )
    } finally {
        setSaving(false)
        setUncreditableProcessing(false)
    }
}

    // =========================================
    // RESET FORM
    // =========================================

    const handleReset = () => {
        setForm({ ...initialRecord })
        setErrors({})
        setMessage('')
    }

    // =========================================
    // BACK
    // =========================================

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            window.history.back()
        }
    }

    // =========================================
    // UI
    // =========================================

    return (
        <DashboardLayout title="PCR Edit">
            <main className="pcr-edit-page">
                <div className="pcr-edit-heading">
                    <button
                        type="button"
                        className="pcr-edit-btn pcr-edit-btn-back"
                        onClick={handleBack}
                    >
                        Back
                    </button>
                </div>

                {loading && (
                    <div className="pcr-edit-message" role="status">
                        Loading PCR details...
                    </div>
                )}

                {message && (
                    <div className="pcr-edit-message" role="status">
                        {message}
                    </div>
                )}

                {/* UNCREDITABLE CONFIRMATION MODAL */}
                {showUncreditableModal && (
                    <div
                        className="pcr-modal-overlay"
                        onClick={closeUncreditableModal}
                    >
                        <div
                            className="pcr-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="pcr-modal-title"
                            onClick={event => event.stopPropagation()}
                        >
                            <div className="pcr-modal-header">
                                <div className="pcr-modal-icon">
                                    !
                                </div>

                                <div className="pcr-modal-title-section">
                                    <h2 id="pcr-modal-title">
                                        Mark as Uncreditable
                                    </h2>

                                    <p>Please confirm this action</p>
                                </div>

                                <button
                                    type="button"
                                    className="pcr-modal-close"
                                    onClick={closeUncreditableModal}
                                    disabled={uncreditableProcessing}
                                    aria-label="Close modal"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="pcr-modal-body">
                                <p>
                                    Are you sure you want to mark this PCR component
                                    as uncreditable?
                                </p>

                                <div className="pcr-modal-notice">
                                    <span className="pcr-modal-notice-icon">i</span>

                                    <span>
                                        Please verify the PCR record before confirming.
                                    </span>
                                </div>
                            </div>

                            <div className="pcr-modal-actions">
                                <button
                                    type="button"
                                    className="pcr-edit-btn pcr-edit-btn-secondary"
                                    onClick={closeUncreditableModal}
                                    disabled={uncreditableProcessing}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="pcr-edit-btn pcr-modal-confirm"
                                    onClick={confirmUncreditable}
                                    disabled={uncreditableProcessing}
                                >
                                    {uncreditableProcessing
                                        ? 'Processing...'
                                        : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSave}>
                    <section className="pcr-edit-panel">
                        <div className="pcr-edit-grid">
                            <ReadOnlyField label="SPU ID" value={form.spuNo} />
                            <ReadOnlyField label="Branch" value={form.branchName} />
                            <ReadOnlyField label="Franchise" value={form.franchise} />
                            <ReadOnlyField label="Vendor" value={form.vendor} />
                            <ReadOnlyField label="Product" value={form.product} />
                            <ReadOnlyField label="Service Finding" value={form.serviceFinding} />

                            <ReadOnlyField label="Machine Status" value={form.machineStatus} />
                            <ReadOnlyField label="Model" value={form.model} />
                            <ReadOnlyField label="Serial No." value={form.serialNo} />
                            <ReadOnlyField label="Ticket No." value={form.ticketNo} />
                            <ReadOnlyField label="Spare" value={form.spare} />
                            <ReadOnlyField label="Spare Description" value={form.spareDescription} />

                            <ReadOnlyField label="Quantity" value={form.quantity} />
                            <ReadOnlyField label="TRF.PRICE" value={form.price} />
                            <ReadOnlyField label="CBD" value={formatDate(form.cbd)} />
                            <ReadOnlyField label="DOI" value={formatDate(form.doi)} />
                            <ReadOnlyField label="Call Closed Date" value={formatDate(form.callClosedDate)} />
                            <ReadOnlyField label="Franchise Remark" value={form.franchiseRemark} />

                            <ReadOnlyField label="Marking" value={form.marking} />
                            <ReadOnlyField label="Status" value={form.status} />
                            <ReadOnlyField label="Machine MFG Date" value={formatDate(machineMfgDate)} />
                            <ReadOnlyField label="Total Value" value={form.totalValue} />
                            <ReadOnlyField label="Days Differ" value={daysDiffer} />

                            <label className="pcr-edit-field">
                                <span>Spare MFG Date</span>
                                <input
                                    type="date"
                                    value={form.spareMfgDate ?? ''}
                                    onChange={event =>
                                        updateField(
                                            'spareMfgDate',
                                            event.target.value
                                        )
                                    }
                                />
                            </label>

                            <label className="pcr-edit-field pcr-edit-branch-remark">
                                <span>Branch Remark <b>*</b></span>

                                <input
                                    type="text"
                                    value={form.branchRemark ?? ''}
                                    maxLength={500}
                                    onChange={event =>
                                        updateField(
                                            'branchRemark',
                                            event.target.value
                                        )
                                    }
                                />

                                {errors.branchRemark && (
                                    <small className="pcr-edit-error">
                                        {errors.branchRemark}
                                    </small>
                                )}
                            </label>

                            <div className="pcr-edit-inline-actions">
                                <button
                                    type="button"
                                    className="pcr-edit-btn pcr-edit-btn-danger"
                                    onClick={handleUncreditable}
                                    disabled={saving || loading}
                                >
                                    {saving
                                        ? 'Processing...'
                                        : 'Mark As Uncreditable'}
                                </button>

                                <button
                                    type="submit"
                                    className="pcr-edit-btn pcr-edit-btn-primary"
                                    disabled={saving || loading}
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>

                                <button
                                    type="button"
                                    className="pcr-edit-btn pcr-edit-btn-secondary"
                                    onClick={handleReset}
                                    disabled={saving || loading}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </section>
                </form>
            </main>
        </DashboardLayout>
    )
}

export default PCREdit