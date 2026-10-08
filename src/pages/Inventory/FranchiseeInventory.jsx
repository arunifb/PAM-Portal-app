import { useEffect, useMemo, useRef, useState } from 'react'

import {
    getRegions,
    getBranches,
    getFranchises
} from '../../api/reportsApi'

import {
    searchInventory,
    exportInventory
} from '../../api/inventoryApi'

import DashboardLayout
    from '../../components/DashboardLayout/DashboardLayout'

import './FranchiseeInventory.css'


function FranchiseeInventory() {

    // =========================================
    // CONSTANT
    // =========================================

    const MAX_FRANCHISE_SELECTION = 10


    // =========================================
    // LOGGED-IN USER DETAILS
    // =========================================

    const roleId =
        sessionStorage.getItem('roleId') || ''

    const loginId =
        sessionStorage.getItem('loginId') || ''


    // =========================================
    // GET LOGGED-IN USER ID
    // =========================================

    const getViewerUserId = () => {

        const possibleKeys = [
            'userId',
            'UserId',
            'userid',
            'UserID'
        ]

        for (const key of possibleKeys) {

            const value =
                sessionStorage.getItem(key)

            if (value) {

                const parsedValue =
                    Number(value)

                if (
                    Number.isInteger(parsedValue) &&
                    parsedValue > 0
                ) {

                    return parsedValue

                }

            }

        }

        return 0

    }


    // =========================================
    // STATE
    // =========================================

    const [regions, setRegions] =
        useState([])

    const [regionCode, setRegionCode] =
        useState('')

    const [branches, setBranches] =
        useState([
            {
                bpCode: 'All',
                branchName: 'All'
            }
        ])

    const [selectedBranch, setSelectedBranch] =
        useState('All')

    const [franchises, setFranchises] =
        useState([])

    const [selectedCategory, setSelectedCategory] =
        useState('')

    const [selectedFranchises, setSelectedFranchises] =
        useState([])

    const [fgDescription, setFgDescription] =
        useState('')

    const [component, setComponent] =
        useState('')

    const [componentDescription, setComponentDescription] =
        useState('')

    const [inventoryData, setInventoryData] =
        useState([])

    const [loading, setLoading] =
        useState(false)

    const [loadingRegions, setLoadingRegions] =
        useState(false)

    const [loadingBranches, setLoadingBranches] =
        useState(false)

    const [franchiseLoading, setFranchiseLoading] =
        useState(false)

    const [exportLoading, setExportLoading] =
        useState(false)

    const [message, setMessage] =
        useState('')

    const [messageType, setMessageType] =
        useState('')


    // =========================================
    // MODAL STATE
    // =========================================

    const [showModal, setShowModal] =
        useState(false)

    const [modalMessage, setModalMessage] =
        useState('')


    // =========================================
    // FRANCHISE DROPDOWN
    // =========================================

    const [franchiseDropdownOpen, setFranchiseDropdownOpen] =
        useState(false)

    const franchiseDropdownRef =
        useRef(null)


    // =========================================
    // MODAL FUNCTIONS
    // =========================================

    function openModal(messageText) {

        setModalMessage(messageText)
        setShowModal(true)

    }


    function closeModal() {

        setShowModal(false)
        setModalMessage('')

    }


    // =========================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // =========================================

    useEffect(() => {

        function handleClickOutside(event) {

            if (
                franchiseDropdownRef.current &&
                !franchiseDropdownRef.current.contains(
                    event.target
                )
            ) {

                setFranchiseDropdownOpen(false)

            }

        }

        document.addEventListener(
            'mousedown',
            handleClickOutside
        )

        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            )

        }

    }, [])


    // =========================================
    // LOAD REGIONS
    // =========================================

    useEffect(() => {

        let isMounted = true


        async function loadRegions() {

            try {

                setLoadingRegions(true)

                setMessage('')
                setMessageType('')


                const viewerUserId =
                    getViewerUserId()


                if (!viewerUserId) {

                    setRegions([])

                    setMessage(
                        'User ID is not available.'
                    )

                    setMessageType('error')

                    return

                }


                const response =
                    await getRegions(
                        '',
                        viewerUserId
                    )


                if (!isMounted) {
                    return
                }


                const regionData =
                    Array.isArray(response)
                        ? response
                        : Array.isArray(response?.data)
                            ? response.data
                            : []


                setRegions(regionData)

            }
            catch (error) {

                if (!isMounted) {
                    return
                }


                console.error(
                    'Inventory region error:',
                    error
                )


                setRegions([])

                setMessage(
                    error.message ||
                    'Unable to load regions.'
                )

                setMessageType('error')

            }
            finally {

                if (isMounted) {

                    setLoadingRegions(false)

                }

            }

        }


        loadRegions()


        return () => {

            isMounted = false

        }

    }, [])


    // =========================================
    // LOAD BRANCHES
    // =========================================

    async function loadBranches(
        selectedRegionCode
    ) {

        if (!selectedRegionCode) {

            setBranches([
                {
                    bpCode: 'All',
                    branchName: 'All'
                }
            ])

            setSelectedBranch('All')

            return

        }


        try {

            setLoadingBranches(true)

            setMessage('')
            setMessageType('')


            const viewerUserId =
                getViewerUserId()


            if (!viewerUserId) {

                setBranches([
                    {
                        bpCode: 'All',
                        branchName: 'All'
                    }
                ])

                setSelectedBranch('All')

                setMessage(
                    'User ID is not available.'
                )

                setMessageType('error')

                return

            }


            const data =
                await getBranches(
                    viewerUserId,
                    selectedRegionCode
                )


            const branchData =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : []


            const filteredBranches =
                branchData.filter(
                    branch => {

                        const code =
                            String(
                                branch.BPCode ??
                                branch.bpCode ??
                                branch.BpCode ??
                                branch.branchCode ??
                                branch.BranchCode ??
                                ''
                            )
                                .trim()
                                .toLowerCase()


                        return code !== 'all'

                    }
                )


            setBranches([
                {
                    bpCode: 'All',
                    branchName: 'All'
                },
                ...filteredBranches
            ])


            setSelectedBranch('All')

        }
        catch (error) {

            console.error(
                'Inventory branch error:',
                error
            )


            setBranches([
                {
                    bpCode: 'All',
                    branchName: 'All'
                }
            ])


            setSelectedBranch('All')


            setMessage(
                error.message ||
                'Unable to load branch.'
            )

            setMessageType('error')

        }
        finally {

            setLoadingBranches(false)

        }

    }


    // =========================================
    // REGION CHANGE
    // =========================================

    async function handleRegionChange(event) {

        const value =
            event.target.value


        setRegionCode(value)

        setSelectedBranch('All')


        setBranches([
            {
                bpCode: 'All',
                branchName: 'All'
            }
        ])


        // Clear franchise data

        setFranchises([])

        setSelectedFranchises([])

        setFranchiseDropdownOpen(false)


        // Clear inventory results

        setInventoryData([])


        setMessage('')
        setMessageType('')


        if (value) {

            await loadBranches(value)

        }

    }


    // =========================================
    // LOAD FRANCHISES
    // =========================================

    useEffect(() => {

        if (
            !regionCode ||
            !selectedBranch
        ) {

            setFranchises([])

            setSelectedFranchises([])

            setFranchiseDropdownOpen(false)

            return

        }


        loadFranchises()

    }, [
        regionCode,
        selectedBranch
    ])


    async function loadFranchises() {

        try {

            setFranchiseLoading(true)

            setFranchises([])

            setSelectedFranchises([])

            setFranchiseDropdownOpen(false)


            if (
                !roleId ||
                !selectedBranch ||
                !loginId
            ) {

                throw new Error(
                    'Logged-in user details are missing. Please login again.'
                )

            }


            const data =
                await getFranchises(
                    roleId,
                    selectedBranch,
                    loginId
                )


            let franchiseList = []


            if (Array.isArray(data)) {

                franchiseList = data

            }
            else if (
                Array.isArray(data?.data)
            ) {

                franchiseList = data.data

            }


            setFranchises(
                franchiseList
            )

        }
        catch (error) {

            console.error(
                'Inventory franchise error:',
                error
            )

            setMessage(
                error.message ||
                'Unable to load franchises.'
            )

            setMessageType('error')

        }
        finally {

            setFranchiseLoading(false)

        }

    }


    // =========================================
    // NORMALIZE FRANCHISE OPTIONS
    // =========================================

    const normalizedFranchises =
        useMemo(() => {

            return franchises.map(
                franchise => ({

                    code:
                        franchise.Frcode ??
                        franchise.frCode ??
                        franchise.frcode ??
                        franchise.FrCode ??
                        '',

                    name:
                        franchise.FranchiseName ??
                        franchise.franchiseName ??
                        franchise.Franchise ??
                        ''

                })
            )

        }, [franchises])


    // =========================================
    // SELECT ALL
    // =========================================

    const allSelected =
        normalizedFranchises.length > 0 &&
        selectedFranchises.length ===
        normalizedFranchises.length


    function handleSelectAll(event) {

        if (event.target.checked) {

            const availableCodes =
                normalizedFranchises
                    .map(
                        franchise =>
                            franchise.code
                    )
                    .filter(Boolean)


            // Select maximum 10 only.
            // Do NOT open modal here.

            setSelectedFranchises(
                availableCodes.slice(
                    0,
                    MAX_FRANCHISE_SELECTION
                )
            )

        }
        else {

            setSelectedFranchises([])

        }

    }


    // =========================================
    // SELECT FRANCHISE
    // =========================================

    function handleFranchiseChange(
        franchiseCode
    ) {

        setSelectedFranchises(
            current => {

                // Unselect existing franchise

                if (
                    current.includes(
                        franchiseCode
                    )
                ) {

                    return current.filter(
                        code =>
                            code !== franchiseCode
                    )

                }


                // Maximum 10 check
                // Modal opens ONLY when trying
                // to select the 11th franchise.

                if (
                    current.length >=
                    MAX_FRANCHISE_SELECTION
                ) {

                    openModal(
                        'You can select maximum 10 franchises.'
                    )

                    return current

                }


                return [
                    ...current,
                    franchiseCode
                ]

            }
        )

    }


    // =========================================
    // FORMAT SELECTED FRANCHISE CODES
    // =========================================

    function getFormattedFranchiseCodes() {

        return selectedFranchises.join(',')

    }


    // =========================================
    // SEARCH
    // =========================================

    async function handleSearch() {

        setMessage('')
        setMessageType('')
        setInventoryData([])


        // =========================================
        // REGION VALIDATION
        // =========================================

        if (!regionCode) {

            setMessage(
                'Region is required.'
            )

            setMessageType('error')

            return

        }


        // =========================================
        // BRANCH VALIDATION
        // =========================================

        if (
            !selectedBranch ||
            selectedBranch === 'All'
        ) {

            setMessage(
                'Branch is required.'
            )

            setMessageType('error')

            return

        }


        // =========================================
        // FG CATEGORY VALIDATION
        // =========================================

        if (!selectedCategory) {

            setMessage(
                'FG Category is required.'
            )

            setMessageType('error')

            return

        }


        try {

            setLoading(true)


            const franchiseCodes =
                getFormattedFranchiseCodes()


            const request = {

                branchCode:
                    selectedBranch,

                materialCategory:
                    selectedCategory,

                franchiseCodes:
                    franchiseCodes,

                fgDescription:
                    fgDescription,

                component:
                    component,

                componentDescription:
                    componentDescription

            }


            console.log(
                'Inventory search request:',
                request
            )


            const data =
                await searchInventory(
                    request
                )


            if (
                data?.isSuccess === false
            ) {

                setMessage(
                    data.message ||
                    'No inventory records found.'
                )

                setMessageType('error')


                setInventoryData(
                    Array.isArray(data.data)
                        ? data.data
                        : []
                )

                return

            }


            const rows =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : []


            setInventoryData(rows)


            setMessage(
                data?.message ||
                `Total ${rows.length} number of records retrieved by search.`
            )

            setMessageType('success')

        }
        catch (error) {

            console.error(
                'Inventory search error:',
                error
            )

            setMessage(
                error.message ||
                'Unable to search inventory.'
            )

            setMessageType('error')

        }
        finally {

            setLoading(false)

        }

    }


    // =========================================
    // EXPORT
    // =========================================

    async function handleExport() {

        // =========================================
        // REGION VALIDATION
        // =========================================

        if (!regionCode) {

            setMessage(
                'Region is required.'
            )

            setMessageType('error')

            return

        }


        // =========================================
        // BRANCH VALIDATION
        // =========================================

        if (
            !selectedBranch ||
            selectedBranch === 'All'
        ) {

            setMessage(
                'Branch is required.'
            )

            setMessageType('error')

            return

        }


        // =========================================
        // FG CATEGORY VALIDATION
        // =========================================

        if (!selectedCategory) {

            setMessage(
                'FG Category is required.'
            )

            setMessageType('error')

            return

        }


        if (
            inventoryData.length === 0
        ) {

            setMessage(
                'Please search inventory before downloading.'
            )

            setMessageType('error')

            return

        }


        try {

            setExportLoading(true)


            const franchiseCodes =
                getFormattedFranchiseCodes()


            const request = {

                branchCode:
                    selectedBranch,

                materialCategory:
                    selectedCategory,

                franchiseCodes:
                    franchiseCodes,

                fgDescription:
                    fgDescription,

                component:
                    component,

                componentDescription:
                    componentDescription

            }


            console.log(
                'Inventory export request:',
                request
            )


            const blob =
                await exportInventory(
                    request
                )


            const url =
                window.URL.createObjectURL(
                    blob
                )


            const link =
                document.createElement('a')


            link.href = url

            link.download =
                'Inventory.xlsx'


            document.body.appendChild(link)

            link.click()

            link.remove()

            window.URL.revokeObjectURL(url)

        }
        catch (error) {

            console.error(
                'Inventory export error:',
                error
            )

            setMessage(
                error.message ||
                'Unable to download inventory.'
            )

            setMessageType('error')

        }
        finally {

            setExportLoading(false)

        }

    }


    // =========================================
    // TABLE COLUMNS
    // =========================================

    const columns =
        inventoryData.length > 0
            ? Object.keys(
                inventoryData[0]
            )
            : []


    // =========================================
    // FRANCHISE DISPLAY TEXT
    // =========================================

    const franchiseDisplayText =
        franchiseLoading
            ? 'Loading franchises...'
            : selectedFranchises.length === 0
                ? 'Select Franchise'
                : allSelected
                    ? 'All Franchises'
                    : `${selectedFranchises.length} selected`


    // =========================================
    // RENDER
    // =========================================

    return (

        <DashboardLayout
            title="Inventory"
        >

            <div className="inventory-page">

                {/* =====================================
                    SEARCH CARD
                ===================================== */}

                <div className="inventory-card">

                    <div className="inventory-form-grid">

                        {/* REGION */}

                        <div className="inventory-field">

                            <label>
                                Region
                                <span
                                    style={{
                                        color: 'red',
                                        marginLeft: '4px'
                                    }}
                                >
                                    *
                                </span>
                            </label>

                            <select
                                value={regionCode}
                                onChange={
                                    handleRegionChange
                                }
                                disabled={loadingRegions}
                            >

                                <option value="">
                                    Select Region
                                </option>

                                {regions.map(
                                    (region, index) => {

                                        const code =
                                            region.RegionCode ??
                                            region.regionCode ??
                                            region.Code ??
                                            region.code ??
                                            ''

                                        const name =
                                            region.RegionName ??
                                            region.regionName ??
                                            region.Name ??
                                            region.name ??
                                            ''

                                        return (

                                            <option
                                                key={`${code}-${index}`}
                                                value={code}
                                            >
                                                {name}
                                            </option>

                                        )

                                    }
                                )}

                            </select>

                        </div>


                        {/* BRANCH */}

                        <div className="inventory-field">

                            <label>
                                Branch
                                <span
                                    style={{
                                        color: 'red',
                                        marginLeft: '4px'
                                    }}
                                >
                                    *
                                </span>
                            </label>

                            <select
                                value={selectedBranch}
                                disabled={
                                    !regionCode ||
                                    loadingBranches
                                }
                                onChange={event => {

                                    setSelectedBranch(
                                        event.target.value
                                    )

                                    setInventoryData([])

                                    setMessage('')
                                    setMessageType('')

                                }}
                            >

                                {branches.map(
                                    (branch, index) => {

                                        const code =
                                            branch.BPCode ??
                                            branch.bpCode ??
                                            branch.BpCode ??
                                            branch.branchCode ??
                                            branch.BranchCode ??
                                            ''

                                        const name =
                                            branch.BranchName ??
                                            branch.branchName ??
                                            branch.Name ??
                                            branch.name ??
                                            ''

                                        return (

                                            <option
                                                key={`${code}-${index}`}
                                                value={code}
                                            >
                                                {name}
                                            </option>

                                        )

                                    }
                                )}

                            </select>

                        </div>


                        {/* FG CATEGORY */}

                        <div className="inventory-field">

                            <label>
                                FG Category
                                <span
                                    style={{
                                        color: 'red',
                                        marginLeft: '4px'
                                    }}
                                >
                                    *
                                </span>
                            </label>

                            <select
                                value={selectedCategory}
                                onChange={event => {

                                    setSelectedCategory(
                                        event.target.value
                                    )


                                    // Clear FG Category
                                    // validation message

                                    if (
                                        event.target.value
                                    ) {

                                        setMessage('')
                                        setMessageType('')

                                    }

                                }}
                            >

                                <option value="">
                                    Select FG Category
                                </option>

                                <option value="WM">
                                    Washing Machine
                                </option>

                                <option value="DW">
                                    Dish Washer
                                </option>

                                <option value="AC">
                                    Air Conditioner
                                </option>

                                <option value="MW">
                                    Micro Wave
                                </option>

                                <option value="CD">
                                    Cloth Dryer
                                </option>

                                <option value="KA">
                                    Kitchen Appliances
                                </option>

                                <option value="ACC">
                                    Accessories
                                </option>

                                <option value="ADD">
                                    Additive
                                </option>

                                <option value="WP">
                                    Water Purifier
                                </option>

                            </select>

                        </div>


                        {/* FRANCHISE */}

                        <div
                            className="inventory-field inventory-franchise-field"
                            ref={franchiseDropdownRef}
                        >

                            <label>
                                Franchise
                            </label>

                            <button
                                type="button"
                                className={
                                    franchiseDropdownOpen
                                        ? 'franchise-select-box open'
                                        : 'franchise-select-box'
                                }
                                onClick={() =>
                                    setFranchiseDropdownOpen(
                                        current =>
                                            !current
                                    )
                                }
                                disabled={
                                    franchiseLoading ||
                                    !regionCode
                                }
                            >

                                <span>
                                    {franchiseDisplayText}
                                </span>

                                <span
                                    className={
                                        franchiseDropdownOpen
                                            ? 'franchise-arrow open'
                                            : 'franchise-arrow'
                                    }
                                >
                                    ▾
                                </span>

                            </button>


                            {franchiseDropdownOpen && (

                                <div className="franchise-options">

                                    {franchiseLoading && (

                                        <div className="franchise-loading">
                                            Loading...
                                        </div>

                                    )}


                                    {!franchiseLoading &&
                                        normalizedFranchises.length === 0 && (

                                            <div className="franchise-empty">
                                                No franchises available
                                            </div>

                                        )
                                    }


                                    {!franchiseLoading &&
                                        normalizedFranchises.length > 0 && (

                                            <>

                                                <label className="franchise-option select-all-option">

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            allSelected
                                                        }
                                                        onChange={
                                                            handleSelectAll
                                                        }
                                                    />

                                                    <span>
                                                        Select All
                                                    </span>

                                                </label>


                                                {normalizedFranchises.map(
                                                    franchise => (

                                                        <label
                                                            className="franchise-option"
                                                            key={
                                                                franchise.code
                                                            }
                                                        >

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    selectedFranchises.includes(
                                                                        franchise.code
                                                                    )
                                                                }
                                                                onChange={() =>
                                                                    handleFranchiseChange(
                                                                        franchise.code
                                                                    )
                                                                }
                                                            />

                                                            <span>
                                                                {
                                                                    franchise.name
                                                                }
                                                            </span>

                                                        </label>

                                                    )
                                                )}

                                            </>

                                        )
                                    }

                                </div>

                            )}

                        </div>


                        {/* FG DESCRIPTION */}

                        <div className="inventory-field">

                            <label>
                                FG Description
                            </label>

                            <input
                                type="text"
                                value={
                                    fgDescription
                                }
                                maxLength={164}
                                placeholder="Enter FG description"
                                onChange={event =>
                                    setFgDescription(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* COMPONENT */}

                        <div className="inventory-field">

                            <label>
                                Component
                            </label>

                            <input
                                type="text"
                                value={component}
                                maxLength={50}
                                placeholder="Enter component"
                                onChange={event =>
                                    setComponent(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* COMPONENT DESCRIPTION */}

                        <div className="inventory-field">

                            <label>
                                Component Description
                            </label>

                            <input
                                type="text"
                                value={
                                    componentDescription
                                }
                                maxLength={164}
                                placeholder="Enter component description"
                                onChange={event =>
                                    setComponentDescription(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    {/* BUTTONS */}

                    <div className="inventory-actions">

                        <button
                            type="button"
                            className="inventory-search-button"
                            disabled={loading}
                            onClick={handleSearch}
                        >

                            {loading
                                ? 'Searching...'
                                : 'Search'
                            }

                        </button>


                        <button
                            type="button"
                            className="inventory-download-button"
                            disabled={
                                exportLoading ||
                                inventoryData.length === 0
                            }
                            onClick={handleExport}
                        >

                            {exportLoading
                                ? 'Downloading...'
                                : 'Download'
                            }

                        </button>

                    </div>

                </div>


                {/* =====================================
                    MESSAGE
                ===================================== */}

                {message && (

                    <div
                        className={`inventory-message ${messageType}`}
                    >

                        {message}

                    </div>

                )}


                {/* =====================================
                    RESULTS
                ===================================== */}

                {inventoryData.length > 0 && (

                    <div className="inventory-results-card">

                        <div className="inventory-results-header">

                            <div>

                                <h2>
                                    Search Results
                                </h2>

                                <span>
                                    {
                                        inventoryData.length
                                    } records
                                </span>

                            </div>

                        </div>


                        <div className="inventory-table-wrapper">

                            <table className="inventory-table">

                                <thead>

                                    <tr>

                                        <th>
                                            S.No.
                                        </th>

                                        {columns.map(
                                            column => (

                                                <th
                                                    key={column}
                                                >
                                                    {column}
                                                </th>

                                            )
                                        )}

                                    </tr>

                                </thead>


                                <tbody>

                                    {inventoryData.map(
                                        (
                                            row,
                                            rowIndex
                                        ) => (

                                            <tr
                                                key={
                                                    rowIndex
                                                }
                                            >

                                                <td>
                                                    {
                                                        rowIndex + 1
                                                    }
                                                </td>

                                                {columns.map(
                                                    column => (

                                                        <td
                                                            key={`${rowIndex}-${column}`}
                                                        >
                                                            {
                                                                row[
                                                                    column
                                                                ] ?? ''
                                                            }
                                                        </td>

                                                    )
                                                )}

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}


                {/* =====================================
                    MAX 10 FRANCHISE MODAL
                ===================================== */}

                {showModal && (

                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor:
                                'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 99999
                        }}
                        onClick={closeModal}
                    >

                        <div
                            style={{
                                width: '420px',
                                maxWidth: '90%',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                boxShadow:
                                    '0 10px 30px rgba(0, 0, 0, 0.25)',
                                overflow: 'hidden'
                            }}
                            onClick={event =>
                                event.stopPropagation()
                            }
                        >

                            {/* MODAL HEADER */}

                            <div
                                style={{
                                    padding:
                                        '16px 20px',
                                    borderBottom:
                                        '1px solid #e5e5e5',
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'space-between'
                                }}
                            >

                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize:
                                            '18px',
                                        fontWeight: 600
                                    }}
                                >
                                    Validation
                                </h3>


                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        border: 'none',
                                        background:
                                            'transparent',
                                        fontSize:
                                            '24px',
                                        cursor:
                                            'pointer',
                                        lineHeight: 1,
                                        padding:
                                            '0 4px'
                                    }}
                                >
                                    ×
                                </button>

                            </div>


                            {/* MODAL BODY */}

                            <div
                                style={{
                                    padding:
                                        '24px 20px',
                                    fontSize:
                                        '15px',
                                    color: '#333'
                                }}
                            >

                                {modalMessage}

                            </div>


                            {/* MODAL FOOTER */}

                            <div
                                style={{
                                    padding:
                                        '12px 20px 18px',
                                    display: 'flex',
                                    justifyContent:
                                        'flex-end'
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        minWidth:
                                            '80px',
                                        padding:
                                            '8px 18px',
                                        border: 'none',
                                        borderRadius:
                                            '5px',
                                        backgroundColor:
                                            '#0d6efd',
                                        color:
                                            '#ffffff',
                                        cursor:
                                            'pointer',
                                        fontSize:
                                            '14px'
                                    }}
                                >
                                    OK
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </DashboardLayout>

    )

}


export default FranchiseeInventory