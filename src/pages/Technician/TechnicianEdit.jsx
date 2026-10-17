import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import {
    getTechnicianById,
    updateTechnician
} from '../../api/technicianApi'

import './TechnicianEdit.css'

const INITIAL_FORM = {
    techId: '',
    partnerId: '',
    type: '',
    name: '',
    mobileNo: '',
    qualification: '',
    emailId: '',
    address: '',
    maritalStatus: '',
    insurance: '1',
    actionStatus: '',
    remark: '',
    profileUrl: '',
    franchiseName: '',
    dob: '',
    doj: ''
}

function getValue(data, ...keys) {
    for (const key of keys) {
        if (data?.[key] !== undefined && data?.[key] !== null) {
            return data[key]
        }
    }

    return ''
}

function getDateInputValue(value) {
    if (!value) return ''

    const text = String(value).trim()

    // DOB format: dd-MM-yyyy, e.g. 19-04-1997
    const dmyMatch = text.match(/^(\d{2})-(\d{2})-(\d{4})/)

    if (dmyMatch) {
        const [, day, month, year] = dmyMatch
        return `${year}-${month}-${day}`
    }

    // DOJ format: yyyy-MM-dd, e.g. 2026-02-10
    const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/)

    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
    }

    // Handle other valid date formats
    const date = new Date(text)

    if (Number.isNaN(date.getTime())) {
        return ''
    }

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-')
}

function TechnicianEdit() {
    const navigate = useNavigate()
    const location = useLocation()

    const techId = location.state?.techId
    const returnUrl = location.state?.returnUrl || '/technician'
    const listState = location.state?.listState ?? null

    const roleId = Number(
        sessionStorage.getItem('roleId') ||
        sessionStorage.getItem('RoleID') ||
        0
    )

    const isRole3 = roleId === 3
    const isRole5 = roleId === 5

    const pageTitle = isRole5 ? 'S.A Profile' : 'Edit Technician'

    const [form, setForm] = useState(INITIAL_FORM)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [photoError, setPhotoError] = useState(false)

    // Temporary photo selection and preview.
    // The existing update API does not yet upload this file.
    const [selectedPhoto, setSelectedPhoto] = useState(null)
    const [selectedPhotoPreview, setSelectedPhotoPreview] = useState('')

    const messageRef = useRef(null)
    const photoInputRef = useRef(null)

    // Load technician details.
    useEffect(() => {
        let isMounted = true

        async function loadTechnician() {
            if (!isRole3 && !isRole5) {
                setError('You are not authorized to access this page.')
                setLoading(false)
                return
            }

            if (!techId) {
                setError(
                    'Technician ID is missing. Please return to the technician list and select a technician again.'
                )
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError('')
                setMessage('')

                const response = await getTechnicianById(techId)

                const technician =
                    response?.data ??
                    response?.result ??
                    response?.technician ??
                    response

                if (!technician || typeof technician !== 'object') {
                    throw new Error('Technician details were not found.')
                }

                if (!isMounted) return

                const profileUrl = getValue(
                    technician,
                    'profileUrl',
                    'ProfileUrl',
                    'URL'
                )

                const existingInsurance = getValue(
                    technician,
                    'insurance',
                    'Insurance'
                )

                // Default to Pending (1) if the API returns an empty value.
                const insuranceValue =
                    existingInsurance === ''
                        ? '1'
                        : String(existingInsurance)

                setPhotoError(false)
                setSelectedPhoto(null)
                setSelectedPhotoPreview('')

                setForm({
                    techId:
                        getValue(
                            technician,
                            'techId',
                            'TechId',
                            'techID',
                            'TechID'
                        ) || techId,

                    partnerId: getValue(
                        technician,
                        'partnerId',
                        'PartnerId',
                        'PARTNERID'
                    ),

                    type: getValue(
                        technician,
                        'type',
                        'Type'
                    ),

                    name: getValue(
                        technician,
                        'name',
                        'Name'
                    ),

                    mobileNo: String(
                        getValue(
                            technician,
                            'mobileNo',
                            'MobileNo'
                        )
                    ),

                    qualification: getValue(
                        technician,
                        'qualification',
                        'Qualification'
                    ),

                    emailId: getValue(
                        technician,
                        'emailId',
                        'EmailId',
                        'EmailID'
                    ),

                    address: getValue(
                        technician,
                        'address',
                        'Address'
                    ),

                    maritalStatus: String(
                        getValue(
                            technician,
                            'maritalStatus',
                            'MaritalStatus'
                        )
                    ),

                    insurance: insuranceValue,

                    actionStatus: isRole5
                        ? '3'
                        : String(
                            getValue(
                                technician,
                                'actionStatus',
                                'ActionStatus',
                                'statusCode',
                                'StatusCode'
                            )
                        ),

                    remark: getValue(
                        technician,
                        'remark',
                        'Remark'
                    ),

                    profileUrl,

                    franchiseName: getValue(
                        technician,
                        'franchiseName',
                        'FranchiseName'
                    ),

                    dob: getDateInputValue(
                        getValue(
                            technician,
                            'dob',
                            'DOB'
                        )
                    ),

                    doj: getDateInputValue(
                        getValue(
                            technician,
                            'doj',
                            'DOJ'
                        )
                    )
                })
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.message ||
                        'Unable to load technician details.'
                    )
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadTechnician()

        return () => {
            isMounted = false
        }
    }, [techId, isRole3, isRole5])

    // Clear the temporary browser URL when the selected file changes
    // or when the component unmounts.
    useEffect(() => {
        if (!selectedPhoto) {
            setSelectedPhotoPreview('')
            return undefined
        }

        const previewUrl = URL.createObjectURL(selectedPhoto)
        setSelectedPhotoPreview(previewUrl)

        return () => {
            URL.revokeObjectURL(previewUrl)
        }
    }, [selectedPhoto])

    // Scroll to messages and clear them after two seconds.
    useEffect(() => {
        if (!message) return undefined

        messageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })

        const timer = setTimeout(() => {
            setMessage('')
        }, 2000)

        return () => clearTimeout(timer)
    }, [message])

    function handleChange(event) {
        const { name, value } = event.target

        setForm(previous => ({
            ...previous,
            [name]: value
        }))

        setError('')
        setMessage('')
    }

    function handleMobileChange(event) {
        const value = event.target.value
            .replace(/\D/g, '')
            .slice(0, 10)

        setForm(previous => ({
            ...previous,
            mobileNo: value
        }))

        setError('')
        setMessage('')
    }

    // Select a new photo and display its local preview.
    function handlePhotoChange(event) {
        const file = event.target.files?.[0]

        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.')
            event.target.value = ''
            return
        }

        setSelectedPhoto(file)
        setPhotoError(false)
        setError('')
        setMessage('')
    }

    // Clear the new selection and show the existing photo again.
    function handleRemoveSelectedPhoto() {
        setSelectedPhoto(null)
        setSelectedPhotoPreview('')
        setPhotoError(false)
        setError('')
        setMessage('')

        if (photoInputRef.current) {
            photoInputRef.current.value = ''
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (!isRole3 && !isRole5) {
            setError(
                'You are not authorized to update technician details.'
            )
            return
        }

        if (!techId || !form.techId) {
            setError(
                'Technician ID is missing. Please return to the technician list and select a technician again.'
            )
            return
        }

        // if (!form.type?.trim()) {
        //     setError('Please select service type.')
        //     return
        // }

        // if (!form.remark?.trim()) {
        //     setError('Please enter a remark.')
        //     return
        // }

        // if (!form.insurance) {
        //     setError('Please select insurance status.')
        //     return
        // }

        if (
            !form.type?.trim() ||
            !form.remark?.trim() ||
            !form.insurance
        ) {
            return
        }

        if (!form.name.trim()) {
            setError('Please enter the technician name.')
            return
        }

        if (!/^\d{10}$/.test(form.mobileNo.trim())) {
            setError('Please enter a valid 10-digit mobile number.')
            return
        }

        if (
            form.emailId.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailId.trim())
        ) {
            setError('Please enter a valid email address.')
            return
        }

        if (form.remark.trim().length > 32) {
            setError('Remark cannot exceed 32 characters.')
            return
        }

        if (isRole3 && !form.actionStatus) {
            setError('Please select an action status.')
            return
        }

        try {
            setSaving(true)
            setError('')
            setMessage('')

            const updatedBy = Number(
                sessionStorage.getItem('userId') ||
                sessionStorage.getItem('UserID') ||
                0
            )

            const payload = {
                techId: Number(form.techId || techId),
                type: form.type,
                name: form.name.trim(),
                mobileNo: form.mobileNo.trim(),
                qualification: form.qualification.trim(),
                address: form.address.trim(),
                emailId: form.emailId.trim(),
                maritalStatus: Number(form.maritalStatus || 0),
                actionStatus: isRole5 ? '3' : form.actionStatus,
                remark: form.remark.trim(),
                insurance: form.insurance,
                // Include the selected dates.
                dob: form.dob || null,
                doj: form.doj || null,
                profileUrl: form.profileUrl || null,
                updatedBy
            }

            // Keep the existing update API request unchanged.
            // Photo selection remains preview-only until upload is supported.
            const response = await updateTechnician(payload, selectedPhoto)

            if (response?.isSuccess === false) {
                throw new Error(
                    response.message ||
                    'Unable to update technician details.'
                )
            }

            setMessage(
                isRole5
                    ? (
                        response?.message ||
                        'Thanks! Your request has been submitted and is under review by the branch trainer.'
                    )
                    : (
                        response?.message ||
                        'Technician details updated successfully.'
                    )
            )
        } catch (err) {
            setError(
                err.message ||
                'Unable to save technician details.'
            )
        } finally {
            setSaving(false)
        }
    }

    function handleCancel() {
        navigate(returnUrl, {
            state: {
                restoreListState: true,
                refreshTechnicians: true,
                listState
            }
        })
    }

    if (!isRole3 && !isRole5) {
        return (
            <DashboardLayout title={pageTitle}>
                <div className="technician-edit-page">
                    <div className="technician-edit-card">
                        <div className="technician-edit-header">
                            <div />

                            <button
                                type="button"
                                className="technician-edit-back-btn"
                                onClick={handleCancel}
                            >
                                Back
                            </button>
                        </div>

                        <div className="technician-edit-body">
                            <div className="alert alert-danger" role="alert">
                                You are not authorized to access this page.
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    const displayedPhoto =
        selectedPhotoPreview || form.profileUrl

    return (
        <DashboardLayout title={pageTitle}>
            <div className="technician-edit-page">
                <div className="technician-edit-card">

                    <div className="technician-edit-header">
                        <button
                            type="button"
                            className="technician-edit-back-btn"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Back
                        </button>
                    </div>

                    <div className="technician-edit-body">
                        {loading && (
                            <div className="technician-edit-loading">
                                Loading technician details...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        {!loading && message && (
                            <div
                                ref={messageRef}
                                className="alert alert-success"
                                role="status"
                            >
                                {message}
                            </div>
                        )}

                        {!loading && techId && !error && (
                            <form onSubmit={handleSubmit}>
                                <div className="technician-edit-sections-grid">

                                    {/* LEFT COLUMN: Technician Information */}
                                    <section className="technician-edit-section technician-information-section">
                                        <h6 className="technician-edit-section-title">
                                            Technician Information
                                        </h6>

                                        <div className="technician-fields-grid technician-information-fields-grid">

                                            {/* Row 1: Technician ID, Partner ID, Service Type */}
                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Technician ID
                                                </label>
                                                <input
                                                    className="form-control"
                                                    value={form.techId}
                                                    readOnly
                                                />
                                            </div>

                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Partner ID
                                                </label>
                                                <input
                                                    className="form-control"
                                                    value={form.partnerId}
                                                    readOnly
                                                />
                                            </div>

                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Service Type
                                                    <span className="text-danger"> *</span>
                                                </label>

                                                <select
                                                    name="type"
                                                    className="form-select"
                                                    value={form.type}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Service Type</option>
                                                    <option value="MJR">MJR</option>
                                                    <option value="MNR">MNR</option>
                                                    <option value="ACHLPR">AC</option>
                                                    <option value="IND">IND</option>
                                                    <option value="KA">KA</option>
                                                </select>

                                                {!form.type?.trim() && (
                                                    <span className="field-help">Please fill this</span>
                                                )}
                                            </div>

                                            {/* Franchise Name */}
                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Franchise Name
                                                </label>
                                                <input
                                                    className="form-control"
                                                    value={form.franchiseName}
                                                    readOnly
                                                />
                                            </div>

                                            {/* Email */}
                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="emailId"
                                                    className="form-control"
                                                    value={form.emailId}
                                                    onChange={handleChange}
                                                    maxLength={32}
                                                />
                                            </div>

                                            {/* Name */}
                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    name="name"
                                                    className="form-control"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    maxLength={16}
                                                    required
                                                />
                                            </div>

                                            {/* Mobile Number */}
                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Mobile Number <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    name="mobileNo"
                                                    className="form-control"
                                                    value={form.mobileNo}
                                                    onChange={handleMobileChange}
                                                    inputMode="numeric"
                                                    maxLength={10}
                                                    required
                                                />
                                            </div>

                                            {/* Qualification */}
                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Qualification
                                                </label>
                                                <input
                                                    name="qualification"
                                                    className="form-control"
                                                    value={form.qualification}
                                                    onChange={handleChange}
                                                    maxLength={10}
                                                />
                                            </div>

                                            {/* Insurance: required for both Role 3 and Role 5 */}
                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Insurance
                                                    <span className="text-danger"> *</span>
                                                </label>
                                                <select
                                                    name="insurance"
                                                    className="form-select"
                                                    value={form.insurance}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">
                                                        Select Insurance Status
                                                    </option>
                                                    <option value="1">
                                                        Pending
                                                    </option>
                                                    <option value="2">
                                                        Completed
                                                    </option>
                                                </select>
                                            </div>

                                            {/* Marital Status */}
                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Marital Status
                                                </label>
                                                <select
                                                    name="maritalStatus"
                                                    className="form-select"
                                                    value={form.maritalStatus}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">
                                                        Select Marital Status
                                                    </option>
                                                    <option value="1">Single</option>
                                                    <option value="2">Married</option>
                                                </select>
                                            </div>

                                            {/* Date of Joining */}
                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Date of Joining
                                                </label>

                                                <input
                                                    type="date"
                                                    name="doj"
                                                    className="form-control"
                                                    value={form.doj || ''}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            {/* Date of Birth */}
                                            <div className="technician-field">
                                                <label className="form-label">
                                                    Date of Birth
                                                </label>

                                                <input
                                                    type="date"
                                                    name="dob"
                                                    className="form-control"
                                                    value={form.dob || ''}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            {/* Address */}
                                            <div className="technician-field technician-field-full">
                                                <label className="form-label">
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    className="form-control"
                                                    value={form.address}
                                                    onChange={handleChange}
                                                    maxLength={32}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* RIGHT COLUMN */}
                                    <div className="technician-edit-right-column">

                                        {/* Profile Photo */}
                                        <section className="technician-edit-section profile-photo-section">
                                            <h6 className="technician-edit-section-title">
                                                Profile Photo
                                            </h6>

                                            <div className="profile-photo-content">
                                                <div className="profile-photo-upload-controls">
                                                    <div className="technician-field">
                                                        <label
                                                            htmlFor="technician-photo"
                                                            className="form-label"
                                                        >
                                                            Choose New Photo
                                                        </label>

                                                        <input
                                                            ref={photoInputRef}
                                                            id="technician-photo"
                                                            type="file"
                                                            className="form-control"
                                                            accept="image/*"
                                                            onChange={handlePhotoChange}
                                                            disabled={saving}
                                                        />

                                                        <small className="field-help">
                                                            Select an image to preview it.
                                                        </small>
                                                    </div>

                                                    {/* <div className="technician-field">
                                                        <label className="form-label">
                                                            Existing Profile Photo URL
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={form.profileUrl || ''}
                                                            readOnly
                                                        />
                                                    </div> */}

                                                    {selectedPhoto && (
                                                        <div className="photo-selected-info">
                                                            <small className="photo-selected-message">
                                                                Selected: {selectedPhoto.name}
                                                            </small>

                                                            <button
                                                                type="button"
                                                                className="photo-clear-btn"
                                                                onClick={handleRemoveSelectedPhoto}
                                                                disabled={saving}
                                                            >
                                                                Remove selection
                                                            </button>
                                                        </div>
                                                    )}

                                                    {selectedPhoto && (
                                                        <small className="field-help">
                                                            The selected image will be uploaded when you save your changes.
                                                        </small>
                                                    )}
                                                </div>

                                                <div className="profile-photo-preview-container">
                                                <label className="form-label">
                                                    Photo Preview
                                                </label>

                                                {displayedPhoto && !photoError ? (
                                                    <img
                                                        key={displayedPhoto}
                                                        src={displayedPhoto}
                                                        alt="Technician profile preview"
                                                        className="profile-photo-preview"
                                                        onError={() => setPhotoError(true)}
                                                    />
                                                ) : (
                                                    <div className="profile-photo-placeholder">
                                                        {photoError
                                                            ? 'Photo unavailable'
                                                            : 'No photo available'}
                                                    </div>
                                                )}

                                                <div className="partner-id-preview">
                                                    Partner ID: {form.partnerId || ''}
                                                </div>
                                            </div>
                                                
                                            </div>
                                        </section>

                                        {/* Approval and Status */}
                                        <section className="technician-edit-section approval-status-section">
                                            <h6 className="technician-edit-section-title">
                                                {isRole5
                                                    ? 'Request Details'
                                                    : 'Approval and Status'}
                                            </h6>

                                            <div className="technician-fields-grid">
                                                <div className="technician-field">
                                                    <label className="form-label">
                                                        {isRole5 ? 'Action' : 'Action Status'}
                                                        <span className="text-danger"> *</span>
                                                    </label>

                                                    <select
                                                        name="actionStatus"
                                                        className="form-select"
                                                        value={form.actionStatus}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={isRole5}
                                                    >
                                                        <option value="">
                                                            Select Action
                                                        </option>

                                                        {isRole5 ? (
                                                            <option value="3">
                                                                Request for deactivate
                                                            </option>
                                                        ) : (
                                                            <>
                                                                <option value="1">
                                                                    Approved &amp; Activated By Trainer
                                                                </option>
                                                                <option value="0">
                                                                    De-Activated By Branch Trainer
                                                                </option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>

                                                {/* Remark: required for both Role 3 and Role 5 */}
                                                <div className="technician-field">
    <label className="form-label">
        Remark
        <span className="text-danger"> *</span>
    </label>

    <input
        type="text"
        name="remark"
        className="form-control"
        value={form.remark}
        onChange={handleChange}
        maxLength={32}
    />

    {!form.remark?.trim() && (
        <span className="field-help">Please fill this</span>
    )}
</div>
                                            </div>
                                        </section>

                                        {/* Actions */}
                                        <div className="technician-edit-footer">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleCancel}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={saving || loading}
                                            >
                                                {saving
                                                    ? 'Submitting...'
                                                    : isRole5
                                                        ? 'Submit Request'
                                                        : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default TechnicianEdit