import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getPainKillerDetail,
    getPainKillerNotes,
    getPainKillerClick2Call,
    getPainKillerSubReasons,
    savePainKillerAction
} from '../../api/painKillerApi'

import './PainKillerEdit.css'

// =========================================
// HELPERS
// =========================================

function getSessionValue(...keys) {
    for (const key of keys) {
        const value = sessionStorage.getItem(key)

        if (value !== null && value !== undefined && value !== '') {
            return value
        }
    }

    return ''
}

function getDate(value, includeTime = false) {
    if (!value) return '-'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return '-'

    const day = String(date.getDate()).padStart(2, '0')

    const month = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
    ][date.getMonth()]

    const dateText = `${day}-${month}-${date.getFullYear()}`

    if (!includeTime) return dateText

    const time = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })

    return `${dateText} ${time}`
}

function getArrayFromResponse(response) {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.Data)) return response.Data
    if (Array.isArray(response?.result)) return response.result
    if (Array.isArray(response?.items)) return response.items

    return []
}

// =========================================
// FEEDBACK OPTIONS
// =========================================

const feedbackOptions = [
    { value: 'E0008', label: 'Closure Confirmed' },
    { value: 'E0004', label: 'Cancellation Confirmed' },
    { value: 'E0010', label: 'Negative Response' },
    { value: 'E0007', label: 'Revisit Requested' },
    {
        value: '6',
        label: 'Pending Reason Changed by franchise'
    },
    { value: '7', label: 'Customer Not Reachable' },
    { value: '8', label: 'No Response' },
    {
        value: 'E0007',
        label: 'Customer Appointment/Re-Schedule'
    }
]

// =========================================
// COMPONENT
// =========================================

function PainKillerEdit({ refid, onBack }) {

    const ticketNo = refid || ''

    // =====================================
    // SESSION
    // =====================================

    const userId = getSessionValue('userId', 'UserID')

    const roleId = Number(
        getSessionValue('roleId', 'RoleID')
    )

    const isAuthorized = roleId === 2

    // =====================================
    // DATA STATES
    // =====================================

    const [detail, setDetail] = useState(null)
    const [notes, setNotes] = useState([])
    const [click2Call, setClick2Call] = useState([])
    const [subReasons, setSubReasons] = useState([])

    // =====================================
    // FORM STATES
    // =====================================

    const [feedback, setFeedback] = useState('0')
    const [subReason, setSubReason] = useState('0')
    const [contactedByIfb, setContactedByIfb] = useState('0')
    const [technicianVisited, setTechnicianVisited] = useState('0')
    const [agentRemark, setAgentRemark] = useState('')

    const [savedRemarks, setSavedRemarks] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem(`painKillerRemarks_${userId}`) || '[]'
            )
        } catch {
            return []
        }
    })

    // =====================================
    // UI STATES
    // =====================================

    const [loading, setLoading] = useState(false)
    const [loadingSubReasons, setLoadingSubReasons] = useState(false)
    const [saving, setSaving] = useState(false)

    const [showNotes, setShowNotes] = useState(false)

    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // =====================================
    // LOAD TICKET DETAILS
    // =====================================

    useEffect(() => {
        if (!isAuthorized || !ticketNo) return

        let cancelled = false

        async function loadPage() {
            setLoading(true)
            setError('')

            try {
                const [
                    detailResponse,
                    notesResponse,
                    clickResponse
                ] = await Promise.all([
                    getPainKillerDetail(ticketNo),
                    getPainKillerNotes(ticketNo),
                    getPainKillerClick2Call(ticketNo)
                ])

                if (cancelled) return

                setDetail(detailResponse || null)
                setNotes(getArrayFromResponse(notesResponse))
                setClick2Call(getArrayFromResponse(clickResponse))

                const currentFeedback =
                    detailResponse?.feedBackByCustomer ??
                    detailResponse?.FeedBackByCustomer ??
                    '0'

                setFeedback(String(currentFeedback || '0'))

                setContactedByIfb(
                    String(
                        detailResponse?.contactedByIfb ??
                        detailResponse?.ContactedByIfb ??
                        '0'
                    )
                )

                setTechnicianVisited(
                    String(
                        detailResponse?.technicianVisited ??
                        detailResponse?.TechnicianVisited ??
                        '0'
                    )
                )

                setAgentRemark(
                    detailResponse?.agentRemark ??
                    detailResponse?.AgentRemark ??
                    ''
                )
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err?.message ||
                        'Unable to load Pain Killer details.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadPage()

        return () => {
            cancelled = true
        }
    }, [isAuthorized, ticketNo])

    // =====================================
    // LOAD SUB-REASONS
    // =====================================

    useEffect(() => {
        if (!feedback || feedback === '0') {
            setSubReasons([])
            setSubReason('0')
            return
        }

        let cancelled = false

        async function loadSubReasons() {
            setLoadingSubReasons(true)

            try {
                const response = await getPainKillerSubReasons(feedback)

                if (cancelled) return

                const list = getArrayFromResponse(response)

                setSubReasons(list)

                const existingSubReason =
                    detail?.statusSubReason ??
                    detail?.StatusSubReason ??
                    ''

                const matchingReason = list.find(item =>
                    String(
                        item?.catCode ??
                        item?.CatCode ??
                        ''
                    ) === String(existingSubReason)
                )

                setSubReason(
                    matchingReason
                        ? String(
                            matchingReason.catCode ??
                            matchingReason.CatCode
                        )
                        : '0'
                )
            } catch (err) {
                if (!cancelled) {
                    setSubReasons([])
                    setSubReason('0')
                    setError(
                        err?.message ||
                        'Unable to load status sub-reasons.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoadingSubReasons(false)
                }
            }
        }

        loadSubReasons()

        return () => {
            cancelled = true
        }
    }, [feedback, detail])

    // =====================================
    // FEEDBACK CHANGE
    // =====================================

    function handleFeedbackChange(value) {
    setFeedback(value)
    setSubReason('0')
    setSubReasons([])
    setError('')
    setSuccessMessage('')
}

function handleSubReasonChange(value) {
    setSubReason(value)

    if (value && value !== '0') {
        setError('')
    }
}

function saveRemarkSuggestion(value) {
    const remark = value.trim()

    if (!remark) return

    const updatedRemarks = [
        remark,
        ...savedRemarks.filter(
            item => item.toLowerCase() !== remark.toLowerCase()
        )
    ].slice(0, 10)

    setSavedRemarks(updatedRemarks)

    localStorage.setItem(
        `painKillerRemarks_${userId}`,
        JSON.stringify(updatedRemarks)
    )
}

function handleAgentRemarkChange(value) {
    // Preserve the previous remark when the input is cleared.
    if (!value.trim() && agentRemark.trim()) {
        saveRemarkSuggestion(agentRemark)
    }

    setAgentRemark(value.slice(0, 164))

    if (value.trim()) {
        setError('')
    }
}

    // =====================================
    // SAVE VALIDATION
    // =====================================

    function validateForm() {
        if (!feedback || feedback === '0') {
            setError("the customer feedback can't empty")
            return false
        }

        if (!subReason || subReason === '0') {
            setError("the customer status sub-reason can't empty")
            return false
        }

        if (!agentRemark.trim()) {
            setError("the remark can't empty")
            return false
        }

        if (agentRemark.trim().length > 164) {
            setError('Only 164 characters allowed in remark.')
            return false
        }

        return true
    }

    // =====================================
    // SAVE
    // =====================================

    async function handleSave() {
        setError('')
        setSuccessMessage('')

        if (!validateForm()) return

        if (!userId || Number(userId) <= 0) {
            setError('User session is invalid. Please sign in again.')
            return
        }

        setSaving(true)

        try {
            const payload = {
                ticketNo,
                feedBackByCustomer: feedback,
                statusSubReason: subReason,
                contactedByIfb,
                technicianVisited,
                agentRemark: agentRemark.trim(),
                userId: Number(userId),
                createdBy: String(userId),
                uplodedInCrm: null
            }

            const response = await savePainKillerAction(payload)

            setSuccessMessage(
                response?.message ??
                response?.Message ??
                'Your information has been submitted.'
            )

            setTimeout(() => {
                setSuccessMessage('')
            }, 2000)

            setDetail(previous => ({
                ...previous,
                painStatusVal: '0'
            }))
        } catch (err) {
            setError(
                err?.message ||
                'Your information not submitted.'
            )
        } finally {
            setSaving(false)
        }
    }

    // =====================================
    // BACK
    // =====================================

    function handleBack() {
        if (typeof onBack === 'function') {
            onBack({
                refreshPainKiller: true
            })
        }
    }

    // =====================================
    // ROLE CHECK
    // =====================================

    if (!isAuthorized) {
        return (
            <DashboardLayout title="Pain Killer - Call Verification">
                <div className="pk-alert pk-alert-error">
                    You are not authorized to access this page.
                </div>
            </DashboardLayout>
        )
    }

    if (!ticketNo) {
        return (
            <DashboardLayout title="Pain Killer - Call Verification">
                <div className="pain-killer-page pk-edit-page">

                    <div className="pk-back-button-container">
                        <button
                            type="button"
                            className="pk-back-button"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                    </div>

                    <div className="pk-alert pk-alert-error">
                        Ticket number is missing.
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    // =====================================
    // RENDER
    // =====================================

    return (
        <DashboardLayout title="Pain Killer - Call Verification">

            <div className="pain-killer-page pk-edit-page">

                {/* <div className="pk-back-button-container">
                    <button
                        type="button"
                        className="pk-back-button"
                        onClick={handleBack}
                    >
                        Back
                    </button>
                </div> */}

                {error && (
                    <div className="pk-alert pk-alert-error">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="pk-alert pk-alert-success">
                        {successMessage}
                    </div>
                )}

                {loading ? (
                    <div className="pk-loading">
                        Loading ticket details...
                    </div>
                ) : !detail ? (
                    <div className="pk-no-records">
                        No ticket details found.
                    </div>
                ) : (
                    <>
                        {/* =================================
                            ACTION BY AGENT
                        ================================= */}

                        <div className="pk-edit-section">

                            <div className="pk-section-header-row">
                                <div className="pk-section-heading">
                                    Action By Agent
                                </div>

                                <button
                                    type="button"
                                    className="pk-back-button"
                                    onClick={handleBack}
                                >
                                    Back
                                </button>
                            </div>

                            <div className="pk-agent-one-row">

                                <div className="pk-form-item">
                                    <label>
                                        Feedback By Customer <span>*</span>
                                    </label>

                                    <select
                                        value={feedback}
                                        onChange={event =>
                                            handleFeedbackChange(event.target.value)
                                        }
                                        disabled={saving}
                                    >
                                        <option value="0">
                                            Select Feedback
                                        </option>

                                        {feedbackOptions.map((item, index) => (
                                            <option
                                                key={`${item.value}-${index}`}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pk-form-item">
                                    <label>
                                        Status Sub-Reason <span>*</span>
                                    </label>

                                    <select
                                        value={subReason}
                                        onChange={event =>
                                            handleSubReasonChange(event.target.value)
                                        }
                                        disabled={
                                            !feedback ||
                                            feedback === '0' ||
                                            loadingSubReasons ||
                                            saving
                                        }
                                    >
                                        <option value="0">
                                            {loadingSubReasons
                                                ? 'Loading...'
                                                : 'Select Status Sub-Reason'}
                                        </option>

                                        {subReasons.map((item, index) => {
                                            const code =
                                                item?.catCode ??
                                                item?.CatCode ??
                                                ''

                                            const name =
                                                item?.catName ??
                                                item?.CatName ??
                                                ''

                                            return (
                                                <option
                                                    key={`${code}-${index}`}
                                                    value={code}
                                                >
                                                    {name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                <div className="pk-form-item">
                                    <label>Contacted By IFB</label>

                                    <select
                                        value={contactedByIfb}
                                        onChange={event =>
                                            setContactedByIfb(event.target.value)
                                        }
                                        disabled={saving}
                                    >
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                </div>

                                <div className="pk-form-item">
                                    <label>Technician Visited</label>

                                    <select
                                        value={technicianVisited}
                                        onChange={event =>
                                            setTechnicianVisited(event.target.value)
                                        }
                                        disabled={saving}
                                    >
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                </div>

                                <div className="pk-form-item pk-agent-remark">
                                    <label>
                                        Agent Remark <span>*</span>
                                    </label>

                                    <input
                                    type="text"
                                    list="agent-remark-suggestions"
                                    value={agentRemark}
                                    onChange={event =>
                                        handleAgentRemarkChange(event.target.value)
                                    }
                                    onBlur={() => saveRemarkSuggestion(agentRemark)}
                                    maxLength={164}
                                    placeholder="Enter Agent Remark"
                                    autoComplete="off"
                                    disabled={saving}
                                />

                                <datalist id="agent-remark-suggestions">
                                    {savedRemarks.map((remark, index) => (
                                        <option key={index} value={remark} />
                                    ))}
                                </datalist>
                                </div>

                                <div className="pk-agent-save">
                                    <button
                                        type="button"
                                        className="btn-search pk-search-button"
                                        onClick={handleSave}
                                        disabled={saving || loadingSubReasons}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>

                            </div>
                        </div>

                        {/* =================================
                            CUSTOMER & TICKET DETAILS
                        ================================= */}

                        <div className="pk-edit-section">

                            <div className="pk-section-heading">
                                Customer & Ticket Details - {detail.ticketNo ?? detail.TicketNo}

                            </div>

                            <div className="pk-details-grid">

                                {/* ROW 1 - SIX FIELDS */}

                                <DetailItem
                                    className="pk-detail-first-row"
                                    label="Customer Code"
                                    value={detail.customerCode ?? detail.CustomerCode}
                                />

                                <DetailItem
                                    className="pk-detail-first-row"
                                    label="Customer Name"
                                    value={detail.customerName ?? detail.CustomerName}
                                />

                                <DetailItem
                                    className="pk-detail-first-row"
                                    label="Mobile Number"
                                    value={detail.contacts ?? detail.Contacts}
                                />

                                <DetailItem
                                    className="pk-detail-first-row"
                                    label="Alternate Mobile Number"
                                    value={detail.altNo ?? detail.AltNo}
                                />

                                <DetailItem
                                    className="pk-detail-first-row "
                                    label="Ticket Number"
                                    value={detail.ticketNo ?? detail.TicketNo}
                                />

                                <DetailItem
                                    className="pk-detail-first-row"
                                    label="Call Type"
                                    value={detail.callType ?? detail.CallType}
                                />

                                {/* ROW 2 - ADDRESS FULL WIDTH */}

                                <DetailItem
                                    className="pk-detail-address"
                                    label="Address"
                                    value={detail.address ?? detail.Address}
                                />

                                {/* ROW 3 - DETAILS AND NOTES BUTTON */}

                                <DetailItem
                                    className="pk-detail-last-row"
                                    label="Product"
                                    value={detail.product ?? detail.Product}
                                />

                                <DetailItem
                                    className="pk-detail-last-row"
                                    label="Model"
                                    value={detail.model ?? detail.Model}
                                />

                                <DetailItem
                                    className="pk-detail-last-row"
                                    label="Status Reason"
                                    value={detail.pendingReason ?? detail.PendingReason}
                                />

                                <DetailItem
                                    className="pk-detail-last-row"
                                    label="Voice Verification"
                                    value={detail.voiceVerification ?? detail.VoiceVerification}
                                />

                                <DetailItem
                                    className="pk-detail-last-row"
                                    label="Summary"
                                    value={detail.summary ?? detail.Summary}
                                />

                                <div className="pk-detail-note-button">
                                    <button
                                        type="button"
                                        className="btn-search pk-note-button"
                                        onClick={() => setShowNotes(true)}
                                    >
                                        Click Here For Note
                                    </button>
                                </div>

                                

                            </div>

                        </div>

                        {/* =================================
                            CLICK 2 CALL DETAILS
                        ================================= */}

                        <div className="pk-edit-section">

                            <div className="pk-section-heading">
                                Click 2 Call Details
                            </div>

                            {click2Call.length > 0 ? (
                                <div className="pk-table-wrapper">
                                    <table className="pk-table pk-click-table">
                                        <thead>
                                            <tr>
                                                <th>SNo.</th>
                                                <th>TicketNo</th>
                                                <th>Start Time</th>
                                                <th>End Time</th>
                                                <th>Duration</th>
                                                <th>Hangup Cause</th>
                                                <th>Direction</th>
                                                <th>Call Status</th>
                                                <th>Created Date</th>
                                                <th>Recording</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {click2Call.map((item, index) => {
                                                const recordingUrl =
                                                    item?.recordingUrl ??
                                                    item?.RecordingUrl ??
                                                    ''

                                                return (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>

                                                        <td>
                                                            {item?.leadId ??
                                                                item?.LeadId ?? '-'}
                                                        </td>

                                                        <td>
                                                            {getDate(
                                                                item?.startStamp ??
                                                                item?.StartStamp,
                                                                true
                                                            )}
                                                        </td>

                                                        <td>
                                                            {getDate(
                                                                item?.endStamp ??
                                                                item?.EndStamp,
                                                                true
                                                            )}
                                                        </td>

                                                        <td>
                                                            {item?.duration ??
                                                                item?.Duration ?? '-'}
                                                        </td>

                                                        <td>
                                                            {item?.hangupCause ??
                                                                item?.HangupCause ?? '-'}
                                                        </td>

                                                        <td>
                                                            {item?.direction ??
                                                                item?.Direction ?? '-'}
                                                        </td>

                                                        <td>
                                                            {item?.callStatus ??
                                                                item?.CallStatus ?? '-'}
                                                        </td>

                                                        <td>
                                                            {getDate(
                                                                item?.createdDate ??
                                                                item?.CreatedDate
                                                            )}
                                                        </td>

                                                        <td className="pk-audio-cell">
                                                            {recordingUrl ? (
                                                                <audio
                                                                    controls
                                                                    preload="none"
                                                                    src={recordingUrl}
                                                                >
                                                                    Your browser does not support audio.
                                                                </audio>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="pk-no-records">
                                    no record found change search criteria
                                </div>
                            )}

                        </div>
                    </>
                )}

                {/* =================================
                    NOTES MODAL
                ================================= */}

                {showNotes && (
                    <div
                        className="pk-modal-overlay"
                        onClick={() => setShowNotes(false)}
                    >
                        <div
                            className="pk-modal"
                            onClick={event => event.stopPropagation()}
                        >
                            <div className="pk-modal-header">
                                <h3>Notes</h3>

                                <button
                                    type="button"
                                    onClick={() => setShowNotes(false)}
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="pk-modal-body">

                                {notes.length > 0 ? (
                                    <table className="pk-table">
                                        <thead>
                                            <tr>
                                                <th>Notes</th>
                                                <th>Created Date</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {notes.map((note, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        {note?.notes ??
                                                            note?.Notes ?? '-'}
                                                    </td>

                                                    <td>
                                                        {getDate(
                                                            note?.createdDate ??
                                                            note?.CreatedDate,
                                                            true
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="pk-no-records">
                                        No notes found.
                                    </div>
                                )}

                            </div>

                            <div className="pk-modal-footer">
                                <button
                                    type="button"
                                    className="pk-reset-button"
                                    onClick={() => setShowNotes(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    )
}

// =========================================
// DETAIL ITEM - READ ONLY INPUT
// =========================================

function DetailItem({ className = '', label, value }) {
    return (
        <div className={`pk-detail-item ${className}`}>
            <label>{label}</label>

            <input
                type="text"
                value={value ?? ''}
                readOnly
                title={value ?? ''}
            />
        </div>
    )
}

export default PainKillerEdit