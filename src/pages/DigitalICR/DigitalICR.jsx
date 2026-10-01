import { useEffect, useState } from 'react'
import './DigitalICR.css'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
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
    // FORM STATE
    // =========================================

    const [branches, setBranches] = useState([])
    const [franchises, setFranchises] = useState([])

    const [branchCode, setBranchCode] =
        useState('All')

    const [franchiseCode, setFranchiseCode] =
        useState('All')

    const [fromDate, setFromDate] =
        useState('')

    const [toDate, setToDate] =
        useState('')


    // =========================================
    // RESULT STATE
    // =========================================

    const [records, setRecords] =
        useState([])

    const [searching, setSearching] =
        useState(false)

    const [downloading, setDownloading] =
        useState(false)


    // =========================================
    // LOADING STATE
    // =========================================

    const [loadingBranches, setLoadingBranches] =
        useState(false)

    const [loadingFranchises, setLoadingFranchises] =
        useState(false)


    // =========================================
    // MESSAGE STATE
    // =========================================

    const [error, setError] =
        useState('')

    const [message, setMessage] =
        useState('')


    // =========================================
    // LOAD BRANCHES
    // =========================================

    useEffect(() => {

        const loadBranches = async () => {

            try {

                setLoadingBranches(true)
                setError('')

                const data =
                    await getBranches(
                        roleId,
                        regionCode,
                        bpCode
                    )


                if (!Array.isArray(data)) {

                    throw new Error(
                        'Invalid branch response.'
                    )
                }


                // =====================================
                // ROLE 1
                // =====================================
                //
                // Role 1:
                // Show all branches.
                // =====================================

                if (roleId === 1) {

                    setBranches([
                        {
                            bpCode: 'All',
                            branchName: 'All'
                        },
                        ...data
                    ])

                    setBranchCode('All')

                }

                // =====================================
                // OTHER ROLES
                // =====================================

                else {

                    setBranches(data)


                    if (data.length > 0) {

                        setBranchCode(
                            data[0].bpCode
                        )

                    }
                    else if (bpCode) {

                        setBranchCode(bpCode)

                    }

                }

            } catch (error) {

                console.error(
                    'Digital ICR branch error:',
                    error
                )

                setError(
                    error.message ||
                    'Unable to load branches.'
                )

            } finally {

                setLoadingBranches(false)

            }
        }


        loadBranches()

    }, [
        roleId,
        regionCode,
        bpCode
    ])


    // =========================================
    // LOAD FRANCHISES
    // =========================================

    useEffect(() => {

        const loadFranchises = async () => {

            try {

                setLoadingFranchises(true)
                setError('')

                // =====================================
                // ROLE 1
                // =====================================

                if (roleId === 1) {

                    const data =
                        await getFranchises(
                            roleId,
                            branchCode,
                            loginId
                        )


                    if (!Array.isArray(data)) {

                        throw new Error(
                            'Invalid franchise response.'
                        )

                    }


                    setFranchises([
                        {
                            frCode: 'All',
                            franchiseName: 'All'
                        },
                        ...data
                    ])


                    setFranchiseCode('All')

                }

                // =====================================
                // ROLE 6
                // =====================================

                else if (roleId === 6) {

                    const data =
                        await getFranchises(
                            roleId,
                            bpCode,
                            loginId
                        )


                    if (!Array.isArray(data)) {

                        throw new Error(
                            'Invalid franchise response.'
                        )

                    }


                    setFranchises(data)


                    if (data.length > 0) {

                        setFranchiseCode(
                            data[0].frCode
                        )

                    }
                    else {

                        setFranchiseCode('All')

                    }

                }

                // =====================================
                // ROLE 5
                // =====================================

                else if (roleId === 5) {

                    const data =
                        await getFranchises(
                            roleId,
                            bpCode,
                            loginId
                        )


                    if (!Array.isArray(data)) {

                        throw new Error(
                            'Invalid franchise response.'
                        )

                    }


                    setFranchises(data)


                    if (data.length > 0) {

                        setFranchiseCode(
                            data[0].frCode
                        )

                    }
                    else {

                        setFranchiseCode('All')

                    }

                }

                // =====================================
                // OTHER ROLES
                // =====================================

                else {

                    setFranchises([])
                    setFranchiseCode('All')

                }

            } catch (error) {

                console.error(
                    'Digital ICR franchise error:',
                    error
                )

                setFranchises([])

                setFranchiseCode('All')

                setError(
                    error.message ||
                    'Unable to load franchises.'
                )

            } finally {

                setLoadingFranchises(false)

            }
        }


        loadFranchises()

    }, [
        branchCode,
        roleId,
        bpCode,
        loginId
    ])


    // =========================================
    // BRANCH CHANGE
    // =========================================

    const handleBranchChange = (event) => {

        const selectedBranch =
            event.target.value


        setBranchCode(
            selectedBranch
        )

        setFranchiseCode('All')

        setFranchises([])

        setRecords([])

        setError('')

        setMessage('')

    }


    // =========================================
    // FRANCHISE CHANGE
    // =========================================

    const handleFranchiseChange = (event) => {

        setFranchiseCode(
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

        // Clear previous records immediately.
        setRecords([])


        // =====================================
        // VALIDATION
        // =====================================

        if (!fromDate || !toDate) {

            setError(
                'From Date and To Date are required.'
            )

            return

        }


        if (fromDate > toDate) {

            setError(
                'From Date cannot be greater than To Date.'
            )

            return

        }


        // =====================================
        // REQUEST
        // =====================================

        const searchData = {

            branchCode:
                branchCode || 'All',

            franchiseCode:
                franchiseCode || 'All',

            fromDate:
                fromDate,

            toDate:
                toDate

        }


        console.log(
            'Digital ICR Search Request:',
            searchData
        )


        // =====================================
        // API CALL
        // =====================================

        try {

            setSearching(true)


            const response =
                await searchDigitalICR(
                    searchData
                )


            console.log(
                'Digital ICR Search Response:',
                response
            )


            const data =
                Array.isArray(response?.data)
                    ? response.data
                    : []


            setRecords(data)


            if (data.length === 0) {

                setMessage(
                    'No records found.'
                )

            }

        } catch (error) {

            console.error(
                'Digital ICR search error:',
                error
            )

            setError(
                error.message ||
                'Unable to load Digital ICR data.'
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

            branchCode:
                branchCode || 'All',

            franchiseCode:
                franchiseCode || 'All',

            fromDate:
                fromDate || null,

            toDate:
                toDate || null

        }


        try {

            setDownloading(true)


            const blob =
                await exportDigitalICR(
                    searchData
                )


            const url =
                window.URL.createObjectURL(
                    blob
                )


            const link =
                document.createElement('a')


            link.href = url

            link.download =
                'DigitalICR.xlsx'


            document.body.appendChild(
                link
            )

            link.click()

            link.remove()


            window.URL.revokeObjectURL(
                url
            )

        } catch (error) {

            console.error(
                'Digital ICR download error:',
                error
            )

            setError(
                error.message ||
                'Unable to download Digital ICR.'
            )

        } finally {

            setDownloading(false)

        }

    }


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatICRDate = (value) => {

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
    // GET BRANCH VALUE
    // =========================================

    const getBranchCode = (item) => {

        return (
            item.bpCode ??
            item.BPCode ??
            ''
        )

    }


    const getBranchName = (item) => {

        return (
            item.branchName ??
            item.BranchName ??
            ''
        )

    }


    // =========================================
    // GET FRANCHISE VALUE
    // =========================================

    const getFranchiseCode = (item) => {

        return (
            item.frCode ??
            item.Frcode ??
            item.FRCode ??
            ''
        )

    }


    const getFranchiseName = (item) => {

        return (
            item.franchiseName ??
            item.FranchiseName ??
            ''
        )

    }


    // =========================================
    // UI
    // =========================================

    return (

        <DashboardLayout title="Digital ICR">

            <div className="digital-icr-page">


                {/* =================================
                    FILTER BOX
                ================================= */}

                <div className="digital-icr-card">


                    {/* =================================
                        FILTERS
                    ================================= */}

                    <div className="digital-icr-filter-grid">


                        {/* =============================
                            BRANCH
                        ============================= */}

                        <div className="digital-icr-field">

                            <label>
                                Branch
                            </label>

                            <select
                                value={branchCode}
                                onChange={
                                    handleBranchChange
                                }
                                disabled={
                                    loadingBranches ||
                                    roleId !== 1
                                }
                            >

                                {branches.map(
                                    (item, index) => (

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
                            FRANCHISE
                        ============================= */}

                        <div className="digital-icr-field">

                            <label>
                                Franchise
                            </label>

                            <select
                                value={franchiseCode}
                                onChange={
                                    handleFranchiseChange
                                }
                                disabled={
                                    loadingFranchises ||
                                    roleId === 5 ||
                                    !branchCode
                                }
                            >

                                {franchises.map(
                                    (item, index) => (

                                        <option
                                            key={
                                                `${getFranchiseCode(item)}-${index}`
                                            }
                                            value={
                                                getFranchiseCode(item)
                                            }
                                        >

                                            {
                                                getFranchiseName(item)
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* =============================
                            FROM DATE
                        ============================= */}

                        <div className="digital-icr-field">

                            <label>

                                ICR From Date

                                <span className="required">
                                    *
                                </span>

                            </label>

                            <input
                                type="date"
                                value={fromDate}
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

                        <div className="digital-icr-field">

                            <label>

                                ICR To Date

                                <span className="required">
                                    *
                                </span>

                            </label>

                            <input
                                type="date"
                                value={toDate}
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

                        <div className="digital-icr-error">
                            {error}
                        </div>

                    )}


                    {/* =================================
                        MESSAGE
                    ================================= */}

                    {message && (

                        <div className="digital-icr-message">
                            {message}
                        </div>

                    )}


                    {/* =================================
                        BUTTONS
                    ================================= */}

                    <div className="digital-icr-actions">

                        <button
                            type="button"
                            className="digital-icr-search-button"
                            onClick={
                                handleSearch
                            }
                            disabled={
                                searching
                            }
                        >

                            {searching
                                ? 'Searching...'
                                : 'Search'}

                        </button>


                        <button
                            type="button"
                            className="digital-icr-download-button"
                            onClick={
                                handleDownload
                            }
                            disabled={
                                records.length === 0 ||
                                downloading ||
                                searching
                            }
                        >

                            {downloading
                                ? 'Downloading...'
                                : 'Download'}

                        </button>

                    </div>

                </div>


                {/* =================================
                    RESULTS
                ================================= */}

                <div className="digital-icr-card">


                    {/* =================================
                        TOTAL RECORDS
                    ================================= */}

                    {records.length > 0 &&
                        !searching && (

                            <h3 className="digital-icr-record-count">

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

                    <div className="digital-icr-table-container">

                        <table className="digital-icr-table">

                            <thead>

                                <tr>

                                    <th>
                                        #TicketNo
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Franchise
                                    </th>

                                    <th>
                                        Technician
                                    </th>

                                    <th>
                                        ICRNO
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        ICR Date
                                    </th>

                                    <th>
                                        PaymentMode
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                </tr>

                            </thead>


                            <tbody>


                                {/* =================================
                                    LOADING
                                ================================= */}

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

                                    /* =================================
                                       RESULTS
                                    ================================= */

                                    records.map(
                                        (record, index) => (

                                            <tr
                                                key={
                                                    `${record.ticketNo || index}-${index}`
                                                }
                                            >

                                                <td>
                                                    {
                                                        record.ticketNo ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.customer ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.franchiseName ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.technician ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.icrNo ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.amount ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatICRDate(
                                                            record.icrDate
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.paymentMode ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.type ||
                                                        ''
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