import { useEffect, useState } from 'react'
import './SparesStock.css'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getBranches
} from '../../api/reportsApi'

import {
    searchSpareStock
} from '../../api/spareStockApi'


function SparesStock() {

    // =========================================
    // SESSION VALUES
    // =========================================

    const roleId =
        Number(
            sessionStorage.getItem('roleId') ||
            sessionStorage.getItem('roleID')
        ) || 0

    const regionCode =
        sessionStorage.getItem('regionCode') || ''

    const bpCode =
        sessionStorage.getItem('bpCode') || ''


    // =========================================
    // FORM STATE
    // =========================================

    const [branches, setBranches] =
        useState([])

    const [branchCode, setBranchCode] =
        useState('All')


    const [matGrp, setMatGrp] =
        useState('')

    const [material, setMaterial] =
        useState('')

    const [sloc, setSloc] =
        useState('')

    const [partName, setPartName] =
        useState('')


    // =========================================
    // RESULT STATE
    // =========================================

    const [records, setRecords] =
        useState([])


    // =========================================
    // LOADING STATE
    // =========================================

    const [loadingBranches, setLoadingBranches] =
        useState(false)

    const [searching, setSearching] =
        useState(false)


    // =========================================
    // MESSAGE STATE
    // =========================================

    const [error, setError] =
        useState('')

    const [message, setMessage] =
        useState('')


    // =========================================
    // GET BRANCH CODE
    // =========================================

    const getBranchCode = (item) => {

        return (
            item.bpCode ??
            item.BPCode ??
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
    // LOAD BRANCHES
    // =========================================

    useEffect(() => {

        let isMounted = true


        const loadBranches = async () => {

            try {

                setLoadingBranches(true)

                setError('')


                const response =
                    await getBranches(
                        roleId,
                        regionCode,
                        bpCode
                    )


                if (!isMounted) {

                    return

                }


                if (!Array.isArray(response)) {

                    throw new Error(
                        'Invalid branch response.'
                    )

                }


                // =====================================
                // ADD ALL OPTION
                // =====================================

                const branchList = [

                    {
                        bpCode: 'All',
                        branchName: 'All'
                    },

                    ...response

                ]


                setBranches(
                    branchList
                )


                // =====================================
                // DEFAULT SELECTION
                // =====================================

                setBranchCode(
                    'All'
                )

            }
            catch (error) {

                if (!isMounted) {

                    return

                }


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


                setBranchCode(
                    'All'
                )


                setError(
                    error.message ||
                    'Unable to load branches.'
                )

            }
            finally {

                if (isMounted) {

                    setLoadingBranches(
                        false
                    )

                }

            }

        }


        loadBranches()


        return () => {

            isMounted = false

        }

    }, [
        roleId,
        regionCode,
        bpCode
    ])


    // =========================================
    // BRANCH CHANGE
    // =========================================

    const handleBranchChange = (event) => {

        setBranchCode(
            event.target.value
        )

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


        // =====================================
        // OLD SEARCH BEHAVIOR
        // =====================================

        const searchData = {

            RegionCode:
                regionCode || '',

            BpCode:
                branchCode === 'All'
                    ? ''
                    : branchCode || '',

            Material:
                material || '',

            PartName:
                partName || '',

            MatGrp:
                matGrp || '',

            Sloc:
                sloc || ''

        }


        console.log(
            'Spares Stock Search Request:',
            searchData
        )


        try {

            setSearching(
                true
            )


            // =====================================
            // API REQUEST
            // =====================================

            const requestData = {

                regionCode:
                    searchData.RegionCode,

                bpCode:
                    searchData.BpCode,

                material:
                    searchData.Material,

                partName:
                    searchData.PartName,

                matGrp:
                    searchData.MatGrp,

                sloc:
                    searchData.Sloc

            }


            const response =
                await searchSpareStock(
                    requestData
                )


            console.log(
                'Spares Stock Search Response:',
                response
            )


            const data =
                Array.isArray(
                    response?.data
                )
                    ? response.data
                    : []


            setRecords(
                data
            )


            if (
                data.length === 0
            ) {

                setMessage(
                    'No Record Found'
                )

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

            setSearching(
                false
            )

        }

    }


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatStockDate = (value) => {

        if (!value) {

            return ''

        }


        const date =
            new Date(value)


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

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

        <DashboardLayout
            title="Spares Stock"
        >

            <div className="spares-stock-page">


                {/* =================================
                    FILTER CARD
                ================================= */}

                <div className="spares-stock-card">


                    {/* =================================
                        FILTER GRID
                    ================================= */}

                    <div className="spares-stock-filter-grid">


                        {/* =============================
                            BRANCH
                        ============================= */}

                        <div className="spares-stock-field">

                            <label>
                                Branch
                            </label>

                            <select
                                value={
                                    branchCode
                                }
                                onChange={
                                    handleBranchChange
                                }
                                disabled={
                                    loadingBranches
                                }
                            >

                                {branches.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <option
                                            key={
                                                `${getBranchCode(item)}-${index}`
                                            }
                                            value={
                                                getBranchCode(item)
                                            }
                                        >

                                            {
                                                getBranchName(item)
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* =============================
                            PART GROUP
                        ============================= */}

                        <div className="spares-stock-field">

                            <label>
                                Part Group
                            </label>

                            <input
                                type="text"
                                value={
                                    matGrp
                                }
                                onChange={
                                    event =>
                                        setMatGrp(
                                            event.target.value
                                        )
                                }
                                placeholder="type or copy here"
                            />

                        </div>


                        {/* =============================
                            PART CODE
                        ============================= */}

                        <div className="spares-stock-field">

                            <label>
                                Part Code
                            </label>

                            <input
                                type="text"
                                value={
                                    material
                                }
                                onChange={
                                    event =>
                                        setMaterial(
                                            event.target.value
                                        )
                                }
                                maxLength={16}
                            />

                        </div>


                        {/* =============================
                            SLOC
                        ============================= */}

                        <div className="spares-stock-field">

                            <label>
                                Sloc
                            </label>

                            <input
                                type="text"
                                value={
                                    sloc
                                }
                                onChange={
                                    event =>
                                        setSloc(
                                            event.target.value
                                        )
                                }
                                maxLength={10}
                            />

                        </div>


                        {/* =============================
                            PART NAME
                        ============================= */}

                        <div className="spares-stock-field">

                            <label>
                                Part Name
                            </label>

                            <input
                                type="text"
                                value={
                                    partName
                                }
                                onChange={
                                    event =>
                                        setPartName(
                                            event.target.value
                                        )
                                }
                                maxLength={64}
                            />

                        </div>

                    </div>


                    {/* =================================
                        ERROR
                    ================================= */}

                    {error && (

                        <div className="spares-stock-error">

                            {error}

                        </div>

                    )}


                    {/* =================================
                        MESSAGE
                    ================================= */}

                    {message && (

                        <div className="spares-stock-message">

                            {message}

                        </div>

                    )}


                    {/* =================================
                        SEARCH BUTTON
                    ================================= */}

                    <div className="spares-stock-actions">

                        <button
                            type="button"
                            className="spares-stock-search-button"
                            onClick={
                                handleSearch
                            }
                            disabled={
                                searching
                            }
                        >

                            {
                                searching
                                    ? 'Searching...'
                                    : 'Search'
                            }

                        </button>

                    </div>

                </div>


                {/* =================================
                    RESULTS CARD
                ================================= */}

                <div className="spares-stock-card">


                    {/* =================================
                        RECORD COUNT
                    ================================= */}

                    {records.length > 0 &&
                        !searching && (

                            <h3 className="spares-stock-record-count">

                                {records.length}
                                {' '}
                                record
                                {records.length !== 1
                                    ? 's'
                                    : ''}
                                {' '}
                                found

                            </h3>

                        )}


                    {/* =================================
                        TABLE
                    ================================= */}

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


                                {/* =================================
                                    LOADING
                                ================================= */}

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

                                    /* =================================
                                       RESULTS
                                    ================================= */

                                    records.map(
                                        (
                                            record,
                                            index
                                        ) => (

                                            <tr
                                                key={
                                                    `${record.rowIndex || index}-${index}`
                                                }
                                            >

                                                <td>
                                                    {
                                                        record.rowIndex ||
                                                        index + 1
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.plant ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.branch ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.matGrp ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.material ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.partName ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.quantity ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.sloc ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatStockDate(
                                                            record.createdDate
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatStockDate(
                                                            record.updatedDate
                                                        )
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )

                                ) : (

                                    /* =================================
                                       EMPTY
                                    ================================= */

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