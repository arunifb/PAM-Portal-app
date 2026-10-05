import { useEffect, useState } from 'react'
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

        if (
            value !== null &&
            value !== undefined &&
            value !== ''
        ) {
            return value
        }
    }

    return ''
}

function getArrayFromResponse(response) {
    if (Array.isArray(response)) {
        return response
    }

    if (Array.isArray(response?.data)) {
        return response.data
    }

    if (Array.isArray(response?.result)) {
        return response.result
    }

    if (Array.isArray(response?.items)) {
        return response.items
    }

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

function getStatusClass(status) {
    const value = String(status || '').toLowerCase()

    if (value.includes('approved')) {
        return 'technician-status-badge technician-status-success'
    }

    if (value.includes('de-activated')) {
        return 'technician-status-badge technician-status-danger'
    }

    if (value.includes('ready')) {
        return 'technician-status-badge technician-status-warning'
    }

    return 'technician-status-badge technician-status-default'
}

// =====================================================
// COMPONENT
// =====================================================

function Technician() {

    // =================================================
    // SESSION VALUES
    // =================================================

    const roleId = Number(
        getSessionValue('roleId', 'RoleID') || 1
    )

    const sessionRegionCode = getSessionValue(
        'regionCode',
        'RegionCode'
    )

    const sessionBpCode = getSessionValue(
        'bpCode',
        'BPCode'
    )

    const sessionLoginId = getSessionValue(
        'loginId',
        'LoginID'
    )

    // =================================================
    // FILTER STATES
    // =================================================

    const [regionCode, setRegionCode] =
        useState(sessionRegionCode)

    const [branchCode, setBranchCode] =
        useState('')

    const [franchiseCode, setFranchiseCode] =
        useState('')

    const [status, setStatus] =
        useState('1')

    const [technicianName, setTechnicianName] =
        useState('')

    const [mobileNo, setMobileNo] =
        useState('')

    // =================================================
    // DROPDOWN DATA
    // =================================================

    const [regions, setRegions] =
        useState([])

    const [branches, setBranches] =
        useState([])

    const [franchises, setFranchises] =
        useState([])

    // =================================================
    // TABLE DATA
    // =================================================

    const [technicians, setTechnicians] =
        useState([])

    // =================================================
    // UI STATES
    // =================================================

    const [loading, setLoading] =
        useState(false)

    const [initialLoading, setInitialLoading] =
        useState(true)

    const [downloadLoading, setDownloadLoading] =
        useState(false)

    const [error, setError] =
        useState('')

    const [successMessage, setSuccessMessage] =
        useState('')

    const [editingTechId, setEditingTechId] =
        useState(null)

    const [editingFranchiseCode, setEditingFranchiseCode] =
        useState('')

    const [actionLoading, setActionLoading] =
        useState(false)

    // =================================================
    // ROLE FLAGS
    // =================================================

    const isRole1 = roleId === 1
    const isRole5 = roleId === 5
    const isRole6 = roleId === 6

    // =================================================
    // LOAD REGIONS
    // =================================================

    useEffect(() => {
        let cancelled = false

        async function loadRegions() {
            try {
                const response =
                    await getRegions(sessionRegionCode)

                if (cancelled) {
                    return
                }

                const data =
                    getArrayFromResponse(response)

                setRegions(data)

                if (sessionRegionCode) {
                    setRegionCode(sessionRegionCode)
                }

            } catch (err) {

                if (!cancelled) {
                    setError(
                        err.message ||
                        'Unable to load regions.'
                    )
                }
            }
        }

        loadRegions()

        return () => {
            cancelled = true
        }

    }, [sessionRegionCode])

    // =================================================
    // LOAD BRANCHES
    // =================================================

    useEffect(() => {
        let cancelled = false

        async function loadBranches() {

            if (!regionCode) {
                setBranches([])
                return
            }

            try {

                const response =
                    await getBranches(
                        roleId,
                        regionCode,
                        isRole5 || isRole6
                            ? sessionBpCode
                            : ''
                    )

                if (cancelled) {
                    return
                }

                const data =
                    getArrayFromResponse(response)

                setBranches(data)

                // -------------------------------------
                // ROLE 5 / ROLE 6
                // Branch locked to session BPCode
                // -------------------------------------

                if (isRole5 || isRole6) {

                    setBranchCode(
                        sessionBpCode || ''
                    )

                } else {

                    setBranchCode('')
                }

            } catch (err) {

                if (!cancelled) {

                    setBranches([])

                    setError(
                        err.message ||
                        'Unable to load branches.'
                    )
                }
            }
        }

        loadBranches()

        return () => {
            cancelled = true
        }

    }, [
        roleId,
        regionCode,
        sessionBpCode,
        isRole5,
        isRole6
    ])

    // =================================================
    // LOAD FRANCHISES
    // =================================================

    useEffect(() => {

        let cancelled = false

        async function loadFranchises() {

            if (!regionCode) {
                setFranchises([])
                setFranchiseCode('')
                return
            }

            // -----------------------------------------
            // ROLE 1
            // -----------------------------------------

            if (isRole1 && !branchCode) {

                setFranchises([])
                setFranchiseCode('')

                return
            }

            try {

                let bpCodeForFranchise = ''
                let loginIdForFranchise = ''

                // -----------------------------------------
                // ROLE 5
                // -----------------------------------------

                if (isRole5) {

                    bpCodeForFranchise =
                        sessionBpCode

                    loginIdForFranchise =
                        sessionLoginId
                }

                // -----------------------------------------
                // ROLE 6
                // -----------------------------------------

                else if (isRole6) {

                    bpCodeForFranchise =
                        sessionBpCode

                    loginIdForFranchise = ''
                }

                // -----------------------------------------
                // ROLE 1 / OTHER ROLES
                // -----------------------------------------

                else {

                    bpCodeForFranchise =
                        branchCode

                    loginIdForFranchise = ''
                }

                // -----------------------------------------
                // SAFETY CHECK
                // -----------------------------------------

                if (!bpCodeForFranchise) {

                    setFranchises([])
                    setFranchiseCode('')

                    return
                }

                const response =
                    await getFranchises(
                        roleId,
                        bpCodeForFranchise,
                        loginIdForFranchise
                    )

                if (cancelled) {
                    return
                }

                const data =
                    getArrayFromResponse(response)

                setFranchises(data)

                // -----------------------------------------
                // ROLE 5
                // Franchise locked to LoginID
                // -----------------------------------------

                if (isRole5) {

                    setFranchiseCode(
                        sessionLoginId || ''
                    )

                }

                // -----------------------------------------
                // ROLE 6 / OTHER ROLES
                // Franchise selectable
                // -----------------------------------------

                else {

                    setFranchiseCode('')
                }

            } catch (err) {

                if (!cancelled) {

                    setFranchises([])

                    setError(
                        err.message ||
                        'Unable to load franchises.'
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
        isRole5,
        isRole6
    ])

    // =================================================
    // SEARCH FUNCTION
    // =================================================

    async function handleSearch(
        showInitialLoading = false
    ) {

        setError('')
        setSuccessMessage('')

        if (!regionCode) {

            setError(
                'Region is required.'
            )

            return
        }

        setLoading(true)

        if (showInitialLoading) {
            setInitialLoading(true)
        }

        try {

            const response =
                await searchTechnicians({
                    regionCode,

                    branchCode:
                        isRole1
                            ? ''
                            : branchCode,

                    franchiseCode,

                    name:
                        technicianName.trim(),

                    mobileNo:
                        mobileNo.trim(),

                    status,

                    roleId
                })

            const data =
                Array.isArray(response?.data)
                    ? response.data
                    : []

            setTechnicians(data)

        } catch (err) {

            setTechnicians([])

            setError(
                err.message ||
                'Unable to load technician data.'
            )

        } finally {

            setLoading(false)
            setInitialLoading(false)
        }
    }

    // =================================================
    // INITIAL SEARCH
    // =================================================

    useEffect(() => {

        if (!regionCode) {
            return
        }

        handleSearch(true)

        // Intentionally run when region is initialized.
        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [
        regionCode
    ])

    // =================================================
    // BRANCH CHANGE
    // =================================================

    function handleBranchChange(event) {

        const value =
            event.target.value

        setBranchCode(value)

        // Franchise gets reloaded by useEffect.
        setFranchiseCode('')
    }

    // =================================================
    // EDIT FRANCHISE
    // =================================================

    function handleEdit(technician) {

        // Role 6 cannot edit.
        if (isRole6) {
            return
        }

        const techId =
            String(
                technician?.techId || ''
            )

        setEditingTechId(techId)

        setEditingFranchiseCode(
            technician?.franchiseCode || ''
        )

        setError('')
        setSuccessMessage('')
    }

    // =================================================
    // CANCEL EDIT
    // =================================================

    function handleCancelEdit() {

        setEditingTechId(null)
        setEditingFranchiseCode('')
    }

    // =================================================
    // SAVE FRANCHISE
    // =================================================

    async function handleSave(technician) {

        const techId =
            technician?.techId

        const newFranchiseCode =
            editingFranchiseCode.trim()

        if (!techId) {

            setError(
                'Technician ID is missing.'
            )

            return
        }

        if (!newFranchiseCode) {

            setError(
                'Franchise code is required.'
            )

            return
        }

        setActionLoading(true)
        setError('')
        setSuccessMessage('')

        try {

            const response =
                await reallocateTechnician(
                    techId,
                    newFranchiseCode
                )

            if (response?.isSuccess === false) {

                throw new Error(
                    response.message ||
                    'Unable to update technician.'
                )
            }

            setSuccessMessage(
                response?.message ||
                'Technician transferred successfully.'
            )

            setEditingTechId(null)
            setEditingFranchiseCode('')

            await handleSearch(false)

        } catch (err) {

            setError(
                err.message ||
                'Unable to update technician.'
            )

        } finally {

            setActionLoading(false)
        }
    }

    // =================================================
    // GENERATE PARTNER ID
    // =================================================

    async function handleGeneratePartnerId(
        technician
    ) {

        const techId =
            technician?.techId

        if (!techId) {

            setError(
                'Technician ID is missing.'
            )

            return
        }

        const confirmed =
            window.confirm(
                'Are you sure you want to submit a request for Partner ID generation?'
            )

        if (!confirmed) {
            return
        }

        setActionLoading(true)
        setError('')
        setSuccessMessage('')

        try {

            const response =
                await generatePartnerId(
                    techId
                )

            if (response?.isSuccess === false) {

                throw new Error(
                    response.message ||
                    'Request submission failed.'
                )
            }

            setSuccessMessage(
                response?.message ||
                'Your request has been submitted. Please wait for confirmation from CRM.'
            )

            await handleSearch(false)

        } catch (err) {

            setError(
                err.message ||
                'Request submission failed.'
            )

        } finally {

            setActionLoading(false)
        }
    }

    // =================================================
    // DOWNLOAD
    // =================================================

    async function handleDownload() {

        // Download is available only for Role 1.
        if (!isRole1) {
            return
        }

        if (!regionCode) {

            setError(
                'Region is required.'
            )

            return
        }

        setDownloadLoading(true)
        setError('')
        setSuccessMessage('')

        try {

            const blob =
                await exportTechnicians({
                    regionCode,

                    branchCode:
                        isRole1
                            ? ''
                            : branchCode,

                    franchiseCode,

                    name:
                        technicianName.trim(),

                    mobileNo:
                        mobileNo.trim(),

                    status,

                    roleId
                })

            if (!blob || blob.size === 0) {

                throw new Error(
                    'No technician data available for download.'
                )
            }

            const url =
                window.URL.createObjectURL(blob)

            const link =
                document.createElement('a')

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

            // -----------------------------------------
            // SUCCESS MESSAGE
            // Automatically disappears after 2 seconds
            // -----------------------------------------

            setSuccessMessage(
                'Technician data downloaded successfully.'
            )

            setTimeout(() => {
                setSuccessMessage('')
            }, 2000)

        } catch (err) {

            setError(
                err.message ||
                'Unable to download technician data.'
            )

        } finally {

            setDownloadLoading(false)
        }
    }

    // =================================================
    // RENDER
    // =================================================

    return (
        <DashboardLayout
            title="Search Technician"
        >

            <div className="technician-page">

                {/* =====================================
                    ERROR MESSAGE
                ====================================== */}

                {error && (
                    <div className="technician-alert technician-alert-error">
                        {error}
                    </div>
                )}

                {/* =====================================
                    SUCCESS MESSAGE
                ====================================== */}

                {successMessage && (
                    <div className="technician-alert technician-alert-success">
                        {successMessage}
                    </div>
                )}

                {/* =====================================
                    FILTER BOX
                ====================================== */}

                <div className="technician-filter-box">

                    {/* REGION */}

                    <div className="technician-filter-item">

                        <label>
                            Region
                        </label>

                        <select
                            value={regionCode}
                            disabled
                            onChange={event =>
                                setRegionCode(
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                Select Region
                            </option>

                            {regions.map(
                                (region, index) => {

                                    const code =
                                        getRegionCode(
                                            region
                                        )

                                    const name =
                                        getRegionName(
                                            region
                                        )

                                    return (
                                        <option
                                            key={`${code}-${index}`}
                                            value={code}
                                        >
                                            {name || code}
                                        </option>
                                    )
                                }
                            )}

                        </select>

                    </div>

                    {/* BRANCH */}

                    <div className="technician-filter-item">

                        <label>
                            Branch
                        </label>

                        <select
                            value={branchCode}
                            onChange={
                                handleBranchChange
                            }
                            disabled={
                                isRole5 ||
                                isRole6
                            }
                        >

                            <option value="">
                                All
                            </option>

                            {branches.map(
                                (branch, index) => {

                                    const code =
                                        getBranchCode(
                                            branch
                                        )

                                    const name =
                                        getBranchName(
                                            branch
                                        )

                                    return (
                                        <option
                                            key={`${code}-${index}`}
                                            value={code}
                                        >
                                            {name || code}
                                        </option>
                                    )
                                }
                            )}

                        </select>

                    </div>

                    {/* FRANCHISE */}

                    <div className="technician-filter-item">

                        <label>
                            Franchise
                        </label>

                        <select
                            value={franchiseCode}
                            onChange={event =>
                                setFranchiseCode(
                                    event.target.value
                                )
                            }
                            disabled={isRole5}
                        >

                            <option value="">
                                All
                            </option>

                            {franchises.map(
                                (franchise, index) => {

                                    const code =
                                        getFranchiseCode(
                                            franchise
                                        )

                                    const name =
                                        getFranchiseName(
                                            franchise
                                        )

                                    return (
                                        <option
                                            key={`${code}-${index}`}
                                            value={code}
                                        >
                                            {name || code}
                                        </option>
                                    )
                                }
                            )}

                        </select>

                    </div>

                    {/* STATUS */}

                    <div className="technician-filter-item">

                        <label>
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={event =>
                                setStatus(
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                All
                            </option>

                            <option value="1">
                                Approved &amp; Activated By Trainer
                            </option>

                            <option value="0">
                                De-Activated By Trainer
                            </option>

                        </select>

                    </div>

                    {/* TECHNICIAN NAME */}

                    <div className="technician-filter-item">

                        <label>
                            Technician Name
                        </label>

                        <input
                            type="text"
                            value={technicianName}
                            onChange={event =>
                                setTechnicianName(
                                    event.target.value
                                )
                            }
                            placeholder="Technician Name"
                        />

                    </div>

                    {/* MOBILE */}

                    <div className="technician-filter-item">

                        <label>
                            Mobile
                        </label>

                        <input
                            type="text"
                            value={mobileNo}
                            onChange={event =>
                                setMobileNo(
                                    event.target.value
                                )
                            }
                            placeholder="Mobile"
                        />

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="technician-filter-actions">

                        {/* SEARCH - ALL ROLES */}

                        <button
                            type="button"
                            className="technician-search-button"
                            onClick={() =>
                                handleSearch(false)
                            }
                            disabled={
                                loading ||
                                actionLoading ||
                                downloadLoading
                            }
                        >
                            {loading
                                ? 'Searching...'
                                : 'Search'}
                        </button>

                        {/* DOWNLOAD - ROLE 1 ONLY */}

                        {isRole1 && (

                            <button
                                type="button"
                                className="technician-download-button"
                                onClick={
                                    handleDownload
                                }
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

                {/* =====================================
                    LOADING
                ====================================== */}

                {(loading || initialLoading) && (

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

                {/* =====================================
                    RECORD COUNT
                ====================================== */}

                {!loading &&
                    !initialLoading &&
                    technicians.length > 0 && (

                        <h3 className="technician-record-count">

                            {technicians.length}{' '}

                            record
                            {technicians.length !== 1
                                ? 's'
                                : ''}{' '}

                            found

                        </h3>
                    )}

                {/* =====================================
                    TABLE
                ====================================== */}

                {!loading &&
                    !initialLoading && (

                        <div className="technician-report-section">

                            <div className="technician-section-header">
                                Search Technician
                            </div>

                            {technicians.length > 0 ? (

                                <div className="technician-table-container">

                                    <table className="technician-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    SNo
                                                </th>

                                                <th>
                                                    Franchise
                                                </th>

                                                <th>
                                                    BpExt.
                                                </th>

                                                <th>
                                                    PartnerID
                                                </th>

                                                <th>
                                                    Name
                                                </th>

                                                <th>
                                                    MobileNo
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                {/* ACTION HEADER - ROLE 1/5 ONLY */}

                                                {!isRole6 && (
                                                    <th>
                                                        Action
                                                    </th>
                                                )}

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {technicians.map(
                                                (
                                                    technician,
                                                    index
                                                ) => {

                                                    const techId =
                                                        String(
                                                            technician?.techId ||
                                                            ''
                                                        )

                                                    const partnerId =
                                                        technician?.partnerId ||
                                                        ''

                                                    const isEditing =
                                                        editingTechId ===
                                                        techId

                                                    return (

                                                        <tr
                                                            key={
                                                                techId ||
                                                                index
                                                            }
                                                        >

                                                            {/* SNO */}

                                                            <td>
                                                                {index + 1}
                                                            </td>

                                                            {/* FRANCHISE */}

                                                            <td className="technician-franchise-cell">

                                                                {isEditing ? (

                                                                    <input
                                                                        type="text"
                                                                        className="technician-edit-input"
                                                                        value={
                                                                            editingFranchiseCode
                                                                        }
                                                                        onChange={
                                                                            event =>
                                                                                setEditingFranchiseCode(
                                                                                    event.target.value
                                                                                )
                                                                        }
                                                                        disabled={
                                                                            actionLoading
                                                                        }
                                                                    />

                                                                ) : (

                                                                    <span>
                                                                        {
                                                                            technician?.franchiseName ||
                                                                            '-'
                                                                        }
                                                                    </span>

                                                                )}

                                                            </td>

                                                            {/* BPEXT */}

                                                            <td>
                                                                {techId ||
                                                                    '-'}
                                                            </td>

                                                            {/* PARTNER ID */}

                                                            <td>

                                                                {partnerId &&
                                                                String(
                                                                    partnerId
                                                                ).length >
                                                                    1 ? (

                                                                    <span className="technician-partner-id">
                                                                        {
                                                                            partnerId
                                                                        }
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
                                                                        disabled={
                                                                            actionLoading
                                                                        }
                                                                        title="Generate Partner ID"
                                                                    >
                                                                        Generate
                                                                    </button>

                                                                )}

                                                            </td>

                                                            {/* NAME */}

                                                            <td>
                                                                {
                                                                    technician?.name ||
                                                                    '-'
                                                                }
                                                            </td>

                                                            {/* MOBILE */}

                                                            <td>
                                                                {
                                                                    technician?.mobileNo ||
                                                                    'NA'
                                                                }
                                                            </td>

                                                            {/* STATUS */}

                                                            <td>

                                                                <span
                                                                    className={getStatusClass(
                                                                        technician?.status
                                                                    )}
                                                                >
                                                                    {
                                                                        technician?.status ||
                                                                        '-'
                                                                    }
                                                                </span>

                                                            </td>

                                                            {/* ACTION - ROLE 1 / ROLE 5 ONLY */}

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
                                                                                disabled={
                                                                                    actionLoading
                                                                                }
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
                                                                                    disabled={
                                                                                        actionLoading
                                                                                    }
                                                                                >
                                                                                    {actionLoading
                                                                                        ? 'Saving...'
                                                                                        : 'Save'}
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    className="technician-cancel-button"
                                                                                    onClick={
                                                                                        handleCancelEdit
                                                                                    }
                                                                                    disabled={
                                                                                        actionLoading
                                                                                    }
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
                                                }
                                            )}

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