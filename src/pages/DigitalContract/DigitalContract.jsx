
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

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarDays } from 'lucide-react'

function DigitalContract() {
    // =========================================
    // SESSION VALUES
    // =========================================

    const sessionUserId = Number(sessionStorage.getItem('userId') || 0)
    const loginId = sessionStorage.getItem('loginId') || ''
    const sessionRegionCode = sessionStorage.getItem('regionCode') || ''
    const sessionBpCode =
        sessionStorage.getItem('bpCode') ||
        sessionStorage.getItem('BPCode') ||
        ''

    let storedRoles = []

    try {
        const parsedRoles = JSON.parse(
            sessionStorage.getItem('roles') || '[]'
        )

        if (Array.isArray(parsedRoles)) {
            storedRoles = parsedRoles.map(role => String(role).trim())
        } else if (parsedRoles !== null && parsedRoles !== undefined) {
            storedRoles = [String(parsedRoles).trim()]
        }
    } catch (error) {
        console.error('Unable to parse stored roles:', error)
    }

    const roles = storedRoles

    const isRole1 = roles.includes('1')
    const isRole5 = roles.includes('5')
    const isRole6 = roles.includes('6')
    const isRole7 = roles.includes('7')
    const isRole9 = roles.includes('9')

    const isDigitalICRDropdownRole = isRole1 || isRole5 || isRole6

    // =========================================
    // SEARCH FIELDS
    // =========================================

    const [regionCode, setRegionCode] = useState(
        isRole5 || isRole6 ? sessionRegionCode : ''
    )

    const [branchCode, setBranchCode] = useState(
        isRole1 ? 'All' : isRole5 || isRole6 ? sessionBpCode : ''
    )

    const [franchiseCode, setFranchiseCode] = useState(
        isRole5 ? loginId : isRole1 || isRole6 ? 'All' : ''
    )

    const [refId, setRefId] = useState('')
    const [icrNo, setIcrNo] = useState('')
    const [status, setStatus] = useState('S')
    const [icrType, setIcrType] = useState('X')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')

    // =========================================
    // DROPDOWN DATA
    // =========================================

    const [regions, setRegions] = useState([])
    const [branches, setBranches] = useState([])
    const [franchises, setFranchises] = useState([])

    // =========================================
    // RESULT DATA
    // =========================================

    const [details, setDetails] = useState([])
    const [summary, setSummary] = useState([])

    // =========================================
    // UI STATE
    // =========================================

    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [actionLoading, setActionLoading] = useState(null)

    const [loadingRegions, setLoadingRegions] = useState(false)
    const [loadingBranches, setLoadingBranches] = useState(false)
    const [loadingFranchises, setLoadingFranchises] = useState(false)

    const dropdownLoading =
        loadingRegions || loadingBranches || loadingFranchises

    // =========================================
    // HELPERS
    // =========================================

    const getValue = (row, fieldName) => {
        if (!row || typeof row !== 'object') return ''

        const key = Object.keys(row).find(
            item => item.toLowerCase() === fieldName.toLowerCase()
        )

        return key ? row[key] ?? '' : ''
    }

    const getArrayResponse = (response, propertyName) => {
        if (Array.isArray(response)) return response

        if (Array.isArray(response?.data)) return response.data

        if (Array.isArray(response?.[propertyName])) {
            return response[propertyName]
        }

        if (Array.isArray(response?.data?.[propertyName])) {
            return response.data[propertyName]
        }

        return []
    }

    const equalsIgnoreCase = (first, second) =>
        String(first ?? '').trim().toLowerCase() ===
        String(second ?? '').trim().toLowerCase()

    const getRegionCode = item =>
        getValue(item, 'RegionCode') ||
        getValue(item, 'regionCode')

    const getRegionName = item =>
        getValue(item, 'RegionName') ||
        getValue(item, 'regionName') ||
        getValue(item, 'Name')

    const getBranchCode = item =>
        getValue(item, 'BpCode') ||
        getValue(item, 'BPCode') ||
        getValue(item, 'BranchCode')

    const getBranchName = item =>
        getValue(item, 'BranchName') ||
        getValue(item, 'Name')

    const getFranchiseCode = item =>
        getValue(item, 'FrCode') ||
        getValue(item, 'Frcode') ||
        getValue(item, 'FRCode') ||
        getValue(item, 'LoginID') ||
        getValue(item, 'LoginId') ||
        getValue(item, 'frCode') ||
        getValue(item, 'loginId')

    const getFranchiseName = item =>
        getValue(item, 'FranchiseName') ||
        getValue(item, 'UserName') ||
        getValue(item, 'Name') ||
        getFranchiseCode(item)

    const clearMessage = () => {
        setMessage('')
        setMessageType('')
    }

    const getValidUserId = () => {
        return Number.isInteger(sessionUserId) && sessionUserId > 0
            ? sessionUserId
            : null
    }

    const buildRequest = () => ({
        icrNo: icrNo.trim(),
        regionCode,
        branchCode: branchCode === 'All' ? '' : branchCode,
        franchiseCode: franchiseCode === 'All' ? '' : franchiseCode,
        refId: refId.trim() ? Number(refId.trim()) : 0,
        status,
        icrType,
        fromDate: fromDate || '',
        toDate: toDate || ''
    })

    // =========================================
    // LOAD REGIONS
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadRegions = async () => {
            try {
                setLoadingRegions(true)
                clearMessage()

                let response

                if (isRole1 || isRole5 || isRole6 || isRole9) {
                    const validUserId = getValidUserId()

                    if (validUserId === null) {
                        throw new Error(
                            'Invalid userId in session. Please check the session value.'
                        )
                    }

                    response = await getRegions('', validUserId)
                } else {
                    response = await getRegions(
                        isRole7 ? null : sessionRegionCode
                    )
                }

                if (cancelled) return

                const regionList = getArrayResponse(response, 'regions')
                setRegions(regionList)

                if (isRole1 || isRole9) {
                    setRegionCode('')
                } else if (isRole5 || isRole6) {
                    const matchingRegion = regionList.find(item =>
                        equalsIgnoreCase(
                            getRegionCode(item),
                            sessionRegionCode
                        )
                    )

                    setRegionCode(
                        matchingRegion
                            ? String(getRegionCode(matchingRegion))
                            : sessionRegionCode
                    )
                }
            } catch (error) {
                if (cancelled) return

                console.error('Digital Contract region error:', error)
                setRegions([])
                setMessage(error.message || 'Unable to load regions.')
                setMessageType('error')
            } finally {
                if (!cancelled) setLoadingRegions(false)
            }
        }

        loadRegions()

        return () => {
            cancelled = true
        }
    }, [
        sessionUserId,
        sessionRegionCode,
        isRole1,
        isRole5,
        isRole6,
        isRole7,
        isRole9
    ])

    // =========================================
    // LOAD BRANCHES
    // Uses the same API signature as DigitalICR.jsx
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadBranches = async () => {
            setBranches([])
            setFranchises([])

            if (!regionCode) {
                setLoadingBranches(false)
                setLoadingFranchises(false)

                if (isRole1) {
                    setBranchCode('All')
                    setFranchiseCode('All')
                } else if (isRole5) {
                    setBranchCode(sessionBpCode)
                    setFranchiseCode(loginId)
                } else if (isRole6) {
                    setBranchCode(sessionBpCode)
                    setFranchiseCode('All')
                } else if (isRole9) {
                    setBranchCode('')
                    setFranchiseCode('All')
                }

                return
            }

            try {
                setLoadingBranches(true)

                const validUserId = getValidUserId()

                let response

                if (isDigitalICRDropdownRole || isRole9) {
                    if (validUserId === null) {
                        throw new Error(
                            'Invalid userId in session. Please check the session value.'
                        )
                    }

                    response = await getBranches(
                        validUserId,
                        regionCode
                    )
                } else {
                    response = await getBranches(
                        Number(storedRoles[0] || 0),
                        regionCode,
                        sessionBpCode
                    )
                }

                if (cancelled) return

                const branchData = getArrayResponse(response, 'branches')

                console.log('Digital Contract branch response:', response)

                const validBranches = branchData.filter(item =>
                    String(getBranchCode(item)).trim() !== '' &&
                    String(getBranchName(item)).trim() !== ''
                )

                console.log(
                    'Digital Contract parsed branches:',
                    validBranches
                )

                if (isRole1) {
                    const availableBranches = validBranches.filter(
                        item => !equalsIgnoreCase(getBranchCode(item), 'All')
                    )

                    setBranches([
                        { BpCode: 'All', BranchName: 'All' },
                        ...availableBranches
                    ])

                    setBranchCode('All')
                    setFranchiseCode('All')
                } else if (isRole5 || isRole6) {
                    setBranches(validBranches)

                    const matchingBranch = validBranches.find(item =>
                        equalsIgnoreCase(
                            getBranchCode(item),
                            sessionBpCode
                        )
                    )

                    const selectedCode = matchingBranch
                        ? String(getBranchCode(matchingBranch))
                        : sessionBpCode

                    setBranchCode(selectedCode)
                    setFranchiseCode(isRole5 ? loginId : 'All')

                    console.log(
                        'Digital Contract selected branch:',
                        selectedCode
                    )
                } else if (isRole9) {
                    setBranches(validBranches)
                    setBranchCode('')
                    setFranchiseCode('All')
                } else {
                    setBranches(branchData)
                }
            } catch (error) {
                if (cancelled) return

                console.error('Digital Contract branch error:', error)

                setBranches([])
                setFranchises([])

                setBranchCode(
                    isRole1 ? 'All' :
                    isRole5 || isRole6 ? sessionBpCode : ''
                )

                setFranchiseCode(isRole5 ? loginId : 'All')

                setMessage(error.message || 'Unable to load branches.')
                setMessageType('error')
            } finally {
                if (!cancelled) setLoadingBranches(false)
            }
        }

        loadBranches()

        return () => {
            cancelled = true
        }
    }, [
        regionCode,
        sessionUserId,
        sessionBpCode,
        loginId,
        isRole1,
        isRole5,
        isRole6,
        isRole9,
        isDigitalICRDropdownRole
    ])

    // =========================================
    // LOAD FRANCHISES
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadFranchises = async () => {
            setFranchises([])

            if (isRole5) {
                setFranchiseCode(loginId)
            } else if (isRole1 || isRole6) {
                setFranchiseCode('All')
            }

            if (!regionCode || !branchCode) {
                setLoadingFranchises(false)
                return
            }

            try {
                setLoadingFranchises(true)

                let response

                if (isDigitalICRDropdownRole) {
                    const franchiseBpCode = isRole1
                        ? branchCode === 'All' ? '' : branchCode
                        : sessionBpCode

                    response = await getFranchises(
                        franchiseBpCode,
                        loginId
                    )
                } else if (isRole9) {
                    response = await getFranchises(
                        Number(storedRoles[0] || 0),
                        branchCode,
                        loginId
                    )
                } else {
                    response = await getFranchises(
                        Number(storedRoles[0] || 0),
                        branchCode,
                        ''
                    )
                }

                if (cancelled) return

                const franchiseData = getArrayResponse(
                    response,
                    'franchises'
                )

                const validFranchises = franchiseData
                    .filter(item => String(getFranchiseCode(item)).trim() !== '')
                    .sort((a, b) =>
                        String(getFranchiseName(a)).localeCompare(
                            String(getFranchiseName(b)),
                            undefined,
                            { sensitivity: 'base' }
                        )
                    )

                if (isRole1 || isRole6) {
                    const availableFranchises = validFranchises.filter(
                        item => !equalsIgnoreCase(getFranchiseCode(item), 'All')
                    )

                    setFranchises([
                        { FrCode: 'All', FranchiseName: 'All' },
                        ...availableFranchises
                    ])

                    setFranchiseCode('All')
                } else if (isRole5) {
                    setFranchises(validFranchises)

                    const userFranchise = validFranchises.find(item =>
                        equalsIgnoreCase(getFranchiseCode(item), loginId)
                    )

                    setFranchiseCode(
                        userFranchise
                            ? String(getFranchiseCode(userFranchise))
                            : loginId
                    )
                } else if (isRole9) {
                    setFranchises(validFranchises)
                    setFranchiseCode('All')
                } else {
                    setFranchises(franchiseData)
                    setFranchiseCode('')
                }
            } catch (error) {
                if (cancelled) return

                console.error('Digital Contract franchise error:', error)

                setFranchises([])
                setFranchiseCode(isRole5 ? loginId : 'All')

                // setMessage(error.message || 'Unable to load franchises.')
                // setMessageType('error')
                clearMessage()
            } finally {
                if (!cancelled) setLoadingFranchises(false)
            }
        }

        loadFranchises()

        return () => {
            cancelled = true
        }
    }, [
        regionCode,
        branchCode,
        sessionBpCode,
        loginId,
        isRole1,
        isRole5,
        isRole6,
        isRole9,
        isDigitalICRDropdownRole
    ])

    // =========================================
    // REGION CHANGE
    // =========================================

    const handleRegionChange = event => {
        const value = event.target.value

        setRegionCode(value)
        setBranches([])
        setFranchises([])

        if (isRole1) {
            setBranchCode('All')
            setFranchiseCode('All')
        } else {
            setBranchCode('')
            setFranchiseCode(isRole5 ? loginId : 'All')
        }

        setDetails([])
        setSummary([])
        clearMessage()
    }

    // =========================================
    // BRANCH CHANGE
    // =========================================

    const handleBranchChange = event => {
        setBranchCode(event.target.value)
        setFranchises([])
        setFranchiseCode(isRole5 ? loginId : 'All')
        setDetails([])
        setSummary([])
        clearMessage()
    }

    const handleFranchiseChange = event => {
        setFranchiseCode(event.target.value)
        clearMessage()
    }

    // =========================================
    // DATE CHANGES
    // =========================================

    const handleFromDateChange = event => {
        setFromDate(event.target.value)

        if (event.target.value && message === 'Please select a From Date.') {
            clearMessage()
        }
    }

    const handleToDateChange = event => {
        setToDate(event.target.value)

        if (event.target.value && message === 'Please select a To Date.') {
            clearMessage()
        }
    }

    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async event => {
        event?.preventDefault()
        clearMessage()

        if ((isDigitalICRDropdownRole || isRole9) && !regionCode) {
            setMessage('Please select a Region.')
            setMessageType('error')
            return
        }

        if (!fromDate) {
            setMessage('Please select a From Date.')
            setMessageType('error')
            return
        }

        if (!toDate) {
            setMessage('Please select a To Date.')
            setMessageType('error')
            return
        }

        if (fromDate > toDate) {
            setMessage('From Date cannot be greater than To Date.')
            setMessageType('error')
            return
        }

        if (refId.trim() && !/^\d+$/.test(refId.trim())) {
            setMessage('RefId must contain only numbers.')
            setMessageType('error')
            return
        }

        setLoading(true)

        try {
            const result = await searchDigitalContracts(buildRequest())

            setDetails(Array.isArray(result?.data) ? result.data : [])
            setSummary(Array.isArray(result?.summary) ? result.summary : [])
        } catch (error) {
            console.error('Digital Contract search error:', error)

            setDetails([])
            setSummary([])
            setMessage(error.message || 'Unable to search digital contract details.')
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

        if (!details.length) return

        setDownloading(true)

        try {
            const blob = await exportDigitalContracts(buildRequest())
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')

            link.href = url
            link.download = 'DigitalContract.xlsx'

            document.body.appendChild(link)
            link.click()
            link.remove()

            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Digital Contract download error:', error)
            setMessage(error.message || 'Unable to download DigitalContract.xlsx.')
            setMessageType('error')
        } finally {
            setDownloading(false)
        }
    }

    // =========================================
    // RESEND REQUEST
    // =========================================

    const handleResendRequest = async row => {
        const currentRefId = getValue(row, 'RefId')
        if (!currentRefId) return

        clearMessage()
        setActionLoading(`request-${currentRefId}`)

        try {
            const validUserId = getValidUserId()

            if (validUserId === null) {
                throw new Error('Invalid userId in session.')
            }

            const result = await resendDigitalContractRequest(
                Number(currentRefId),
                validUserId
            )

            setMessage(result?.message || 'Submitted Successfully.')
            setMessageType('success')

            await handleSearch()
        } catch (error) {
            console.error('Resend request error:', error)
            setMessage(error.message || 'There is some error.')
            setMessageType('error')
        } finally {
            setActionLoading(null)
        }
    }

    // =========================================
    // RESEND RECEIPT
    // =========================================

    const handleResendReceipt = async row => {
        const currentRefId = getValue(row, 'RefId')
        if (!currentRefId) return

        clearMessage()
        setActionLoading(`receipt-${currentRefId}`)

        try {
            const result = await resendDigitalReceipt(Number(currentRefId))

            setMessage(result?.message || 'receipt send successfully')
            setMessageType('success')
        } catch (error) {
            console.error('Resend receipt error:', error)
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
    // STATUS AND SUMMARY
    // =========================================

    const getStatusClass = flag => {
        const value = String(flag || '').toUpperCase()

        if (value === 'S') return 'digital-contract-status success'
        if (value === 'A') return 'digital-contract-status alert'

        return 'digital-contract-status error'
    }

    const getSummaryValue = fieldName => {
        if (!summary.length) return 0
        return getValue(summary[0], fieldName) || 0
    }

    // Date Picker

    const parseDate = value => {
    if (!value) return null

    const [year, month, day] = value.split('-').map(Number)

    if (!year || !month || !day) return null

    const date = new Date(year, month - 1, day)

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null
    }

    return date
    }

    const formatDate = date => {
        if (!date) return ''

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    // =========================================
    // RENDER
    // =========================================

    return (
        <DashboardLayout title="Digital Contract">
            <div className="digital-contract-page">
                <div className="digital-contract-box">
                    <form onSubmit={handleSearch}>
                        <div className="digital-contract-search-grid">
                            <div className="digital-contract-field">
                                <label>
                                    Region
                                    {(isDigitalICRDropdownRole || isRole9) && (
                                        <span className="required">*</span>
                                    )}
                                </label>

                                <select
                                value={regionCode}
                                onChange={handleRegionChange}
                                disabled={loadingRegions || isRole5 || isRole6}
                            >
                                <option value="">Select Region</option>

                                {regions.map((region, index) => {
                                    const value = getRegionCode(region)

                                    return (
                                        <option
                                            key={`${value}-${index}`}
                                            value={value}
                                        >
                                            {getRegionName(region) || value}
                                        </option>
                                    )
                                })}
                            </select>
                            </div>

                            <div className="digital-contract-field">
                                <label>Branch</label>

                                <select
                                    value={branchCode}
                                    onChange={handleBranchChange}
                                    disabled={
                                        !regionCode ||
                                        loadingBranches ||
                                        isRole5 ||
                                        isRole6
                                    }
                                >
                                {isRole1 ? (
                                    <>
                                        {!regionCode && (
                                            <option value="All">All</option>
                                        )}

                                        {branches.map((branch, index) => {
                                            const value = getBranchCode(branch)

                                            return (
                                                <option
                                                    key={`${value}-${index}`}
                                                    value={value}
                                                >
                                                    {getBranchName(branch) || value}
                                                </option>
                                            )
                                        })}
                                    </>
                                ) : (
                                    <>
                                        <option value="All">All</option>

                                        {branches
                                            .filter(item =>
                                                !equalsIgnoreCase(getBranchCode(item), 'All')
                                            )
                                            .map((branch, index) => {
                                                const value = getBranchCode(branch)

                                                return (
                                                    <option
                                                        key={`${value}-${index}`}
                                                        value={value}
                                                    >
                                                        {getBranchName(branch) || value}
                                                    </option>
                                                )
                                            })}
                                    </>
                                )}
                            </select>
                            </div>

                            <div className="digital-contract-field">
                                <label>Franchise</label>

                                <select
                                    value={franchiseCode}
                                    onChange={handleFranchiseChange}
                                    disabled={
                                        !regionCode ||
                                        !branchCode ||
                                        loadingFranchises ||
                                        isRole5
                                    }
                                >
                                    {isRole5 ? (
                                        <>
                                            {franchises.map((franchise, index) => {
                                                const value = getFranchiseCode(franchise)

                                                return (
                                                    <option
                                                        key={`${value}-${index}`}
                                                        value={value}
                                                    >
                                                        {getFranchiseName(franchise)}
                                                    </option>
                                                )
                                            })}

                                            {franchises.length === 0 && (
                                                <option value={loginId}>
                                                    {loginId}
                                                </option>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <option value="All">All</option>

                                            {franchises
                                                .filter(item =>
                                                    !equalsIgnoreCase(
                                                        getFranchiseCode(item),
                                                        'All'
                                                    )
                                                )
                                                .map((franchise, index) => {
                                                    const value = getFranchiseCode(franchise)

                                                    return (
                                                        <option
                                                            key={`${value}-${index}`}
                                                            value={value}
                                                        >
                                                            {getFranchiseName(franchise)}
                                                        </option>
                                                    )
                                                })}
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="digital-contract-field">
                                <label>RefId#</label>
                                <input
                                    type="text"
                                    value={refId}
                                    onChange={event => setRefId(event.target.value)}
                                    maxLength={18}
                                    placeholder="Enter RefId"
                                />
                            </div>

                            <div className="digital-contract-field">
                                <label>ICR Number</label>
                                <input
                                    type="text"
                                    value={icrNo}
                                    onChange={event => setIcrNo(event.target.value)}
                                    placeholder="Enter ICR number"
                                />
                            </div>

                            <div className="digital-contract-field">
                                <label>Status</label>
                                <select
                                    value={status}
                                    onChange={event => setStatus(event.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="S">Success</option>
                                    <option value="E">Error</option>
                                    <option value="P">Re-Processing</option>
                                    <option value="A">Alert</option>
                                </select>
                            </div>

                            <div className="digital-contract-field">
                                <label>ICR Type</label>
                                <select
                                    value={icrType}
                                    onChange={event => setIcrType(event.target.value)}
                                >
                                    <option value="X">Digital ICR</option>
                                    <option value="">Physical ICR</option>
                                </select>
                            </div>

                            <div className="digital-contract-field">
                                <label>
                                    Purchased From Date
                                    <span className="required">*</span>
                                </label>

                                <div className="digital-contract-date-picker-container">
                                    <DatePicker
                                        selected={parseDate(fromDate)}
                                        onChange={date => {
                                            const value = formatDate(date)
                                            setFromDate(value)

                                            if (value && message === 'Please select a From Date.') {
                                                clearMessage()
                                            }
                                        }}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="dd/mm/yyyy"
                                        className="digital-contract-date-control"
                                        calendarClassName="digital-contract-calendar"
                                        showPopperArrow={false}
                                        autoComplete="off"
                                        isClearable={false}
                                        popperPlacement="bottom-start"
                                    />

                                    <button
                                        type="button"
                                        className="digital-contract-calendar-icon"
                                        aria-label="Open Purchased From Date calendar"
                                        onClick={event => {
                                            const input = event.currentTarget
                                                .parentElement
                                                .querySelector('input')

                                            input?.focus()
                                            input?.click()
                                        }}
                                    >
                                        <CalendarDays size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="digital-contract-field">
                                <label>
                                    Purchased To Date
                                    <span className="required">*</span>
                                </label>

                                <div className="digital-contract-date-picker-container">
                                    <DatePicker
                                        selected={parseDate(toDate)}
                                        onChange={date => {
                                            const value = formatDate(date)
                                            setToDate(value)

                                            if (value && message === 'Please select a To Date.') {
                                                clearMessage()
                                            }
                                        }}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="dd/mm/yyyy"
                                        className="digital-contract-date-control"
                                        calendarClassName="digital-contract-calendar"
                                        minDate={parseDate(fromDate)}
                                        showPopperArrow={false}
                                        autoComplete="off"
                                        isClearable={false}
                                        popperPlacement="bottom-end"
                                    />

                                    <button
                                        type="button"
                                        className="digital-contract-calendar-icon"
                                        aria-label="Open Purchased To Date calendar"
                                        onClick={event => {
                                            const input = event.currentTarget
                                                .parentElement
                                                .querySelector('input')

                                            input?.focus()
                                            input?.click()
                                        }}
                                    >
                                        <CalendarDays size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="digital-contract-search-actions">
                                <button
                                    type="submit"
                                    className="digital-contract-search-button"
                                    disabled={loading || dropdownLoading}
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </button>

                                <button
                                    type="button"
                                    className="digital-contract-download-button"
                                    disabled={!details.length || downloading}
                                    onClick={handleDownload}
                                >
                                    {downloading ? 'Downloading...' : 'Download'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

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

                <div className="digital-contract-summary-box">
                    <div className="digital-contract-summary-item success">
                        <span>Success</span>
                        <strong>{getSummaryValue('Success')}</strong>
                    </div>

                    <div className="digital-contract-summary-item processing">
                        <span>Re-Send</span>
                        <strong>{getSummaryValue('Re-Processing')}</strong>
                    </div>

                    <div className="digital-contract-summary-item alert">
                        <span>Alert</span>
                        <strong>{getSummaryValue('Alert')}</strong>
                    </div>

                    <div className="digital-contract-summary-item error">
                        <span>Error</span>
                        <strong>{getSummaryValue('Error')}</strong>
                    </div>

                    <div className="digital-contract-summary-item total">
                        <span>Total</span>
                        <strong>{getSummaryValue('Total')}</strong>
                    </div>
                </div>

                <div className="digital-contract-box">
                    <div className="digital-contract-section-title">
                        Digital Contract Details
                    </div>

                    <div className="digital-contract-table-wrapper">
                        <table className="digital-contract-table">
                            <thead>
                                <tr>
                                    <th>#RefId</th>
                                    <th>Franchise</th>
                                    <th>Customer Name</th>
                                    <th>ICRNO</th>
                                    <th>SerialNo.</th>
                                    <th>AMC Type</th>
                                    <th>Price</th>
                                    <th>Remarks</th>
                                    <th>Purchased Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan="10" className="digital-contract-loading">
                                            Loading...
                                        </td>
                                    </tr>
                                )}

                                {!loading && details.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className="no-record-found ">
                                            No record found!
                                        </td>
                                    </tr>
                                )}

                                {!loading && details.map((row, index) => {
                                    const currentRefId = getValue(row, 'RefId')
                                    const flag = getValue(row, 'flag')
                                    const flagValue = String(flag || '').toUpperCase()

                                    return (
                                        <tr key={`${currentRefId}-${index}`}>
                                            <td>{currentRefId}</td>
                                            <td>{getValue(row, 'FranchiseName')}</td>
                                            <td>{getValue(row, 'customer_name')}</td>
                                            <td>{getValue(row, 'DigitalICR')}</td>
                                            <td>{getValue(row, 'serial_no')}</td>
                                            <td>{getValue(row, 'description')}</td>
                                            <td>{getValue(row, 'gross_value')}</td>
                                            <td
                                                title={getValue(row, 'remarks')}
                                                className="digital-contract-remarks"
                                            >
                                                {getValue(row, 'remarks')}
                                            </td>
                                            <td>{getValue(row, 'amc_purchased_date')}</td>
                                            <td>
                                                <div className="digital-contract-status-wrapper">
                                                    <span className={getStatusClass(flag)}>
                                                        {flag}
                                                    </span>

                                                    {flagValue === 'S' && (
                                                        <button
                                                            type="button"
                                                            className="digital-contract-action-button receipt"
                                                            title="Resend Receipt"
                                                            disabled={actionLoading === `receipt-${currentRefId}`}
                                                            onClick={() => handleResendReceipt(row)}
                                                        >
                                                            {actionLoading === `receipt-${currentRefId}` ? '...' : '✉'}
                                                        </button>
                                                    )}

                                                    {flagValue !== 'S' && flagValue !== 'A' && (
                                                        <button
                                                            type="button"
                                                            className="digital-contract-action-button resend"
                                                            title="Resend Request In CRM"
                                                            disabled={actionLoading === `request-${currentRefId}`}
                                                            onClick={() => handleResendRequest(row)}
                                                        >
                                                            {actionLoading === `request-${currentRefId}` ? '...' : '➤'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default DigitalContract
