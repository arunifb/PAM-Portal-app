import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import { getFranchises } from '../../api/reportsApi'
import { addTechnician } from '../../api/technicianApi'
import './TechnicianAdd.css'

const SERVICE_TYPES = [
    { label: 'MJR', value: 'MJR' },
    { label: 'MNR', value: 'MNR' },
    { label: 'AC', value: 'ACHLPR' },
    { label: 'IND', value: 'IND' },
    { label: 'KA', value: 'KA' }
]

const MARITAL_STATUSES = [
    { label: 'Single', value: '1' },
    { label: 'Married', value: '2' },
    { label: 'Divorced', value: '3' }
]

function getSessionValue(...keys) {
    for (const key of keys) {
        const value = sessionStorage.getItem(key)

        if (value !== null && value !== '') {
            return value
        }
    }

    return ''
}

function getArrayFromResponse(response) {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.result)) return response.result
    if (Array.isArray(response?.items)) return response.items

    return []
}

function getFranchiseCode(item) {
    return String(
        item?.frCode ??
        item?.FrCode ??
        item?.franchiseCode ??
        item?.FranchiseCode ??
        ''
    )
}

function getFranchiseName(item) {
    return String(
        item?.franchiseName ??
        item?.FranchiseName ??
        item?.Franchisename ??
        ''
    )
}

function getErrorMessage(error) {
    return error?.message || 'Unable to complete the request.'
}

function TechnicianAdd({ onBack, listState }) {
    const roleId = Number(getSessionValue('roleId', 'RoleID') || 0)
    const loginId = getSessionValue('loginId', 'LoginID')
    const bpCode = getSessionValue('bpCode', 'BPCode')
    const userId = getSessionValue('userId', 'UserID')

    const [franchises, setFranchises] = useState([])
    const [franchiseCode, setFranchiseCode] = useState('')
    const [franchiseLoading, setFranchiseLoading] = useState(true)

    const [serviceType, setServiceType] = useState('')
    const [name, setName] = useState('')
    const [mobileNo, setMobileNo] = useState('')
    const [insurance, setInsurance] = useState('')
    const [qualification, setQualification] = useState('')
    const [doj, setDoj] = useState('')
    const [dob, setDob] = useState('')
    const [maritalStatus, setMaritalStatus] = useState('')
    const [emailId, setEmailId] = useState('')
    const [address, setAddress] = useState('')
    const [remark, setRemark] = useState('')
    const [photo, setPhoto] = useState(null)
    const [photoPreview, setPhotoPreview] = useState('')

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [saving, setSaving] = useState(false)
    const [hasSaved, setHasSaved] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function loadFranchises() {
            setFranchiseLoading(true)
            setError('')

            try {
                const response = await getFranchises(
                    roleId,
                    bpCode,
                    loginId
                )

                if (cancelled) return

                const list = getArrayFromResponse(response)
                setFranchises(list)

                const matchingFranchise = list.find(
                    item =>
                        getFranchiseCode(item).toLowerCase() ===
                        loginId.toLowerCase()
                )

                const selectedFranchise = matchingFranchise || list[0]

                setFranchiseCode(
                    selectedFranchise
                        ? getFranchiseCode(selectedFranchise)
                        : ''
                )
            } catch (err) {
                if (!cancelled) {
                    setError(getErrorMessage(err))
                    setFranchises([])
                    setFranchiseCode('')
                }
            } finally {
                if (!cancelled) {
                    setFranchiseLoading(false)
                }
            }
        }

        if (roleId !== 5) {
            setError('You are not authorized to add a technician.')
            setFranchiseLoading(false)
            return
        }

        if (!bpCode || !loginId) {
            setError(
                'Your login details are incomplete. Please log in again.'
            )
            setFranchiseLoading(false)
            return
        }

        loadFranchises()

        return () => {
            cancelled = true
        }
    }, [roleId, bpCode, loginId])

    useEffect(() => {
        if (!photo) {
            setPhotoPreview('')
            return
        }

        const previewUrl = URL.createObjectURL(photo)
        setPhotoPreview(previewUrl)

        return () => URL.revokeObjectURL(previewUrl)
    }, [photo])

    function handlePhotoChange(event) {
        const selectedFile = event.target.files?.[0]

        setError('')
        setPhoto(null)

        if (!selectedFile) return

        const extension = selectedFile.name
            .split('.')
            .pop()
            .toLowerCase()

        if (!['jpg', 'jpeg'].includes(extension)) {
            setError('Please upload a JPG or JPEG photo.')
            event.target.value = ''
            return
        }

        if (!selectedFile.type.startsWith('image/')) {
            setError('Please select a valid image file.')
            event.target.value = ''
            return
        }

        setPhoto(selectedFile)
    }

    function validateForm() {
        if (roleId !== 5) {
            return 'You are not authorized to add a technician.'
        }

        if (!franchiseCode) {
            return 'Franchise is required. Please check your franchise access.'
        }

        if (!serviceType) {
            return 'Please select Service Type.'
        }

        if (!name.trim()) {
            return 'Name is required.'
        }

        if (name.trim().length > 16) {
            return 'Name cannot exceed 16 characters.'
        }

        if (!/^[1-9][0-9]{9}$/.test(mobileNo.trim())) {
            return 'Enter a valid 10-digit mobile number.'
        }

        if (!insurance) {
            return 'Please select ICICI Lombard Insurance status.'
        }

        if (qualification.length > 10) {
            return 'Qualification cannot exceed 10 characters.'
        }

        if (!doj) {
            return 'Date of Joining is required.'
        }

        if (!dob) {
            return 'Date of Birth is required.'
        }

        if (!maritalStatus) {
            return 'Please select Marital Status.'
        }

        if (!emailId.trim()) {
            return 'Email is required.'
        }

        if (emailId.trim().length > 32) {
            return 'Email cannot exceed 32 characters.'
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,4}$/.test(emailId.trim())) {
            return 'Enter a valid email address.'
        }

        if (!address.trim()) {
            return 'Permanent Address is required.'
        }

        if (address.trim().length > 32) {
            return 'Permanent Address cannot exceed 32 characters.'
        }

        if (!remark.trim()) {
            return 'Remark is required.'
        }

        if (remark.trim().length > 32) {
            return 'Remark cannot exceed 32 characters.'
        }

        if (!photo) {
            return 'Please upload a photo for the digital ID card.'
        }

        if (!userId || !Number.isInteger(Number(userId))) {
            return 'Your user ID is missing. Please log in again.'
        }

        return ''
    }

    async function handleSubmit(event) {
        event.preventDefault()

        setError('')
        setSuccess('')

        const validationMessage = validateForm()

        if (validationMessage) {
            setError(validationMessage)
            return
        }

        const formData = new FormData()

        formData.append('FranchiseCode', franchiseCode)
        formData.append('CreatedBy', String(Number(userId)))
        formData.append('Type', serviceType)
        formData.append('Name', name.trim())
        formData.append('MobileNo', mobileNo.trim())
        formData.append('Qualification', qualification.trim())
        formData.append('DOB', dob)
        formData.append('DOJ', doj)
        formData.append('Address', address.trim())
        formData.append('EmailId', emailId.trim())
        formData.append('Insurance', insurance)
        formData.append('Remark', remark.trim())
        formData.append('Source', 'PRTL')
        formData.append('Photo', photo)

        setSaving(true)

        try {
            const response = await addTechnician(formData)

            setSuccess(response?.message || 'Saved successfully.')
            setHasSaved(true)
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setSaving(false)
        }
    }

    function handleBack() {
        if (saving) return

        onBack?.({
            refreshTechnicians: hasSaved,
            listState
        })
    }

    return (
        <DashboardLayout title="Add Technician">
            <div className="technician-add-page">
                <div className="technician-add-header">
                    <h2>Add Technician</h2>

                    <button
                        type="button"
                        className="technician-add-back-button"
                        onClick={handleBack}
                        disabled={saving}
                    >
                        Back
                    </button>
                </div>

                {error && (
                    <div className="technician-alert technician-alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="technician-alert technician-alert-success">
                        {success}
                    </div>
                )}

                <form
                    className="technician-add-form"
                    onSubmit={handleSubmit}
                >
                    <div className="technician-add-grid">
                        <div className="technician-add-field">
                            <label>
                                Service Type <span>*</span>
                            </label>

                            <select
                                value={serviceType}
                                onChange={event => setServiceType(event.target.value)}
                                required
                            >
                                <option value="">Select Service Type</option>

                                {SERVICE_TYPES.map(item => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="technician-add-field">
                            <label>
                                Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={event => setName(event.target.value)}
                                maxLength={16}
                                required
                            />
                        </div>

                        <div className="technician-add-field">
                            <label>
                                Mobile No <span>*</span>
                            </label>

                            <input
                                type="tel"
                                value={mobileNo}
                                onChange={event =>
                                    setMobileNo(
                                        event.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 10)
                                    )
                                }
                                maxLength={10}
                                inputMode="numeric"
                                required
                            />
                        </div>

                        <div className="technician-add-field">
                            <label>
                                ICICI Lombard Insurance <span>*</span>
                            </label>

                            <select
                                value={insurance}
                                onChange={event => setInsurance(event.target.value)}
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="1">Pending</option>
                                <option value="2">Completed</option>
                            </select>
                        </div>

                        <div className="technician-add-field">
                            <label>Franchisee Name</label>

                            <select value={franchiseCode} disabled>
                                <option value="">
                                    {franchiseLoading
                                        ? 'Loading franchise...'
                                        : 'No franchise available'}
                                </option>

                                {franchises.map((item, index) => (
                                    <option
                                        key={`${getFranchiseCode(item)}-${index}`}
                                        value={getFranchiseCode(item)}
                                    >
                                        {getFranchiseName(item) ||
                                            getFranchiseCode(item)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="technician-add-field">
                            <label>Qualification</label>

                            <input
                                type="text"
                                value={qualification}
                                onChange={event => setQualification(event.target.value)}
                                maxLength={10}
                            />
                        </div>

                        <div className="technician-add-field">
                            <label>
                                Date of Joining <span>*</span>
                            </label>

                            <input
                                type="date"
                                value={doj}
                                onChange={event => setDoj(event.target.value)}
                                required
                            />
                        </div>

                        <div className="technician-add-field">
                            <label>
                                Date of Birth <span>*</span>
                            </label>

                            <input
                                type="date"
                                value={dob}
                                onChange={event => setDob(event.target.value)}
                                max={new Date().toISOString().slice(0, 10)}
                                required
                            />
                        </div>

                        <div className="technician-add-field">
                            <label>
                                Marital Status <span>*</span>
                            </label>

                            <select
                                value={maritalStatus}
                                onChange={event => setMaritalStatus(event.target.value)}
                                required
                            >
                                <option value="">Select Marital Status</option>

                                {MARITAL_STATUSES.map(item => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="technician-add-field">
                            <label>
                                Email <span>*</span>
                            </label>

                            <input
                                type="email"
                                value={emailId}
                                onChange={event => setEmailId(event.target.value)}
                                maxLength={32}
                                required
                            />
                        </div>

                        <div className="technician-add-field">
                            <label>
                                Permanent Address <span>*</span>
                            </label>

                            <input
                                type="text"
                                value={address}
                                onChange={event => setAddress(event.target.value)}
                                maxLength={32}
                                required
                            />
                        </div>

                        <div className="technician-add-field">
                            <label>
                                Remark <span>*</span>
                            </label>

                            <input
                                type="text"
                                value={remark}
                                onChange={event => setRemark(event.target.value)}
                                maxLength={32}
                                required
                            />
                        </div>

                        <div className="technician-add-field technician-add-photo-field">
                            <label>
                                SA Photo for Digital ID Card <span>*</span>
                            </label>

                            <input
                                type="file"
                                accept=".jpg,.jpeg,image/jpeg"
                                onChange={handlePhotoChange}
                                required
                            />

                            <small>Only JPG/JPEG files are allowed.</small>

                            {photoPreview && (
                                <img
                                    className="technician-add-photo-preview"
                                    src={photoPreview}
                                    alt="Technician preview"
                                />
                            )}
                        </div>
                    </div>

                    <div className="technician-add-form-actions">
                        <button
                            type="button"
                            className="technician-add-cancel-button"
                            onClick={handleBack}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="technician-add-save-button"
                            disabled={saving || franchiseLoading}
                        >
                            {saving ? 'Submitting...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}

export default TechnicianAdd