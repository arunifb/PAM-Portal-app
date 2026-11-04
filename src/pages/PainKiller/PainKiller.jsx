
import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getRegions,
    getBranches
} from '../../api/reportsApi'

import {
    searchPainKiller
} from '../../api/painKillerApi'

import './PainKiller.css'

// =========================================
// SESSION HELPERS
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

function getArrayFromResponse(response) {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.Data)) return response.Data
    if (Array.isArray(response?.result)) return response.result
    if (Array.isArray(response?.items)) return response.items

    return []
}

function getRegionCode(item) {
    return String(
        item?.regionCode ??
        item?.RegionCode ??
        item?.code ??
        item?.Code ??
        ''
    )
}

function getRegionName(item) {
    return String(
        item?.regionName ??
        item?.RegionName ??
        item?.name ??
        item?.Name ??
        ''
    )
}

function getBranchCode(item) {
    return String(
        item?.bpCode ??
        item?.BPCode ??
        item?.branchCode ??
        item?.BranchCode ??
        item?.code ??
        item?.Code ??
        ''
    )
}

function getBranchName(item) {
    return String(
        item?.branchName ??
        item?.BranchName ??
        item?.name ??
        item?.Name ??
        ''
    )
}

// =========================================
// RESPONSE FIELD HELPERS
// =========================================

function getTicketNo(row) {
    return row?.ticketNo ?? row?.TicketNo ?? ''
}

function getCallBookDate(value) {
    if (!value) return '-'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return '-'

    const day = String(date.getDate()).padStart(2, '0')

    const month = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
    ][date.getMonth()]

    return `${day}-${month}-${date.getFullYear()}`
}

// =========================================
// COMPONENT
// =========================================

function PainKiller({
    onEditPainKiller,
    restoreListState,
    refreshAfterEdit
}) {

    // =====================================
    // SESSION
    // =====================================

    const userId = getSessionValue('userId', 'UserID')

    const roleId = Number(
        getSessionValue('roleId', 'RoleID')
    )

    // Pain Killer access is only for Role 2.
    const isAuthorized = roleId === 2

    // =====================================
    // FILTER STATES
    // =====================================

    const [regionCode, setRegionCode] = useState(
        () => restoreListState?.regionCode ?? 'All'
    )

    const [branchCode, setBranchCode] = useState(
        () => restoreListState?.branchCode ?? 'All'
    )

    const [callType, setCallType] = useState(
        () => restoreListState?.callType ?? 'Service Call'
    )

    const [aging, setAging] = useState(
        () => restoreListState?.aging ?? 'All'
    )

    const [painStatus, setPainStatus] = useState(
        () => restoreListState?.painStatus ?? ''
    )

    // =====================================
    // DROPDOWN DATA
    // =====================================

    const [regions, setRegions] = useState([])
    const [branches, setBranches] = useState([])

    const [loadingRegions, setLoadingRegions] = useState(false)
    const [loadingBranches, setLoadingBranches] = useState(false)

    // =====================================
    // GRID DATA
    // =====================================

    const [records, setRecords] = useState(
        () => restoreListState?.records ?? []
    )

    const [loading, setLoading] = useState(false)

    const [searched, setSearched] = useState(
        () => restoreListState?.searched ?? false
    )

    // =====================================
    // MESSAGES
    // =====================================

    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // =====================================
    // RESTORE FILTERS AND GRID DATA
    // =====================================

    useEffect(() => {
        if (!restoreListState) return

        setRegionCode(restoreListState.regionCode ?? 'All')
        setBranchCode(restoreListState.branchCode ?? 'All')
        setCallType(restoreListState.callType ?? 'Service Call')
        setAging(restoreListState.aging ?? 'All')
        setPainStatus(restoreListState.painStatus ?? '')

        setRecords(restoreListState.records ?? [])
        setSearched(restoreListState.searched ?? false)

        setError('')
        setSuccessMessage('')
    }, [restoreListState])

    // =====================================
    // LOAD REGIONS
    // =====================================

    useEffect(() => {
        if (!isAuthorized || !userId) return

        let cancelled = false

        async function loadRegions() {
            try {
                setLoadingRegions(true)
                setError('')

                const response = await getRegions('', userId)

                if (cancelled) return

                const regionList = getArrayFromResponse(response)

                const validRegions = regionList.filter(item =>
                    item &&
                    getRegionCode(item).trim() !== '' &&
                    getRegionCode(item).trim().toLowerCase() !== 'all'
                )

                setRegions(validRegions)

                if (!restoreListState) {
                    setRegionCode('All')
                }

            } catch (err) {
                if (cancelled) return

                setRegions([])

                if (!restoreListState) {
                    setRegionCode('All')
                }

                setError(
                    err?.message || 'Unable to load regions.'
                )

            } finally {
                if (!cancelled) {
                    setLoadingRegions(false)
                }
            }
        }

        loadRegions()

        return () => {
            cancelled = true
        }
    }, [isAuthorized, userId])

    // =====================================
    // LOAD BRANCHES WHEN REGION CHANGES
    // =====================================

    useEffect(() => {
        if (!isAuthorized || !userId || !regionCode) {
            setBranches([])
            setBranchCode('All')
            setLoadingBranches(false)
            return
        }

        let cancelled = false

        async function loadBranches() {
            setBranches([])

            if (!restoreListState) {
                setBranchCode('All')
            }

            try {
                setLoadingBranches(true)
                setError('')

                const regionParameter =
                    regionCode === 'All' ? '' : regionCode

                const response = await getBranches(
                    userId,
                    regionParameter
                )

                if (cancelled) return

                const branchList = getArrayFromResponse(response)

                const validBranches = branchList.filter(item =>
                    item &&
                    getBranchCode(item).trim() !== '' &&
                    getBranchCode(item).trim().toLowerCase() !== 'all' &&
                    getBranchName(item)
                )

                setBranches(validBranches)

                if (!restoreListState) {
                    setBranchCode('All')
                }

            } catch (err) {
                if (cancelled) return

                setBranches([])

                if (!restoreListState) {
                    setBranchCode('All')
                }

                setError(
                    err?.message || 'Unable to load branches.'
                )

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
    }, [isAuthorized, userId, regionCode])

    // =====================================
    // RESTORE BRANCH AFTER BRANCHES LOAD
    // =====================================

    useEffect(() => {
        if (
            !restoreListState ||
            loadingBranches ||
            branches.length === 0
        ) {
            return
        }

        setBranchCode(restoreListState.branchCode ?? 'All')
    }, [loadingBranches, branches, restoreListState])

    // =====================================
    // SEARCH
    // =====================================

    async function handleSearch(ticketNo = 'All') {
        setError('')
        setSuccessMessage('')

        if (!regionCode) {
            setError('Please select region.')
            return
        }

        if (!branchCode) {
            setError('Please select branch.')
            return
        }

        setLoading(true)
        setSearched(true)

        try {
            const request = {
                ticketNo,
                region: regionCode,
                branchCode,
                callType,
                aging,
                painStatus
            }

            const response = await searchPainKiller(request)

            const list = getArrayFromResponse(response)

            setRecords(list)

        } catch (err) {
            setRecords([])

            setError(
                err?.message || 'Unable to load Pain Killer records.'
            )

        } finally {
            setLoading(false)
        }
    }

    // =====================================
    // REFRESH AFTER EDIT
    // =====================================

    useEffect(() => {
        if (!refreshAfterEdit || refreshAfterEdit === 0) return

        if (searched) {
            handleSearch()
        }
    }, [refreshAfterEdit])

    // =====================================
    // RESET
    // =====================================

    function handleReset() {
        setRegionCode('All')
        setBranchCode('All')

        setCallType('Service Call')
        setAging('All')
        setPainStatus('')

        setRecords([])
        setSearched(false)

        setError('')
        setSuccessMessage('')
    }

    // =====================================
    // OPEN EDIT WITHOUT URL CHANGE
    // =====================================

    function handleView(row) {
        const ticketNo = getTicketNo(row)

        if (!ticketNo) {
            setError('Ticket number is missing.')
            return
        }

        if (typeof onEditPainKiller !== 'function') {
            setError('Unable to open Pain Killer Edit page.')
            return
        }

        const listState = {
            regionCode,
            branchCode,
            callType,
            aging,
            painStatus,
            records,
            searched
        }

        onEditPainKiller({
            refid: ticketNo,
            listState
        })
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

    // =====================================
    // RENDER
    // =====================================

    return (
        <DashboardLayout title="Pain Killer - Call Verification">
            <div className="pain-killer-page">

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

                {/* FILTERS */}

                <div className="pk-filter-box">

                    {/* REGION */}

                    <div className="pk-filter-item">
                        <label>Region <span>*</span></label>

                        <select
                            value={regionCode}
                            onChange={event => {
                                const selectedRegion = event.target.value

                                setRegionCode(selectedRegion)
                                setBranchCode('All')

                                setBranches([])
                                setRecords([])
                                setSearched(false)

                                setError('')
                                setSuccessMessage('')
                            }}
                            disabled={loadingRegions}
                        >
                            <option value="All">All</option>

                            {regions.map((region, index) => {
                                const code = getRegionCode(region)

                                return (
                                    <option
                                        key={`${code}-${index}`}
                                        value={code}
                                    >
                                        {getRegionName(region) || code}
                                    </option>
                                )
                            })}
                        </select>

                        {loadingRegions && (
                            <small>Loading regions...</small>
                        )}
                    </div>

                    {/* BRANCH */}

                    <div className="pk-filter-item">
                        <label>Branch <span>*</span></label>

                        <select
                            value={branchCode}
                            onChange={event => {
                                setBranchCode(event.target.value)

                                setRecords([])
                                setSearched(false)

                                setError('')
                                setSuccessMessage('')
                            }}
                            disabled={!regionCode || loadingBranches}
                        >
                            <option value="All">All</option>

                            {branches.map((branch, index) => {
                                const code = getBranchCode(branch)

                                return (
                                    <option
                                        key={`${code}-${index}`}
                                        value={code}
                                    >
                                        {getBranchName(branch) || code}
                                    </option>
                                )
                            })}
                        </select>

                        {loadingBranches && (
                            <small>Loading branches...</small>
                        )}
                    </div>

                    {/* CALL TYPE */}

                    <div className="pk-filter-item">
                        <label>Call Type</label>

                        <select
                            value={callType}
                            onChange={event => setCallType(event.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Reinstalllation Call">
                                Reinstalllation Call
                            </option>
                            <option value="Installation Call">
                                Installation Call
                            </option>
                            <option value="Rework order">
                                Rework order
                            </option>
                            <option value="Service Call">
                                Service Call
                            </option>
                            <option value="Mandatory Calls">
                                Mandatory Calls
                            </option>
                        </select>
                    </div>

                    {/* CC AGING */}

                    <div className="pk-filter-item">
                        <label>CC Aging</label>

                        <select
                            value={aging}
                            onChange={event => setAging(event.target.value)}
                        >
                            <option value="0">0 Days</option>
                            <option value="1">1 Days</option>
                            <option value="2">2 Days</option>
                            <option value="All">&gt;2 Days</option>
                        </select>
                    </div>

                    {/* ACTION BY AGENT */}

                    <div className="pk-filter-item">
                        <label>Action By Agent</label>

                        <select
                            value={painStatus}
                            onChange={event => setPainStatus(event.target.value)}
                        >
                            <option value="">
                                Verification Pending
                            </option>

                            <option value="All">All</option>

                            <option value="1">
                                Verified By Agent
                            </option>
                        </select>
                    </div>

                    {/* SEARCH / RESET */}

                    <div className="pk-filter-actions">
                        <button
                            type="button"
                            className="btn-search pk-search-button"
                            onClick={() => handleSearch()}
                            disabled={
                                loading ||
                                loadingRegions ||
                                loadingBranches
                            }
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>

                        <button
                            type="button"
                            className="pk-reset-button"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* LOADING */}

                {loading && (
                    <div className="pk-loading">
                        Loading records...
                    </div>
                )}

                {/* GRID */}

                {!loading && (
                    <div className="pk-table-section">

                        <div className="pk-table-heading">
                            <span>
                                Pain Killer - Call Verification
                            </span>

                            {records.length > 0 && (
                                <span className="pk-record-count">
                                    {records.length} record(s) found
                                </span>
                            )}
                        </div>

                        {records.length > 0 ? (
                            <div className="pk-table-wrapper">
                                <table className="pk-table">

                                    <thead>
                                        <tr>
                                            <th>SNo.</th>
                                            <th>TicketNo.</th>
                                            <th>Name</th>
                                            <th>RCN</th>
                                            <th>AltNo.</th>
                                            <th>Call Type</th>
                                            <th>Product</th>
                                            <th>Status</th>
                                            <th>Pending Reason</th>
                                            <th>DAYS_OLD</th>
                                            <th>CC_Aging</th>
                                            <th>Call Book Date</th>
                                            <th>Current Action</th>
                                            <th>Priority</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {records.map((row, index) => {
                                            const ticketNo = getTicketNo(row)

                                            const status = String(
                                                row?.status ??
                                                row?.Status ??
                                                ''
                                            )

                                            const currentAction = String(
                                                row?.painStatus ??
                                                row?.PainStatus ??
                                                ''
                                            )

                                            const ccAging = String(
                                                row?.ccAging ??
                                                row?.CcAging ??
                                                ''
                                            )

                                            const priority = String(
                                                row?.priority ??
                                                row?.Priority ??
                                                ''
                                            )

                                            return (
                                                <tr key={`${ticketNo}-${index}`}>

                                                    <td>{index + 1}</td>

                                                    <td>{ticketNo}</td>

                                                    <td>
                                                        {row?.customerName ??
                                                            row?.CustomerName ?? '-'}
                                                    </td>

                                                    <td>
                                                        {row?.contacts ??
                                                            row?.Contacts ?? '-'}
                                                    </td>

                                                    <td>
                                                        {row?.altNo ??
                                                            row?.AltNo ?? '-'}
                                                    </td>

                                                    <td>
                                                        {row?.callType ??
                                                            row?.CallType ?? '-'}
                                                    </td>

                                                    <td>
                                                        {row?.product ??
                                                            row?.Product ?? '-'}
                                                    </td>

                                                    <td>
                                                        <span className={
                                                            status.toLowerCase() === 'pending'
                                                                ? 'pk-status pk-status-danger'
                                                                : 'pk-status pk-status-success'
                                                        }>
                                                            {status || '-'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {row?.pendingReason ??
                                                            row?.PendingReason ?? '-'}
                                                    </td>

                                                    <td>
                                                        {row?.daysOld ??
                                                            row?.DaysOld ?? '-'}
                                                    </td>

                                                    <td>{ccAging || '-'}</td>

                                                    <td>
                                                        {getCallBookDate(
                                                            row?.callBookDate ??
                                                            row?.CallBookDate
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span className={
                                                            currentAction === 'Verified By Agent'
                                                                ? 'pk-status pk-status-success'
                                                                : 'pk-status pk-status-default'
                                                        }>
                                                            {currentAction || '-'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className={
                                                            priority.toLowerCase() === 'high'
                                                                ? 'pk-status pk-status-danger'
                                                                : 'pk-status pk-status-warning'
                                                        }>
                                                            {priority || '-'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="pk-view-button"
                                                            onClick={() => handleView(row)}
                                                            title="View"
                                                        >
                                                            {ccAging === '0' ? '🔒' : '👁'}
                                                        </button>
                                                    </td>

                                                </tr>
                                            )
                                        })}
                                    </tbody>

                                </table>
                            </div>
                        ) : (
                            <div className="pk-no-records">
                                {searched
                                    ? 'No Records Found'
                                    : 'Search to view records.'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default PainKiller
