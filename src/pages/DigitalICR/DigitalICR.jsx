import { useEffect, useState } from 'react'
import './DigitalICR.css'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getRegions,
    getBranches,
    getFranchises
} from '../../api/reportsApi'

import {
    searchDigitalICR,
    exportDigitalICR
} from '../../api/digitalICRApi'

function DigitalICR() {
    // =========================================
    // SESSION VALUES
    // =========================================

    const sessionUserId = Number(
        sessionStorage.getItem('userId') || 0
    )

    // Use roles only. Login.jsx remains unchanged.
    let storedRoles = []

    try {
        const parsedRoles = JSON.parse(
            sessionStorage.getItem('roles') || '[]'
        )

        if (Array.isArray(parsedRoles)) {
            storedRoles = parsedRoles.map(role =>
                String(role).trim()
            )
        } else if (parsedRoles !== null && parsedRoles !== undefined) {
            storedRoles = [String(parsedRoles).trim()]
        }
    } catch (err) {
        console.error('Unable to parse stored roles:', err)
    }

    const roles = storedRoles

    const isRegionRole = roles.includes('1')
    const isFranchiseRole = roles.includes('5')
    const isBranchRole = roles.includes('6')

    const sessionRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const bpCode =
        sessionStorage.getItem('bpCode') || ''

    const loginId =
        sessionStorage.getItem('loginId') || ''

    // =========================================
    // REGION STATE
    // =========================================

    const [regions, setRegions] = useState([])
    const [selectedRegionCode, setSelectedRegionCode] = useState('')
    const [loadingRegions, setLoadingRegions] = useState(false)

    // =========================================
    // FORM STATE
    // =========================================

    const [branches, setBranches] = useState([])
    const [franchises, setFranchises] = useState([])

    const [branchCode, setBranchCode] = useState('All')
    const [franchiseCode, setFranchiseCode] = useState('All')

    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')

    // =========================================
    // RESULT STATE
    // =========================================

    const [records, setRecords] = useState([])
    const [searching, setSearching] = useState(false)
    const [downloading, setDownloading] = useState(false)

    // =========================================
    // LOADING STATE
    // =========================================

    const [loadingBranches, setLoadingBranches] = useState(false)
    const [loadingFranchises, setLoadingFranchises] = useState(false)

    // =========================================
    // MESSAGE STATE
    // =========================================

    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // =========================================
    // PROPERTY HELPERS
    // =========================================

    const getRegionCode = (item) =>
        item?.regionCode ??
        item?.RegionCode ??
        ''

    const getRegionName = (item) =>
        item?.regionName ??
        item?.RegionName ??
        item?.name ??
        item?.Name ??
        ''

    const getBranchCode = (item) =>
        item?.bpCode ??
        item?.BPCode ??
        item?.branchCode ??
        item?.BranchCode ??
        ''

    const getBranchName = (item) =>
        item?.branchName ??
        item?.BranchName ??
        item?.name ??
        item?.Name ??
        ''

    const getFranchiseCode = (item) =>
        item?.frCode ??
        item?.FrCode ??
        item?.Frcode ??
        item?.FRCode ??
        item?.frcode ??
        item?.loginId ??
        item?.LoginID ??
        ''

    const getFranchiseName = (item) =>
        item?.franchiseName ??
        item?.FranchiseName ??
        item?.userName ??
        item?.UserName ??
        item?.name ??
        item?.Name ??
        ''

    const equalsIgnoreCase = (first, second) =>
        String(first ?? '').trim().toLowerCase() ===
        String(second ?? '').trim().toLowerCase()

    // =========================================
    // API RESPONSE HELPER
    // =========================================

    const getArrayResponse = (response, propertyName) => {
        if (Array.isArray(response)) return response

        if (Array.isArray(response?.data)) {
            return response.data
        }

        if (Array.isArray(response?.[propertyName])) {
            return response[propertyName]
        }

        if (Array.isArray(response?.data?.[propertyName])) {
            return response.data[propertyName]
        }

        return []
    }

    // =========================================
    // DEBUG ROLE INFORMATION
    // =========================================

    useEffect(() => {
        console.log('Digital ICR roles:', roles)
        console.log('Is Region role:', isRegionRole)
        console.log('Is Franchise role:', isFranchiseRole)
        console.log('Is Branch role:', isBranchRole)
    }, [])

    // =========================================
    // LOAD REGIONS
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadRegions = async () => {
            try {
                setLoadingRegions(true)
                setError('')

                const response = await getRegions(
                    '',
                    sessionUserId
                )

                if (cancelled) return

                const data = getArrayResponse(
                    response,
                    'regions'
                )

                setRegions(data)

                if (isRegionRole) {
                    // Role 1: keep Region unselected.
                    setSelectedRegionCode('')
                } else if (isFranchiseRole || isBranchRole) {
                    const matchingRegion = data.find(item =>
                        equalsIgnoreCase(
                            getRegionCode(item),
                            sessionRegionCode
                        )
                    )

                    setSelectedRegionCode(
                        matchingRegion
                            ? String(getRegionCode(matchingRegion))
                            : sessionRegionCode
                    )
                } else {
                    setSelectedRegionCode('')
                }
            } catch (err) {
                if (cancelled) return

                console.error('Digital ICR region error:', err)

                setRegions([])
                setSelectedRegionCode('')

                setError(
                    err.message || 'Unable to load regions.'
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
    }, [
        sessionUserId,
        isRegionRole,
        isFranchiseRole,
        isBranchRole,
        sessionRegionCode
    ])

    // =========================================
    // LOAD BRANCHES
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadBranches = async () => {
            setBranches([])
            setBranchCode('All')
            setFranchises([])
            setFranchiseCode('All')

            if (!selectedRegionCode) {
                setLoadingBranches(false)
                return
            }

            try {
                setLoadingBranches(true)

                const response = await getBranches(
                    sessionUserId,
                    selectedRegionCode
                )

                if (cancelled) return

                const branchData = getArrayResponse(
                    response,
                    'branches'
                )

                const validBranches = branchData.filter(item =>
                    String(getBranchCode(item)).trim() !== '' &&
                    String(getBranchName(item)).trim() !== ''
                )

                console.log(
                    'Digital ICR branch response:',
                    response
                )

                console.log(
                    'Digital ICR parsed branches:',
                    validBranches
                )

                if (isRegionRole) {
                    // Role 1: preserve All and selectable branches.
                    const allBranches = validBranches.filter(
                        item =>
                            !equalsIgnoreCase(
                                getBranchCode(item),
                                'All'
                            )
                    )

                    const branchOptions = [
                        {
                            bpCode: 'All',
                            branchName: 'All'
                        },
                        ...allBranches
                    ]

                    setBranches(branchOptions)
                    setBranchCode('All')
                } else {
                    // Roles 5 and 6: select the logged-in user's branch.
                    setBranches(validBranches)

                    const matchingBranch = validBranches.find(item =>
                        equalsIgnoreCase(
                            getBranchCode(item),
                            bpCode
                        )
                    )

                    const selectedCode = matchingBranch
                        ? String(getBranchCode(matchingBranch))
                        : bpCode

                    setBranchCode(selectedCode)

                    console.log(
                        'Preselected branch code:',
                        selectedCode
                    )
                }
            } catch (err) {
                if (cancelled) return

                console.error(
                    'Digital ICR branch error:',
                    err
                )

                setBranches([])
                setBranchCode('All')
                setFranchises([])
                setFranchiseCode('All')

                setError(
                    err.message || 'Unable to load branches.'
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
    }, [
        selectedRegionCode,
        sessionUserId,
        isRegionRole,
        bpCode
    ])

    // =========================================
    // LOAD FRANCHISES
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadFranchises = async () => {
            setFranchises([])
            setFranchiseCode('All')

            if (!selectedRegionCode || !branchCode) {
                setLoadingFranchises(false)
                return
            }

            if (
                !isRegionRole &&
                !isFranchiseRole &&
                !isBranchRole
            ) {
                setLoadingFranchises(false)
                return
            }

            // Role 1: when All branches are selected,
            // fetch franchises using the existing behavior.
            // Roles 5 and 6: use their preselected branch.
            if (
                isRegionRole &&
                equalsIgnoreCase(branchCode, 'All')
            ) {
                // Keep Role 1 behavior: getFranchises is called
                // with the selected branch value, including All.
            }

            try {
                setLoadingFranchises(true)
                setError('')

                // Role 1 uses the selected branch.
                // Roles 5 and 6 use the session branch BP code.
                const franchiseBpCode = isRegionRole
                    ? branchCode
                    : bpCode

                console.log(
                    'Digital ICR franchise request:',
                    {
                        roles,
                        selectedRegionCode,
                        branchCode,
                        franchiseBpCode,
                        loginId
                    }
                )

                // reportsApi.js signature:
                // getFranchises(bpCode, loginId)
                const response = await getFranchises(
                    franchiseBpCode,
                    loginId
                )

                if (cancelled) return

                const franchiseData = getArrayResponse(
                    response,
                    'franchises'
                )

                console.log(
                    'Digital ICR franchise response:',
                    response
                )

                const validFranchises = franchiseData
                    .filter(
                        item =>
                            String(getFranchiseCode(item)).trim() !== ''
                    )
                    .sort((a, b) =>
                        String(getFranchiseName(a)).localeCompare(
                            String(getFranchiseName(b)),
                            undefined,
                            { sensitivity: 'base' }
                        )
                    )

                if (isRegionRole) {
                    // Role 1: All remains available.
                    const franchiseOptions = [
                        {
                            frCode: 'All',
                            franchiseName: 'All'
                        },
                        ...validFranchises.filter(
                            item =>
                                !equalsIgnoreCase(
                                    getFranchiseCode(item),
                                    'All'
                                )
                        )
                    ]

                    setFranchises(franchiseOptions)
                    setFranchiseCode('All')
                } else if (isFranchiseRole) {
                    // Role 5: preselect the logged-in franchise.
                    setFranchises(validFranchises)

                    const userFranchise = validFranchises.find(item =>
                        equalsIgnoreCase(
                            getFranchiseCode(item),
                            loginId
                        )
                    )

                    setFranchiseCode(
                        userFranchise
                            ? String(getFranchiseCode(userFranchise))
                            : loginId || 'All'
                    )
                } else if (isBranchRole) {
                    // Role 6: show all franchises belonging to
                    // the preselected branch; default to All.
                    const franchiseOptions = [
                        {
                            frCode: 'All',
                            franchiseName: 'All'
                        },
                        ...validFranchises.filter(
                            item =>
                                !equalsIgnoreCase(
                                    getFranchiseCode(item),
                                    'All'
                                )
                        )
                    ]

                    setFranchises(franchiseOptions)
                    setFranchiseCode('All')
                }
            } catch (err) {
                if (cancelled) return

                console.error(
                    'Digital ICR franchise error:',
                    err
                )

                setFranchises([])
                setFranchiseCode('All')

                setError(
                    err.message || 'Unable to load franchises.'
                )
            } finally {
                if (!cancelled) {
                    setLoadingFranchises(false)
                }
            }
        }

        loadFranchises()

        return () => {
            cancelled = true
        }
    }, [
        selectedRegionCode,
        branchCode,
        isRegionRole,
        isFranchiseRole,
        isBranchRole,
        bpCode,
        loginId
    ])

    // =========================================
    // REGION CHANGE
    // =========================================

    const handleRegionChange = (event) => {
        const regionCode = event.target.value

        setSelectedRegionCode(regionCode)

        setBranches([])
        setBranchCode('All')
        setFranchises([])
        setFranchiseCode('All')

        setRecords([])
        setError('')
        setMessage('')
    }

    // =========================================
    // BRANCH CHANGE
    // =========================================

    const handleBranchChange = (event) => {
        const selectedBranch = event.target.value

        setBranchCode(selectedBranch)
        setFranchises([])
        setFranchiseCode('All')

        setRecords([])
        setError('')
        setMessage('')
    }

    // =========================================
    // FRANCHISE CHANGE
    // =========================================

    const handleFranchiseChange = (event) => {
        setFranchiseCode(event.target.value)
        setError('')
        setMessage('')
    }

    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async () => {
        setError('')
        setMessage('')
        setRecords([])

        if (!selectedRegionCode) {
            setError('Region is required.')
            return
        }

        if (!fromDate || !toDate) {
            setError('From Date and To Date are required.')
            return
        }

        if (fromDate > toDate) {
            setError(
                'From Date cannot be greater than To Date.'
            )
            return
        }

        const searchData = {
            branchCode: branchCode || 'All',
            franchiseCode: franchiseCode || 'All',
            fromDate,
            toDate
        }

        console.log(
            'Digital ICR Search Request:',
            searchData
        )

        try {
            setSearching(true)

            const response = await searchDigitalICR(searchData)

            console.log(
                'Digital ICR Search Response:',
                response
            )

            const data = Array.isArray(response?.data)
                ? response.data
                : []

            setRecords(data)

            if (data.length === 0) {
                setMessage('No records found.')
            }
        } catch (err) {
            console.error(
                'Digital ICR search error:',
                err
            )

            setError(
                err.message || 'Unable to load Digital ICR data.'
            )
        } finally {
            setSearching(false)
        }
    }

    // =========================================
    // DOWNLOAD
    // =========================================

    const handleDownload = async () => {
        setError('')
        setMessage('')

        const searchData = {
            branchCode: branchCode || 'All',
            franchiseCode: franchiseCode || 'All',
            fromDate: fromDate || null,
            toDate: toDate || null
        }

        try {
            setDownloading(true)

            const blob = await exportDigitalICR(searchData)

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')

            link.href = url
            link.download = 'DigitalICR.xlsx'

            document.body.appendChild(link)
            link.click()
            link.remove()

            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error(
                'Digital ICR download error:',
                err
            )

            setError(
                err.message || 'Unable to download Digital ICR.'
            )
        } finally {
            setDownloading(false)
        }
    }

    // =========================================
    // FORMAT DATE
    // =========================================

    const formatICRDate = (value) => {
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
    // UI
    // =========================================

    return (
        <DashboardLayout title="Digital ICR">
            <div className="digital-icr-page">
                <div className="digital-icr-card">
                    <div className="digital-icr-filter-grid">
                        {/* REGION */}
                        <div className="digital-icr-field">
                            <label>Region</label>

                            <select
                                value={selectedRegionCode}
                                onChange={handleRegionChange}
                                disabled={
                                    loadingRegions ||
                                    isFranchiseRole ||
                                    isBranchRole
                                }
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

                        {/* BRANCH */}
                        <div className="digital-icr-field">
                            <label>Branch</label>

                            <select
                                value={branchCode}
                                onChange={handleBranchChange}
                                disabled={
                                    !selectedRegionCode ||
                                    loadingBranches ||
                                    isFranchiseRole ||
                                    isBranchRole
                                }
                            >
                                {isRegionRole && (
                                    <option value="All">All</option>
                                )}

                                {branches
                                    .filter(item =>
                                        !(
                                            isRegionRole &&
                                            equalsIgnoreCase(
                                                getBranchCode(item),
                                                'All'
                                            )
                                        )
                                    )
                                    .map((item, index) => (
                                        <option
                                            key={`${getBranchCode(item)}-${index}`}
                                            value={getBranchCode(item)}
                                        >
                                            {getBranchName(item)}
                                        </option>
                                    ))}

                                {!isRegionRole && branchCode === 'All' && (
                                    <option value="All">All</option>
                                )}
                            </select>
                        </div>

                        {/* FRANCHISE */}
                        <div className="digital-icr-field">
                            <label>Franchise</label>

                            <select
                                value={franchiseCode}
                                onChange={handleFranchiseChange}
                                disabled={
                                    !selectedRegionCode ||
                                    !branchCode ||
                                    loadingFranchises ||
                                    isFranchiseRole
                                }
                            >
                                {franchises.map((item, index) => (
                                    <option
                                        key={`${getFranchiseCode(item)}-${index}`}
                                        value={getFranchiseCode(item)}
                                    >
                                        {getFranchiseName(item)}
                                    </option>
                                ))}

                                {franchises.length === 0 && (
                                    <option value="All">All</option>
                                )}
                            </select>
                        </div>

                        {/* FROM DATE */}
                        <div className="digital-icr-field">
                            <label>
                                ICR From Date
                                <span className="required">*</span>
                            </label>

                            <input
                                type="date"
                                value={fromDate}
                                onChange={(event) =>
                                    setFromDate(event.target.value)
                                }
                            />
                        </div>

                        {/* TO DATE */}
                        <div className="digital-icr-field">
                            <label>
                                ICR To Date
                                <span className="required">*</span>
                            </label>

                            <input
                                type="date"
                                value={toDate}
                                onChange={(event) =>
                                    setToDate(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="digital-icr-error">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="digital-icr-message">
                            {message}
                        </div>
                    )}

                    <div className="digital-icr-actions">
                        <button
                            type="button"
                            className="digital-icr-search-button"
                            onClick={handleSearch}
                            disabled={searching}
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>

                        <button
                            type="button"
                            className="digital-icr-download-button"
                            onClick={handleDownload}
                            disabled={
                                records.length === 0 ||
                                downloading ||
                                searching
                            }
                        >
                            {downloading ? 'Downloading...' : 'Download'}
                        </button>
                    </div>
                </div>

                {/* RESULTS */}
                <div className="digital-icr-card">
                    {records.length > 0 && !searching && (
                        <h3 className="digital-icr-record-count">
                            {records.length} record
                            {records.length !== 1 ? 's' : ''} found
                        </h3>
                    )}

                    <div className="digital-icr-table-container">
                        <table className="digital-icr-table">
                            <thead>
                                <tr>
                                    <th>#TicketNo</th>
                                    <th>Customer</th>
                                    <th>Franchise</th>
                                    <th>Technician</th>
                                    <th>ICRNO</th>
                                    <th>Amount</th>
                                    <th>ICR Date</th>
                                    <th>PaymentMode</th>
                                    <th>Type</th>
                                </tr>
                            </thead>

                            <tbody>
                                {searching ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="digital-icr-loading-cell"
                                        >
                                            <div className="digital-icr-loading">
                                                <div className="digital-icr-loading-dots">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>

                                                <span className="digital-icr-loading-text">
                                                    Loading...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : records.length > 0 ? (
                                    records.map((record, index) => (
                                        <tr
                                            key={`${record.ticketNo || index}-${index}`}
                                        >
                                            <td>{record.ticketNo || ''}</td>
                                            <td>{record.customer || ''}</td>
                                            <td>{record.franchiseName || ''}</td>
                                            <td>{record.technician || ''}</td>
                                            <td>{record.icrNo || ''}</td>
                                            <td>{record.amount || ''}</td>
                                            <td>
                                                {formatICRDate(record.icrDate)}
                                            </td>
                                            <td>{record.paymentMode || ''}</td>
                                            <td>{record.type || ''}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="digital-icr-empty"
                                        >
                                            no record found change search criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default DigitalICR