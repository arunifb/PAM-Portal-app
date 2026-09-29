import { useEffect, useState } from 'react'
import './Click2Call.css'

import {
    getClick2CallBranches,
    getClick2CallFranchises,
    searchClick2Call
} from '../../api/click2CallApi'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'


function Click2Call() {

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

    const loginId =
        sessionStorage.getItem('loginId') || ''


    // =========================================
    // USER TYPE
    // =========================================
    //
    // Role 1:
    //     Branch can be selected.
    //     "All" is available.
    //
    // Role != 1:
    //     Branch is frozen to logged-in BPCode.
    //
    // Role 7:
    //     Branch list is loaded for all branches.
    //     User can select a branch.
    //
    // =========================================

    const isBranchUser =
        roleId !== 1 && roleId !== 7


    // =========================================
    // FORM STATE
    // =========================================

    const [ticketNumber, setTicketNumber] = useState('')
    const [branch, setBranch] = useState('')
    const [franchise, setFranchise] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')


    // =========================================
    // DROPDOWN STATE
    // =========================================

    const [branches, setBranches] = useState([])
    const [franchises, setFranchises] = useState([])

    const [branchLoading, setBranchLoading] = useState(false)
    const [franchiseLoading, setFranchiseLoading] =
        useState(false)


    // =========================================
    // SEARCH STATE
    // =========================================

    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const [showResults, setShowResults] = useState(false)

    const [isTicketSearch, setIsTicketSearch] = useState(false)


    // =========================================
    // LOAD BRANCHES
    // =========================================

    useEffect(() => {

        const loadBranches = async () => {

            try {

                setBranchLoading(true)
                setError('')

                // =====================================
                // ROLE 7
                // =====================================
                //
                // Role 7 should receive all branches.
                //
                // Do not pass logged-in region/BPCode.
                // =====================================

                const branchRegionCode =
                    roleId === 7
                        ? ''
                        : regionCode

                const branchBpCode =
                    roleId === 7
                        ? ''
                        : bpCode


                console.log(
                    'Loading Click2Call branches:',
                    {
                        roleId,
                        regionCode: branchRegionCode,
                        bpCode: branchBpCode
                    }
                )


                const data =
                    await getClick2CallBranches(
                        roleId,
                        branchRegionCode,
                        branchBpCode
                    )


                console.log(
                    'Click2Call Branch Response:',
                    data
                )


                if (!Array.isArray(data)) {

                    throw new Error(
                        'Invalid branch response.'
                    )
                }


                // =====================================
                // REMOVE INVALID BRANCHES
                // =====================================

                const validBranches =
                    data.filter(
                        item =>
                            item &&
                            item.bpCode &&
                            item.branchName
                    )


                setBranches(
                    validBranches
                )


                // =====================================
                // BRANCH USER
                // =====================================
                //
                // Role other than 1 and 7:
                //
                // Automatically select the logged-in
                // user's branch.
                //
                // The branch dropdown will be frozen.
                // =====================================

                if (
                    isBranchUser &&
                    bpCode
                ) {

                    setBranch(bpCode)

                }

            } catch (error) {

                console.error(
                    'Click2Call branch error:',
                    error
                )

                setError(
                    error.message ||
                    'Unable to load branches.'
                )

            } finally {

                setBranchLoading(false)

            }
        }

        loadBranches()

    }, [
        roleId,
        regionCode,
        bpCode,
        isBranchUser
    ])


    // =========================================
    // LOAD FRANCHISES WHEN BRANCH CHANGES
    // =========================================
    //
    // IMPORTANT:
    //
    // "branch" contains the ACTUAL selected
    // branch BPCode.
    //
    // For example:
    //
    // Role 7:
    //
    // User selects:
    // Bangalore Service Branch
    //
    // branch =
    // 11002487
    //
    // Then:
    //
    // getClick2CallFranchises(
    //     roleId,
    //     11002487,
    //     loginId
    // )
    //
    // This means franchise data is loaded
    // specifically for the selected branch.
    //
    // =========================================

    useEffect(() => {

        const loadFranchises = async () => {

            // =====================================
            // No branch selected
            // =====================================

            if (!branch) {

                setFranchises([])
                setFranchise('')

                return
            }


            try {

                setFranchiseLoading(true)
                setError('')

                console.log(
                    'Loading Click2Call franchises:',
                    {
                        roleId,
                        selectedBranchBpCode: branch,
                        loginId
                    }
                )


                // =====================================
                // IMPORTANT
                // =====================================
                //
                // Use the SELECTED branch BPCode.
                //
                // Do NOT use session bpCode here.
                //
                // This is important for Role 7 because
                // Role 7 can select different branches.
                // =====================================

                const data =
                    await getClick2CallFranchises(
                        roleId,
                        branch,
                        loginId
                    )


                console.log(
                    'Click2Call Franchise Response:',
                    data
                )


                if (!Array.isArray(data)) {

                    throw new Error(
                        'Invalid franchise response.'
                    )
                }


                // =====================================
                // SORT FRANCHISE A-Z
                // =====================================

                const sortedFranchises =
                    [...data].sort((a, b) =>
                        (
                            a.franchiseName || ''
                        ).localeCompare(
                            b.franchiseName || '',
                            undefined,
                            {
                                sensitivity: 'base'
                            }
                        )
                    )


                setFranchises(
                    sortedFranchises
                )

            } catch (error) {

                console.error(
                    'Click2Call franchise error:',
                    error
                )

                setFranchises([])

                setError(
                    error.message ||
                    'Unable to load franchises.'
                )

            } finally {

                setFranchiseLoading(false)

            }
        }

        loadFranchises()

    }, [
        branch,
        roleId,
        loginId
    ])


    // =========================================
    // BRANCH CHANGE
    // =========================================

    const handleBranchChange = (event) => {

        const selectedBranch =
            event.target.value


        console.log(
            'Selected Click2Call Branch BPCode:',
            selectedBranch
        )


        // =====================================
        // Store selected branch BPCode.
        //
        // This triggers the franchise useEffect.
        // =====================================

        setBranch(
            selectedBranch
        )


        // =====================================
        // Clear old franchise selection.
        // =====================================

        setFranchise('')

        setFranchises([])

        setError('')
        setMessage('')
    }


    // =========================================
    // FRANCHISE CHANGE
    // =========================================

    const handleFranchiseChange = (event) => {

        setFranchise(
            event.target.value
        )

        setError('')
        setMessage('')
    }


    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async () => {

        setError('')
        setMessage('')
        setResults([])

        setShowResults(true)


        // =====================================
        // DETERMINE SEARCH TYPE
        // =====================================

        const isTicket = !!ticketNumber.trim()
        setIsTicketSearch(isTicket)


        // =====================================
        // VALIDATION
        // =====================================

        if (!ticketNumber.trim()) {

            if (!fromDate || !toDate) {

                setError(
                    'From Date and To Date are required when Ticket Number is not provided.'
                )

                return
            }


            if (fromDate > toDate) {

                setError(
                    'From Date cannot be greater than To Date.'
                )

                return
            }
        }


        // =====================================
        // REQUEST
        // =====================================

        const request = {

            roleId: roleId,

            leadId:
                ticketNumber.trim(),

            regionCode:
                regionCode,

            bpCode:
                branch || bpCode,

            frCode:
                franchise,

            loginId:
                loginId,

            fromDate:
                fromDate,

            toDate:
                toDate
        }


        console.log(
            'Click2Call Request:',
            request
        )


        // =====================================
        // API CALL
        // =====================================

        try {

            setLoading(true)

            const data =
                await searchClick2Call(
                    request
                )


            console.log(
                'Click2Call Response:',
                data
            )


            // =================================
            // NO DATA
            // =================================

            if (
                !Array.isArray(data) ||
                data.length === 0
            ) {

                setMessage(
                    'No records found.'
                )

                return
            }


            // =================================
            // SET RESULTS
            // =================================

            setResults(data)

        } catch (error) {

            console.error(
                'Click2Call error:',
                error
            )

            setError(
                error.message ||
                'Unable to search Click 2 Call.'
            )

        } finally {

            setLoading(false)
        }
    }


    // =========================================
    // CLEAR
    // =========================================

    const handleClear = () => {

        setTicketNumber('')

        setFranchise('')

        setFromDate('')

        setToDate('')

        setFranchises([])

        setResults([])

        setError('')

        setMessage('')

        setShowResults(false)

        setIsTicketSearch(false)


        // =====================================
        // ROLE 1
        // =====================================
        //
        // Reset branch to "All".
        // =====================================

        if (roleId === 1) {

            setBranch('')

            return
        }


        // =====================================
        // ROLE 7
        // =====================================
        //
        // Role 7 can select any branch.
        //
        // Reset to "All".
        // =====================================

        if (roleId === 7) {

            setBranch('')

            return
        }


        // =====================================
        // OTHER BRANCH USERS
        // =====================================
        //
        // Restore their logged-in branch.
        // =====================================

        if (bpCode) {

            setBranch(bpCode)

        } else {

            setBranch('')

        }
    }


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDate = (value) => {

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
    // DISPLAY RESULTS
    // =========================================
    //
    // Ticket search: show ALL records.
    // Date search:   show only first 10.
    // =========================================

    const displayResults =
        isTicketSearch
            ? results
            : results.slice(0, 10)


    // =========================================
    // UI
    // =========================================

    return (

        <DashboardLayout title="Click 2 Call">

            <div className="click2call-page">


                {/* =================================
                    SEARCH BOX
                ================================= */}

                <div className="click2call-box">

                    <div className="click2call-form">


                        {/* =============================
                            BRANCH
                        ============================= */}

                        <div className="click2call-field">

                            <label>
                                Branch:
                            </label>

                            <select
                                value={branch}
                                onChange={
                                    handleBranchChange
                                }
                                disabled={
                                    branchLoading ||
                                    isBranchUser
                                }
                            >

                                {/* =================================
                                    ALL OPTION
                                    =================================
                                    Role 1 and Role 7 can select All.
                                ================================= */}

                                {!isBranchUser && (

                                    <option value="">
                                        All
                                    </option>

                                )}


                                {branches.map(
                                    (item, index) => (

                                        <option
                                            key={
                                                item.bpCode ||
                                                `branch-${index}`
                                            }
                                            value={
                                                item.bpCode
                                            }
                                        >

                                            {
                                                item.branchName
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* =============================
                            FRANCHISE
                        ============================= */}

                        <div className="click2call-field">

                            <label>
                                Franchise
                            </label>

                            <select
                                value={franchise}
                                onChange={
                                    handleFranchiseChange
                                }
                                disabled={
                                    franchiseLoading ||
                                    !branch
                                }
                            >

                                <option value="">
                                    All
                                </option>


                                {franchises.map(
                                    (item, index) => (

                                        <option
                                            key={
                                                item.frCode ||
                                                `franchise-${index}`
                                            }
                                            value={
                                                item.frCode
                                            }
                                        >

                                            {
                                                item.franchiseName
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* =============================
                            TICKET NUMBER
                        ============================= */}

                        <div className="click2call-field">

                            <label>
                                Ticket Number
                            </label>

                            <input
                                type="text"
                                value={
                                    ticketNumber
                                }
                                onChange={
                                    (event) =>
                                        setTicketNumber(
                                            event.target.value
                                        )
                                }
                                placeholder=""
                            />

                        </div>


                        {/* =============================
                            FROM DATE
                        ============================= */}

                        <div className="click2call-field">

                            <label>

                                From Date:

                                <span className="required">
                                    *
                                </span>

                            </label>

                            <input
                                type="date"
                                value={
                                    fromDate
                                }
                                onChange={
                                    (event) =>
                                        setFromDate(
                                            event.target.value
                                        )
                                }
                            />

                        </div>


                        {/* =============================
                            TO DATE
                        ============================= */}

                        <div className="click2call-field">

                            <label>

                                To Date:

                                <span className="required">
                                    *
                                </span>

                            </label>

                            <input
                                type="date"
                                value={
                                    toDate
                                }
                                onChange={
                                    (event) =>
                                        setToDate(
                                            event.target.value
                                        )
                                }
                            />

                        </div>

                    </div>


                    {/* =================================
                        ERROR
                    ================================= */}

                    {error && (

                        <div className="click2call-error">
                            {error}
                        </div>

                    )}


                    {/* =================================
                        MESSAGE
                    ================================= */}

                    {message && (

                        <div className="click2call-message">
                            {message}
                        </div>

                    )}


                    {/* =================================
                        BUTTONS
                    ================================= */}

                    <div className="click2call-button-area">

                        <button
                            type="button"
                            className="click2call-search-button"
                            onClick={
                                handleSearch
                            }
                            disabled={
                                loading
                            }
                        >

                            {loading
                                ? 'Searching...'
                                : 'Search'}

                        </button>


                        <button
                            type="button"
                            className="click2call-clear-button"
                            onClick={
                                handleClear
                            }
                        >

                            Clear

                        </button>

                    </div>

                </div>


                {/* =================================
                    RESULT TABLE
                ================================= */}

                {showResults && (

                    <div className="click2call-box">

                        {/* =============================
                            RESULT HEADER
                        ============================= */}

                        {results.length > 0 && !loading && (

                            <h3 style={{
                                margin: '10px',
                                fontSize: '15px',
                                color: '#333'
                            }}>

                                {isTicketSearch
                                    ? `${results.length} record${results.length !== 1 ? 's' : ''} found`
                                    : (
                                        <>
                                            Showing {displayResults.length} of {results.length} records
                                            {results.length > 10 && (
                                                <span style={{
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    color: '#666',
                                                    marginLeft: '10px'
                                                }}>
                                                    — Use Ticket Number to search specific records
                                                </span>
                                            )}
                                        </>
                                    )
                                }

                            </h3>

                        )}


                        <div className="click2call-table-wrapper">

                            <table className="click2call-table">

                                <thead>

                                    <tr>

                                        <th>
                                            SNo.
                                        </th>

                                        <th>
                                            Branch
                                        </th>

                                        <th>
                                            Franchise
                                        </th>

                                        <th>
                                            TicketNo
                                        </th>

                                        <th>
                                            start_stamp
                                        </th>

                                        <th>
                                            end_stamp
                                        </th>

                                        <th>
                                            hangup_cause
                                        </th>

                                        <th>
                                            duration
                                        </th>

                                        <th>
                                            call_status
                                        </th>

                                        <th>
                                            CreatedDate
                                        </th>

                                        <th>
                                            Recording
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
                                                className="click2call-loading-cell"
                                            >

                                                <div className="click2call-loading">

                                                    <div className="click2call-loading-dots">

                                                        <span></span>
                                                        <span></span>
                                                        <span></span>

                                                    </div>

                                                    <span className="click2call-loading-text">
                                                        Loading...
                                                    </span>

                                                </div>

                                            </td>

                                        </tr>

                                    ) : displayResults.length > 0 ? (

                                        /* =================================
                                           RESULTS
                                        ================================= */

                                        displayResults.map(
                                            (item, index) => (

                                                <tr
                                                    key={
                                                        `${
                                                            item.lead_id ||
                                                            index
                                                        }-${index}`
                                                    }
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>


                                                    <td>
                                                        {
                                                            item.Branch ||
                                                            ''
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            item.Franchise ||
                                                            ''
                                                        }
                                                    </td>


                                                    <td>

                                                        {
                                                            item.lead_id ||
                                                            item.Lead_Id ||
                                                            ''
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            item.start_stamp ||
                                                            ''
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            item.end_stamp ||
                                                            ''
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            item.hangup_cause ||
                                                            ''
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            item.duration ||
                                                            ''
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            item.call_status ||
                                                            ''
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            formatDate(
                                                                item.CreatedDate
                                                            )
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            item.recording_url ? (

                                                                <audio
                                                                    controls
                                                                >

                                                                    <source
                                                                        src={
                                                                            item.recording_url
                                                                        }
                                                                        type="audio/mpeg"
                                                                    />

                                                                    Your browser does not
                                                                    support the audio element.

                                                                </audio>

                                                            ) : (

                                                                <span>
                                                                    No recording
                                                                </span>

                                                            )
                                                        }

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    ) : (

                                        /* =================================
                                           NO RECORDS
                                        ================================= */

                                        <tr>

                                            <td
                                                colSpan="11"
                                                className="click2call-no-record"
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

            </div>

        </DashboardLayout>
    )
}


export default Click2Call