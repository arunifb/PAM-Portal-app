import { useEffect, useState } from 'react'
import {
    useLocation,
    useNavigate
} from 'react-router-dom'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import { getBranches } from '../../api/reportsApi'

import {
    searchPCRDownload,
    downloadPCRExcel
} from '../../api/pcrDownloadApi'

import './PCRDownload.css'


function PCRDownload() {

    const location = useLocation()
    const navigate = useNavigate()


    // =====================================================
    // SESSION DETAILS
    // =====================================================

    const roleId =
        sessionStorage.getItem('roleId') ||
        sessionStorage.getItem('roleID') ||
        ''

    const bpCode =
        sessionStorage.getItem('bpCode') || ''


    // =====================================================
    // DROPDOWN DATA
    // =====================================================

    const [branches, setBranches] =
        useState([])


    // =====================================================
    // ORIGINAL PCR STATE
    // =====================================================

    const originalPCRState =
        location.state || {}


    // =====================================================
    // SEARCH FIELDS
    // =====================================================

    const [branchCode, setBranchCode] =
        useState(
            originalPCRState.branchCode || 'All'
        )

    const [fromDate, setFromDate] =
        useState(
            originalPCRState.fromDate || ''
        )

    const [toDate, setToDate] =
        useState(
            originalPCRState.toDate || ''
        )


    // =====================================================
    // RESULT DATA
    // =====================================================

    const [pcrData, setPcrData] =
        useState([])

    const [showResults, setShowResults] =
        useState(false)


    // =====================================================
    // PAGE STATE
    // =====================================================

    const [loading, setLoading] =
        useState(false)

    const [downloading, setDownloading] =
        useState(false)

    const [error, setError] =
        useState('')


    // =====================================================
    // LOAD BRANCHES
    // =====================================================

    useEffect(() => {

        const loadBranches = async () => {

            try {

                setError('')


                const data =
                    await getBranches(
                        roleId,
                        'All',
                        bpCode
                    )


                console.log(
                    'PCR Download branches:',
                    data
                )


                // =================================================
                // BRANCH LIST
                // =================================================

                const branchList =
                    Array.isArray(data)
                        ? data
                        : data?.data || []


                setBranches(
                    Array.isArray(branchList)
                        ? branchList
                        : []
                )

            }
            catch (err) {

                console.error(
                    'Unable to load PCR Download branches:',
                    err
                )

                setError(
                    err.message ||
                    'Unable to load branches.'
                )

            }

        }


        loadBranches()

    }, [roleId, bpCode])


    // =====================================================
    // GET SELECTED BRANCH NAME
    // =====================================================

    const getSelectedBranchName = () => {

        if (
            branchCode === 'All'
        ) {

            return 'All'

        }


        const selectedBranch =
            branches.find(
                (branch) => {

                    const value =
                        branch.bpCode ??
                        branch.BPCode ??
                        branch.branchCode ??
                        branch.BrCode ??
                        ''


                    return String(value) ===
                        String(branchCode)

                }
            )


        if (!selectedBranch) {

            return ''

        }


        return (
            selectedBranch.branchName ??
            selectedBranch.BranchName ??
            selectedBranch.bpCode ??
            selectedBranch.BPCode ??
            ''
        )

    }


    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = async () => {

        try {

            setLoading(true)

            setError('')

            setShowResults(true)

            setPcrData([])


            // =================================================
            // SEARCH REQUEST
            // =================================================

            const searchData = {

                fromDate:
                    fromDate || '',

                toDate:
                    toDate || '',

                branchCode:
                    branchCode || 'All'

            }


            console.log(
                'PCR Download Search:',
                searchData
            )


            // =================================================
            // CALL BACKEND API
            // =================================================

            const response =
                await searchPCRDownload(
                    searchData
                )


            console.log(
                'PCR Download Search Response:',
                response
            )


            // =================================================
            // GET DATA FROM RESPONSE
            // =================================================

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
                'PCR Download Search failed:',
                err
            )

            setError(
                err.message ||
                'Unable to load PCR download data.'
            )

            setPcrData([])

        }
        finally {

            setLoading(false)

        }

    }


    // =====================================================
    // DOWNLOAD
    // =====================================================

    const handleDownload = async () => {

        // =================================================
        // VALIDATE FROM DATE
        // =================================================

        if (!fromDate) {

            setError(
                'From Date is required for download.'
            )

            return

        }


        // =================================================
        // VALIDATE TO DATE
        // =================================================

        if (!toDate) {

            setError(
                'To Date is required for download.'
            )

            return

        }


        // =================================================
        // VALIDATE DATE RANGE
        // =================================================

        if (fromDate > toDate) {

            setError(
                'From Date cannot be greater than To Date.'
            )

            return

        }


        // =================================================
        // VALIDATE DATA
        // =================================================

        if (pcrData.length === 0) {

            setError(
                'No data available to download.'
            )

            return

        }


        try {

            setDownloading(true)

            setError('')


            // =================================================
            // GET SELECTED BRANCH NAME
            // =================================================

            const branchName =
                getSelectedBranchName()


            console.log(
                'PCR Excel Download:',
                {
                    branchCode,
                    branchName,
                    fromDate,
                    toDate
                }
            )


            // =================================================
            // CALL EXPORT API
            // =================================================

            await downloadPCRExcel(
                fromDate,
                toDate,
                branchCode,
                branchName
            )

        }
        catch (err) {

            console.error(
                'PCR Excel Download failed:',
                err
            )

            setError(
                err.message ||
                'Unable to download PCR Excel.'
            )

        }
        finally {

            setDownloading(false)

        }

    }


    // =====================================================
    // BACK TO PCR
    // =====================================================

    const handleBack = () => {

        navigate(
            '/pcr',
            {
                state: {

                    // =====================================
                    // RESTORE FLAG
                    // =====================================

                    restoreSearch: true,


                    // =====================================
                    // ORIGINAL PCR RESULT DATA
                    // =====================================

                    pcrData:
                        originalPCRState.pcrData || [],


                    // =====================================
                    // ORIGINAL PCR FILTERS
                    // =====================================

                    branchCode:
                        originalPCRState.branchCode || 'All',

                    franchiseCode:
                        originalPCRState.franchiseCode || 'All',

                    ticketNo:
                        originalPCRState.ticketNo || '',

                    spuNo:
                        originalPCRState.spuNo || '',

                    fromDate:
                        originalPCRState.fromDate || '',

                    toDate:
                        originalPCRState.toDate || '',

                    status:
                        originalPCRState.status || '1'

                }
            }
        )

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <DashboardLayout title="PCR Download">

            <div className="pcr-download-page">


                {/* =====================================================
                    SEARCH CARD
                ===================================================== */}

                <div className="pcr-download-card">


                    <div className="pcr-download-form">


                        {/* =================================================
                            BRANCH
                        ================================================= */}

                        <div className="pcr-download-field">

                            <label>
                                Branch
                            </label>


                            <select
                                value={branchCode}
                                onChange={(e) => {

                                    setBranchCode(
                                        e.target.value
                                    )

                                    setError('')

                                }}
                                disabled={
                                    loading ||
                                    downloading
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
                            FROM DATE
                        ================================================= */}

                        <div className="pcr-download-field">

                            <label>
                                From Date
                                <span className="required-mark">
                                    *
                                </span>
                            </label>


                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => {

                                    setFromDate(
                                        e.target.value
                                    )

                                    setError('')

                                }}
                                disabled={
                                    loading ||
                                    downloading
                                }
                            />

                        </div>


                        {/* =================================================
                            TO DATE
                        ================================================= */}

                        <div className="pcr-download-field">

                            <label>
                                To Date
                                <span className="required-mark">
                                    *
                                </span>
                            </label>


                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => {

                                    setToDate(
                                        e.target.value
                                    )

                                    setError('')

                                }}
                                disabled={
                                    loading ||
                                    downloading
                                }
                            />

                        </div>


                        {/* =================================================
                            BUTTONS
                        ================================================= */}

                        <div className="pcr-download-actions">


                            {/* =============================================
                                SEARCH
                            ============================================= */}

                            <button
                                type="button"
                                className="pcr-download-search-btn"
                                onClick={handleSearch}
                                disabled={
                                    loading ||
                                    downloading
                                }
                            >

                                {loading
                                    ? 'Searching...'
                                    : 'Search'}

                            </button>


                            {/* =============================================
                                DOWNLOAD EXCEL
                            ============================================= */}

                            <button
                                type="button"
                                className="pcr-download-excel-btn"
                                onClick={handleDownload}
                            >

                                {downloading
                                    ? 'Downloading...'
                                    : 'Download Excel'}

                            </button>


                            {/* =============================================
                                BACK
                            ============================================= */}

                            <button
                                type="button"
                                className="pcr-download-back-btn"
                                onClick={handleBack}
                                disabled={
                                    loading ||
                                    downloading
                                }
                            >

                                Back

                            </button>


                        </div>

                    </div>


                    {/* =====================================================
                        ERROR
                    ===================================================== */}

                    {error && (

                        <div className="pcr-download-error">
                            {error}
                        </div>

                    )}

                </div>


                {/* =====================================================
                    RESULT TABLE
                ===================================================== */}

                {showResults && (

                    <div className="pcr-download-table-card">

                        <div className="pcr-download-table-wrapper">

                            <table className="pcr-download-table">


                                {/* =================================================
                                    TABLE HEADER
                                ================================================= */}

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Ticket No.
                                        </th>

                                        <th>
                                            Branch Name
                                        </th>

                                        <th>
                                            Spare
                                        </th>

                                        <th>
                                            Spare Description
                                        </th>

                                        <th>
                                            Supplier
                                        </th>

                                        <th>
                                            Part Category
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Created Date
                                        </th>

                                    </tr>

                                </thead>


                                {/* =================================================
                                    TABLE BODY
                                ================================================= */}

                                <tbody>


                                    {/* =============================================
                                        LOADING
                                    ============================================= */}

                                    {loading && (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                className="pcr-download-loading"
                                            >

                                                <span className="loading-dots">
                                                    Loading...
                                                </span>

                                            </td>

                                        </tr>

                                    )}


                                    {/* =============================================
                                        NO DATA
                                    ============================================= */}

                                    {!loading &&
                                        pcrData.length === 0 && (

                                            <tr>

                                                <td
                                                    colSpan="9"
                                                    className="pcr-download-no-data"
                                                >
                                                    No data found!!!!
                                                </td>

                                            </tr>

                                        )}


                                    {/* =============================================
                                        PCR DATA
                                    ============================================= */}

                                    {!loading &&
                                        pcrData.map(
                                            (row, index) => (

                                                <tr
                                                    key={
                                                        row.ticketNo ??
                                                        row.TicketNo ??
                                                        index
                                                    }
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>


                                                    <td>
                                                        {
                                                            row.ticketNo ??
                                                            row.TicketNo ??
                                                            ''
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.branch ??
                                                            row.Branch ??
                                                            ''
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.partCode ??
                                                            row.PartCode ??
                                                            ''
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.partDescription ??
                                                            row.PartDescription ??
                                                            ''
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.supplier ??
                                                            row.Supplier ??
                                                            ''
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.partCategory ??
                                                            row.PartCategory ??
                                                            ''
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.fqcVerification ??
                                                            row.FqcVerification ??
                                                            ''
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.createdDate ??
                                                            row.CreatedDate ??
                                                            ''
                                                        }
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </div>

        </DashboardLayout>

    )

}


export default PCRDownload