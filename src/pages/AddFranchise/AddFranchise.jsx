
import { useEffect, useRef, useState } from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getRegions,
    getBranches
} from '../../api/reportsApi'

import {
    getFranchiseStates,
    getFranchiseCities,
    saveFranchise
} from '../../api/franchiseMasterApi'

import './AddFranchise.css'

function AddFranchise({ onBack }) {
    const successTimerRef = useRef(null)

    // LOGGED-IN USER
    // const userId = sessionStorage.getItem('userId')
    // const storedRegionCode = sessionStorage.getItem('regionCode') || ''

    const userId = sessionStorage.getItem('userId') || ''

    const storedRegionCode =
        sessionStorage.getItem('regionCode') ||
        sessionStorage.getItem('RegionCode') ||
        sessionStorage.getItem('regions') ||
        ''

    const storedBpCode =
        sessionStorage.getItem('bpCode') ||
        sessionStorage.getItem('BPCode') ||
        sessionStorage.getItem('branches') ||
        ''

    // DROPDOWN DATA
    const [regions, setRegions] = useState([])
    const [branches, setBranches] = useState([])
    const [states, setStates] = useState([])
    const [cities, setCities] = useState([])

    // SELECTED VALUES
    const [regionCode, setRegionCode] = useState('')
    const [bpCode, setBpCode] = useState('')
    const [stateCode, setStateCode] = useState('')
    const [cityCode, setCityCode] = useState('')

    // FORM DATA
    const [form, setForm] = useState({
        frCode: '',
        franchiseName: '',
        location: '',
        phone: '',
        mobile: '',
        emailID: '',
        cPerson: ''
    })

    // LOADING AND MESSAGES
    const [loadingInitialData, setLoadingInitialData] = useState(true)
    const [loadingBranches, setLoadingBranches] = useState(false)
    const [loadingCities, setLoadingCities] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // CLEAR TIMER WHEN COMPONENT UNMOUNTS
    useEffect(() => {
        return () => {
            if (successTimerRef.current !== null) {
                clearTimeout(successTimerRef.current)
                successTimerRef.current = null
            }
        }
    }, [])

    // CLEAR SUCCESS MESSAGE AND TIMER
    const clearSuccessMessage = () => {
        if (successTimerRef.current !== null) {
            clearTimeout(successTimerRef.current)
            successTimerRef.current = null
        }

        setSuccess('')
    }

    // SHOW SUCCESS MESSAGE FOR 2 SECONDS
    const showSuccessMessage = message => {
        clearSuccessMessage()
        setError('')
        setSuccess(message)

        successTimerRef.current = setTimeout(() => {
            setSuccess('')
            successTimerRef.current = null
        }, 2000)
    }

    // SHOW ERROR MESSAGE
    const showErrorMessage = message => {
        clearSuccessMessage()
        setSuccess('')
        setError(message)
    }

    // NORMALIZE ERROR/RESPONSE MESSAGE
    const getMessageText = value => {
        if (typeof value === 'string') {
            const trimmedValue = value.trim()

            if (
                trimmedValue.startsWith('{') ||
                trimmedValue.startsWith('[')
            ) {
                try {
                    return getMessageText(JSON.parse(trimmedValue))
                } catch {
                    return trimmedValue
                }
            }

            return trimmedValue
        }

        if (value && typeof value === 'object') {
            const message =
                value.message ??
                value.Message ??
                value.error ??
                value.Error ??
                value.title ??
                value.detail

            if (message !== undefined && message !== null) {
                return getMessageText(message)
            }

            if (value.errors && typeof value.errors === 'object') {
                return Object.values(value.errors)
                    .flat()
                    .filter(Boolean)
                    .join(' ')
            }
        }

        return ''
    }

    // IDENTIFY DUPLICATE FRANCHISE RESPONSE
    const isDuplicateFranchiseError = message => {
        const normalizedMessage = String(message || '').toLowerCase()

        return (
            normalizedMessage.includes('franchise could not be added') ||
            normalizedMessage.includes('franchise already exists') ||
            normalizedMessage.includes('franchise code already exists') ||
            normalizedMessage.includes('duplicate franchise') ||
            normalizedMessage.includes('duplicate key') ||
            normalizedMessage.includes('unique constraint') ||
            (
                normalizedMessage.includes('frcode') &&
                normalizedMessage.includes('already exists')
            )
        )
    }

    // LOAD REGIONS AND STATES
    useEffect(() => {
        let cancelled = false

        async function loadInitialData() {
            if (!userId) {
                showErrorMessage(
                    'User information is not available. Please log in again.'
                )
                setLoadingInitialData(false)
                return
            }

            try {
                setError('')

                const [regionData, stateData] = await Promise.all([
                    getRegions('', userId),
                    getFranchiseStates()
                ])

                if (cancelled) return

                const regionList = Array.isArray(regionData)
                    ? regionData
                    : []

                setRegions(regionList)
                setStates(Array.isArray(stateData) ? stateData : [])

                const matchingRegion = regionList.find(item =>
                    String(
                        item.regionCode ?? item.RegionCode ?? ''
                    ).trim().toLowerCase() ===
                    String(storedRegionCode).trim().toLowerCase()
                )

                if (matchingRegion) {
                    setRegionCode(
                        String(
                            matchingRegion.regionCode ??
                            matchingRegion.RegionCode
                        )
                    )
                }
            } catch (err) {
                if (!cancelled) {
                    showErrorMessage(
                        getMessageText(err) || 'Unable to load initial data.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoadingInitialData(false)
                }
            }
        }

        loadInitialData()

        return () => {
            cancelled = true
        }
    }, [userId, storedRegionCode])

    // LOAD BRANCHES WHEN REGION CHANGES AND AUTO-SELECT LOGGED-IN BRANCH
useEffect(() => {
    let cancelled = false

    async function loadBranches() {
        setBranches([])
        setBpCode('')

        if (!regionCode || !userId) {
            setLoadingBranches(false)
            return
        }

        try {
            setLoadingBranches(true)
            setError('')

            const data = await getBranches(userId, regionCode)

            if (cancelled) return

            const branchList = Array.isArray(data) ? data : []

            setBranches(branchList)

            // Automatically select the logged-in user's branch
            const matchingBranch = branchList.find(branch =>
                String(
                    branch.bpCode ?? branch.BPCode ?? ''
                ).trim().toLowerCase() ===
                String(storedBpCode).trim().toLowerCase()
            )

            if (matchingBranch) {
                setBpCode(
                    String(matchingBranch.bpCode ?? matchingBranch.BPCode)
                )
            }
        } catch (err) {
            if (!cancelled) {
                showErrorMessage(
                    getMessageText(err) || 'Unable to load branches.'
                )
            }
        } finally {
            if (!cancelled) {
                setLoadingBranches(false)
            }
        }
    }

    loadBranches()

    return () => {
        cancelled = true
    }
}, [regionCode, userId, storedBpCode])

    // LOAD CITIES WHEN STATE CHANGES
    useEffect(() => {
        let cancelled = false

        async function loadCities() {
            setCities([])
            setCityCode('')

            if (!stateCode) {
                setLoadingCities(false)
                return
            }

            try {
                setLoadingCities(true)
                setError('')

                const data = await getFranchiseCities(stateCode)

                if (cancelled) return

                setCities(Array.isArray(data) ? data : [])
            } catch (err) {
                if (!cancelled) {
                    showErrorMessage(
                        getMessageText(err) || 'Unable to load cities.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoadingCities(false)
                }
            }
        }

        loadCities()

        return () => {
            cancelled = true
        }
    }, [stateCode])

    // HANDLE FORM INPUTS
    const handleChange = event => {
        const { name, value } = event.target

        setForm(previous => ({
            ...previous,
            [name]: value
        }))

        setError('')
        clearSuccessMessage()
    }

    // VALIDATION
const validateForm = () => {
    if (!regionCode) {
        return 'Please select a region.'
    }

    if (!bpCode) {
        return 'Please select a branch.'
    }

    if (!form.frCode.trim()) {
        return 'Please enter Franchise Code.'
    }

    if (!form.franchiseName.trim()) {
        return 'Please enter Franchise Name.'
    }

    if (!form.location.trim()) {
        return 'Please enter Address.'
    }

    if (!stateCode) {
        return 'Please select State.'
    }

    if (!cityCode) {
        return 'Please select City.'
    }

    const telephone = form.phone.trim()
    const mobile = form.mobile.trim()

    if (!telephone) {
        return 'Please enter Telephone.'
    }

    if (!/^[0-9]{10}$/.test(telephone)) {
        return 'Telephone must contain exactly 10 digits.'
    }

    if (!mobile) {
        return 'Please enter Mobile No.'
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
        return 'Mobile No. must contain exactly 10 digits.'
    }

    if (telephone === mobile) {
        return 'Telephone and Mobile No. cannot be the same.'
    }

    if (!form.emailID.trim()) {
        return 'Please enter Email ID.'
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(form.emailID.trim())) {
        return 'Please enter a valid Email ID.'
    }

    if (!form.cPerson.trim()) {
        return 'Please enter Contact Person.'
    }

    if (!userId || !Number.isInteger(Number(userId))) {
        return 'Logged-in user ID is missing or invalid. Please log in again.'
    }

    return ''
}

    // SAVE FRANCHISE
    const handleSubmit = async event => {
        event.preventDefault()

        setError('')
        clearSuccessMessage()

        const validationMessage = validateForm()

        if (validationMessage) {
            showErrorMessage(validationMessage)
            return
        }

        const request = {
            frCode: form.frCode.trim(),
            franchiseName: form.franchiseName.trim().toLowerCase(),
            bpCode,
            location: form.location.trim().toLowerCase(),
            stateCode,
            cityCode,
            mobile: form.mobile.trim(),
            phone: form.phone.trim(),
            emailID: form.emailID.trim().toLowerCase(),
            cPerson: form.cPerson.trim().toLowerCase(),
            createdBy: Number(userId)
        }

        try {
            setSaving(true)

            const result = await saveFranchise(request)
            const responseMessage = getMessageText(result)

            if (
                result?.success === false ||
                result?.Success === false ||
                result?.isSuccess === false ||
                result?.IsSuccess === false ||
                isDuplicateFranchiseError(responseMessage)
            ) {
                if (isDuplicateFranchiseError(responseMessage)) {
                    showErrorMessage(
                        'This franchise code already exists. Please enter a different franchise code.'
                    )
                } else {
                    showErrorMessage(
                        responseMessage || 'Unable to save franchise.'
                    )
                }

                return
            }

            showSuccessMessage(
                responseMessage ||
                `Franchise (${form.frCode.trim()}) added successfully.`
            )

            setForm({
                frCode: '',
                franchiseName: '',
                location: '',
                phone: '',
                mobile: '',
                emailID: '',
                cPerson: ''
            })

            setStateCode('')
            setCityCode('')
            setCities([])
        } catch (err) {
            const errorMessage = getMessageText(err)

            if (isDuplicateFranchiseError(errorMessage)) {
                showErrorMessage(
                    'This franchise code already exists. Please enter a different franchise code.'
                )
            } else {
                showErrorMessage(
                    errorMessage || 'Unable to save franchise.'
                )
            }
        } finally {
            setSaving(false)
        }
    }

    // UI
    return (
        <DashboardLayout title="Add Franchise">
            <div className="add-franchise-page">

                {/* BACK TO FRANCHISE LIST - NO ROUTE NAVIGATION */}
                <div className="add-franchise-actions">
    <button
        type="button"
        className="af-button af-button-secondary"
        onClick={() => {
            if (typeof onBack === 'function') {
                onBack()
            } else {
                console.error(
                    'onBack callback is missing. AddFranchise must be opened from FranchiseList.'
                )
            }
        }}
    >
        Back To Franchise List
    </button>
</div>

                {error && (
                    <div
                        className="af-alert af-alert-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        className="af-alert af-alert-success"
                        role="status"
                    >
                        {success}
                    </div>
                )}

                {loadingInitialData ? (
                    <div className="af-loading">
                        Loading form data...
                    </div>
                ) : (
                    <section className="af-card">
                        <form onSubmit={handleSubmit} noValidate>

                            {/* ROW 1: FOUR FIELDS */}
                            <div className="af-form-row af-form-row-four">
                                <div className="af-field">
                                    <label htmlFor="regionCode">
                                        Region <span>*</span>
                                    </label>

                                    <select
                                        id="regionCode"
                                        value={regionCode}
                                        onChange={event => {
                                            setRegionCode(event.target.value)
                                            setError('')
                                            clearSuccessMessage()
                                        }}
                                        disabled={true}
                                        required
                                    >
                                        <option value="">Select Region</option>

                                        {regions.map((region, index) => {
                                            const code =
                                                region.regionCode ??
                                                region.RegionCode

                                            const name =
                                                region.regionName ??
                                                region.RegionName

                                            return (
                                                <option
                                                    key={code ?? index}
                                                    value={code}
                                                >
                                                    {name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                <div className="af-field">
                                    <label htmlFor="bpCode">
                                        Branch Name <span>*</span>
                                    </label>

                                    <select
                                        id="bpCode"
                                        value={bpCode}
                                        onChange={event => {
                                            setBpCode(event.target.value)
                                            setError('')
                                            clearSuccessMessage()
                                        }}
                                        disabled={
                                            true ||
                                            !regionCode ||
                                            loadingBranches ||
                                            branches.length === 0
                                        }
                                        required
                                    >
                                        <option value="">
                                            {!regionCode
                                                ? 'Select Region First'
                                                : loadingBranches
                                                    ? 'Loading Branches...'
                                                    : branches.length === 0
                                                        ? 'No Branches Available'
                                                        : 'Select Branch'}
                                        </option>

                                        {branches.map((branch, index) => {
                                            const code =
                                                branch.bpCode ??
                                                branch.BPCode

                                            const name =
                                                branch.branchName ??
                                                branch.BranchName

                                            return (
                                                <option
                                                    key={code ?? index}
                                                    value={code}
                                                >
                                                    {name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                <div className="af-field">
                                    <label htmlFor="frCode">
                                        Franchise Code (ex-300xxxx) <span>*</span>
                                    </label>

                                    <input
                                        id="frCode"
                                        name="frCode"
                                        value={form.frCode}
                                        onChange={handleChange}
                                        maxLength={15}
                                        required
                                    />
                                </div>

                                <div className="af-field">
                                    <label htmlFor="franchiseName">
                                        Franchise Name <span>*</span>
                                    </label>

                                    <input
                                        id="franchiseName"
                                        name="franchiseName"
                                        value={form.franchiseName}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                    />
                                </div>
                            </div>

                            {/* ROW 2: ADDRESS, STATE, CITY */}
                            <div className="af-form-row af-form-row-three">
                                <div className="af-field">
                                    <label htmlFor="location">
                                        Address <span>*</span>
                                    </label>

                                    <input
                                        id="location"
                                        name="location"
                                        type="text"
                                        value={form.location}
                                        onChange={handleChange}
                                        maxLength={500}
                                        required
                                    />
                                </div>

                                <div className="af-field">
                                    <label htmlFor="stateCode">
                                        State <span>*</span>
                                    </label>

                                    <select
                                        id="stateCode"
                                        value={stateCode}
                                        onChange={event => {
                                            setStateCode(event.target.value)
                                            setError('')
                                            clearSuccessMessage()
                                        }}
                                        required
                                    >
                                        <option value="">Select State</option>

                                        {states.map((state, index) => {
                                            const code =
                                                state.stateCode ??
                                                state.StateCode

                                            const name =
                                                state.stateName ??
                                                state.StateName

                                            return (
                                                <option
                                                    key={code ?? index}
                                                    value={code}
                                                >
                                                    {name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                <div className="af-field">
                                    <label htmlFor="cityCode">
                                        City <span>*</span>
                                    </label>

                                    <select
                                        id="cityCode"
                                        value={cityCode}
                                        onChange={event => {
                                            setCityCode(event.target.value)
                                            setError('')
                                            clearSuccessMessage()
                                        }}
                                        disabled={
                                            !stateCode ||
                                            loadingCities ||
                                            cities.length === 0
                                        }
                                        required
                                    >
                                        <option value="">
                                            {!stateCode
                                                ? 'Select State First'
                                                : loadingCities
                                                    ? 'Loading Cities...'
                                                    : cities.length === 0
                                                        ? 'No Cities Available'
                                                        : 'Select City'}
                                        </option>

                                        {cities.map((city, index) => {
                                            const code =
                                                city.cityCode ??
                                                city.CityCode

                                            const name =
                                                city.cityName ??
                                                city.CityName

                                            return (
                                                <option
                                                    key={code ?? index}
                                                    value={code}
                                                >
                                                    {name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>

                            {/* ROW 3: FOUR FIELDS */}
                            <div className="af-form-row af-form-row-four">
                                <div className="af-field">
                                    <label htmlFor="phone">
                                        Telephone <span>*</span>
                                    </label>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        value={form.phone}
                                        onChange={handleChange}
                                        maxLength={10}
                                        pattern="[0-9]{10}"
                                        title="Enter exactly 10 digits."
                                        required
                                    />
                                </div>

                                <div className="af-field">
                                    <label htmlFor="mobile">
                                        Mobile No. <span>*</span>
                                    </label>

                                    <input
                                        id="mobile"
                                        name="mobile"
                                        type="tel"
                                        inputMode="numeric"
                                        value={form.mobile}
                                        onChange={handleChange}
                                        maxLength={10}
                                        pattern="[0-9]{10}"
                                        title="Enter exactly 10 digits."
                                        required
                                    />
                                </div>

                                <div className="af-field">
                                    <label htmlFor="emailID">
                                        Email ID <span>*</span>
                                    </label>

                                    <input
                                        id="emailID"
                                        name="emailID"
                                        type="email"
                                        value={form.emailID}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="af-field">
                                    <label htmlFor="cPerson">
                                        Contact Person <span>*</span>
                                    </label>

                                    <input
                                        id="cPerson"
                                        name="cPerson"
                                        value={form.cPerson}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                    />
                                </div>
                            </div>

                            {/* SAVE BUTTON */}
                            <div className="af-form-actions">
                                <button
                                    type="submit"
                                    className="af-button af-button-primary"
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'Saving...'
                                        : 'Save New Franchise'}
                                </button>
                            </div>

                        </form>
                    </section>
                )}
            </div>
        </DashboardLayout>
    )
}

export default AddFranchise
