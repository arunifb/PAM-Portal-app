import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'

import {
    getReportParameters,
    getRegions,
    getBranches,
    getFranchises,
    getProducts,
    getCallBookDt,
    getCallTypes,
    getStatuses,
    runReport
} from '../../api/reportsApi'

import './ReportParameter.css'
import UserProfile from '../../components/UserProfile'


// =================================================
// MULTI SELECT DROPDOWN
// =================================================

function MultiSelectDropdown({
    options = [],
    selectedValues = [],
    onChange,
    placeholder = 'Select',
    loading = false,
    error = ''
}) {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false)
            }
        }

        document.addEventListener(
            'mousedown',
            handleOutsideClick
        )

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick
            )
        }
    }, [])

    const actualOptions = options.filter(
        (option) =>
            String(option.value).toLowerCase() !== 'all'
    )

    const isAllSelected =
        actualOptions.length > 0 &&
        actualOptions.every((option) =>
            selectedValues.includes(
                String(option.value)
            )
        )

    const handleAllChange = () => {
        if (isAllSelected) {
            onChange([])
        } else {
            onChange(
                actualOptions.map((option) =>
                    String(option.value)
                )
            )
        }
    }

    const handleOptionChange = (value) => {
        const stringValue = String(value)

        if (
            selectedValues.includes(stringValue)
        ) {
            onChange(
                selectedValues.filter(
                    (item) =>
                        item !== stringValue
                )
            )
        } else {
            onChange([
                ...selectedValues,
                stringValue
            ])
        }
    }

    const getDisplayText = () => {
        if (selectedValues.length === 0) {
            return placeholder
        }

        if (isAllSelected) {
            return 'All'
        }

        if (selectedValues.length <= 2) {
            const selectedLabels =
                actualOptions
                    .filter((option) =>
                        selectedValues.includes(
                            String(option.value)
                        )
                    )
                    .map(
                        (option) =>
                            option.label
                    )

            return selectedLabels.join(', ')
        }

        return `${selectedValues.length} selected`
    }

    return (
        <div
            className="multi-select-dropdown"
            ref={dropdownRef}
        >
            <button
                type="button"
                className="multi-select-button"
                onClick={() =>
                    !loading &&
                    setOpen(!open)
                }
                disabled={loading}
            >
                <span>
                    {loading
                        ? 'Loading...'
                        : error
                            ? 'Unable to load'
                            : getDisplayText()}
                </span>

                <i
                    className={`fa fa-chevron-down ${
                        open ? 'open' : ''
                    }`}
                    aria-hidden="true"
                />
            </button>

            {open && !loading && !error && (
                <div className="multi-select-menu">

                    <label className="multi-select-option">
                        <input
                            type="checkbox"
                            checked={
                                isAllSelected
                            }
                            onChange={
                                handleAllChange
                            }
                        />

                        <span>All</span>
                    </label>

                    {actualOptions.map(
                        (option, index) => {
                            const value =
                                String(
                                    option.value
                                )

                            return (
                                <label
                                    className="multi-select-option"
                                    key={
                                        value ||
                                        index
                                    }
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(
                                            value
                                        )}
                                        onChange={() =>
                                            handleOptionChange(
                                                value
                                            )
                                        }
                                    />

                                    <span>
                                        {
                                            option.label
                                        }
                                    </span>
                                </label>
                            )
                        }
                    )}
                </div>
            )}
        </div>
    )
}


// =================================================
// TABLE COLUMN FILTER
// =================================================

function ColumnFilter({
    column,
    values = [],
    selectedValues = [],
    onChange
}) {
    const [open, setOpen] = useState(false)
    const [searchText, setSearchText] = useState('')
    const filterRef = useRef(null)

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                filterRef.current &&
                !filterRef.current.contains(event.target)
            ) {
                setOpen(false)
            }
        }

        document.addEventListener(
            'mousedown',
            handleOutsideClick
        )

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick
            )
        }
    }, [])

    const uniqueValues = Array.from(
        new Set(
            values.map((value) =>
                value === null ||
                value === undefined
                    ? ''
                    : String(value)
            )
        )
    ).sort((a, b) =>
        a.localeCompare(
            b,
            undefined,
            {
                numeric: true,
                sensitivity: 'base'
            }
        )
    )

    const filteredValues =
        uniqueValues.filter((value) =>
            value
                .toLowerCase()
                .includes(
                    searchText.toLowerCase()
                )
        )

    const allSelected =
        selectedValues.length === 0 ||
        selectedValues.length ===
            uniqueValues.length

    const hasFilter =
        selectedValues.length > 0 &&
        selectedValues.length <
            uniqueValues.length

    const handleAllChange = () => {
        onChange([])
    }

    const handleValueChange = (value) => {
        if (
            selectedValues.includes(value)
        ) {
            const newValues =
                selectedValues.filter(
                    (item) =>
                        item !== value
                )

            onChange(newValues)
        } else {
            onChange([
                ...selectedValues,
                value
            ])
        }
    }

    const handleClear = () => {
        onChange([])
        setSearchText('')
    }

    return (
        <div
            className="column-filter"
            ref={filterRef}
        >
            <button
                type="button"
                className={`column-filter-button ${
                    hasFilter
                        ? 'active'
                        : ''
                }`}
                onClick={() =>
                    setOpen(!open)
                }
                aria-label={`Filter ${column}`}
                title={`Filter ${column}`}
            >
                <i
                    className="fa fa-filter"
                    aria-hidden="true"
                />
            </button>

            {open && (
                <div className="column-filter-menu">

                    <div className="column-filter-title">
                        <span>
                            Filter: {column}
                        </span>

                        {hasFilter && (
                            <button
                                type="button"
                                className="column-filter-clear"
                                onClick={
                                    handleClear
                                }
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="column-filter-search">
                        <i
                            className="fa fa-search"
                            aria-hidden="true"
                        />

                        <input
                            type="text"
                            value={
                                searchText
                            }
                            onChange={(event) =>
                                setSearchText(
                                    event.target.value
                                )
                            }
                            placeholder="Search..."
                        />
                    </div>

                    <div className="column-filter-options">

                        <label className="column-filter-option">
                            <input
                                type="checkbox"
                                checked={
                                    allSelected
                                }
                                onChange={
                                    handleAllChange
                                }
                            />

                            <span>
                                All
                            </span>
                        </label>

                        {filteredValues.map(
                            (value, index) => {

                                const checked =
                                    selectedValues.includes(
                                        value
                                    )

                                return (
                                    <label
                                        className="column-filter-option"
                                        key={`${value}-${index}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                checked
                                            }
                                            onChange={() =>
                                                handleValueChange(
                                                    value
                                                )
                                            }
                                        />

                                        <span
                                            title={
                                                value
                                            }
                                        >
                                            {
                                                value ===
                                                ''
                                                    ? '(Blank)'
                                                    : value
                                            }
                                        </span>
                                    </label>
                                )
                            }
                        )}

                        {filteredValues.length ===
                            0 && (
                            <div className="column-filter-no-values">
                                No values found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}


// =================================================
// MAIN COMPONENT
// =================================================

function ReportParameter() {
    const location = useLocation()
    const navigate = useNavigate()

    const report = location.state?.report

    const [parameters, setParameters] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [regions, setRegions] = useState([])
    const [selectedRegion, setSelectedRegion] =
        useState('')
    const [regionLoading, setRegionLoading] =
        useState(true)
    const [regionError, setRegionError] =
        useState('')

    const [branches, setBranches] = useState([])
    const [selectedBranch, setSelectedBranch] =
        useState('All')
    const [branchLoading, setBranchLoading] =
        useState(false)
    const [branchError, setBranchError] =
        useState('')

    const [franchises, setFranchises] =
        useState([])
    const [selectedFranchise, setSelectedFranchise] =
        useState('All')
    const [franchiseLoading, setFranchiseLoading] =
        useState(false)
    const [franchiseError, setFranchiseError] =
        useState('')

    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] =
        useState('All')
    const [productLoading, setProductLoading] =
        useState(true)
    const [productError, setProductError] =
        useState('')

    const [callBookDt, setCallBookDt] = useState([])
    const [selectedCallBookDt, setSelectedCallBookDt] =
        useState('')
    const [callBookDtLoading, setCallBookDtLoading] =
        useState(true)
    const [callBookDtError, setCallBookDtError] =
        useState('')

    const [callTypes, setCallTypes] = useState([])
    const [selectedCallTypes, setSelectedCallTypes] =
        useState([])
    const [callTypeLoading, setCallTypeLoading] =
        useState(true)
    const [callTypeError, setCallTypeError] =
        useState('')

    const [statuses, setStatuses] = useState([])
    const [selectedStatuses, setSelectedStatuses] =
        useState([])
    const [statusLoading, setStatusLoading] =
        useState(true)
    const [statusError, setStatusError] =
        useState('')

    const [selectedFromDate, setSelectedFromDate] =
        useState('')
    const [selectedToDate, setSelectedToDate] =
        useState('')

    // =================================================
    // DYNAMIC / UNKNOWN PARAMETER STATE
    // =================================================

    const [
        dynamicParameterValues,
        setDynamicParameterValues
    ] = useState({})

    const [reportData, setReportData] = useState([])
    const [reportLoading, setReportLoading] =
        useState(false)
    const [reportError, setReportError] =
        useState('')
    const [showNoData, setShowNoData] =
        useState(false)

    // =================================================
    // TABLE FILTER STATE
    // =================================================

    const [columnFilters, setColumnFilters] =
        useState({})

    // =================================================
    // LOGGED-IN USER DETAILS
    // =================================================

    const loggedInRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const loggedInRoleId =
        sessionStorage.getItem('roleId') || ''

    const loggedInLoginId =
        sessionStorage.getItem('loginId') || ''

    const loggedInBpCode =
        sessionStorage.getItem('bpCode') || ''

    // =================================================
    // ROLE IDs
    // =================================================

    const REGION_ROLE_ID = '1'
    const FRANCHISE_ROLE_ID = '5'
    const BRANCH_ROLE_ID = '6'

    const isRegionUser =
        String(loggedInRoleId) === REGION_ROLE_ID

    const isBranchUser =
        String(loggedInRoleId) === BRANCH_ROLE_ID

    const isFranchiseUser =
        String(loggedInRoleId) === FRANCHISE_ROLE_ID

    // =================================================
    // DATE CALENDAR LIMITS
    // =================================================

    const formatDateForInput = (date) => {
        const year = date.getFullYear()

        const month = String(
            date.getMonth() + 1
        ).padStart(2, '0')

        const day = String(
            date.getDate()
        ).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    const today = new Date()

    const sixMonthsAgo = new Date(
        today
    )

    sixMonthsAgo.setMonth(
        sixMonthsAgo.getMonth() - 6
    )

    const calendarMinDate =
        formatDateForInput(
            sixMonthsAgo
        )

    const calendarMaxDate =
        formatDateForInput(
            today
        )

    // =================================================
    // LOAD REPORT PARAMETERS
    // =================================================

    useEffect(() => {
        const loadReportParameters = async () => {
            if (!report?.reportID) {
                setParameters([])
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError('')

                const data =
                    await getReportParameters(
                        report.reportID
                    )

                if (!Array.isArray(data)) {
                    throw new Error(
                        'Invalid report parameter response.'
                    )
                }

                setParameters(data)

                setDynamicParameterValues({})

                console.log(
                    'REPORT:',
                    report
                )

                console.log(
                    'REPORT PARAMETERS:',
                    data
                )
            } catch (error) {
                console.error(
                    'Load report parameters error:',
                    error
                )

                setError(
                    error.message ||
                    'Unable to load report parameters.'
                )

                setParameters([])
            } finally {
                setLoading(false)
            }
        }

        loadReportParameters()
    }, [report])

    // =================================================
    // LOAD USER REGION
    // =================================================

    useEffect(() => {
        const loadUserRegion = async () => {
            if (!loggedInRegionCode) {
                setRegionError(
                    'Unable to determine logged-in region.'
                )

                setRegionLoading(false)
                return
            }

            try {
                setRegionLoading(true)
                setRegionError('')

                const data =
                    await getRegions(
                        loggedInRegionCode
                    )

                const regionData =
                    Array.isArray(data)
                        ? data
                        : []

                setRegions(regionData)

                // Region always comes from the
                // logged-in user's session.
                setSelectedRegion(
                    loggedInRegionCode
                )
            } catch (error) {
                console.error(
                    'Load region error:',
                    error
                )

                setRegions([])
                setSelectedRegion('')

                setRegionError(
                    error.message ||
                    'Unable to load region.'
                )
            } finally {
                setRegionLoading(false)
            }
        }

        loadUserRegion()
    }, [loggedInRegionCode])

    // =================================================
    // LOAD PRODUCTS
    // =================================================

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setProductLoading(true)
                setProductError('')

                const data =
                    await getProducts()

                setProducts(
                    Array.isArray(data)
                        ? data
                        : []
                )

                setSelectedProduct('All')
            } catch (error) {
                console.error(
                    'Load products error:',
                    error
                )

                setProducts([])
                setSelectedProduct('All')

                setProductError(
                    error.message ||
                    'Unable to load products.'
                )
            } finally {
                setProductLoading(false)
            }
        }

        loadProducts()
    }, [])

    // =================================================
    // LOAD CALL BOOK DATE
    // =================================================

    useEffect(() => {
        const loadCallBookDt = async () => {
            try {
                setCallBookDtLoading(true)
                setCallBookDtError('')

                const data =
                    await getCallBookDt()

                console.log(
                    'CALL BOOK DT RESPONSE:',
                    data
                )

                if (!Array.isArray(data)) {
                    throw new Error(
                        'Invalid Date Filter response.'
                    )
                }

                const filteredData =
                    data.filter(
                        (item) =>
                            item &&
                            String(
                                item.code ?? ''
                            ).trim() !== '' &&
                            item.description !==
                                null &&
                            item.description !==
                                undefined
                    )

                setCallBookDt(
                    filteredData
                )
            } catch (error) {
                console.error(
                    'Load Call Book DT error:',
                    error
                )

                setCallBookDt([])

                setCallBookDtError(
                    error.message ||
                    'Unable to load Date Filter.'
                )
            } finally {
                setCallBookDtLoading(false)
            }
        }

        loadCallBookDt()
    }, [])

    // =================================================
    // LOAD CALL TYPES
    // =================================================

    useEffect(() => {
        const loadCallTypes = async () => {
            try {
                setCallTypeLoading(true)
                setCallTypeError('')

                const data =
                    await getCallTypes()

                const normalizedOptions =
                    Array.isArray(data)
                        ? data
                            .map(
                                (item) => {
                                    if (
                                        typeof item ===
                                            'string' ||
                                        typeof item ===
                                            'number'
                                    ) {
                                        return {
                                            value: String(
                                                item
                                            ),
                                            label: String(
                                                item
                                            )
                                        }
                                    }

                                    const callTypeName =
                                        item?.callTypeName ??
                                        item?.CallTypeName ??
                                        item?.callType ??
                                        item?.CallType ??
                                        item?.name ??
                                        item?.Name ??
                                        item?.description ??
                                        item?.Description ??
                                        ''

                                    const sapCode =
                                        item?.saP_Code ??
                                        item?.sap_Code ??
                                        item?.SAP_Code ??
                                        item?.Sap_Code ??
                                        ''

                                    return {
                                        value:
                                            String(
                                                callTypeName
                                            ),
                                        label:
                                            String(
                                                callTypeName
                                            ),
                                        sapCode:
                                            String(
                                                sapCode
                                            )
                                    }
                                }
                            )
                            .filter(
                                (item) =>
                                    item.value
                                        .trim() !== ''
                            )
                        : []

                const uniqueOptions =
                    Array.from(
                        new Map(
                            normalizedOptions.map(
                                (item) => [
                                    String(
                                        item.value
                                    ).toLowerCase(),
                                    item
                                ]
                            )
                        ).values()
                    )

                setCallTypes(
                    uniqueOptions
                )

                setSelectedCallTypes(
                    uniqueOptions.map(
                        (item) =>
                            String(
                                item.value
                            )
                    )
                )
            } catch (error) {
                console.error(
                    'Load call types error:',
                    error
                )

                setCallTypes([])
                setSelectedCallTypes([])

                setCallTypeError(
                    error.message ||
                    'Unable to load call types.'
                )
            } finally {
                setCallTypeLoading(false)
            }
        }

        loadCallTypes()
    }, [])

    // =================================================
    // LOAD STATUSES
    // =================================================

    useEffect(() => {
        const loadStatuses = async () => {
            try {
                setStatusLoading(true)
                setStatusError('')

                const data =
                    await getStatuses()

                const normalizedOptions =
                    Array.isArray(data)
                        ? data
                            .map(
                                (item) => {
                                    if (
                                        typeof item ===
                                            'string' ||
                                        typeof item ===
                                            'number'
                                    ) {
                                        return {
                                            value: String(
                                                item
                                            ),
                                            label: String(
                                                item
                                            )
                                        }
                                    }

                                    const statusName =
                                        item?.statusName ??
                                        item?.StatusName ??
                                        item?.status ??
                                        item?.Status ??
                                        item?.name ??
                                        item?.Name ??
                                        item?.description ??
                                        item?.Description ??
                                        item?.value ??
                                        item?.Value ??
                                        ''

                                    return {
                                        value:
                                            String(
                                                statusName
                                            ),
                                        label:
                                            String(
                                                statusName
                                            )
                                    }
                                }
                            )
                            .filter(
                                (item) =>
                                    item.value
                                        .trim() !== ''
                            )
                        : []

                const uniqueOptions =
                    Array.from(
                        new Map(
                            normalizedOptions.map(
                                (item) => [
                                    String(
                                        item.value
                                    ).toLowerCase(),
                                    item
                                ]
                            )
                        ).values()
                    )

                setStatuses(
                    uniqueOptions
                )

                setSelectedStatuses(
                    uniqueOptions.map(
                        (item) =>
                            String(
                                item.value
                            )
                    )
                )
            } catch (error) {
                console.error(
                    'Load statuses error:',
                    error
                )

                setStatuses([])
                setSelectedStatuses([])

                setStatusError(
                    error.message ||
                    'Unable to load statuses.'
                )
            } finally {
                setStatusLoading(false)
            }
        }

        loadStatuses()
    }, [])

    // =================================================
    // LOAD USER BRANCHES
    // =================================================

    useEffect(() => {
        const loadUserBranch = async () => {

            if (!selectedRegion) {
                setBranches([])

                setSelectedBranch(
                    isRegionUser
                        ? 'All'
                        : ''
                )

                return
            }

            if (!loggedInRoleId) {
                setBranches([])
                setSelectedBranch('All')

                setBranchError(
                    'Unable to determine logged-in role.'
                )

                return
            }

            // Branch and Franchise users must have
            // their logged-in BPCode.
            if (
                (isBranchUser ||
                    isFranchiseUser) &&
                !loggedInBpCode
            ) {
                setBranches([])
                setSelectedBranch('')

                setBranchError(
                    'Unable to determine logged-in branch.'
                )

                return
            }

            try {
                setBranchLoading(true)
                setBranchError('')

                // =========================================
                // REGION USER - ROLE 1
                // =========================================

                if (isRegionUser) {
                    const data =
                        await getBranches(
                            loggedInRoleId,
                            selectedRegion,
                            ''
                        )

                    const branchData =
                        Array.isArray(data)
                            ? data
                            : []

                    setBranches(
                        branchData
                    )

                    // Region user can select All.
                    setSelectedBranch('All')

                    return
                }

                // =========================================
                // BRANCH / FRANCHISE USER
                // ROLE 6 / ROLE 5
                // =========================================

                const data =
                    await getBranches(
                        loggedInRoleId,
                        selectedRegion,
                        loggedInBpCode
                    )

                const branchData =
                    Array.isArray(data)
                        ? data
                        : []

                setBranches(
                    branchData
                )

                // Branch and Franchise users
                // must use their logged-in branch.
                setSelectedBranch(
                    loggedInBpCode
                )

            } catch (error) {
                console.error(
                    'Load branches error:',
                    error
                )

                setBranches([])

                setSelectedBranch(
                    isRegionUser
                        ? 'All'
                        : ''
                )

                setBranchError(
                    error.message ||
                    'Unable to load branches.'
                )
            } finally {
                setBranchLoading(false)
            }
        }

        loadUserBranch()
    }, [
        selectedRegion,
        loggedInRoleId,
        loggedInBpCode,
        isRegionUser,
        isBranchUser,
        isFranchiseUser
    ])

    // =================================================
    // LOAD FRANCHISES
    // =================================================

    useEffect(() => {
        const loadFranchises = async () => {

            // =========================================
            // REGION USER + ALL BRANCH
            // =========================================
            // No single branch is selected yet.
            // Keep franchise as All.
            // =========================================

            if (
                isRegionUser &&
                (!selectedBranch ||
                    selectedBranch === 'All')
            ) {
                setFranchises([])
                setSelectedFranchise('All')
                setFranchiseError('')
                setFranchiseLoading(false)

                return
            }

            if (!selectedBranch) {
                setFranchises([])

                setSelectedFranchise(
                    isFranchiseUser
                        ? ''
                        : 'All'
                )

                setFranchiseError('')
                setFranchiseLoading(false)

                return
            }

            if (!loggedInRoleId) {
                setFranchises([])
                setSelectedFranchise('All')

                setFranchiseError(
                    'Unable to determine logged-in role.'
                )

                setFranchiseLoading(false)

                return
            }

            if (!loggedInLoginId) {
                setFranchises([])
                setSelectedFranchise('All')

                setFranchiseError(
                    'Unable to determine logged-in Login ID.'
                )

                setFranchiseLoading(false)

                return
            }

            try {
                setFranchiseLoading(true)
                setFranchiseError('')

                const branchCode =
                    isRegionUser
                        ? selectedBranch
                        : loggedInBpCode

                const data =
                    await getFranchises(
                        loggedInRoleId,
                        branchCode,
                        loggedInLoginId
                    )

                const franchiseData =
                    Array.isArray(data)
                        ? [...data]
                        : []

                franchiseData.sort(
                    (a, b) => {
                        const nameA =
                            String(
                                a.frName ??
                                a.FrName ??
                                a.franchiseName ??
                                a.FranchiseName ??
                                a.name ??
                                a.Name ??
                                ''
                            )

                        const nameB =
                            String(
                                b.frName ??
                                b.FrName ??
                                b.franchiseName ??
                                b.FranchiseName ??
                                b.name ??
                                b.Name ??
                                ''
                            )

                        return nameA.localeCompare(
                            nameB
                        )
                    }
                )

                setFranchises(
                    franchiseData
                )

                // =========================================
                // FRANCHISE USER - ROLE 5
                // =========================================
                // The API is called with LoginID.
                // The returned franchise is selected
                // and the dropdown is frozen.
                // =========================================

                if (isFranchiseUser) {

                    if (
                        franchiseData.length > 0
                    ) {
                        const loggedInFranchise =
                            franchiseData[0]

                        const franchiseCode =
                            loggedInFranchise.frCode ??
                            loggedInFranchise.FrCode ??
                            loggedInFranchise.franchiseCode ??
                            loggedInFranchise.FranchiseCode ??
                            ''

                        setSelectedFranchise(
                            String(
                                franchiseCode
                            )
                        )
                    } else {
                        setSelectedFranchise('')
                    }

                    return
                }

                // =========================================
                // REGION / BRANCH USER
                // =========================================

                setSelectedFranchise(
                    'All'
                )

            } catch (error) {
                console.error(
                    'Load franchises error:',
                    error
                )

                setFranchises([])

                setSelectedFranchise(
                    isFranchiseUser
                        ? ''
                        : 'All'
                )

                setFranchiseError(
                    error.message ||
                    'Unable to load franchises.'
                )
            } finally {
                setFranchiseLoading(false)
            }
        }

        loadFranchises()
    }, [
        selectedBranch,
        loggedInRoleId,
        loggedInLoginId,
        loggedInBpCode,
        isRegionUser,
        isFranchiseUser
    ])

    // =================================================
    // GET MULTI SELECT VALUE
    // =================================================

    const getMultiSelectValue = (
        selectedValues,
        options
    ) => {
        if (
            !selectedValues ||
            selectedValues.length === 0
        ) {
            return null
        }

        const actualOptions =
            options.filter(
                (option) =>
                    String(
                        option.value
                    ).toLowerCase() !== 'all'
            )

        const allSelected =
            actualOptions.length > 0 &&
            actualOptions.every(
                (option) =>
                    selectedValues.includes(
                        String(option.value)
                    )
            )

        if (allSelected) {
            return 'All'
        }

        return selectedValues.join(',')
    }

    // =================================================
    // GET PARAMETER VALUE
    // =================================================

    const getParameterValue = (
        paramName,
        question = ''
    ) => {
        const normalizedName =
            String(
                paramName || ''
            )
                .trim()
                .toLowerCase()

        const normalizedQuestion =
            String(
                question || ''
            )
                .trim()
                .toLowerCase()

        if (
            normalizedName === 'region'
        ) {
            return selectedRegion || null
        }

        if (
            normalizedName === 'branch' ||
            normalizedName === 'branchcode'
        ) {
            return selectedBranch || null
        }

        if (
            normalizedName ===
                'franchise' ||
            normalizedName ===
                'franchisecode'
        ) {
            return selectedFranchise || 'All'
        }

        if (
            normalizedName ===
                'product' ||
            normalizedName ===
                'productcode'
        ) {
            return selectedProduct || 'All'
        }

        if (
            normalizedName ===
                'callbookdt' ||
            normalizedName ===
                'datefilter' ||
            normalizedName ===
                'datefiltercode' ||
            normalizedQuestion ===
                'call book dt' ||
            normalizedQuestion ===
                'date filter'
        ) {
            return (
                selectedCallBookDt ||
                null
            )
        }

        if (
            normalizedName ===
                'calltype'
        ) {
            return getMultiSelectValue(
                selectedCallTypes,
                callTypes
            )
        }

        if (
            normalizedName ===
                'status'
        ) {
            return getMultiSelectValue(
                selectedStatuses,
                statuses
            )
        }

        if (
            normalizedName ===
                'fromdate'
        ) {
            return (
                selectedFromDate ||
                null
            )
        }

        if (
            normalizedName ===
                'todate'
        ) {
            return (
                selectedToDate ||
                null
            )
        }

        // =================================================
        // DYNAMIC PARAMETER
        // =================================================

        return (
            dynamicParameterValues[paramName] ||
            null
        )
    }

    // =================================================
    // GET REQUEST PARAMETER NAME
    // =================================================

    const getRequestParameterName = (
        paramName,
        question = ''
    ) => {
        const normalizedName =
            String(
                paramName || ''
            )
                .trim()
                .toLowerCase()

        const normalizedQuestion =
            String(
                question || ''
            )
                .trim()
                .toLowerCase()

        if (
            normalizedName ===
                'region'
        ) {
            return 'Region'
        }

        if (
            normalizedName ===
                'branch' ||
            normalizedName ===
                'branchcode'
        ) {
            return 'BranchCode'
        }

        if (
            normalizedName ===
                'franchise' ||
            normalizedName ===
                'franchisecode'
        ) {
            return 'FranchiseCode'
        }

        if (
            normalizedName ===
                'product' ||
            normalizedName ===
                'productcode'
        ) {
            return 'ProductCode'
        }

        if (
            normalizedName ===
                'calltype' ||
            normalizedQuestion ===
                'call type'
        ) {
            return 'CallType'
        }

        if (
            normalizedName ===
                'status' ||
            normalizedQuestion ===
                'status'
        ) {
            return 'Status'
        }

        if (
            normalizedName ===
                'callbookdt' ||
            normalizedName ===
                'datefilter' ||
            normalizedName ===
                'datefiltercode' ||
            normalizedQuestion ===
                'call book dt' ||
            normalizedQuestion ===
                'date filter'
        ) {
            return 'DateFilter'
        }

        if (
            normalizedName ===
                'fromdate'
        ) {
            return 'FromDate'
        }

        if (
            normalizedName ===
                'todate'
        ) {
            return 'ToDate'
        }

        return paramName
    }

    // =================================================
    // MANDATORY USER PARAMETER
    // =================================================

    const isMandatoryUserParameter = (
        paramName,
        question = ''
    ) => {
        const normalizedName =
            String(
                paramName || ''
            )
                .trim()
                .toLowerCase()

        const normalizedQuestion =
            String(
                question || ''
            )
                .trim()
                .toLowerCase()

        return (
            normalizedName ===
                'region' ||
            normalizedName ===
                'branch' ||
            normalizedName ===
                'branchcode' ||
            normalizedName ===
                'franchise' ||
            normalizedName ===
                'franchisecode' ||
            normalizedName ===
                'callbookdt' ||
            normalizedName ===
                'datefilter' ||
            normalizedName ===
                'datefiltercode' ||
            normalizedQuestion ===
                'call book dt' ||
            normalizedQuestion ===
                'date filter' ||
            normalizedName ===
                'fromdate' ||
            normalizedName ===
                'todate'
        )
    }

    // =================================================
    // RUN QUERY
    // =================================================

    const handleRunQuery = async () => {
        setShowNoData(false)
        setReportError('')

        // Clear table filters whenever
        // a completely new report is executed.
        setColumnFilters({})

        let missingParameter = ''

        if (
            !missingParameter &&
            parameters.some(
                (parameter) =>
                    isMandatoryUserParameter(
                        parameter.paramName,
                        parameter.question
                    ) &&
                    String(
                        parameter.paramName ||
                        ''
                    )
                        .trim()
                        .toLowerCase() ===
                        'region'
            ) &&
            !selectedRegion
        ) {
            missingParameter = 'Region'
        }

        if (
            !missingParameter &&
            parameters.some(
                (parameter) => {
                    const name =
                        String(
                            parameter.paramName ||
                            ''
                        )
                            .trim()
                            .toLowerCase()

                    return (
                        isMandatoryUserParameter(
                            parameter.paramName,
                            parameter.question
                        ) &&
                        (
                            name ===
                                'branch' ||
                            name ===
                                'branchcode'
                        )
                    )
                }
            ) &&
            !selectedBranch
        ) {
            missingParameter = 'Branch'
        }

        if (
            !missingParameter &&
            parameters.some(
                (parameter) => {
                    const name =
                        String(
                            parameter.paramName ||
                            ''
                        )
                            .trim()
                            .toLowerCase()

                    return (
                        isMandatoryUserParameter(
                            parameter.paramName,
                            parameter.question
                        ) &&
                        (
                            name ===
                                'franchise' ||
                            name ===
                                'franchisecode'
                        )
                    )
                }
            ) &&
            !selectedFranchise
        ) {
            missingParameter =
                'Franchise'
        }

        if (
            !missingParameter &&
            parameters.some(
                (parameter) => {
                    const name =
                        String(
                            parameter.paramName ||
                            ''
                        )
                            .trim()
                            .toLowerCase()

                    const question =
                        String(
                            parameter.question ||
                            ''
                        )
                            .trim()
                            .toLowerCase()

                    return (
                        isMandatoryUserParameter(
                            parameter.paramName,
                            parameter.question
                        ) &&
                        (
                            name ===
                                'callbookdt' ||
                            name ===
                                'datefilter' ||
                            name ===
                                'datefiltercode' ||
                            question ===
                                'call book dt' ||
                            question ===
                                'date filter'
                        )
                    )
                }
            ) &&
            !selectedCallBookDt
        ) {
            missingParameter =
                'Date Filter'
        }

        if (
            !missingParameter &&
            parameters.some(
                (parameter) =>
                    String(
                        parameter.paramName ||
                        ''
                    )
                        .trim()
                        .toLowerCase() ===
                    'fromdate'
            ) &&
            !selectedFromDate
        ) {
            missingParameter =
                'From Date'
        }

        if (
            !missingParameter &&
            parameters.some(
                (parameter) =>
                    String(
                        parameter.paramName ||
                        ''
                    )
                        .trim()
                        .toLowerCase() ===
                    'todate'
            ) &&
            !selectedToDate
        ) {
            missingParameter =
                'To Date'
        }

        if (missingParameter) {
            setReportError(
                `Please select ${missingParameter}.`
            )
            return
        }

        if (
            selectedFromDate &&
            selectedToDate &&
            selectedFromDate >
                selectedToDate
        ) {
            setReportError(
                'From Date cannot be greater than To Date.'
            )
            return
        }

        // =================================================
        // BUILD PARAMETERS
        // =================================================

        const reportParameters = {}

        parameters.forEach(
            (parameter) => {
                const paramName =
                    String(
                        parameter.paramName ||
                        ''
                    ).trim()

                if (!paramName) {
                    return
                }

                const question =
                    String(
                        parameter.question ||
                        ''
                    ).trim()

                const requestParamName =
                    getRequestParameterName(
                        paramName,
                        question
                    )

                const value =
                    getParameterValue(
                        paramName,
                        question
                    )

                reportParameters[
                    requestParamName
                ] =
                    value === undefined
                        ? null
                        : value
            }
        )

        // =================================================
        // FINAL PAYLOAD DEBUG
        // =================================================

        console.log(
            '========================================'
        )

        console.log(
            'FINAL PARAMETERS SENT TO API'
        )

        console.log(
            reportParameters
        )

        console.log(
            'FINAL JSON'
        )

        console.log(
            JSON.stringify(
                reportParameters,
                null,
                2
            )
        )

        console.log(
            '========================================'
        )

        // =================================================
        // RUN REPORT
        // =================================================

        try {
            setReportLoading(true)
            setReportError('')

            const data =
                await runReport(
                    report.reportID,
                    reportParameters
                )

            console.log(
                'REPORT API RESPONSE:',
                data
            )

            if (
                !Array.isArray(data) ||
                data.length === 0
            ) {
                setReportData([])
                setShowNoData(true)
                return
            }

            setReportData(data)
            setShowNoData(false)

        } catch (error) {
            console.error(
                'Run report error:',
                error
            )

            setReportError(
                error.message ||
                'Unable to run report.'
            )

            setReportData([])
            setShowNoData(false)

        } finally {
            setReportLoading(false)
        }
    }

    // =================================================
    // TABLE COLUMNS
    // =================================================

    const reportColumns =
        reportData.length > 0
            ? Object.keys(
                reportData[0]
            )
            : []

    // =================================================
    // FILTERED REPORT DATA
    // =================================================

    const filteredReportData =
        reportData.filter(
            (row) => {
                return reportColumns.every(
                    (column) => {
                        const selectedValues =
                            columnFilters[
                                column
                            ]

                        // No filter applied.
                        if (
                            !selectedValues ||
                            selectedValues.length ===
                                0
                        ) {
                            return true
                        }

                        const rowValue =
                            row[column] ===
                                null ||
                            row[column] ===
                                undefined
                                ? ''
                                : String(
                                    row[column]
                                )

                        return selectedValues.includes(
                            rowValue
                        )
                    }
                )
            }
        )

    // =================================================
    // COLUMN FILTER CHANGE
    // =================================================

    const handleColumnFilterChange = (
        column,
        selectedValues
    ) => {

        setColumnFilters(
            (previousFilters) => {

                const updatedFilters = {
                    ...previousFilters
                }

                if (
                    !selectedValues ||
                    selectedValues.length ===
                        0
                ) {
                    delete updatedFilters[
                        column
                    ]
                } else {
                    updatedFilters[
                        column
                    ] = selectedValues
                }

                return updatedFilters
            }
        )
    }

    // =================================================
    // CLEAR ALL COLUMN FILTERS
    // =================================================

    const handleClearAllColumnFilters = () => {
        setColumnFilters({})
    }

    const hasColumnFilters =
        Object.keys(
            columnFilters
        ).length > 0

    // =================================================
    // DOWNLOAD EXCEL
    // =================================================

    const handleDownload = () => {

        if (
            !Array.isArray(reportData) ||
            reportData.length === 0
        ) {
            return
        }

        const worksheet =
            XLSX.utils.json_to_sheet(
                reportData
            )

        const workbook =
            XLSX.utils.book_new()

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Report Data'
        )

        const reportName =
            report?.reportType ||
            'Report'

        const safeReportName =
            String(
                reportName
            ).replace(
                /[\\/:*?"<>|]/g,
                '_'
            )

        XLSX.writeFile(
            workbook,
            `${safeReportName}_Data.xlsx`
        )
    }

    // =================================================
    // BACK
    // =================================================

    const handleBack = () => {

        navigate(
            '/dashboard',
            {
                state: {
                    activeSection:
                        'report-data'
                }
            }
        )
    }

    // =================================================
    // NO REPORT
    // =================================================

    if (!report) {
        return (
            <>
                <header
                    className="report-top-header"
                >
                    <div
                        className="report-top-header-spacer"
                    />

                    <UserProfile />
                </header>

                <section
                    className="report-parameter-section"
                >
                    <div
                        className="report-parameter-empty"
                    >
                        <i
                            className="fa fa-exclamation-circle"
                            aria-hidden="true"
                        />

                        <h3>
                            No report selected
                        </h3>

                        <p>
                            Please select a report from Report Data.
                        </p>
                    </div>
                </section>
            </>
        )
    }

    // =================================================
    // LOADING
    // =================================================

    if (loading) {
        return (
            <>
                <header
                    className="report-top-header"
                >
                    <div
                        className="report-top-header-spacer"
                    />

                    <UserProfile />
                </header>

                <section
                    className="report-parameter-section"
                >
                    <div
                        className="report-parameter-empty"
                    >
                        <i
                            className="fa fa-spinner fa-spin"
                            aria-hidden="true"
                        />

                        <h3>
                            Loading report parameters...
                        </h3>
                    </div>
                </section>
            </>
        )
    }

    // =================================================
    // ERROR
    // =================================================

    if (error) {
        return (
            <>
                <header
                    className="report-top-header"
                >
                    <div
                        className="report-top-header-spacer"
                    />

                    <UserProfile />
                </header>

                <section
                    className="report-parameter-section"
                >
                    <div
                        className="report-parameter-empty"
                    >
                        <i
                            className="fa fa-exclamation-triangle"
                            aria-hidden="true"
                        />

                        <h3>
                            Unable to load report parameters
                        </h3>

                        <p>
                            {error}
                        </p>
                    </div>
                </section>
            </>
        )
    }

    // =================================================
    // MAIN PAGE
    // =================================================

    return (
        <>
            <section
                className="report-parameter-section"
            >

                {/* =====================================
                    HEADER
                ===================================== */}

                <div
                    className="report-parameter-header"
                >

                    <div
                        className="report-title-row"
                    >

                        <button
                            type="button"
                            className="report-back-button"
                            onClick={
                                handleBack
                            }
                            aria-label="Back to Report Data"
                            title="Back to Report Data"
                        >
                            <i
                                className="fa fa-arrow-left"
                                aria-hidden="true"
                            />
                        </button>

                        <div>
                            <h2>
                                {
                                    report.reportType
                                }
                            </h2>
                        </div>

                    </div>

                    <UserProfile />

                </div>

                {/* =====================================
                    FILTER CARD
                ===================================== */}

                <div
                    className="report-parameter-card"
                >

                    <div
                        className="report-filter-grid"
                    >

                        {parameters.map(
                            (parameter) => {

                                const paramName =
                                    String(
                                        parameter.paramName ||
                                        ''
                                    ).trim()

                                const question =
                                    String(
                                        parameter.question ||
                                        ''
                                    ).trim()

                                const normalizedName =
                                    paramName.toLowerCase()

                                const normalizedQuestion =
                                    question.toLowerCase()

                                const isRegion =
                                    normalizedName ===
                                    'region'

                                const isBranch =
                                    normalizedName ===
                                        'branch' ||
                                    normalizedName ===
                                        'branchcode'

                                const isFranchise =
                                    normalizedName ===
                                        'franchise' ||
                                    normalizedName ===
                                        'franchisecode'

                                const isProduct =
                                    normalizedName ===
                                        'product' ||
                                    normalizedName ===
                                        'productcode'

                                const isCallBookDt =
                                    normalizedName ===
                                        'callbookdt' ||
                                    normalizedName ===
                                        'datefilter' ||
                                    normalizedName ===
                                        'datefiltercode' ||
                                    normalizedQuestion ===
                                        'call book dt' ||
                                    normalizedQuestion ===
                                        'date filter'

                                const isCallType =
                                    normalizedName ===
                                        'calltype' ||
                                    normalizedQuestion ===
                                        'call type'

                                const isStatus =
                                    normalizedName ===
                                        'status' ||
                                    normalizedQuestion ===
                                        'status'

                                const isFromDate =
                                    normalizedName ===
                                    'fromdate'

                                const isToDate =
                                    normalizedName ===
                                    'todate'

                                const isDynamicParameter =
                                    !isRegion &&
                                    !isBranch &&
                                    !isFranchise &&
                                    !isProduct &&
                                    !isCallBookDt &&
                                    !isCallType &&
                                    !isStatus &&
                                    !isFromDate &&
                                    !isToDate

                                const mandatory =
                                    isRegion ||
                                    isBranch ||
                                    isFranchise ||
                                    isCallBookDt ||
                                    isFromDate ||
                                    isToDate

                                return (
                                    <div
                                        key={
                                            parameter.id ??
                                            `${paramName}-${parameter.serial}`
                                        }
                                        className="report-filter-field"
                                    >

                                        <label>
                                            {
                                                question ||
                                                paramName
                                            }

                                            {mandatory && (
                                                <span
                                                    className="required"
                                                >
                                                    *
                                                </span>
                                            )}
                                        </label>

                                        {/* REGION */}

                                        {isRegion && (
                                            <select
                                                className="report-filter-control"
                                                value={
                                                    selectedRegion
                                                }
                                                disabled={
                                                    true
                                                }
                                            >

                                                <option value="">
                                                    {regionLoading
                                                        ? 'Loading region...'
                                                        : regionError
                                                            ? 'Unable to load region'
                                                            : 'Select Region'}
                                                </option>

                                                {!regionLoading &&
                                                    !regionError &&
                                                    regions.map(
                                                        (
                                                            region,
                                                            index
                                                        ) => {

                                                            const code =
                                                                region.regionCode ??
                                                                region.RegionCode ??
                                                                ''

                                                            const name =
                                                                region.regionName ??
                                                                region.RegionName ??
                                                                code

                                                            return (
                                                                <option
                                                                    key={
                                                                        code ||
                                                                        index
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
                                                    )}

                                            </select>
                                        )}

                                        {/* BRANCH */}

                                        {isBranch && (
                                            <select
                                                className="report-filter-control"
                                                value={
                                                    selectedBranch
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setSelectedBranch(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    !selectedRegion ||
                                                    branchLoading ||
                                                    isBranchUser ||
                                                    isFranchiseUser
                                                }
                                            >

                                                {/* "All" is available
                                                    ONLY for Region users */}

                                                {isRegionUser && (
                                                    <option value="All">
                                                        All
                                                    </option>
                                                )}

                                                {!branchLoading &&
                                                    !branchError &&
                                                    branches.map(
                                                        (
                                                            branch,
                                                            index
                                                        ) => {

                                                            const code =
                                                                branch.bpCode ??
                                                                branch.BPCode ??
                                                                branch.branchCode ??
                                                                branch.BranchCode ??
                                                                ''

                                                            const name =
                                                                branch.branchName ??
                                                                branch.BranchName ??
                                                                branch.name ??
                                                                branch.Name ??
                                                                code

                                                            return (
                                                                <option
                                                                    key={
                                                                        code ||
                                                                        index
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
                                                    )}

                                            </select>
                                        )}

                                        {/* FRANCHISE */}

                                        {isFranchise && (
                                            <select
                                                className="report-filter-control"
                                                value={
                                                    selectedFranchise
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setSelectedFranchise(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    !selectedBranch ||
                                                    franchiseLoading ||
                                                    isFranchiseUser
                                                }
                                            >

                                                {/* "All" is available
                                                    for Region and
                                                    Branch users.
                                                    Franchise users
                                                    only see their
                                                    own franchise. */}

                                                {!isFranchiseUser && (
                                                    <option value="All">
                                                        All
                                                    </option>
                                                )}

                                                {!franchiseLoading &&
                                                    !franchiseError &&
                                                    franchises.map(
                                                        (
                                                            franchise,
                                                            index
                                                        ) => {

                                                            const code =
                                                                franchise.frCode ??
                                                                franchise.FrCode ??
                                                                franchise.franchiseCode ??
                                                                franchise.FranchiseCode ??
                                                                ''

                                                            const name =
                                                                franchise.frName ??
                                                                franchise.FrName ??
                                                                franchise.franchiseName ??
                                                                franchise.FranchiseName ??
                                                                franchise.name ??
                                                                franchise.Name ??
                                                                code

                                                            return (
                                                                <option
                                                                    key={
                                                                        code ||
                                                                        index
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
                                                    )}

                                            </select>
                                        )}

                                        {/* PRODUCT */}

                                        {isProduct && (
                                            <select
                                                className="report-filter-control"
                                                value={
                                                    selectedProduct
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setSelectedProduct(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    productLoading
                                                }
                                            >

                                                <option value="All">
                                                    All
                                                </option>

                                                {!productLoading &&
                                                    !productError &&
                                                    products.map(
                                                        (
                                                            product,
                                                            index
                                                        ) => {

                                                            const code =
                                                                product.productCode ??
                                                                product.ProductCode ??
                                                                product.code ??
                                                                product.Code ??
                                                                ''

                                                            const name =
                                                                product.productName ??
                                                                product.ProductName ??
                                                                product.name ??
                                                                product.Name ??
                                                                code

                                                            return (
                                                                <option
                                                                    key={
                                                                        code ||
                                                                        index
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
                                                    )}

                                            </select>
                                        )}

                                        {/* DATE FILTER */}

                                        {isCallBookDt && (
                                            <select
                                                className="report-filter-control"
                                                value={
                                                    selectedCallBookDt
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setSelectedCallBookDt(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    callBookDtLoading
                                                }
                                            >

                                                <option value="">
                                                    {callBookDtLoading
                                                        ? 'Loading Date Filter...'
                                                        : callBookDtError
                                                            ? 'Unable to load Date Filter'
                                                            : 'Select Date Filter'}
                                                </option>

                                                {!callBookDtLoading &&
                                                    !callBookDtError &&
                                                    callBookDt.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => (
                                                            <option
                                                                key={
                                                                    item.id ??
                                                                    index
                                                                }
                                                                value={
                                                                    item.code
                                                                }
                                                            >
                                                                {
                                                                    item.description
                                                                }
                                                            </option>
                                                        )
                                                    )}

                                            </select>
                                        )}

                                        {/* CALL TYPE */}

                                        {isCallType && (
                                            <MultiSelectDropdown
                                                options={
                                                    callTypes
                                                }
                                                selectedValues={
                                                    selectedCallTypes
                                                }
                                                onChange={
                                                    setSelectedCallTypes
                                                }
                                                placeholder="Select Call Type"
                                                loading={
                                                    callTypeLoading
                                                }
                                                error={
                                                    callTypeError
                                                }
                                            />
                                        )}

                                        {/* STATUS */}

                                        {isStatus && (
                                            <MultiSelectDropdown
                                                options={
                                                    statuses
                                                }
                                                selectedValues={
                                                    selectedStatuses
                                                }
                                                onChange={
                                                    setSelectedStatuses
                                                }
                                                placeholder="Select Status"
                                                loading={
                                                    statusLoading
                                                }
                                                error={
                                                    statusError
                                                }
                                            />
                                        )}

                                        {/* FROM DATE */}

                                        {isFromDate && (
                                            <input
                                                type="date"
                                                className="report-filter-control"
                                                value={
                                                    selectedFromDate
                                                }
                                                min={
                                                    calendarMinDate
                                                }
                                                max={
                                                    calendarMaxDate
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setSelectedFromDate(
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        )}

                                        {/* TO DATE */}

                                        {isToDate && (
                                            <input
                                                type="date"
                                                className="report-filter-control"
                                                value={
                                                    selectedToDate
                                                }
                                                min={
                                                    calendarMinDate
                                                }
                                                max={
                                                    calendarMaxDate
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setSelectedToDate(
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        )}

                                        {/* UNKNOWN / DYNAMIC PARAMETER */}

                                        {isDynamicParameter && (
                                            <input
                                                type="text"
                                                className="report-filter-control"
                                                value={
                                                    dynamicParameterValues[
                                                        paramName
                                                    ] || ''
                                                }
                                                placeholder={
                                                    `Enter ${
                                                        question ||
                                                        paramName
                                                    }`
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setDynamicParameterValues(
                                                        (
                                                            previousValues
                                                        ) => ({
                                                            ...previousValues,
                                                            [paramName]:
                                                                event.target.value
                                                        })
                                                    )
                                                }
                                            />
                                        )}

                                    </div>
                                )
                            }
                        )}

                    </div>

                    {/* REPORT ERROR */}

                    {reportError && (
                        <div
                            className="report-query-message report-query-error"
                        >
                            <i
                                className="fa fa-exclamation-circle"
                                aria-hidden="true"
                            />

                            <span>
                                {reportError}
                            </span>
                        </div>
                    )}

                    {/* ACTION BUTTONS */}

                    <div
                        className="report-filter-actions"
                    >

                        <button
                            type="button"
                            className="run-query-button"
                            onClick={
                                handleRunQuery
                            }
                            disabled={
                                reportLoading
                            }
                        >
                            {reportLoading ? (
                                <>
                                    <i
                                        className="fa fa-spinner fa-spin"
                                        aria-hidden="true"
                                    />

                                    Running...
                                </>
                            ) : (
                                <>
                                    <i
                                        className="fa fa-search"
                                        aria-hidden="true"
                                    />

                                    Run Query
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="download-button"
                            onClick={
                                handleDownload
                            }
                            disabled={
                                reportLoading ||
                                reportData.length ===
                                    0
                            }
                        >
                            <i
                                className="fa fa-download"
                                aria-hidden="true"
                            />

                            Download
                        </button>

                    </div>

                    {/* NO DATA */}

                    {showNoData && (
                        <div
                            className="report-query-message report-no-data"
                        >
                            <i
                                className="fa fa-info-circle"
                                aria-hidden="true"
                            />

                            <span>
                                No data available
                            </span>
                        </div>
                    )}

                    {/* =====================================
                        REPORT RESULT
                    ===================================== */}

                    {reportData.length > 0 && (
                        <div
                            className="report-result-section"
                        >

                            <div className="report-result-header-row">

                                <h3>
                                    Report Data (
                                    {
                                        filteredReportData.length
                                    }{' '}
                                    {filteredReportData.length ===
                                    1
                                        ? 'record'
                                        : 'records'}
                                    {hasColumnFilters &&
                                        ` of ${reportData.length}`}
                                    )
                                </h3>

                                {hasColumnFilters && (
                                    <button
                                        type="button"
                                        className="clear-table-filters-button"
                                        onClick={
                                            handleClearAllColumnFilters
                                        }
                                    >
                                        <i
                                            className="fa fa-times"
                                            aria-hidden="true"
                                        />

                                        Clear Filters
                                    </button>
                                )}

                            </div>

                            <div
                                className="report-result-table-wrapper"
                            >

                                <table
                                    className="report-result-table"
                                >

                                    <thead>
                                        <tr>

                                            {reportColumns.map(
                                                (
                                                    column
                                                ) => {

                                                    const columnValues =
                                                        reportData.map(
                                                            (
                                                                row
                                                            ) =>
                                                                row[
                                                                    column
                                                                ]
                                                        )

                                                    return (
                                                        <th
                                                            key={
                                                                column
                                                            }
                                                        >

                                                            <div className="table-header-content">

                                                                <span
                                                                    className="table-header-text"
                                                                    title={
                                                                        column
                                                                    }
                                                                >
                                                                    {
                                                                        column
                                                                    }
                                                                </span>

                                                                <ColumnFilter
                                                                    column={
                                                                        column
                                                                    }
                                                                    values={
                                                                        columnValues
                                                                    }
                                                                    selectedValues={
                                                                        columnFilters[
                                                                            column
                                                                        ] ||
                                                                        []
                                                                    }
                                                                    onChange={(
                                                                        selectedValues
                                                                    ) =>
                                                                        handleColumnFilterChange(
                                                                            column,
                                                                            selectedValues
                                                                        )
                                                                    }
                                                                />

                                                            </div>

                                                        </th>
                                                    )
                                                }
                                            )}

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {filteredReportData.map(
                                            (
                                                row,
                                                rowIndex
                                            ) => (
                                                <tr
                                                    key={
                                                        rowIndex
                                                    }
                                                >

                                                    {reportColumns.map(
                                                        (
                                                            column
                                                        ) => (
                                                            <td
                                                                key={
                                                                    column
                                                                }
                                                            >
                                                                {
                                                                    row[
                                                                        column
                                                                    ] ===
                                                                        null ||
                                                                    row[
                                                                        column
                                                                    ] ===
                                                                        undefined
                                                                        ? ''
                                                                        : String(
                                                                            row[
                                                                                column
                                                                            ]
                                                                        )
                                                                }
                                                            </td>
                                                        )
                                                    )}

                                                </tr>
                                            )
                                        )}

                                        {filteredReportData.length ===
                                            0 && (
                                            <tr>

                                                <td
                                                    colSpan={
                                                        reportColumns.length
                                                    }
                                                    className="report-table-no-results"
                                                >
                                                    <i
                                                        className="fa fa-filter"
                                                        aria-hidden="true"
                                                    />

                                                    No records match the selected filters.
                                                </td>

                                            </tr>
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>
                    )}

                </div>

            </section>
        </>
    )
}

export default ReportParameter