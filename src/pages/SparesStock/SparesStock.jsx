
import { useEffect, useState } from 'react'
import './SparesStock.css'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getRegions,
    getBranches
} from '../../api/reportsApi'

import {
    searchSpareStock
} from '../../api/spareStockApi'


function SparesStock() {

    // =========================================
    // LOGGED-IN USER DETAILS
    // =========================================

    const roleId =
        sessionStorage.getItem('roleId') ||
        sessionStorage.getItem('roleID') ||
        ''

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
    // Role 1: preserve the existing empty default.

    const [regionCode, setRegionCode] = useState(
        roleId === '6'
            ? sessionRegionCode
            : ''
    )


    // Branch initially contains "All".

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

                const regionData =
                    Array.isArray(response)
                        ? response
                        : Array.isArray(response?.data)
                            ? response.data
                            : []

                setRegions(regionData)

            }
            catch (error) {

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

            }
            finally {

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
    // LOAD BRANCHES
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

            const viewerUserId = getViewerUserId()

            if (!viewerUserId) {

                setBranches([
                    {
                        bpCode: 'All',
                        branchName: 'All'
                    }
                ])

                setBranchCode('All')

                setError('User ID is not available.')

                return

            }

            const response = await getBranches(
                viewerUserId,
                selectedRegionCode
            )

            const branchData =
                Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                        ? response.data
                        : []

            // Remove any existing "All" entry from the API data.

            const filteredBranches = branchData.filter(item => {

                const code = String(
                    getBranchCode(item)
                ).trim().toLowerCase()

                return code !== 'all'

            })

            // Add one "All" option to the dropdown.

            setBranches([
                {
                    bpCode: 'All',
                    branchName: 'All'
                },
                ...filteredBranches
            ])


            // =====================================
            // ROLE 6: AUTO-SELECT SESSION BRANCH
            // =====================================

            if (roleId === '6') {

                const normalizedSessionBpCode =
                    String(sessionBpCode).trim()

                const matchingBranch = normalizedSessionBpCode
                    ? filteredBranches.find(item => {

                        const code = String(
                            getBranchCode(item)
                        ).trim()

                        return code === normalizedSessionBpCode

                    })
                    : null

                if (matchingBranch) {

                    // Select the branch matching session BPCode.

                    setBranchCode(
                        String(getBranchCode(matchingBranch))
                    )

                }
                else if (filteredBranches.length > 0) {

                    // If the saved BPCode isn't returned,
                    // select the first available branch.

                    setBranchCode(
                        String(getBranchCode(filteredBranches[0]))
                    )

                }
                else {

                    // No branches available.

                    setBranchCode('All')

                }

            }
            else {

                // Preserve existing Role 1 behavior.

                setBranchCode('All')

            }

        }
        catch (error) {

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

        }
        finally {

            setLoadingBranches(false)

        }

    }


    // =========================================
    // ROLE 6: LOAD SESSION REGION BRANCHES
    // =========================================

    useEffect(() => {

        if (roleId === '6' && sessionRegionCode) {

            loadBranches(sessionRegionCode)

        }

    }, [])


    // =========================================
    // REGION CHANGE
    // =========================================

    const handleRegionChange = async (event) => {

        const value = event.target.value

        setRegionCode(value)

        setBranchCode('All')

        // Keep "All" visible while branches load.

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

        // REGION REQUIRED

        if (!regionCode) {

            setError('Region is required.')

            return

        }

        // SEARCH DATA

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

            // API REQUEST

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

            const data =
                Array.isArray(response?.data)
                    ? response.data
                    : []

            setRecords(data)

            if (data.length === 0) {

                setMessage('No Record Found')

            }

        }
        catch (error) {

            console.error(
                'Spares Stock search error:',
                error
            )

            setError(
                error.message ||
                'Unable to load Spares Stock data.'
            )

        }
        finally {

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

                    {/* FILTER GRID */}

                    <div className="spares-stock-filter-grid">

                        {/* REGION */}

                        <div className="spares-stock-field">

                            <label>
                                Region
                                <span className="required">
                                    *
                                </span>
                            </label>

                            <select
                                value={regionCode}
                                onChange={handleRegionChange}
                                disabled={loadingRegions}
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

                        <div className="spares-stock-field">

                            <label>Branch</label>

                            <select
                                value={branchCode}
                                onChange={handleBranchChange}
                                disabled={
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
                            className="spares-stock-search-button"
                            onClick={handleSearch}
                            disabled={searching}
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>

                    </div>

                </div>


                {/* RESULTS CARD */}

                <div className="spares-stock-card">

                    {/* RECORD COUNT */}

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
                                    <th>MatGrp</th>
                                    <th>Material</th>
                                    <th>Part</th>
                                    <th>Quantity</th>
                                    <th>Sloc</th>
                                    <th>Created Date</th>
                                    <th>Updated Date</th>
                                </tr>

                            </thead>

                            <tbody>

                                {/* LOADING */}

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

                                    /* RESULTS */

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

                                    /* EMPTY */

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
