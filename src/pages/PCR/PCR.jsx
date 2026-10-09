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
    getBranches,
    getFranchises
} from '../../api/reportsApi'

import './PCR.css'


function PCR() {

    const location = useLocation()


    // =====================================================
    // SESSION DATA
    // =====================================================

    const sessionUserId = Number(
        sessionStorage.getItem('userId') || 0
    )

    const roleId =
        sessionStorage.getItem('roleId') ||
        sessionStorage.getItem('roleID') ||
        ''

    const bpCode =
        sessionStorage.getItem('bpCode') || ''

    const loginId =
        sessionStorage.getItem('loginId') || ''

    const isRole7 = Number(roleId) === 7


    // =====================================================
    // CURRENT PAGE
    // =====================================================

    const [activePage, setActivePage] =
        useState('pcr')


    // =====================================================
    // SEARCH FILTERS
    // =====================================================

    const [branchCode, setBranchCode] =
        useState(isRole7 ? '' : 'All')

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

    const [branchLoading, setBranchLoading] =
        useState(false)

    const [franchiseLoading, setFranchiseLoading] =
        useState(false)


    // =====================================================
    // PCR DATA
    // =====================================================

    const [pcrData, setPcrData] =
        useState([])


    // =====================================================
    // PAGE STATE
    // =====================================================

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [showResults, setShowResults] =
        useState(false)


    // =====================================================
    // BRANCH HELPERS
    // =====================================================

    const getBranchCode = (item) => (
        item.bpCode ??
        item.BPCode ??
        item.branchCode ??
        item.BrCode ??
        ''
    )

    const getBranchName = (item) => (
        item.branchName ??
        item.BranchName ??
        ''
    )


    // =====================================================
    // FRANCHISE HELPERS
    // =====================================================

    const getFranchiseCode = (item) => (
        item.frCode ??
        item.Frcode ??
        item.FRCode ??
        item.frcode ??
        item.franchiseCode ??
        item.FranchiseCode ??
        item.loginId ??
        item.LoginID ??
        ''
    )

    const getFranchiseName = (item) => (
        item.franchiseName ??
        item.FranchiseName ??
        item.userName ??
        item.UserName ??
        getFranchiseCode(item)
    )


    // =====================================================
    // LOAD BRANCHES
    //
    // Role 7: Same branch-loading arguments as Click2Call.
    // Other roles: Preserve the existing PCR API arguments.
    // =====================================================

    useEffect(() => {

        let cancelled = false

        const loadBranches = async () => {

            try {

                setBranchLoading(true)

                setError('')

                console.log(
                    'PCR Loading Branches:',
                    isRole7
                        ? {
                            roleId,
                            userId: sessionUserId,
                            regionCode: ''
                        }
                        : {
                            roleId,
                            bpCode
                        }
                )


                const branchResponse = isRole7
                    ? await getBranches(
                        sessionUserId,
                        ''
                    )
                    : await getBranches(
                        roleId,
                        'All',
                        bpCode
                    )


                if (cancelled) return


                console.log(
                    'PCR Branch Response:',
                    branchResponse
                )


                const branchList =
                    Array.isArray(branchResponse)
                        ? branchResponse
                        : branchResponse?.data || []


                if (!Array.isArray(branchList)) {
                    throw new Error(
                        'Invalid branch response.'
                    )
                }


                const validBranches = branchList.filter(
                    (item) => (
                        item &&
                        getBranchCode(item) &&
                        getBranchName(item)
                    )
                )


                setBranches(validBranches)


                // Role 7 must select a branch manually.
                if (isRole7) {

                    setBranchCode('')

                    setFranchiseCode('All')

                    setFranchises([])

                }


            }
            catch (err) {

                if (cancelled) return

                console.error(
                    'Unable to load PCR branches:',
                    err
                )

                setBranches([])

                if (isRole7) {
                    setBranchCode('')
                }

                setError(
                    err.message ||
                    'Unable to load branches.'
                )

            }
            finally {

                if (!cancelled) {
                    setBranchLoading(false)
                }

            }

        }


        loadBranches()


        return () => {
            cancelled = true
        }

    }, [roleId, sessionUserId, bpCode, isRole7])


    // =====================================================
    // LOAD OTHER DROPDOWNS
    //
    // Status loading and non-Role-7 franchise behavior
    // remain unchanged.
    // =====================================================

    useEffect(() => {

        let cancelled = false

        const loadOtherDropdowns = async () => {

            try {

                setLoading(true)

                setError('')


                const [
                    franchiseResponse,
                    statusResponse
                ] = await Promise.all([

                    isRole7
                        ? Promise.resolve([])
                        : getFranchises(
                            roleId,
                            bpCode,
                            loginId
                        ),

                    getPCRStatuses()

                ])


                if (cancelled) return


                // =================================================
                // FRANCHISES FOR OTHER ROLES
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
                // STATUSES - UNCHANGED
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

                if (cancelled) return

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

        if (!isRole7) {
            return
        }


        let cancelled = false


        const loadBranchFranchises = async () => {

            // Wait until a branch has been selected.
            if (!branchCode) {

                setFranchises([])

                setFranchiseCode('All')

                setFranchiseLoading(false)

                return

            }


            try {

                setFranchiseLoading(true)

                setError('')


                console.log(
                    'PCR Role 7 Loading Franchises:',
                    {
                        roleId,
                        selectedBranch: branchCode,
                        loginId
                    }
                )


                const franchiseResponse =
                    await getFranchises(
                        roleId,
                        branchCode,
                        loginId
                    )


                if (cancelled) return


                console.log(
                    'PCR Franchise Response:',
                    franchiseResponse
                )


                const franchiseList =
                    Array.isArray(franchiseResponse)
                        ? franchiseResponse
                        : franchiseResponse?.data || []


                if (!Array.isArray(franchiseList)) {
                    throw new Error(
                        'Invalid franchise response.'
                    )
                }


                const sortedFranchises = [
                    ...franchiseList
                ].sort(
                    (a, b) =>
                        getFranchiseName(a).localeCompare(
                            getFranchiseName(b),
                            undefined,
                            {
                                sensitivity: 'base'
                            }
                        )
                )


                setFranchises(sortedFranchises)

                setFranchiseCode('All')

            }
            catch (err) {

                if (cancelled) return

                console.error(
                    'Unable to load PCR franchises:',
                    err
                )

                setFranchises([])

                setFranchiseCode('All')

                setError(
                    err.message ||
                    'Unable to load franchises.'
                )

            }
            finally {

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
    // BRANCH CHANGE
    // =====================================================

    const handleBranchChange = (event) => {

        const selectedBranch =
            event.target.value

        console.log(
            'Selected PCR Branch:',
            selectedBranch
        )


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
            restoreState.branchCode ??
            (isRole7 ? '' : 'All')
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


        setPcrData(restoredData)


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

        // Role 7 must select a branch before searching.
        if (
            isRole7 &&
            !branchCode
        ) {

            setError(
                'Please select a branch.'
            )

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
                await searchPCR(searchData)


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


        setActivePage(
            'pcr-download'
        )

    }


    // =====================================================
    // ADD CATEGORY
    // =====================================================

    const handleAddCategory = () => {

        setActivePage(
            'add-category'
        )

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
    // PCR DOWNLOAD PAGE
    // =====================================================

    if (
        activePage === 'pcr-download'
    ) {

        return (

            <PCRDownload
                pcrState={{

                    fromPCR: true,

                    pcrData,

                    branchCode,

                    franchiseCode,

                    ticketNo,

                    spuNo,

                    fromDate,

                    toDate,

                    status

                }}

                onBack={
                    handleBackToPCR
                }
            />

        )

    }


    // =====================================================
    // ADD PART CATEGORY PAGE
    // =====================================================

    if (
        activePage === 'add-category'
    ) {

        return (

            <AddPartCategory
                pcrState={{

                    branchCode,

                    franchiseCode,

                    ticketNo,

                    spuNo,

                    fromDate,

                    toDate,

                    status,

                    pcrData

                }}

                onBack={
                    handleBackToPCR
                }
            />

        )

    }


    // =====================================================
    // PCR MAIN PAGE
    // =====================================================

    return (

        <DashboardLayout title="PCR Segregation">

            <div className="pcr-page">


                {/* PAGE LOADING */}

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
                                onClick={
                                    handleAddCategory
                                }
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


                                {/* BRANCH */}

                                <div className="pcr-field">

                                    <label>
                                        Select Branch
                                    </label>

                                    <select
                                        value={branchCode}
                                        onChange={
                                            handleBranchChange
                                        }
                                        disabled={branchLoading}
                                    >

                                        {isRole7 ? (

                                            <option value="">
                                                Select Branch
                                            </option>

                                        ) : (

                                            <option value="All">
                                                All
                                            </option>

                                        )}

                                        {branches.map(
                                            (branch, index) => {

                                                const value =
                                                    getBranchCode(branch)

                                                const label =
                                                    getBranchName(branch)

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


                                {/* FRANCHISE */}

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
                                        disabled={
                                            franchiseLoading ||
                                            (isRole7 && !branchCode)
                                        }
                                    >

                                        <option value="All">
                                            All
                                        </option>

                                        {franchises.map(
                                            (franchise, index) => {

                                                const value =
                                                    getFranchiseCode(franchise)

                                                const label =
                                                    getFranchiseName(franchise)

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


                                {/* TICKET NO */}

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


                                {/* SPU NO */}

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


                                {/* FROM DATE */}

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


                                {/* TO DATE */}

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


                                {/* STATUS - UNCHANGED */}

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


                                {/* ACTION BUTTONS */}

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