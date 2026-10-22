import { useEffect, useState } from 'react'
import './Click2Call.css'

import {
    getBranches,
    getRegions
} from '../../api/reportsApi'

import {
    getClick2CallFranchises,
    searchClick2Call
} from '../../api/click2CallApi'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarDays } from 'lucide-react'

function Click2Call() {
    // =========================================
    // SESSION VALUES
    // =========================================

    const sessionUserId = Number(
        sessionStorage.getItem('userId') || 0
    )

    const roleId = Number(
        sessionStorage.getItem('roleId') ||
        sessionStorage.getItem('roleID')
    ) || 0

    const sessionRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const bpCode =
        sessionStorage.getItem('bpCode') || ''

    const loginId =
        sessionStorage.getItem('loginId') || ''

    // =========================================
    // USER TYPE
    // =========================================

    const isRole1Or3 = roleId === 1 || roleId === 3
    const isRole7 = roleId === 7
    const isBranchUser = !isRole1Or3 && !isRole7

    // =========================================
    // REGION STATE
    // =========================================

    const [regions, setRegions] = useState([])
    const [region, setRegion] = useState(
        roleId === 5 ? sessionRegionCode : ''
    )
    const [regionLoading, setRegionLoading] = useState(false)

    // =========================================
    // FORM STATE
    // =========================================

    const [ticketNumber, setTicketNumber] = useState('')

    const [branch, setBranch] = useState(
        isRole7
            ? ''
            : isBranchUser
                ? bpCode
                : ''
    )

    const [franchise, setFranchise] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')

    // =========================================
    // DROPDOWN STATE
    // =========================================

    const [branches, setBranches] = useState([])
    const [franchises, setFranchises] = useState([])
    const [branchLoading, setBranchLoading] = useState(false)
    const [franchiseLoading, setFranchiseLoading] = useState(false)

    // =========================================
    // SEARCH STATE
    // =========================================

    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [showResults, setShowResults] = useState(false)
    const [isTicketSearch, setIsTicketSearch] = useState(false)

    // =========================================
    // REGION HELPERS
    // =========================================

    const getRegionCode = (item) => (
        item.regionCode ??
        item.RegionCode ??
        ''
    )

    const getRegionName = (item) => (
        item.regionName ??
        item.RegionName ??
        item.name ??
        item.Name ??
        ''
    )

    // =========================================
    // BRANCH HELPERS
    // =========================================

    const getBranchCode = (item) => (
        item.bpCode ??
        item.BPCode ??
        ''
    )

    const getBranchName = (item) => (
        item.branchName ??
        item.BranchName ??
        ''
    )

    // =========================================
    // FRANCHISE HELPERS
    // =========================================

    const getFranchiseCode = (item) => (
        item.frCode ??
        item.Frcode ??
        item.FRCode ??
        item.frcode ??
        item.loginId ??
        item.LoginID ??
        ''
    )

    const getFranchiseName = (item) => (
        item.franchiseName ??
        item.FranchiseName ??
        item.userName ??
        item.UserName ??
        ''
    )

// Date Picker

    const parseDate = (value) => {
    if (!value) return null

    const [year, month, day] = value.split('-').map(Number)

    if (!year || !month || !day) return null

    return new Date(year, month - 1, day)
}

const formatInputDate = (date) => {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

    // =========================================
    // LOAD REGIONS
    // =========================================

    useEffect(() => {
        // if (!isRole1Or3) {
        //     setRegions([])
        //     setRegion('')
        //     return
        // }

        if (!isRole1Or3 && roleId !== 5 && roleId !== 6) {
            setRegions([])
            setRegion('')
            return
        }

        let cancelled = false

        const loadRegions = async () => {
            try {
                setRegionLoading(true)
                setError('')

                console.log('Click2Call Loading regions:', {
                    userId: sessionUserId
                })

                const data = await getRegions('', sessionUserId)

                if (cancelled) return

                console.log('Click2Call Region Response:', data)

                if (!Array.isArray(data)) {
                    throw new Error('Invalid region response.')
                }

                setRegions(data)

            // Role 5: automatically select the logged-in user's region.
            // All other roles retain their existing behavior.
            if (roleId === 3 || roleId === 5 || roleId === 6) {
                const matchingRegion = data.find(
                    item =>
                        String(getRegionCode(item)) ===
                        String(sessionRegionCode)
                )

                setRegion(
                    matchingRegion
                        ? getRegionCode(matchingRegion)
                        : ''
                )
            } else {
                setRegion('')
            }
            } catch (error) {
                if (cancelled) return

                console.error('Click2Call region error:', error)

                setRegions([])
                setRegion('')

                setError(
                    error.message ||
                    'Unable to load regions.'
                )
            } finally {
                if (!cancelled) {
                    setRegionLoading(false)
                }
            }
        }

        loadRegions()

        return () => {
            cancelled = true
        }
    // }, [isRole1Or3, sessionUserId])
    }, [isRole1Or3,
    roleId,
    sessionUserId,
    sessionRegionCode])

    // =========================================
    // LOAD BRANCHES
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadBranches = async () => {
            // Role 1 / 3 must select a region first.
            if (isRole1Or3 && !region) {
                setBranches([])
                setBranch('')
                setFranchises([])
                setFranchise('')
                setBranchLoading(false)
                return
            }

            try {
                setBranchLoading(true)
                setError('')

                let data = []

                // Role 1 / 3: branches for selected region.
                if (isRole1Or3) {
                    console.log(
                        'Click2Call Role 1/3 Loading branches:',
                        {
                            userId: sessionUserId,
                            regionCode: region
                        }
                    )

                    data = await getBranches(
                        sessionUserId,
                        region
                    )
                }

                // Role 7: load available branches.
                else if (isRole7) {
                    console.log(
                        'Click2Call Role 7 Loading branches:',
                        {
                            userId: sessionUserId,
                            regionCode: ''
                        }
                    )

                    data = await getBranches(
                        sessionUserId,
                        ''
                    )
                }

                // // Other roles: preserve logged-in branch behavior.
                // else {
                //     console.log(
                //         'Click2Call Loading branch:',
                //         {
                //             roleId,
                //             regionCode: sessionRegionCode,
                //             bpCode
                //         }
                //     )

                //     data = bpCode
                //         ? [{
                //             bpCode,
                //             branchName: bpCode
                //         }]
                //         : []
                // }

                // Role 5: load branches based on the selected region.
                else if (roleId === 5) {
                    // Wait until a region is selected.
                    if (!region) {
                        setBranches([])
                        setBranch('')
                        setFranchises([])
                        setFranchise('')
                        setBranchLoading(false)
                        return
                    }

                    console.log('Click2Call Role 5 Loading branches:', {
                        userId: sessionUserId,
                        regionCode: region
                    })

                    data = await getBranches(
                        sessionUserId,
                        region
                    )
                }

                // Role 6: load branches based on the logged-in user's region.
                // Role 6: load branches based on the selected region.
                else if (roleId === 6) {
                    if (!region) {
                        setBranches([])
                        setBranch('')
                        setFranchises([])
                        setFranchise('')
                        setBranchLoading(false)
                        return
                    }

                    console.log('Click2Call Role 6 Loading branches:', {
                        userId: sessionUserId,
                        regionCode: region
                    })

                    data = await getBranches(
                        sessionUserId,
                        region
                    )
                }

                // Other roles: preserve existing logged-in branch behavior.
                else {
                    console.log(
                        'Click2Call Loading branch:',
                        {
                            roleId,
                            regionCode: sessionRegionCode,
                            bpCode
                        }
                    )

                    data = bpCode
                        ? [{
                            bpCode,
                            branchName: bpCode
                        }]
                        : []
                }

                if (cancelled) return

                console.log('Click2Call Branch Response:', data)

                if (!Array.isArray(data)) {
                    throw new Error('Invalid branch response.')
                }

                const validBranches = data.filter(
                    item =>
                        item &&
                        getBranchCode(item) &&
                        getBranchName(item)
                )

                setBranches(validBranches)

                // Roles 5 and 6: select the logged-in user's branch if available.
                // Otherwise, select the first available branch.
                if (roleId === 3 || roleId === 5 || roleId === 6) {
                    const matchingBranch = validBranches.find(
                        item =>
                            String(getBranchCode(item)) === String(bpCode)
                    )

                    setBranch(
                        matchingBranch
                            ? getBranchCode(matchingBranch)
                            : validBranches.length > 0
                                ? getBranchCode(validBranches[0])
                                : ''
                    )
                } else if (isRole1Or3 || isRole7) {
                    // Preserve existing behavior for Roles 1, 3, and 7.
                    setBranch('')
                } else if (isBranchUser) {
                    // Preserve existing behavior for other branch users.
                    setBranch(bpCode)
                }

                setFranchises([])
                setFranchise('')
            } catch (error) {
                if (cancelled) return

                console.error('Click2Call branch error:', error)

                setBranches([])
                setFranchises([])
                setFranchise('')

                if (isBranchUser) {
                    setBranch(bpCode)
                } else {
                    setBranch('')
                }

                setError(
                    error.message ||
                    'Unable to load branches.'
                )
            } finally {
                if (!cancelled) {
                    setBranchLoading(false)
                }
            }
        }

        loadBranches()

        return () => {
            cancelled = true
        }
    }, [
        roleId,
        region,
        sessionUserId,
        sessionRegionCode,
        bpCode,
        isRole1Or3,
        isRole7,
        isBranchUser
    ])

    // =========================================
    // LOAD FRANCHISES
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadFranchises = async () => {
            // Role 1 / 3: wait until a branch is selected.
            if (isRole1Or3 && !branch) {
                setFranchises([])
                setFranchise('')
                setFranchiseLoading(false)
                return
            }

            // Role 7: wait until a branch is selected.
            if (isRole7 && !branch) {
                setFranchises([])
                setFranchise('')
                setFranchiseLoading(false)
                return
            }

            // Other branch users: preserve existing behavior.
            if (isBranchUser && !branch) {
                setFranchises([])
                setFranchise('')
                setFranchiseLoading(false)
                return
            }

            try {
                setFranchiseLoading(true)
                setError('')

                console.log('Click2Call Loading franchises:', {
                    roleId,
                    selectedBranch: branch,
                    loginId
                })

                // const data = await getClick2CallFranchises(
                //     roleId,
                //     branch,
                //     loginId
                // )

                // Role 5 uses the logged-in user's BPCode.
                // All other roles keep the existing selected-branch behavior.
                const franchiseBpCode =
                    roleId === 5 || roleId === 6
                        ? bpCode
                        : branch

                const data = await getClick2CallFranchises(
                    roleId,
                    franchiseBpCode,
                    loginId
                )

                if (cancelled) return

                console.log('Click2Call Franchise Response:', data)

                if (!Array.isArray(data)) {
                    throw new Error('Invalid franchise response.')
                }

                const sortedFranchises = [...data].sort(
                    (a, b) =>
                        (getFranchiseName(a) || '').localeCompare(
                            getFranchiseName(b) || '',
                            undefined,
                            { sensitivity: 'base' }
                        )
                )

                // setFranchises(sortedFranchises)
                // setFranchise('')

                setFranchises(sortedFranchises)

if (roleId === 5) {
    // Select the franchise belonging to the logged-in user.
    const userFranchise = sortedFranchises.find(
        item =>
            String(getFranchiseCode(item)).toLowerCase() ===
            String(loginId).toLowerCase()
    )

    setFranchise(
        userFranchise
            ? getFranchiseCode(userFranchise)
            : ''
    )
} else if (roleId === 6) {
    // Preserve automatic first-franchise selection for Role 6.
    setFranchise(
        sortedFranchises.length > 0
            ? getFranchiseCode(sortedFranchises[0])
            : ''
    )
} else {
    setFranchise('')
}
            } catch (error) {
                if (cancelled) return

                console.error('Click2Call franchise error:', error)

                setFranchises([])
                setFranchise('')

                setError(
                    error.message ||
                    'Unable to load franchises.'
                )
            } finally {
                if (!cancelled) {
                    setFranchiseLoading(false)
                }
            }
        }

        loadFranchises()

        return () => {
            cancelled = true
        }
    }, [
        // branch,
        // roleId,
        // loginId,
        // isRole1Or3,
        // isRole7,
        // isBranchUser

        branch,
        roleId,
        loginId,
        bpCode,
        isRole1Or3,
        isRole7,
        isBranchUser
    ])

    // =========================================
    // REGION CHANGE
    // =========================================

    const handleRegionChange = (event) => {
        const selectedRegion = event.target.value

        setRegion(selectedRegion)
        setBranch('')
        setBranches([])
        setFranchise('')
        setFranchises([])
        setResults([])
        setError('')
        setMessage('')
        setShowResults(false)
        setIsTicketSearch(false)
    }

    // =========================================
    // BRANCH CHANGE
    // =========================================

    const handleBranchChange = (event) => {
        const selectedBranch = event.target.value

        console.log(
            'Selected Click2Call Branch:',
            selectedBranch
        )

        setBranch(selectedBranch)
        setFranchise('')
        setFranchises([])
        setResults([])
        setError('')
        setMessage('')
        setShowResults(false)
    }

    // =========================================
    // FRANCHISE CHANGE
    // =========================================

    const handleFranchiseChange = (event) => {
        setFranchise(event.target.value)
        setError('')
        setMessage('')
    }

    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async () => {
        setError('')
        setMessage('')
        setResults([])
        setShowResults(true)

        const isTicket = !!ticketNumber.trim()

        setIsTicketSearch(isTicket)

        // Role 1 / 3 region validation.
        if (isRole1Or3 && !region) {
            setError('Please select a region.')
            return
        }

        // Branch is mandatory for every role.
        if (!branch) {
            setError('Please select a branch.')
            return
        }

        // Require dates when no ticket number is provided.
        if (!ticketNumber.trim()) {
            if (!fromDate || !toDate) {
                setError(
                    'From Date and To Date are required when Ticket Number is not provided.'
                )
                return
            }

            if (fromDate > toDate) {
                setError(
                    'From Date cannot be greater than To Date.'
                )
                return
            }
        }

        const searchRegionCode = isRole7
            ? ''
            : isRole1Or3
                ? region
                : sessionRegionCode

        const searchBpCode = branch || bpCode

        const request = {
            roleId,
            leadId: ticketNumber.trim(),
            regionCode: searchRegionCode,
            bpCode: searchBpCode,
            frCode: franchise,
            loginId,
            fromDate,
            toDate
        }

        console.log('Click2Call Request:', request)

        try {
            setLoading(true)

            const data = await searchClick2Call(request)

            console.log('Click2Call Response:', data)

            if (!Array.isArray(data) || data.length === 0) {
                setMessage('No records found.')
                return
            }

            setResults(data)
        } catch (error) {
            console.error('Click2Call error:', error)

            setError(
                error.message ||
                'Unable to search Click 2 Call.'
            )
        } finally {
            setLoading(false)
        }
    }

    // =========================================
    // CLEAR
    // =========================================

    const handleClear = () => {
        setTicketNumber('')
        setFranchise('')
        setFromDate('')
        setToDate('')
        setFranchises([])
        setResults([])
        setError('')
        setMessage('')
        setShowResults(false)
        setIsTicketSearch(false)

        if (isRole1Or3) {
            setRegion('')
            setBranch('')
            setBranches([])
            return
        }

        if (isRole7) {
            setBranch('')
            return
        }

        setBranch(bpCode || '')
    }

    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDate = (value) => {
        if (!value) return ''

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return value
        }

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    // =========================================
    // DISPLAY RESULTS
    // =========================================

    const displayResults = isTicketSearch
        ? results
        : results.slice(0, 10)

    // =========================================
    // UI
    // =========================================

    return (
        <DashboardLayout title="Click 2 Call">
            <div className="click2call-page">
                <div className="click2call-box">
                    <div className="click2call-form">

                        {/* REGION */}
                        {(isRole1Or3 || roleId === 5 || roleId === 6) && (
                            <div className="click2call-field">
                                <label>
                                    Select Region:
                                    <span className="required">*</span>
                                </label>

                                <select
                                    value={region}
                                    onChange={handleRegionChange}
                                    disabled={regionLoading}
                                >
                                    <option value="">
                                        Select Region
                                    </option>

                                    {regions.map((item, index) => {
                                        const code = getRegionCode(item)
                                        const name = getRegionName(item)

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
                            </div>
                        )}

                        {/* BRANCH */}
                        <div className="click2call-field">
                            <label>
                                Select Branch:
                                <span className="required">*</span>
                            </label>

                            <select
                                value={branch}
                                onChange={handleBranchChange}
                                disabled={
                                    branchLoading ||
                                    (isRole1Or3 && !region) ||
                                    isBranchUser
                                }
                            >
                                <option value="">
                                    Select Branch
                                </option>

                                {branches.map((item, index) => (
                                    <option
                                        key={`${getBranchCode(item)}-${index}`}
                                        value={getBranchCode(item)}
                                    >
                                        {getBranchName(item)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* FRANCHISE */}
                        <div className="click2call-field">
                            <label>Franchise:</label>

                            <select
                                value={franchise}
                                onChange={handleFranchiseChange}
                                // disabled={
                                //     franchiseLoading ||
                                //     !branch
                                // }

                                disabled={
                                    franchiseLoading ||
                                    !branch ||
                                    roleId === 5
                                }
                            >
                                <option value="">All</option>

                                {franchises.map((item, index) => (
                                    <option
                                        key={`${getFranchiseCode(item)}-${index}`}
                                        value={getFranchiseCode(item)}
                                    >
                                        {getFranchiseName(item)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* TICKET NUMBER */}
                        <div className="click2call-field">
                            <label>Ticket Number:</label>

                            <input
                                type="text"
                                value={ticketNumber}
                                onChange={(event) =>
                                    setTicketNumber(event.target.value)
                                }
                            />
                        </div>

                        {/* FROM DATE */}
                        {/* <div className="click2call-field">
                            <label>
                                From Date:
                                <span className="required">*</span>
                            </label>

                            <input
                                type="date"
                                value={fromDate}
                                onChange={(event) =>
                                    setFromDate(event.target.value)
                                }
                            />
                        </div> */}

                        <div className="click2call-field">
                            <label>
                                From Date:
                                <span className="required">*</span>
                            </label>

                            <div className="report-date-picker-container">
                                <DatePicker
                                    selected={parseDate(fromDate)}
                                    onChange={(date) => setFromDate(formatInputDate(date))}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Select from date"
                                    className="report-filter-control report-date-control"
                                    wrapperClassName="report-date-picker-wrapper"
                                    showPopperArrow={false}
                                    autoComplete="off"
                                    isClearable={false}
                                />

                                <button
                                    type="button"
                                    className="report-calendar-icon"
                                    aria-label="Open From Date calendar"
                                    onClick={(event) => {
                                        event.currentTarget
                                            .parentElement
                                            ?.querySelector('input')
                                            ?.focus()
                                    }}
                                >
                                    <CalendarDays size={16} />
                                </button>
                            </div>
                        </div>

                        {/* TO DATE */}
                        {/* <div className="click2call-field">
                            <label>
                                To Date:
                                <span className="required">*</span>
                            </label>

                            <input
                                type="date"
                                value={toDate}
                                onChange={(event) =>
                                    setToDate(event.target.value)
                                }
                            />
                        </div> */}

                        <div className="click2call-field">
                            <label>
                                To Date:
                                <span className="required">*</span>
                            </label>

                            <div className="report-date-picker-container">
                                <DatePicker
                                    selected={parseDate(toDate)}
                                    onChange={(date) => setToDate(formatInputDate(date))}
                                    minDate={parseDate(fromDate)}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Select to date"
                                    className="report-filter-control report-date-control"
                                    wrapperClassName="report-date-picker-wrapper"
                                    showPopperArrow={false}
                                    autoComplete="off"
                                    isClearable={false}
                                    popperPlacement="bottom-end"
                                />

                                <button
                                    type="button"
                                    className="report-calendar-icon"
                                    aria-label="Open To Date calendar"
                                    onClick={(event) => {
                                        event.currentTarget
                                            .parentElement
                                            ?.querySelector('input')
                                            ?.focus()
                                    }}
                                >
                                    <CalendarDays size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="click2call-error">
                            {error}
                        </div>
                    )}

                    {/* MESSAGE */}
                    {message && (
                        <div className="click2call-message">
                            {message}
                        </div>
                    )}

                    {/* BUTTONS */}
                    <div className="click2call-button-area">
                        <button
                            type="button"
                            className="click2call-search-button"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>

                        <button
                            type="button"
                            className="click2call-clear-button"
                            onClick={handleClear}
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* RESULT TABLE */}
                {showResults && (
                    <div className="click2call-box">
                        {results.length > 0 && !loading && (
                            <h3
                                style={{
                                    margin: '10px',
                                    fontSize: '15px',
                                    color: '#333'
                                }}
                            >
                                {isTicketSearch
                                    ? `${results.length} record${results.length !== 1 ? 's' : ''} found`
                                    : (
                                        <>
                                            Showing {displayResults.length} of {results.length} records

                                            {results.length > 10 && (
                                                <span
                                                    style={{
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        color: '#666',
                                                        marginLeft: '10px'
                                                    }}
                                                >
                                                    — Use Ticket Number to search specific records
                                                </span>
                                            )}
                                        </>
                                    )}
                            </h3>
                        )}

                        <div className="click2call-table-wrapper">
                            <table className="click2call-table">
                                <thead>
                                    <tr>
                                        <th>SNo.</th>
                                        <th>Branch</th>
                                        <th>Franchise</th>
                                        <th>TicketNo</th>
                                        <th>start_stamp</th>
                                        <th>end_stamp</th>
                                        <th>hangup_cause</th>
                                        <th>duration</th>
                                        <th>call_status</th>
                                        <th>CreatedDate</th>
                                        <th>Recording</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="11"
                                                className="click2call-loading-cell"
                                            >
                                                <div className="click2call-loading">
                                                    <div className="click2call-loading-dots">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </div>

                                                    <span className="click2call-loading-text">
                                                        Loading...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : displayResults.length > 0 ? (
                                        displayResults.map((item, index) => (
                                            <tr
                                                key={`${item.lead_id || item.Lead_Id || index}-${index}`}
                                            >
                                                <td>{index + 1}</td>
                                                <td>{item.Branch || ''}</td>
                                                <td>{item.Franchise || ''}</td>
                                                <td>
                                                    {item.lead_id || item.Lead_Id || ''}
                                                </td>
                                                <td>{item.start_stamp || ''}</td>
                                                <td>{item.end_stamp || ''}</td>
                                                <td>{item.hangup_cause || ''}</td>
                                                <td>{item.duration || ''}</td>
                                                <td>{item.call_status || ''}</td>
                                                <td>{formatDate(item.CreatedDate)}</td>
                                                <td>
                                                    {item.recording_url ? (
                                                        <audio controls>
                                                            <source
                                                                src={item.recording_url}
                                                                type="audio/mpeg"
                                                            />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    ) : (
                                                        <span>No recording</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="11"
                                                className="click2call-no-record"
                                            >
                                                No records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default Click2Call