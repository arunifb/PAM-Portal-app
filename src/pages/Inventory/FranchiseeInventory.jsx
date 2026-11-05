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
    // CONSTANTS
    // =========================================

    const MAX_FRANCHISE_SELECTION = 10


    // =========================================
    // LOGGED-IN USER DETAILS
    // Roles are read from sessionStorage.roles,
    // matching the working DigitalICR.jsx.
    // =========================================

    const loginId =
        sessionStorage.getItem('loginId') || ''

    const sessionRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const sessionBpCode =
        sessionStorage.getItem('bpCode') || ''

    let storedRoles = []

    try {
        const parsedRoles = JSON.parse(
            sessionStorage.getItem('roles') || '[]'
        )

        if (Array.isArray(parsedRoles)) {
            storedRoles = parsedRoles.map(role =>
                String(role).trim()
            )
        } else if (
            parsedRoles !== null &&
            parsedRoles !== undefined
        ) {
            storedRoles = [String(parsedRoles).trim()]
        }
    } catch (error) {
        console.error(
            'Unable to parse stored roles:',
            error
        )
    }

    const isRegionRole = storedRoles.includes('1')
    const isFranchiseRole = storedRoles.includes('5')
    const isBranchRole = storedRoles.includes('6')


    // =========================================
    // GET LOGGED-IN USER ID
    // =========================================

    function getViewerUserId() {

        const possibleKeys = [
            'userId',
            'UserId',
            'userid',
            'UserID'
        ]

        for (const key of possibleKeys) {

            const value = sessionStorage.getItem(key)

            if (value) {

                const parsedValue = Number(value)

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
    // API FIELD HELPERS
    // =========================================

    function getApiField(item, fieldNames) {

        if (!item || typeof item !== 'object') {
            return ''
        }

        for (const fieldName of fieldNames) {

            const matchingKey = Object.keys(item).find(
                key =>
                    key.toLowerCase() ===
                    fieldName.toLowerCase()
            )

            if (
                matchingKey &&
                item[matchingKey] !== null &&
                item[matchingKey] !== undefined
            ) {
                return String(
                    item[matchingKey]
                ).trim()
            }
        }

        return ''
    }


    function getResponseArray(response, propertyName = '') {

        if (Array.isArray(response)) {
            return response
        }

        if (Array.isArray(response?.data)) {
            return response.data
        }

        if (Array.isArray(response?.data?.data)) {
            return response.data.data
        }

        if (
            propertyName &&
            Array.isArray(response?.[propertyName])
        ) {
            return response[propertyName]
        }

        if (
            propertyName &&
            Array.isArray(response?.data?.[propertyName])
        ) {
            return response.data[propertyName]
        }

        return []
    }


    // =========================================
    // STATE
    // =========================================

    const [regions, setRegions] = useState([])

    const [regionCode, setRegionCode] = useState(
        isBranchRole || isFranchiseRole
            ? sessionRegionCode
            : ''
    )

    const [branches, setBranches] = useState(
        isBranchRole
            ? []
            : [{ bpCode: 'All', branchName: 'All' }]
    )

    const [selectedBranch, setSelectedBranch] =
        useState(
            isBranchRole
                ? sessionBpCode
                : 'All'
        )

    const [franchises, setFranchises] = useState([])

    const [selectedCategory, setSelectedCategory] =
        useState('')

    const [selectedFranchises, setSelectedFranchises] =
        useState([])

    const [fgDescription, setFgDescription] =
        useState('')

    const [component, setComponent] = useState('')

    const [componentDescription, setComponentDescription] =
        useState('')

    const [inventoryData, setInventoryData] = useState([])

    const [loading, setLoading] = useState(false)

    const [loadingRegions, setLoadingRegions] =
        useState(false)

    const [loadingBranches, setLoadingBranches] =
        useState(false)

    const [franchiseLoading, setFranchiseLoading] =
        useState(false)

    const [exportLoading, setExportLoading] =
        useState(false)

    const [message, setMessage] = useState('')

    const [messageType, setMessageType] = useState('')


    // =========================================
    // MODAL STATE
    // =========================================

    const [showModal, setShowModal] = useState(false)

    const [modalMessage, setModalMessage] = useState('')


    // =========================================
    // FRANCHISE DROPDOWN
    // =========================================

    const [franchiseDropdownOpen, setFranchiseDropdownOpen] =
        useState(false)

    const franchiseDropdownRef = useRef(null)


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
    // LOAD BRANCHES
    // Role 6 preselects the logged-in user's branch.
    // =========================================

    async function loadBranches(
        selectedRegionCode,
        isCurrent = () => true
    ) {

        if (!selectedRegionCode) {

            if (!isCurrent()) return

            setBranches(
                isBranchRole
                    ? []
                    : [{ bpCode: 'All', branchName: 'All' }]
            )

            setSelectedBranch(
                isBranchRole ? '' : 'All'
            )

            return
        }

        try {

            setLoadingBranches(true)

            const viewerUserId = getViewerUserId()

            if (!viewerUserId) {

                if (!isCurrent()) return

                setBranches(
                    isBranchRole
                        ? []
                        : [{ bpCode: 'All', branchName: 'All' }]
                )

                setSelectedBranch(
                    isBranchRole ? '' : 'All'
                )

                setMessage('User ID is not available.')
                setMessageType('error')

                return
            }

            const response = await getBranches(
                viewerUserId,
                selectedRegionCode
            )

            if (!isCurrent()) return

            const branchData = getResponseArray(
                response,
                'branches'
            )

            const validBranches = branchData.filter(branch => {

                const code = getApiField(branch, [
                    'bpCode',
                    'BPCode',
                    'BpCode',
                    'branchCode',
                    'BranchCode'
                ])

                const name = getApiField(branch, [
                    'branchName',
                    'BranchName',
                    'name',
                    'Name'
                ])

                return (
                    Boolean(code) &&
                    Boolean(name) &&
                    code.toLowerCase() !== 'all'
                )
            })


            // =========================================
            // ROLE 6: MATCH SESSION BP CODE
            // =========================================

            if (isBranchRole) {

                setBranches(validBranches)

                const normalizedSessionBpCode =
                    String(sessionBpCode)
                        .trim()
                        .toLowerCase()

                const matchingBranch = validBranches.find(
                    branch => {

                        const code = getApiField(branch, [
                            'bpCode',
                            'BPCode',
                            'BpCode',
                            'branchCode',
                            'BranchCode'
                        ])

                        return (
                            code.toLowerCase() ===
                            normalizedSessionBpCode
                        )
                    }
                )

                if (matchingBranch) {

                    const matchedBranchCode = getApiField(
                        matchingBranch,
                        [
                            'bpCode',
                            'BPCode',
                            'BpCode',
                            'branchCode',
                            'BranchCode'
                        ]
                    )

                    setSelectedBranch(matchedBranchCode)

                } else {

                    setSelectedBranch(sessionBpCode)

                    console.warn(
                        'Role 6 branch could not be matched.',
                        {
                            sessionBpCode,
                            selectedRegionCode,
                            availableBranches: validBranches
                        }
                    )
                }

            } else {

                // Preserve existing behavior for other roles.
                setBranches([
                    {
                        bpCode: 'All',
                        branchName: 'All'
                    },
                    ...validBranches
                ])

                setSelectedBranch('All')
            }

        } catch (error) {

            if (!isCurrent()) return

            console.error(
                'Inventory branch error:',
                error
            )

            setBranches(
                isBranchRole
                    ? []
                    : [{ bpCode: 'All', branchName: 'All' }]
            )

            setSelectedBranch(
                isBranchRole ? '' : 'All'
            )

            setMessage(
                error.message || 'Unable to load branches.'
            )

            setMessageType('error')

        } finally {

            if (isCurrent()) {
                setLoadingBranches(false)
            }
        }
    }


    // =========================================
    // LOAD REGIONS
    // Role 6 matches the session region before
    // loading its branch list.
    // =========================================

    useEffect(() => {

        let isMounted = true

        async function loadInitialRegions() {

            try {

                setLoadingRegions(true)

                const viewerUserId = getViewerUserId()

                if (!viewerUserId) {

                    if (!isMounted) return

                    setRegions([])

                    setMessage('User ID is not available.')
                    setMessageType('error')

                    return
                }

                const response = await getRegions(
                    '',
                    viewerUserId
                )

                if (!isMounted) return

                const regionData = getResponseArray(
                    response,
                    'regions'
                )

                setRegions(regionData)

                if (isBranchRole || isFranchiseRole) {

                    const normalizedSessionRegion =
                        String(sessionRegionCode)
                            .trim()
                            .toLowerCase()

                    const matchingRegion = regionData.find(
                        region => {

                            const code = getApiField(region, [
                                'regionCode',
                                'RegionCode',
                                'code',
                                'Code'
                            ])

                            return (
                                code.toLowerCase() ===
                                normalizedSessionRegion
                            )
                        }
                    )

                    if (!matchingRegion) {

                        setRegionCode('')

                        setBranches(
                            isBranchRole
                                ? []
                                : [{
                                    bpCode: 'All',
                                    branchName: 'All'
                                }]
                        )

                        setSelectedBranch(
                            isBranchRole ? '' : 'All'
                        )

                        console.warn(
                            'Logged-in user region could not be matched.',
                            {
                                sessionRegionCode,
                                availableRegions: regionData
                            }
                        )

                        setMessage(
                            'Your region could not be matched. Please check the logged-in user region code.'
                        )

                        setMessageType('error')

                        return
                    }

                    const matchedRegionCode = getApiField(
                        matchingRegion,
                        [
                            'regionCode',
                            'RegionCode',
                            'code',
                            'Code'
                        ]
                    )

                    setRegionCode(matchedRegionCode)

                    if (isBranchRole) {

                        await loadBranches(
                            matchedRegionCode,
                            () => isMounted
                        )
                    }
                }

            } catch (error) {

                if (!isMounted) return

                console.error(
                    'Inventory region error:',
                    error
                )

                setRegions([])

                setMessage(
                    error.message || 'Unable to load regions.'
                )

                setMessageType('error')

            } finally {

                if (isMounted) {
                    setLoadingRegions(false)
                }
            }
        }

        loadInitialRegions()

        return () => {
            isMounted = false
        }

    }, [])


    // =========================================
    // REGION CHANGE
    // =========================================

    async function handleRegionChange(event) {

        const value = event.target.value

        setRegionCode(value)

        setSelectedBranch('All')

        setBranches([
            {
                bpCode: 'All',
                branchName: 'All'
            }
        ])

        setFranchises([])
        setSelectedFranchises([])
        setFranchiseDropdownOpen(false)

        setInventoryData([])

        setMessage('')
        setMessageType('')

        if (value) {
            await loadBranches(value)
        }
    }


    // =========================================
    // LOAD FRANCHISES WHEN REGION / BRANCH CHANGES
    // =========================================

    useEffect(() => {

        if (!regionCode || !selectedBranch) {

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


    // =========================================
    // LOAD FRANCHISES
    // =========================================

    async function loadFranchises() {

        try {

            setFranchiseLoading(true)

            setFranchises([])
            setSelectedFranchises([])
            setFranchiseDropdownOpen(false)

            if (
                !selectedBranch ||
                !loginId
            ) {
                throw new Error(
                    'Logged-in user details are missing. Please login again.'
                )
            }

            const franchiseBpCode = isBranchRole
                ? sessionBpCode || '0'
                : selectedBranch

            const response = await getFranchises(
                franchiseBpCode,
                loginId
            )

            const franchiseList = getResponseArray(
                response,
                'franchises'
            )

            setFranchises(franchiseList)

        } catch (error) {

            console.error(
                'Inventory franchise error:',
                error
            )

            setFranchises([])

            setMessage(
                error.message || 'Unable to load franchises.'
            )

            setMessageType('error')

        } finally {

            setFranchiseLoading(false)
        }
    }


    // =========================================
    // NORMALIZE FRANCHISE OPTIONS
    // =========================================

    const normalizedFranchises = useMemo(() => {

        return franchises.map(franchise => ({

            code: getApiField(franchise, [
                'Frcode',
                'frCode',
                'frcode',
                'FrCode'
            ]),

            name: getApiField(franchise, [
                'FranchiseName',
                'franchiseName',
                'Franchise'
            ])

        }))

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

            const availableCodes = normalizedFranchises
                .map(franchise => franchise.code)
                .filter(Boolean)

            setSelectedFranchises(
                availableCodes.slice(
                    0,
                    MAX_FRANCHISE_SELECTION
                )
            )

        } else {

            setSelectedFranchises([])

        }
    }


    // =========================================
    // SELECT FRANCHISE
    // =========================================

    function handleFranchiseChange(franchiseCode) {

        setSelectedFranchises(current => {

            if (current.includes(franchiseCode)) {

                return current.filter(
                    code => code !== franchiseCode
                )
            }

            if (
                current.length >= MAX_FRANCHISE_SELECTION
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
        })
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

        if (!regionCode) {
            setMessage('Region is required.')
            setMessageType('error')
            return
        }

        if (!selectedBranch || selectedBranch === 'All') {
            setMessage('Branch is required.')
            setMessageType('error')
            return
        }

        if (!selectedCategory) {
            setMessage('FG Category is required.')
            setMessageType('error')
            return
        }

        try {

            setLoading(true)

            const request = {
                branchCode: selectedBranch,
                materialCategory: selectedCategory,
                franchiseCodes: getFormattedFranchiseCodes(),
                fgDescription,
                component,
                componentDescription
            }

            console.log(
                'Inventory search request:',
                request
            )

            const data = await searchInventory(request)

            if (data?.isSuccess === false) {

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

            const rows = Array.isArray(data)
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

        } catch (error) {

            console.error(
                'Inventory search error:',
                error
            )

            setMessage(
                error.message || 'Unable to search inventory.'
            )

            setMessageType('error')

        } finally {

            setLoading(false)
        }
    }


    // =========================================
    // EXPORT
    // =========================================

    async function handleExport() {

        if (!regionCode) {
            setMessage('Region is required.')
            setMessageType('error')
            return
        }

        if (!selectedBranch || selectedBranch === 'All') {
            setMessage('Branch is required.')
            setMessageType('error')
            return
        }

        if (!selectedCategory) {
            setMessage('FG Category is required.')
            setMessageType('error')
            return
        }

        if (inventoryData.length === 0) {

            setMessage(
                'Please search inventory before downloading.'
            )

            setMessageType('error')
            return
        }

        try {

            setExportLoading(true)

            const request = {
                branchCode: selectedBranch,
                materialCategory: selectedCategory,
                franchiseCodes: getFormattedFranchiseCodes(),
                fgDescription,
                component,
                componentDescription
            }

            console.log(
                'Inventory export request:',
                request
            )

            const blob = await exportInventory(request)

            const url = window.URL.createObjectURL(blob)

            const link = document.createElement('a')

            link.href = url
            link.download = 'Inventory.xlsx'

            document.body.appendChild(link)

            link.click()
            link.remove()

            window.URL.revokeObjectURL(url)

        } catch (error) {

            console.error(
                'Inventory export error:',
                error
            )

            setMessage(
                error.message || 'Unable to download inventory.'
            )

            setMessageType('error')

        } finally {

            setExportLoading(false)
        }
    }


    // =========================================
    // TABLE COLUMNS
    // =========================================

    const columns =
        inventoryData.length > 0
            ? Object.keys(inventoryData[0])
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

        <DashboardLayout>

            <div className="inventory-page">

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
                                onChange={handleRegionChange}
                                disabled={
                                    isBranchRole ||
                                    isFranchiseRole ||
                                    loadingRegions
                                }
                            >

                                <option value="">
                                    Select Region
                                </option>

                                {regions.map((region, index) => {

                                    const code = getApiField(region, [
                                        'RegionCode',
                                        'regionCode',
                                        'Code',
                                        'code'
                                    ])

                                    const name = getApiField(region, [
                                        'RegionName',
                                        'regionName',
                                        'Name',
                                        'name'
                                    ])

                                    return (

                                        <option
                                            key={`${code}-${index}`}
                                            value={code}
                                        >
                                            {name}
                                        </option>

                                    )
                                })}

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
                                    isBranchRole ||
                                    isFranchiseRole ||
                                    !regionCode ||
                                    loadingBranches
                                }
                                onChange={event => {

                                    setSelectedBranch(
                                        event.target.value
                                    )

                                    setFranchises([])
                                    setSelectedFranchises([])

                                    setInventoryData([])

                                    setMessage('')
                                    setMessageType('')

                                }}
                            >

                                {/* {!isBranchRole &&
                                    !isFranchiseRole && (
                                        <option value="All">
                                            All
                                        </option>
                                    )
                                } */}

                                {branches.map((branch, index) => {

                                    const code = getApiField(branch, [
                                        'BPCode',
                                        'BpCode',
                                        'bpCode',
                                        'BranchCode',
                                        'branchCode'
                                    ])

                                    const name = getApiField(branch, [
                                        'BranchName',
                                        'branchName',
                                        'Name',
                                        'name'
                                    ])

                                    return (

                                        <option
                                            key={`${code}-${index}`}
                                            value={code}
                                        >
                                            {name}
                                        </option>

                                    )
                                })}

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

                                    if (event.target.value) {
                                        setMessage('')
                                        setMessageType('')
                                    }

                                }}
                            >

                                <option value="">
                                    Select FG Category
                                </option>

                                <option value="WM">Washing Machine</option>
                                <option value="DW">Dish Washer</option>
                                <option value="AC">Air Conditioner</option>
                                <option value="MW">Micro Wave</option>
                                <option value="CD">Cloth Dryer</option>
                                <option value="KA">Kitchen Appliances</option>
                                <option value="ACC">Accessories</option>
                                <option value="ADD">Additive</option>
                                <option value="WP">Water Purifier</option>

                            </select>

                        </div>


                        {/* FRANCHISE */}

                        <div
                            className="inventory-field inventory-franchise-field"
                            ref={franchiseDropdownRef}
                        >

                            <label>Franchise</label>

                            <button
                                type="button"
                                className={
                                    franchiseDropdownOpen
                                        ? 'franchise-select-box open'
                                        : 'franchise-select-box'
                                }
                                onClick={() =>
                                    setFranchiseDropdownOpen(
                                        current => !current
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
                                                        checked={allSelected}
                                                        onChange={handleSelectAll}
                                                    />

                                                    <span>Select All</span>

                                                </label>

                                                {normalizedFranchises.map(franchise => (

                                                    <label
                                                        className="franchise-option"
                                                        key={franchise.code}
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
                                                            {franchise.name}
                                                        </span>

                                                    </label>

                                                ))}

                                            </>

                                        )
                                    }

                                </div>

                            )}

                        </div>


                        {/* FG DESCRIPTION */}

                        <div className="inventory-field">

                            <label>FG Description</label>

                            <input
                                type="text"
                                value={fgDescription}
                                maxLength={164}
                                placeholder="Enter FG description"
                                onChange={event =>
                                    setFgDescription(event.target.value)
                                }
                            />

                        </div>


                        {/* COMPONENT */}

                        <div className="inventory-field">

                            <label>Component</label>

                            <input
                                type="text"
                                value={component}
                                maxLength={50}
                                placeholder="Enter component"
                                onChange={event =>
                                    setComponent(event.target.value)
                                }
                            />

                        </div>


                        {/* COMPONENT DESCRIPTION */}

                        <div className="inventory-field">

                            <label>Component Description</label>

                            <input
                                type="text"
                                value={componentDescription}
                                maxLength={164}
                                placeholder="Enter component description"
                                onChange={event =>
                                    setComponentDescription(event.target.value)
                                }
                            />

                        </div>

                    </div>


                    {/* BUTTONS */}

                    <div className="inventory-actions">

                        <button
                            type="button"
                            className="btn-search inventory-search-button"
                            disabled={loading}
                            onClick={handleSearch}
                        >
                            {loading ? 'Searching...' : 'Search'}
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


                {/* MESSAGE */}

                {message && (

                    <div
                        className={`inventory-message ${messageType}`}
                    >
                        {message}
                    </div>

                )}


                {/* RESULTS */}

                {inventoryData.length > 0 && (

                    <div className="inventory-results-card">

                        <div className="inventory-results-header">

                            <div>
                                <h2>Search Results</h2>

                                <span>
                                    {inventoryData.length} records
                                </span>
                            </div>

                        </div>

                        <div className="inventory-table-wrapper">

                            <table className="inventory-table">

                                <thead>

                                    <tr>
                                        <th>S.No.</th>

                                        {columns.map(column => (
                                            <th key={column}>
                                                {column}
                                            </th>
                                        ))}

                                    </tr>

                                </thead>

                                <tbody>

                                    {inventoryData.map((row, rowIndex) => (

                                        <tr key={rowIndex}>

                                            <td>{rowIndex + 1}</td>

                                            {columns.map(column => (
                                                <td key={`${rowIndex}-${column}`}>
                                                    {row[column] ?? ''}
                                                </td>
                                            ))}

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}


                {/* MAX 10 FRANCHISE MODAL */}

                {showModal && (

                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
                                overflow: 'hidden'
                            }}
                            onClick={event => event.stopPropagation()}
                        >

                            <div
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid #e5e5e5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >

                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '18px',
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
                                        background: 'transparent',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        lineHeight: 1,
                                        padding: '0 4px'
                                    }}
                                >
                                    ×
                                </button>

                            </div>


                            <div
                                style={{
                                    padding: '24px 20px',
                                    fontSize: '15px',
                                    color: '#333'
                                }}
                            >
                                {modalMessage}
                            </div>


                            <div
                                style={{
                                    padding: '12px 20px 18px',
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        minWidth: '80px',
                                        padding: '8px 18px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        backgroundColor: '#0d6efd',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        fontSize: '14px'
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