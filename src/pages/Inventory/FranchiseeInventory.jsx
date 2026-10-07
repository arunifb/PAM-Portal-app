import { useEffect, useMemo, useRef, useState } from 'react'

import { getBranches, getFranchises } from '../../api/reportsApi'

import {
    searchInventory,
    exportInventory
} from '../../api/inventoryApi'

import DashboardLayout
    from '../../components/DashboardLayout/DashboardLayout'

import './FranchiseeInventory.css'


function FranchiseeInventory() {

    // =========================================
    // LOGGED-IN USER DETAILS
    // =========================================

    const roleId =
        sessionStorage.getItem('roleId') || ''

    const bpCode =
        sessionStorage.getItem('bpCode') || ''

    const loginId =
        sessionStorage.getItem('loginId') || ''

    const regionCode =
        sessionStorage.getItem('regionCode') || ''


    // =========================================
    // STATE
    // =========================================

    const [branches, setBranches] =
        useState([])

    const [franchises, setFranchises] =
        useState([])

    const [selectedBranch, setSelectedBranch] =
        useState(bpCode)

    const [selectedCategory, setSelectedCategory] =
        useState('')

    const [selectedFranchises, setSelectedFranchises] =
        useState([])

    const [fgDescription, setFgDescription] =
        useState('')

    // NEW: COMPONENT
    const [component, setComponent] =
        useState('')

    // NEW: COMPONENT DESCRIPTION
    const [componentDescription, setComponentDescription] =
        useState('')

    const [inventoryData, setInventoryData] =
        useState([])

    const [loading, setLoading] =
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
    // FRANCHISE DROPDOWN
    // =========================================

    const [franchiseDropdownOpen, setFranchiseDropdownOpen] =
        useState(false)

    const franchiseDropdownRef =
        useRef(null)


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
    // LOAD BRANCH
    // =========================================

    useEffect(() => {

        loadBranch()

    }, [])


    async function loadBranch() {

        try {

            if (
                !roleId ||
                !regionCode ||
                !bpCode
            ) {

                throw new Error(
                    'Logged-in user details are missing. Please login again.'
                )

            }


            const data =
                await getBranches(
                    roleId,
                    regionCode,
                    bpCode
                )


            let branchList = []


            if (Array.isArray(data)) {

                branchList = data

            }
            else if (Array.isArray(data?.data)) {

                branchList = data.data

            }


            setBranches(branchList)


            // Keep branch locked to logged-in user's BPCode

            const userBranch =
                branchList.find(
                    branch =>
                        String(
                            branch.BPCode ??
                            branch.bpCode ??
                            branch.BpCode ??
                            ''
                        ) === String(bpCode)
                )


            if (userBranch) {

                setSelectedBranch(
                    userBranch.BPCode ??
                    userBranch.bpCode ??
                    userBranch.BpCode ??
                    bpCode
                )

            }
            else {

                setSelectedBranch(bpCode)

            }

        }
        catch (error) {

            console.error(
                'Inventory branch error:',
                error
            )

            setMessage(
                error.message ||
                'Unable to load branch.'
            )

            setMessageType('error')

        }

    }


    // =========================================
    // LOAD FRANCHISES
    // =========================================

    useEffect(() => {

        if (!selectedBranch) {

            setFranchises([])
            setSelectedFranchises([])
            setFranchiseDropdownOpen(false)

            return

        }


        loadFranchises()

    }, [selectedBranch])


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
            else if (Array.isArray(data?.data)) {

                franchiseList = data.data

            }


            setFranchises(franchiseList)

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

            setSelectedFranchises(
                normalizedFranchises
                    .map(
                        franchise =>
                            franchise.code
                    )
                    .filter(Boolean)
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

                if (
                    current.includes(franchiseCode)
                ) {

                    return current.filter(
                        code =>
                            code !== franchiseCode
                    )

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
    //
    // NEW API STORED PROCEDURE EXPECTS:
    //
    // 3013481
    //
    // OR:
    //
    // 3013481,3013482,3013483
    //
    // DO NOT ADD SINGLE QUOTES HERE.
    //
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


        if (!selectedBranch) {

            setMessage(
                'Branch code is required.'
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

                // NEW
                component:
                    component,

                // NEW
                componentDescription:
                    componentDescription

            }


            console.log(
                'Inventory search request:',
                request
            )


            const data =
                await searchInventory(request)


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

                // NEW
                component:
                    component,

                // NEW
                componentDescription:
                    componentDescription

            }


            console.log(
                'Inventory export request:',
                request
            )


            const blob =
                await exportInventory(request)


            const url =
                window.URL.createObjectURL(blob)


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

                        {/* BRANCH */}

                        <div className="inventory-field">

                            <label>
                                Branch
                            </label>

                            <select
                                value={selectedBranch}
                                disabled
                                onChange={event =>
                                    setSelectedBranch(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select Branch
                                </option>

                                {branches.map(
                                    (branch, index) => {

                                        const code =
                                            branch.BPCode ??
                                            branch.bpCode ??
                                            branch.BpCode ??
                                            ''

                                        const name =
                                            branch.BranchName ??
                                            branch.branchName ??
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
                            </label>

                            <select
                                value={selectedCategory}
                                onChange={event =>
                                    setSelectedCategory(
                                        event.target.value
                                    )
                                }
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
                                disabled={franchiseLoading}
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
                                value={fgDescription}
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
                                value={componentDescription}
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
                                    {inventoryData.length} records
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

                                                <th key={column}>
                                                    {column}
                                                </th>

                                            )
                                        )}

                                    </tr>

                                </thead>


                                <tbody>

                                    {inventoryData.map(
                                        (row, rowIndex) => (

                                            <tr
                                                key={rowIndex}
                                            >

                                                <td>
                                                    {rowIndex + 1}
                                                </td>

                                                {columns.map(
                                                    column => (

                                                        <td
                                                            key={`${rowIndex}-${column}`}
                                                        >
                                                            {row[column] ?? ''}
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

            </div>

        </DashboardLayout>

    )

}


export default FranchiseeInventory