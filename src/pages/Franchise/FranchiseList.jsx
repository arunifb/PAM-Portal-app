import { useEffect, useState } from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getRegions,
    getBranches
} from '../../api/reportsApi'

import {
    getFranchiseStates,
    getFranchiseCities,
    getFranchiseList,
    searchFranchises
} from '../../api/franchiseApi'

import AddFranchise from '../AddFranchise/AddFranchise'

import './FranchiseList.css'

const initialFilters = {
    RegionCode: '',
    BPCode: '',
    FrCode: '',
    StateCode: '',
    CityCode: '',
    FranchiseName: '',
    Mobile: '',
    EmailID: '',
    Active: ''
}

function getValue(item, ...keys) {
    for (const key of keys) {
        if (item?.[key] !== undefined && item?.[key] !== null) {
            return item[key]
        }
    }

    return ''
}

// Get the creation date as a timestamp for sorting.
function getCreatedDateTimestamp(franchise) {
    const value = getValue(
        franchise,
        'createdOn',
        'CreatedOn',
        'createdDate',
        'CreatedDate',
        'createdAt',
        'CreatedAt',
        'creationDate',
        'CreationDate'
    )

    if (!value) return 0

    const text = String(value).trim()

    // Handle DD-MM-YYYY and DD-MM-YYYY HH:mm:ss.
    const match = text.match(
        /^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/
    )

    if (match) {
        const [
            ,
            day,
            month,
            year,
            hours = '0',
            minutes = '0',
            seconds = '0'
        ] = match

        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hours),
            Number(minutes),
            Number(seconds)
        )

        // Reject invalid date values.
        if (
            date.getFullYear() !== Number(year) ||
            date.getMonth() !== Number(month) - 1 ||
            date.getDate() !== Number(day)
        ) {
            return 0
        }

        return date.getTime()
    }

    // Handle standard ISO date formats.
    const timestamp = new Date(text).getTime()

    return Number.isNaN(timestamp) ? 0 : timestamp
}

// Sort newest first and return no more than 40 records.
function getLatest40Franchises(data) {
    return (Array.isArray(data) ? [...data] : [])
        .sort(
            (a, b) =>
                getCreatedDateTimestamp(b) -
                getCreatedDateTimestamp(a)
        )
        .slice(0, 40)
}

function FranchiseList({ onAddFranchise }) {
    const userId = sessionStorage.getItem('userId') || ''

    const storedRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const sessionBpCode =
        sessionStorage.getItem('bpCode') ||
        sessionStorage.getItem('BPCode') ||
        ''

    // Switch between list and add views without changing the URL.
    const [activePage, setActivePage] = useState('list')

    const [filters, setFilters] = useState({ ...initialFilters })
    const [appliedFilters, setAppliedFilters] = useState({
        ...initialFilters
    })

    const [regions, setRegions] = useState([])
    const [branches, setBranches] = useState([])
    const [states, setStates] = useState([])
    const [cities, setCities] = useState([])
    const [franchises, setFranchises] = useState([])

    const [loading, setLoading] = useState(false)
    const [loadingBranches, setLoadingBranches] = useState(false)
    const [loadingCities, setLoadingCities] = useState(false)

    const [error, setError] = useState('')

    function handleAddFranchise() {
        setError('')

        if (onAddFranchise) {
            onAddFranchise()
            return
        }

        setActivePage('add')
    }

    function handleBackToFranchiseList() {
        setActivePage('list')
    }

    // Load regions, states, and the initial franchise list.
    useEffect(() => {
        let cancelled = false

        async function loadInitialData() {
            setLoading(true)
            setError('')

            try {
                const [regionData, stateData] = await Promise.all([
                    userId
                        ? getRegions('', userId)
                        : Promise.resolve([]),
                    getFranchiseStates()
                ])

                if (cancelled) return

                const regionList = Array.isArray(regionData)
                    ? regionData
                    : []

                setRegions(regionList)
                setStates(Array.isArray(stateData) ? stateData : [])

                const matchingRegion = regionList.find(region =>
                    String(
                        getValue(region, 'regionCode', 'RegionCode')
                    ) === String(storedRegionCode)
                )

                if (matchingRegion) {
                    setFilters(previous => ({
                        ...previous,
                        RegionCode: String(
                            getValue(
                                matchingRegion,
                                'regionCode',
                                'RegionCode'
                            )
                        )
                    }))
                }

                if (sessionBpCode) {
                    const franchiseData =
                        await getFranchiseList(sessionBpCode)

                    if (cancelled) return

                    // Initial page load: latest 40 records.
                    setFranchises(
                        getLatest40Franchises(franchiseData)
                    )
                } else {
                    setError(
                        'Branch code was not found in session storage.'
                    )
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message || 'Unable to load franchise data.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadInitialData()

        return () => {
            cancelled = true
        }
    }, [userId, storedRegionCode, sessionBpCode])

    // Load branches when the selected region changes.
    useEffect(() => {
        let cancelled = false

        async function loadBranchData() {
            setBranches([])

            if (!filters.RegionCode || !userId) {
                return
            }

            try {
                setLoadingBranches(true)

                const data = await getBranches(
                    userId,
                    filters.RegionCode
                )

                if (cancelled) return

                const branchList = Array.isArray(data) ? data : []

                setBranches(branchList)

                if (
                    String(filters.RegionCode) === String(storedRegionCode) &&
                    sessionBpCode
                ) {
                    const matchingBranch = branchList.find(branch =>
                        String(
                            getValue(branch, 'bpCode', 'BPCode')
                        ) === String(sessionBpCode)
                    )

                    if (matchingBranch) {
                        setFilters(previous => ({
                            ...previous,
                            BPCode: String(
                                getValue(
                                    matchingBranch,
                                    'bpCode',
                                    'BPCode'
                                )
                            )
                        }))
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message || 'Unable to load branches.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoadingBranches(false)
                }
            }
        }

        loadBranchData()

        return () => {
            cancelled = true
        }
    }, [filters.RegionCode, userId, storedRegionCode, sessionBpCode])

    // Load cities when the selected state changes.
    useEffect(() => {
        let cancelled = false

        async function loadCityData() {
            setCities([])

            if (!filters.StateCode) {
                return
            }

            try {
                setLoadingCities(true)

                const data = await getFranchiseCities(filters.StateCode)

                if (cancelled) return

                setCities(Array.isArray(data) ? data : [])
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message || 'Unable to load cities.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoadingCities(false)
                }
            }
        }

        loadCityData()

        return () => {
            cancelled = true
        }
    }, [filters.StateCode])

    function handleChange(event) {
        const { name, value } = event.target

        setFilters(previous => ({
            ...previous,
            [name]: value,
            ...(name === 'RegionCode' ? { BPCode: '' } : {}),
            ...(name === 'StateCode' ? { CityCode: '' } : {})
        }))

        setError('')
    }

    // Search using the dedicated backend POST API.
    async function handleSearch(event) {
        event.preventDefault()
        setError('')

        const searchBpCode = filters.BPCode || sessionBpCode

        setLoading(true)

        try {
            const request = {
                FrCode: filters.FrCode.trim(),
                FranchiseName: filters.FranchiseName.trim(),
                BPCode: filters.BPCode || sessionBpCode,
                StateCode: filters.StateCode,
                CityCode: filters.CityCode,
                Mobile: filters.Mobile.trim(),
                EmailID: filters.EmailID.trim(),
                Active: filters.Active === '' ? null : filters.Active
            }

            const response = await searchFranchises(request)

            console.log('Franchise search API response:', response)
            console.log(
                'First franchise record:',
                response?.data?.[0]
            )

            // Search endpoint returns its filtered data.
            const result = Array.isArray(response?.data)
                ? response.data
                : []

            setFranchises(result)
            setAppliedFilters({
                ...filters,
                BPCode: searchBpCode
            })

            if (result.length === 0) {
                setError('No franchise records found.')
            }
        } catch (err) {
            setFranchises([])
            setError(
                err.message || 'Unable to search franchises.'
            )
        } finally {
            setLoading(false)
        }
    }

    // Reset filters and reload the latest 40 franchise records.
    async function handleReset() {
        setFilters({ ...initialFilters })
        setAppliedFilters({ ...initialFilters })
        setCities([])
        setBranches([])
        setError('')

        if (!sessionBpCode) {
            setFranchises([])
            setError(
                'Branch code was not found in session storage.'
            )
            return
        }

        setLoading(true)

        try {
            const data = await getFranchiseList(sessionBpCode)

            setFranchises(getLatest40Franchises(data))
        } catch (err) {
            setFranchises([])
            setError(
                err.message || 'Unable to reload franchises.'
            )
        } finally {
            setLoading(false)
        }
    }

    function formatDate(value) {
        if (!value) return '-'

        const dateValue = String(value).trim()

        if (!dateValue) return '-'

        // Handle API format: DD-MM-YYYY HH:mm:ss.
        const match = dateValue.match(
            /^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/
        )

        let date

        if (match) {
            const [
                ,
                day,
                month,
                year,
                hours = '0',
                minutes = '0',
                seconds = '0'
            ] = match

            date = new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hours),
                Number(minutes),
                Number(seconds)
            )

            if (
                date.getFullYear() !== Number(year) ||
                date.getMonth() !== Number(month) - 1 ||
                date.getDate() !== Number(day)
            ) {
                return '-'
            }
        } else {
            // Handle standard ISO date formats.
            date = new Date(dateValue)
        }

        if (Number.isNaN(date.getTime())) return '-'

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    // Search results are already filtered by the backend.
    const filteredFranchises = franchises

    // Show AddFranchise without navigating to another URL.
    if (activePage === 'add') {
        return (
            <AddFranchise
                onBack={handleBackToFranchiseList}
            />
        )
    }

    return (
        <DashboardLayout title="Franchises">
            <div className="franchise-page">
                <div className="franchise-header">
                    <div />

                    <button
                        type="button"
                        className="franchise-btn franchise-btn-primary"
                        onClick={handleAddFranchise}
                    >
                        Add New Franchise
                    </button>
                </div>

                {error && (
                    <div
                        className="franchise-alert franchise-alert-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <section className="franchise-card">
                    <form onSubmit={handleSearch}>
                        <div className="franchise-filter-grid franchise-filter-row-one">
                            <label>
                                Region
                                <select
                                    name="RegionCode"
                                    value={filters.RegionCode}
                                    onChange={handleChange}
                                >
                                    <option value="">All Regions</option>

                                    {regions.map((region, index) => {
                                        const code = getValue(
                                            region,
                                            'regionCode',
                                            'RegionCode'
                                        )

                                        const name = getValue(
                                            region,
                                            'regionName',
                                            'RegionName'
                                        )

                                        return (
                                            <option
                                                key={code || `region-${index}`}
                                                value={code}
                                            >
                                                {name}
                                            </option>
                                        )
                                    })}
                                </select>
                            </label>

                            <label>
                                Branch
                                <select
                                    name="BPCode"
                                    value={filters.BPCode}
                                    onChange={handleChange}
                                    disabled={
                                        !filters.RegionCode ||
                                        loadingBranches ||
                                        branches.length === 0
                                    }
                                >
                                    <option value="">
                                        {!filters.RegionCode
                                            ? 'Select Region First'
                                            : loadingBranches
                                                ? 'Loading Branches...'
                                                : branches.length === 0
                                                    ? 'No Branches Available'
                                                    : 'Select Branch'}
                                    </option>

                                    {branches.map((branch, index) => {
                                        const code = getValue(
                                            branch,
                                            'bpCode',
                                            'BPCode'
                                        )

                                        const name = getValue(
                                            branch,
                                            'branchName',
                                            'BranchName'
                                        )

                                        return (
                                            <option
                                                key={code || `branch-${index}`}
                                                value={code}
                                            >
                                                {name}
                                            </option>
                                        )
                                    })}
                                </select>
                            </label>

                            <label>
                                Franchise Code
                                <input
                                    name="FrCode"
                                    value={filters.FrCode}
                                    onChange={handleChange}
                                    placeholder="Enter franchise code"
                                />
                            </label>

                            <label>
                                State
                                <select
                                    name="StateCode"
                                    value={filters.StateCode}
                                    onChange={handleChange}
                                >
                                    <option value="">All States</option>

                                    {states.map((state, index) => {
                                        const code = getValue(
                                            state,
                                            'stateCode',
                                            'StateCode'
                                        )

                                        const name = getValue(
                                            state,
                                            'stateName',
                                            'StateName'
                                        )

                                        return (
                                            <option
                                                key={code || `state-${index}`}
                                                value={code}
                                            >
                                                {name}
                                            </option>
                                        )
                                    })}
                                </select>
                            </label>

                            <label>
                                City
                                <select
                                    name="CityCode"
                                    value={filters.CityCode}
                                    onChange={handleChange}
                                    disabled={
                                        !filters.StateCode ||
                                        loadingCities
                                    }
                                >
                                    <option value="">
                                        {!filters.StateCode
                                            ? 'Select State First'
                                            : loadingCities
                                                ? 'Loading Cities...'
                                                : 'All Cities'}
                                    </option>

                                    {cities.map((city, index) => {
                                        const code = getValue(
                                            city,
                                            'cityCode',
                                            'CityCode'
                                        )

                                        const name = getValue(
                                            city,
                                            'cityName',
                                            'CityName'
                                        )

                                        return (
                                            <option
                                                key={code || `city-${index}`}
                                                value={code}
                                            >
                                                {name}
                                            </option>
                                        )
                                    })}
                                </select>
                            </label>

                            <label>
                                Franchise Name
                                <input
                                    name="FranchiseName"
                                    value={filters.FranchiseName}
                                    onChange={handleChange}
                                    placeholder="Enter franchise name"
                                />
                            </label>
                        </div>

                        <div className="franchise-filter-grid franchise-filter-row-two">
                            <label>
                                Mobile No.
                                <input
                                    type="tel"
                                    name="Mobile"
                                    value={filters.Mobile}
                                    onChange={handleChange}
                                    maxLength={15}
                                    placeholder="Enter mobile number"
                                />
                            </label>

                            <label>
                                Email ID
                                <input
                                    type="email"
                                    name="EmailID"
                                    value={filters.EmailID}
                                    onChange={handleChange}
                                    placeholder="Enter email ID"
                                />
                            </label>

                            <label>
                                Active
                                <select
                                    name="Active"
                                    value={filters.Active}
                                    onChange={handleChange}
                                >
                                    <option value="">All</option>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </label>

                            <div className="franchise-actions">
                                <button
                                    type="submit"
                                    className="franchise-btn franchise-btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </button>

                                <button
                                    type="button"
                                    className="franchise-btn franchise-btn-secondary"
                                    onClick={handleReset}
                                    disabled={loading}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                <section className="franchise-card">
                    <div className="franchise-list-header">
                        <h3>Franchise List</h3>
                        <span>
                            {filteredFranchises.length} record(s)
                        </span>
                    </div>

                    <div className="franchise-table-wrapper">
                        <table className="franchise-table">
                            <thead>
                                <tr>
                                    <th>SNo.</th>
                                    <th>Franchise Name</th>
                                    <th>Mobile No.</th>
                                    <th>Email ID</th>
                                    <th>Location</th>
                                    <th>Created Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="franchise-empty"
                                        >
                                            Loading franchises...
                                        </td>
                                    </tr>
                                ) : filteredFranchises.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="franchise-empty"
                                        >
                                            No franchise records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFranchises.map((franchise, index) => {
                                        const name = getValue(
                                            franchise,
                                            'franchiseName',
                                            'FranchiseName'
                                        ) || '-'

                                        const mobile = getValue(
                                        franchise,
                                        'mobileno',
                                        'mobileNo',
                                        'MobileNo',
                                        'mobile',
                                        'Mobile',
                                        'mobileNumber',
                                        'MobileNumber',
                                        'phoneNo',
                                        'PhoneNo',
                                        'phoneNumber',
                                        'PhoneNumber',
                                        'contactNumber',
                                        'ContactNumber'
                                    ) || '-'

                                        const email = getValue(
                                            franchise,
                                            'email',
                                            'Email',
                                            'emailId',
                                            'EmailId',
                                            'emailID',
                                            'EmailID',
                                            'emailAddress',
                                            'EmailAddress'
                                        ) || '-'

                                        const location = getValue(
                                            franchise,
                                            'location',
                                            'Location'
                                        ) || '-'

                                        const createdOn = getValue(
                                            franchise,
                                            'createdOn',
                                            'CreatedOn',
                                            'createdDate',
                                            'CreatedDate',
                                            'createdAt',
                                            'CreatedAt',
                                            'creationDate',
                                            'CreationDate'
                                        )

                                        const status = getValue(
                                            franchise,
                                            'isActive',
                                            'IsActive',
                                            'isactive',
                                            'Active',
                                            'active',
                                            'status',
                                            'Status',
                                            'franchiseStatus',
                                            'FranchiseStatus'
                                        )

                                        const normalizedStatus = String(
                                            status ?? ''
                                        ).trim().toLowerCase()

                                        const isActive =
                                            status === true ||
                                            normalizedStatus === '1' ||
                                            normalizedStatus === 'true' ||
                                            normalizedStatus === 'active' ||
                                            normalizedStatus === 'yes'

                                        const franchiseCode = getValue(
                                            franchise,
                                            'frCode',
                                            'FrCode',
                                            'franchiseCode',
                                            'FranchiseCode'
                                        )

                                        return (
                                            <tr
                                                key={
                                                    franchiseCode ||
                                                    `${name}-${index}`
                                                }
                                            >
                                                <td>{index + 1}</td>
                                                <td>{name}</td>
                                                <td>{mobile}</td>
                                                <td>{email}</td>
                                                <td>{location}</td>
                                                <td>{formatDate(createdOn)}</td>
                                                <td>
                                                    <span
                                                        className={
                                                            isActive
                                                                ? 'franchise-status active'
                                                                : 'franchise-status inactive'
                                                        }
                                                    >
                                                        {isActive
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    )
}

export default FranchiseList