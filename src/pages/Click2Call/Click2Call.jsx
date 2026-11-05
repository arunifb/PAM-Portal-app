
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

    let storedRoles = []

    try {
        storedRoles = JSON.parse(
            sessionStorage.getItem('roles') || '[]'
        )
    } catch {
        storedRoles = []
    }

    const storedRoleId = Number(
        sessionStorage.getItem('roleId') ||
        sessionStorage.getItem('roleID') ||
        0
    )

    const roleId =
        storedRoleId > 0
            ? storedRoleId
            : Number(storedRoles[0] || 0)

    const sessionRegionCode =
        sessionStorage.getItem('regionCode') ||
        sessionStorage.getItem('RegionCode') ||
        sessionStorage.getItem('regions') ||
        ''

    const bpCode =
        sessionStorage.getItem('bpCode') ||
        sessionStorage.getItem('BPCode') ||
        sessionStorage.getItem('branches') ||
        ''

    const loginId = sessionStorage.getItem('loginId') || ''

    // =========================================
    // USER TYPE
    // =========================================

    const isRole1Or3 = roleId === 1 || roleId === 3
    const isRole3 = roleId === 3
    const isRole5 = roleId === 5
    const isRole6 = roleId === 6
    const isRole7 = roleId === 7

    const isBranchUser =
        !isRole1Or3 &&
        !isRole5 &&
        !isRole6 &&
        !isRole7

    // =========================================
    // REGION STATE
    // =========================================

    const [regions, setRegions] = useState([])

    const [region, setRegion] = useState(
        isRole3 || isRole5 || isRole6
            ? sessionRegionCode
            : ''
    )

    const [regionLoading, setRegionLoading] = useState(false)

    // =========================================
    // FORM STATE
    // =========================================

    const [ticketNumber, setTicketNumber] = useState('')

    const [branch, setBranch] = useState(
        isRole3 || isRole5 || isRole6
            ? bpCode
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

    // =========================================
    // DATE HELPERS
    // =========================================

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
    // DATE RESTRICTION HELPERS
    // =========================================

        const today = new Date()

        today.setHours(0, 0, 0, 0)

        // From Date minimum: Today minus one calendar month
        const getPreviousMonthDate = (date) => {
            const result = new Date(date)

            const originalDay = result.getDate()

            result.setDate(1)
            result.setMonth(result.getMonth() - 1)

            const lastDayOfPreviousMonth = new Date(
                result.getFullYear(),
                result.getMonth() + 1,
                0
            ).getDate()

            result.setDate(
                Math.min(originalDay, lastDayOfPreviousMonth)
            )

            return result
        }

        const fromMinDate = getPreviousMonthDate(today)

        // To Date minimum: Today minus seven days
        const toMinDate = new Date(today)
        toMinDate.setDate(toMinDate.getDate() - 7)

        // Maximum date: Last day of current month
        const maxAllowedDate = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        )

        // Convert selected dates
        const selectedFromDate = parseDate(fromDate)
        const selectedToDate = parseDate(toDate)

        // To Date must not be earlier than From Date
        const effectiveToMinDate =
            selectedFromDate && selectedFromDate > toMinDate
                ? selectedFromDate
                : toMinDate

    // =========================================
    // LOAD REGIONS
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadRegions = async () => {
            try {
                setRegionLoading(true)
                setError('')

                console.log('Click2Call Loading regions:', {
                    userId: sessionUserId,
                    roleId
                })

                const data = await getRegions('', sessionUserId)

                if (cancelled) return

                console.log('Click2Call Region Response:', data)

                if (!Array.isArray(data)) {
                    throw new Error('Invalid region response.')
                }

                setRegions(data)

                // Roles 3, 5 and 6:
                // Select the logged-in user's region.
                if (isRole3 || isRole5 || isRole6) {
                    const matchingRegion = data.find(
                        item =>
                            String(getRegionCode(item)).trim().toLowerCase() ===
                            String(sessionRegionCode).trim().toLowerCase()
                    )

                    setRegion(
                        matchingRegion
                            ? String(getRegionCode(matchingRegion))
                            : ''
                    )
                } else {
                    // Roles 1 and 7:
                    // Show all regions and let the user select.
                    setRegion('')
                }
            } catch (error) {
                if (cancelled) return

                console.error('Click2Call region error:', error)

                setRegions([])
                setRegion('')

                setError(
                    error.message || 'Unable to load regions.'
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
    }, [
        roleId,
        sessionUserId,
        sessionRegionCode,
        isRole3,
        isRole5,
        isRole6
    ])

    // =========================================
    // LOAD BRANCHES
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadBranches = async () => {
            // Roles 1 and 3 require a selected region.
            if (isRole1Or3 && !region) {
                setBranches([])
                setBranch('')
                setFranchises([])
                setFranchise('')
                setBranchLoading(false)
                return
            }

            // Roles 5 and 6 require their region.
            if ((isRole5 || isRole6) && !region) {
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

                if (isRole1Or3 || isRole5 || isRole6) {
                    // Load branches for the selected region.
                    console.log('Click2Call Loading regional branches:', {
                        userId: sessionUserId,
                        roleId,
                        regionCode: region
                    })

                    data = await getBranches(
                        sessionUserId,
                        region
                    )
                } else if (isRole7) {
                    // Role 7:
                    // Blank region loads all branches.
                    // Selected region loads only its branches.
                    console.log('Click2Call Role 7 Loading branches:', {
                        userId: sessionUserId,
                        regionCode: region || ''
                    })

                    data = await getBranches(
                        sessionUserId,
                        region || ''
                    )
                } else {
                    // Preserve existing logged-in branch behavior.
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

                // Roles 3, 5 and 6:
                // Select the logged-in user's branch when available.
                if (isRole3 || isRole5 || isRole6) {
                    const matchingBranch = validBranches.find(
                        item =>
                            String(getBranchCode(item)).trim().toLowerCase() ===
                            String(bpCode).trim().toLowerCase()
                    )

                    setBranch(
                        matchingBranch
                            ? String(getBranchCode(matchingBranch))
                            : ''
                    )
                } else {
                    // Roles 1 and 7 select their branch manually.
                    setBranch('')
                }

                setFranchises([])
                setFranchise('')
            } catch (error) {
                if (cancelled) return

                console.error('Click2Call branch error:', error)

                setBranches([])
                setFranchises([])
                setFranchise('')

                setBranch(
                    isBranchUser ? bpCode : ''
                )

                setError(
                    error.message || 'Unable to load branches.'
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
        isRole3,
        isRole5,
        isRole6,
        isRole7,
        isBranchUser
    ])

    // =========================================
    // LOAD FRANCHISES
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadFranchises = async () => {
            // Wait for branch selection for Roles 1, 3 and 7.
            if ((isRole1Or3 || isRole7) && !branch) {
                setFranchises([])
                setFranchise('')
                setFranchiseLoading(false)
                return
            }

            // Other branch users also need a branch.
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

                // Roles 5 and 6 retain the existing BPCode behavior.
                const franchiseBpCode =
                    isRole5 || isRole6
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

                setFranchises(sortedFranchises)

                if (isRole5) {
                    // Select the logged-in user's franchise.
                    const userFranchise = sortedFranchises.find(
                        item =>
                            String(getFranchiseCode(item)).trim().toLowerCase() ===
                            String(loginId).trim().toLowerCase()
                    )

                    setFranchise(
                        userFranchise
                            ? getFranchiseCode(userFranchise)
                            : ''
                    )
                } else if (isRole6) {
                    // Preserve first-franchise selection for Role 6.
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
                    error.message || 'Unable to load franchises.'
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
        branch,
        roleId,
        loginId,
        bpCode,
        isRole1Or3,
        isRole5,
        isRole6,
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

        console.log('Selected Click2Call Branch:', selectedBranch)

        setBranch(selectedBranch)
        setFranchise('')
        setFranchises([])
        setResults([])
        setError('')
        setMessage('')
        setShowResults(false)
        setIsTicketSearch(false)
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

        // Roles 1, 3 and 7 require a selected region.
        if ((isRole1Or3 || isRole7) && !region) {
            setError('Please select a region.')
            return
        }

        // Branch is mandatory for every role.
        if (!branch) {
            setError('Please select a branch.')
            return
        }

        // Dates are required when no ticket number is provided.
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

        const searchRegionCode =
            isRole1Or3 || isRole7
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
                error.message || 'Unable to search Click 2 Call.'
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

        if (isRole1Or3 || isRole7) {
            setRegion('')
            setBranch('')
            setBranches([])
            return
        }

        if (isRole5 || isRole6) {
            setRegion(sessionRegionCode)
            setBranch(bpCode)
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
                        {(isRole1Or3 || isRole5 || isRole6 || isRole7) && (
                            <div className="click2call-field">
                                <label>
                                    Select Region:
                                    <span className="required">*</span>
                                </label>

                                <select
                                    value={region}
                                    onChange={handleRegionChange}
                                    disabled={regionLoading || isRole6}
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
                                    isRole6 ||
                                    ((isRole1Or3 || isRole5) && !region) ||
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
                                disabled={
                                    franchiseLoading ||
                                    !branch ||
                                    isRole5
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
                        <div className="click2call-field">
                            <label>
                                From Date:
                                <span className="required">*</span>
                            </label>

                            <div className="report-date-picker-container">
                                <DatePicker
                                    selected={parseDate(fromDate)}
                                    onChange={(date) => {
                                        const formattedDate = formatInputDate(date)

                                        setFromDate(formattedDate)

                                        // Clear To Date if it becomes earlier than From Date
                                        if (
                                            date &&
                                            selectedToDate &&
                                            selectedToDate < date
                                        ) {
                                            setToDate('')
                                        }
                                    }}
                                    minDate={fromMinDate}
                                    maxDate={maxAllowedDate}
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
                        <div className="click2call-field">
                            <label>
                                To Date:
                                <span className="required">*</span>
                            </label>

                            <div className="report-date-picker-container">
                                <DatePicker
                                    selected={parseDate(toDate)}
                                    onChange={(date) =>
                                        setToDate(formatInputDate(date))
                                    }
                                    minDate={effectiveToMinDate}
                                    maxDate={maxAllowedDate}
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
