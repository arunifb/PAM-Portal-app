import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    searchTechnicians,
    exportTechnicians,
    reallocateTechnician,
    generatePartnerId
} from '../../api/technicianApi'

import {
    getRegions,
    getBranches,
    getFranchises
} from '../../api/reportsApi'

import './Technician.css'

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getSessionValue(...keys) {
    for (const key of keys) {
        const value = sessionStorage.getItem(key)

        if (value !== null && value !== undefined && value !== '') {
            return value
        }
    }

    return ''
}

function getArrayFromResponse(response) {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.result)) return response.result
    if (Array.isArray(response?.items)) return response.items

    return []
}

function getRegionCode(item) {
    return String(
        item?.regionCode ??
        item?.RegionCode ??
        item?.code ??
        item?.Code ??
        ''
    )
}

function getRegionName(item) {
    return String(
        item?.regionName ??
        item?.RegionName ??
        item?.name ??
        item?.Name ??
        ''
    )
}

function getBranchCode(item) {
    return String(
        item?.bpCode ??
        item?.BPCode ??
        item?.branchCode ??
        item?.BranchCode ??
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
        ''
    )
}

function getFranchiseCode(item) {
    return String(
        item?.frCode ??
        item?.FrCode ??
        item?.franchiseCode ??
        item?.FranchiseCode ??
        item?.code ??
        item?.Code ??
        ''
    )
}

function getFranchiseName(item) {
    return String(
        item?.franchiseName ??
        item?.Franchisename ??
        item?.FranchiseName ??
        item?.name ??
        item?.Name ??
        ''
    )
}

// =====================================================
// DATE FORMAT
// =====================================================

function formatCreatedDate(value) {
    if (!value) return '-'

    let date

    // Handle API format: DD-MM-YYYY HH:mm:ss
    if (
        typeof value === 'string' &&
        /^\d{2}-\d{2}-\d{4}/.test(value)
    ) {
        const [datePart] = value.split(' ')
        const [day, month, year] = datePart.split('-')

        date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        )
    } else {
        date = new Date(value)
    }

    if (Number.isNaN(date.getTime())) return '-'

    const day = String(date.getDate()).padStart(2, '0')

    const month = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
    ][date.getMonth()]

    return `${day}-${month}-${date.getFullYear()}`
}

function getTechnicianCreatedDate(technician) {
    return (
        technician?.createdDate ??
        technician?.CreatedDate ??
        technician?.createdOn ??
        technician?.CreatedOn ??
        null
    )
}

function getStatusClass(status) {
    const value = String(status || '').toLowerCase()

    if (value.includes('approved')) {
        return 'technician-status-badge technician-status-success'
    }

    if (value.includes('de-activated') || value.includes('deactivated')) {
        return 'technician-status-badge technician-status-danger'
    }

    if (value.includes('ready')) {
        return 'technician-status-badge technician-status-warning'
    }

    return 'technician-status-badge technician-status-default'
}

// =====================================================
// FILTER TECHNICIANS BY STATUS
// =====================================================

function filterTechniciansByStatus(technicians, selectedStatus) {
    if (!selectedStatus || selectedStatus === '') {
        return technicians
    }

    const statusLabels = {
        '5': ['ready for review', 'skill set'],
        '1': ['approved', 'activated'],
        '0': ['de-activated', 'deactivated'],
        '6': ['correction required'],
        '7': ['request for change']
    }

    return technicians.filter(technician => {
        const statusId =
            technician?.statusId ??
            technician?.StatusId ??
            technician?.statusID ??
            technician?.StatusID

        const rawStatus =
            technician?.status ??
            technician?.Status ??
            ''

        if (
            statusId !== null &&
            statusId !== undefined &&
            String(statusId) !== ''
        ) {
            return String(statusId) === String(selectedStatus)
        }

        if (/^\d+$/.test(String(rawStatus).trim())) {
            return String(rawStatus).trim() === String(selectedStatus)
        }

        const description = String(rawStatus).toLowerCase()
        const keywords = statusLabels[String(selectedStatus)] || []

        if (selectedStatus === '5') {
            return (
                description.includes('ready for review') ||
                description.includes('skill set')
            )
        }

        return keywords.some(keyword =>
            description.includes(keyword)
        )
    })
}

// =====================================================
// COMPONENT
// =====================================================

function getTechnicianPhotoUrl(photoUrl) {
    if (!photoUrl) return ''

    const url = String(photoUrl).trim()

    // Absolute URLs can be used directly.
    if (/^https?:\/\//i.test(url)) {
        return url
    }

    // Resolve relative image paths against the API server.
    const apiBaseUrl = 'https://localhost:7095'

    return `${apiBaseUrl}/${url.replace(/^\/+/, '')}`
}


function Technician({
    onAddTechnician,
    onEditTechnician,
    restoreListState: savedListState,
    refreshAfterAdd = 0
}) {
    const navigate = useNavigate()
    const location = useLocation()

    // =================================================
    // RESTORE PREVIOUS LIST STATE
    // =================================================

    const restoredListState =
        savedListState ||
        (location.state?.restoreListState
            ? location.state.listState
            : null)

    // =================================================
    // SESSION VALUES
    // =================================================

    const roleId = Number(
        getSessionValue('roleId', 'RoleID') || 1
    )

    const sessionUserId = getSessionValue('userId', 'UserID')
    const sessionBpCode = getSessionValue('bpCode', 'BPCode')
    const sessionLoginId = getSessionValue('loginId', 'LoginID')

    const sessionRegionCode = getSessionValue(
        'regionCode',
        'RegionCode'
    )

    // =================================================
    // ROLE FLAGS
    // =================================================

    const isRole1 = roleId === 1
    const isRole3 = roleId === 3
    const isRole5 = roleId === 5
    const isRole6 = roleId === 6

    // =================================================
    // FILTER STATES
    // =================================================

    const [regionCode, setRegionCode] = useState(
        restoredListState?.regionCode ??
        ((isRole3 || isRole5 || isRole6) ? sessionRegionCode : '')
    )

    const [branchCode, setBranchCode] = useState(
        restoredListState?.branchCode ?? ''
    )

    const [franchiseCode, setFranchiseCode] = useState(
        restoredListState?.franchiseCode ?? ''
    )

    const [status, setStatus] = useState(
        restoredListState?.status ??
        (roleId === 3 || roleId === 5 ? '5' : '1')
    )

    const [technicianName, setTechnicianName] = useState(
        restoredListState?.technicianName ?? ''
    )

    const [mobileNo, setMobileNo] = useState(
        restoredListState?.mobileNo ?? ''
    )

    // =================================================
    // DROPDOWN DATA
    // =================================================

    const [regions, setRegions] = useState([])
    const [branches, setBranches] = useState([])
    const [franchises, setFranchises] = useState([])

    // =================================================
    // TABLE DATA
    // =================================================

    const [technicians, setTechnicians] = useState(
        restoredListState?.technicians ?? []
    )

    // =================================================
    // UI STATES
    // =================================================

    const [loading, setLoading] = useState(false)
    const [downloadLoading, setDownloadLoading] = useState(false)

    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const [editingTechId, setEditingTechId] = useState(null)
    const [editingFranchiseCode, setEditingFranchiseCode] = useState('')

    const [actionLoading, setActionLoading] = useState(false)

    // =================================================
    // LOAD REGIONS
    // Role 5 and Role 6: auto-select session region
    // =================================================

    

useEffect(() => {
    let cancelled = false

    async function loadRegions() {
        try {
            const response = await getRegions('', sessionUserId)

            if (cancelled) return

            const regionList = getArrayFromResponse(response)
            setRegions(regionList)

            // If returning from Edit, restore the previous selection.
            if (restoredListState) {
                setRegionCode(restoredListState.regionCode ?? '')
                return
            }

            // Automatically select the logged-in user's region.
            if (isRole3 || isRole5 || isRole6) {
                const loggedInRegionCode = String(
                    sessionRegionCode ?? ''
                ).trim().toLowerCase()

                const matchingRegion = regionList.find(region =>
                    getRegionCode(region).trim().toLowerCase() ===
                    loggedInRegionCode
                )

                if (matchingRegion) {
                    setRegionCode(getRegionCode(matchingRegion))
                } else {
                    console.warn('Region auto-selection failed:', {
                        loggedInRegionCode,
                        availableRegions: regionList.map(region => ({
                            code: getRegionCode(region),
                            name: getRegionName(region)
                        }))
                    })

                    setRegionCode('')
                }
            }
        } catch (err) {
            if (!cancelled) {
                setRegions([])
                setError(err?.message || 'Unable to load regions.')
            }
        }
    }

    loadRegions()

    return () => {
        cancelled = true
    }
}, [
    sessionUserId,
    sessionRegionCode,
    isRole3,
    isRole5,
    isRole6,
    restoredListState
])
    // =================================================
    // LOAD BRANCHES WHEN REGION CHANGES
    // Role 5 and Role 6: select session branch if available,
    // otherwise select the first available branch.
    // =================================================

  

useEffect(() => {
    let cancelled = false

    async function loadBranches() {
        if (!regionCode) {
            setBranches([])
            setBranchCode('')
            setFranchises([])
            setFranchiseCode('')
            return
        }

        try {
            const response = await getBranches(
                sessionUserId,
                regionCode
            )

            if (cancelled) return

            const branchList = getArrayFromResponse(response)
            setBranches(branchList)

            // Restore the branch when returning from Edit.
            if (
                restoredListState &&
                String(restoredListState.regionCode ?? '').trim().toLowerCase() ===
                String(regionCode).trim().toLowerCase()
            ) {
                const restoredBranchCode = String(
                    restoredListState.branchCode ?? ''
                ).trim().toLowerCase()

                const matchingRestoredBranch = branchList.find(
                    branch =>
                        getBranchCode(branch).trim().toLowerCase() ===
                        restoredBranchCode
                )

                if (matchingRestoredBranch) {
                    setBranchCode(getBranchCode(matchingRestoredBranch))
                } else if (
                    (isRole3 || isRole5 || isRole6) &&
                    branchList.length > 0
                ) {
                    setBranchCode(getBranchCode(branchList[0]))
                } else {
                    setBranchCode('')
                }
            } else if (isRole3 || isRole5 || isRole6) {
                // Match the logged-in user's branch.
                const loggedInBranchCode = String(
                    sessionBpCode ?? ''
                ).trim().toLowerCase()

                const matchingBranch = branchList.find(
                    branch =>
                        getBranchCode(branch).trim().toLowerCase() ===
                        loggedInBranchCode
                )

                if (matchingBranch) {
                    setBranchCode(getBranchCode(matchingBranch))
                } else if (branchList.length > 0) {
                    // Fallback when the session BPCode doesn't match.
                    setBranchCode(getBranchCode(branchList[0]))
                } else {
                    setBranchCode('')
                }
            } else {
                setBranchCode('')
            }

            setFranchises([])
            setFranchiseCode('')
        } catch (err) {
            if (!cancelled) {
                setBranches([])
                setBranchCode('')
                setFranchises([])
                setFranchiseCode('')
                setError(err?.message || 'Unable to load branches.')
            }
        }
    }

    loadBranches()

    return () => {
        cancelled = true
    }
}, [
    sessionUserId,
    regionCode,
    sessionBpCode,
    isRole3,
    isRole5,
    isRole6,
    restoredListState
])

    // =================================================
    // LOAD FRANCHISES
    // Role 5 and Role 6: auto-select first franchise
    // =================================================

    useEffect(() => {
        let cancelled = false

        async function loadFranchises() {
            if (!regionCode) {
                setFranchises([])
                setFranchiseCode('')
                return
            }

            // Roles 1 and 3 must select a branch first.
            if ((isRole1 || isRole3) && !branchCode) {
                setFranchises([])
                setFranchiseCode('')
                return
            }

            // Role 5 must also have a branch selected.
            if (isRole5 && !branchCode) {
                setFranchises([])
                setFranchiseCode('')
                return
            }

            try {
                let bpCodeForFranchise = ''
                let loginIdForFranchise = ''

                if (isRole5) {
                    bpCodeForFranchise = sessionBpCode
                    loginIdForFranchise = sessionLoginId
                } else if (isRole6) {
                    // Preserve the existing Role 6 API parameters.
                    bpCodeForFranchise = sessionBpCode
                    loginIdForFranchise = ''
                } else {
                    bpCodeForFranchise = branchCode
                    loginIdForFranchise = ''
                }

                if (!bpCodeForFranchise) {
                    setFranchises([])
                    setFranchiseCode('')
                    return
                }

                const response = await getFranchises(
                    roleId,
                    bpCodeForFranchise,
                    loginIdForFranchise
                )

                if (cancelled) return

                const franchiseList = getArrayFromResponse(response)

                setFranchises(franchiseList)

                if (restoredListState) {
                    const restoredFranchiseCode = String(
                        restoredListState.franchiseCode ?? ''
                    )

                    const restoredFranchiseExists =
                        franchiseList.some(
                            franchise =>
                                getFranchiseCode(franchise).trim() ===
                                restoredFranchiseCode.trim()
                        )

                    if (restoredFranchiseExists) {
                        setFranchiseCode(restoredFranchiseCode)
                    } else if (
                        (isRole5 || isRole6) &&
                        franchiseList.length > 0
                    ) {
                        setFranchiseCode(
                            getFranchiseCode(franchiseList[0])
                        )
                    } else {
                        setFranchiseCode('')
                    }
                } else if (isRole5 || isRole6) {
                    // Automatically select the first franchise.
                    const firstFranchise = franchiseList[0]

                    setFranchiseCode(
                        firstFranchise
                            ? getFranchiseCode(firstFranchise)
                            : ''
                    )
                } else {
                    setFranchiseCode('')
                }
            } catch (err) {
                if (!cancelled) {
                    setFranchises([])
                    setFranchiseCode('')
                    setError(
                        err?.message || 'Unable to load franchises.'
                    )
                }
            }
        }

        loadFranchises()

        return () => {
            cancelled = true
        }
    }, [
        roleId,
        regionCode,
        branchCode,
        sessionBpCode,
        sessionLoginId,
        isRole1,
        isRole3,
        isRole5,
        isRole6,
        restoredListState
    ])

    // =================================================
    // SEARCH
    // =================================================

    async function handleSearch() {
        setError('')
        setSuccessMessage('')

        if (!regionCode) {
            setError('Region is required.')
            return
        }

        setLoading(true)

        try {
            const searchParams = {
                regionCode,
                branchCode,
                franchiseCode,
                name: technicianName.trim(),
                mobileNo: mobileNo.trim(),
                status,
                roleId
            }

            console.log(
                'Technician search request:',
                searchParams
            )

            const response = await searchTechnicians(searchParams)

            console.log(
                'Technician search response:',
                response
            )

            const technicianList = getArrayFromResponse(response)

            const filteredTechnicians = filterTechniciansByStatus(
                technicianList,
                status
            )

            setTechnicians(filteredTechnicians)
        } catch (err) {
            setTechnicians([])
            setError(
                err?.message || 'Unable to load technician data.'
            )
        } finally {
            setLoading(false)
        }
    }

    // =================================================
    // RESTORE LIST STATE WHEN RETURNING FROM EDIT
    // =================================================

    useEffect(() => {
        if (!restoredListState) return

        setRegionCode(restoredListState.regionCode ?? '')
        setBranchCode(restoredListState.branchCode ?? '')
        setFranchiseCode(restoredListState.franchiseCode ?? '')

        setStatus(
            restoredListState.status ??
            (roleId === 3 || roleId === 5 ? '5' : '1')
        )

        setTechnicianName(
            restoredListState.technicianName ?? ''
        )

        setMobileNo(restoredListState.mobileNo ?? '')

        setTechnicians(restoredListState.technicians ?? [])
    }, [restoredListState, roleId])

    // =================================================
    // REFRESH LIST AFTER ADDING A TECHNICIAN
    // =================================================

    useEffect(() => {
        if (!refreshAfterAdd) return

        let cancelled = false

        async function refreshTechnicians() {
            if (!regionCode) {
                setError('Region is required.')
                return
            }

            const refreshStatus = roleId === 5 ? '5' : status

            setStatus(refreshStatus)
            setLoading(true)
            setError('')
            setSuccessMessage('')

            try {
                const response = await searchTechnicians({
                    regionCode,
                    branchCode,
                    franchiseCode,
                    name: technicianName.trim(),
                    mobileNo: mobileNo.trim(),
                    status: refreshStatus,
                    roleId
                })

                if (cancelled) return

                const technicianList = getArrayFromResponse(response)

                setTechnicians(
                    filterTechniciansByStatus(
                        technicianList,
                        refreshStatus
                    )
                )
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err?.message ||
                        'Unable to refresh technician data.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        refreshTechnicians()

        return () => {
            cancelled = true
        }
    }, [refreshAfterAdd])

    // =================================================
    // FILTER CHANGES
    // =================================================

    function handleBranchChange(event) {
        setBranchCode(event.target.value)
        setFranchiseCode('')
        setTechnicians([])
        setError('')
        setSuccessMessage('')
    }

    function handleRegionChange(event) {
        const selectedRegion = event.target.value

        setRegionCode(selectedRegion)

        setBranchCode('')
        setBranches([])

        setFranchiseCode('')
        setFranchises([])

        setTechnicians([])
        setError('')
        setSuccessMessage('')
    }

    // =================================================
    // EDIT
    // =================================================

    // function handleEdit(technician) {
    //     if (isRole6) return

    //     const techId = String(
    //         technician?.techId ??
    //         technician?.TechId ??
    //         technician?.techID ??
    //         technician?.TechID ??
    //         ''
    //     )

    //     if (!techId) {
    //         setError('Technician ID is missing.')
    //         return
    //     }

    //     setError('')
    //     setSuccessMessage('')

    //     // Role 3: Existing Technician Edit page.
    //     // Role 5: S.A Profile page.
    //     if (isRole3 || isRole5) {
    //         const listState = {
    //             regionCode,
    //             branchCode,
    //             franchiseCode,
    //             status,
    //             technicianName,
    //             mobileNo,
    //             technicians
    //         }

    //         navigate('/technician/edit', {
    //             state: {
    //                 techId,
    //                 profileMode: isRole5 ? 'sa-profile' : 'edit',
    //                 returnUrl: location.pathname + location.search,
    //                 listState
    //             }
    //         })

    //         return
    //     }

    //     setEditingTechId(techId)

    //     setEditingFranchiseCode(
    //         String(
    //             technician?.franchiseCode ??
    //             technician?.FranchiseCode ??
    //             technician?.frCode ??
    //             technician?.FrCode ??
    //             ''
    //         )
    //     )
    // }

    function handleEdit(technician) {
    if (isRole6) return

    const techId = String(
        technician?.techId ??
        technician?.TechId ??
        technician?.techID ??
        technician?.TechID ??
        ''
    )

    if (!techId) {
        setError('Technician ID is missing.')
        return
    }

    setError('')
    setSuccessMessage('')

    // Role 3: Existing Technician Edit page.
    // Role 5: S.A Profile page.
    // Open inside the same dynamic URL.
    if (isRole3 || isRole5) {
        const listState = {
            regionCode,
            branchCode,
            franchiseCode,
            status,
            technicianName,
            mobileNo,
            technicians
        }

        if (typeof onEditTechnician === 'function') {
            onEditTechnician({
                techId,
                profileMode: isRole5 ? 'sa-profile' : 'edit',
                listState
            })
        }

        return
    }

    // Keep existing behavior for other roles.
    setEditingTechId(techId)

    setEditingFranchiseCode(
        String(
            technician?.franchiseCode ??
            technician?.FranchiseCode ??
            technician?.frCode ??
            technician?.FrCode ??
            ''
        )
    )
}

    function handleCancelEdit() {
        setEditingTechId(null)
        setEditingFranchiseCode('')
    }

    // =================================================
    // SAVE FRANCHISE
    // =================================================

    async function handleSave(technician) {
        const techId =
            technician?.techId ??
            technician?.TechId ??
            technician?.techID ??
            technician?.TechID

        const newFranchiseCode = editingFranchiseCode.trim()

        if (!techId) {
            setError('Technician ID is missing.')
            return
        }

        if (!newFranchiseCode) {
            setError('Franchise code is required.')
            return
        }

        setActionLoading(true)
        setError('')
        setSuccessMessage('')

        try {
            const response = await reallocateTechnician(
                techId,
                newFranchiseCode
            )

            if (response?.isSuccess === false) {
                throw new Error(
                    response?.message ||
                    'Unable to update technician.'
                )
            }

            setSuccessMessage(
                response?.message ||
                'Technician transferred successfully.'
            )

            setEditingTechId(null)
            setEditingFranchiseCode('')

            await handleSearch()
        } catch (err) {
            setError(
                err?.message || 'Unable to update technician.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    // =================================================
    // GENERATE PARTNER ID
    // =================================================

    async function handleGeneratePartnerId(technician) {
        const techId =
            technician?.techId ??
            technician?.TechId ??
            technician?.techID ??
            technician?.TechID

        if (!techId) {
            setError('Technician ID is missing.')
            return
        }

        const confirmed = window.confirm(
            'Are you sure you want to submit a request for Partner ID generation?'
        )

        if (!confirmed) return

        setActionLoading(true)
        setError('')
        setSuccessMessage('')

        try {
            const response = await generatePartnerId(techId)

            if (response?.isSuccess === false) {
                throw new Error(
                    response?.message ||
                    'Request submission failed.'
                )
            }

            setSuccessMessage(
                response?.message ||
                'Your request has been submitted. Please wait for confirmation from CRM.'
            )

            await handleSearch()
        } catch (err) {
            setError(
                err?.message || 'Request submission failed.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    // =================================================
    // DOWNLOAD - ROLE 1 ONLY
    // =================================================

    async function handleDownload() {
        if (!isRole1) return

        if (!regionCode) {
            setError('Region is required.')
            return
        }

        setDownloadLoading(true)
        setError('')
        setSuccessMessage('')

        try {
            const blob = await exportTechnicians({
                regionCode,
                branchCode,
                franchiseCode,
                name: technicianName.trim(),
                mobileNo: mobileNo.trim(),
                status,
                roleId
            })

            if (!blob || blob.size === 0) {
                throw new Error(
                    'No technician data available for download.'
                )
            }

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')

            link.href = url

            link.download =
                `TechnicianSearch_${regionCode}_${new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace(/[-:T]/g, '')}.xlsx`

            document.body.appendChild(link)
            link.click()
            link.remove()

            window.URL.revokeObjectURL(url)

            setSuccessMessage(
                'Technician data downloaded successfully.'
            )

            window.setTimeout(() => {
                setSuccessMessage('')
            }, 2000)
        } catch (err) {
            setError(
                err?.message || 'Unable to download technician data.'
            )
        } finally {
            setDownloadLoading(false)
        }
    }

    // =================================================
    // RENDER
    // =================================================

    return (
        <DashboardLayout title="Search Technician">
            <div className="technician-page">

                {error && (
                    <div className="technician-alert technician-alert-error">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="technician-alert technician-alert-success">
                        {successMessage}
                    </div>
                )}

                {/* FILTER BOX */}

                <div className="technician-filter-box">

                    {/* REGION */}

                    <div className="technician-filter-item">
                        <label>Region</label>

                        <select
                            value={regionCode}
                            onChange={handleRegionChange}
                        >
                            <option value="">Select Region</option>

                            {regions.map((region, index) => {
                                const code = getRegionCode(region)
                                const name = getRegionName(region)

                                return (
                                    <option
                                        key={`${code}-${index}`}
                                        value={code}
                                    >
                                        {name || code}
                                    </option>
                                )
                            })}
                        </select>
                    </div>

                    {/* BRANCH */}

                    <div className="technician-filter-item">
                        <label>Branch</label>

                        <select
                            value={branchCode}
                            onChange={handleBranchChange}
                            disabled={!regionCode || isRole6}
                        >
                            {!isRole5 && (
                                <option value="">All</option>
                            )}

                            {isRole5 && branches.length === 0 && (
                                <option value="">
                                    No branches available
                                </option>
                            )}

                            {branches.map((branch, index) => {
                                const code = getBranchCode(branch)
                                const name = getBranchName(branch)

                                return (
                                    <option
                                        key={`${code}-${index}`}
                                        value={code}
                                    >
                                        {name || code}
                                    </option>
                                )
                            })}
                        </select>
                    </div>

                    {/* FRANCHISE */}

                    <div className="technician-filter-item">
                        <label>Franchise</label>

                        <select
                            value={franchiseCode}
                            onChange={event =>
                                setFranchiseCode(event.target.value)
                            }
                            disabled={
                                !regionCode ||
                                isRole5 ||
                                ((isRole1 || isRole3) && !branchCode)
                            }
                        >
                            <option value="">All</option>

                            {franchises.map((franchise, index) => {
                                const code = getFranchiseCode(franchise)
                                const name = getFranchiseName(franchise)

                                return (
                                    <option
                                        key={`${code}-${index}`}
                                        value={code}
                                    >
                                        {name || code}
                                    </option>
                                )
                            })}
                        </select>
                    </div>

                    {/* STATUS */}

                    <div className="technician-filter-item">
                        <label>Status</label>

                        <select
                            value={status}
                            onChange={event => setStatus(event.target.value)}
                        >
                            <option value="">All</option>

                            {isRole3 ? (
                                <>
                                    <option value="5">
                                        Ready for review &amp; skill set
                                    </option>

                                    <option value="1">
                                        Approved &amp; Activated By Trainer
                                    </option>

                                    <option value="0">
                                        De-Activated By Trainer
                                    </option>

                                    <option value="6">
                                        Request for Profile Photo Change
                                    </option>

                                    <option value="7">
                                        Request for change for Mobile
                                    </option>
                                </>
                            ) : isRole5 ? (
                                <>
                                    <option value="5">
                                        Ready for review &amp; skill set
                                    </option>

                                    <option value="1">
                                        Approved &amp; Activated By Trainer
                                    </option>

                                    <option value="0">
                                        De-Activated By Branch Trainer
                                    </option>

                                    <option value="6">
                                        Correction Required
                                    </option>

                                    <option value="7">
                                        Request for change
                                    </option>
                                </>
                            ) : (
                                <>
                                    <option value="1">
                                        Approved &amp; Activated By Trainer
                                    </option>

                                    <option value="0">
                                        De-Activated By Trainer
                                    </option>
                                </>
                            )}
                        </select>
                    </div>

                    {/* TECHNICIAN NAME */}

                    <div className="technician-filter-item">
                        <label>Technician Name</label>

                        <input
                            type="text"
                            value={technicianName}
                            onChange={event =>
                                setTechnicianName(event.target.value)
                            }
                            placeholder="Technician Name"
                        />
                    </div>

                    {/* MOBILE */}

                    <div className="technician-filter-item">
                        <label>Mobile</label>

                        <input
                            type="text"
                            value={mobileNo}
                            onChange={event =>
                                setMobileNo(event.target.value)
                            }
                            placeholder="Mobile"
                        />
                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="technician-filter-actions">
                        <button
                            type="button"
                            className="technician-search-button"
                            onClick={handleSearch}
                            disabled={
                                loading ||
                                actionLoading ||
                                downloadLoading
                            }
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>

                        {/* Add button: Role 5 only */}

                        {isRole5 && (
                            <button
                                type="button"
                                className="technician-add-button"
                                onClick={() => {
                                    onAddTechnician?.({
                                        regionCode,
                                        branchCode,
                                        franchiseCode,
                                        status,
                                        technicianName,
                                        mobileNo,
                                        technicians
                                    })
                                }}
                                disabled={
                                    loading ||
                                    actionLoading ||
                                    downloadLoading
                                }
                            >
                                + Add
                            </button>
                        )}

                        {/* Download button: Role 1 only */}

                        {isRole1 && (
                            <button
                                type="button"
                                className="technician-download-button"
                                onClick={handleDownload}
                                disabled={
                                    loading ||
                                    actionLoading ||
                                    downloadLoading
                                }
                            >
                                {downloadLoading
                                    ? 'Downloading...'
                                    : 'Download'}
                            </button>
                        )}
                    </div>
                </div>

                {/* LOADING */}

                {loading && (
                    <div className="technician-loading">
                        <div className="technician-loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <span className="technician-loading-text">
                            Loading...
                        </span>
                    </div>
                )}

                {/* RECORD COUNT */}

                {/* {!loading && technicians.length > 0 && (
                    <h3 className="technician-record-count">
                        {technicians.length}{' '}
                        record{technicians.length !== 1 ? 's' : ''} found
                    </h3>
                )} */}

                {/* TABLE */}

                {!loading && (
                    <div className="technician-report-section">
                        <div className="technician-section-header">
                            <span>Search Technician </span>

                           {technicians.length > 0 && (
                                <span className="technician-header-record-count">
                                    {technicians.length}{' '}
                                    record{technicians.length !== 1 ? 's' : ''} found
                                </span>
                            )}
                        </div>

                        {technicians.length > 0 ? (
                            <div className="technician-table-container">
                                <table className="technician-table">
                                    <thead>
                                        <tr>
                                            <th>SNo</th>
                                            <th className="technician-franchise-column">Franchise</th>
                                            <th>BpExt.</th>
                                            {!isRole3 && <th>PartnerID</th>}
                                            <th className="technician-name-column">Name</th>
                                            {isRole3 && <th>Profile Image</th>}
                                            <th>MobileNo</th>
                                            <th>Status</th>

                                            {isRole3 && (
                                                <th>Created Date</th>
                                            )}

                                            {!isRole6 && (
                                                <th>Action</th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {technicians.map((technician, index) => {
                                            const techId = String(
                                                technician?.techId ??
                                                technician?.TechId ??
                                                technician?.techID ??
                                                technician?.TechID ??
                                                ''
                                            )

                                            const partnerId =
                                                technician?.partnerId ??
                                                technician?.PartnerId ??
                                                technician?.PARTNERID ??
                                                ''

                                            const isEditing =
                                                editingTechId === techId

                                            return (
                                                <tr key={techId || index}>
                                                    <td>{index + 1}</td>

                                                    <td className="technician-franchise-column technician-franchise-cell">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                className="technician-edit-input"
                                                                value={editingFranchiseCode}
                                                                onChange={event =>
                                                                    setEditingFranchiseCode(
                                                                        event.target.value
                                                                    )
                                                                }
                                                                disabled={actionLoading}
                                                            />
                                                        ) : (
                                                            <span>
                                                                {technician?.franchiseName ??
                                                                    technician?.FranchiseName ??
                                                                    technician?.Franchisename ??
                                                                    '-'}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td>{techId || '-'}</td>
                                                    {!isRole3 && (
                                                    <td>
                                                        {partnerId &&
                                                        String(partnerId).length > 1 ? (
                                                            <span className="technician-partner-id">
                                                                {partnerId}
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="technician-partner-button"
                                                                onClick={() =>
                                                                    handleGeneratePartnerId(
                                                                        technician
                                                                    )
                                                                }
                                                                disabled={actionLoading}
                                                                title="Generate Partner ID"
                                                            >
                                                                Generate
                                                            </button>
                                                        )}
                                                    </td>
                                                    )}

                                                    <td className="technician-name-column">
                                                        {technician?.name ??
                                                            technician?.Name ??
                                                            '-'}
                                                    </td>

                                                    {isRole3 && (
                                                        <td className="technician-image-cell">
                                                            {(() => {
                                                                // const imageUrl =
                                                                //     technician?.profileUrl ??
                                                                //     technician?.ProfileUrl ??
                                                                //     technician?.imageUrl ??
                                                                //     technician?.ImageUrl ??
                                                                //     technician?.imageURL ??
                                                                //     technician?.ImageURL ??
                                                                //     technician?.imagePath ??
                                                                //     technician?.ImagePath ??
                                                                //     technician?.photoUrl ??
                                                                //     technician?.PhotoUrl ??
                                                                //     technician?.photo ??
                                                                //     technician?.Photo ??
                                                                //     ''

                                                                // const defaultImage =
                                                                //     '/images/default-male-profile.png'

                                                                const imageUrl = getTechnicianPhotoUrl(
                                                                technician?.profileUrl ??
                                                                technician?.ProfileUrl ??
                                                                technician?.url ??
                                                                technician?.Url ??
                                                                technician?.imageUrl ??
                                                                technician?.ImageUrl ??
                                                                technician?.imageURL ??
                                                                technician?.ImageURL ??
                                                                technician?.imagePath ??
                                                                technician?.ImagePath ??
                                                                technician?.photoUrl ??
                                                                technician?.PhotoUrl ??
                                                                technician?.photo ??
                                                                technician?.Photo ??
                                                                ''
                                                            )

                                                            const defaultImage = '/images/default-male-profile.png'

                                                                return (
                                                                    <img
                                                                        src={imageUrl || defaultImage}
                                                                        alt={
                                                                            technician?.name ??
                                                                            technician?.Name ??
                                                                            'Technician'
                                                                        }
                                                                        className="technician-profile-image"
                                                                        onError={(event) => {
                                                                            const img = event.currentTarget

                                                                            // Show the default image if the API image
                                                                            // is missing or cannot be loaded.
                                                                            if (
                                                                                img.getAttribute('src') !== defaultImage
                                                                            ) {
                                                                                img.onerror = null
                                                                                img.src = defaultImage
                                                                            }
                                                                        }}
                                                                    />
                                                                )
                                                            })()}
                                                        </td>
                                                    )}

                                                    <td>
                                                        {technician?.mobileNo ??
                                                            technician?.MobileNo ??
                                                            'NA'}
                                                    </td>

                                                    <td>
                                                        {(() => {
                                                            const rawStatus =
                                                                technician?.status ??
                                                                technician?.Status ??
                                                                technician?.statusName ??
                                                                technician?.StatusName ??
                                                                technician?.statusDescription ??
                                                                technician?.StatusDescription ??
                                                                technician?.actionStatus ??
                                                                technician?.ActionStatus ??
                                                                ''

                                                            const statusId =
                                                                technician?.statusId ??
                                                                technician?.StatusId ??
                                                                technician?.statusID ??
                                                                technician?.StatusID

                                                            const statusLabels = {
                                                                '5': 'Ready for review & skill set',
                                                                '1': 'Approved & Activated By Trainer',
                                                                '0': 'De-Activated By Branch Trainer',
                                                                '6': 'Correction Required',
                                                                '7': 'Request for change'
                                                            }

                                                            const displayedStatus =
                                                                String(rawStatus).trim() !== '' &&
                                                                !/^\d+$/.test(String(rawStatus).trim())
                                                                    ? rawStatus
                                                                    : statusLabels[
                                                                        String(
                                                                            statusId ?? rawStatus
                                                                        ).trim()
                                                                    ] ?? '-'

                                                            return (
                                                                <span
                                                                    className={getStatusClass(
                                                                        displayedStatus
                                                                    )}
                                                                >
                                                                    {displayedStatus}
                                                                </span>
                                                            )
                                                        })()}
                                                    </td>

                                                    {isRole3 && (
                                                        <td>
                                                            {formatCreatedDate(
                                                                getTechnicianCreatedDate(
                                                                    technician
                                                                )
                                                            )}
                                                        </td>
                                                    )}

                                                    {!isRole6 && (
                                                        <td>
                                                            <div className="technician-row-actions">
                                                                {!isEditing ? (
                                                                    <button
                                                                        type="button"
                                                                        className="technician-edit-button"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                technician
                                                                            )
                                                                        }
                                                                        disabled={actionLoading}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            className="technician-save-button"
                                                                            onClick={() =>
                                                                                handleSave(
                                                                                    technician
                                                                                )
                                                                            }
                                                                            disabled={actionLoading}
                                                                        >
                                                                            {actionLoading
                                                                                ? 'Saving...'
                                                                                : 'Save'}
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="technician-cancel-button"
                                                                            onClick={handleCancelEdit}
                                                                            disabled={actionLoading}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="technician-no-record">
                                No Record found!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default Technician