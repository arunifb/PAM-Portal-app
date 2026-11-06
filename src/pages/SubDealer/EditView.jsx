import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DashboardLayout
    from '../../components/DashboardLayout/DashboardLayout'

import {
    searchSubDealerRequisitions,
    getSubDealerById,
    updateSubDealerRequisition,
    downloadSubDealerRequisitions,
    createSubDealerRequisition,
    searchSubDealerDealers,
    getSubDealerArea,
    searchSubDealerNames,
    searchExistingSubDealer
} from '../../api/subDealerApi'

import {
    getRegions,
    getBranches,
    getProducts
} from '../../api/reportsApi'

import './EditView.css'


// =====================================================
// SHARED HELPERS
// =====================================================

const getSessionValue = (...keys) => {
    for (const key of keys) {
        const value = sessionStorage.getItem(key)

        if (value !== null && value !== '') {
            return value
        }
    }

    return ''
}

const getArray = (data) => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.records)) return data.records

    return []
}

const getOptionCode = (item) => String(
    item?.regionCode ??
    item?.RegionCode ??
    item?.branchRefId ??
    item?.BranchRefId ??
    item?.bpCode ??
    item?.BPCode ??
    item?.productCode ??
    item?.ProductCode ??
    item?.code ??
    item?.Code ??
    item?.id ??
    item?.Id ??
    ''
)

const getOptionName = (item) => String(
    item?.regionName ??
    item?.RegionName ??
    item?.branchName ??
    item?.BranchName ??
    item?.productName ??
    item?.ProductName ??
    item?.name ??
    item?.Name ??
    item?.description ??
    item?.Description ??
    ''
)

const getDealerCode = (item) => String(
    item?.billToPartyCode ??
    item?.BillToPartyCode ??
    item?.sapeccCode ??
    item?.SAPECCCode ??
    item?.dealerCode ??
    item?.DealerCode ??
    ''
)

const getDealerName = (item) => String(
    item?.billToPartyName ??
    item?.BillToPartyName ??
    item?.sapName ??
    item?.SAPName ??
    item?.dealerName ??
    item?.DealerName ??
    ''
)

const getStoreName = (item) => String(
    item?.storeName ??
    item?.StoreName ??
    item?.subDealerName ??
    item?.SubDealerName ??
    item?.shipToPartyName ??
    item?.ShipToPartyName ??
    item?.Ship_to_Party_Name ??
    item?.name ??
    item?.Name ??
    ''
)

const emptyCreateForm = () => ({
    dealerCode: '',
    dealerName: '',
    dealerSearch: '',
    storeName: '',
    storeSearch: '',
    postalCode: '',
    state: '',
    district: '',
    city: '',
    area: '',
    regionCode: '',
    branchCode: '',
    street: '',
    street2: '',
    street3: '',
    shopArea: '',
    identificationOfShop: '',
    contactNo: '',
    contactPersonName: '',
    email: '',
    gstn: '',
    products: []
})


// =====================================================
// MAIN COMPONENT
// =====================================================

function EditView() {
    // const roleId = Number(
    //     getSessionValue('roleId', 'RoleID', 'roleID') || '1'
    // )

    // const navigate = useNavigate()

    // const isRole1 = roleId === 1
    // const isRole6 = roleId === 6

    // const userId = getSessionValue('userId', 'UserID')
    // const bpCode = getSessionValue('bpCode', 'BPCode')
    // const sessionRegionCode = getSessionValue(
    //     'regionCode',
    //     'RegionCode'
    // )

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
        console.error('Unable to parse stored roles:', error)
    }

    const navigate = useNavigate()

    const isRole1 = storedRoles.includes('1')
    const isRole6 = storedRoles.includes('6')

    const userId = getSessionValue('userId', 'UserID')
    const bpCode = getSessionValue('bpCode', 'BPCode')
    const sessionRegionCode = getSessionValue(
        'regionCode',
        'RegionCode'
    )

    // =================================================
    // ROLE 1 STATE
    // =================================================

    const [searchStatus, setSearchStatus] = useState('1')
    const [records, setRecords] = useState([])
    const [selectedIds, setSelectedIds] = useState([])
    const [loading, setLoading] = useState(false)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState('edit')
    const [modalLoading, setModalLoading] = useState(false)

    const [formData, setFormData] = useState({
        requisitionId: '',
        dealerCode: '',
        dealerName: '',
        storeName: '',
        subDealerCode: '',
        postalCode: '',
        state: '',
        district: '',
        city: '',
        area: '',
        status: 'Please select'
    })

    // =================================================
    // ROLE 6 STATE
    // =================================================

    const [createForm, setCreateForm] = useState(emptyCreateForm())

    const [regions, setRegions] = useState([])
    const [branches, setBranches] = useState([])
    const [products, setProducts] = useState([])

    const [dealerOptions, setDealerOptions] = useState([])
    const [storeOptions, setStoreOptions] = useState([])

    const [showDealerOptions, setShowDealerOptions] = useState(false)
    const [showStoreOptions, setShowStoreOptions] = useState(false)

    const [role6Loading, setRole6Loading] = useState(false)
    const [role6Saving, setRole6Saving] = useState(false)

    const [role6Error, setRole6Error] = useState('')
    const [role6Success, setRole6Success] = useState('')

    const [areaLoading, setAreaLoading] = useState(false)

    const [stateOptions, setStateOptions] = useState([])
    const [districtOptions, setDistrictOptions] = useState([])
    const [cityOptions, setCityOptions] = useState([])
    const [areaOptions, setAreaOptions] = useState([])

    const [regionRefId, setRegionRefId] = useState('')
    const [branchRefId, setBranchRefId] = useState('')

    // =================================================
    // ROLE 1: INITIAL LOAD
    // =================================================

    useEffect(() => {
        if (isRole1) {
            loadRecords('1')
        }
    }, [isRole1])

    // =================================================
    // ROLE 6: INITIAL LOAD
    // =================================================

    useEffect(() => {
        if (isRole6) {
            loadRole6Data()
        }
    }, [isRole6])

    const loadRole6Data = async () => {
        setRole6Loading(true)
        setRole6Error('')

        try {
            const [
                regionResponse,
                branchResponse,
                productResponse
            ] = await Promise.all([
                getRegions('', userId),
                getBranches(userId, sessionRegionCode),
                getProducts()
            ])

            const regionList = getArray(regionResponse)
            const branchList = getArray(branchResponse)
            const productList = getArray(productResponse)

            setRegions(regionList)
            setBranches(branchList)
            setProducts(productList)

            const matchingRegion = regionList.find(item =>
                getOptionCode(item) === sessionRegionCode
            )

            const matchingBranch = branchList.find(item =>
                getOptionCode(item) === bpCode
            )

            setRegionRefId(
                matchingRegion?.regionRefId ??
                matchingRegion?.RegionRefId ??
                matchingRegion?.regionId ??
                matchingRegion?.RegionID ??
                matchingRegion?.id ??
                matchingRegion?.Id ??
                sessionRegionCode
            )

            setBranchRefId(
                matchingBranch?.branchRefId ??
                matchingBranch?.BranchRefId ??
                matchingBranch?.branchId ??
                matchingBranch?.BranchID ??
                bpCode
            )

            setCreateForm(previous => ({
                ...previous,
                regionCode: sessionRegionCode,
                branchCode: bpCode
            }))
        } catch (err) {
            console.error('Role 6 initial load error:', err)

            setRole6Error(
                err.message ||
                'Unable to load regions, branches, and products.'
            )
        } finally {
            setRole6Loading(false)
        }
    }

    // =================================================
    // ROLE 1: SEARCH
    // =================================================

    const loadRecords = async (status = searchStatus) => {
        setLoading(true)
        setError('')
        setSuccess('')
        setSelectedIds([])

        try {
            const request = {
                CreatedBy: '',
                RequisitionId: '',
                SubDealerStatus: status,
                BranchRefId: ''
            }

            const data = await searchSubDealerRequisitions(request)

            if (!Array.isArray(data)) {
                throw new Error('Invalid sub-dealer response.')
            }

            setRecords(data)
        } catch (err) {
            console.error('Sub-dealer search error:', err)
            setRecords([])

            setError(
                err.message ||
                'Unable to load sub-dealer requisitions.'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        loadRecords(searchStatus)
    }

    const handleCheckboxChange = (requisitionId) => {
        const id = String(requisitionId)

        setSelectedIds(previous => (
            previous.includes(id)
                ? previous.filter(item => item !== id)
                : [...previous, id]
        ))
    }

    const handleSelectAll = (checked) => {
        setSelectedIds(
            checked
                ? records.map(record => String(record.requisitionId))
                : []
        )
    }

    // =================================================
    // ROLE 1: STATUS HELPERS
    // =================================================

    const getStatusValue = (status) => {
        if (status === 'Inprogress') return '12'

        if (status === 'Sub-Dealer Code Issued') return '11'

        if (status === '12' || status === 12) return '12'

        if (status === '11' || status === 11) return '11'

        return 'Please select'
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending for Approval':
                return 'status-pending'

            case 'Correction Required':
                return 'status-correction'

            case 'Downloaded':
                return 'status-downloaded'

            case 'Sub-Dealer Code Issued':
                return 'status-issued'

            default:
                return 'status-closed'
        }
    }

    // =================================================
    // ROLE 1: OPEN EDIT / VIEW
    // =================================================

    const handleOpenModal = async (record, mode) => {
        setModalMode(mode)
        setShowModal(true)
        setModalLoading(true)
        setError('')
        setSuccess('')

        try {
            const id = record?.requisitionId
            const data = await getSubDealerById(id)

            if (!data) {
                throw new Error('Sub-dealer details not found.')
            }

            setFormData({
                requisitionId: data.requisitionId ?? id ?? '',
                dealerCode: data.sapeccCode ?? '',
                dealerName: data.sapName ?? '',
                storeName: data.storeName ?? '',
                subDealerCode: data.subDealerCode ?? '',
                postalCode: data.pinCode ?? '',
                state: data.state ?? '',
                district: data.district ?? '',
                city: data.subDealerCity ?? '',
                area: data.shopArea ?? '',
                status: getStatusValue(data.subDealerStatus)
            })
        } catch (err) {
            console.error('Sub-dealer details error:', err)

            setError(
                err.message ||
                'Unable to load sub-dealer details.'
            )

            setShowModal(false)
        } finally {
            setModalLoading(false)
        }
    }

    const handleFormChange = (event) => {
        const { name, value } = event.target

        setFormData(previous => ({
            ...previous,
            [name]: value
        }))
    }

    const handleSave = async () => {
        setError('')
        setSuccess('')

        if (
            formData.subDealerCode.trim().toUpperCase() ===
            'DUMMYCODE'
        ) {
            setError(
                'Please enter the sub-dealer code already created in CRM.'
            )
            return
        }

        if (formData.status === 'Please select') {
            setError('Please select status.')
            return
        }

        try {
            await updateSubDealerRequisition({
                SubDealerId: Number(formData.requisitionId),
                SubDealerCode: formData.subDealerCode.trim(),
                SubDealerStatus: formData.status,
                UpdatedBy: userId || ''
            })

            setSuccess('Record updated successfully.')
            setShowModal(false)

            await loadRecords(searchStatus)
        } catch (err) {
            console.error('Sub-dealer update error:', err)

            setError(
                err.message ||
                'Unable to update sub-dealer requisition.'
            )
        }
    }

    const handleDownload = async () => {
        setError('')
        setSuccess('')

        if (selectedIds.length === 0) {
            setError('Please select at least one requisition.')
            return
        }

        try {
            const blob = await downloadSubDealerRequisitions({
                RequisitionIds: selectedIds.join(','),
                UpdatedBy: userId || ''
            })

            if (!blob) {
                throw new Error('No file received from server.')
            }

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')

            const now = new Date()
            const pad = value => String(value).padStart(2, '0')

            link.href = url
            link.download =
                `SubDealer_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.txt`

            document.body.appendChild(link)
            link.click()
            link.remove()

            window.URL.revokeObjectURL(url)

            setSuccess('Download completed successfully.')
            await loadRecords(searchStatus)
        } catch (err) {
            console.error('Sub-dealer download error:', err)

            setError(
                err.message ||
                'Unable to download sub-dealer requisitions.'
            )
        }
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setError('')
    }

    // =================================================
    // ROLE 6: FORM CHANGE
    // =================================================

    const updateCreateForm = (name, value) => {
        setCreateForm(previous => ({
            ...previous,
            [name]: value
        }))
    }

    const handleDealerSearch = async (value) => {
        updateCreateForm('dealerSearch', value)
        updateCreateForm('dealerCode', '')
        updateCreateForm('dealerName', '')

        setDealerOptions([])
        setShowDealerOptions(false)

        if (value.trim().length < 2) return

        try {
            const results = await searchSubDealerDealers(value.trim())

            setDealerOptions(getArray(results))
            setShowDealerOptions(true)
        } catch (err) {
            console.error('Dealer search error:', err)

            setRole6Error(
                err.message ||
                'Unable to search dealers.'
            )
        }
    }

    const chooseDealer = (dealer) => {
        const code = getDealerCode(dealer)
        const name = getDealerName(dealer)

        setCreateForm(previous => ({
            ...previous,
            dealerCode: code,
            dealerName: name,
            dealerSearch: `${code} - ${name}`,
            storeName: '',
            storeSearch: ''
        }))

        setDealerOptions([])
        setShowDealerOptions(false)
        setRole6Error('')
    }

    // const handleStoreSearch = async (value) => {
    //     updateCreateForm('storeSearch', value)
    //     updateCreateForm('storeName', '')

    //     setStoreOptions([])
    //     setShowStoreOptions(false)

    //     if (!createForm.dealerCode) {
    //         setRole6Error('Please select a dealer first.')
    //         return
    //     }

    //     if (value.trim().length < 2) return

    //     try {
    //         console.log('Store Search Term:', value.trim())
    //         console.log('Selected Dealer Code:', createForm.dealerCode)
    //         const results = await searchSubDealerNames(
    //             value.trim(),
    //             createForm.dealerCode
    //         )

    //         // console.log('Sub-Dealer Search Response:', results)

    //         setStoreOptions(getArray(results))
    //         setShowStoreOptions(true)
    //     } catch (err) {
    //         console.error('Sub-dealer name search error:', err)

    //         setRole6Error(
    //             err.message ||
    //             'Unable to search sub-dealer names.'
    //         )
    //     }
    // }

    const handleStoreSearch = async (value) => {
    setCreateForm(previous => ({
        ...previous,
        storeSearch: value,
        storeName: value
    }))

    setStoreOptions([])
    setShowStoreOptions(false)

    if (!createForm.dealerCode) {
        setRole6Error('Please select a dealer first.')
        return
    }

    if (value.trim().length < 2) return

    try {
        console.log('Store Search Term:', value.trim())
        console.log('Selected Dealer Code:', createForm.dealerCode)

        const results = await searchSubDealerNames(
            value.trim(),
            createForm.dealerCode
        )

        console.log('Sub-Dealer Search Response:', results)

        setStoreOptions(getArray(results))
        setShowStoreOptions(true)
    } catch (err) {
        console.error('Sub-dealer name search error:', err)

        setRole6Error(
            err.message ||
            'Unable to search sub-dealer names.'
        )
    }
}

    const chooseStore = (store) => {
        const name = getStoreName(store)

        setCreateForm(previous => ({
            ...previous,
            storeName: name,
            storeSearch: name
        }))

        setStoreOptions([])
        setShowStoreOptions(false)
        setRole6Error('')
    }

    const handlePincodeBlur = async () => {
    const pin = createForm.postalCode.trim()

    if (!/^\d{6}$/.test(pin)) {
        setStateOptions([])
        setDistrictOptions([])
        setCityOptions([])
        setAreaOptions([])

        setCreateForm(previous => ({
            ...previous,
            state: '',
            district: '',
            city: '',
            area: ''
        }))

        return
    }

    setAreaLoading(true)
    setRole6Error('')

    try {
        const result = await getSubDealerArea(pin)

        const responseData = result?.data ?? result

        // API returns an array of area records
        const rows = Array.isArray(responseData)
            ? responseData
            : []

        if (rows.length === 0) {
            setStateOptions([])
            setDistrictOptions([])
            setCityOptions([])
            setAreaOptions([])

            setCreateForm(previous => ({
                ...previous,
                state: '',
                district: '',
                city: '',
                area: ''
            }))

            setRole6Error(
                'No area details found for this PIN code.'
            )

            return
        }

        // Get unique State values
        const states = [
            ...new Set(
                rows
                    .map(item =>
                        item?.state ??
                        item?.State ??
                        ''
                    )
                    .map(value => String(value).trim())
                    .filter(Boolean)
            )
        ]

        // Get unique District values
        const districts = [
            ...new Set(
                rows
                    .map(item =>
                        item?.district ??
                        item?.District ??
                        ''
                    )
                    .map(value => String(value).trim())
                    .filter(Boolean)
            )
        ]

        // Get unique City values
        const cities = [
            ...new Set(
                rows
                    .map(item =>
                        item?.city ??
                        item?.City ??
                        ''
                    )
                    .map(value => String(value).trim())
                    .filter(Boolean)
            )
        ]

        // Get unique Area values
        const areas = [
            ...new Set(
                rows
                    .map(item =>
                        item?.area ??
                        item?.Area ??
                        ''
                    )
                    .map(value => String(value).trim())
                    .filter(Boolean)
            )
        ]

        setStateOptions(states)
        setDistrictOptions(districts)
        setCityOptions(cities)
        setAreaOptions(areas)

        // Automatically select State, District and City.
        // Area is intentionally left blank so the user
        // must select an Area from the dropdown.
        setCreateForm(previous => ({
            ...previous,
            state:
                rows[0]?.state ??
                rows[0]?.State ??
                '',
            district:
                rows[0]?.district ??
                rows[0]?.District ??
                '',
            city:
                rows[0]?.city ??
                rows[0]?.City ??
                '',
            area: ''
        }))
    } catch (err) {
        console.error('PIN-code lookup error:', err)

        setStateOptions([])
        setDistrictOptions([])
        setCityOptions([])
        setAreaOptions([])

        setCreateForm(previous => ({
            ...previous,
            state: '',
            district: '',
            city: '',
            area: ''
        }))

        setRole6Error(
            err.message ||
            'Unable to find details for this PIN code.'
        )
    } finally {
        setAreaLoading(false)
    }
}

    // =================================================
    // ROLE 6: PRODUCT SELECTION
    // =================================================

    const productCodes = useMemo(
        () => products.map(getOptionCode).filter(Boolean),
        [products]
    )

    const allProductsSelected =
        productCodes.length > 0 &&
        productCodes.every(code =>
            createForm.products.includes(code)
        )

    const handleProductChange = (product, checked) => {
        const code = getOptionCode(product)

        if (!code) return

        setCreateForm(previous => ({
            ...previous,
            products: checked
                ? previous.products.includes(code)
                    ? previous.products
                    : [...previous.products, code]
                : previous.products.filter(item => item !== code)
        }))
    }

    const handleSelectAllProducts = (checked) => {
        setCreateForm(previous => ({
            ...previous,
            products: checked ? productCodes : []
        }))
    }

    // =================================================
    // ROLE 6: VALIDATE AND CREATE
    // =================================================

    const handleCreate = async (event) => {
        event.preventDefault()

        setRole6Error('')
        setRole6Success('')

        if (!createForm.dealerCode) {
            setRole6Error('Please select a dealer.')
            return
        }

        if (!createForm.storeName.trim()) {
    setRole6Error('Please enter sub-dealer name.')
    return
}

        if (!/^\d{6}$/.test(createForm.postalCode.trim())) {
            setRole6Error('Please enter a valid 6-digit PIN code.')
            return
        }

        if (!createForm.state.trim()) {
            setRole6Error(
                'Please enter a valid PIN code and load the area details.'
            )
            return
        }

        if (!createForm.area.trim()) {
            setRole6Error('Area is required.')
            return
        }

        if (!createForm.street2.trim()) {
            setRole6Error('Street 2 is required.')
            return
        }

        if (createForm.street2.trim().length > 40) {
            setRole6Error('Street 2 cannot exceed 40 characters.')
            return
        }

        if (createForm.street.trim().length > 40) {
            setRole6Error('Street cannot exceed 40 characters.')
            return
        }

        if (createForm.street3.trim().length > 40) {
            setRole6Error('Street 3 cannot exceed 40 characters.')
            return
        }

        if (!createForm.shopArea.trim()) {
            setRole6Error(
                'Shop Area / Identification of Shop is required.'
            )
            return
        }

        if (createForm.shopArea.trim().length > 50) {
            setRole6Error('Shop Area cannot exceed 50 characters.')
            return
        }

        if (!createForm.contactNo.trim()) {
            setRole6Error('Contact number is required.')
            return
        }

        if (!/^\d{1,12}$/.test(createForm.contactNo.trim())) {
            setRole6Error(
                'Contact number must contain up to 12 digits.'
            )
            return
        }

        if (!createForm.contactPersonName.trim()) {
            setRole6Error('Contact person name is required.')
            return
        }

        if (createForm.contactPersonName.trim().length > 80) {
            setRole6Error(
                'Contact person name cannot exceed 80 characters.'
            )
            return
        }

        if (
            createForm.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())
        ) {
            setRole6Error('Please enter a valid email address.')
            return
        }

        if (createForm.email.trim().length > 80) {
            setRole6Error('Email cannot exceed 80 characters.')
            return
        }

        if (
            !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9]{1}Z[a-zA-Z0-9]{1}$/
                .test(createForm.gstn.trim().toUpperCase())
        ) {
            setRole6Error('Please enter a valid GSTN.')
            return
        }

        if (createForm.gstn.trim().length > 15) {
            setRole6Error('GSTN cannot exceed 15 characters.')
            return
        }

        if (createForm.products.length === 0) {
            setRole6Error('Please select at least one product.')
            return
        }

        if (!regionRefId || !branchRefId) {
            setRole6Error(
                'Region or branch information is missing. Please verify your login session.'
            )
            return
        }

        setRole6Saving(true)

        try {
            const duplicateResult = await searchExistingSubDealer({
                SAPECCCode: createForm.dealerCode,
                PinCode: createForm.postalCode.trim(),
                ShopArea: createForm.area.trim()
            })

            if (
                duplicateResult?.canAdd === false ||
                Number(duplicateResult?.count) > 0
            ) {
                setRole6Error(
                    'A sub-dealer requisition already exists for the entered details.'
                )
                return
            }

            const request = {
                RegionRefId: regionRefId,
                BranchRefId: branchRefId,
                SAPECCCode: createForm.dealerCode,
                SAPName: createForm.dealerName,
                StoreName: createForm.storeName.trim(),
                Street: createForm.street.trim(),
                Street2: createForm.street2.trim(),
                Street3: createForm.street3.trim(),
                ShopArea: createForm.area.trim(),
                IdentificationofShop:
                    createForm.identificationOfShop.trim() ||
                    createForm.shopArea.trim(),
                SubDealerCity: createForm.city.trim(),
                District: createForm.district.trim(),
                State: createForm.state.trim(),
                PinCode: createForm.postalCode.trim(),
                ContactNo: createForm.contactNo.trim(),
                ContactPersonName: createForm.contactPersonName.trim(),
                EmailID: createForm.email.trim(),
                GSTN: createForm.gstn.trim().toUpperCase(),
                Productvalues: createForm.products.join(','),
                CreatedBy: Number(userId)
            }

            await createSubDealerRequisition(request)

            setRole6Success(
                'Sub-Dealer requisition created successfully.'
            )

            setTimeout(() => {
            setSuccessMessage('')
        }, 3000)

            setCreateForm(emptyCreateForm())
            setDealerOptions([])
            setStoreOptions([])
            setShowDealerOptions(false)
            setShowStoreOptions(false)
        } catch (err) {
            console.error('Create sub-dealer error:', err)

            setRole6Error(
                err.message ||
                'Unable to create sub-dealer requisition.'
            )
        } finally {
            setRole6Saving(false)
        }
    }

    const handleResetCreateForm = () => {
        setCreateForm(emptyCreateForm())
        setDealerOptions([])
        setStoreOptions([])
        setShowDealerOptions(false)
        setShowStoreOptions(false)
        setRole6Error('')
        setRole6Success('')
    }

    // =================================================
    // SHARED PAGE
    // =================================================

    return (
        <DashboardLayout title="Sub-Dealer Requisition">
            <div className="subdealer-editview-page">

                {!isRole1 && !isRole6 && (
                    <div className="subdealer-error-message">
                        You do not have permission to access this page.
                    </div>
                )}

                {/* =================================================
                    ROLE 1: EXISTING LIST / EDIT / DOWNLOAD
                ================================================= */}

                {isRole1 && (
                    <>
                        <div className="subdealer-top-bar">
                            <div className="subdealer-status-filter">
                                <label htmlFor="ddlSearchStatus">
                                    Status
                                </label>

                                <select
                                    id="ddlSearchStatus"
                                    value={searchStatus}
                                    onChange={event =>
                                        setSearchStatus(event.target.value)
                                    }
                                >
                                    <option value=" ">
                                        Please select
                                    </option>
                                    <option value="1">
                                        Pending for Approval
                                    </option>
                                    <option value="2">
                                        Correction Required
                                    </option>
                                    <option value="3">
                                        Downloaded
                                    </option>
                                    <option value="11">
                                        Sub-Dealer Code Issued
                                    </option>
                                </select>
                            </div>

                            <div className="subdealer-page-actions">
                                <button
                                    type="button"
                                    className="btn-search subdealer-search-button"
                                    onClick={handleSearch}
                                    disabled={loading}
                                >
                                    <i className="fa fa-search" aria-hidden="true" />
                                    <span>Search</span>
                                </button>

                                <button
                                    type="button"
                                    className="subdealer-download-button"
                                    onClick={handleDownload}
                                    disabled={loading}
                                >
                                    <i className="fa fa-download" aria-hidden="true" />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>

                        {success && (
                            <div className="subdealer-success-message">
                                {success}
                            </div>
                        )}

                        {error && !showModal && (
                            <div className="subdealer-error-message">
                                {error}
                            </div>
                        )}

                        <div className="subdealer-table-wrapper">
                            {loading ? (
                                <div className="subdealer-table-message">
                                    Loading...
                                </div>
                            ) : records.length === 0 ? (
                                <div className="no-record-found subdealer-table-message">
                                    No Record Found
                                </div>
                            ) : (
                                <table
                                    className="subdealer-table"
                                    id="tblSubdealer"
                                >
                                    <thead>
                                        <tr>
                                            <th className="checkbox-column">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        records.length > 0 &&
                                                        selectedIds.length === records.length
                                                    }
                                                    onChange={event =>
                                                        handleSelectAll(event.target.checked)
                                                    }
                                                />
                                            </th>
                                            <th>#</th>
                                            <th>RefId</th>
                                            <th>Dealer Code</th>
                                            <th>Dealer Name</th>
                                            <th>Sub-Dealer Code</th>
                                            <th>Sub-Dealer Name</th>
                                            <th>Pin Code</th>
                                            <th>State</th>
                                            <th>District</th>
                                            <th>Sub-Dealer City</th>
                                            <th>Shop Area</th>
                                            <th>Product</th>
                                            <th>Status</th>
                                            <th>Created Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {records.map((record, index) => {
                                            const id = String(record.requisitionId)

                                            const isIssued =
                                                record.subDealerStatus ===
                                                'Sub-Dealer Code Issued'

                                            return (
                                                <tr key={id}>
                                                    <td className="checkbox-column">
                                                        <input
                                                            type="checkbox"
                                                            value={id}
                                                            checked={selectedIds.includes(id)}
                                                            onChange={() =>
                                                                handleCheckboxChange(id)
                                                            }
                                                        />
                                                    </td>

                                                    <td>
                                                        {record.rowIndex || index + 1}
                                                    </td>
                                                    <td>{record.requisitionId}</td>
                                                    <td>{record.sapeccCode}</td>
                                                    <td>{record.sapName}</td>
                                                    <td>{record.subDealerCode}</td>
                                                    <td>{record.storeName}</td>
                                                    <td>{record.pinCode}</td>
                                                    <td>{record.state}</td>
                                                    <td>{record.district}</td>
                                                    <td>{record.subDealerCity}</td>
                                                    <td>{record.shopArea}</td>
                                                    <td>{record.productvalues}</td>

                                                    <td>
                                                        <span
                                                            className={
                                                                `subdealer-status ${getStatusClass(
                                                                    record.subDealerStatus
                                                                )}`
                                                            }
                                                        >
                                                            {record.subDealerStatus}
                                                        </span>
                                                    </td>

                                                    <td>{record.createdDate}</td>

                                                    <td>
                                                        <div className="subdealer-action-buttons">
                                                            {isIssued ? (
                                                                <button
                                                                    type="button"
                                                                    className="subdealer-view-button"
                                                                    onClick={() =>
                                                                        handleOpenModal(record, 'view')
                                                                    }
                                                                >
                                                                    <i
                                                                        className="fa fa-eye"
                                                                        aria-hidden="true"
                                                                    />
                                                                    View
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    className="subdealer-edit-button"
                                                                    onClick={() =>
                                                                        handleOpenModal(record, 'edit')
                                                                    }
                                                                >
                                                                    <i
                                                                        className="fa fa-edit"
                                                                        aria-hidden="true"
                                                                    />
                                                                    Edit
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {showModal && (
                            <div
                                className="subdealer-modal-overlay"
                                onMouseDown={event => {
                                    if (event.target === event.currentTarget) {
                                        handleCloseModal()
                                    }
                                }}
                            >
                                <div className="subdealer-modal">
                                    <div className="subdealer-modal-header">
                                        <h3>Sub-Dealer Requisition</h3>

                                        <button
                                            type="button"
                                            className="subdealer-modal-close"
                                            onClick={handleCloseModal}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="subdealer-modal-body">
                                        {modalLoading ? (
                                            <div className="subdealer-modal-loading">
                                                Loading...
                                            </div>
                                        ) : (
                                            <>
                                                <div className="subdealer-hidden-id">
                                                    {formData.requisitionId}
                                                </div>

                                                {[
                                                    ['Dealer Code', formData.dealerCode],
                                                    ['Dealer Name', formData.dealerName],
                                                    ['Sub-Dealer Name', formData.storeName],
                                                    ['Postal Code', formData.postalCode],
                                                    ['State', formData.state],
                                                    ['District', formData.district],
                                                    ['City', formData.city],
                                                    ['Area', formData.area]
                                                ].map(([label, value]) => (
                                                    <div
                                                        className="subdealer-form-group"
                                                        key={label}
                                                    >
                                                        <label>{label}</label>
                                                        <input
                                                            type="text"
                                                            value={value}
                                                            disabled
                                                        />
                                                    </div>
                                                ))}

                                                <div className="subdealer-form-group">
                                                    <label>Sub-Dealer Code</label>
                                                    <input
                                                        type="text"
                                                        name="subDealerCode"
                                                        value={formData.subDealerCode}
                                                        onChange={handleFormChange}
                                                        disabled={modalMode === 'view'}
                                                    />
                                                </div>

                                                <div className="subdealer-form-group">
                                                    <label>Status</label>
                                                    <select
                                                        name="status"
                                                        value={formData.status}
                                                        onChange={handleFormChange}
                                                        disabled={modalMode === 'view'}
                                                    >
                                                        <option value="Please select">
                                                            Please select
                                                        </option>
                                                        <option value="12">
                                                            Inprogress
                                                        </option>
                                                        <option value="11">
                                                            Sub-Dealer Code Issued
                                                        </option>
                                                    </select>
                                                </div>

                                                {error && (
                                                    <div className="subdealer-modal-error">
                                                        {error}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {!modalLoading && (
                                        <div className="subdealer-modal-footer">
                                            {modalMode === 'edit' && (
                                                <button
                                                    type="button"
                                                    className="subdealer-save-button"
                                                    onClick={handleSave}
                                                >
                                                    <i
                                                        className="fa fa-save"
                                                        aria-hidden="true"
                                                    />
                                                    Save Changes
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="subdealer-cancel-button"
                                                onClick={handleCloseModal}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* =================================================
                    ROLE 6: CREATE SUB-DEALER REQUISITION
                ================================================= */}

                {isRole6 && (
    <div className="subdealer-create-page">


        {/* PAGE HEADER WITH VIEW BUTTON */}
        <div className="subdealer-create-header">
            

            <button
                type="button"
                className="subdealer-view-page-button"
                onClick={() =>
                    navigate(window.location.pathname, {
                        state: { showSubDealerView: true }
                    })
                }
            >
                <i className="fa fa-eye" aria-hidden="true"></i>
                View
            </button>
        </div>

        {role6Error && (
            <div className="subdealer-error-message">
                {role6Error}
            </div>
        )}

        {role6Success && (
            <div className="subdealer-success-message">
                {role6Success}
            </div>
        )}

        {role6Loading ? (
            <div className="subdealer-table-message">
                Loading form data...
            </div>
        ) : (
            <form
                className="subdealer-create-form"
                onSubmit={handleCreate}
            >
                {/* ROW 1: SIX FIELDS */}

        {/* =================================================
            ROW 1: FOUR FIELDS
        ================================================= */}

        <div className="subdealer-create-grid four-column-layout">
            <div className="subdealer-create-field">
                <label htmlFor="dealerSearch">
                    Dealer Code[Only DC-33,40 allowed]:
                </label>

                <input
                    id="dealerSearch"
                    type="text"
                    value={createForm.dealerSearch}
                    autoComplete="off"
                    onChange={event =>
                        handleDealerSearch(event.target.value)
                    }
                    onFocus={() => {
                        if (dealerOptions.length) {
                            setShowDealerOptions(true)
                        }
                    }}
                    placeholder="Search dealer"
                    required
                />

                {showDealerOptions && dealerOptions.length > 0 && (
                    <div className="subdealer-autocomplete">
                        {dealerOptions.map((dealer, index) => (
                            <button
                                type="button"
                                key={`${getDealerCode(dealer)}-${index}`}
                                onClick={() => chooseDealer(dealer)}
                            >
                                {getDealerCode(dealer)} - {getDealerName(dealer)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="subdealer-create-field">
                <label>
                    Dealer Name <span className="required-star">*</span>

                </label>

                <input
                    type="text"
                    value={createForm.dealerName}
                    readOnly
                />
            </div>

            <div className="subdealer-create-field">
                <label htmlFor="storeSearch">
                    Store Name(Sub-Dealer Name) <span className="required-star">*</span>
                </label>

                <input
                    id="storeSearch"
                    type="text"
                    value={createForm.storeSearch}
                    autoComplete="off"
                    onChange={event =>
                        handleStoreSearch(event.target.value)
                    }
                    onFocus={() => {
                        if (storeOptions.length) {
                            setShowStoreOptions(true)
                        }
                    }}
                    placeholder="Search sub-dealer"
                    required
                />

                {showStoreOptions && storeOptions.length > 0 && (
                    <div className="subdealer-autocomplete">
                        {storeOptions.map((store, index) => (
                            <button
                                type="button"
                                key={`${getStoreName(store)}-${index}`}
                                onClick={() => chooseStore(store)}
                            >
                                {getStoreName(store)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="subdealer-create-field">
                <label htmlFor="postalCode">
                    Sub-Dealer PinCode <span className="required-star">*</span>
                </label>

                <input
                    id="postalCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={createForm.postalCode}
                    onChange={event =>
                        updateCreateForm(
                            'postalCode',
                            event.target.value.replace(/\D/g, '')
                        )
                    }
                    onBlur={handlePincodeBlur}
                    required
                />

                {areaLoading && (
                    <small>Looking up PIN code...</small>
                )}
            </div>
        </div>


        {/* =================================================
            ROW 2: FOUR FIELDS
        ================================================= */}

        <div className="subdealer-create-grid four-column-layout">

            <div className="subdealer-create-field">
                <label>
                    Sub-Dealer State <span className="required-star">*</span>
                </label>

                <select
                    value={createForm.state}
                    onChange={event =>
                        updateCreateForm('state', event.target.value)
                    }
                    required
                >
                    <option value="">Select State</option>

                    {stateOptions.map((state, index) => (
                        <option
                            key={`${state}-${index}`}
                            value={state}
                        >
                            {state}
                        </option>
                    ))}
                </select>
            </div>

            <div className="subdealer-create-field">
                <label>
                    Sub-Dealer District <span className="required-star">*</span>
                </label>

                <select
                    value={createForm.district}
                    onChange={event =>
                        updateCreateForm('district', event.target.value)
                    }
                    required
                >
                    <option value="">Select District</option>

                    {districtOptions.map((district, index) => (
                        <option
                            key={`${district}-${index}`}
                            value={district}
                        >
                            {district}
                        </option>
                    ))}
                </select>
            </div>

            <div className="subdealer-create-field">
                <label>
                    Sub-Dealer City <span className="required-star">*</span>
                </label>

                <select
                    value={createForm.city}
                    onChange={event =>
                        updateCreateForm('city', event.target.value)
                    }
                    required
                >
                    <option value="">Select City</option>

                    {cityOptions.map((city, index) => (
                        <option
                            key={`${city}-${index}`}
                            value={city}
                        >
                            {city}
                        </option>
                    ))}
                </select>
            </div>

            <div className="subdealer-create-field">
                <label>
                    Sub-Dealer Area <span className="required-star">*</span>
                </label>

                <select
                    value={createForm.area}
                    onChange={event =>
                        updateCreateForm('area', event.target.value)
                    }
                    required
                >
                    <option value="">Select Area</option>

                    {areaOptions.map((area, index) => (
                        <option
                            key={`${area}-${index}`}
                            value={area}
                        >
                            {area}
                        </option>
                    ))}
                </select>
            </div>
        </div>


        {/* =================================================
            ROW 3: FOUR FIELDS
        ================================================= */}

                <div className="subdealer-create-grid four-column-layout">

                    <div className="subdealer-create-field">
                        <label>Region</label>

                        <select
                            value={createForm.regionCode}
                            disabled
                        >
                            <option value="">Select region</option>

                            {regions.map((region, index) => (
                                <option
                                    key={`${getOptionCode(region)}-${index}`}
                                    value={getOptionCode(region)}
                                >
                                    {getOptionName(region)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="subdealer-create-field">
                        <label>Branch</label>

                        <select
                            value={createForm.branchCode}
                            disabled
                        >
                            <option value="">Select branch</option>

                            {branches.map((branch, index) => (
                                <option
                                    key={`${getOptionCode(branch)}-${index}`}
                                    value={getOptionCode(branch)}
                                >
                                    {getOptionName(branch)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="subdealer-create-field">
                        <label>Sub-Dealer Code</label>

                        <input
                            type="text"
                            value="DUMMYCode"
                            disabled
                        />
                    </div>

                    <div className="subdealer-create-field">
                        <label htmlFor="street">
                            Street
                        </label>

                        <input
                            id="street"
                            maxLength={40}
                            value={createForm.street}
                            onChange={event =>
                                updateCreateForm('street', event.target.value)
                            }
                        />
                    </div>
                </div>


                {/* ROW 3: FOUR FIELDS */}

                <div className="subdealer-create-grid four-column-layout">
                    <div className="subdealer-create-field">
                        <label htmlFor="street2">
                            Street 2 <span className="required-star">*</span>
                        </label>
                        <input
                            id="street2"
                            maxLength={40}
                            value={createForm.street2}
                            onChange={event =>
                                updateCreateForm('street2', event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="subdealer-create-field">
                        <label htmlFor="street3">Street 3</label>
                        <input
                            id="street3"
                            maxLength={40}
                            value={createForm.street3}
                            onChange={event =>
                                updateCreateForm('street3', event.target.value)
                            }
                        />
                    </div>

                    <div className="subdealer-create-field">
                        <label htmlFor="shopArea">
                            Shop Area / Identification of Shop <span className="required-star">*</span>
                        </label>
                        <input
                            id="shopArea"
                            maxLength={50}
                            value={createForm.shopArea}
                            onChange={event =>
                                updateCreateForm('shopArea', event.target.value)
                            }
                            required
                        />
                    </div>

                    {/* <div className="subdealer-create-field">
                        <label htmlFor="identificationOfShop">
                            Additional Shop Identification
                        </label>
                        <input
                            id="identificationOfShop"
                            maxLength={50}
                            value={createForm.identificationOfShop}
                            onChange={event =>
                                updateCreateForm(
                                    'identificationOfShop',
                                    event.target.value
                                )
                            }
                        />
                    </div> */}
                    <div className="subdealer-create-field">
                        <label htmlFor="contactNo">Contact No. <span className="required-star">*</span></label>
                        <input
                            id="contactNo"
                            type="text"
                            inputMode="numeric"
                            maxLength={12}
                            value={createForm.contactNo}
                            onChange={event =>
                                updateCreateForm(
                                    'contactNo',
                                    event.target.value.replace(/\D/g, '')
                                )
                            }
                            required
                        />
                    </div>
                </div>

                {/* ROW 4: FOUR FIELDS */}

                <div className="subdealer-create-grid four-column-layout">
                    {/* <div className="subdealer-create-field">
                        <label htmlFor="contactNo">Contact No. <span className="required-star">*</span></label>
                        <input
                            id="contactNo"
                            type="text"
                            inputMode="numeric"
                            maxLength={12}
                            value={createForm.contactNo}
                            onChange={event =>
                                updateCreateForm(
                                    'contactNo',
                                    event.target.value.replace(/\D/g, '')
                                )
                            }
                            required
                        />
                    </div> */}

                    <div className="subdealer-create-field">
                        <label htmlFor="contactPersonName">
                            Contact Person Name <span className="required-star">*</span>
                        </label>
                        <input
                            id="contactPersonName"
                            maxLength={80}
                            value={createForm.contactPersonName}
                            onChange={event =>
                                updateCreateForm(
                                    'contactPersonName',
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>

                    <div className="subdealer-create-field">
                        <label htmlFor="email">Email ID</label>
                        <input
                            id="email"
                            type="email"
                            maxLength={80}
                            value={createForm.email}
                            onChange={event =>
                                updateCreateForm('email', event.target.value)
                            }
                        />
                    </div>

                    <div className="subdealer-create-field">
                        <label htmlFor="gstn">GSTN <span className="required-star">*</span></label>
                        <input
                            id="gstn"
                            maxLength={15}
                            value={createForm.gstn}
                            onChange={event =>
                                updateCreateForm(
                                    'gstn',
                                    event.target.value.toUpperCase()
                                )
                            }
                            required
                        />
                    </div>
                </div>

                {/* FULL-WIDTH PRODUCTS SECTION */}

                <div className="subdealer-products-section">
                    <div className="subdealer-products-heading">
                        <h3>Products *</h3>

                        <label>
                            <input
                                type="checkbox"
                                checked={allProductsSelected}
                                onChange={event =>
                                    handleSelectAllProducts(
                                        event.target.checked
                                    )
                                }
                            />
                            Select All
                        </label>
                    </div>

                    {products.length === 0 ? (
                        <p>No products available.</p>
                    ) : (
                        <div className="subdealer-products-grid">
                            {products.map((product, index) => {
                                const code = getOptionCode(product)

                                return (
                                    <label
                                        key={`${code}-${index}`}
                                        className="subdealer-product-option"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={createForm.products.includes(code)}
                                            onChange={event =>
                                                handleProductChange(
                                                    product,
                                                    event.target.checked
                                                )
                                            }
                                        />
                                        <span>
                                            {getOptionName(product) || code}
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* FORM ACTIONS */}

                <div className="subdealer-create-actions">
                    <button
                        type="submit"
                        className="subdealer-save-button"
                        disabled={role6Saving || areaLoading}
                    >
                        {role6Saving
                            ? 'Submitting...'
                            : 'Submit Requisition'}
                    </button>

                    <button
                        type="button"
                        className="subdealer-cancel-button"
                        onClick={handleResetCreateForm}
                        disabled={role6Saving}
                    >
                        Reset
                    </button>
                </div>
            </form>
        )}
    </div>
)}
            </div>
        </DashboardLayout>
    )
}

export default EditView