
import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getRegions,
    getBranches,
    getFranchises
} from '../../api/reportsApi'

import {
    searchPCR,
    getPCRStatuses,
    getPCRSuppliers
} from '../../api/pcrApi'

import './PCRRequisitionView.css'

// =========================================
// HELPERS
// =========================================

function getArray(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.$values)) return data.$values
    if (Array.isArray(data?.data?.$values)) return data.data.$values
    return []
}

function getSessionValue(...keys) {
    for (const key of keys) {
        const value = sessionStorage.getItem(key)
        if (value !== null && value !== '') return value
    }
    return ''
}

function getSessionRoles() {
    try {
        const roles = JSON.parse(sessionStorage.getItem('roles') || '[]')
        if (!Array.isArray(roles)) return []

        return roles
            .map(role => {
                if (typeof role === 'object' && role !== null) {
                    return Number(
                        role.roleID ??
                        role.RoleID ??
                        role.roleId ??
                        role.RoleId ??
                        role.id ??
                        role.Id
                    )
                }
                return Number(role)
            })
            .filter(id => Number.isInteger(id) && id > 0)
    } catch {
        return []
    }
}

function getRegionCode(item) {
    return String(
        item?.regionCode ??
        item?.RegionCode ??
        item?.code ??
        item?.Code ??
        item?.value ??
        item?.Value ??
        ''
    )
}

function getRegionName(item) {
    return String(
        item?.regionName ??
        item?.RegionName ??
        item?.name ??
        item?.Name ??
        item?.text ??
        item?.Text ??
        getRegionCode(item)
    )
}

function getBranchCode(item) {
    return String(
        item?.bpCode ??
        item?.BPCode ??
        item?.branchCode ??
        item?.BranchCode ??
        item?.value ??
        item?.Value ??
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
        item?.text ??
        item?.Text ??
        getBranchCode(item)
    )
}

function getFranchiseCode(item) {
    return String(
        item?.frCode ??
        item?.FrCode ??
        item?.Frcode ??
        item?.FRCode ??
        item?.frcode ??
        item?.loginId ??
        item?.LoginID ??
        item?.LoginId ??
        item?.value ??
        item?.Value ??
        item?.code ??
        item?.Code ??
        ''
    )
}

function getFranchiseName(item) {
    return String(
        item?.franchiseName ??
        item?.FranchiseName ??
        item?.userName ??
        item?.UserName ??
        item?.name ??
        item?.Name ??
        item?.text ??
        item?.Text ??
        getFranchiseCode(item)
    )
}

function getOptionValue(item) {
    return String(
        item?.value ??
        item?.Value ??
        item?.id ??
        item?.Id ??
        item?.code ??
        item?.Code ??
        item?.vendorCode ??
        item?.VendorCode ??
        ''
    )
}

function getOptionText(item) {
    return String(
        item?.text ??
        item?.Text ??
        item?.name ??
        item?.Name ??
        item?.vendorName ??
        item?.VendorName ??
        getOptionValue(item)
    )
}

function getStatusId(item) {
    return String(
        item?.id ??
        item?.Id ??
        item?.statusId ??
        item?.StatusId ??
        ''
    )
}

function getStatusName(item) {
    return String(
        item?.name ??
        item?.Name ??
        item?.statusName ??
        item?.StatusName ??
        getStatusId(item)
    )
}

function sameCode(first, second) {
    return String(first ?? '').trim().toLowerCase() ===
        String(second ?? '').trim().toLowerCase()
}

function getRowValue(row, ...keys) {
    for (const key of keys) {
        if (row?.[key] !== undefined && row?.[key] !== null) {
            return row[key]
        }
    }
    return ''
}

// =========================================
// DATE HELPERS
// =========================================

function formatDateInput(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-')
}

const todayString = formatDateInput(new Date())

const initialFromDate = new Date()
initialFromDate.setDate(initialFromDate.getDate() - 120)
const initialFromDateString = formatDateInput(initialFromDate)

// =========================================
// PCR REQUISITION VIEW
// =========================================

function PCRRequisitionView({ onBack }) {
    const userId = getSessionValue('userId', 'UserID')
    const bpCode = getSessionValue('bpCode', 'BPCode')
    const regionCode = getSessionValue('regionCode', 'RegionCode')
    const loginId = getSessionValue('loginId', 'LoginID')

    const sessionRoles = getSessionRoles()
    const storedRoleId = Number(getSessionValue('roleId', 'RoleID'))

    const roleId = sessionRoles.includes(storedRoleId)
        ? storedRoleId
        : sessionRoles.length === 1
            ? sessionRoles[0]
            : storedRoleId || 0

    const isBranchRole = roleId === 6
    const isFranchiseRole = roleId === 5
    const isBranchOrFranchiseRole = isBranchRole || isFranchiseRole

    const [regions, setRegions] = useState([])
    const [branches, setBranches] = useState([])
    const [franchises, setFranchises] = useState([])
    const [statuses, setStatuses] = useState([])
    const [suppliers, setSuppliers] = useState([])

    const [selectedRegionCode, setSelectedRegionCode] = useState(regionCode)

    const [filters, setFilters] = useState({
        BranchCode: bpCode,
        FranchiseCode: isFranchiseRole ? loginId : '',
        TicketNo: '',
        SPUNo: '',
        Status: '1',
        VendorCode: '0',
        FromDate: initialFromDateString,
        ToDate: todayString
    })

    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(false)
    const [lookupLoading, setLookupLoading] = useState(true)
    const [error, setError] = useState('')
    const [searched, setSearched] = useState(false)

    const updateFilter = (name, value) => {
        setFilters(previous => ({
            ...previous,
            [name]: value
        }))
    }

    // =========================================
    // LOAD REGION, STATUS AND SUPPLIER LOOKUPS
    // =========================================

    useEffect(() => {
        let cancelled = false

        async function loadLookups() {
            setLookupLoading(true)

            const results = await Promise.allSettled([
                getRegions('', Number(userId) || 0),
                getPCRStatuses(),
                getPCRSuppliers()
            ])

            if (cancelled) return

            if (results[0].status === 'fulfilled') {
                const regionList = getArray(results[0].value)
                setRegions(regionList)

                const matchedRegion = regionList.find(item =>
                    sameCode(getRegionCode(item), regionCode)
                )

                setSelectedRegionCode(
                    matchedRegion ? getRegionCode(matchedRegion) : regionCode
                )
            } else {
                setError(
                    results[0].reason?.message || 'Unable to load regions.'
                )
            }

            if (results[1].status === 'fulfilled') {
                setStatuses(getArray(results[1].value))
            } else {
                setError(
                    results[1].reason?.message || 'Unable to load PCR statuses.'
                )
            }

            if (results[2].status === 'fulfilled') {
                setSuppliers(getArray(results[2].value))
            } else {
                setError(
                    results[2].reason?.message || 'Unable to load suppliers.'
                )
            }

            setLookupLoading(false)
        }

        loadLookups().catch(err => {
            if (!cancelled) {
                setError(err?.message || 'Unable to load filter options.')
                setLookupLoading(false)
            }
        })

        return () => {
            cancelled = true
        }
    }, [userId, regionCode])

    // =========================================
    // LOAD BRANCHES
    // =========================================

    useEffect(() => {
        let cancelled = false

        async function loadBranches() {
            try {
                const response = await getBranches(
                    Number(userId) || 0,
                    selectedRegionCode
                )

                if (cancelled) return

                const branchList = getArray(response)
                setBranches(branchList)

                if (isBranchOrFranchiseRole) {
                    const matchedBranch = branchList.find(item =>
                        sameCode(getBranchCode(item), bpCode)
                    )

                    setFilters(previous => ({
                        ...previous,
                        BranchCode: matchedBranch
                            ? getBranchCode(matchedBranch)
                            : bpCode
                    }))
                }
            } catch (err) {
                if (!cancelled) {
                    setBranches([])
                    setError(err?.message || 'Unable to load branches.')
                }
            }
        }

        if (selectedRegionCode) {
            loadBranches()
        } else {
            setBranches([])
        }

        return () => {
            cancelled = true
        }
    }, [
        userId,
        selectedRegionCode,
        bpCode,
        isBranchOrFranchiseRole
    ])

    // =========================================
    // LOAD FRANCHISES
    // =========================================

    useEffect(() => {
        let cancelled = false

        async function loadFranchises() {
            try {
                const response = await getFranchises(bpCode, loginId)

                if (cancelled) return

                const franchiseList = getArray(response)
                setFranchises(franchiseList)

                if (isFranchiseRole) {
                    const matchedFranchise = franchiseList.find(item =>
                        sameCode(getFranchiseCode(item), loginId)
                    )

                    setFilters(previous => ({
                        ...previous,
                        FranchiseCode: matchedFranchise
                            ? getFranchiseCode(matchedFranchise)
                            : loginId
                    }))
                }
            } catch (err) {
                if (!cancelled) {
                    setFranchises([])
                    setError(err?.message || 'Unable to load franchises.')
                }
            }
        }

        if (bpCode && loginId) {
            loadFranchises()
        } else {
            setFranchises([])
        }

        return () => {
            cancelled = true
        }
    }, [bpCode, loginId, isFranchiseRole])

    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async event => {
        event.preventDefault()
        setError('')

        if (!filters.BranchCode) {
            setError('Please select a Branch.')
            return
        }

        

        if (!filters.FromDate || !filters.ToDate) {
            setError('Please select both From Date and To Date.')
            return
        }

        if (filters.FromDate > filters.ToDate) {
            setError('From Date cannot be later than To Date.')
            return
        }

        setLoading(true)
        setSearched(true)

        try {
            const request = {
                BranchCode: filters.BranchCode || bpCode,
                FranchiseCode: 'All',
                TicketNo: filters.TicketNo.trim(),
                SPUNo: filters.SPUNo.trim(),
                Status: filters.Status || '1',
                FromDate: filters.FromDate,
                ToDate: filters.ToDate
            }

            const response = await searchPCR(request)
            setRows(getArray(response))
        } catch (err) {
            setRows([])
            setError(
                err?.message || 'Unable to search submitted PCR records.'
            )
        } finally {
            setLoading(false)
        }
    }

    // =========================================
    // RESET
    // =========================================

    const handleReset = () => {
        setFilters({
            BranchCode: bpCode,
            FranchiseCode: isFranchiseRole ? loginId : '',
            TicketNo: '',
            SPUNo: '',
            Status: '1',
            VendorCode: '0',
            FromDate: initialFromDateString,
            ToDate: todayString
        })

        setSelectedRegionCode(regionCode)
        setRows([])
        setSearched(false)
        setError('')
    }

    // =========================================
    // UI
    // =========================================

    return (
        <DashboardLayout title="Submitted PCR">
            <main className="pcr-requisition-page">
                <div className="pcr-requisition-topbar">
                    <button
                        type="button"
                        className="pcr-rv-btn pcr-rv-btn-secondary"
                        onClick={onBack}
                    >
                        Back
                    </button>
                </div>

                {error && (
                    <div className="pcr-rv-alert" role="alert">
                        {error}
                    </div>
                )}

                <section className="pcr-rv-panel">
                    <form
                        id="pcr-requisition-search-form"
                        onSubmit={handleSearch}
                    >
                        <div className="pcr-rv-filter-grid">
                            <label className="pcr-rv-field">
                                <span>Region</span>
                                <select
                                    value={selectedRegionCode}
                                    disabled={isBranchOrFranchiseRole}
                                    onChange={event => {
                                        setSelectedRegionCode(event.target.value)
                                        setFilters(previous => ({
                                            ...previous,
                                            BranchCode: '',
                                            FranchiseCode: ''
                                        }))
                                    }}
                                >
                                    <option value="">Select Region</option>
                                    {regions.map((item, index) => (
                                        <option
                                            key={`${getRegionCode(item)}-${index}`}
                                            value={getRegionCode(item)}
                                        >
                                            {getRegionName(item)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="pcr-rv-field">
                                <span>Branch</span>
                                <select
                                    value={filters.BranchCode}
                                    disabled={isBranchOrFranchiseRole}
                                    onChange={event => {
                                        setFilters(previous => ({
                                            ...previous,
                                            BranchCode: event.target.value,
                                            FranchiseCode: ''
                                        }))
                                    }}
                                    required
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map((item, index) => (
                                        <option
                                            key={`${getBranchCode(item)}-${index}`}
                                            value={getBranchCode(item)}
                                        >
                                            {getBranchName(item)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="pcr-rv-field">
                                <span>Franchise</span>
                                <select
                                    value={filters.FranchiseCode || 'All'}
                                    onChange={event =>
                                        updateFilter('FranchiseCode', event.target.value)
                                    }
                                >
                                    <option value="All">All Franchises</option>
                                    {franchises.map((item, index) => (
                                        <option
                                            key={`${getFranchiseCode(item)}-${index}`}
                                            value={getFranchiseCode(item)}
                                        >
                                            {getFranchiseName(item)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="pcr-rv-field">
                                <span>Ticket No.</span>
                                <input
                                    type="text"
                                    value={filters.TicketNo}
                                    onChange={event =>
                                        updateFilter('TicketNo', event.target.value)
                                    }
                                    maxLength={50}
                                />
                            </label>

                            <label className="pcr-rv-field">
                                <span>Status</span>
                                <select
                                    value={filters.Status}
                                    onChange={event =>
                                        updateFilter('Status', event.target.value)
                                    }
                                    disabled={lookupLoading}
                                >
                                    <option value="All">All</option>
                                    <option value="0">Draft</option>
                                    {statuses.map((item, index) => (
                                        <option
                                            key={`${getStatusId(item)}-${index}`}
                                            value={getStatusId(item)}
                                        >
                                            {getStatusName(item)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="pcr-rv-field">
                                <span>Supplier</span>
                                <select
                                    value={filters.VendorCode}
                                    onChange={event =>
                                        updateFilter('VendorCode', event.target.value)
                                    }
                                >
                                    <option value="0">All Suppliers</option>
                                    {suppliers.map((item, index) => (
                                        <option
                                            key={`${getOptionValue(item)}-${index}`}
                                            value={getOptionValue(item)}
                                        >
                                            {getOptionText(item)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="pcr-rv-date-action-row">
                            <div className="pcr-rv-date-fields">
                                <label className="pcr-rv-field">
                                    <span>From Date</span>
                                    <input
                                        type="date"
                                        value={filters.FromDate}
                                        max={filters.ToDate || todayString}
                                        onChange={event =>
                                            updateFilter('FromDate', event.target.value)
                                        }
                                        required
                                    />
                                </label>

                                <label className="pcr-rv-field">
                                    <span>To Date</span>
                                    <input
                                        type="date"
                                        value={filters.ToDate}
                                        min={filters.FromDate}
                                        max={todayString}
                                        onChange={event =>
                                            updateFilter('ToDate', event.target.value)
                                        }
                                        required
                                    />
                                </label>
                            </div>

                            <div className="pcr-rv-actions">
                                <button
                                    type="submit"
                                    className="pcr-rv-btn pcr-rv-btn-primary"
                                    disabled={loading || lookupLoading}
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </button>

                                <button
                                    type="button"
                                    className="pcr-rv-btn pcr-rv-btn-secondary"
                                    onClick={handleReset}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                <section className="pcr-rv-panel pcr-rv-results-panel">
                    <div className="pcr-rv-grid-heading">
                        <h2>Submitted PCR Records</h2>
                        <span>{rows.length} record(s)</span>
                    </div>

                        <div
                            className={`pcr-rv-table-wrapper ${
                                !loading && rows.length === 0
                                    ? 'pcr-rv-table-wrapper-empty'
                                    : ''
                            }`}
                        >
                        <table className="pcr-rv-table">
                            <thead>
                                <tr>
                                    <th>Ticket No.</th>
                                    <th>Product Name</th>
                                    <th>Vendor</th>
                                    <th>Franchise</th>
                                    <th>Serial No.</th>
                                    <th>Spare</th>
                                    <th>Spare Description</th>
                                    <th>Marking</th>
                                    <th>Remark</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="pcr-rv-empty">
                                            Loading submitted PCR records...
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="pcr-rv-empty">
                                            {searched
                                                ? 'No records found.'
                                                : 'Select your filters and click Search.'}
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, index) => (
                                        <tr
                                            key={
                                                getRowValue(row, 'refId', 'RefId') || index
                                            }
                                        >
                                            <td>{getRowValue(row, 'ticketNo', 'TicketNo', 'tikectNo', 'TikectNo')}</td>
                                            <td>{getRowValue(row, 'product', 'Product', 'productName', 'ProductName')}</td>
                                            <td>{getRowValue(row, 'vendor', 'Vendor', 'vendorName', 'VendorName')}</td>
                                            <td>{getRowValue(row, 'franchise', 'Franchise', 'franchiseName', 'FranchiseName')}</td>
                                            <td>{getRowValue(row, 'serialNo', 'SerialNo', 'serial', 'Serial')}</td>
                                            <td>{getRowValue(row, 'spare', 'Spare', 'itemNo', 'ItemNo', 'item_no')}</td>
                                            <td>{getRowValue(row, 'spareDescription', 'SpareDescription', 'item_desc', 'ItemDescription')}</td>
                                            <td>{getRowValue(row, 'marking', 'Marking')}</td>
                                            <td>{getRowValue(row, 'remark', 'Remark')}</td>
                                            <td>{getRowValue(row, 'status', 'Status')}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </DashboardLayout>
    )
}

export default PCRRequisitionView
