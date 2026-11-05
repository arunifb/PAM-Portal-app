
import { useEffect, useMemo, useState } from 'react'

import {
    getDDRRegionReport,
    exportDDRRegionReport
} from '../../api/ddrRegionApi'

import {
    getRegions,
    getBranches
} from '../../api/reportsApi'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import './DDRRegion.css'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarDays } from 'lucide-react'


const PAGE_SIZE = 20


// =========================================================
// DATE HELPERS
// =========================================================

function parseDate(value) {
    if (!value) return null

    const [year, month, day] = value.split('-').map(Number)

    if (!year || !month || !day) return null

    const date = new Date(year, month - 1, day)

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null
    }

    return date
}


function formatInputDate(date) {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}


function getFirstDayOfCurrentMonth() {
    const date = new Date()

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    )
        .toISOString()
        .split('T')[0]
}


function getToday() {
    return new Date()
        .toISOString()
        .split('T')[0]
}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {
    if (!value) {
        return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return '-'
    }

    return date.toLocaleDateString(
        'en-GB',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }
    )
}


// =========================================================
// FORMAT DATE TIME
// =========================================================

function formatDateTime(value) {
    if (!value) {
        return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return '-'
    }

    return date.toLocaleString(
        'en-GB',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
    )
}


// =========================================================
// FORMAT CURRENCY
// =========================================================

function formatCurrency(value) {
    const amount = Number(value || 0)

    return amount.toLocaleString(
        'en-IN',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )
}


// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(status) {
    const value = String(status || '').toLowerCase()

    if (value.includes('rejected')) {
        return 'status-rejected'
    }

    if (value.includes('bse')) {
        return 'status-bse'
    }

    if (value.includes('marketing')) {
        return 'status-marketing'
    }

    if (value.includes('pending')) {
        return 'status-pending'
    }

    if (value.includes('approved')) {
        return 'status-approved'
    }

    if (value.includes('inspection')) {
        return 'status-inspection'
    }

    return 'status-open'
}


// =========================================================
// VALIDATION CLASS
// =========================================================

function getValidationClass(status) {
    const value = String(status || '').toLowerCase()

    if (value === 'correct') {
        return 'validation-correct'
    }

    if (value.includes('check approver')) {
        return 'validation-check'
    }

    if (
        value.includes('not triggered') ||
        value.includes('billing date')
    ) {
        return 'validation-warning'
    }

    if (
        value.includes('bse workflow') ||
        value.includes('marketing workflow')
    ) {
        return 'validation-workflow'
    }

    return 'validation-na'
}


// =========================================================
// MAIL CLASS
// =========================================================

function getMailClass(status) {
    const value = String(status || '').toLowerCase()

    if (value === 'sent') {
        return 'mail-sent'
    }

    if (value === 'failed') {
        return 'mail-failed'
    }

    return 'mail-not-triggered'
}


// =========================================================
// DDR REGION
// =========================================================

function DDRRegion() {

    // =====================================================
    // SESSION / ROLE
    // =====================================================

    const sessionRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const sessionBpCode =
        sessionStorage.getItem('bpCode') ||
        sessionStorage.getItem('BPCode') ||
        ''

    const storedRoles = JSON.parse(
        sessionStorage.getItem('roles') || '[]'
    )

    const roles = Array.isArray(storedRoles)
        ? storedRoles.map(role => String(role))
        : []

    const isRole6 = roles.includes('6')


    // =====================================================
    // FILTERS
    // =====================================================

    const [fromDate, setFromDate] =
        useState(getFirstDayOfCurrentMonth())

    const [toDate, setToDate] =
        useState(getToday())

    const [regionCode, setRegionCode] =
        useState(isRole6 ? sessionRegionCode : '')

    const [branchCode, setBranchCode] =
        useState(isRole6 ? sessionBpCode : 'All')


    // =====================================================
    // REGIONS
    // =====================================================

    const [regions, setRegions] = useState([])

    const [regionsLoading, setRegionsLoading] =
        useState(false)


    // =====================================================
    // BRANCHES
    // =====================================================

    const [branches, setBranches] = useState([])

    const [branchesLoading, setBranchesLoading] =
        useState(false)


    // =====================================================
    // REPORT DATA
    // =====================================================

    const [summary, setSummary] = useState({
        totalRequests: 0,
        openRequests: 0,
        approvalPending: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        inspectionCompleted: 0
    })

    const [userSummary, setUserSummary] = useState([])

    const [requests, setRequests] = useState([])


    // =====================================================
    // PAGINATION
    // =====================================================

    const [currentPage, setCurrentPage] = useState(1)


    // =====================================================
    // LOADING
    // =====================================================

    const [loading, setLoading] = useState(false)

    const [exporting, setExporting] = useState(false)


    // =====================================================
    // MESSAGES
    // =====================================================

    const [errorMessage, setErrorMessage] = useState('')

    const [successMessage, setSuccessMessage] = useState('')


    // =====================================================
    // GET LOGGED-IN USER ID
    // =====================================================

    const getViewerUserId = () => {
        const possibleKeys = [
            'userId',
            'UserId',
            'userid',
            'UserID'
        ]

        for (const key of possibleKeys) {
            const value = sessionStorage.getItem(key)

            if (value) {
                const parsedValue = Number(value)

                if (
                    Number.isInteger(parsedValue) &&
                    parsedValue > 0
                ) {
                    return parsedValue
                }
            }
        }

        return 0
    }


    // =========================================================
    // LOAD REGIONS
    // =========================================================

    const loadRegions = async () => {
        try {
            setRegionsLoading(true)

            const viewerUserId = getViewerUserId()

            if (!viewerUserId) {
                console.warn(
                    'User ID is not available in sessionStorage.'
                )

                setRegions([])
                return
            }

            const response = await getRegions('', viewerUserId)

            const regionData = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                    ? response.data
                    : []

            setRegions(regionData)

            // Role 6: keep the session region selected.
            if (isRole6 && sessionRegionCode) {
                const matchedRegion = regionData.find(region => {
                    const value =
                        region.regionCode ??
                        region.RegionCode ??
                        region.regioncode ??
                        ''

                    return (
                        String(value).toLowerCase() ===
                        String(sessionRegionCode).toLowerCase()
                    )
                })

                setRegionCode(
                    matchedRegion
                        ? (
                            matchedRegion.regionCode ??
                            matchedRegion.RegionCode ??
                            matchedRegion.regioncode
                        )
                        : sessionRegionCode
                )
            }
        }
        catch (error) {
            console.error(
                'Unable to load DDR regions:',
                error
            )

            setRegions([])
        }
        finally {
            setRegionsLoading(false)
        }
    }


    // =========================================================
    // LOAD BRANCHES
    // =========================================================

    const loadBranches = async (selectedRegionCode) => {
        if (!selectedRegionCode) {
            setBranches([])
            setBranchCode(isRole6 ? sessionBpCode : 'All')
            return
        }

        try {
            setBranchesLoading(true)

            const viewerUserId = getViewerUserId()

            if (!viewerUserId) {
                console.warn(
                    'User ID is not available in sessionStorage.'
                )

                setBranches([])
                return
            }

            const response = await getBranches(
                viewerUserId,
                selectedRegionCode
            )

            const branchData = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                    ? response.data
                    : []

            setBranches(branchData)

            // Role 6: select the branch from session.
            if (isRole6) {
                const matchedBranch = branchData.find(branch => {
                    const value =
                        branch.bpCode ??
                        branch.BPCode ??
                        branch.bpcode ??
                        ''

                    return (
                        String(value).toLowerCase() ===
                        String(sessionBpCode).toLowerCase()
                    )
                })

                setBranchCode(
                    matchedBranch
                        ? (
                            matchedBranch.bpCode ??
                            matchedBranch.BPCode ??
                            matchedBranch.bpcode
                        )
                        : sessionBpCode
                )
            }
            else {
                // Existing behavior for other roles.
                setBranchCode('All')
            }
        }
        catch (error) {
            console.error(
                'Unable to load DDR branches:',
                error
            )

            setBranches([])

            setBranchCode(isRole6 ? sessionBpCode : 'All')
        }
        finally {
            setBranchesLoading(false)
        }
    }


    // =========================================================
    // REGION CHANGE
    // =========================================================

    const handleRegionChange = async (event) => {
        const value = event.target.value

        setRegionCode(value)
        setBranchCode('All')
        setBranches([])
        setErrorMessage('')
        setSuccessMessage('')

        if (!value) {
            return
        }

        await loadBranches(value)
    }


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadRegions()
    }, [])


    // =========================================================
    // ROLE 6: LOAD BRANCHES FOR SESSION REGION
    // =========================================================

    useEffect(() => {
        if (isRole6 && regionCode) {
            loadBranches(regionCode)
        }
    }, [isRole6, regionCode])


    // =========================================================
    // LOAD REPORT
    // =========================================================

    const loadReport = async () => {
        setErrorMessage('')
        setSuccessMessage('')

        if (!regionCode) {
            setErrorMessage('Region is required.')
            return
        }

        if (!fromDate) {
            setErrorMessage('From Date is required.')
            return
        }

        if (!toDate) {
            setErrorMessage('To Date is required.')
            return
        }

        if (fromDate > toDate) {
            setErrorMessage(
                'From Date cannot be greater than To Date.'
            )
            return
        }

        const viewerUserId = getViewerUserId()

        if (!viewerUserId) {
            setErrorMessage(
                'Unable to identify the logged-in user.'
            )
            return
        }

        const request = {
            viewerUserId,
            regionCode,
            branchCode: branchCode || 'All',
            fromDate,
            toDate
        }

        try {
            setLoading(true)

            const response = await getDDRRegionReport(request)

            const data = response?.data

            setSummary(data?.summary || {
                totalRequests: 0,
                openRequests: 0,
                approvalPending: 0,
                approvedRequests: 0,
                rejectedRequests: 0,
                inspectionCompleted: 0
            })

            setUserSummary(
                Array.isArray(data?.userSummary)
                    ? data.userSummary
                    : []
            )

            setRequests(
                Array.isArray(data?.requests)
                    ? data.requests
                    : []
            )

            setCurrentPage(1)
        }
        catch (error) {
            setSummary({
                totalRequests: 0,
                openRequests: 0,
                approvalPending: 0,
                approvedRequests: 0,
                rejectedRequests: 0,
                inspectionCompleted: 0
            })

            setUserSummary([])
            setRequests([])
            setCurrentPage(1)

            setErrorMessage(
                error.message ||
                'Unable to load DDR region report.'
            )
        }
        finally {
            setLoading(false)
        }
    }


    // =========================================================
    // PAGINATION
    // =========================================================

    const totalPages = Math.max(
        1,
        Math.ceil(requests.length / PAGE_SIZE)
    )

    const paginatedRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE

        return requests.slice(
            startIndex,
            startIndex + PAGE_SIZE
        )
    }, [requests, currentPage])


    // =========================================================
    // SEARCH
    // =========================================================

    const handleSearch = async () => {
        setCurrentPage(1)
        await loadReport()
    }


    // =========================================================
    // DOWNLOAD
    // =========================================================

    const handleDownload = async () => {
        setErrorMessage('')
        setSuccessMessage('')

        if (!regionCode) {
            setErrorMessage('Region is required.')
            return
        }

        if (!fromDate || !toDate) {
            setErrorMessage(
                'From Date and To Date are required.'
            )
            return
        }

        if (fromDate > toDate) {
            setErrorMessage(
                'From Date cannot be greater than To Date.'
            )
            return
        }

        const viewerUserId = getViewerUserId()

        if (!viewerUserId) {
            setErrorMessage(
                'Unable to identify the logged-in user.'
            )
            return
        }

        const request = {
            viewerUserId,
            regionCode,
            branchCode: branchCode || 'All',
            fromDate,
            toDate
        }

        try {
            setExporting(true)

            const blob = await exportDDRRegionReport(request)

            const url = window.URL.createObjectURL(blob)

            const link = document.createElement('a')

            link.href = url

            link.download = `DDR_Region_Report_${new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/[-:T]/g, '')}.xlsx`

            document.body.appendChild(link)

            link.click()

            document.body.removeChild(link)

            window.URL.revokeObjectURL(url)

            setSuccessMessage(
                'DDR region report downloaded successfully.'
            )
        }
        catch (error) {
            setErrorMessage(
                error.message ||
                'Unable to download DDR region report.'
            )
        }
        finally {
            setExporting(false)
        }
    }


    // =========================================================
    // PAGE CHANGE
    // =========================================================

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) {
            return
        }

        setCurrentPage(page)
    }


    // =========================================================
    // UI
    // =========================================================

    return (
        <DashboardLayout title="DDR Region Monitoring">

            <div className="ddr-region-page">

                {/* MESSAGES */}

                {errorMessage && (
                    <div className="ddr-alert ddr-alert-error">
                        {errorMessage}
                    </div>
                )}

                {successMessage && !errorMessage && (
                    <div className="ddr-alert ddr-alert-success">
                        {successMessage}
                    </div>
                )}


                {/* FILTER BOX */}

                <div className="ddr-filter-box">

                    <div className="ddr-filter-item">
                        <label htmlFor="fromDate">From Date</label>

                        <div className="ddr-date-picker-container">
                            <DatePicker
                                id="fromDate"
                                selected={parseDate(fromDate)}
                                onChange={date => setFromDate(formatInputDate(date))}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="dd/mm/yyyy"
                                className="ddr-date-control"
                                calendarClassName="ddr-calendar"
                                showPopperArrow={false}
                                autoComplete="off"
                                isClearable={false}
                                popperPlacement="bottom-start"
                            />

                            <button
                                type="button"
                                className="ddr-calendar-icon"
                                aria-label="Open From Date calendar"
                                onClick={event => {
                                    const input = event.currentTarget
                                        .parentElement
                                        .querySelector('input')

                                    input?.focus()
                                    input?.click()
                                }}
                            >
                                <CalendarDays size={18} />
                            </button>
                        </div>
                    </div>


                    <div className="ddr-filter-item">
                        <label htmlFor="toDate">To Date</label>

                        <div className="ddr-date-picker-container">
                            <DatePicker
                                id="toDate"
                                selected={parseDate(toDate)}
                                onChange={date => setToDate(formatInputDate(date))}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="dd/mm/yyyy"
                                className="ddr-date-control"
                                calendarClassName="ddr-calendar"
                                minDate={parseDate(fromDate)}
                                showPopperArrow={false}
                                autoComplete="off"
                                isClearable={false}
                                popperPlacement="bottom-end"
                            />

                            <button
                                type="button"
                                className="ddr-calendar-icon"
                                aria-label="Open To Date calendar"
                                onClick={event => {
                                    const input = event.currentTarget
                                        .parentElement
                                        .querySelector('input')

                                    input?.focus()
                                    input?.click()
                                }}
                            >
                                <CalendarDays size={18} />
                            </button>
                        </div>
                    </div>


                    {/* REGION */}

                    <div className="ddr-filter-item">
                        <label htmlFor="region">
                            Region
                            <span className="required">*</span>
                        </label>

                        <select
                            id="region"
                            value={regionCode}
                            onChange={handleRegionChange}
                            disabled={regionsLoading || isRole6}
                        >
                            <option value="">
                                Select Region
                            </option>

                            {regions.map((region, index) => {
                                const value =
                                    region.regionCode ??
                                    region.RegionCode ??
                                    region.regioncode ??
                                    ''

                                const name =
                                    region.regionName ??
                                    region.RegionName ??
                                    region.regionname ??
                                    value

                                if (!value) {
                                    return null
                                }

                                return (
                                    <option
                                        key={`${value}-${index}`}
                                        value={value}
                                    >
                                        {name}
                                    </option>
                                )
                            })}
                        </select>
                    </div>


                    {/* BRANCH */}

                    <div className="ddr-filter-item">
                        <label htmlFor="branch">Branch</label>

                        <select
                            id="branch"
                            value={branchCode}
                            onChange={event =>
                                setBranchCode(event.target.value)
                            }
                            disabled={
                                !regionCode ||
                                branchesLoading ||
                                isRole6
                            }
                        >
                            <option value="All">
                                All Branches
                            </option>

                            {branches.map((branch, index) => {
                                const value =
                                    branch.bpCode ??
                                    branch.BPCode ??
                                    branch.bpcode ??
                                    ''

                                const name =
                                    branch.branchName ??
                                    branch.BranchName ??
                                    branch.branchname ??
                                    value

                                if (!value) {
                                    return null
                                }

                                return (
                                    <option
                                        key={`${value}-${index}`}
                                        value={value}
                                    >
                                        {name}
                                    </option>
                                )
                            })}
                        </select>
                    </div>


                    <div className="ddr-filter-actions">
                        <button
                            type="button"
                            className="btn-search ddr-search-button"
                            onClick={handleSearch}
                            disabled={
                                loading ||
                                regionsLoading ||
                                branchesLoading
                            }
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>

                        <button
                            type="button"
                            className="ddr-download-button"
                            onClick={handleDownload}
                            disabled={
                                exporting ||
                                loading ||
                                regionsLoading ||
                                branchesLoading
                            }
                        >
                            {exporting ? 'Downloading...' : 'Download All'}
                        </button>
                    </div>

                </div>


                {/* SUMMARY CARDS */}

                <div className="ddr-summary-grid">

                    <div className="ddr-summary-card">
                        <div>
                            <span>Total Requests</span>
                            <strong>{summary.totalRequests}</strong>
                        </div>
                        <div className="ddr-summary-icon">▤</div>
                    </div>

                    <div className="ddr-summary-card">
                        <div>
                            <span>Open</span>
                            <strong>{summary.openRequests}</strong>
                        </div>
                        <div className="ddr-summary-icon">○</div>
                    </div>

                    <div className="ddr-summary-card">
                        <div>
                            <span>Approval Pending</span>
                            <strong>{summary.approvalPending}</strong>
                        </div>
                        <div className="ddr-summary-icon">◷</div>
                    </div>

                    <div className="ddr-summary-card">
                        <div>
                            <span>Approved</span>
                            <strong>{summary.approvedRequests}</strong>
                        </div>
                        <div className="ddr-summary-icon">✓</div>
                    </div>

                    <div className="ddr-summary-card">
                        <div>
                            <span>Rejected</span>
                            <strong>{summary.rejectedRequests}</strong>
                        </div>
                        <div className="ddr-summary-icon">×</div>
                    </div>

                    <div className="ddr-summary-card">
                        <div>
                            <span>Inspection Completed</span>
                            <strong>{summary.inspectionCompleted}</strong>
                        </div>
                        <div className="ddr-summary-icon">✓</div>
                    </div>

                </div>


                {/* USER SUMMARY */}

                <section className="ddr-report-section">

                    <div className="ddr-section-header">
                        <div>
                            <h2>User-wise DDR Summary</h2>
                            <span>{userSummary.length} users</span>
                        </div>
                    </div>

                    <div className="ddr-table-container">

                        {userSummary.length === 0 ? (
                            <div className="ddr-no-record">
                                No user summary records found.
                            </div>
                        ) : (
                            <table className="ddr-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Branch</th>
                                        <th>Total</th>
                                        <th>Open</th>
                                        <th>Pending</th>
                                        <th>Approved</th>
                                        <th>Rejected</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {userSummary.map(user => (
                                        <tr key={user.requestorUserId}>
                                            <td>{user.userName || '-'}</td>
                                            <td>{user.role || '-'}</td>
                                            <td>{user.branchCode || '-'}</td>
                                            <td>{user.totalRequests}</td>
                                            <td>{user.openRequests}</td>
                                            <td>
                                                <span className="ddr-status-badge status-pending">
                                                    {user.pendingRequests}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="ddr-status-badge status-approved">
                                                    {user.approvedRequests}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="ddr-status-badge status-rejected">
                                                    {user.rejectedRequests}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                    </div>

                </section>


                {/* DDR REQUEST DETAILS */}

                <section className="ddr-report-section">

                    <div className="ddr-section-header">
                        <div>
                            <h2>DDR Request Details</h2>
                            <span>{requests.length} records</span>
                        </div>
                    </div>

                    <div className="ddr-table-container">

                        {paginatedRequests.length === 0 ? (
                            <div className="ddr-no-record">
                                No DDR request records found.
                            </div>
                        ) : (
                            <table className="ddr-table ddr-details-table">

                                <thead>
                                    <tr>
                                        <th>DDR</th>
                                        <th>Requestor</th>
                                        <th>Customer</th>
                                        <th>Machine</th>
                                        <th>Ageing</th>
                                        <th>Estimate</th>
                                        <th>Current Status</th>
                                        <th>Approval Stage</th>
                                        <th>Approver</th>
                                        <th>Validation</th>
                                        <th>Approval Mail</th>
                                        <th>Assignment</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedRequests.map(request => (
                                        <tr key={request.refId}>

                                            <td>
                                                <div className="ddr-primary">
                                                    {request.refId}
                                                </div>
                                                <div className="ddr-secondary">
                                                    Ticket: {request.ticket || '-'}
                                                </div>
                                                <div className="ddr-secondary">
                                                    {formatDate(request.createdDate)}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="ddr-primary">
                                                    {request.userName || '-'}
                                                </div>
                                                <div className="ddr-secondary">
                                                    {request.userRole || '-'}
                                                </div>
                                                <div className="ddr-secondary">
                                                    {request.branchCode || '-'}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="ddr-primary">
                                                    {request.customerName || '-'}
                                                </div>
                                                <div className="ddr-secondary">
                                                    {request.mobile || '-'}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="ddr-primary">
                                                    {request.modelName || '-'}
                                                </div>
                                                <div className="ddr-secondary">
                                                    {request.productCode || '-'}
                                                </div>
                                                <div className="ddr-secondary">
                                                    {request.serialNo || '-'}
                                                </div>
                                            </td>

                                            <td>
                                                <div>
                                                    {request.ageing ?? '-'} day(s)
                                                </div>
                                                <div className="ddr-secondary">
                                                    Billing: {formatDate(request.billingDate)}
                                                </div>
                                            </td>

                                            <td>
                                                ₹ {formatCurrency(request.totalEstimatedCost)}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        `ddr-status-badge ` +
                                                        getStatusClass(request.displayStatus)
                                                    }
                                                >
                                                    {request.displayStatus || request.status || '-'}
                                                </span>

                                                {request.status && (
                                                    <div className="ddr-secondary">
                                                        DB: {request.status}
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                <div>{request.approvalStage || '-'}</div>
                                                <div className="ddr-secondary">
                                                    Expected: {request.expectedApprovalRole || '-'}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="ddr-primary">
                                                    {request.approverRole || '-'}
                                                </div>
                                                <div>{request.approverName || '-'}</div>
                                                <div className="ddr-approver-email">
                                                    {request.approverEmail || '-'}
                                                </div>

                                                {request.approvalStatus && (
                                                    <div className="ddr-secondary">
                                                        {request.approvalStatus}
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        `ddr-validation-badge ` +
                                                        getValidationClass(request.approverValidationStatus)
                                                    }
                                                >
                                                    {request.approverValidationStatus || '-'}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        `ddr-mail-badge ` +
                                                        getMailClass(request.mailDisplayStatus)
                                                    }
                                                >
                                                    {request.mailDisplayStatus || '-'}
                                                </span>

                                                {request.mailTriggeredDate && (
                                                    <div className="ddr-secondary">
                                                        {formatDateTime(request.mailTriggeredDate)}
                                                    </div>
                                                )}

                                                {request.canFollowUp && (
                                                    <div className="ddr-pending-days">
                                                        Pending: {request.approvalPendingDays} day(s)
                                                    </div>
                                                )}

                                                {request.mailError && (
                                                    <div className="ddr-mail-error">
                                                        {request.mailError}
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                <div>
                                                    Franchise: {request.franchiseCode || '-'}
                                                </div>
                                                <div>
                                                    Technician: {request.technicianCode || '-'}
                                                </div>
                                                <div>
                                                    BSE: {request.bseCode || '-'}
                                                </div>
                                            </td>

                                            <td>
                                                {request.canFollowUp ? (
                                                    <button
                                                        type="button"
                                                        className="ddr-follow-up-button"
                                                        onClick={() =>
                                                            window.alert(
                                                                'Follow-up API is not connected yet.'
                                                            )
                                                        }
                                                    >
                                                        Follow Up
                                                    </button>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        )}

                    </div>


                    {/* PAGINATION */}

                    {requests.length > PAGE_SIZE && (
                        <div className="ddr-pagination">

                            <button
                                type="button"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            <span>
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>

                        </div>
                    )}

                </section>

            </div>

        </DashboardLayout>
    )
}


export default DDRRegion
