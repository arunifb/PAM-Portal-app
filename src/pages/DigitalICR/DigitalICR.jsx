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

    const sessionUserId =
        Number(
            sessionStorage.getItem('userId') || 0
        )

    const roleId =
        Number(
            sessionStorage.getItem('roleId') ||
            sessionStorage.getItem('roleID')
        ) || 0

    const sessionRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const bpCode =
        sessionStorage.getItem('bpCode') || ''

    const loginId =
        sessionStorage.getItem('loginId') || ''


    // =========================================
    // REGION STATE
    // =========================================

    const [regions, setRegions] =
        useState([])

    const [selectedRegionCode, setSelectedRegionCode] =
        useState('')

    const [loadingRegions, setLoadingRegions] =
        useState(false)


    // =========================================
    // FORM STATE
    // =========================================

    const [branches, setBranches] =
        useState([])

    const [franchises, setFranchises] =
        useState([])


    const [branchCode, setBranchCode] =
        useState('')

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
    // GET REGION VALUE
    // =========================================

    const getRegionCode = (item) => {

        return (
            item.regionCode ??
            item.RegionCode ??
            ''
        )

    }


    const getRegionName = (item) => {

        return (
            item.regionName ??
            item.RegionName ??
            item.name ??
            item.Name ??
            ''
        )

    }


    // =========================================
    // LOAD REGIONS
    // =========================================

    useEffect(() => {

        let cancelled = false


        const loadRegions = async () => {

            try {

                setLoadingRegions(true)
                setError('')


                const data =
                    await getRegions(
                        '',
                        sessionUserId
                    )


                if (cancelled) {
                    return
                }


                if (!Array.isArray(data)) {

                    throw new Error(
                        'Invalid region response.'
                    )

                }


                setRegions(data)


                // =====================================
                // INITIAL REGION
                // =====================================
                //
                // Role 1:
                // Start with Select Region.
                //
                // Other roles:
                // Use session region if available.
                // =====================================

                if (
                    roleId === 1
                ) {

                    setSelectedRegionCode('')

                }
                else if (
                    sessionRegionCode
                ) {

                    setSelectedRegionCode(
                        sessionRegionCode
                    )

                }
                else {

                    setSelectedRegionCode('')

                }


            } catch (error) {

                if (cancelled) {
                    return
                }


                console.error(
                    'Digital ICR region error:',
                    error
                )


                setRegions([])

                setSelectedRegionCode('')


                setError(
                    error.message ||
                    'Unable to load regions.'
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
        roleId,
        sessionRegionCode
    ])


    // =========================================
    // LOAD BRANCHES
    // =========================================

    useEffect(() => {

        let cancelled = false


        const loadBranches = async () => {

            // =====================================
            // NO REGION SELECTED
            // =====================================

            if (!selectedRegionCode) {

                setBranches([])

                setBranchCode('')

                setFranchises([])

                setFranchiseCode('All')

                setLoadingBranches(false)

                return

            }


            try {

                setLoadingBranches(true)
                setError('')


                console.log(
                    'Digital ICR Loading branches:',
                    {
                        userId:
                            sessionUserId,

                        regionCode:
                            selectedRegionCode
                    }
                )


                const data =
                    await getBranches(
                        sessionUserId,
                        selectedRegionCode
                    )


                if (cancelled) {
                    return
                }


                console.log(
                    'Digital ICR Branch Response:',
                    data
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
                // Show All + returned branches.
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
                //
                // Keep their existing branch behavior.
                // =====================================

                else {

                    setBranches(data)


                    if (
                        bpCode &&
                        data.some(
                            item =>
                                String(
                                    getBranchCode(item)
                                ) ===
                                String(bpCode)
                        )
                    ) {

                        setBranchCode(
                            bpCode
                        )

                    }
                    else if (
                        data.length > 0
                    ) {

                        setBranchCode(
                            getBranchCode(
                                data[0]
                            )
                        )

                    }
                    else {

                        setBranchCode('')

                    }

                }


                // =====================================
                // RESET FRANCHISE
                // =====================================

                setFranchises([])

                setFranchiseCode('All')


            } catch (error) {

                if (cancelled) {
                    return
                }


                console.error(
                    'Digital ICR branch error:',
                    error
                )


                setBranches([])

                setBranchCode('')

                setFranchises([])

                setFranchiseCode('All')


                setError(
                    error.message ||
                    'Unable to load branches.'
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
        roleId,
        bpCode
    ])


    // =========================================
    // LOAD FRANCHISES
    // =========================================

    useEffect(() => {

        let cancelled = false


        const loadFranchises = async () => {

            // =====================================
            // NO REGION
            // =====================================

            if (!selectedRegionCode) {

                setFranchises([])

                setFranchiseCode('All')

                setLoadingFranchises(false)

                return

            }


            // =====================================
            // NO BRANCH
            // =====================================

            if (!branchCode) {

                setFranchises([])

                setFranchiseCode('All')

                setLoadingFranchises(false)

                return

            }


            try {

                setLoadingFranchises(true)
                setError('')


                let franchiseBpCode =
                    branchCode

                let franchiseLoginId =
                    loginId


                // =====================================
                // ROLE 1
                // =====================================

                if (roleId === 1) {

                    franchiseBpCode =
                        branchCode

                    franchiseLoginId =
                        loginId

                }

                // =====================================
                // ROLE 6
                // =====================================

                else if (roleId === 6) {

                    franchiseBpCode =
                        bpCode

                    franchiseLoginId =
                        loginId

                }

                // =====================================
                // ROLE 5
                // =====================================

                else if (roleId === 5) {

                    franchiseBpCode =
                        bpCode

                    franchiseLoginId =
                        loginId

                }

                // =====================================
                // OTHER ROLES
                // =====================================

                else {

                    setFranchises([])

                    setFranchiseCode('All')

                    setLoadingFranchises(false)

                    return

                }


                console.log(
                    'Digital ICR Loading franchises:',
                    {
                        roleId,
                        regionCode:
                            selectedRegionCode,
                        bpCode:
                            franchiseBpCode,
                        loginId:
                            franchiseLoginId
                    }
                )


                const data =
                    await getFranchises(
                        roleId,
                        franchiseBpCode,
                        franchiseLoginId
                    )


                if (cancelled) {
                    return
                }


                console.log(
                    'Digital ICR Franchise Response:',
                    data
                )


                if (!Array.isArray(data)) {

                    throw new Error(
                        'Invalid franchise response.'
                    )

                }


                // =====================================
                // ROLE 1
                // =====================================

                if (roleId === 1) {

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

                    setFranchises(data)


                    if (
                        data.length > 0
                    ) {

                        setFranchiseCode(
                            getFranchiseCode(
                                data[0]
                            )
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

                    setFranchises(data)


                    if (
                        data.length > 0
                    ) {

                        setFranchiseCode(
                            getFranchiseCode(
                                data[0]
                            )
                        )

                    }
                    else {

                        setFranchiseCode('All')

                    }

                }


            } catch (error) {

                if (cancelled) {
                    return
                }


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
        roleId,
        bpCode,
        loginId
    ])


    // =========================================
    // REGION CHANGE
    // =========================================

    const handleRegionChange = (event) => {

        const selectedRegion =
            event.target.value


        setSelectedRegionCode(
            selectedRegion
        )


        // Reset dependent filters.
        setBranches([])

        setBranchCode('')

        setFranchises([])

        setFranchiseCode('All')


        // Clear previous results/messages.
        setRecords([])

        setError('')

        setMessage('')

    }


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
        // REGION VALIDATION
        // =====================================

        if (!selectedRegionCode) {

            setError(
                'Region is required.'
            )

            return

        }


        // =====================================
        // DATE VALIDATION
        // =====================================

        if (
            !fromDate ||
            !toDate
        ) {

            setError(
                'From Date and To Date are required.'
            )

            return

        }


        if (
            fromDate >
            toDate
        ) {

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
                branchCode ||
                'All',

            franchiseCode:
                franchiseCode ||
                'All',

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
                Array.isArray(
                    response?.data
                )
                    ? response.data
                    : []


            setRecords(data)


            if (
                data.length === 0
            ) {

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
                branchCode ||
                'All',

            franchiseCode:
                franchiseCode ||
                'All',

            fromDate:
                fromDate ||
                null,

            toDate:
                toDate ||
                null

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


            link.href =
                url


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
            item.frcode ??
            item.loginId ??
            item.LoginID ??
            ''
        )

    }


    const getFranchiseName = (item) => {

        return (
            item.franchiseName ??
            item.FranchiseName ??
            item.FranchiseName ??
            item.userName ??
            item.UserName ??
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
                            REGION
                        ============================= */}

                        <div className="digital-icr-field">

                            <label>
                                Region
                            </label>


                            <select
                                value={
                                    selectedRegionCode
                                }
                                onChange={
                                    handleRegionChange
                                }
                                disabled={
                                    loadingRegions
                                }
                            >

                                <option value="">
                                    Select Region
                                </option>


                                {
                                    regions.map(
                                        (
                                            item,
                                            index
                                        ) => {

                                            const code =
                                                getRegionCode(
                                                    item
                                                )

                                            const name =
                                                getRegionName(
                                                    item
                                                )


                                            return (

                                                <option
                                                    key={
                                                        code ||
                                                        `region-${index}`
                                                    }
                                                    value={
                                                        code
                                                    }
                                                >

                                                    {
                                                        name
                                                    }

                                                </option>

                                            )

                                        }
                                    )
                                }

                            </select>

                        </div>


                        {/* =============================
                            BRANCH
                        ============================= */}

                        <div className="digital-icr-field">

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
                                    !selectedRegionCode ||
                                    loadingBranches
                                }
                            >

                                {
                                    !selectedRegionCode ? (

                                        <option value="">
                                            Select Region First
                                        </option>

                                    ) : (

                                        branches.map(
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
                                                        getBranchName(
                                                            item
                                                        )
                                                    }

                                                </option>

                                            )
                                        )

                                    )

                                }

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
                                value={
                                    franchiseCode
                                }
                                onChange={
                                    handleFranchiseChange
                                }
                                disabled={
                                    !selectedRegionCode ||
                                    !branchCode ||
                                    loadingFranchises ||
                                    roleId === 5
                                }
                            >

                                {
                                    !selectedRegionCode ? (

                                        <option value="All">
                                            Select Region First
                                        </option>

                                    ) : !branchCode ? (

                                        <option value="All">
                                            All
                                        </option>

                                    ) : (

                                        franchises.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <option
                                                    key={
                                                        `${getFranchiseCode(item)}-${index}`
                                                    }
                                                    value={
                                                        getFranchiseCode(item)
                                                    }
                                                >

                                                    {
                                                        getFranchiseName(
                                                            item
                                                        )
                                                    }

                                                </option>

                                            )
                                        )

                                    )

                                }

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

                        <div className="digital-icr-field">

                            <label>

                                ICR To Date

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

                    {
                        error && (

                            <div className="digital-icr-error">
                                {error}
                            </div>

                        )
                    }


                    {/* =================================
                        MESSAGE
                    ================================= */}

                    {
                        message && (

                            <div className="digital-icr-message">
                                {message}
                            </div>

                        )
                    }


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

                            {
                                searching
                                    ? 'Searching...'
                                    : 'Search'
                            }

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

                            {
                                downloading
                                    ? 'Downloading...'
                                    : 'Download'
                            }

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

                    {
                        records.length > 0 &&
                        !searching && (

                            <h3 className="digital-icr-record-count">

                                {
                                    records.length
                                }

                                {' '}

                                record

                                {
                                    records.length !== 1
                                        ? 's'
                                        : ''
                                }

                                {' '}

                                found

                            </h3>

                        )
                    }


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

                                {
                                    searching ? (

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
                                            (
                                                record,
                                                index
                                            ) => (

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

                                    )
                                }

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </DashboardLayout>

    )

}


export default DigitalICR