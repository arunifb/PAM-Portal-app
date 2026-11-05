
import { useEffect, useState } from 'react'
import './SparesStock.css'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getRegions 
} from '../../api/reportsApi'

import {
    searchSpareStock,
    getSpareStockPlants
} from '../../api/spareStockApi'


function SparesStock() {

    // =========================================
    // LOGGED-IN USER DETAILS
    // Read roles from sessionStorage.roles
    // =========================================

    let storedRoles = []

    try {
        const parsedRoles = JSON.parse(
            sessionStorage.getItem('roles') || '[]'
        )

        if (Array.isArray(parsedRoles)) {
            storedRoles = parsedRoles.map(role =>
                String(role).trim()
            )
        } else if (
            parsedRoles !== null &&
            parsedRoles !== undefined
        ) {
            storedRoles = [String(parsedRoles).trim()]
        }
    } catch (error) {
        console.error('Unable to parse stored roles:', error)
    }

    const isRegionRole = storedRoles.includes('1')
    const isBranchRole = storedRoles.includes('6')

    const sessionRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const sessionBpCode =
        sessionStorage.getItem('bpCode') || ''


    // =========================================
    // GET VIEWER USER ID
    // =========================================

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


    // =========================================
    // FORM STATE
    // =========================================

    const [regions, setRegions] = useState([])

    // Role 6: preselect the logged-in user's region.
    // Other roles: preserve the empty default.

    const [regionCode, setRegionCode] = useState(
        isBranchRole ? sessionRegionCode : ''
    )

    // Branch initially contains All.

    const [branches, setBranches] = useState([
        {
            bpCode: 'All',
            branchName: 'All'
        }
    ])

    const [branchCode, setBranchCode] = useState('All')

    const [matGrp, setMatGrp] = useState('')
    const [material, setMaterial] = useState('')
    const [sloc, setSloc] = useState('')
    const [partName, setPartName] = useState('')


    // =========================================
    // RESULT STATE
    // =========================================

    const [records, setRecords] = useState([])


    // =========================================
    // LOADING STATE
    // =========================================

    const [loadingRegions, setLoadingRegions] = useState(false)
    const [loadingBranches, setLoadingBranches] = useState(false)
    const [searching, setSearching] = useState(false)


    // =========================================
    // MESSAGE STATE
    // =========================================

    const [error, setError] = useState('')
    const [message, setMessage] = useState('')


    // =========================================
    // GET REGION CODE
    // =========================================

    const getRegionCode = (item) => {
        return (
            item.regionCode ??
            item.RegionCode ??
            item.regioncode ??
            ''
        )
    }


    // =========================================
    // GET BRANCH CODE
    // =========================================

    const getBranchCode = (item) => {
        return (
            item.bpCode ??
            item.BPCode ??
            item.BpCode ??
            item.branchCode ??
            item.BranchCode ??
            ''
        )
    }


    // =========================================
    // GET BRANCH NAME
    // =========================================

    const getBranchName = (item) => {
        return (
            item.branchName ??
            item.BranchName ??
            item.name ??
            item.Name ??
            ''
        )
    }


    // =========================================
    // LOAD REGIONS
    // =========================================

    useEffect(() => {
        let isMounted = true

        const loadRegions = async () => {
            try {
                setLoadingRegions(true)
                setError('')

                const viewerUserId = getViewerUserId()

                if (!viewerUserId) {
                    setRegions([])
                    setError('User ID is not available.')
                    return
                }

                const response = await getRegions(
                    '',
                    viewerUserId
                )

                if (!isMounted) {
                    return
                }

                const regionData = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                        ? response.data
                        : []

                setRegions(regionData)

                // Role 6: match the session region against
                // the returned region list, ignoring case.

                if (isBranchRole && sessionRegionCode) {
                    const matchingRegion = regionData.find(region =>
                        String(getRegionCode(region))
                            .trim()
                            .toLowerCase() ===
                        String(sessionRegionCode)
                            .trim()
                            .toLowerCase()
                    )

                    if (matchingRegion) {
                        const matchedRegionCode = String(
                            getRegionCode(matchingRegion)
                        ).trim()

                        setRegionCode(matchedRegionCode)
                    } else {
                        setRegionCode(sessionRegionCode)
                        setError(
                            'The logged-in user region was not found in the region list.'
                        )
                    }
                }
            } catch (error) {
                if (!isMounted) {
                    return
                }

                console.error(
                    'Spares Stock region error:',
                    error
                )

                setRegions([])
                setError(
                    error.message ||
                    'Unable to load regions.'
                )
            } finally {
                if (isMounted) {
                    setLoadingRegions(false)
                }
            }
        }

        loadRegions()

        return () => {
            isMounted = false
        }
    }, [])


    

    // =========================================
    // LOAD BRANCHES USING SPARE STOCK PLANTS API
    // =========================================

const loadBranches = async (selectedRegionCode) => {
    if (!selectedRegionCode) {
        setBranches([
            {
                bpCode: 'All',
                branchName: 'All'
            }
        ])

        setBranchCode('All')
        return
    }

    try {
        setLoadingBranches(true)
        setError('')

        // Call the new Plants API.
        // The API returns BPCode and BranchName.

        const response = await getSpareStockPlants(
            selectedRegionCode
        )

        const branchData = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.Data)
                    ? response.Data
                    : []

        // Remove any existing All entries.

        const filteredBranches = branchData.filter(item => {
            const code = String(
                getBranchCode(item)
            ).trim().toLowerCase()

            return code !== 'all'
        })

        // Keep the Branch dropdown and add All as its first option.

        setBranches([
            {
                bpCode: 'All',
                branchName: 'All'
            },
            ...filteredBranches
        ])

        // Role 6: automatically select logged-in user's branch.

        if (isBranchRole) {
            const normalizedSessionBpCode =
                String(sessionBpCode).trim().toLowerCase()

            const matchingBranch = normalizedSessionBpCode
                ? filteredBranches.find(item =>
                    String(getBranchCode(item))
                        .trim()
                        .toLowerCase() === normalizedSessionBpCode
                )
                : null

            if (matchingBranch) {
                setBranchCode(
                    String(getBranchCode(matchingBranch)).trim()
                )
            } else if (filteredBranches.length > 0) {
                setBranchCode(
                    String(getBranchCode(filteredBranches[0])).trim()
                )
            } else {
                setBranchCode('All')
            }
        } else {
            // Role 1: default selection remains All.
            setBranchCode('All')
        }

    } catch (error) {
        console.error(
            'Spares Stock branch error:',
            error
        )

        setBranches([
            {
                bpCode: 'All',
                branchName: 'All'
            }
        ])

        setBranchCode('All')

        setError(
            error.message ||
            'Unable to load branches.'
        )
    } finally {
        setLoadingBranches(false)
    }
}


    // =========================================
    // ROLE 6: LOAD BRANCHES AFTER REGION LOADS
    // =========================================

    useEffect(() => {
        if (
            isBranchRole &&
            !loadingRegions &&
            regionCode
        ) {
            loadBranches(regionCode)
        }
    }, [isBranchRole, loadingRegions, regionCode])


    // =========================================
    // REGION CHANGE
    // =========================================

    const handleRegionChange = async (event) => {
        const value = event.target.value

        setRegionCode(value)
        setBranchCode('All')

        setBranches([
            {
                bpCode: 'All',
                branchName: 'All'
            }
        ])

        setRecords([])
        setError('')
        setMessage('')

        if (value) {
            await loadBranches(value)
        }
    }


    // =========================================
    // BRANCH CHANGE
    // =========================================

    const handleBranchChange = (event) => {
        setBranchCode(event.target.value)
        setRecords([])
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

        if (!regionCode) {
            setError('Region is required.')
            return
        }

        const searchData = {
            RegionCode: regionCode,

            BpCode:
                branchCode === 'All'
                    ? ''
                    : branchCode || '',

            Material: material || '',
            PartName: partName || '',
            MatGrp: matGrp || '',
            Sloc: sloc || ''
        }

        console.log(
            'Spares Stock Search Request:',
            searchData
        )

        try {
            setSearching(true)

            const requestData = {
                regionCode: searchData.RegionCode,
                bpCode: searchData.BpCode,
                material: searchData.Material,
                partName: searchData.PartName,
                matGrp: searchData.MatGrp,
                sloc: searchData.Sloc
            }

            const response = await searchSpareStock(requestData)

            console.log(
                'Spares Stock Search Response:',
                response
            )

            const data = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.Data)
                ? response.Data
                : []

            setRecords(data)

            if (data.length === 0) {
                setMessage('No Record Found')
            }
        } catch (error) {
            console.error(
                'Spares Stock search error:',
                error
            )

            setError(
                error.message ||
                'Unable to load Spares Stock data.'
            )
        } finally {
            setSearching(false)
        }
    }


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatStockDate = (value) => {
        if (!value) {
            return ''
        }

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return value
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


    // =========================================
    // UI
    // =========================================

    return (
        <DashboardLayout title="Spares Stock">
            <div className="spares-stock-page">

                {/* FILTER CARD */}

                <div className="spares-stock-card">
                    <div className="spares-stock-filter-grid">

                        {/* REGION */}

                        <div className="spares-stock-field">
                            <label>
                                Region
                                <span className="required">*</span>
                            </label>

                            <select
                                value={regionCode}
                                onChange={handleRegionChange}
                                disabled={
                                    loadingRegions ||
                                    isBranchRole
                                }
                            >
                                <option value="">
                                    Select Region
                                </option>

                                {regions.map((region, index) => {
                                    const value = getRegionCode(region)

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

                        <div className="spares-stock-field">
                            <label>Branch</label>

                            <select
                                value={branchCode}
                                onChange={handleBranchChange}
                                disabled={
                                    // isBranchRole ||
                                    !regionCode ||
                                    loadingBranches
                                }
                            >
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


                        {/* PART GROUP */}

                        <div className="spares-stock-field">
                            <label>Part Group</label>

                            <input
                                type="text"
                                value={matGrp}
                                onChange={event =>
                                    setMatGrp(event.target.value)
                                }
                                placeholder="type or copy here"
                            />
                        </div>


                        {/* PART CODE */}

                        <div className="spares-stock-field">
                            <label>Part Code</label>

                            <input
                                type="text"
                                value={material}
                                onChange={event =>
                                    setMaterial(event.target.value)
                                }
                                maxLength={16}
                            />
                        </div>


                        {/* SLOC */}

                        <div className="spares-stock-field">
                            <label>Sloc</label>

                            <input
                                type="text"
                                value={sloc}
                                onChange={event =>
                                    setSloc(event.target.value)
                                }
                                maxLength={10}
                            />
                        </div>


                        {/* PART NAME */}

                        <div className="spares-stock-field">
                            <label>Part Name</label>

                            <input
                                type="text"
                                value={partName}
                                onChange={event =>
                                    setPartName(event.target.value)
                                }
                                maxLength={64}
                            />
                        </div>

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="spares-stock-error">
                            {error}
                        </div>
                    )}


                    {/* MESSAGE */}

                    {message && (
                        <div className="spares-stock-message">
                            {message}
                        </div>
                    )}


                    {/* SEARCH BUTTON */}

                    <div className="spares-stock-actions">
                        <button
                            type="button"
                            className="btn-search spares-stock-search-button"
                            onClick={handleSearch}
                            disabled={searching}
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>


                {/* RESULTS CARD */}

                <div className="spares-stock-card">

                    {records.length > 0 && !searching && (
                        <h3 className="spares-stock-record-count">
                            {records.length} record
                            {records.length !== 1 ? 's' : ''}
                            {' '}found
                        </h3>
                    )}


                    {/* TABLE */}

                    <div className="spares-stock-table-container">
                        <table className="spares-stock-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Plant</th>
                                    <th>Name</th>
                                    <th>Part Group</th>
                                    <th>Part Code</th>
                                    <th>Part</th>
                                    <th>Quantity</th>
                                    <th>Sloc</th>
                                    <th>Created Date</th>
                                    <th>Updated Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {searching ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="spares-stock-loading-cell"
                                        >
                                            <div className="spares-stock-loading">
                                                <div className="spares-stock-loading-dots">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>

                                                <span className="spares-stock-loading-text">
                                                    Loading...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : records.length > 0 ? (
                                    records.map((record, index) => (
                                        <tr
                                            key={`${record.rowIndex || index}-${index}`}
                                        >
                                            <td>
                                                {record.rowIndex || index + 1}
                                            </td>

                                            <td>{record.plant || ''}</td>
                                            <td>{record.branch || ''}</td>
                                            <td>{record.matGrp || ''}</td>
                                            <td>{record.material || ''}</td>
                                            <td>{record.partName || ''}</td>
                                            <td>{record.quantity || ''}</td>
                                            <td>{record.sloc || ''}</td>

                                            <td>
                                                {formatStockDate(record.createdDate)}
                                            </td>

                                            <td>
                                                {formatStockDate(record.updatedDate)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="spares-stock-empty"
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

export default SparesStock
