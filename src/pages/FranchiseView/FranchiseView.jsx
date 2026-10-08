import { useEffect, useState } from 'react'
import './FranchiseView.css'

import DashboardLayout
    from '../../components/DashboardLayout/DashboardLayout'

import {
    getFranchiseViewBranches,
    searchFranchises,
    updateFranchise
} from '../../api/franchiseViewApi'

import {
    getRegions,
    getFranchises
} from '../../api/reportsApi'


function FranchiseView() {

    // =========================================
    // SESSION VALUES
    // =========================================

    const sessionUserId =
        Number(
            sessionStorage.getItem('userId') || 0
        )

    const roleId =
        Number(
            sessionStorage.getItem('roleId') || 0
        )

    const sessionBpCode =
        sessionStorage.getItem('bpCode') || ''

    const sessionLoginId =
        sessionStorage.getItem('loginId') || ''


    // =========================================
    // REGION
    // =========================================

    const [regions, setRegions] =
        useState([])

    const [regionCode, setRegionCode] =
        useState('')

    const [regionLoading, setRegionLoading] =
        useState(false)


    // =========================================
    // SEARCH FORM
    // =========================================

    const [branch, setBranch] =
        useState('')

    const [franchiseCode, setFranchiseCode] =
        useState('')

    const [frCode, setFrCode] =
        useState('')

    const [franchiseName, setFranchiseName] =
        useState('')

    const [mobileNo, setMobileNo] =
        useState('')

    const [status, setStatus] =
        useState('')

    const [isFraOwnApp, setIsFraOwnApp] =
        useState('')


    // =========================================
    // BRANCHES
    // =========================================

    const [branches, setBranches] =
        useState([])

    const [branchLoading, setBranchLoading] =
        useState(false)


    // =========================================
    // FRANCHISE DROPDOWN
    // =========================================

    const [franchisesList, setFranchisesList] =
        useState([])

    const [franchiseLoading, setFranchiseLoading] =
        useState(false)


    // =========================================
    // FRANCHISE DATA
    // =========================================

    const [franchises, setFranchises] =
        useState([])

    const [loading, setLoading] =
        useState(false)


    // =========================================
    // MESSAGE
    // =========================================

    const [error, setError] =
        useState('')

    const [successMessage, setSuccessMessage] =
        useState('')


    // =========================================
    // EDIT STATE
    // =========================================

    const [editingFrCode, setEditingFrCode] =
        useState(null)

    const [editMobile, setEditMobile] =
        useState('')

    const [editEmail, setEditEmail] =
        useState('')

    const [editContactPerson, setEditContactPerson] =
        useState('')

    const [editStatus, setEditStatus] =
        useState('')

    const [updateLoading, setUpdateLoading] =
        useState(false)


    // =========================================
    // VALUE HELPER
    // =========================================

    const getValue = (
        item,
        ...keys
    ) => {

        if (!item) {
            return ''
        }

        const itemKeys =
            Object.keys(item)

        for (const key of keys) {

            const matchingKey =
                itemKeys.find(
                    itemKey =>
                        itemKey.toLowerCase() ===
                        key.toLowerCase()
                )

            if (
                matchingKey !== undefined &&
                item[matchingKey] !== null &&
                item[matchingKey] !== undefined
            ) {

                return item[matchingKey]

            }

        }

        return ''
    }


    // =========================================
    // STATUS TEXT
    // =========================================

    const getStatusText = (value) => {

        if (
            value === true ||
            value === 1 ||
            value === '1' ||
            String(value).toLowerCase() === 'active'
        ) {

            return 'Active'

        }

        return 'De-Activated'
    }


    // =========================================
    // STATUS VALUE FOR EDIT
    // =========================================

    const getStatusValue = (value) => {

        if (
            value === true ||
            value === 1 ||
            value === '1' ||
            String(value).toLowerCase() === 'active'
        ) {

            return '1'

        }

        return '0'
    }


    // =========================================
    // FR OWN APP TEXT
    // =========================================

    const getFraOwnAppText = (value) => {

        if (
            value === true ||
            value === 1 ||
            value === '1' ||
            String(value).toLowerCase() === 'enabled'
        ) {

            return 'Enabled'

        }

        return 'Disabled'
    }


    // =========================================
    // LOAD REGIONS
    // =========================================

    useEffect(() => {

        let cancelled = false


        const loadRegions = async () => {

            try {

                setRegionLoading(true)
                setError('')


                const data =
                    await getRegions(
                        '',
                        sessionUserId
                    )


                if (cancelled) {
                    return
                }


                const regionData =
                    Array.isArray(data)
                        ? data
                        : []


                setRegions(
                    regionData
                )


                // Initially:
                // Select Region
                setRegionCode('')

            }
            catch (error) {

                if (cancelled) {
                    return
                }


                console.error(
                    'Franchise region error:',
                    error
                )


                setRegions([])
                setRegionCode('')


                setError(
                    error.message ||
                    'Unable to load regions.'
                )

            }
            finally {

                if (!cancelled) {

                    setRegionLoading(
                        false
                    )

                }

            }

        }


        loadRegions()


        return () => {

            cancelled = true

        }

    }, [sessionUserId])


    // =========================================
    // LOAD BRANCHES AFTER REGION SELECTION
    // =========================================

    useEffect(() => {

        let cancelled = false


        const loadBranches = async () => {

            // ---------------------------------
            // No Region selected
            // ---------------------------------

            if (!regionCode) {

                setBranches([])
                setBranch('')

                setFranchisesList([])
                setFranchiseCode('')

                setBranchLoading(false)

                return

            }


            try {

                setBranchLoading(true)
                setError('')


                console.log(
                    'Loading branches for Region:',
                    regionCode
                )


                // ---------------------------------
                // IMPORTANT:
                //
                // Region is passed to Branch API.
                //
                // bpCode is empty because Branch
                // should be loaded according to
                // selected Region.
                // ---------------------------------

                const data =
                    await getFranchiseViewBranches(
                        sessionUserId,
                        regionCode
                    )


                if (cancelled) {
                    return
                }


                console.log(
                    'Franchise View Branch Response:',
                    data
                )


                if (!Array.isArray(data)) {

                    throw new Error(
                        'Invalid branch response.'
                    )

                }


                // ---------------------------------
                // Set branches for selected Region
                // ---------------------------------

                setBranches(data)


                // Default Branch = All
                setBranch('')


                // ---------------------------------
                // Region selected:
                //
                // Franchise is enabled but only
                // "All" should be visible.
                // ---------------------------------

                setFranchisesList([])
                setFranchiseCode('')

            }
            catch (error) {

                if (cancelled) {
                    return
                }


                console.error(
                    'Franchise branch error:',
                    error
                )


                setBranches([])
                setBranch('')

                setFranchisesList([])
                setFranchiseCode('')


                setError(
                    error.message ||
                    'Unable to load branches.'
                )

            }
            finally {

                if (!cancelled) {

                    setBranchLoading(
                        false
                    )

                }

            }

        }


        loadBranches()


        return () => {

            cancelled = true

        }

    }, [
        regionCode,
        roleId
    ])


    // =========================================
    // LOAD FRANCHISE DROPDOWN
    //
    // Region selected:
    //     Franchise enabled
    //     Only All shown
    //
    // Branch selected:
    //     Load franchise options
    // =========================================

    useEffect(() => {

        let cancelled = false


        const loadFranchises = async () => {

            // ---------------------------------
            // No Region
            // ---------------------------------

            if (!regionCode) {

                setFranchisesList([])
                setFranchiseCode('')

                setFranchiseLoading(false)

                return

            }


            // ---------------------------------
            // Region selected but Branch = All
            //
            // Do not call Franchise API.
            // Only "All" should be displayed.
            // ---------------------------------

            if (!branch) {

                setFranchisesList([])
                setFranchiseCode('')

                setFranchiseLoading(false)

                return

            }


            try {

                setFranchiseLoading(true)
                setError('')


                let bpCodeForFranchise =
                    branch

                let loginIdForFranchise =
                    ''


                // ---------------------------------
                // ROLE 5
                // ---------------------------------

                if (roleId === 5) {

                    bpCodeForFranchise =
                        sessionBpCode

                    loginIdForFranchise =
                        sessionLoginId

                }


                // ---------------------------------
                // ROLE 6
                // ---------------------------------

                else if (roleId === 6) {

                    bpCodeForFranchise =
                        sessionBpCode

                }


                console.log(
                    'Loading franchises:',
                    {
                        roleId,
                        bpCodeForFranchise,
                        loginIdForFranchise
                    }
                )


                const data =
                    await getFranchises(
                        roleId,
                        bpCodeForFranchise,
                        loginIdForFranchise
                    )


                if (cancelled) {
                    return
                }


                console.log(
                    'Franchise Dropdown Response:',
                    data
                )


                setFranchisesList(
                    Array.isArray(data)
                        ? data
                        : []
                )


                // ---------------------------------
                // ROLE 5:
                // Franchise is fixed
                // ---------------------------------

                if (roleId === 5) {

                    setFranchiseCode(
                        sessionLoginId || ''
                    )

                }
                else {

                    setFranchiseCode('')

                }

            }
            catch (error) {

                if (cancelled) {
                    return
                }


                console.error(
                    'Franchise dropdown error:',
                    error
                )


                setFranchisesList([])
                setFranchiseCode('')


                setError(
                    error.message ||
                    'Unable to load franchises.'
                )

            }
            finally {

                if (!cancelled) {

                    setFranchiseLoading(
                        false
                    )

                }

            }

        }


        loadFranchises()


        return () => {

            cancelled = true

        }

    }, [
        regionCode,
        branch,
        roleId,
        sessionBpCode,
        sessionLoginId
    ])


    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async () => {

        // ---------------------------------
        // Region is required
        // ---------------------------------

        if (!regionCode) {

            setError(
                'Region is required.'
            )

            return

        }


        try {

            setLoading(true)

            setError('')
            setSuccessMessage('')


            // ---------------------------------
            // IMPORTANT:
            //
            // franchiseCode is NOT included here
            // because searchFranchises() in
            // franchiseViewApi.js does not send
            // franchiseCode to the backend.
            // ---------------------------------

            const request = {

                regionCode:
                    regionCode,

                branchCode:
                    branch,

                frCode:
                    frCode.trim(),

                franchiseName:
                    franchiseName.trim(),

                mobileNo:
                    mobileNo.trim(),

                status:
                    status,

                isFraOwnApp:
                    isFraOwnApp

            }


            console.log(
                'Franchise Search Request:',
                request
            )


            const data =
                await searchFranchises(
                    request
                )


            console.log(
                'Franchise Search Response:',
                data
            )


            if (
                Array.isArray(data) &&
                data.length > 0
            ) {

                console.log(
                    'First Franchise:',
                    data[0]
                )


                console.log(
                    'First Franchise Code:',
                    getValue(
                        data[0],
                        'frcode',
                        'FrCode'
                    )
                )


                console.log(
                    'First Franchise Status:',
                    getValue(
                        data[0],
                        'isactive',
                        'IsActive'
                    )
                )

            }


            setFranchises(
                Array.isArray(data)
                    ? data
                    : []
            )

        }
        catch (error) {

            console.error(
                'Franchise search error:',
                error
            )


            setFranchises([])


            setError(
                error.message ||
                'Unable to search franchises.'
            )

        }
        finally {

            setLoading(false)

        }

    }


    // =========================================
    // EDIT
    // =========================================

    const handleEdit = (item) => {

        setError('')
        setSuccessMessage('')


        const currentFrCode =
            getValue(
                item,
                'frcode',
                'FrCode'
            )


        const currentStatus =
            getValue(
                item,
                'isactive',
                'IsActive'
            )


        setEditingFrCode(
            currentFrCode
        )


        setEditMobile(
            getValue(
                item,
                'Phoneno',
                'Phone',
                'MobileNo',
                'Mobileno'
            )
        )


        setEditEmail(
            getValue(
                item,
                'EmailID',
                'EmailId',
                'Emailid'
            )
        )


        setEditContactPerson(
            getValue(
                item,
                'CPerson',
                'ContactPerson'
            )
        )


        setEditStatus(
            getStatusValue(
                currentStatus
            )
        )

    }


    // =========================================
    // CANCEL EDIT
    // =========================================

    const handleCancel = () => {

        setEditingFrCode(null)

        setEditMobile('')
        setEditEmail('')
        setEditContactPerson('')
        setEditStatus('')

        setError('')
        setSuccessMessage('')

        handleSearch()

    }


    // =========================================
    // UPDATE
    // =========================================

    const handleUpdate = async () => {

        if (!editingFrCode) {

            return

        }


        if (!editStatus) {

            setError(
                'Status is required.'
            )

            return

        }


        try {

            setUpdateLoading(true)

            setError('')
            setSuccessMessage('')


            const request = {

                FrCode:
                    editingFrCode,

                MobileNo:
                    editMobile.trim(),

                EmailId:
                    editEmail.trim(),

                ContactPerson:
                    editContactPerson.trim(),

                Status:
                    editStatus,

                UpdatedBy:
                    sessionUserId

            }


            console.log(
                'Franchise Update Request:',
                request
            )


            const response =
                await updateFranchise(
                    request
                )


            console.log(
                'Franchise Update Response:',
                response
            )


            setEditingFrCode(null)

            setEditMobile('')
            setEditEmail('')
            setEditContactPerson('')
            setEditStatus('')


            setSuccessMessage(
                response?.message ||
                'STATUS UPDATED SUCCESSFULLY!'
            )


            await handleSearch()

        }
        catch (error) {

            console.error(
                'Franchise update error:',
                error
            )


            setError(
                error.message ||
                'Unable to update franchise.'
            )

        }
        finally {

            setUpdateLoading(false)

        }

    }


    // =========================================
    // RENDER
    // =========================================

    return (

        <DashboardLayout title="Franchise List">

            <div className="franchise-view-page">


                {/* =========================================
                    SEARCH BOX
                ========================================= */}

                <div className="franchise-view-box">

                    <div className="franchise-view-search-grid">


                        {/* =====================================
                            REGION
                        ===================================== */}

                        <div className="franchise-field">

                            <label>
                                Region
                            </label>


                            <select
                                value={regionCode}
                                onChange={(event) => {

                                    const selectedRegion =
                                        event.target.value


                                    // ---------------------------------
                                    // This changes regionCode.
                                    //
                                    // The Branch useEffect will
                                    // immediately load branches for
                                    // this selected Region.
                                    // ---------------------------------

                                    setRegionCode(
                                        selectedRegion
                                    )


                                    // Reset Branch
                                    setBranch('')


                                    // Reset Franchise
                                    setFranchisesList([])
                                    setFranchiseCode('')


                                    // Clear old search results
                                    setFranchises([])


                                    setError('')
                                    setSuccessMessage('')

                                }}
                                disabled={
                                    regionLoading
                                }
                            >

                                <option value="">
                                    Select Region
                                </option>


                                {
                                    regions.map(
                                        (item, index) => {

                                            const code =
                                                getValue(
                                                    item,
                                                    'regionCode',
                                                    'RegionCode',
                                                    'code',
                                                    'Code'
                                                )


                                            const name =
                                                getValue(
                                                    item,
                                                    'regionName',
                                                    'RegionName',
                                                    'name',
                                                    'Name'
                                                )


                                            return (

                                                <option
                                                    key={
                                                        code ||
                                                        `region-${index}`
                                                    }
                                                    value={code}
                                                >
                                                    {
                                                        name ||
                                                        code
                                                    }
                                                </option>

                                            )

                                        }
                                    )
                                }

                            </select>

                        </div>


                        {/* =====================================
                            BRANCH
                        ===================================== */}

                        <div className="franchise-field">

                            <label>
                                Branch
                            </label>


                            <select
                                value={branch}
                                onChange={(event) => {

                                    const selectedBranch =
                                        event.target.value


                                    setBranch(
                                        selectedBranch
                                    )


                                    // Reset Franchise
                                    setFranchiseCode('')
                                    setFranchisesList([])

                                }}
                                disabled={
                                    !regionCode ||
                                    branchLoading
                                }
                            >

                                <option value="">
                                    All
                                </option>


                                {
                                    branches.map(
                                        (item, index) => {

                                            const bpCode =
                                                getValue(
                                                    item,
                                                    'bpCode',
                                                    'BPCode',
                                                    'BPCODE',
                                                    'branchCode',
                                                    'BranchCode',
                                                    'Brcode',
                                                    'BrCode'
                                                )


                                            const branchName =
                                                getValue(
                                                    item,
                                                    'branchName',
                                                    'BranchName',
                                                    'branch',
                                                    'Branch',
                                                    'name',
                                                    'Name'
                                                )


                                            return (

                                                <option
                                                        key={bpCode || `branch-${index}`}
                                                        value={bpCode}
                                                    >
                                                        {branchName}
                                                </option>

                                            )

                                        }
                                    )
                                }

                            </select>

                        </div>


                        {/* =====================================
                            FRANCHISE
                        ===================================== */}

                        <div className="franchise-field">

                            <label>
                                Franchise
                            </label>


                            <select
                                value={
                                    franchiseCode
                                }
                                onChange={(event) =>
                                    setFranchiseCode(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    !regionCode ||
                                    franchiseLoading ||
                                    roleId === 5
                                }
                            >

                                <option value="">
                                    All
                                </option>


                                {
                                    franchisesList.map(
                                        (item, index) => {

                                            const code =
                                                getValue(
                                                    item,
                                                    'loginId',
                                                    'LoginID',
                                                    'frCode',
                                                    'FrCode',
                                                    'frcode',
                                                    'BPCode',
                                                    'bpCode'
                                                )


                                            const name =
                                                getValue(
                                                    item,
                                                    'franchiseName',
                                                    'FranchiseName',
                                                    'userName',
                                                    'UserName',
                                                    'name',
                                                    'Name'
                                                )


                                            return (

                                                <option
                                                    key={code || `franchise-${index}`}
                                                    value={code}
                                                >
                                                    {name}
                                                </option>

                                            )

                                        }
                                    )
                                }

                            </select>

                        </div>


                        {/* =====================================
                            FRANCHISE CODE
                        ===================================== */}

                        <div className="franchise-field">

                            <label>
                                Franchise Code
                            </label>


                            <input
                                type="text"
                                value={frCode}
                                onChange={(event) =>
                                    setFrCode(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* =====================================
                            FRANCHISE NAME
                        ===================================== */}

                        <div className="franchise-field">

                            <label>
                                Franchise Name
                            </label>


                            <input
                                type="text"
                                value={
                                    franchiseName
                                }
                                onChange={(event) =>
                                    setFranchiseName(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* =====================================
                            MOBILE
                        ===================================== */}

                        <div className="franchise-field">

                            <label>
                                Mobile Number
                            </label>


                            <input
                                type="text"
                                value={mobileNo}
                                maxLength="10"
                                onChange={(event) =>
                                    setMobileNo(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* =====================================
                            STATUS
                        ===================================== */}

                        <div className="franchise-field">

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

                                <option value="">
                                    All
                                </option>

                                <option value="1">
                                    Active
                                </option>

                                <option value="0">
                                    De-Activated
                                </option>

                            </select>

                        </div>


                        {/* =====================================
                            FR OWN APP
                        ===================================== */}

                        <div className="franchise-field">

                            <label>
                                FrOWNApp
                            </label>


                            <select
                                value={
                                    isFraOwnApp
                                }
                                onChange={(event) =>
                                    setIsFraOwnApp(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="">
                                    All
                                </option>

                                <option value="1">
                                    Enabled
                                </option>

                                <option value="0">
                                    Disabled
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* =========================================
                        SEARCH BUTTON
                    ========================================= */}

                    <div className="franchise-search-actions">

                        <button
                            type="button"
                            className="franchise-search-button"
                            onClick={
                                handleSearch
                            }
                            disabled={
                                loading
                            }
                        >

                            {
                                loading
                                    ? 'Searching...'
                                    : 'Search'
                            }

                        </button>

                    </div>

                </div>


                {/* =========================================
                    MESSAGE
                ========================================= */}

                {
                    error && (

                        <div className="franchise-message franchise-error">
                            {error}
                        </div>

                    )
                }


                {
                    successMessage && (

                        <div className="franchise-message franchise-success">
                            {successMessage}
                        </div>

                    )
                }


                {/* =========================================
                    TABLE
                ========================================= */}

                <div className="franchise-view-box">

                    <div className="franchise-table-wrapper">

                        <table className="franchise-table">

                            <thead>

                                <tr>

                                    <th>
                                        SNo.
                                    </th>

                                    <th>
                                        FrCode
                                    </th>

                                    <th>
                                        Franchise Name
                                    </th>

                                    <th>
                                        Mobile
                                    </th>

                                    <th>
                                        Email-ID
                                    </th>

                                    <th>
                                        CPerson
                                    </th>

                                    <th>
                                        FrOWNApp
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {
                                    loading && (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                className="franchise-loading"
                                            >
                                                Loading...
                                            </td>

                                        </tr>

                                    )
                                }


                                {
                                    !loading &&
                                    franchises.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                className="franchise-empty"
                                            >
                                                No records found.
                                            </td>

                                        </tr>

                                    )
                                }


                                {
                                    !loading &&
                                    franchises.map(
                                        (item, index) => {

                                            const currentFrCode =
                                                getValue(
                                                    item,
                                                    'frcode',
                                                    'FrCode'
                                                )


                                            const currentStatus =
                                                getValue(
                                                    item,
                                                    'isactive',
                                                    'IsActive'
                                                )


                                            const currentFraOwnApp =
                                                getValue(
                                                    item,
                                                    'is_fo_app_enabled',
                                                    'IsFraOwnApp'
                                                )


                                            const isEditing =
                                                editingFrCode ===
                                                currentFrCode


                                            return (

                                                <tr
                                                    key={
                                                        currentFrCode ||
                                                        index
                                                    }
                                                >

                                                    {/* SNO */}

                                                    <td>
                                                        {
                                                            index + 1
                                                        }
                                                    </td>


                                                    {/* FRCODE */}

                                                    <td className="franchise-code">

                                                        {
                                                            currentFrCode ||
                                                            '-'
                                                        }

                                                    </td>


                                                    {/* FRANCHISE NAME */}

                                                    <td>

                                                        {
                                                            getValue(
                                                                item,
                                                                'FranchiseName',
                                                                'franchiseName'
                                                            ) ||
                                                            '-'
                                                        }

                                                    </td>


                                                    {/* MOBILE */}

                                                    <td>

                                                        {
                                                            isEditing
                                                                ? (

                                                                    <input
                                                                        type="text"
                                                                        maxLength="10"
                                                                        value={
                                                                            editMobile
                                                                        }
                                                                        onChange={(event) =>
                                                                            setEditMobile(
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                    />

                                                                )
                                                                : (

                                                                    getValue(
                                                                        item,
                                                                        'Phoneno',
                                                                        'Phone',
                                                                        'MobileNo',
                                                                        'Mobileno'
                                                                    ) ||
                                                                    '-'

                                                                )
                                                        }

                                                    </td>


                                                    {/* EMAIL */}

                                                    <td>

                                                        {
                                                            isEditing
                                                                ? (

                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            editEmail
                                                                        }
                                                                        onChange={(event) =>
                                                                            setEditEmail(
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                    />

                                                                )
                                                                : (

                                                                    getValue(
                                                                        item,
                                                                        'EmailID',
                                                                        'EmailId',
                                                                        'Emailid'
                                                                    ) ||
                                                                    '-'

                                                                )
                                                        }

                                                    </td>


                                                    {/* CONTACT PERSON */}

                                                    <td>

                                                        {
                                                            isEditing
                                                                ? (

                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            editContactPerson
                                                                        }
                                                                        onChange={(event) =>
                                                                            setEditContactPerson(
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                    />

                                                                )
                                                                : (

                                                                    getValue(
                                                                        item,
                                                                        'CPerson',
                                                                        'ContactPerson'
                                                                    ) ||
                                                                    '-'

                                                                )
                                                        }

                                                    </td>


                                                    {/* FR OWN APP */}

                                                    <td>

                                                        <span
                                                            className={
                                                                getFraOwnAppText(
                                                                    currentFraOwnApp
                                                                ) === 'Enabled'
                                                                    ? 'franchise-badge franchise-active'
                                                                    : 'franchise-badge franchise-inactive'
                                                            }
                                                        >

                                                            {
                                                                getFraOwnAppText(
                                                                    currentFraOwnApp
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        {
                                                            isEditing
                                                                ? (

                                                                    <select
                                                                        value={
                                                                            editStatus
                                                                        }
                                                                        onChange={(event) =>
                                                                            setEditStatus(
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                    >

                                                                        <option value="1">
                                                                            Active
                                                                        </option>

                                                                        <option value="0">
                                                                            De-Activated
                                                                        </option>

                                                                    </select>

                                                                )
                                                                : (

                                                                    <span
                                                                        className={
                                                                            getStatusText(
                                                                                currentStatus
                                                                            ) === 'Active'
                                                                                ? 'franchise-badge franchise-active'
                                                                                : 'franchise-badge franchise-inactive'
                                                                        }
                                                                    >

                                                                        {
                                                                            getStatusText(
                                                                                currentStatus
                                                                            )
                                                                        }

                                                                    </span>

                                                                )
                                                        }

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        {
                                                            isEditing
                                                                ? (

                                                                    <div className="franchise-action-buttons">

                                                                        <button
                                                                            type="button"
                                                                            className="franchise-icon-button save"
                                                                            title="Update"
                                                                            onClick={
                                                                                handleUpdate
                                                                            }
                                                                            disabled={
                                                                                updateLoading
                                                                            }
                                                                        >
                                                                            💾
                                                                        </button>


                                                                        <button
                                                                            type="button"
                                                                            className="franchise-icon-button cancel"
                                                                            title="Cancel"
                                                                            onClick={
                                                                                handleCancel
                                                                            }
                                                                            disabled={
                                                                                updateLoading
                                                                            }
                                                                        >
                                                                            ✕
                                                                        </button>

                                                                    </div>

                                                                )
                                                                : (

                                                                    <button
                                                                        type="button"
                                                                        className="franchise-icon-button edit"
                                                                        title="Edit"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                item
                                                                            )
                                                                        }
                                                                    >
                                                                        ✎
                                                                    </button>

                                                                )
                                                        }

                                                    </td>

                                                </tr>

                                            )

                                        }
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


export default FranchiseView