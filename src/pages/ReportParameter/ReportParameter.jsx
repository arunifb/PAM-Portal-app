import {
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react'
import { useLocation } from 'react-router-dom'
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
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarDays } from 'lucide-react'


// =================================================
// MULTI SELECT DROPDOWN
// =================================================

function MultiSelectDropdown({
    options = [],
    selectedValues = [],
    onChange,
    placeholder = 'Select',
    loading = false,
    error = '',
    maxSelections = 5
}) {
    const [open, setOpen] = useState(false)
    const [showLimitModal, setShowLimitModal] = useState(false)

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

    // The first 5 options are selected when "Select all" is checked
    const selectAllValues = actualOptions
        .slice(0, maxSelections)
        .map((option) => String(option.value))

    const isAllSelected =
        selectAllValues.length > 0 &&
        selectAllValues.every((value) =>
            selectedValues.includes(value)
        )

    // =========================================
    // SELECT ALL / SELECT 5
    // =========================================

    const handleAllChange = () => {

        if (isAllSelected) {
            onChange([])
            return
        }

        const valuesToSelect =
            actualOptions
                .slice(0, maxSelections)
                .map((option) =>
                    String(option.value)
                )

        onChange(valuesToSelect)
    }

    // =========================================
    // INDIVIDUAL OPTION
    // =========================================

    const handleOptionChange = (value) => {

        const stringValue = String(value)

        // Uncheck selected option
        if (
            selectedValues.includes(stringValue)
        ) {
            onChange(
                selectedValues.filter(
                    (item) =>
                        item !== stringValue
                )
            )

            return
        }

        // Maximum 5 selections
        if (
            selectedValues.length >=
            maxSelections
        ) {
            setShowLimitModal(true)
            return
        }

        onChange([
            ...selectedValues,
            stringValue
        ])
    }

    // =========================================
    // INPUT DISPLAY
    // =========================================

    const getDisplayText = () => {

        if (selectedValues.length === 0) {
            return 'Select all'
        }

        return `${selectedValues.length} selected`
    }

    return (
        <div
            className="multi-select-dropdown"
            ref={dropdownRef}
        >
            {/* =========================================
                INPUT / BUTTON
            ========================================= */}

            <button
                type="button"
                className="multi-select-button"
                onClick={() =>
                    !loading &&
                    setOpen(!open)
                }
                disabled={loading}
            >
                <span
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >

                    {loading ? (
                        'Loading...'
                    ) : error ? (
                        'Unable to load'
                    ) : selectedValues.length === 0 ? (

                        <>
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={(event) => {
                                    event.stopPropagation()
                                    handleAllChange()
                                }}
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                            />

                            <span>
                                Select all
                            </span>
                        </>

                    ) : (
                        getDisplayText()
                    )}

                </span>

                <i
                    className={`fa fa-chevron-down ${
                        open ? 'open' : ''
                    }`}
                    aria-hidden="true"
                />
            </button>


            {/* =========================================
                DROPDOWN OPTIONS
                NO SELECT ALL ROW HERE
            ========================================= */}

            {open &&
                !loading &&
                !error && (
                    <div className="multi-select-menu">

                        {actualOptions.map(
                            (
                                option,
                                index
                            ) => {

                                const value =
                                    String(
                                        option.value
                                    )

                                const checked =
                                    selectedValues.includes(
                                        value
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
                                            checked={
                                                checked
                                            }
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


            {/* =========================================
                MAXIMUM SELECTION MODAL
            ========================================= */}

            {showLimitModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="multi-select-limit-title"
                    onClick={() =>
                        setShowLimitModal(false)
                    }
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor:
                            'rgba(0, 0, 0, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                >

                    <div
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            padding: '20px',
                            minWidth: '320px',
                            maxWidth: '420px',
                            boxShadow:
                                '0 4px 20px rgba(0, 0, 0, 0.25)',
                            textAlign: 'center'
                        }}
                    >

                        <div
                            id="multi-select-limit-title"
                            style={{
                                fontSize: '18px',
                                fontWeight: 600,
                                marginBottom: '10px'
                            }}
                        >
                            Selection Limit
                        </div>

                        <div
                            style={{
                                fontSize: '15px',
                                marginBottom: '18px'
                            }}
                        >
                            You can not select more than 5 options
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setShowLimitModal(false)
                            }
                            style={{
                                border: 'none',
                                borderRadius: '5px',
                                padding: '8px 18px',
                                cursor: 'pointer'
                            }}
                        >
                            OK
                        </button>

                    </div>

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

    const uniqueValues = useMemo(() => {
        return Array.from(
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
    }, [values])

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

// Add For Date Picker
// =========================================
// DATE PICKER HELPERS
// =========================================

const parseDate = (value) => {
    if (!value) return null

    const parts = value.split('-')

    if (parts.length !== 3) return null

    const [year, month, day] = parts.map(Number)

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

const formatDate = (date) => {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}


// =================================================
// MAIN COMPONENT
// =================================================

function ReportParameter({ report: reportProp, onBack }) {
    const location = useLocation()
const report = reportProp || location.state?.report

    const [parameters, setParameters] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [regions, setRegions] = useState([])
    // const [selectedRegion, setSelectedRegion] =
    //     useState('')
    const [selectedRegion, setSelectedRegion] = useState('')
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
    // PAGINATION — always on; backend handles paged vs full automatically
    // =================================================

    const pageSize = 5
    const [currentPage, setCurrentPage] = useState(1)
    const [totalRecords, setTotalRecords] = useState(0)
    const [downloadLoading, setDownloadLoading] = useState(false)

    // =================================================
    // TABLE FILTER STATE
    // =================================================

    const [columnFilters, setColumnFilters] =
        useState({})

    // =================================================
    // LOGGED-IN USER DETAILS
    // =================================================

    const loggedInUserId =
    sessionStorage.getItem('userId') || ''

    const loggedInRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const storedRoles = (() => {
    try {
        const roles = JSON.parse(
            sessionStorage.getItem('roles') || '[]'
        )

        return Array.isArray(roles) ? roles : []
    } catch {
        return []
    }
})()

const loggedInRoleId = String(
    storedRoles.length > 0
        ? storedRoles[0]
        : sessionStorage.getItem('roleId') || ''
)


    const loggedInLoginId =
        sessionStorage.getItem('loginId') || ''

    const loggedInBpCode =
        sessionStorage.getItem('bpCode') || ''


        console.log({
    roleId: loggedInRoleId,
    regionCode: loggedInRegionCode,
    bpCode: loggedInBpCode
})

    const loggedInFranchiseCode =
    sessionStorage.getItem('frCode') ||
    sessionStorage.getItem('franchiseCode') ||
    sessionStorage.getItem('FrCode') ||
    ''

    // =================================================
    // ROLE IDs
    // =================================================

    const REGION_ROLE_ID = '1'
    const ROLE_2_ID = '2'
    const FRANCHISE_ROLE_ID = '5'
    const BRANCH_ROLE_ID = '6'
    const FACTORY_ROLE_ID = '7'
    const ROLE_3_ID = '3'


    const isRegionUser =
        String(loggedInRoleId) === REGION_ROLE_ID

        const isRole2 =
    loggedInRoleId === ROLE_2_ID

    const isBranchUser =
        String(loggedInRoleId) === BRANCH_ROLE_ID

    const isFranchiseUser =
        String(loggedInRoleId) === FRANCHISE_ROLE_ID

    const isFactoryUser =
        String(loggedInRoleId) === FACTORY_ROLE_ID

    const isRole3 =
    String(loggedInRoleId) === ROLE_3_ID

    const isFactoryLikeUser =
    isFactoryUser || isRole2

    const isRegionOrFactoryUser =
        isRegionUser || isFactoryLikeUser

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

// useEffect(() => {
//     const loadUserRegion = async () => {
//         try {
//             setRegionLoading(true)
//             setRegionError('')

//             const data = await getRegions(
//                 '',
//                 loggedInUserId
//             )

//             const regionData = Array.isArray(data)
//                 ? data
//                 : []

//             setRegions(regionData)

//             if (isFactoryUser) {
//                 setSelectedRegion('All')
//             } else if (isRole3 || isFranchiseUser) {
//                 const matchingRegion = regionData.find(
//                     (region) =>
//                         String(
//                             region.regionCode ??
//                             region.RegionCode ??
//                             ''
//                         ).trim() ===
//                         String(loggedInRegionCode).trim()
//                 )

//                 setSelectedRegion(
//                     matchingRegion
//                         ? String(
//                             matchingRegion.regionCode ??
//                             matchingRegion.RegionCode
//                         )
//                         : ''
//                 )
//             } else {
//                 setSelectedRegion('')
//             }
//         } catch (error) {
//             console.error(
//                 'Load region error:',
//                 error
//             )

//             setRegions([])
//             setSelectedRegion('')

//             setRegionError(
//                 error.message ||
//                 'Unable to load region.'
//             )
//         } finally {
//             setRegionLoading(false)
//         }
//     }

//     loadUserRegion()
// }, [
//     loggedInUserId,
//     loggedInRegionCode,
//     isFactoryUser,
//     isRole3,
//     isFranchiseUser
// ])

// =================================================
// LOAD USER REGION — PRESELECT FOR ROLE 3 AND 6
// =================================================

useEffect(() => {
    let cancelled = false

    const loadUserRegion = async () => {
        try {
            setRegionLoading(true)
            setRegionError('')

            const data = await getRegions('', loggedInUserId)

            if (cancelled) return

            const regionData = Array.isArray(data) ? data : []
            setRegions(regionData)

            console.log('Region API data:', regionData)
            console.log('Logged-in region code:', loggedInRegionCode)
            console.log('Logged-in role ID:', loggedInRoleId)

            if (isFactoryLikeUser) {
                setSelectedRegion('All')
                return
            }

            if (isRole3 || isBranchUser || isFranchiseUser) {
                const matchingRegion = regionData.find((region) => {
                    const code =
                        region.regionCode ??
                        region.RegionCode ??
                        region.region_Code ??
                        region.Region_Code ??
                        ''

                    return (
                        String(code).trim().toLowerCase() ===
                        String(loggedInRegionCode).trim().toLowerCase()
                    )
                })

                const code = matchingRegion
                    ? String(
                        matchingRegion.regionCode ??
                        matchingRegion.RegionCode ??
                        matchingRegion.region_Code ??
                        matchingRegion.Region_Code ??
                        ''
                    )
                    : ''

                setSelectedRegion(code)

                if (!code) {
                    console.warn(
                        'Region preselection failed. Check the region code and Region API response.'
                    )
                }
            } else {
                setSelectedRegion('')
            }
        } catch (error) {
            if (cancelled) return

            console.error('Load region error:', error)
            setRegions([])
            setSelectedRegion('')
            setRegionError(
                error.message || 'Unable to load region.'
            )
        } finally {
            if (!cancelled) {
                setRegionLoading(false)
            }
        }
    }

    loadUserRegion()

    return () => {
        cancelled = true
    }
}, [
    loggedInUserId,
    loggedInRegionCode,
    loggedInRoleId,
    isFactoryLikeUser,
    isRole3,
    isBranchUser,
    isFranchiseUser
])

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

                setSelectedCallTypes([])
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

                setSelectedStatuses([])
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
// LOAD USER BRANCHES — PRESELECT FOR ROLE 3 AND 6
// =================================================

useEffect(() => {
    let cancelled = false

    const loadUserBranch = async () => {
        setBranchError('')

        if (!selectedRegion) {
            setBranches([])
            setSelectedBranch('')
            setBranchLoading(false)
            return
        }

        if (!loggedInRoleId) {
            setBranches([])
            setSelectedBranch('')
            setBranchLoading(false)
            setBranchError('Unable to determine logged-in role.')
            return
        }

        if (
            (isBranchUser || isRole3 || isFranchiseUser) &&
            !loggedInBpCode
        ) {
            setBranches([])
            setSelectedBranch('')
            setBranchLoading(false)
            setBranchError('Unable to determine logged-in branch.')
            console.warn('Missing logged-in bpCode in sessionStorage.')
            return
        }

        try {
            setBranchLoading(true)

            const data = await getBranches(
                loggedInUserId,
                selectedRegion === 'All' ? '' : selectedRegion
            )

            if (cancelled) return

            const branchData = Array.isArray(data) ? data : []
            setBranches(branchData)

            console.log('Branch API data:', branchData)
            console.log('Logged-in BP code:', loggedInBpCode)
            console.log('Selected region:', selectedRegion)

            if (isRegionOrFactoryUser) {
                setSelectedBranch('All')
                return
            }

            if (isBranchUser || isRole3 || isFranchiseUser) {
                const matchingBranch = branchData.find((branch) => {
                    const code =
                        branch.bpCode ??
                        branch.BPCode ??
                        branch.bpcode ??
                        branch.branchCode ??
                        branch.BranchCode ??
                        branch.branch_code ??
                        ''

                    return (
                        String(code).trim().toLowerCase() ===
                        String(loggedInBpCode).trim().toLowerCase()
                    )
                })

                const code = matchingBranch
                    ? String(
                        matchingBranch.bpCode ??
                        matchingBranch.BPCode ??
                        matchingBranch.bpcode ??
                        matchingBranch.branchCode ??
                        matchingBranch.BranchCode ??
                        matchingBranch.branch_code ??
                        ''
                    )
                    : ''

                setSelectedBranch(code)

                if (!code) {
                    console.warn(
                        'Branch preselection failed. Check the BPCode and Branch API response.'
                    )
                }
            } else {
                setSelectedBranch('All')
            }
        } catch (error) {
            if (cancelled) return

            console.error('Load branches error:', error)

            setBranches([])
            setSelectedBranch('')
            setBranchError(
                error.message || 'Unable to load branches.'
            )
        } finally {
            if (!cancelled) {
                setBranchLoading(false)
            }
        }
    }

    loadUserBranch()

    return () => {
        cancelled = true
    }
}, [
    selectedRegion,
    loggedInUserId,
    loggedInRoleId,
    loggedInBpCode,
    isRegionOrFactoryUser,
    isBranchUser,
    isRole3,
    isFranchiseUser
])
    
    // =================================================
// LOAD FRANCHISES
// =================================================

useEffect(() => {
    let cancelled = false

    const loadFranchises = async () => {
        setFranchiseError('')
        setFranchises([])

        // Region and Factory users must choose a specific branch.
        if (
            isRegionOrFactoryUser &&
            (!selectedBranch || selectedBranch === 'All')
        ) {
            setSelectedFranchise('All')
            setFranchiseLoading(false)
            return
        }

        if (!selectedBranch) {
            setSelectedFranchise(
                isFranchiseUser ? '' : 'All'
            )
            setFranchiseLoading(false)
            return
        }

        if (!loggedInRoleId || !loggedInLoginId) {
            setSelectedFranchise(
                isFranchiseUser ? '' : 'All'
            )
            setFranchiseLoading(false)
            setFranchiseError(
                !loggedInRoleId
                    ? 'Unable to determine logged-in role.'
                    : 'Unable to determine logged-in Login ID.'
            )
            return
        }

        // Roles 3, 5, and 6 must use their logged-in BPCode.
        // Roles 1 and 7 use the selected branch, which cannot be All here.
        const branchCode = isRegionOrFactoryUser
            ? selectedBranch
            : loggedInBpCode

        if (
            !branchCode ||
            String(branchCode).trim().toLowerCase() === 'all'
        ) {
            setSelectedFranchise(
                isFranchiseUser ? '' : 'All'
            )
            setFranchiseLoading(false)
            setFranchiseError(
                'Please select a specific branch.'
            )
            return
        }

        try {
            setFranchiseLoading(true)

            console.log('Franchise API request:', {
                roleId: loggedInRoleId,
                bpCode: branchCode,
                loginId: loggedInLoginId
            })

            const data = await getFranchises(
                branchCode,
                loggedInLoginId
            )


            if (cancelled) return

            const franchiseData = Array.isArray(data)
                ? [...data]
                : []

            franchiseData.sort((a, b) => {
                const nameA = String(
                    a.frName ??
                    a.FrName ??
                    a.franchiseName ??
                    a.FranchiseName ??
                    a.name ??
                    a.Name ??
                    ''
                )

                const nameB = String(
                    b.frName ??
                    b.FrName ??
                    b.franchiseName ??
                    b.FranchiseName ??
                    b.name ??
                    b.Name ??
                    ''
                )

                return nameA.localeCompare(nameB)
            })

            setFranchises(franchiseData)

            if (isFranchiseUser) {
                const matchingFranchise = loggedInFranchiseCode
                    ? franchiseData.find((franchise) => {
                        const code =
                            franchise.frCode ??
                            franchise.FrCode ??
                            franchise.franchiseCode ??
                            franchise.FranchiseCode ??
                            ''

                        return (
                            String(code).trim() ===
                            String(loggedInFranchiseCode).trim()
                        )
                    })
                    : null

                const selectedFranchiseData =
                    matchingFranchise || franchiseData[0]

                const code =
                    selectedFranchiseData?.frCode ??
                    selectedFranchiseData?.FrCode ??
                    selectedFranchiseData?.franchiseCode ??
                    selectedFranchiseData?.FranchiseCode ??
                    ''

                setSelectedFranchise(String(code))
            } else {
                setSelectedFranchise('All')
            }
        } catch (error) {
            if (cancelled) return

            console.error('Load franchises error:', error)

            setFranchises([])
            setSelectedFranchise(
                isFranchiseUser ? '' : 'All'
            )

            setFranchiseError(
                error.message || 'Unable to load franchises.'
            )
        } finally {
            if (!cancelled) {
                setFranchiseLoading(false)
            }
        }
    }

    loadFranchises()

    return () => {
        cancelled = true
    }
}, [
    selectedBranch,
    loggedInRoleId,
    loggedInLoginId,
    loggedInBpCode,
    loggedInFranchiseCode,
    isRegionOrFactoryUser,
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
    // BUILD BASE PARAMETERS (no paging)
    // =================================================

    const buildReportParameters = () => {
        const reportParameters = {}
        parameters.forEach((parameter) => {
            const paramName = String(parameter.paramName || '').trim()
            if (!paramName) return
            const question = String(parameter.question || '').trim()
            const requestParamName = getRequestParameterName(paramName, question)
            const value = getParameterValue(paramName, question)
            reportParameters[requestParamName] = value === undefined ? null : value
        })
        return reportParameters
    }

    // =================================================
    // FETCH ONE PAGE (backend returns TotalRecords on each row)
    // =================================================

    const fetchReportPage = async (pageNumber) => {
        const reportParameters = buildReportParameters()
        reportParameters.PageNumber = pageNumber
        reportParameters.PageSize = pageSize

        try {
            setReportLoading(true)
            setReportError('')

            const data = await runReport(report.reportID, reportParameters)

            if (!Array.isArray(data) || data.length === 0) {
                setReportData([])
                setTotalRecords(0)
                setShowNoData(true)
                return
            }

            setTotalRecords(Number(data[0].TotalRecords) || data.length)
            setReportData(data)
            setCurrentPage(pageNumber)
            setShowNoData(false)
        } catch (error) {
            console.error('Run report error:', error)
            setReportError(error.message || 'Unable to run report.')
            setReportData([])
            setTotalRecords(0)
            setShowNoData(false)
        } finally {
            setReportLoading(false)
        }
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
            !selectedRegion && !isFactoryLikeUser
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
        // CALL TYPE / STATUS VALIDATION
        // =================================================

        const hasCallTypeParameter =
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
                        name ===
                            'calltype' ||
                        question ===
                            'call type'
                    )
                }
            )


        const hasStatusParameter =
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
                        name ===
                            'status' ||
                        question ===
                            'status'
                    )
                }
            )


        const callTypeEmpty =
            hasCallTypeParameter &&
            selectedCallTypes.length === 0

        const statusEmpty =
            hasStatusParameter &&
            selectedStatuses.length === 0


        if (
            callTypeEmpty &&
            statusEmpty
        ) {

            setReportError(
                'Please select at least one Call Type and Status.'
            )

            return
        }


        if (callTypeEmpty) {

            setReportError(
                'Please select at least one Call Type.'
            )

            return
        }


        if (statusEmpty) {

            setReportError(
                'Please select at least one Status.'
            )

            return
        }


        // Validation passed -> load the first page.
        setCurrentPage(1)
        await fetchReportPage(1)
    }

    // =================================================
    // TABLE COLUMNS  (TotalRecords is a paging helper, not a real column)
    // =================================================

    const reportColumns = useMemo(() => {
        return reportData.length > 0
            ? Object.keys(
                reportData[0]
            ).filter((c) => c !== 'TotalRecords')
            : []
    }, [reportData])

    // =================================================
    // FILTERED REPORT DATA (applies to the current page only)
    // =================================================

    const filteredReportData = useMemo(() => {

        const hasActiveFilters =
            Object.keys(columnFilters).length > 0 &&
            Object.values(columnFilters).some(
                (values) =>
                    values && values.length > 0
            )

        if (!hasActiveFilters) {
            return reportData
        }

        return reportData.filter(
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
    }, [reportData, reportColumns, columnFilters])

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
    // DOWNLOAD EXCEL  (separate FULL fetch — no paging params)
    // =================================================

    const handleDownload = async () => {
        try {
            setDownloadLoading(true)

            const reportParameters = buildReportParameters()
            // NO PageNumber / PageSize => backend returns ALL rows
            const data = await runReport(report.reportID, reportParameters)

            if (!Array.isArray(data) || data.length === 0) {
                return
            }

            // remove the paging helper column if present
            const cleaned = data.map(({ TotalRecords, ...rest }) => rest)

            const worksheet =
                XLSX.utils.json_to_sheet(cleaned)

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
        } catch (error) {
            console.error('Download error:', error)
        } finally {
            setDownloadLoading(false)
        }
    }

    // =================================================
    // PAGER
    // =================================================

    const totalPages = Math.ceil(totalRecords / pageSize)

    // =================================================
    // NO REPORT
    // =================================================

    if (!report) {
    return (
        <DashboardLayout title="Report Parameter">
            <section className="report-parameter-section">
                <div className="report-parameter-empty">
                    <i
                        className="fa fa-exclamation-triangle"
                        aria-hidden="true"
                    />
                    <h3>No report selected</h3>
                    <p>
                        Please select a report from the Report Data section.
                    </p>
                </div>
            </section>
        </DashboardLayout>
    )
}

    // =================================================
    // LOADING
    // =================================================

    if (loading) {
    return (
        <DashboardLayout title="Report Parameter">
            <section className="report-parameter-section">
                <div className="report-parameter-empty">
                    <i
                        className="fa fa-spinner fa-spin"
                        aria-hidden="true"
                    />
                    <h3>Loading report parameters...</h3>
                </div>
            </section>
        </DashboardLayout>
    )
}

    // =================================================
    // ERROR
    // =================================================

    if (error) {
    return (
        <DashboardLayout title="Report Parameter">
            <section className="report-parameter-section">
                <div className="report-parameter-empty">
                    <i
                        className="fa fa-exclamation-triangle"
                        aria-hidden="true"
                    />
                    <h3>Unable to load report parameters</h3>
                    <p>{error}</p>
                </div>
            </section>
        </DashboardLayout>
    )
}

    // =================================================
    // MAIN PAGE
    // =================================================

    return (
    <DashboardLayout
    title={report?.reportType || 'Report Parameter'}
    icon={report?.imageUrl || ''}
>
            <section
                className="report-parameter-section"
            >

                {/* =====================================
                    HEADER
                ===================================== */}
                <div className="report-parameter-header">
                    <button
                        type="button"
                        className="af-button af-button-secondary"
                        onClick={() => {
                            if (typeof onBack === 'function') {
                                onBack()
                            }
                        }}
                    >
                        <span className="back-arrow" aria-hidden="true">←</span>
                        <span>Back</span>
                    </button>
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

                                // Call Type and Status
                                // are mandatory too.

                                const mandatory =
                                    isRegion ||
                                    isBranch ||
                                    isFranchise ||
                                    isCallBookDt ||
                                    isCallType ||
                                    isStatus ||
                                    isFromDate ||
                                    isToDate

                                return (
                                    <div
                                            key={
                                                parameter.id ??
                                                `${paramName}-${parameter.serial}`
                                            }
                                            className="report-filter-field"
                                            style={{
                                                gridColumn:
                                                    isCallType || isStatus
                                                        ? 'span 2'
                                                        : 'span 1'
                                            }}
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
                                                    onChange={(event) =>
                                                        setSelectedRegion(
                                                            event.target.value
                                                        )
                                                    }
                                                    disabled={regionLoading || isRole3 || isBranchUser}
                                                >

                                                {/* <option value="">
                                                    {regionLoading
                                                        ? 'Loading region...'
                                                        : regionError
                                                            ? 'Unable to load region'
                                                            : 'Select Region'}
                                                </option> */}

                                                <option value={isFactoryLikeUser ? 'All' : ''}>
                                                    {regionLoading
                                                        ? 'Loading region...'
                                                        : regionError
                                                            ? 'Unable to load region'
                                                            : isFactoryLikeUser
                                                                ? 'All'
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

                                                {isRegionOrFactoryUser && (
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
                                                maxSelections={5}
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
                                                // maxSelections={5}
                                                 maxSelections={statuses.length}
                                            />
                                        )}

                                        {/* FROM DATE */}

                                        {isFromDate && (
                                            // <input
                                            //     type="date"
                                            //     className="report-filter-control"
                                            //     value={
                                            //         selectedFromDate
                                            //     }
                                            //     min={
                                            //         calendarMinDate
                                            //     }
                                            //     max={
                                            //         calendarMaxDate
                                            //     }
                                            //     onChange={(
                                            //         event
                                            //     ) =>
                                            //         setSelectedFromDate(
                                            //             event.target.value
                                            //         )
                                            //     }
                                            // />


                                            <div className="report-date-picker-container">
                                                <DatePicker
                                                    selected={parseDate(selectedFromDate)}
                                                    onChange={(date) => {
                                                        setSelectedFromDate(formatDate(date))
                                                    }}
                                                    minDate={parseDate(calendarMinDate)}
                                                    maxDate={parseDate(calendarMaxDate)}
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="Select from date"
                                                    className="report-filter-control report-date-control from-date-picker"
                                                    wrapperClassName="report-date-picker-wrapper"
                                                    showPopperArrow={false}
                                                    autoComplete="off"
                                                    isClearable={false}
                                                />

                                                <button
                                                    type="button"
                                                    className="report-calendar-icon"
                                                    aria-label="Open From Date calendar"
                                                    onClick={() => {
                                                        document
                                                            .querySelector('.from-date-picker')
                                                            ?.focus()
                                                    }}
                                                >
                                                    <CalendarDays size={16} />
                                                </button>
                                            </div>
                                        )}

                                        {/* TO DATE */}

                                        {isToDate && (
                                            // <input
                                            //     type="date"
                                            //     className="report-filter-control"
                                            //     value={
                                            //         selectedToDate
                                            //     }
                                            //     min={
                                            //         calendarMinDate
                                            //     }
                                            //     max={
                                            //         calendarMaxDate
                                            //     }
                                            //     onChange={(
                                            //         event
                                            //     ) =>
                                            //         setSelectedToDate(
                                            //             event.target.value
                                            //         )
                                            //     }
                                            // />

                                            <div className="report-date-picker-container">
                                                <DatePicker
                                                    selected={parseDate(selectedToDate)}
                                                    onChange={(date) => {
                                                        setSelectedToDate(formatDate(date))
                                                    }}
                                                    minDate={parseDate(calendarMinDate)}
                                                    maxDate={parseDate(calendarMaxDate)}
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="Select to date"
                                                    className="report-filter-control report-date-control to-date-picker"
                                                    wrapperClassName="report-date-picker-wrapper"
                                                    popperClassName="to-date-picker-popper"
                                                    popperPlacement="bottom-end"
                                                    showPopperArrow={false}
                                                    autoComplete="off"
                                                    isClearable={false}
                                                />

                                                <button
                                                    type="button"
                                                    className="report-calendar-icon"
                                                    aria-label="Open To Date calendar"
                                                    onClick={() => {
                                                        document
                                                            .querySelector('.to-date-picker')
                                                            ?.focus()
                                                    }}
                                                >
                                                    <CalendarDays size={16} />
                                                </button>
                                            </div>
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
                                downloadLoading ||
                                reportLoading ||
                                reportData.length ===
                                    0
                            }
                        >
                            {downloadLoading ? (
                                <>
                                    <i
                                        className="fa fa-spinner fa-spin"
                                        aria-hidden="true"
                                    />

                                    Preparing...
                                </>
                            ) : (
                                <>
                                    <i
                                        className="fa fa-download"
                                        aria-hidden="true"
                                    />

                                    Download
                                </>
                            )}
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

<h3 className="report-result-title">
  Showing {filteredReportData.length} of {totalRecords} records
  <span style={{ fontSize: '13px', fontWeight: '500', color: '#0e0c0c', marginLeft: '10px' }}>
    (Click Download to get all {totalRecords} records)
  </span>
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
        </DashboardLayout>
    )
}

export default ReportParameter