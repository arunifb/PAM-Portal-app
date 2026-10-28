import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import PCRDownload from '../PCRDownload/PCRDownload'
import AddPartCategory from '../AddPartCategory/AddPartCategory'

import {
    searchPCR,
    getPCRStatuses
} from '../../api/pcrApi'

import {
    getRegions,
    getBranches,
    getFranchises
} from '../../api/reportsApi'

import './PCR.css'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarDays } from 'lucide-react'


//Date Picker

function parsePCRDate(value) {
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

function formatPCRInputDate(date) {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function PCR() {
    const location = useLocation()

    // =====================================================
    // SESSION DATA
    // =====================================================

   

// =====================================================
// SESSION DATA
// =====================================================

const sessionUserId = Number(
    sessionStorage.getItem('userId') ||
    sessionStorage.getItem('UserID') ||
    0
)

let storedRoles = []

try {
    const rolesValue = JSON.parse(
        sessionStorage.getItem('roles') || '[]'
    )

    storedRoles = Array.isArray(rolesValue)
        ? rolesValue
        : []
} catch (error) {
    console.warn('Unable to parse stored roles:', error)
}

const storedRoleId = Number(
    sessionStorage.getItem('roleId') ||
    sessionStorage.getItem('roleID') ||
    sessionStorage.getItem('RoleID') ||
    0
)

const roleId = storedRoleId > 0
    ? storedRoleId
    : Number(
        storedRoles.find(role => {
            const value = typeof role === 'object'
                ? role.roleId ?? role.RoleID ?? role.id ?? role.Id
                : role

            return Number(value) === 7
        }) ?? 0
    )

const bpCode =
    sessionStorage.getItem('bpCode') ||
    sessionStorage.getItem('BPCode') ||
    ''

const loginId =
    sessionStorage.getItem('loginId') ||
    sessionStorage.getItem('LoginID') ||
    ''

const sessionRegionCode =
    sessionStorage.getItem('regionCode') ||
    sessionStorage.getItem('RegionCode') ||
    ''

const sessionRegionCodes = sessionRegionCode
    .split(',')
    .map(code => code.trim())
    .filter(Boolean)

const isRole7 = roleId === 7

console.log('PCR Session Data:', {
    sessionUserId,
    roleId,
    storedRoles,
    sessionRegionCode,
    sessionRegionCodes,
    bpCode,
    loginId,
    isRole7
})

    // =====================================================
    // CURRENT PAGE
    // =====================================================

    const [activePage, setActivePage] = useState('pcr')

    // =====================================================
    // SEARCH FILTERS
    // =====================================================

    const [regionCode, setRegionCode] = useState('All')
    // const [branchCode, setBranchCode] = useState(
    //     isRole7 ? '' : 'All'
    // )
    const [branchCode, setBranchCode] = useState('All')
    const [franchiseCode, setFranchiseCode] = useState('All')
    const [ticketNo, setTicketNo] = useState('')
    const [spuNo, setSpuNo] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [status, setStatus] = useState('1')

    // =====================================================
    // DROPDOWN DATA
    // =====================================================

    const [regions, setRegions] = useState([])
    const [branches, setBranches] = useState([])
    const [franchises, setFranchises] = useState([])
    const [statuses, setStatuses] = useState([])

    const [regionLoading, setRegionLoading] = useState(false)
    const [branchLoading, setBranchLoading] = useState(false)
    const [franchiseLoading, setFranchiseLoading] = useState(false)

    // =====================================================
    // PCR DATA
    // =====================================================

    const [pcrData, setPcrData] = useState([])

    // =====================================================
    // PAGE STATE
    // =====================================================

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showResults, setShowResults] = useState(false)

    // =====================================================
    // RESPONSE HELPERS
    // =====================================================

    const getListFromResponse = (response, possibleKeys = []) => {
        if (Array.isArray(response)) {
            return response
        }

        if (Array.isArray(response?.data)) {
            return response.data
        }

        if (Array.isArray(response?.data?.data)) {
            return response.data.data
        }

        for (const key of possibleKeys) {
            if (Array.isArray(response?.[key])) {
                return response[key]
            }

            if (Array.isArray(response?.data?.[key])) {
                return response.data[key]
            }
        }

        return []
    }

    // =====================================================
    // REGION HELPERS
    // =====================================================

    const getRegionCode = (item) => (
        item?.regionCode ??
        item?.RegionCode ??
        item?.Regioncode ??
        item?.regionID ??
        item?.RegionID ??
        item?.regionId ??
        item?.RegionId ??
        item?.code ??
        item?.Code ??
        ''
    )

    const getRegionName = (item) => (
        item?.regionName ??
        item?.RegionName ??
        item?.Regionname ??
        item?.regionDescription ??
        item?.RegionDescription ??
        item?.name ??
        item?.Name ??
        item?.description ??
        item?.Description ??
        getRegionCode(item)
    )

    // =====================================================
    // BRANCH HELPERS
    // =====================================================

    const getBranchCode = (item) => (
        item?.bpCode ??
        item?.BPCode ??
        item?.branchCode ??
        item?.BranchCode ??
        item?.brCode ??
        item?.BrCode ??
        ''
    )

    const getBranchName = (item) => (
        item?.branchName ??
        item?.BranchName ??
        item?.brName ??
        item?.BrName ??
        item?.name ??
        item?.Name ??
        ''
    )

    // =====================================================
    // FRANCHISE HELPERS
    // =====================================================

    const getFranchiseCode = (item) => (
        item?.frCode ??
        item?.Frcode ??
        item?.FRCode ??
        item?.frcode ??
        item?.franchiseCode ??
        item?.FranchiseCode ??
        item?.loginId ??
        item?.LoginID ??
        ''
    )

    const getFranchiseName = (item) => (
        item?.franchiseName ??
        item?.FranchiseName ??
        item?.userName ??
        item?.UserName ??
        getFranchiseCode(item)
    )

    // =====================================================
    // LOAD REGIONS
    // Role 7 requires a region selection before branches.
    // =====================================================

    

useEffect(() => {
    let cancelled = false

    const loadRegions = async () => {
        try {
            setRegionLoading(true)
            setError('')

            const response = await getRegions(
                '',
                sessionUserId
            )

            if (cancelled) return

            console.log('PCR Region API Response:', response)

            const regionList = getListFromResponse(response, [
                'regions',
                'Regions',
                'result',
                'Result',
                'items',
                'Items'
            ])

            const validRegions = regionList.filter(item =>
                item &&
                String(getRegionCode(item)).trim() !== ''
            )

            console.log('PCR Valid Regions:', validRegions)

            setRegions(validRegions)

            if (validRegions.length === 0) {
                console.warn(
                    'PCR: The regions API returned no usable region records.'
                )
            }
        } catch (err) {
            if (cancelled) return

            console.error('Unable to load PCR regions:', err)
            setRegions([])
            setError(err.message || 'Unable to load regions.')
        } finally {
            if (!cancelled) {
                setRegionLoading(false)
            }
        }
    }

    if (!sessionUserId) {
        setRegions([])
        setRegionLoading(false)
        setError('User ID is missing. Unable to load regions.')
        return
    }

    loadRegions()

    return () => {
        cancelled = true
    }
}, [sessionUserId, sessionRegionCode])

    // =====================================================
    // LOAD BRANCHES
    // Role 7: Load branches for the selected region.
    // Other roles: Keep the existing call behavior.
    // =====================================================

    useEffect(() => {
        let cancelled = false

        const loadBranches = async () => {
            if (isRole7 && !regionCode) {
                setBranches([])
                setBranchCode('')
                setFranchises([])
                setFranchiseCode('All')
                setBranchLoading(false)
                return
            }

            try {
                setBranchLoading(true)
                setError('')

                console.log('PCR Loading Branches:', {
                    roleId,
                    userId: sessionUserId,
                    regionCode: isRole7 ? regionCode : 'All'
                })

                const branchResponse = await getBranches(
                    sessionUserId,
                    regionCode === 'All' ? '' : regionCode
                )

                if (cancelled) return

                console.log('PCR Branch API Response:', branchResponse)

                const branchList = getListFromResponse(branchResponse, [
                    'branches',
                    'Branches',
                    'result',
                    'Result',
                    'items',
                    'Items'
                ])

                const validBranches = branchList.filter((item) => (
                    item &&
                    String(getBranchCode(item)).trim() !== '' &&
                    String(getBranchName(item)).trim() !== ''
                ))

                setBranches(validBranches)

                if (isRole7) {
                    setBranchCode('All')
                    setFranchiseCode('All')
                    setFranchises([])
                }
            } catch (err) {
                if (cancelled) return

                console.error('Unable to load PCR branches:', err)

                setBranches([])

                if (isRole7) {
                    setBranchCode('')
                    setFranchiseCode('All')
                    setFranchises([])
                }

                setError(err.message || 'Unable to load branches.')
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
        sessionUserId,
        bpCode,
        isRole7,
        regionCode
    ])

    // =====================================================
    // LOAD FRANCHISES AND STATUSES
    // =====================================================

    useEffect(() => {
        let cancelled = false

        const loadOtherDropdowns = async () => {
            try {
                setLoading(true)
                setError('')

                const [franchiseResponse, statusResponse] =
                    await Promise.all([
                        isRole7
                            ? Promise.resolve([])
                            : getFranchises(bpCode, loginId),

                        getPCRStatuses()
                    ])

                if (cancelled) return

                const franchiseList = getListFromResponse(
                    franchiseResponse,
                    ['franchises', 'Franchises', 'result', 'Result']
                )

                setFranchises(franchiseList)

                const statusList = getListFromResponse(
                    statusResponse,
                    ['statuses', 'Statuses', 'result', 'Result']
                )

                setStatuses(statusList)
            } catch (err) {
                if (cancelled) return

                console.error('Unable to load PCR dropdowns:', err)

                setError(
                    err.message || 'Unable to load PCR dropdown data.'
                )
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadOtherDropdowns()

        return () => {
            cancelled = true
        }
    }, [roleId, bpCode, loginId, isRole7])

    // =====================================================
    // LOAD FRANCHISES WHEN ROLE 7 SELECTS A BRANCH
    // =====================================================

    useEffect(() => {
        if (!isRole7) return

        let cancelled = false

        const loadBranchFranchises = async () => {
            if (!branchCode) {
                setFranchises([])
                setFranchiseCode('All')
                setFranchiseLoading(false)
                return
            }

            try {
                setFranchiseLoading(true)
                setError('')

                console.log('PCR Role 7 Loading Franchises:', {
                    roleId,
                    selectedBranch: branchCode,
                    loginId
                })

                const franchiseResponse = await getFranchises(
                    branchCode,
                    loginId
                )

                if (cancelled) return

                console.log(
                    'PCR Franchise API Response:',
                    franchiseResponse
                )

                const franchiseList = getListFromResponse(
                    franchiseResponse,
                    ['franchises', 'Franchises', 'result', 'Result']
                )

                const sortedFranchises = [...franchiseList].sort(
                    (a, b) => String(getFranchiseName(a)).localeCompare(
                        String(getFranchiseName(b)),
                        undefined,
                        { sensitivity: 'base' }
                    )
                )

                setFranchises(sortedFranchises)
                setFranchiseCode('All')
            } catch (err) {
                if (cancelled) return

                console.error('Unable to load PCR franchises:', err)

                setFranchises([])
                setFranchiseCode('All')
                setError(err.message || 'Unable to load franchises.')
            } finally {
                if (!cancelled) {
                    setFranchiseLoading(false)
                }
            }
        }

        loadBranchFranchises()

        return () => {
            cancelled = true
        }
    }, [branchCode, isRole7, roleId, loginId])

    // =====================================================
    // REGION CHANGE
    // =====================================================

    const handleRegionChange = (event) => {
    const selectedRegion = event.target.value

    console.log('Selected PCR Region:', selectedRegion)

    setRegionCode(selectedRegion)
    setBranchCode('All')
    setFranchiseCode('All')
    setBranches([])
    setFranchises([])
    setError('')
    }

    // =====================================================
    // BRANCH CHANGE
    // =====================================================

    const handleBranchChange = (event) => {
        const selectedBranch = event.target.value

        console.log('Selected PCR Branch:', selectedBranch)

        setBranchCode(selectedBranch)
        setError('')

        if (isRole7) {
            setFranchiseCode('All')
            setFranchises([])
        }
    }

    // =====================================================
    // RESTORE PCR SEARCH RESULTS
    // =====================================================

    useEffect(() => {
        const restoreState = location.state

        if (!restoreState?.restoreSearch) return

        console.log('Restoring PCR search state:', restoreState)

        setRegionCode(restoreState.regionCode || '')
        setBranchCode(
            restoreState.branchCode ?? (isRole7 ? '' : 'All')
        )
        setFranchiseCode(restoreState.franchiseCode || 'All')
        setTicketNo(restoreState.ticketNo || '')
        setSpuNo(restoreState.spuNo || '')
        setFromDate(restoreState.fromDate || '')
        setToDate(restoreState.toDate || '')
        setStatus(restoreState.status || '1')

        const restoredData = Array.isArray(restoreState.pcrData)
            ? restoreState.pcrData
            : []

        setPcrData(restoredData)
        setShowResults(true)
        setError('')

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        )
    }, [location.state, isRole7])

    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = async () => {
        if (isRole7 && !regionCode) {
            setError('Please select a region.')
            setShowResults(false)
            setPcrData([])
            return
        }

        if (isRole7 && !branchCode) {
            setError('Please select a branch.')
            setShowResults(false)
            setPcrData([])
            return
        }

        try {
            setLoading(true)
            setError('')
            setShowResults(true)
            setPcrData([])

            const searchData = {
                branchCode: branchCode || 'All',
                franchiseCode: franchiseCode || 'All',
                ticketNo: ticketNo.trim(),
                spuNo: spuNo.trim(),
                status: status || '1',
                fromDate: fromDate || '',
                toDate: toDate || ''
            }

            console.log('PCR Search:', searchData)

            const response = await searchPCR(searchData)

            const data = getListFromResponse(response, [
                'results',
                'Results',
                'items',
                'Items'
            ])

            setPcrData(data)
        } catch (err) {
            console.error('PCR search failed:', err)

            setError(err.message || 'Unable to search PCR data.')
            setPcrData([])
        } finally {
            setLoading(false)
        }
    }

    // =====================================================
    // VIEW AND DOWNLOAD
    // =====================================================

    const handleViewAndDownload = () => {
        if (!pcrData || pcrData.length === 0) return

        setActivePage('pcr-download')
    }

    // =====================================================
    // ADD CATEGORY
    // =====================================================

    const handleAddCategory = () => {
        setActivePage('add-category')
    }

    // =====================================================
    // BACK FROM CHILD PAGES
    // =====================================================

    const handleBackToPCR = () => {
        setActivePage('pcr')
    }

    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (statusValue) => {
        const value = String(statusValue || '').trim().toLowerCase()

        if (
            value === 'submitted' ||
            value === 'submitted by branch' ||
            value === 'inprogress' ||
            value === 'in-progress' ||
            value === 'pending' ||
            value === 'rejected' ||
            value === 'closed'
        ) {
            return 'pcr-status-primary'
        }

        if (
            value === 'damaged' ||
            value === 'out of warranty' ||
            value === 'non genuine' ||
            value === 'tempered' ||
            value === 'part not received' ||
            value === 'wrong part code' ||
            value === 'mismatch' ||
            value === 'part not consumed in crm'
        ) {
            return 'pcr-status-danger'
        }

        if (value === 'approved') {
            return 'pcr-status-success'
        }

        return ''
    }

    // =====================================================
    // PCR DOWNLOAD PAGE
    // =====================================================

    if (activePage === 'pcr-download') {
        return (
            <PCRDownload
                pcrState={{
                    fromPCR: true,
                    pcrData,
                    regionCode,
                    branchCode,
                    franchiseCode,
                    ticketNo,
                    spuNo,
                    fromDate,
                    toDate,
                    status
                }}
                onBack={handleBackToPCR}
            />
        )
    }

    // =====================================================
    // ADD PART CATEGORY PAGE
    // =====================================================

    if (activePage === 'add-category') {
        return (
            <AddPartCategory
                pcrState={{
                    regionCode,
                    branchCode,
                    franchiseCode,
                    ticketNo,
                    spuNo,
                    fromDate,
                    toDate,
                    status,
                    pcrData
                }}
                onBack={handleBackToPCR}
            />
        )
    }

    // =====================================================
    // PCR MAIN PAGE
    // =====================================================

    return (
        <DashboardLayout title="PCR Segregation">
            <div className="pcr-page">
                {loading && !showResults ? (
                    <div className="pcr-page-loading">
                        <div className="pcr-loading">
                            <div className="pcr-loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <span className="pcr-loading-text">
                                Loading...
                            </span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* TOP ACTION */}
                        <div className="pcr-action-row">
                            <button
                                type="button"
                                className="pcr-add-button"
                                onClick={handleAddCategory}
                            >
                                Add Category
                            </button>
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="pcr-error">
                                {error}
                            </div>
                        )}

                        {/* SEARCH CARD */}
                        <div className="pcr-search-card">
                            <div className="pcr-search-grid">
                                {/* REGION */}
                                <div className="pcr-field">
                                    <label htmlFor="pcr-region">
                                        Select Region
                                    </label>

                                    <select
                                        id="pcr-region"
                                        value={regionCode}
                                        onChange={handleRegionChange}
                                        disabled={regionLoading}
                                    >
                                        <option value="All">All</option>

                                        {regions.map((region, index) => {
                                            const value = String(getRegionCode(region))
                                            const label = String(getRegionName(region))

                                            return (
                                                <option
                                                    key={value || `region-${index}`}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                {/* BRANCH */}
                                <div className="pcr-field">
                                    <label htmlFor="pcr-branch">
                                        Select Branch
                                    </label>

                                    <select
                                        id="pcr-branch"
                                        value={branchCode}
                                        onChange={handleBranchChange}
                                        disabled={branchLoading}
                                    >
                                        <option value="All">All</option>

                                        {branches.map((branch, index) => {
                                            const value = String(getBranchCode(branch))
                                            const label = String(getBranchName(branch))

                                            return (
                                                <option
                                                    key={value || `branch-${index}`}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                {/* FRANCHISE */}
                                <div className="pcr-field">
                                    <label htmlFor="pcr-franchise">
                                        Franchise
                                    </label>

                                    <select
                                        id="pcr-franchise"
                                        value={franchiseCode}
                                        onChange={(event) =>
                                            setFranchiseCode(
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            franchiseLoading ||
                                            (isRole7 && !branchCode)
                                        }
                                    >
                                        <option value="All">All</option>

                                        {franchises.map((franchise, index) => {
                                            const value = String(
                                                getFranchiseCode(franchise)
                                            )
                                            const label = String(
                                                getFranchiseName(franchise)
                                            )

                                            return (
                                                <option
                                                    key={
                                                        value ||
                                                        `franchise-${index}`
                                                    }
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                {/* TICKET NO */}
                                <div className="pcr-field">
                                    <label htmlFor="pcr-ticket">
                                        Ticket No.
                                    </label>

                                    <input
                                        id="pcr-ticket"
                                        type="text"
                                        value={ticketNo}
                                        onChange={(event) =>
                                            setTicketNo(event.target.value)
                                        }
                                        placeholder="Enter ticket no."
                                    />
                                </div>

                                {/* SPU NO */}
                                <div className="pcr-field">
                                    <label htmlFor="pcr-spu">
                                        SPU No.
                                    </label>

                                    <input
                                        id="pcr-spu"
                                        type="text"
                                        value={spuNo}
                                        onChange={(event) =>
                                            setSpuNo(event.target.value)
                                        }
                                        placeholder="Enter SPU no."
                                    />
                                </div>

                                
                                {/* FROM DATE */}
                                <div className="pcr-field">
                                    <label htmlFor="pcr-from-date">
                                        From Date
                                    </label>

                                    <div className="pcr-date-picker-container">
                                        <DatePicker
                                            id="pcr-from-date"
                                            selected={parsePCRDate(fromDate)}
                                            onChange={date => {
                                                const value = formatPCRInputDate(date)

                                                setFromDate(value)

                                                if (
                                                    value &&
                                                    toDate &&
                                                    toDate < value
                                                ) {
                                                    setToDate(value)
                                                }
                                            }}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="dd/mm/yyyy"
                                            className="pcr-date-control"
                                            calendarClassName="pcr-calendar"
                                            showPopperArrow={false}
                                            autoComplete="off"
                                            isClearable={false}
                                            popperPlacement="bottom-start"
                                            portalId="pcr-datepicker-portal"
                                        />

                                        <button
                                            type="button"
                                            className="pcr-calendar-icon"
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

                                {/* TO DATE */}
                                <div className="pcr-field">
                                    <label htmlFor="pcr-to-date">
                                        To Date
                                    </label>

                                    <div className="pcr-date-picker-container">
                                        <DatePicker
                                            id="pcr-to-date"
                                            selected={parsePCRDate(toDate)}
                                            onChange={date => setToDate(formatPCRInputDate(date))}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="dd/mm/yyyy"
                                            minDate={parsePCRDate(fromDate)}
                                            className="pcr-date-control"
                                            calendarClassName="pcr-calendar"
                                            showPopperArrow={false}
                                            autoComplete="off"
                                            isClearable={false}
                                            popperPlacement="bottom-start"
                                            portalId="pcr-datepicker-portal"
                                        />

                                        <button
                                            type="button"
                                            className="pcr-calendar-icon"
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

                                {/* STATUS */}
                                <div className="pcr-field">
                                    <label htmlFor="pcr-status">
                                        Status
                                    </label>

                                    <select
                                        id="pcr-status"
                                        value={status}
                                        onChange={(event) =>
                                            setStatus(event.target.value)
                                        }
                                    >
                                        {statuses.map((item, index) => {
                                            const value =
                                                item.id ??
                                                item.Id ??
                                                item.statusId ??
                                                item.StatusID ??
                                                ''

                                            const label =
                                                item.name ??
                                                item.Name ??
                                                item.statusName ??
                                                item.StatusName ??
                                                ''

                                            return (
                                                <option
                                                    key={
                                                        value ||
                                                        `status-${index}`
                                                    }
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="pcr-search-button-wrapper">
                                    <button
                                        type="button"
                                        className="pcr-view-download-button"
                                        onClick={handleViewAndDownload}
                                        disabled={
                                            loading ||
                                            pcrData.length === 0
                                        }
                                    >
                                        View &amp; Download
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-search pcr-search-button"
                                        onClick={handleSearch}
                                        disabled={loading}
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RESULT TABLE */}
                        {showResults && (
                            <div className="pcr-table-card">
                                <div className="pcr-table-wrapper">
                                    <table className="pcr-table">
                                        <thead>
                                            <tr>
                                                <th>Ticket No.</th>
                                                <th>Product</th>
                                                <th>Serial No.</th>
                                                <th>Spare</th>
                                                <th>Spare Description</th>
                                                <th>Quantity</th>
                                                <th>Status</th>
                                                <th>Price</th>
                                                <th>Credit</th>
                                                <th>Debit</th>
                                                <th>Marking</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td
                                                        colSpan="11"
                                                        className="pcr-loading-cell"
                                                    >
                                                        <div className="pcr-loading">
                                                            <div className="pcr-loading-dots">
                                                                <span></span>
                                                                <span></span>
                                                                <span></span>
                                                            </div>

                                                            <span className="pcr-loading-text">
                                                                Loading...
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : pcrData.length > 0 ? (
                                                pcrData.map((row, index) => {
                                                    const rowStatus =
                                                        row.status ??
                                                        row.Status ??
                                                        ''

                                                    const refId =
                                                        row.refId ??
                                                        row.RefId ??
                                                        ''

                                                    return (
                                                        <tr
                                                            key={
                                                                refId ||
                                                                `pcr-${index}`
                                                            }
                                                        >
                                                            <td>
                                                                {row.ticketNo ??
                                                                    row.TicketNo ??
                                                                    ''}
                                                            </td>

                                                            <td>
                                                                {row.product ??
                                                                    row.Product ??
                                                                    ''}
                                                            </td>

                                                            <td>
                                                                {row.serialNo ??
                                                                    row.SerialNo ??
                                                                    ''}
                                                            </td>

                                                            <td>
                                                                {row.spare ??
                                                                    row.Spare ??
                                                                    ''}
                                                            </td>

                                                            <td>
                                                                {row.spareDescription ??
                                                                    row.SpareDescription ??
                                                                    ''}
                                                            </td>

                                                            <td>
                                                                {row.quantity ??
                                                                    row.Quantity ??
                                                                    ''}
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={`pcr-status-badge ${getStatusClass(rowStatus)}`}
                                                                >
                                                                    {rowStatus}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {row.price ??
                                                                    row.Price ??
                                                                    ''}
                                                            </td>

                                                            <td>
                                                                {row.credit ??
                                                                    row.Credit ??
                                                                    ''}
                                                            </td>

                                                            <td>
                                                                {row.debit ??
                                                                    row.Debit ??
                                                                    ''}
                                                            </td>

                                                            <td>
                                                                {row.marking ??
                                                                    row.Marking ??
                                                                    ''}
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="11"
                                                        className="pcr-no-record"
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
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}

export default PCR