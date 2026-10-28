
import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getRegions,
    getBranches,
    getFranchises
} from '../../api/reportsApi'

import {
    searchPCRComponents,
    getPCRPlants,
    getPCRVendors,
    getPCRCount,
    getPCRVendorCount,
    savePCRDraft,
    savePCRSubmit,
    dispatchPCR,
    exportPCRNew,
    exportPCROld,
    printPCR,
    getPCRSegregationStatuses
} from '../../api/pcrApi'

import './PCRVendorDetails.css'

const today = new Date()

const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
].join('-')

const sixMonthsAgo = new Date()
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

const sixMonthsAgoString = [
    sixMonthsAgo.getFullYear(),
    String(sixMonthsAgo.getMonth() + 1).padStart(2, '0'),
    String(sixMonthsAgo.getDate()).padStart(2, '0')
].join('-')

const emptyFilters = {
    BranchCode: '',
    PlantCode: 'All',
    FranchiseCode: '',
    TicketNo: '',
    Status: 'All',
    VendorCode: '0',
    FromDate: sixMonthsAgoString,
    ToDate: todayString,
    ItemNo: '',
    SPUNo: '',
    Product: 'All',
    Region: '',
    SpareType: '',
    SubmittedBy: ''
}

const emptyDispatch = {
    PcrMonth: '',
    Plant: '',
    InvoiceDate: todayString,
    InvoiceNo: '',
    NoOfBox: '',
    DocketNo: '',
    DocketDate: todayString,
    Transport: '0'
}

// =========================================
// GENERAL HELPERS
// =========================================

function getArray(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.$values)) return data.$values
    if (Array.isArray(data?.data?.$values)) return data.data.$values

    return []
}

function getOptionValue(item) {
    return String(
        item?.value ??
        item?.Value ??
        item?.id ??
        item?.Id ??
        item?.code ??
        item?.Code ??
        ''
    )
}

function getOptionText(item) {
    return String(
        item?.text ??
        item?.Text ??
        item?.name ??
        item?.Name ??
        item?.plantname ??
        item?.plantName ??
        item?.franchiseName ??
        item?.FranchiseName ??
        item?.vendorName ??
        item?.VendorName ??
        getOptionValue(item)
    )
}

function getRegionCode(item) {
    return String(
        item?.regionCode ??
        item?.RegionCode ??
        item?.code ??
        item?.Code ??
        item?.value ??
        item?.Value ??
        ''
    )
}

function getRegionName(item) {
    return String(
        item?.regionName ??
        item?.RegionName ??
        item?.name ??
        item?.Name ??
        item?.text ??
        item?.Text ??
        getRegionCode(item)
    )
}

function getBranchCode(item) {
    return String(
        item?.bpCode ??
        item?.BPCode ??
        item?.branchCode ??
        item?.BranchCode ??
        item?.value ??
        item?.Value ??
        item?.code ??
        item?.Code ??
        ''
    )
}

function getBranchName(item) {
    return String(
        item?.branchName ??
        item?.BranchName ??
        item?.name ??
        item?.Name ??
        item?.text ??
        item?.Text ??
        getBranchCode(item)
    )
}

function getFranchiseCode(item) {
    return String(
        item?.frCode ??
        item?.FrCode ??
        item?.Frcode ??
        item?.FRCode ??
        item?.frcode ??
        item?.loginId ??
        item?.LoginID ??
        item?.LoginId ??
        item?.value ??
        item?.Value ??
        item?.code ??
        item?.Code ??
        ''
    )
}

function getFranchiseName(item) {
    return String(
        item?.franchiseName ??
        item?.FranchiseName ??
        item?.userName ??
        item?.UserName ??
        item?.name ??
        item?.Name ??
        item?.text ??
        item?.Text ??
        getFranchiseCode(item)
    )
}

function sameCode(first, second) {
    return String(first ?? '').trim().toLowerCase() ===
        String(second ?? '').trim().toLowerCase()
}

function getRowId(row) {
    return String(row?.refId ?? row?.RefId ?? row?.refID ?? '')
}

function getRowStatus(row) {
    return String(row?.status ?? row?.Status ?? '')
}

function getRowMarking(row) {
    return String(row?.marking ?? row?.Marking ?? '')
}

function getRowMarkingName(row) {
    return String(
        row?.marking_name ??
        row?.markingName ??
        row?.MarkingName ??
        ''
    )
}

function getRowRemark(row) {
    return String(row?.remark ?? row?.Remark ?? '')
}

function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename

    document.body.appendChild(link)
    link.click()
    link.remove()

    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function getSessionValue(...keys) {
    for (const key of keys) {
        const value = sessionStorage.getItem(key)

        if (value !== null && value !== '') {
            return value
        }
    }

    return ''
}

function getStoredRoles() {
    try {
        const roles = JSON.parse(
            sessionStorage.getItem('roles') || '[]'
        )

        return Array.isArray(roles) ? roles : []
    } catch {
        return []
    }
}

function getSessionRoles() {
    try {
        const parsedRoles = JSON.parse(
            sessionStorage.getItem('roles') || '[]'
        )

        if (!Array.isArray(parsedRoles)) return []

        return parsedRoles
            .map(role => {
                if (typeof role === 'object' && role !== null) {
                    return Number(
                        role.roleID ??
                        role.RoleID ??
                        role.roleId ??
                        role.RoleId ??
                        role.id ??
                        role.Id
                    )
                }

                return Number(role)
            })
            .filter(id => Number.isInteger(id) && id > 0)
    } catch (error) {
        console.error('Unable to read session roles:', error)
        return []
    }
}

function roleExists(roles, roleId) {
    return roles.some(role => {
        const value = typeof role === 'object'
            ? role?.roleId ??
              role?.RoleID ??
              role?.roleID ??
              role?.id ??
              role?.Id
            : role

        return String(value ?? '') === String(roleId)
    })
}

// =========================================
// PCR VENDOR DETAILS
// =========================================

function PCRVendorDetails() {
    const userId = getSessionValue('userId', 'UserID')
    const bpCode = getSessionValue('bpCode', 'BPCode')
    const regionCode = getSessionValue('regionCode', 'RegionCode')
    const loginId = getSessionValue('loginId', 'LoginID')

    // Use the same role resolution logic as Technician.jsx
    const sessionRoles = getSessionRoles()
    const storedRoleId = Number(getSessionValue('roleId', 'RoleID'))

    const roleId = sessionRoles.includes(storedRoleId)
        ? storedRoleId
        : sessionRoles.length === 1
            ? sessionRoles[0]
            : 0

    console.log('PCR resolved roleId:', roleId)
    console.log('Session roleId:', sessionStorage.getItem('roleId'))
    console.log('Session RoleID:', sessionStorage.getItem('RoleID'))
    console.log('Session roles:', sessionStorage.getItem('roles'))

    const storedRoles = getStoredRoles()

    const isBranchRole =
        roleId === '6' || roleExists(storedRoles, '6')

    const isFranchiseRole =
        roleId === '5' || roleExists(storedRoles, '5')

    const isBranchOrFranchiseRole =
        isBranchRole || isFranchiseRole

    // =========================================
    // STATE
    // =========================================

    const [regions, setRegions] = useState([])
    const [selectedRegionCode, setSelectedRegionCode] =
        useState(regionCode)

    const [filters, setFilters] = useState({
        ...emptyFilters,
        BranchCode: bpCode,
        Region: regionCode,
        FranchiseCode: isBranchRole ? 'All' : ''
    })

    const [dispatchForm, setDispatchForm] =
        useState(emptyDispatch)

    const [branches, setBranches] = useState([])
    const [plants, setPlants] = useState([])
    const [vendors, setVendors] = useState([])
    const [franchises, setFranchises] = useState([])

    const [segregationStatuses, setSegregationStatuses] = useState([])
    const [statusLoading, setStatusLoading] = useState(false)

    const [rows, setRows] = useState([])
    const [selectedIds, setSelectedIds] = useState([])

    const [monthlyCount, setMonthlyCount] = useState({
        Consumed: 0,
        Submitted: 0
    })

    const [vendorCount, setVendorCount] = useState({
        Consumed: 0,
        Submitted: 0
    })

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [formatType, setFormatType] = useState('')

    const selectedRows = useMemo(
        () => rows.filter(row =>
            selectedIds.includes(getRowId(row))
        ),
        [rows, selectedIds]
    )

    // =========================================
    // FIELD UPDATE HELPERS
    // =========================================

    const updateFilter = (name, value) => {
        setFilters(previous => ({
            ...previous,
            [name]: value
        }))
    }

    const updateDispatch = (name, value) => {
        setDispatchForm(previous => ({
            ...previous,
            [name]: value
        }))
    }

    // =========================================
    // LOAD REGIONS, PLANTS AND VENDORS
    // =========================================

    useEffect(() => {
        let cancelled = false

        async function loadInitialLookups() {
            const results = await Promise.allSettled([
                getRegions('', Number(userId) || 0),
                getPCRPlants(bpCode),
                getPCRVendors()
            ])

            if (cancelled) return

            if (results[0].status === 'fulfilled') {
                const regionList = getArray(results[0].value)

                setRegions(regionList)

                const matchedRegion = regionList.find(item =>
                    sameCode(getRegionCode(item), regionCode)
                )

                const resolvedRegion = matchedRegion
                    ? getRegionCode(matchedRegion)
                    : regionCode

                setSelectedRegionCode(resolvedRegion)

                setFilters(previous => ({
                    ...previous,
                    Region: resolvedRegion
                }))
            } else {
                setError(
                    results[0].reason?.message ||
                    'Unable to load regions.'
                )
            }

            if (results[1].status === 'fulfilled') {
                setPlants(getArray(results[1].value))
            } else {
                setError(
                    results[1].reason?.message ||
                    'Unable to load PCR plants.'
                )
            }

            if (results[2].status === 'fulfilled') {
                setVendors(getArray(results[2].value))
            } else {
                setError(
                    results[2].reason?.message ||
                    'Unable to load PCR vendors.'
                )
            }
        }

        loadInitialLookups().catch(err => {
            if (!cancelled) {
                setError(
                    err?.message ||
                    'Unable to load PCR filter options.'
                )
            }
        })

        return () => {
            cancelled = true
        }
    }, [userId, bpCode, regionCode])

    // =========================================
    // LOAD BRANCHES
    // =========================================

    useEffect(() => {
        let cancelled = false

        async function loadBranches() {
            try {
                const response = await getBranches(
                    Number(userId) || 0,
                    selectedRegionCode
                )

                if (cancelled) return

                const branchList = getArray(response)

                setBranches(branchList)

                if (isBranchOrFranchiseRole) {
                    const matchingBranch = branchList.find(item =>
                        sameCode(getBranchCode(item), bpCode)
                    )

                    const resolvedBranch = matchingBranch
                        ? getBranchCode(matchingBranch)
                        : bpCode

                    setFilters(previous => ({
                        ...previous,
                        BranchCode: resolvedBranch
                    }))
                }
            } catch (err) {
                if (!cancelled) {
                    setBranches([])

                    setError(
                        err?.message ||
                        'Unable to load branches.'
                    )
                }
            }
        }

        if (selectedRegionCode) {
            loadBranches()
        } else {
            setBranches([])
        }

        return () => {
            cancelled = true
        }
    }, [
        userId,
        selectedRegionCode,
        bpCode,
        isBranchOrFranchiseRole
    ])

    // =========================================
    // LOAD FRANCHISES FOR LOGGED-IN BRANCH
    // =========================================

    useEffect(() => {
        let cancelled = false

        async function loadFranchises() {
            try {
                const response = await getFranchises(
                    bpCode,
                    loginId
                )

                if (cancelled) return

                setFranchises(getArray(response))

                if (isBranchRole) {
                    setFilters(previous => ({
                        ...previous,
                        FranchiseCode: 'All'
                    }))
                } else if (isFranchiseRole) {
                    setFilters(previous => ({
                        ...previous,
                        FranchiseCode: loginId
                    }))
                }
            } catch (err) {
                if (!cancelled) {
                    setFranchises([])

                    setError(
                        err?.message ||
                        'Unable to load franchises.'
                    )
                }
            }
        }

        if (bpCode && loginId) {
            loadFranchises()
        } else {
            setFranchises([])

            setFilters(previous => ({
                ...previous,
                FranchiseCode: isBranchRole ? 'All' : ''
            }))
        }

        return () => {
            cancelled = true
        }
    }, [bpCode, loginId, isBranchRole, isFranchiseRole])


    // =========================================
    // LOAD PCR SEGREGATION STATUSES
    // =========================================

        useEffect(() => {
            let cancelled = false

            async function loadStatuses() {
                // Do not call the API with roleId = 0
                if (roleId <= 0) {
                    setSegregationStatuses([])
                    setStatusLoading(false)
                    console.warn(
                        'PCR statuses not loaded: valid roleId was not found.'
                    )
                    return
                }

                setStatusLoading(true)

                try {
                    const response = await getPCRSegregationStatuses(roleId)

                    if (cancelled) return

                    const statusList = getArray(response)

                    console.log('PCR segregation statuses response:', response)
                    console.log('PCR segregation status list:', statusList)

                    setSegregationStatuses(statusList)
                } catch (err) {
                    if (!cancelled) {
                        setSegregationStatuses([])
                        setError(
                            err?.message ||
                            'Unable to load PCR segregation statuses.'
                        )
                    }
                } finally {
                    if (!cancelled) {
                        setStatusLoading(false)
                    }
                }
            }

            loadStatuses()

            return () => {
                cancelled = true
            }
        }, [roleId])

    // =========================================
    // BUILD SEARCH REQUEST
    // =========================================

    const buildSearchRequest = () => ({
        RefId: 0,
        TicketNo: filters.TicketNo.trim(),
        SPUNo: filters.SPUNo.trim(),
        FromDate: filters.FromDate,
        ToDate: filters.ToDate,
        BranchCode: filters.BranchCode || bpCode,
        Product: filters.Product || 'All',
        Region: filters.Region || regionCode,
        FranchiseCode: filters.FranchiseCode,
        SpareType: filters.SpareType,
        Status: filters.Status || 'All',
        VendorCode: Number(filters.VendorCode) || 0,
        SubmittedBy: filters.SubmittedBy,
        ItemNo: filters.ItemNo.trim(),
        PlantCode: filters.PlantCode || 'All'
    })

    // =========================================
    // LOAD COUNTS
    // =========================================

    const loadCounts = async request => {
        const dateCountRequest = {
            FromDate: request.FromDate,
            ToDate: request.ToDate,
            BranchCode: request.BranchCode,
            PlantCode: request.PlantCode
        }

        const vendorCountRequest = {
            ...dateCountRequest,
            VendorCode: String(request.VendorCode || '')
        }

        const [monthResult, vendorResult] =
            await Promise.allSettled([
                getPCRCount(dateCountRequest),
                getPCRVendorCount(vendorCountRequest)
            ])

        if (monthResult.status === 'fulfilled') {
            const data =
                monthResult.value?.data ?? monthResult.value

            setMonthlyCount({
                Consumed: Number(
                    data?.consumed ?? data?.Consumed ?? 0
                ),
                Submitted: Number(
                    data?.submitted ?? data?.Submitted ?? 0
                )
            })
        }

        if (vendorResult.status === 'fulfilled') {
            const data =
                vendorResult.value?.data ?? vendorResult.value

            setVendorCount({
                Consumed: Number(
                    data?.consumed ?? data?.Consumed ?? 0
                ),
                Submitted: Number(
                    data?.submitted ?? data?.Submitted ?? 0
                )
            })
        }
    }

    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async event => {
        event?.preventDefault()

        setError('')
        setMessage('')

        if (!filters.FromDate || !filters.ToDate) {
            setError(
                'Please select both From Date and To Date.'
            )
            return
        }

        if (filters.FromDate > filters.ToDate) {
            setError(
                'From Date cannot be later than To Date.'
            )
            return
        }

        setLoading(true)

        try {
            const request = buildSearchRequest()
            const data = await searchPCRComponents(request)

            setRows(getArray(data))
            setSelectedIds([])

            await loadCounts(request)
        } catch (err) {
            setRows([])
            setSelectedIds([])

            setError(
                err?.message ||
                'Unable to search PCR data.'
            )
        } finally {
            setLoading(false)
        }
    }

    // =========================================
    // RESET
    // =========================================

    const handleReset = () => {
        setFilters({
            ...emptyFilters,
            BranchCode: bpCode,
            Region: regionCode,
            FranchiseCode: isBranchRole ? 'All' : ''
        })

        setSelectedRegionCode(regionCode)
        setDispatchForm(emptyDispatch)

        setRows([])
        setSelectedIds([])

        setMonthlyCount({
            Consumed: 0,
            Submitted: 0
        })

        setVendorCount({
            Consumed: 0,
            Submitted: 0
        })

        setError('')
        setMessage('')
    }

    // =========================================
    // ROW SELECTION
    // =========================================

    const toggleRow = id => {
        setSelectedIds(previous =>
            previous.includes(id)
                ? previous.filter(item => item !== id)
                : [...previous, id]
        )
    }

    const toggleAll = checked => {
        setSelectedIds(
            checked
                ? rows.map(getRowId).filter(Boolean)
                : []
        )
    }

    // =========================================
    // SAVE AS DRAFT
    // =========================================

    const handleSaveDraft = async () => {
        setError('')
        setMessage('')

        if (selectedRows.length === 0) {
            setError('Please select at least one record.')
            return
        }

        const invalidRow = selectedRows.find(
            row => !getRowMarkingName(row).trim()
        )

        if (invalidRow) {
            setError(
                'Please ensure that every selected record has a marking.'
            )
            return
        }

        setSaving(true)

        try {
            const result = await savePCRDraft({
                BranchCode: filters.BranchCode || bpCode,
                PlantCode: filters.PlantCode || 'All',
                ToDate: filters.ToDate,
                UpdatedBy: Number(userId) || 0,
                Rows: selectedRows.map(row => ({
                    RefId: Number(getRowId(row)),
                    MarkingName: getRowMarkingName(row),
                    Remark: getRowRemark(row)
                }))
            })

            if (
                result?.success === false ||
                result?.Success === false
            ) {
                throw new Error(
                    result.message ||
                    result.Message ||
                    'Unable to save draft.'
                )
            }

            setMessage(
                result?.message ||
                result?.Message ||
                'Data saved as draft successfully.'
            )

            await handleSearch()
        } catch (err) {
            setError(
                err?.message ||
                'Unable to save draft.'
            )
        } finally {
            setSaving(false)
        }
    }

    // =========================================
    // SAVE AND SUBMIT
    // =========================================

    const handleSaveSubmit = async () => {
        setError('')
        setMessage('')

        if (!bpCode) {
            setError(
                'Branch information is missing from the session.'
            )
            return
        }

        if (selectedRows.length === 0) {
            setError('Please select at least one record.')
            return
        }

        if (
            selectedRows.some(
                row => getRowStatus(row).toLowerCase() === 'open'
            )
        ) {
            setError(
                'Please ensure that all the checked records are in Draft status.'
            )
            return
        }

        const invalidRow = selectedRows.find(
            row => !getRowMarking(row).trim()
        )

        if (invalidRow) {
            setError(
                'Please ensure that every selected record has a marking.'
            )
            return
        }

        setSaving(true)

        try {
            const result = await savePCRSubmit({
                UpdatedBy: Number(userId) || 0,
                Rows: selectedRows.map(row => ({
                    RefId: Number(getRowId(row)),
                    Marking: getRowMarking(row),
                    Remark: getRowRemark(row),
                    CurrentStatus: getRowStatus(row)
                }))
            })

            if (
                result?.success === false ||
                result?.Success === false
            ) {
                throw new Error(
                    result.message ||
                    result.Message ||
                    'Unable to submit PCR records.'
                )
            }

            setMessage(
                result?.message ||
                result?.Message ||
                'Data saved and submitted successfully.'
            )

            await handleSearch()
        } catch (err) {
            setError(
                err?.message ||
                'Unable to submit PCR records.'
            )
        } finally {
            setSaving(false)
        }
    }

    // =========================================
    // PCR DISPATCH
    // =========================================

    const handleDispatch = async () => {
        setError('')
        setMessage('')

        if (!bpCode) {
            setError(
                'Branch information is missing from the session.'
            )
            return
        }

        if (selectedRows.length === 0) {
            setError(
                'Please select at least one record for dispatch.'
            )
            return
        }

        const requiredFields = [
            ['PcrMonth', 'Please select the PCR month.'],
            ['Plant', 'Please select the plant.'],
            ['InvoiceDate', 'Please select the invoice date.'],
            ['DocketDate', 'Please select the document date.'],
            ['Transport', 'Please select the transport.']
        ]

        for (const [field, text] of requiredFields) {
            if (!dispatchForm[field]) {
                setError(text)
                return
            }
        }

        if (
            selectedRows.some(
                row => !getRowMarking(row).trim()
            )
        ) {
            setError(
                'Please ensure that every selected record has a marking.'
            )
            return
        }

        setSaving(true)

        try {
            const result = await dispatchPCR({
                PcrMonth: dispatchForm.PcrMonth,
                Plant: dispatchForm.Plant,
                InvoiceDate: dispatchForm.InvoiceDate,
                InvoiceNo: Number(dispatchForm.InvoiceNo) || 0,
                BrCode: bpCode,
                NoOfBox: Number(dispatchForm.NoOfBox) || 0,
                DocketNo: Number(dispatchForm.DocketNo) || 0,
                DocketDate: dispatchForm.DocketDate,
                Transport: Number(dispatchForm.Transport) || 0,
                CreatedBy: Number(userId) || 0,
                UpdatedBy: Number(userId) || 0,
                Rows: selectedRows.map(row => ({
                    RefId: Number(getRowId(row)),
                    Marking: getRowMarking(row),
                    Remark: getRowRemark(row)
                }))
            })

            if (
                result?.success === false ||
                result?.Success === false
            ) {
                throw new Error(
                    result.message ||
                    result.Message ||
                    'Unable to save dispatch.'
                )
            }

            setMessage(
                result?.message ||
                result?.Message ||
                'Dispatch data saved successfully.'
            )

            await handleSearch()
        } catch (err) {
            setError(
                err?.message ||
                'Unable to save dispatch.'
            )
        } finally {
            setSaving(false)
        }
    }

    // =========================================
    // EXPORT
    // =========================================

    const handleExport = async type => {
        setError('')
        setMessage('')

        try {
            const selectedPlant = plants.find(
                item => getOptionValue(item) === filters.PlantCode
            )

            const request = {
                ...buildSearchRequest(),
                FormatType: formatType,
                PlantName: selectedPlant
                    ? getOptionText(selectedPlant)
                    : ''
            }

            const blob = type === 'old'
                ? await exportPCROld(
                    request,
                    filters.BranchCode || bpCode
                )
                : await exportPCRNew(request)

            saveBlob(
                blob,
                type === 'old'
                    ? 'PCR_Old.xlsx'
                    : 'PCR_New.xlsx'
            )
        } catch (err) {
            setError(
                err?.message ||
                'Unable to export PCR data.'
            )
        }
    }

    // =========================================
    // PRINT
    // =========================================

    const handlePrint = async () => {
        setError('')

        try {
            const blob = await printPCR(buildSearchRequest())
            const url = URL.createObjectURL(blob)

            window.open(url, '_blank', 'noopener,noreferrer')

            window.setTimeout(
                () => URL.revokeObjectURL(url),
                60000
            )
        } catch (err) {
            setError(
                err?.message ||
                'Unable to print PCR data.'
            )
        }
    }

    // =========================================
    // VIEW RECORD
    // =========================================

    const handleView = row => {
        const detail = {
            RefId: getRowId(row),
            TicketNo: row?.TikectNo ?? row?.TicketNo ?? '',
            ProductName: row?.ProductName ?? '',
            Serial: row?.Serial ?? '',
            ItemNo: row?.item_no ?? '',
            ItemDescription: row?.item_desc ?? '',
            Franchise: row?.Franchise ?? '',
            Vendor: row?.vendor ?? '',
            Quantity: row?.Quantity ?? '',
            Status: row?.Status ?? '',
            Marking: row?.marking ?? '',
            Remark: row?.remark ?? ''
        }

        window.alert(
            Object.entries(detail)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')
        )
    }

    // =========================================
    // UI
    // =========================================

    return (
        <DashboardLayout>
            <main className="pcr-vendor-page">

                {/* TOP ACTION BAR */}
                <div className="pcr-page-heading">
                    <div className="pcr-top-actions">
                        <select
                            className="pcr-format-select"
                            value={formatType}
                            onChange={event => setFormatType(event.target.value)}
                            aria-label="Select Format"
                        >
                            <option value="">Select Format</option>
                            <option value="AC">AC</option>
                            <option value="REF">REF</option>
                            <option value="Bommasandra">Bommasandra</option>
                            <option value="Kitchen Appliances">Kitchen Appliances</option>
                            <option value="Washer Plant">Washer Plant</option>
                            <option value="Motor Division">Motor Division</option>
                        </select>

                        <button
                            type="button"
                            onClick={() => handleExport('old')}
                        >
                            Export (Old)
                        </button>

                        <button
                            type="button"
                            onClick={() => handleExport('new')}
                        >
                            Export (New)
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                        >
                            Print
                        </button>

                        <button
                            type="button"
                            onClick={() => window.alert(
                                'Part Category page is not connected yet.'
                            )}
                        >
                            Part Category
                        </button>

                        <button
                            type="button"
                            onClick={() => window.alert(
                                'Part Vendor page is not connected yet.'
                            )}
                        >
                            Part Vendor
                        </button>
                    </div>
                </div>

                {error && (
                    <div
                        className="pcr-alert pcr-alert-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {message && (
                    <div
                        className="pcr-alert pcr-alert-success"
                        role="status"
                    >
                        {message}
                    </div>
                )}

                {/* 1. SEARCH FILTERS */}
                <form
                    className="pcr-panel"
                    onSubmit={handleSearch}
                >
                    <div className="pcr-panel-heading">
                        <h2>Search Filters</h2>

                        <div className="pcr-heading-actions">
                            <button
                                className="pcr-btn pcr-btn-primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>

                            <button
                                className="pcr-btn pcr-btn-secondary"
                                type="button"
                                onClick={handleReset}
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="pcr-filter-grid">

                        {/* FIRST ROW: 7 FIELDS */}

                        <label>
                            Region
                            <select
                                value={selectedRegionCode}
                                disabled={isBranchOrFranchiseRole}
                                onChange={event => {
                                    const value = event.target.value

                                    setSelectedRegionCode(value)

                                    setFilters(previous => ({
                                        ...previous,
                                        Region: value,
                                        BranchCode: '',
                                        FranchiseCode: isBranchRole ? 'All' : ''
                                    }))
                                }}
                            >
                                <option value="">Select Region</option>

                                {regions.map((item, index) => (
                                    <option
                                        key={`${getRegionCode(item)}-${index}`}
                                        value={getRegionCode(item)}
                                    >
                                        {getRegionName(item)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Branch
                            <select
                                value={filters.BranchCode}
                                disabled={isBranchOrFranchiseRole}
                                onChange={event =>
                                    updateFilter('BranchCode', event.target.value)
                                }
                            >
                                <option value="">Select Branch</option>

                                {branches.map((item, index) => (
                                    <option
                                        key={`${getBranchCode(item)}-${index}`}
                                        value={getBranchCode(item)}
                                    >
                                        {getBranchName(item)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Plant
                            <select
                                value={filters.PlantCode}
                                onChange={event =>
                                    updateFilter('PlantCode', event.target.value)
                                }
                            >
                                <option value="All">All Plants</option>

                                {plants.map((item, index) => (
                                    <option
                                        key={`${getOptionValue(item)}-${index}`}
                                        value={getOptionValue(item)}
                                    >
                                        {getOptionText(item)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Franchise
                            <select
                                value={filters.FranchiseCode}
                                onChange={event =>
                                    updateFilter('FranchiseCode', event.target.value)
                                }
                            >
                                <option value="All">All Franchises</option>

                                {franchises.map((item, index) => (
                                    <option
                                        key={`${getFranchiseCode(item)}-${index}`}
                                        value={getFranchiseCode(item)}
                                    >
                                        {getFranchiseName(item)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Ticket No.
                            <input
                                value={filters.TicketNo}
                                onChange={event =>
                                    updateFilter('TicketNo', event.target.value)
                                }
                                maxLength={50}
                            />
                        </label>

                        <label>
                            Status
                            <select
                                value={filters.Status}
                                onChange={event =>
                                    updateFilter('Status', event.target.value)
                                }
                                disabled={statusLoading}
                            >
                                <option value="All">All</option>

                                {statusLoading && (
                                    <option value="" disabled>
                                        Loading statuses...
                                    </option>
                                )}

                                {segregationStatuses.map((item, index) => {
                                    const statusId = String(
                                        item?.id ?? item?.Id ?? ''
                                    )

                                    const statusName = String(
                                        item?.name ?? item?.Name ?? statusId
                                    )

                                    return (
                                        <option
                                            key={statusId || index}
                                            value={statusId}
                                        >
                                            {statusName}
                                        </option>
                                    )
                                })}
                            </select>
                        </label>

                        <label>
                            Vendor
                            <select
                                value={filters.VendorCode}
                                onChange={event =>
                                    updateFilter('VendorCode', event.target.value)
                                }
                            >
                                <option value="0">All Vendors</option>

                                {vendors.map((item, index) => (
                                    <option
                                        key={`${getOptionValue(item)}-${index}`}
                                        value={getOptionValue(item)}
                                    >
                                        {getOptionText(item)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* SECOND ROW: 3 FIELDS */}

                        <label>
                            From Date
                            <input
                                type="date"
                                value={filters.FromDate}
                                max={filters.ToDate || todayString}
                                onChange={event =>
                                    updateFilter('FromDate', event.target.value)
                                }
                                required
                            />
                        </label>

                        <label>
                            To Date
                            <input
                                type="date"
                                value={filters.ToDate}
                                min={filters.FromDate}
                                max={todayString}
                                onChange={event =>
                                    updateFilter('ToDate', event.target.value)
                                }
                                required
                            />
                        </label>

                        <label>
                            Item No.
                            <input
                                value={filters.ItemNo}
                                onChange={event =>
                                    updateFilter('ItemNo', event.target.value)
                                }
                                maxLength={50}
                            />
                        </label>

                        {/* COUNTS BESIDE SECOND-ROW FIELDS */}

                        {/* COUNTS BESIDE ITEM NO. */}

                        <div className="pcr-count-summary">
                            <div className="pcr-count-field">
                                <label>Month-wise</label>
                                <div className="pcr-count-values">
                                    <span>Consumed: {monthlyCount.Consumed}</span>
                                    <span>Submitted: {monthlyCount.Submitted}</span>
                                </div>
                            </div>

                            <div className="pcr-count-field">
                                <label>Vendor-wise</label>
                                <div className="pcr-count-values">
                                    <span>Consumed: {vendorCount.Consumed}</span>
                                    <span>Submitted: {vendorCount.Submitted}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className="pcr-form-actions pcr-form-actions-right">
                        <button
                            className="pcr-btn pcr-btn-primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>

                        <button
                            className="pcr-btn pcr-btn-secondary"
                            type="button"
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                    </div> */}
                </form>

                {/* 2. DISPATCH DETAILS */}
                <section className="pcr-panel pcr-dispatch-panel">
                    <div className="pcr-panel-heading">
                        <h2>Dispatch Details</h2>

                        <button
                            type="button"
                            className="pcr-btn pcr-btn-primary"
                            onClick={handleDispatch}
                            disabled={saving || loading}
                        >
                            {saving ? 'Processing...' : 'PCR Dispatch'}
                        </button>
                    </div>

                    <div className="pcr-dispatch-grid">
                        <label>
                            Month
                            <input
                                type="month"
                                value={dispatchForm.PcrMonth}
                                onChange={event =>
                                    updateDispatch('PcrMonth', event.target.value)
                                }
                            />
                        </label>

                        <label>
                            Plant
                            <select
                                value={dispatchForm.Plant}
                                onChange={event =>
                                    updateDispatch('Plant', event.target.value)
                                }
                            >
                                <option value="">Select Plant</option>

                                {plants.map((item, index) => (
                                    <option
                                        key={`${getOptionValue(item)}-${index}`}
                                        value={getOptionValue(item)}
                                    >
                                        {getOptionText(item)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Invoice Date
                            <input
                                type="date"
                                value={dispatchForm.InvoiceDate}
                                onChange={event =>
                                    updateDispatch('InvoiceDate', event.target.value)
                                }
                            />
                        </label>

                        <label>
                            Invoice No.
                            <input
                                type="number"
                                min="0"
                                value={dispatchForm.InvoiceNo}
                                onChange={event =>
                                    updateDispatch('InvoiceNo', event.target.value)
                                }
                            />
                        </label>

                        <label>
                            Boxes
                            <input
                                type="number"
                                min="0"
                                value={dispatchForm.NoOfBox}
                                onChange={event =>
                                    updateDispatch('NoOfBox', event.target.value)
                                }
                            />
                        </label>

                        <label>
                            Docket No.
                            <input
                                type="number"
                                min="0"
                                value={dispatchForm.DocketNo}
                                onChange={event =>
                                    updateDispatch('DocketNo', event.target.value)
                                }
                            />
                        </label>

                        <label>
                            Document Date
                            <input
                                type="date"
                                value={dispatchForm.DocketDate}
                                onChange={event =>
                                    updateDispatch('DocketDate', event.target.value)
                                }
                            />
                        </label>

                        <label>
                            Transport
                            <select
                                value={dispatchForm.Transport}
                                onChange={event =>
                                    updateDispatch('Transport', event.target.value)
                                }
                            >
                                <option value="0">Select Transport</option>
                                <option value="1">Courier</option>
                                <option value="2">Transport</option>
                                <option value="3">By Road</option>
                            </select>
                        </label>
                    </div>

                    {/* <div className="pcr-form-actions pcr-form-actions-right">
                        <button
                            type="button"
                            className="pcr-btn pcr-btn-primary"
                            onClick={handleDispatch}
                            disabled={saving || loading}
                        >
                            {saving ? 'Processing...' : 'PCR Dispatch'}
                        </button>
                    </div> */}
                </section>

                {/* 3. PCR COMPONENTS */}
                <section className="pcr-panel">
                    <div className="pcr-grid-heading">
                        <div className="pcr-grid-title">
                            <h2>PCR Components</h2>
                            <span>{rows.length} record(s)</span>
                            <span className="pcr-selection-note">
                                Selected: {selectedRows.length} record(s)
                            </span>
                        </div>

                        <div className="pcr-grid-actions">
                            <button
                                type="button"
                                className="pcr-btn pcr-btn-secondary"
                                onClick={handleSaveDraft}
                                disabled={saving || loading}
                            >
                                {saving ? 'Saving...' : 'Save as Draft'}
                            </button>

                            <button
                                type="button"
                                className="pcr-btn pcr-btn-primary"
                                onClick={handleSaveSubmit}
                                disabled={saving || loading}
                            >
                                Save and Submit
                            </button>
                        </div>
                    </div>

                    <div
                        className={`pcr-table-wrapper ${
                            !loading && rows.length === 0
                                ? 'pcr-table-wrapper-empty'
                                : ''
                        }`}
                    >
                        <table className="pcr-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            aria-label="Select all records"
                                            checked={
                                                rows.length > 0 &&
                                                selectedIds.length === rows.length
                                            }
                                            onChange={event =>
                                                toggleAll(event.target.checked)
                                            }
                                        />
                                    </th>
                                    <th>Ticket No.</th>
                                    <th>Product</th>
                                    <th>Serial No.</th>
                                    <th>Item No.</th>
                                    <th>Item Description</th>
                                    <th>Franchise</th>
                                    <th>Vendor</th>
                                    <th>Qty</th>
                                    <th>Status</th>
                                    <th>Marking</th>
                                    <th>Remark</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="13" className="pcr-empty-cell">
                                            Loading PCR records...
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="13" className="pcr-empty-cell">
                                            No records found. Enter filters and select Search.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, index) => {
                                        const id = getRowId(row)

                                        return (
                                            <tr key={id || index}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Select record ${id}`}
                                                        checked={selectedIds.includes(id)}
                                                        onChange={() => toggleRow(id)}
                                                        disabled={!id}
                                                    />
                                                </td>
                                                <td>
                                                    {row?.TikectNo ?? row?.TicketNo ?? ''}
                                                </td>
                                                <td>{row?.ProductName ?? ''}</td>
                                                <td>{row?.Serial ?? ''}</td>
                                                <td>{row?.item_no ?? ''}</td>
                                                <td>{row?.item_desc ?? ''}</td>
                                                <td>{row?.Franchise ?? ''}</td>
                                                <td>{row?.vendor ?? ''}</td>
                                                <td>{row?.Quantity ?? ''}</td>
                                                <td>{getRowStatus(row)}</td>
                                                <td>{getRowMarking(row)}</td>
                                                <td>{getRowRemark(row)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="pcr-link-button"
                                                        onClick={() => handleView(row)}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </DashboardLayout>
    )
}

export default PCRVendorDetails
