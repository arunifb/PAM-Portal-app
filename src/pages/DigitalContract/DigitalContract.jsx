import { useEffect, useState } from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    searchDigitalContracts,
    exportDigitalContracts,
    resendDigitalContractRequest,
    resendDigitalReceipt
} from '../../api/digitalContractApi'

import {
    getRegions,
    getBranches,
    getFranchises
} from '../../api/reportsApi'

import './DigitalContract.css'

function DigitalContract() {

    // =========================================
    // SESSION VALUES
    // =========================================

    const roleId =
        sessionStorage.getItem('roleId') || ''

    const userId =
        sessionStorage.getItem('userId') || ''

    const loginId =
        sessionStorage.getItem('loginId') || ''

    const sessionRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const sessionBpCode =
        sessionStorage.getItem('bpCode') || ''

    // =========================================
    // NEW REGION / BRANCH / FRANCHISE ROLES
    // Role 1, 6 and 9 use new dropdown flow
    // Role 7 keeps existing logic
    // =========================================

    // const isNewDropdownRole =
    //     roleId === '1' ||
    //     roleId === '6' ||
    //     roleId === '9'
    const isNewDropdownRole =
    roleId === '1' ||
    roleId === '6' ||
    roleId === '9'

    const isRole5 = roleId === '5'

    // =========================================
    // SEARCH FIELDS
    // =========================================

    // const [regionCode, setRegionCode] =
    //     useState(
    //         isNewDropdownRole
    //             ? ''
    //             : sessionRegionCode
    //     )

    const [regionCode, setRegionCode] =
    useState(
        isNewDropdownRole
            ? ''
            : sessionRegionCode
    )

    // const [branchCode, setBranchCode] =
    //     useState(
    //         isNewDropdownRole
    //             ? ''
    //             : (
    //                 roleId === '5' ||
    //                 roleId === '6' ||
    //                 roleId === '21'
    //                     ? sessionBpCode
    //                     : ''
    //             )
    //     )

    const [branchCode, setBranchCode] =
    useState(
        isNewDropdownRole
            ? ''
            : (
                roleId === '5' ||
                roleId === '6' ||
                roleId === '21'
                    ? sessionBpCode
                    : ''
            )
    )

    // Empty value means ALL franchises
    const [franchiseCode, setFranchiseCode] =
        useState(
            roleId === '5'
                ? loginId
                : ''
        )

    const [refId, setRefId] =
        useState('')

    const [icrNo, setIcrNo] =
        useState('')

    const [status, setStatus] =
        useState('S')

    const [icrType, setIcrType] =
        useState('X')

    const [fromDate, setFromDate] =
        useState('')

    const [toDate, setToDate] =
        useState('')

    // =========================================
    // DROPDOWN DATA
    // =========================================

    const [regions, setRegions] =
        useState([])

    const [branches, setBranches] =
        useState([])

    const [franchises, setFranchises] =
        useState([])

    // =========================================
    // DATA
    // =========================================

    const [details, setDetails] =
        useState([])

    const [summary, setSummary] =
        useState([])

    // =========================================
    // UI STATE
    // =========================================

    const [loading, setLoading] =
        useState(false)

    const [downloading, setDownloading] =
        useState(false)

    const [message, setMessage] =
        useState('')

    const [messageType, setMessageType] =
        useState('')

    const [actionLoading, setActionLoading] =
        useState(null)

    const [dropdownLoading, setDropdownLoading] =
        useState(false)

    // =========================================
    // HELPERS
    // =========================================

    const getValue = (
        row,
        fieldName
    ) => {

        if (!row) {
            return ''
        }

        const key =
            Object.keys(row).find(
                key =>
                    key.toLowerCase() ===
                    fieldName.toLowerCase()
            )

        return key
            ? row[key] ?? ''
            : ''
    }

    // =========================================
    // DATE FORMAT
    // Native date input already gives yyyy-mm-dd
    // =========================================

    const formatDateForApi = (
        value
    ) => {

        if (!value) {
            return ''
        }

        return value
    }

    // =========================================
    // BUILD SEARCH REQUEST
    // =========================================

    const buildRequest = () => ({
        icrNo: icrNo.trim(),

        regionCode,

        // Empty value means ALL branches
        branchCode,

        // Empty value means ALL franchises
        franchiseCode,

        refId:
            refId.trim()
                ? Number(refId.trim())
                : 0,

        status,

        icrType,

        fromDate:
            formatDateForApi(fromDate),

        toDate:
            formatDateForApi(toDate)
    })

    const clearMessage = () => {

        setMessage('')

        setMessageType('')
    }

    // =========================================
    // FROM DATE CHANGE
    // =========================================

    const handleFromDateChange = (
        event
    ) => {

        const value =
            event.target.value

        setFromDate(value)

        // Remove only the From Date
        // validation message immediately
        if (
            value &&
            message ===
            'Please select a From Date.'
        ) {

            clearMessage()
        }
    }

    // =========================================
    // TO DATE CHANGE
    // =========================================

    const handleToDateChange = (
        event
    ) => {

        const value =
            event.target.value

        setToDate(value)

        // Remove only the To Date
        // validation message immediately
        if (
            value &&
            message ===
            'Please select a To Date.'
        ) {

            clearMessage()
        }
    }

    // =========================================
    // LOAD REGIONS
    // =========================================

    useEffect(() => {

        const loadRegions = async () => {

            try {

                // ---------------------------------
                // NEW ROLES: 1, 6, 9
                // Load all regions for selection
                // ---------------------------------

                // if (isNewDropdownRole) {

                if (isNewDropdownRole || isRole5) {

                    const result =
                        await getRegions(
                            '',
                            Number(userId)
                        )

                    const regionList =
                        Array.isArray(result)
                            ? result
                            : result?.data || []

                    setRegions(
                        regionList
                    )

                    return
                }

                // ---------------------------------
                // EXISTING LOGIC
                // INCLUDING ROLE 7
                // ---------------------------------

                const result =
                    await getRegions(
                        roleId === '7'
                            ? null
                            : sessionRegionCode
                    )

                const regionList =
                    Array.isArray(result)
                        ? result
                        : result?.data || []

                setRegions(
                    regionList
                )

            } catch (error) {

                console.error(
                    'Digital Contract region error:',
                    error
                )

                setMessage(
                    error.message ||
                    'Unable to load regions.'
                )

                setMessageType('error')
            }
        }

        loadRegions()

    }, [
        roleId,
        userId,
        sessionRegionCode,
        isNewDropdownRole,
        isRole5
    ])

    // =========================================
    // LOAD BRANCHES
    // =========================================

    useEffect(() => {

        const loadBranches = async () => {

            // =====================================
            // NEW LOGIC
            // ROLE 1, 6, 9
            // =====================================

            if (isNewDropdownRole) {

                if (!regionCode) {

                    setBranches([])

                    setBranchCode('')

                    setFranchises([])

                    setFranchiseCode('')

                    return
                }

                try {

                    setDropdownLoading(true)

                    const result =
                        await getBranches(
                            Number(userId),
                            regionCode
                        )

                    const branchList =
                        Array.isArray(result)
                            ? result
                            : result?.data || []

                    setBranches(
                        branchList
                    )

                    // Empty value means ALL branches
                    setBranchCode('')

                    // Franchise resets when branch changes
                    setFranchises([])

                    setFranchiseCode('')

                } catch (error) {

                    console.error(
                        'Digital Contract branch error:',
                        error
                    )

                    setBranches([])

                    setMessage(
                        error.message ||
                        'Unable to load branches.'
                    )

                    setMessageType('error')

                } finally {

                    setDropdownLoading(false)
                }

                return
            }



            // =====================================
            // ROLE 5
            // Same behavior as DigitalICR.jsx
            // =====================================

                if (isRole5) {
                    if (!regionCode) {
                        setBranches([])
                        setBranchCode('')
                        setFranchises([])
                        setFranchiseCode(loginId)
                        return
                    }

                    try {
                        setDropdownLoading(true)

                        const result = await getBranches(
                            Number(userId),
                            regionCode
                        )

                        const branchList = Array.isArray(result)
                            ? result
                            : result?.data || []

                        setBranches(branchList)

                        // Prefer the logged-in user's branch.
                        // Otherwise, select the first returned branch.
                        const matchingBranch = branchList.find(
                            item =>
                                String(getValue(item, 'BpCode')) ===
                                String(sessionBpCode)
                        )

                        if (matchingBranch) {
                            setBranchCode(
                                getValue(matchingBranch, 'BpCode')
                            )
                        } else if (branchList.length > 0) {
                            setBranchCode(
                                getValue(branchList[0], 'BpCode')
                            )
                        } else {
                            setBranchCode('')
                        }

                        setFranchises([])
                        setFranchiseCode(loginId)

                    } catch (error) {
                        console.error(
                            'Digital Contract Role 5 branch error:',
                            error
                        )

                        setBranches([])
                        setBranchCode('')
                        setFranchises([])
                        setFranchiseCode(loginId)

                        setMessage(
                            error.message ||
                            'Unable to load branches.'
                        )

                        setMessageType('error')

                    } finally {
                        setDropdownLoading(false)
                    }

                    return
                }


            // =====================================
            // EXISTING LOGIC
            // INCLUDING ROLE 7
            // =====================================

            if (!regionCode) {

                setBranches([])

                return
            }

            try {

                setDropdownLoading(true)

                const result =
                    await getBranches(
                        Number(roleId),
                        regionCode,
                        roleId === '5' ||
                        roleId === '6' ||
                        roleId === '21'
                            ? sessionBpCode
                            : ''
                    )

                const branchList =
                    Array.isArray(result)
                        ? result
                        : result?.data || []

                setBranches(
                    branchList
                )

            } catch (error) {

                console.error(
                    'Digital Contract branch error:',
                    error
                )

                setBranches([])

                setMessage(
                    error.message ||
                    'Unable to load branches.'
                )

                setMessageType('error')

            } finally {

                setDropdownLoading(false)
            }
        }

        loadBranches()

    }, [
        regionCode,
        roleId,
        userId,
        sessionBpCode,
        isNewDropdownRole,
        isRole5,
        loginId
    ])

    // =========================================
    // LOAD FRANCHISES
    // =========================================

    useEffect(() => {

        const loadFranchises = async () => {

            // =====================================
            // NEW LOGIC
            // ROLE 1, 6, 9
            // =====================================

            if (isNewDropdownRole) {

                // No Region selected
                if (!regionCode) {

                    setFranchises([])

                    setFranchiseCode('')

                    return
                }

                // Region selected but Branch = ALL
                // Do not load franchise list
                if (!branchCode) {

                    setFranchises([])

                    setFranchiseCode('')

                    return
                }

                try {

                    setDropdownLoading(true)

                    const result =
                        await getFranchises(
                            Number(roleId),
                            branchCode,
                            loginId
                        )

                    const franchiseList =
                        Array.isArray(result)
                            ? result
                            : result?.data || []

                    setFranchises(
                        franchiseList
                    )

                    // Empty value means ALL franchises
                    setFranchiseCode('')

                } catch (error) {

                    console.error(
                        'Digital Contract franchise error:',
                        error
                    )

                    setFranchises([])

                    setMessage(
                        error.message ||
                        'Unable to load franchises.'
                    )

                    setMessageType('error')

                } finally {

                    setDropdownLoading(false)
                }

                return
            }


            // =====================================
            // ROLE 5
            // Use the logged-in user's branch and login
            // =====================================

            if (isRole5) {
                if (!branchCode) {
                    setFranchises([])
                    setFranchiseCode(loginId)
                    return
                }

                try {
                    setDropdownLoading(true)

                    const result = await getFranchises(
                        Number(roleId),
                        sessionBpCode,
                        loginId
                    )

                    const franchiseList = Array.isArray(result)
                        ? result
                        : result?.data || []

                    setFranchises(franchiseList)

                    // Automatically select the first franchise.
                    if (franchiseList.length > 0) {
                        const firstFranchiseCode =
                            getValue(franchiseList[0], 'frCode') ||
                            getValue(franchiseList[0], 'Frcode') ||
                            getValue(franchiseList[0], 'FRCode') ||
                            getValue(franchiseList[0], 'loginId') ||
                            getValue(franchiseList[0], 'LoginID')

                        setFranchiseCode(
                            firstFranchiseCode || loginId
                        )
                    } else {
                        setFranchiseCode(loginId)
                    }

                } catch (error) {
                    console.error(
                        'Digital Contract Role 5 franchise error:',
                        error
                    )

                    setFranchises([])

                    setMessage(
                        error.message ||
                        'Unable to load franchises.'
                    )

                    setMessageType('error')

                } finally {
                    setDropdownLoading(false)
                }

                return
            }

            // =====================================
            // EXISTING LOGIC
            // INCLUDING ROLE 7
            // =====================================

            if (!branchCode) {

                setFranchises([])

                // Role 5 always uses logged-in
                // franchise
                if (roleId === '5') {

                    setFranchiseCode(
                        loginId
                    )

                } else {

                    // ALL franchises
                    setFranchiseCode('')
                }

                return
            }

            try {

                setDropdownLoading(true)

                const result =
                    await getFranchises(
                        Number(roleId),
                        branchCode,
                        roleId === '5'
                            ? loginId
                            : ''
                    )

                const franchiseList =
                    Array.isArray(result)
                        ? result
                        : result?.data || []

                setFranchises(
                    franchiseList
                )

                // ---------------------------------
                // Role 5 always uses logged-in
                // franchise
                // ---------------------------------

                if (roleId === '5') {

                    setFranchiseCode(
                        loginId
                    )

                } else {

                    // ALL franchises
                    setFranchiseCode('')
                }

            } catch (error) {

                console.error(
                    'Digital Contract franchise error:',
                    error
                )

                setFranchises([])

                setMessage(
                    error.message ||
                    'Unable to load franchises.'
                )

                setMessageType('error')

            } finally {

                setDropdownLoading(false)
            }
        }

        loadFranchises()

    }, [
        branchCode,
        regionCode,
        roleId,
        loginId,
        sessionBpCode,
        isNewDropdownRole,
        isRole5
    ])

    // =========================================
    // REGION CHANGE
    // =========================================

    const handleRegionChange = (
        event
    ) => {

        const value =
            event.target.value

        setRegionCode(
            value
        )

        // Reset Branch
        setBranchCode('')

        // Reset Franchise
        setFranchiseCode('')

        setBranches([])

        setFranchises([])

        clearMessage()
    }

    // =========================================
    // BRANCH CHANGE
    // =========================================

    const handleBranchChange = (
        event
    ) => {

        const value =
            event.target.value

        // Empty value means ALL branches
        setBranchCode(
            value
        )

        // Whenever branch changes,
        // reset franchise to ALL
        setFranchiseCode('')

        setFranchises([])

        clearMessage()
    }

    // =========================================
    // FRANCHISE CHANGE
    // =========================================

    const handleFranchiseChange = (
        event
    ) => {

        const value =
            event.target.value

        // Empty value means ALL franchises
        setFranchiseCode(
            value
        )

        clearMessage()
    }

    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async (
        event
    ) => {

        event?.preventDefault()

        clearMessage()

        // -------------------------------------
        // REGION VALIDATION
        // Only for roles 1, 6 and 9
        // -------------------------------------

        if (
            (isNewDropdownRole || isRole5) &&
            !regionCode
        ) {

            setMessage(
                'Please select a Region.'
            )

            setMessageType('error')

            return
        }

        // -------------------------------------
        // FROM DATE VALIDATION
        // -------------------------------------

        if (!fromDate) {

            setMessage(
                'Please select a From Date.'
            )

            setMessageType('error')

            return
        }

        // -------------------------------------
        // TO DATE VALIDATION
        // -------------------------------------

        if (!toDate) {

            setMessage(
                'Please select a To Date.'
            )

            setMessageType('error')

            return
        }

        // -------------------------------------
        // DATE VALIDATION
        // -------------------------------------

        if (
            fromDate &&
            toDate &&
            fromDate > toDate
        ) {

            setMessage(
                'From Date cannot be greater than To Date.'
            )

            setMessageType('error')

            return
        }

        // -------------------------------------
        // REF ID VALIDATION
        // -------------------------------------

        if (
            refId.trim() &&
            !/^\d+$/.test(
                refId.trim()
            )
        ) {

            setMessage(
                'RefId must contain only numbers.'
            )

            setMessageType('error')

            return
        }

        setLoading(true)

        try {

            const result =
                await searchDigitalContracts(
                    buildRequest()
                )

            setDetails(
                Array.isArray(
                    result?.data
                )
                    ? result.data
                    : []
            )

            setSummary(
                Array.isArray(
                    result?.summary
                )
                    ? result.summary
                    : []
            )

            setMessage('')

        } catch (error) {

            console.error(
                'Digital Contract search error:',
                error
            )

            setDetails([])

            setSummary([])

            setMessage(
                error.message ||
                'Unable to search digital contract details.'
            )

            setMessageType('error')

        } finally {

            setLoading(false)
        }
    }

    // =========================================
    // DOWNLOAD
    // =========================================

    const handleDownload = async () => {

        clearMessage()

        if (!details.length) {
            return
        }

        setDownloading(true)

        try {

            const blob =
                await exportDigitalContracts(
                    buildRequest()
                )

            const url =
                window.URL.createObjectURL(
                    blob
                )

            const link =
                document.createElement(
                    'a'
                )

            link.href = url

            link.download =
                'DigitalContract.xlsx'

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
                'Digital Contract download error:',
                error
            )

            setMessage(
                error.message ||
                'Unable to download DigitalContract.xlsx.'
            )

            setMessageType('error')

        } finally {

            setDownloading(false)
        }
    }

    // =========================================
    // RESEND REQUEST
    // =========================================

    const handleResendRequest = async (
        row
    ) => {

        const currentRefId =
            getValue(
                row,
                'RefId'
            )

        if (!currentRefId) {
            return
        }

        clearMessage()

        setActionLoading(
            `request-${currentRefId}`
        )

        try {

            const result =
                await resendDigitalContractRequest(
                    Number(currentRefId),
                    Number(userId)
                )

            setMessage(
                result.message ||
                'Submitted Successfully.'
            )

            setMessageType('success')

            await handleSearch()

        } catch (error) {

            console.error(
                'Resend request error:',
                error
            )

            setMessage(
                error.message ||
                'There is some error.'
            )

            setMessageType('error')

        } finally {

            setActionLoading(null)
        }
    }

    // =========================================
    // RESEND RECEIPT
    // =========================================

    const handleResendReceipt = async (
        row
    ) => {

        const currentRefId =
            getValue(
                row,
                'RefId'
            )

        if (!currentRefId) {
            return
        }

        clearMessage()

        setActionLoading(
            `receipt-${currentRefId}`
        )

        try {

            const result =
                await resendDigitalReceipt(
                    Number(currentRefId)
                )

            setMessage(
                result.message ||
                'receipt send successfully'
            )

            setMessageType('success')

        } catch (error) {

            console.error(
                'Resend receipt error:',
                error
            )

            setMessage(
                error.message ||
                'There is some error occurred when trying to send digital receipt.'
            )

            setMessageType('error')

        } finally {

            setActionLoading(null)
        }
    }

    // =========================================
    // STATUS CLASS
    // =========================================

    const getStatusClass = (
        flag
    ) => {

        const value =
            String(flag || '')
                .toUpperCase()

        if (value === 'S') {

            return 'digital-contract-status success'
        }

        if (value === 'A') {

            return 'digital-contract-status alert'
        }

        return 'digital-contract-status error'
    }

    // =========================================
    // SUMMARY
    // =========================================

    const getSummaryValue = (
        fieldName
    ) => {

        if (!summary.length) {
            return 0
        }

        return getValue(
            summary[0],
            fieldName
        ) || 0
    }

    // =========================================
    // RENDER
    // =========================================

    return (

        <DashboardLayout
            title="Digital Contract"
        >

            <div className="digital-contract-page">

                {/* =====================================
                    SEARCH SECTION
                ====================================== */}

                <div className="digital-contract-box">

                    <form
                        onSubmit={
                            handleSearch
                        }
                    >

                        <div className="digital-contract-search-grid">

                            {/* REGION */}

                            <div className="digital-contract-field">

                                <label>
                                    Region

                                    {(isNewDropdownRole || isRole5) && (
                                        <span className="required">
                                            *
                                        </span>
                                    )}
                                </label>

                                <select
                                    value={
                                        regionCode
                                    }
                                    // disabled={
                                    //     roleId !== '7' &&
                                    //     !isNewDropdownRole
                                    // }
                                    disabled={
                                        roleId !== '7' &&
                                        !isNewDropdownRole &&
                                        !isRole5
                                    }
                                    onChange={
                                        handleRegionChange
                                    }
                                >

                                    <option value="">
                                        Select Region
                                    </option>

                                    {regions.map(
                                        (region, index) => {

                                            const value =
                                                getValue(
                                                    region,
                                                    'RegionCode'
                                                )

                                            const text =
                                                getValue(
                                                    region,
                                                    'RegionName'
                                                )

                                            return (

                                                <option
                                                    key={
                                                        `${value}-${index}`
                                                    }
                                                    value={
                                                        value
                                                    }
                                                >
                                                    {
                                                        text ||
                                                        value
                                                    }
                                                </option>
                                            )
                                        }
                                    )}

                                </select>

                            </div>

                            {/* BRANCH */}

                            <div className="digital-contract-field">

                                <label>
                                    Branch
                                </label>

                                <select
                                    value={
                                        branchCode
                                    }
                                    disabled={
                                            isNewDropdownRole
                                                ? !regionCode || dropdownLoading
                                                : isRole5
                                                    ? !regionCode || dropdownLoading
                                                    : (
                                                        roleId === '5' ||
                                                        roleId === '6' ||
                                                        roleId === '21'
                                                    )
                                    }
                                    onChange={
                                        handleBranchChange
                                    }
                                >

                                    <option value="">
                                        All
                                    </option>

                                    {branches.map(
                                        (branch, index) => {

                                            const value =
                                                getValue(
                                                    branch,
                                                    'BpCode'
                                                )

                                            const text =
                                                getValue(
                                                    branch,
                                                    'BranchName'
                                                )

                                            return (

                                                <option
                                                    key={
                                                        `${value}-${index}`
                                                    }
                                                    value={
                                                        value
                                                    }
                                                >
                                                    {
                                                        text ||
                                                        value
                                                    }
                                                </option>
                                            )
                                        }
                                    )}

                                </select>

                            </div>

                            {/* FRANCHISE */}

                            <div className="digital-contract-field">

                                <label>
                                    Franchise
                                </label>

                                <select
                                    value={
                                        franchiseCode
                                    }
                                    disabled={
                                        isNewDropdownRole
                                            ? !regionCode || dropdownLoading
                                            : isRole5
                                                ? true
                                                : false
                                    }
                                    onChange={
                                        handleFranchiseChange
                                    }
                                >

                                    <option value="">
                                        All
                                    </option>

                                    {franchises.map(
                                        (franchise, index) => {

                                            const value =
                                                getValue(
                                                    franchise,
                                                    'frCode'
                                                )

                                            const text =
                                                getValue(
                                                    franchise,
                                                    'FranchiseName'
                                                )

                                            return (

                                                <option
                                                    key={
                                                        `${value}-${index}`
                                                    }
                                                    value={
                                                        value
                                                    }
                                                >
                                                    {
                                                        text ||
                                                        value
                                                    }
                                                </option>
                                            )
                                        }
                                    )}

                                </select>

                            </div>

                            {/* REF ID */}

                            <div className="digital-contract-field">

                                <label>
                                    RefId#
                                </label>

                                <input
                                    type="text"
                                    value={
                                        refId
                                    }
                                    onChange={
                                        event =>
                                            setRefId(
                                                event.target.value
                                            )
                                    }
                                    maxLength={18}
                                    placeholder="Enter RefId"
                                />

                            </div>

                            {/* ICR NUMBER */}

                            <div className="digital-contract-field">

                                <label>
                                    ICR Number
                                </label>

                                <input
                                    type="text"
                                    value={
                                        icrNo
                                    }
                                    onChange={
                                        event =>
                                            setIcrNo(
                                                event.target.value
                                            )
                                    }
                                    placeholder="Enter ICR number"
                                />

                            </div>

                            {/* STATUS */}

                            <div className="digital-contract-field">

                                <label>
                                    Status
                                </label>

                                <select
                                    value={
                                        status
                                    }
                                    onChange={
                                        event =>
                                            setStatus(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="">
                                        All
                                    </option>

                                    <option value="S">
                                        Success
                                    </option>

                                    <option value="E">
                                        Error
                                    </option>

                                    <option value="P">
                                        Re-Processing
                                    </option>

                                    <option value="A">
                                        Alert
                                    </option>

                                </select>

                            </div>

                            {/* ICR TYPE */}

                            <div className="digital-contract-field">

                                <label>
                                    ICR Type
                                </label>

                                <select
                                    value={
                                        icrType
                                    }
                                    onChange={
                                        event =>
                                            setIcrType(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="X">
                                        Digital ICR
                                    </option>

                                    <option value="">
                                        Physical ICR
                                    </option>

                                </select>

                            </div>

                            {/* FROM DATE */}

                            <div className="digital-contract-field">

                                <label>

                                    Purchased From Date

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
                                        handleFromDateChange
                                    }
                                />

                            </div>

                            {/* TO DATE */}

                            <div className="digital-contract-field">

                                <label>

                                    Purchased To Date

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
                                        handleToDateChange
                                    }
                                />

                            </div>

                            {/* BUTTONS */}

                            <div className="digital-contract-search-actions">

                                <button
                                    type="submit"
                                    className="digital-contract-search-button"
                                    disabled={
                                        loading ||
                                        dropdownLoading
                                    }
                                >

                                    {loading
                                        ? 'Searching...'
                                        : 'Search'}

                                </button>

                                <button
                                    type="button"
                                    className="digital-contract-download-button"
                                    disabled={
                                        !details.length ||
                                        downloading
                                    }
                                    onClick={
                                        handleDownload
                                    }
                                >

                                    {downloading
                                        ? 'Downloading...'
                                        : 'Download'}

                                </button>

                            </div>

                        </div>

                    </form>

                </div>

                {/* =====================================
                    MESSAGE
                ====================================== */}

                {message && (

                    <div
                        className={
                            messageType === 'success'
                                ? 'digital-contract-message digital-contract-success-message'
                                : 'digital-contract-message digital-contract-error-message'
                        }
                    >
                        {message}
                    </div>

                )}

                {/* =====================================
                    SUMMARY
                ====================================== */}

                <div className="digital-contract-summary-box">

                    <div className="digital-contract-summary-item success">

                        <span>
                            Success
                        </span>

                        <strong>
                            {
                                getSummaryValue(
                                    'Success'
                                )
                            }
                        </strong>

                    </div>

                    <div className="digital-contract-summary-item processing">

                        <span>
                            Re-Send
                        </span>

                        <strong>
                            {
                                getSummaryValue(
                                    'Re-Processing'
                                )
                            }
                        </strong>

                    </div>

                    <div className="digital-contract-summary-item alert">

                        <span>
                            Alert
                        </span>

                        <strong>
                            {
                                getSummaryValue(
                                    'Alert'
                                )
                            }
                        </strong>

                    </div>

                    <div className="digital-contract-summary-item error">

                        <span>
                            Error
                        </span>

                        <strong>
                            {
                                getSummaryValue(
                                    'Error'
                                )
                            }
                        </strong>

                    </div>

                    <div className="digital-contract-summary-item total">

                        <span>
                            Total
                        </span>

                        <strong>
                            {
                                getSummaryValue(
                                    'Total'
                                )
                            }
                        </strong>

                    </div>

                </div>

                {/* =====================================
                    RESULTS
                ====================================== */}

                <div className="digital-contract-box">

                    <div className="digital-contract-section-title">

                        Digital Contract Details

                    </div>

                    <div className="digital-contract-table-wrapper">

                        <table className="digital-contract-table">

                            <thead>

                                <tr>

                                    <th>
                                        #RefId
                                    </th>

                                    <th>
                                        Franchise
                                    </th>

                                    <th>
                                        Customer Name
                                    </th>

                                    <th>
                                        ICRNO
                                    </th>

                                    <th>
                                        SerialNo.
                                    </th>

                                    <th>
                                        AMC Type
                                    </th>

                                    <th>
                                        Price
                                    </th>

                                    <th>
                                        Remarks
                                    </th>

                                    <th>
                                        Purchased Date
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {loading && (

                                    <tr>

                                        <td
                                            colSpan="10"
                                            className="digital-contract-loading"
                                        >
                                            Loading...
                                        </td>

                                    </tr>

                                )}

                                {!loading &&
                                    details.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="10"
                                            className="digital-contract-empty"
                                        >
                                            No record found. Change search criteria.
                                        </td>

                                    </tr>

                                )}

                                {!loading &&
                                    details.map(
                                        (
                                            row,
                                            index
                                        ) => {

                                            const currentRefId =
                                                getValue(
                                                    row,
                                                    'RefId'
                                                )

                                            const flag =
                                                getValue(
                                                    row,
                                                    'flag'
                                                )

                                            const flagValue =
                                                String(
                                                    flag || ''
                                                ).toUpperCase()

                                            return (

                                                <tr
                                                    key={
                                                        `${currentRefId}-${index}`
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            currentRefId
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            getValue(
                                                                row,
                                                                'FranchiseName'
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            getValue(
                                                                row,
                                                                'customer_name'
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            getValue(
                                                                row,
                                                                'DigitalICR'
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            getValue(
                                                                row,
                                                                'serial_no'
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            getValue(
                                                                row,
                                                                'description'
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            getValue(
                                                                row,
                                                                'gross_value'
                                                            )
                                                        }
                                                    </td>

                                                    <td
                                                        title={
                                                            getValue(
                                                                row,
                                                                'remarks'
                                                            )
                                                        }
                                                        className="digital-contract-remarks"
                                                    >
                                                        {
                                                            getValue(
                                                                row,
                                                                'remarks'
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            getValue(
                                                                row,
                                                                'amc_purchased_date'
                                                            )
                                                        }
                                                    </td>

                                                    <td>

                                                        <div className="digital-contract-status-wrapper">

                                                            <span
                                                                className={
                                                                    getStatusClass(
                                                                        flag
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    flag
                                                                }
                                                            </span>

                                                            {/* SUCCESS -> RESEND RECEIPT */}

                                                            {flagValue === 'S' && (

                                                                <button
                                                                    type="button"
                                                                    className="digital-contract-action-button receipt"
                                                                    title="Resend Receipt"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        `receipt-${currentRefId}`
                                                                    }
                                                                    onClick={() =>
                                                                        handleResendReceipt(
                                                                            row
                                                                        )
                                                                    }
                                                                >

                                                                    {actionLoading ===
                                                                    `receipt-${currentRefId}`
                                                                        ? '...'
                                                                        : '✉'}

                                                                </button>

                                                            )}

                                                            {/* ERROR / OTHER -> RESEND REQUEST */}

                                                            {flagValue !== 'S' &&
                                                                flagValue !== 'A' && (

                                                                <button
                                                                    type="button"
                                                                    className="digital-contract-action-button resend"
                                                                    title="Resend Request In CRM"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        `request-${currentRefId}`
                                                                    }
                                                                    onClick={() =>
                                                                        handleResendRequest(
                                                                            row
                                                                        )
                                                                    }
                                                                >

                                                                    {actionLoading ===
                                                                    `request-${currentRefId}`
                                                                        ? '...'
                                                                        : '➤'}

                                                                </button>

                                                            )}

                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        }
                                    )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </DashboardLayout>
    )
}

export default DigitalContract