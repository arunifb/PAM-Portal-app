import { useEffect, useRef, useState } from 'react'
import {
    useParams,
    useNavigate,
    useLocation
} from 'react-router-dom'

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
    insurance: '',
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

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10)
    }

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-')
}

function TechnicianEdit() {
    const { techId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    // Preserve the original list URL and state passed from Technician.jsx.
    const returnUrl =
        location.state?.returnUrl || '/technician'

    const listState =
        location.state?.listState ?? null

    const roleId = Number(
        sessionStorage.getItem('roleId') ||
        sessionStorage.getItem('RoleID') ||
        0
    )

    const [form, setForm] = useState(INITIAL_FORM)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const messageRef = useRef(null)

    // Load technician details.
    useEffect(() => {
        let isMounted = true

        async function loadTechnician() {
            if (roleId !== 3) {
                setError(
                    'You are not authorized to edit technician details.'
                )
                setLoading(false)
                return
            }

            if (!techId) {
                setError('Technician ID is missing.')
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
                    throw new Error(
                        'Technician details were not found.'
                    )
                }

                if (!isMounted) return

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

                    mobileNo: getValue(
                        technician,
                        'mobileNo',
                        'MobileNo'
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

                    insurance: String(
                        getValue(
                            technician,
                            'insurance',
                            'Insurance'
                        )
                    ),

                    actionStatus: String(
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

                    profileUrl: getValue(
                        technician,
                        'profileUrl',
                        'ProfileUrl',
                        'URL'
                    ),

                    franchiseName: getValue(
                        technician,
                        'franchiseName',
                        'FranchiseName'
                    ),

                    dob: getDateInputValue(
                        getValue(technician, 'dob', 'DOB')
                    ),

                    doj: getDateInputValue(
                        getValue(technician, 'doj', 'DOJ')
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
    }, [techId, roleId])

    // Scroll to the success message and hide it after 2 seconds.
    useEffect(() => {
        if (!message) return

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

    async function handleSubmit(event) {
        event.preventDefault()

        if (roleId !== 3) {
            setError(
                'You are not authorized to update technician details.'
            )
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

        if (!form.actionStatus) {
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
                actionStatus: form.actionStatus,
                remark: form.remark.trim(),
                insurance: form.insurance,
                profileUrl: form.profileUrl || null,
                updatedBy
            }

            const response = await updateTechnician(payload)

            if (response?.isSuccess === false) {
                throw new Error(
                    response.message ||
                    'Unable to update technician details.'
                )
            }

            setMessage(
                response?.message ||
                'Technician details updated successfully.'
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

    // Return to the original dynamic URL and pass the list state back.
    function handleCancel() {
        navigate(returnUrl, {
            state: {
                restoreListState: true,
                refreshTechnicians: true,
                listState
            }
        })
    }

    if (roleId !== 3) {
        return (
            <DashboardLayout title="Edit Technician">
                <div className="technician-edit-page">
                    <div className="technician-edit-card">
                        <div className="technician-edit-header">
                            <div></div>

                            <button
                                type="button"
                                className="btn btn-light btn-sm"
                                onClick={handleCancel}
                            >
                                Back to Technician List
                            </button>
                        </div>

                        <div className="technician-edit-body">
                            <div className="alert alert-danger" role="alert">
                                You are not authorized to edit technician
                                details.
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Edit Technician">
            <div className="technician-edit-page">
                <div className="technician-edit-card">

                    {/* Page Header */}
                    <div className="technician-edit-header">
                        <div></div>

                        <button
                            type="button"
                            className="btn btn-light btn-sm"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Back to Technician List
                        </button>
                    </div>

                    {/* Page Body */}
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

                        {!loading && (
                            <form onSubmit={handleSubmit}>

                                {/* Technician Information */}
                                <div className="technician-edit-section">
                                    <h6 className="technician-edit-section-title">
                                        Technician Information
                                    </h6>

                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Technician ID
                                            </label>
                                            <input
                                                className="form-control"
                                                value={form.techId}
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Partner ID
                                            </label>
                                            <input
                                                className="form-control"
                                                value={form.partnerId}
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Franchise Name
                                            </label>
                                            <input
                                                className="form-control"
                                                value={form.franchiseName}
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Service Type
                                            </label>
                                            <select
                                                name="type"
                                                className="form-select"
                                                value={form.type}
                                                onChange={handleChange}
                                            >
                                                <option value="">
                                                    Select Service Type
                                                </option>
                                                <option value="MJR">MJR</option>
                                                <option value="MNR">MNR</option>
                                                <option value="ACHLPR">AC</option>
                                                <option value="IND">IND</option>
                                                <option value="KA">KA</option>
                                            </select>
                                        </div>

                                        <div className="col-md-4">
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

                                        <div className="col-md-4">
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

                                        <div className="col-md-4">
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

                                        <div className="col-md-4">
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

                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Insurance
                                            </label>
                                            <select
                                                name="insurance"
                                                className="form-select"
                                                value={form.insurance}
                                                onChange={handleChange}
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

                                        <div className="col-md-4">
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
                                                <option value="1">
                                                    Single
                                                </option>
                                                <option value="2">
                                                    Married
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="technician-edit-section">
                                    <h6 className="technician-edit-section-title">
                                        Additional Information
                                    </h6>

                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Date of Joining
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={form.doj}
                                                readOnly
                                            />
                                            <small className="field-help">
                                                Display only; the current update
                                                API does not save this field.
                                            </small>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Date of Birth
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={form.dob}
                                                readOnly
                                            />
                                            <small className="field-help">
                                                Display only; the current update
                                                API does not save this field.
                                            </small>
                                        </div>

                                        <div className="col-md-8">
                                            <label className="form-label">
                                                Address
                                            </label>
                                            <textarea
                                                name="address"
                                                className="form-control"
                                                value={form.address}
                                                onChange={handleChange}
                                                maxLength={32}
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Approval and Status */}
                                <div className="technician-edit-section">
                                    <h6 className="technician-edit-section-title">
                                        Approval and Status
                                    </h6>

                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Action Status{' '}
                                                <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                name="actionStatus"
                                                className="form-select"
                                                value={form.actionStatus}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    Select Action
                                                </option>
                                                <option value="1">
                                                    Approved &amp; Activated By
                                                    Trainer
                                                </option>
                                                <option value="0">
                                                    De-Activated By Branch
                                                    Trainer
                                                </option>
                                            </select>
                                        </div>

                                        <div className="col-md-8">
                                            <label className="form-label">
                                                Remark
                                            </label>
                                            <textarea
                                                name="remark"
                                                className="form-control"
                                                value={form.remark}
                                                onChange={handleChange}
                                                maxLength={32}
                                                rows={2}
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">
                                                Existing Profile Photo URL
                                            </label>
                                            <input
                                                className="form-control"
                                                value={form.profileUrl}
                                                readOnly
                                            />
                                            <small className="field-help">
                                                Photo upload is not connected
                                                to the current update API.
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
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
                                        disabled={saving}
                                    >
                                        {saving
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </button>
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