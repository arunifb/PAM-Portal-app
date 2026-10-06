import { useEffect, useState } from 'react'
import {
    useLocation,
    useNavigate
} from 'react-router-dom'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    searchPCR,
    getPCRStatuses
} from '../../api/pcrApi'

import {
    getBranches,
    getFranchises
} from '../../api/reportsApi'

import './PCR.css'


function PCR() {

    const location = useLocation()
    const navigate = useNavigate()


    // =====================================================
    // SESSION DATA
    // =====================================================

    const roleId =
        sessionStorage.getItem('roleId') ||
        sessionStorage.getItem('roleID') ||
        ''

    const bpCode =
        sessionStorage.getItem('bpCode') || ''

    const loginId =
        sessionStorage.getItem('loginId') || ''


    // =====================================================
    // SEARCH FILTERS
    // =====================================================

    const [branchCode, setBranchCode] =
        useState('All')

    const [franchiseCode, setFranchiseCode] =
        useState('All')

    const [ticketNo, setTicketNo] =
        useState('')

    const [spuNo, setSpuNo] =
        useState('')

    const [fromDate, setFromDate] =
        useState('')

    const [toDate, setToDate] =
        useState('')

    const [status, setStatus] =
        useState('1')


    // =====================================================
    // DROPDOWN DATA
    // =====================================================

    const [branches, setBranches] =
        useState([])

    const [franchises, setFranchises] =
        useState([])

    const [statuses, setStatuses] =
        useState([])


    // =====================================================
    // PCR DATA
    // =====================================================

    const [pcrData, setPcrData] =
        useState([])


    // =====================================================
    // PAGE STATE
    // =====================================================

    // Start with loading=true.
    // This means when PCR page opens, loading is shown
    // while the dropdown data is being loaded.
    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [showResults, setShowResults] =
        useState(false)


    // =====================================================
    // LOAD DROPDOWNS
    // =====================================================

    const loadDropdowns = async () => {

        try {

            setLoading(true)

            setError('')


            const [
                branchResponse,
                franchiseResponse,
                statusResponse
            ] = await Promise.all([

                getBranches(
                    roleId,
                    'All',
                    bpCode
                ),

                getFranchises(
                    roleId,
                    bpCode,
                    loginId
                ),

                getPCRStatuses()

            ])


            // =================================================
            // BRANCHES
            // =================================================

            const branchList =
                Array.isArray(branchResponse)
                    ? branchResponse
                    : branchResponse?.data || []

            setBranches(
                Array.isArray(branchList)
                    ? branchList
                    : []
            )


            // =================================================
            // FRANCHISES
            // =================================================

            const franchiseList =
                Array.isArray(franchiseResponse)
                    ? franchiseResponse
                    : franchiseResponse?.data || []

            setFranchises(
                Array.isArray(franchiseList)
                    ? franchiseList
                    : []
            )


            // =================================================
            // STATUSES
            // =================================================

            const statusList =
                Array.isArray(statusResponse)
                    ? statusResponse
                    : statusResponse?.data || []

            setStatuses(
                Array.isArray(statusList)
                    ? statusList
                    : []
            )

        }
        catch (err) {

            console.error(
                'Unable to load PCR dropdowns:',
                err
            )

            setError(
                err.message ||
                'Unable to load PCR dropdown data.'
            )

        }
        finally {

            // =================================================
            // STOP PAGE LOADING
            // =================================================

            setLoading(false)

        }

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadDropdowns()

    }, [])


    // =====================================================
    // RESTORE PCR SEARCH RESULTS
    // When returning from PCR Download
    // =====================================================

    useEffect(() => {

        const restoreState =
            location.state


        if (
            !restoreState?.restoreSearch
        ) {
            return
        }


        console.log(
            'Restoring PCR search state:',
            restoreState
        )


        // =================================================
        // RESTORE SEARCH FILTERS
        // =================================================

        setBranchCode(
            restoreState.branchCode || 'All'
        )

        setFranchiseCode(
            restoreState.franchiseCode || 'All'
        )

        setTicketNo(
            restoreState.ticketNo || ''
        )

        setSpuNo(
            restoreState.spuNo || ''
        )

        setFromDate(
            restoreState.fromDate || ''
        )

        setToDate(
            restoreState.toDate || ''
        )

        setStatus(
            restoreState.status || '1'
        )


        // =================================================
        // RESTORE PCR DATA
        // =================================================

        const restoredData =
            Array.isArray(
                restoreState.pcrData
            )
                ? restoreState.pcrData
                : []


        setPcrData(
            restoredData
        )


        // =================================================
        // SHOW RESULTS
        // =================================================

        setShowResults(true)

        setError('')


        // =================================================
        // CLEAR RESTORE STATE
        // =================================================

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        )

    }, [location.state])


    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = async () => {

        try {

            setLoading(true)

            setError('')

            setShowResults(true)

            setPcrData([])


            const searchData = {

                branchCode:
                    branchCode || 'All',

                franchiseCode:
                    franchiseCode || 'All',

                ticketNo:
                    ticketNo.trim(),

                spuNo:
                    spuNo.trim(),

                status:
                    status || '1',

                fromDate:
                    fromDate || '',

                toDate:
                    toDate || ''

            }


            console.log(
                'PCR Search:',
                searchData
            )


            const response =
                await searchPCR(
                    searchData
                )


            const data =
                Array.isArray(response)
                    ? response
                    : response?.data || []


            setPcrData(
                Array.isArray(data)
                    ? data
                    : []
            )

        }
        catch (err) {

            console.error(
                'PCR search failed:',
                err
            )

            setError(
                err.message ||
                'Unable to search PCR data.'
            )

            setPcrData([])

        }
        finally {

            setLoading(false)

        }

    }


    // =====================================================
    // VIEW AND DOWNLOAD
    // =====================================================

    const handleViewAndDownload = () => {

        if (
            !pcrData ||
            pcrData.length === 0
        ) {
            return
        }


        navigate(
            '/pcr-download',
            {
                state: {

                    // =====================================
                    // RESTORE FLAG
                    // =====================================

                    fromPCR: true,


                    // =====================================
                    // CURRENT PCR RESULT DATA
                    // =====================================

                    pcrData,


                    // =====================================
                    // CURRENT SEARCH FILTERS
                    // =====================================

                    branchCode,

                    franchiseCode,

                    ticketNo,

                    spuNo,

                    fromDate,

                    toDate,

                    status

                }
            }
        )

    }


    // =====================================================
    // ADD CATEGORY
    // =====================================================

    const handleAddCategory = () => {

    navigate(
        '/add-part-category',
        {
            state: {
                branchCode,
                franchiseCode,
                ticketNo,
                spuNo,
                fromDate,
                toDate,
                status,
                pcrData
            }
        }
    )

}


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (statusValue) => {

        const value =
            String(statusValue || '')
                .trim()
                .toLowerCase()


        if (
            value === 'submitted' ||
            value === 'submitted by branch'
        ) {
            return 'pcr-status-primary'
        }


        if (
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


        if (
            value === 'approved'
        ) {
            return 'pcr-status-success'
        }


        return ''

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <DashboardLayout title="PCR Segregation">

            <div className="pcr-page">


                {/* =================================================
                    PAGE LOADING
                ================================================= */}

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

                        {/* =================================================
                            TOP ACTION
                        ================================================= */}

                        <div className="pcr-action-row">

                            <button
                                type="button"
                                className="pcr-add-button"
                                onClick={handleAddCategory}
                            >
                                Add Category
                            </button>

                        </div>


                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {error && (

                            <div className="pcr-error">
                                {error}
                            </div>

                        )}


                        {/* =================================================
                            SEARCH CARD
                        ================================================= */}

                        <div className="pcr-search-card">

                            <div className="pcr-search-grid">


                                {/* =================================================
                                    BRANCH
                                ================================================= */}

                                <div className="pcr-field">

                                    <label>
                                        Branch
                                    </label>

                                    <select
                                        value={branchCode}
                                        onChange={(event) =>
                                            setBranchCode(
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="All">
                                            All
                                        </option>

                                        {branches.map(
                                            (branch, index) => {

                                                const value =
                                                    branch.bpCode ??
                                                    branch.BPCode ??
                                                    branch.branchCode ??
                                                    branch.BrCode ??
                                                    ''

                                                const label =
                                                    branch.branchName ??
                                                    branch.BranchName ??
                                                    branch.bpCode ??
                                                    branch.BPCode ??
                                                    ''

                                                return (

                                                    <option
                                                        key={
                                                            value ||
                                                            `branch-${index}`
                                                        }
                                                        value={value}
                                                    >
                                                        {label}
                                                    </option>

                                                )

                                            }
                                        )}

                                    </select>

                                </div>


                                {/* =================================================
                                    FRANCHISE
                                ================================================= */}

                                <div className="pcr-field">

                                    <label>
                                        Franchise
                                    </label>

                                    <select
                                        value={franchiseCode}
                                        onChange={(event) =>
                                            setFranchiseCode(
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="All">
                                            All
                                        </option>

                                        {franchises.map(
                                            (franchise, index) => {

                                                const value =
                                                    franchise.frcode ??
                                                    franchise.FrCode ??
                                                    franchise.franchiseCode ??
                                                    franchise.FranchiseCode ??
                                                    ''

                                                const label =
                                                    franchise.franchiseName ??
                                                    franchise.FranchiseName ??
                                                    franchise.frcode ??
                                                    franchise.FrCode ??
                                                    ''

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

                                            }
                                        )}

                                    </select>

                                </div>


                                {/* =================================================
                                    TICKET NO
                                ================================================= */}

                                <div className="pcr-field">

                                    <label>
                                        Ticket No.
                                    </label>

                                    <input
                                        type="text"
                                        value={ticketNo}
                                        onChange={(event) =>
                                            setTicketNo(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter ticket no."
                                    />

                                </div>


                                {/* =================================================
                                    SPU NO
                                ================================================= */}

                                <div className="pcr-field">

                                    <label>
                                        SPU No.
                                    </label>

                                    <input
                                        type="text"
                                        value={spuNo}
                                        onChange={(event) =>
                                            setSpuNo(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter SPU no."
                                    />

                                </div>


                                {/* =================================================
                                    FROM DATE
                                ================================================= */}

                                <div className="pcr-field">

                                    <label>
                                        From Date
                                    </label>

                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(event) =>
                                            setFromDate(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* =================================================
                                    TO DATE
                                ================================================= */}

                                <div className="pcr-field">

                                    <label>
                                        To Date
                                    </label>

                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(event) =>
                                            setToDate(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* =================================================
                                    STATUS
                                ================================================= */}

                                <div className="pcr-field">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        value={status}
                                        onChange={(event) =>
                                            setStatus(
                                                event.target.value
                                            )
                                        }
                                    >

                                        {statuses.map(
                                            (item, index) => {

                                                const value =
                                                    item.id ??
                                                    item.Id ??
                                                    ''

                                                const label =
                                                    item.name ??
                                                    item.Name ??
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

                                            }
                                        )}

                                    </select>

                                </div>


                                {/* =================================================
                                    ACTION BUTTONS
                                ================================================= */}

                                <div className="pcr-search-button-wrapper">

                                    <button
                                        type="button"
                                        className="pcr-view-download-button"
                                        onClick={
                                            handleViewAndDownload
                                        }
                                        disabled={
                                            loading ||
                                            pcrData.length === 0
                                        }
                                    >
                                        View & Download
                                    </button>


                                    <button
                                        type="button"
                                        className="pcr-search-button"
                                        onClick={
                                            handleSearch
                                        }
                                        disabled={loading}
                                    >
                                        Search
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            RESULT TABLE
                        ================================================= */}

                        {showResults && (

                            <div className="pcr-table-card">

                                <div className="pcr-table-wrapper">

                                    <table className="pcr-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    Ticket No.
                                                </th>

                                                <th>
                                                    Product
                                                </th>

                                                <th>
                                                    Serial No.
                                                </th>

                                                <th>
                                                    Spare
                                                </th>

                                                <th>
                                                    Spare Description
                                                </th>

                                                <th>
                                                    Quantity
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Price
                                                </th>

                                                <th>
                                                    Credit
                                                </th>

                                                <th>
                                                    Debit
                                                </th>

                                                <th>
                                                    Marking
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {/* =================================
                                                LOADING
                                            ================================= */}

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

                                                /* =================================
                                                   RESULTS
                                                ================================= */

                                                pcrData.map(
                                                    (row, index) => {

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
                                                                    {
                                                                        row.ticketNo ??
                                                                        row.TicketNo ??
                                                                        ''
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        row.product ??
                                                                        row.Product ??
                                                                        ''
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        row.serialNo ??
                                                                        row.SerialNo ??
                                                                        ''
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        row.spare ??
                                                                        row.Spare ??
                                                                        ''
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        row.spareDescription ??
                                                                        row.SpareDescription ??
                                                                        ''
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        row.quantity ??
                                                                        row.Quantity ??
                                                                        ''
                                                                    }
                                                                </td>


                                                                <td>

                                                                    <span
                                                                        className={
                                                                            `pcr-status-badge ${
                                                                                getStatusClass(
                                                                                    rowStatus
                                                                                )
                                                                            }`
                                                                        }
                                                                    >
                                                                        {rowStatus}
                                                                    </span>

                                                                </td>


                                                                <td>
                                                                    {
                                                                        row.price ??
                                                                        row.Price ??
                                                                        ''
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        row.credit ??
                                                                        row.Credit ??
                                                                        ''
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        row.debit ??
                                                                        row.Debit ??
                                                                        ''
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        row.marking ??
                                                                        row.Marking ??
                                                                        ''
                                                                    }
                                                                </td>

                                                            </tr>

                                                        )

                                                    }
                                                )

                                            ) : (

                                                /* =================================
                                                   NO RECORDS
                                                ================================= */

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