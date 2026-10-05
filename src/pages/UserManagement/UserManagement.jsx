import { useEffect, useRef, useState } from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import { getRegions, getBranches } from '../../api/reportsApi'

import {
    getUsers,
    createUser,
    getUserForEdit,
    updateUser,
    checkLoginId,
    checkPhone,
    getApproverMapping,
    saveApproverMapping
} from '../../api/userManagementApi'

import './UserManagement.css'

// =========================================================
// ROLES
// =========================================================

const ROLES = [
    { roleId: 30, roleName: 'ASE' },
    { roleId: 31, roleName: 'ASM' },
    { roleId: 32, roleName: 'BM' },
    { roleId: 33, roleName: 'BA' },
    { roleId: 34, roleName: 'ZA' },
    { roleId: 35, roleName: 'ZM' }
]

// =========================================================
// APPROVER ROLES
// =========================================================

const APPROVER_ROLE_IDS = [32, 33, 34, 35]

// =========================================================
// INITIAL CREATE FORM
// =========================================================

const initialCreateForm = {
    loginID: '',
    userName: '',
    phoneNumber: '',
    email: '',
    bpCode: '',
    roleID: '',
    isActive: 1,
    is2FAEnabled: true
}

// =========================================================
// INITIAL EDIT FORM
// =========================================================

const initialEditForm = {
    userID: 0,
    loginID: '',
    userName: '',
    phoneNumber: '',
    email: '',
    isActive: 1,
    is2FAEnabled: true
}

// =========================================================
// HELPER
// =========================================================

function getValue(
    object,
    camelName,
    pascalName,
    fallback = ''
) {
    if (!object) {
        return fallback
    }

    if (
        object[camelName] !== undefined &&
        object[camelName] !== null
    ) {
        return object[camelName]
    }

    if (
        object[pascalName] !== undefined &&
        object[pascalName] !== null
    ) {
        return object[pascalName]
    }

    return fallback
}

// =========================================================
// BOOLEAN HELPER
// =========================================================

function getBooleanValue(
    object,
    camelName,
    pascalName,
    fallback = false
) {
    const value =
        getValue(
            object,
            camelName,
            pascalName,
            fallback
        )

    if (typeof value === 'boolean') {
        return value
    }

    if (typeof value === 'number') {
        return value === 1
    }

    if (typeof value === 'string') {
        return (
            value === '1' ||
            value.toLowerCase() === 'true'
        )
    }

    return fallback
}

// =========================================================
// EMAIL HELPER
// =========================================================

function getEmailValue(object) {
    if (!object) {
        return ''
    }

    const emailFields = [
        'email',
        'Email',
        'emailID',
        'EmailID',
        'emailId',
        'EmailId'
    ]

    for (const field of emailFields) {
        if (
            object[field] !== undefined &&
            object[field] !== null
        ) {
            return object[field]
        }
    }

    return ''
}

// =========================================================
// PHONE HELPER
// =========================================================

function getPhoneValue(object) {
    if (!object) {
        return ''
    }

    const phoneFields = [
        'phoneNumber',
        'PhoneNumber',
        'phone',
        'Phone',
        'mobileNo',
        'MobileNo'
    ]

    for (const field of phoneFields) {
        if (
            object[field] !== undefined &&
            object[field] !== null
        ) {
            return object[field]
        }
    }

    return ''
}

// =========================================================
// GET APPROVER ROLE ID
// =========================================================

function getApproverRoleId(approver) {
    const roleId = Number(
        getValue(
            approver,
            'roleID',
            'RoleID',
            0
        )
    )

    if (roleId) {
        return roleId
    }

    const roleName = String(
        getValue(
            approver,
            'approvalRole',
            'ApprovalRole',
            ''
        )
    )
        .trim()
        .toUpperCase()

    const role = ROLES.find(
        item =>
            item.roleName.toUpperCase() === roleName
    )

    return role?.roleId || 0
}

// =========================================================
// COMPONENT
// =========================================================

function UserManagement() {

    // =====================================================
    // SESSION
    // =====================================================

    const sessionRegionCode =
        sessionStorage.getItem('regionCode') || ''

    const sessionRoleId =
        Number(
            sessionStorage.getItem('roleId') || 0
        )

    const sessionBpCode =
        sessionStorage.getItem('bpCode') || ''

    // =====================================================
    // CREATE USER
    // =====================================================

    const [createForm, setCreateForm] =
        useState(initialCreateForm)

    const [createFieldErrors, setCreateFieldErrors] =
        useState({})

    const [regions, setRegions] =
        useState([])

    const [branches, setBranches] =
        useState([])

    const [loadingRegions, setLoadingRegions] =
        useState(false)

    const [loadingBranches, setLoadingBranches] =
        useState(false)

    // =====================================================
    // USER LIST
    // =====================================================

    const [users, setUsers] =
        useState([])

    const [loadingUsers, setLoadingUsers] =
        useState(false)

    const [selectedBranch, setSelectedBranch] =
        useState('')

    const [phoneFilter, setPhoneFilter] =
        useState('')

    const phoneTimerRef =
        useRef(null)

    // =====================================================
    // GENERAL MESSAGES
    // =====================================================

    const [successMessage, setSuccessMessage] =
        useState('')

    const [errorMessage, setErrorMessage] =
        useState('')

    // =====================================================
    // EDIT USER
    // =====================================================

    const [showEditModal, setShowEditModal] =
        useState(false)

    const [editForm, setEditForm] =
        useState(initialEditForm)

    const [loadingEdit, setLoadingEdit] =
        useState(false)

    const [editFieldErrors, setEditFieldErrors] =
        useState({})

    // =====================================================
    // APPROVER MAPPING
    // =====================================================

    const [showApproverModal, setShowApproverModal] =
        useState(false)

    const [approverData, setApproverData] =
        useState(null)

    const [selectedRequestor, setSelectedRequestor] =
        useState(null)

    const [availableApprovers, setAvailableApprovers] =
        useState([])

    const [loadingApprovers, setLoadingApprovers] =
        useState(false)

    const [savingApprovers, setSavingApprovers] =
        useState(false)

    // =====================================================
    // LOAD REGIONS
    // =====================================================

    useEffect(() => {
        loadRegions()
    }, [])

    // =====================================================
    // LOAD BRANCHES
    // =====================================================

    useEffect(() => {
        if (sessionRegionCode) {
            loadBranches(sessionRegionCode)
        }
    }, [sessionRegionCode])

    // =====================================================
    // LOAD USERS
    // =====================================================

    useEffect(() => {
        if (sessionRegionCode) {
            loadUsers(
                sessionRegionCode,
                '',
                ''
            )
        }
    }, [sessionRegionCode])

    // =====================================================
    // CLEANUP PHONE TIMER
    // =====================================================

    useEffect(() => {
        return () => {
            if (phoneTimerRef.current) {
                clearTimeout(
                    phoneTimerRef.current
                )
            }
        }
    }, [])

    // =====================================================
    // LOAD REGIONS
    // =====================================================

    async function loadRegions() {
        try {
            setLoadingRegions(true)
            setErrorMessage('')

            const response =
                await getRegions(
                    sessionRegionCode
                )

            const data =
                response?.data ||
                response?.Data ||
                response ||
                []

            setRegions(
                Array.isArray(data)
                    ? data
                    : []
            )

        } catch (error) {
            console.error(
                'Error loading regions:',
                error
            )

            setErrorMessage(
                error.message ||
                'Unable to load regions.'
            )

        } finally {
            setLoadingRegions(false)
        }
    }

    // =====================================================
    // LOAD BRANCHES
    // =====================================================

    async function loadBranches(regionCode) {
        try {
            setLoadingBranches(true)

            const response =
                await getBranches(
                    sessionRoleId,
                    regionCode,
                    sessionBpCode
                )

            const data =
                response?.data ||
                response?.Data ||
                response ||
                []

            setBranches(
                Array.isArray(data)
                    ? data
                    : []
            )

        } catch (error) {
            console.error(
                'Error loading branches:',
                error
            )

            setErrorMessage(
                error.message ||
                'Unable to load branches.'
            )

        } finally {
            setLoadingBranches(false)
        }
    }

    // =====================================================
    // LOAD USERS
    // =====================================================

    async function loadUsers(
        regionCode,
        branchCode = '',
        phoneNumber = ''
    ) {
        try {
            setLoadingUsers(true)
            setErrorMessage('')

            const response =
                await getUsers(
                    regionCode,
                    branchCode,
                    phoneNumber
                )

            const data =
                response?.data ||
                response?.Data ||
                []

            setUsers(
                Array.isArray(data)
                    ? data
                    : []
            )

        } catch (error) {
            console.error(
                'Error loading users:',
                error
            )

            setErrorMessage(
                error.message ||
                'Unable to load users.'
            )

        } finally {
            setLoadingUsers(false)
        }
    }

    // =====================================================
    // CREATE FORM CHANGE
    // =====================================================

    function handleCreateChange(event) {
        const {
            name,
            value,
            type,
            checked
        } = event.target

        let newValue = value

        if (type === 'checkbox') {
            newValue = checked
        }

        if (name === 'phoneNumber') {
            newValue =
                value
                    .replace(/\D/g, '')
                    .slice(0, 10)
        }

        setCreateForm(previous => ({
            ...previous,
            [name]: newValue
        }))

        setCreateFieldErrors(previous => ({
            ...previous,
            [name]: ''
        }))

        setErrorMessage('')
    }

    // =====================================================
    // RESET CREATE FORM
    // =====================================================

    function resetCreateForm() {
        setCreateForm({
            ...initialCreateForm,
            bpCode: ''
        })

        setCreateFieldErrors({})
        setErrorMessage('')
        setSuccessMessage('')
    }

    // =====================================================
    // VALIDATE CREATE FORM
    // =====================================================

    function validateCreateForm() {
        const errors = {}

        if (!createForm.loginID.trim()) {
            errors.loginID =
                'Login ID is required.'
        }

        if (!createForm.userName.trim()) {
            errors.userName =
                'User Name is required.'
        }

        if (!createForm.phoneNumber.trim()) {
            errors.phoneNumber =
                'Phone number is required.'
        } else if (
            createForm.phoneNumber.length !== 10
        ) {
            errors.phoneNumber =
                'Phone number must be 10 digits.'
        }

        if (!createForm.email.trim()) {
            errors.email =
                'Email is required.'
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                createForm.email
            )
        ) {
            errors.email =
                'Enter a valid email address.'
        }

        if (!createForm.bpCode) {
            errors.bpCode =
                'Branch is required.'
        }

        if (!createForm.roleID) {
            errors.roleID =
                'Role is required.'
        }

        setCreateFieldErrors(errors)

        return Object.keys(errors).length === 0
    }

    // =====================================================
    // CREATE USER
    // =====================================================

    async function handleCreateUser(event) {
        event.preventDefault()

        setSuccessMessage('')
        setErrorMessage('')

        if (!validateCreateForm()) {
            return
        }

        try {

            // ---------------------------------------------
            // CHECK LOGIN ID
            // ---------------------------------------------

            const loginCheck =
                await checkLoginId(
                    createForm.loginID.trim()
                )

            const loginExists =
                loginCheck?.exists ??
                loginCheck?.Exists ??
                loginCheck?.data?.exists ??
                loginCheck?.data?.Exists ??
                false

            if (loginExists) {
                setCreateFieldErrors({
                    loginID:
                        'Login ID already exists.'
                })

                return
            }

            // ---------------------------------------------
            // CHECK PHONE
            // ---------------------------------------------

            const phoneCheck =
                await checkPhone(
                    createForm.phoneNumber
                )

            const phoneExists =
                phoneCheck?.exists ??
                phoneCheck?.Exists ??
                phoneCheck?.data?.exists ??
                phoneCheck?.data?.Exists ??
                false

            if (phoneExists) {
                setCreateFieldErrors({
                    phoneNumber:
                        'Phone number already exists.'
                })

                return
            }

            // ---------------------------------------------
            // CREATE USER
            // ---------------------------------------------

            const payload = {
                loginID:
                    createForm.loginID.trim(),

                userName:
                    createForm.userName.trim(),

                phoneNumber:
                    createForm.phoneNumber,

                email:
                    createForm.email.trim(),

                bpCode:
                    createForm.bpCode,

                roleID:
                    Number(createForm.roleID),

                isActive:
                    Number(createForm.isActive),

                is2FAEnabled:
                    Boolean(createForm.is2FAEnabled)
            }

            const response =
                await createUser(payload)

            const isSuccess =
                response?.isSuccess ??
                response?.IsSuccess ??
                true

            if (isSuccess === false) {
                throw new Error(
                    response?.message ||
                    response?.Message ||
                    'Unable to create user.'
                )
            }

            setSuccessMessage(
                response?.message ||
                response?.Message ||
                'User created successfully.'
            )

            resetCreateForm()

            await loadUsers(
                sessionRegionCode,
                selectedBranch,
                phoneFilter
            )

        } catch (error) {
            console.error(
                'Error creating user:',
                error
            )

            setErrorMessage(
                error.message ||
                'Unable to create user.'
            )
        }
    }

    // =====================================================
    // BRANCH FILTER
    // =====================================================

    function handleBranchFilterChange(event) {
        const branchCode =
            event.target.value

        setSelectedBranch(branchCode)

        loadUsers(
            sessionRegionCode,
            branchCode,
            phoneFilter
        )
    }

    // =====================================================
    // PHONE FILTER
    // =====================================================

    function handlePhoneFilterChange(event) {
        const value =
            event.target.value
                .replace(/\D/g, '')
                .slice(0, 10)

        setPhoneFilter(value)

        if (phoneTimerRef.current) {
            clearTimeout(
                phoneTimerRef.current
            )
        }

        phoneTimerRef.current =
            setTimeout(() => {
                loadUsers(
                    sessionRegionCode,
                    selectedBranch,
                    value
                )
            }, 300)
    }

    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    function clearFilters() {
        setSelectedBranch('')
        setPhoneFilter('')

        if (phoneTimerRef.current) {
            clearTimeout(
                phoneTimerRef.current
            )
        }

        loadUsers(
            sessionRegionCode,
            '',
            ''
        )
    }

    // =====================================================
    // OPEN EDIT MODAL
    // =====================================================

    async function handleEditUser(user) {
        const userId =
            getValue(
                user,
                'userID',
                'UserID',
                0
            )

        if (!userId) {
            return
        }

        try {
            setShowEditModal(true)
            setLoadingEdit(true)
            setEditFieldErrors({})
            setErrorMessage('')

            const response =
                await getUserForEdit(userId)

            const data =
                response?.data ||
                response?.Data ||
                response

            console.log(
                'Edit user response:',
                data
            )

            setEditForm({
                userID:
                    Number(
                        getValue(
                            data,
                            'userID',
                            'UserID',
                            userId
                        )
                    ),

                loginID:
                    getValue(
                        data,
                        'loginID',
                        'LoginID',
                        ''
                    ),

                userName:
                    getValue(
                        data,
                        'userName',
                        'UserName',
                        ''
                    ),

                phoneNumber:
                    getPhoneValue(data),

                email:
                    getEmailValue(data),

                isActive:
                    Number(
                        getValue(
                            data,
                            'isActive',
                            'IsActive',
                            1
                        )
                    ),

                is2FAEnabled:
                    Boolean(
                        getValue(
                            data,
                            'is2FAEnabled',
                            'Is2FAEnabled',
                            true
                        )
                    )
            })

        } catch (error) {
            console.error(
                'Error loading user:',
                error
            )

            setErrorMessage(
                error.message ||
                'Unable to load user details.'
            )

            setShowEditModal(false)

        } finally {
            setLoadingEdit(false)
        }
    }

    // =====================================================
    // EDIT FORM CHANGE
    // =====================================================

    function handleEditChange(event) {
        const {
            name,
            value,
            type,
            checked
        } = event.target

        let newValue =
            type === 'checkbox'
                ? checked
                : value

        if (name === 'phoneNumber') {
            newValue =
                value
                    .replace(/\D/g, '')
                    .slice(0, 10)
        }

        setEditForm(previous => ({
            ...previous,
            [name]: newValue
        }))

        setEditFieldErrors(previous => ({
            ...previous,
            [name]: ''
        }))
    }

    // =====================================================
    // VALIDATE EDIT FORM
    // =====================================================

    function validateEditForm() {
        const errors = {}

        if (!editForm.loginID.trim()) {
            errors.loginID =
                'Login ID is required.'
        }

        if (!editForm.userName.trim()) {
            errors.userName =
                'User Name is required.'
        }

        if (!editForm.phoneNumber.trim()) {
            errors.phoneNumber =
                'Phone number is required.'
        } else if (
            editForm.phoneNumber.length !== 10
        ) {
            errors.phoneNumber =
                'Phone number must be 10 digits.'
        }

        if (!editForm.email.trim()) {
            errors.email =
                'Email is required.'
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                editForm.email
            )
        ) {
            errors.email =
                'Enter a valid email address.'
        }

        setEditFieldErrors(errors)

        return Object.keys(errors).length === 0
    }

    // =====================================================
    // UPDATE USER
    // =====================================================

    async function handleUpdateUser(event) {
        event.preventDefault()

        setSuccessMessage('')
        setErrorMessage('')

        if (!validateEditForm()) {
            return
        }

        try {
            const phoneCheck =
                await checkPhone(
                    editForm.phoneNumber,
                    editForm.userID
                )

            const phoneExists =
                phoneCheck?.exists ??
                phoneCheck?.Exists ??
                phoneCheck?.data?.exists ??
                phoneCheck?.data?.Exists ??
                false

            if (phoneExists) {
                setEditFieldErrors({
                    phoneNumber:
                        'Phone number already exists.'
                })

                return
            }

            const payload = {
                loginID:
                    editForm.loginID.trim(),

                userName:
                    editForm.userName.trim(),

                phoneNumber:
                    editForm.phoneNumber,

                email:
                    editForm.email.trim(),

                isActive:
                    Number(editForm.isActive),

                is2FAEnabled:
                    Boolean(editForm.is2FAEnabled)
            }

            const response =
                await updateUser(
                    editForm.userID,
                    payload
                )

            const isSuccess =
                response?.isSuccess ??
                response?.IsSuccess ??
                true

            if (isSuccess === false) {
                throw new Error(
                    response?.message ||
                    response?.Message ||
                    'Unable to update user.'
                )
            }

            setSuccessMessage(
                response?.message ||
                response?.Message ||
                'User updated successfully.'
            )

            setShowEditModal(false)

            await loadUsers(
                sessionRegionCode,
                selectedBranch,
                phoneFilter
            )

        } catch (error) {
            console.error(
                'Error updating user:',
                error
            )

            setErrorMessage(
                error.message ||
                'Unable to update user.'
            )
        }
    }

    // =====================================================
    // CLOSE EDIT MODAL
    // =====================================================

    function closeEditModal() {
        setShowEditModal(false)
        setEditForm(initialEditForm)
        setEditFieldErrors({})
    }

    // =====================================================
    // OPEN APPROVER MAPPING
    // =====================================================

    async function handleApproverMapping(user) {
        const userId =
            Number(
                getValue(
                    user,
                    'userID',
                    'UserID',
                    0
                )
            )

        if (!userId) {
            return
        }

        // -------------------------------------------------
        // APPROVER MAPPING IS ONLY FOR ASE / ASM
        // -------------------------------------------------

        const userRoleId =
            Number(
                getValue(
                    user,
                    'roleID',
                    'RoleID',
                    0
                )
            )

        if (
            userRoleId !== 30 &&
            userRoleId !== 31
        ) {
            return
        }

        try {
            setSelectedRequestor(user)

            setShowApproverModal(true)
            setLoadingApprovers(true)
            setErrorMessage('')

            const response =
                await getApproverMapping(userId)

            const data =
                response?.data ||
                response?.Data ||
                response ||
                {}

            console.log(
                'Approver mapping response:',
                data
            )

            const responseAvailable =
                data?.availableApprovers ||
                data?.AvailableApprovers ||
                []

            // -------------------------------------------------
            // ONLY ALLOW BM / BA / ZA / ZM
            // -------------------------------------------------

            const available =
                Array.isArray(responseAvailable)
                    ? responseAvailable.filter(
                        approver =>
                            APPROVER_ROLE_IDS.includes(
                                getApproverRoleId(
                                    approver
                                )
                            )
                    )
                    : []

            setApproverData(data)
            setAvailableApprovers(available)

        } catch (error) {
            console.error(
                'Error loading approver mapping:',
                error
            )

            setErrorMessage(
                error.message ||
                'Unable to load approver mapping.'
            )

            setShowApproverModal(false)

        } finally {
            setLoadingApprovers(false)
        }
    }

    // =====================================================
    // SAVE APPROVER MAPPING
    // =====================================================
    // ALL AVAILABLE APPROVERS ARE SAVED DIRECTLY.
    // THERE IS NO SELECTED APPROVER CONCEPT.
    // =====================================================

    async function handleSaveApproverMapping() {

        if (
            !approverData ||
            availableApprovers.length === 0
        ) {
            return
        }

        try {
            setSavingApprovers(true)
            setSuccessMessage('')
            setErrorMessage('')

            // =========================================
            // REQUESTOR ID
            // =========================================

            const requestorId =
                Number(
                    getValue(
                        selectedRequestor,
                        'userID',
                        'UserID',
                        getValue(
                            selectedRequestor,
                            'userId',
                            'UserId',
                            0
                        )
                    )
                )

            if (!requestorId) {
                throw new Error(
                    'Requestor ID is not available.'
                )
            }

            // =========================================
            // SAVE ALL AVAILABLE APPROVERS
            // =========================================

            const payload =
                availableApprovers.map(
                    item => ({
                        approverUserId:
                            Number(
                                getValue(
                                    item,
                                    'approverUserId',
                                    'ApproverUserId',
                                    getValue(
                                        item,
                                        'userID',
                                        'UserID',
                                        0
                                    )
                                )
                            ),

                        approvalRole:
                            getValue(
                                item,
                                'approvalRole',
                                'ApprovalRole',
                                ''
                            ),

                        userName:
                            getValue(
                                item,
                                'userName',
                                'UserName',
                                ''
                            )
                    })
                )

            console.log(
                'Saving approver mapping:',
                {
                    requestorId,
                    payload
                }
            )

            // =========================================
            // SAVE
            // =========================================

            const response =
                await saveApproverMapping(
                    requestorId,
                    payload
                )

            console.log(
                'Save approver mapping response:',
                response
            )

            const isSuccess =
                response?.isSuccess ??
                response?.IsSuccess ??
                true

            if (isSuccess === false) {
                throw new Error(
                    response?.message ||
                    response?.Message ||
                    'Unable to save approver mapping.'
                )
            }

            // =========================================
            // REFRESH USER LIST
            // =========================================
            // This gets IsApproverMapped from the
            // database again.
            // =========================================

            await loadUsers(
                sessionRegionCode,
                selectedBranch,
                phoneFilter
            )

            setSuccessMessage(
                response?.message ||
                response?.Message ||
                'Approver mapping saved successfully.'
            )

            // =========================================
            // CLOSE MODAL
            // =========================================

            setShowApproverModal(false)
            setSelectedRequestor(null)
            setApproverData(null)
            setAvailableApprovers([])

        } catch (error) {
            console.error(
                'Error saving approver mapping:',
                error
            )

            setErrorMessage(
                error.message ||
                'Unable to save approver mapping.'
            )
        } finally {
            setSavingApprovers(false)
        }
    }

    // =====================================================
    // REGION DISPLAY NAME
    // =====================================================

    function getRegionName() {
        const region =
            regions.find(item => {

                const code =
                    getValue(
                        item,
                        'regionCode',
                        'RegionCode',
                        ''
                    )

                return (
                    String(code).toLowerCase() ===
                    String(sessionRegionCode).toLowerCase()
                )
            })

        if (region) {
            return getValue(
                region,
                'regionName',
                'RegionName',
                sessionRegionCode
            )
        }

        return sessionRegionCode
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <DashboardLayout title="User Management">

            <div className="user-management-page">

                {/* =================================================
                    SUCCESS / ERROR
                ================================================= */}

                {successMessage && (
                    <div className="um-alert um-alert-success">

                        {successMessage}

                        <button
                            type="button"
                            onClick={() =>
                                setSuccessMessage('')
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {errorMessage && (
                    <div className="um-alert um-alert-error">

                        {errorMessage}

                        <button
                            type="button"
                            onClick={() =>
                                setErrorMessage('')
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* =================================================
                    CREATE USER
                ================================================= */}

                <section className="um-card">

                    <div className="um-section-header">

                        <div>
                            <h2>
                                Create User
                            </h2>
                        </div>

                    </div>

                    <form onSubmit={handleCreateUser}>

                        {/* ROW 1 */}

                        <div className="um-form-grid">

                            {/* Login ID */}

                            <div className="um-form-group">

                                <label htmlFor="loginID">
                                    Login ID
                                </label>

                                <input
                                    id="loginID"
                                    name="loginID"
                                    type="text"
                                    value={createForm.loginID}
                                    onChange={handleCreateChange}
                                    maxLength={8}
                                    autoComplete="off"
                                    className={
                                        createFieldErrors.loginID
                                            ? 'um-input um-input-error'
                                            : 'um-input'
                                    }
                                />

                                {createFieldErrors.loginID && (
                                    <span className="um-field-error">
                                        {createFieldErrors.loginID}
                                    </span>
                                )}

                            </div>

                            {/* User Name */}

                            <div className="um-form-group">

                                <label htmlFor="userName">
                                    User Name
                                </label>

                                <input
                                    id="userName"
                                    name="userName"
                                    type="text"
                                    value={createForm.userName}
                                    onChange={handleCreateChange}
                                    maxLength={50}
                                    autoComplete="off"
                                    className={
                                        createFieldErrors.userName
                                            ? 'um-input um-input-error'
                                            : 'um-input'
                                    }
                                />

                                {createFieldErrors.userName && (
                                    <span className="um-field-error">
                                        {createFieldErrors.userName}
                                    </span>
                                )}

                            </div>

                            {/* Phone */}

                            <div className="um-form-group">

                                <label htmlFor="phoneNumber">
                                    Phone
                                </label>

                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="text"
                                    inputMode="numeric"
                                    value={createForm.phoneNumber}
                                    onChange={handleCreateChange}
                                    maxLength={10}
                                    autoComplete="off"
                                    className={
                                        createFieldErrors.phoneNumber
                                            ? 'um-input um-input-error'
                                            : 'um-input'
                                    }
                                />

                                {createFieldErrors.phoneNumber && (
                                    <span className="um-field-error">
                                        {createFieldErrors.phoneNumber}
                                    </span>
                                )}

                            </div>

                            {/* Email */}

                            <div className="um-form-group">

                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={createForm.email}
                                    onChange={handleCreateChange}
                                    maxLength={100}
                                    autoComplete="off"
                                    className={
                                        createFieldErrors.email
                                            ? 'um-input um-input-error'
                                            : 'um-input'
                                    }
                                />

                                {createFieldErrors.email && (
                                    <span className="um-field-error">
                                        {createFieldErrors.email}
                                    </span>
                                )}

                            </div>

                            {/* Region */}

                            <div className="um-form-group">

                                <label htmlFor="region">
                                    Region
                                </label>

                                <select
                                    id="region"
                                    className="um-input"
                                    value={sessionRegionCode}
                                    disabled
                                >

                                    <option value="">
                                        Select Region
                                    </option>

                                    <option value={sessionRegionCode}>
                                        {getRegionName()}
                                    </option>

                                </select>

                            </div>

                            {/* Branch */}

                            <div className="um-form-group">

                                <label htmlFor="bpCode">
                                    Branch
                                </label>

                                <select
                                    id="bpCode"
                                    name="bpCode"
                                    value={createForm.bpCode}
                                    onChange={handleCreateChange}
                                    disabled={loadingBranches}
                                    className={
                                        createFieldErrors.bpCode
                                            ? 'um-input um-input-error'
                                            : 'um-input'
                                    }
                                >

                                    <option value="">
                                        {loadingBranches
                                            ? 'Loading...'
                                            : 'Select Branch'}
                                    </option>

                                    {branches.map(
                                        (branch, index) => {

                                            const branchCode =
                                                getValue(
                                                    branch,
                                                    'bpCode',
                                                    'BPCode',
                                                    ''
                                                )

                                            const branchName =
                                                getValue(
                                                    branch,
                                                    'branchName',
                                                    'BranchName',
                                                    branchCode
                                                )

                                            return (
                                                <option
                                                    key={
                                                        branchCode ||
                                                        index
                                                    }
                                                    value={branchCode}
                                                >
                                                    {branchName}
                                                </option>
                                            )
                                        }
                                    )}

                                </select>

                                {createFieldErrors.bpCode && (
                                    <span className="um-field-error">
                                        {createFieldErrors.bpCode}
                                    </span>
                                )}

                            </div>

                        </div>

                        {/* ROW 2 */}

                        <div className="um-form-second-row">

                            {/* Role */}

                            <div className="um-form-group">

                                <label htmlFor="roleID">
                                    Role
                                </label>

                                <select
                                    id="roleID"
                                    name="roleID"
                                    value={createForm.roleID}
                                    onChange={handleCreateChange}
                                    className={
                                        createFieldErrors.roleID
                                            ? 'um-input um-input-error'
                                            : 'um-input'
                                    }
                                >

                                    <option value="">
                                        Select Role
                                    </option>

                                    {ROLES.map(role => (
                                        <option
                                            key={role.roleId}
                                            value={role.roleId}
                                        >
                                            {role.roleName}
                                        </option>
                                    ))}

                                </select>

                                {createFieldErrors.roleID && (
                                    <span className="um-field-error">
                                        {createFieldErrors.roleID}
                                    </span>
                                )}

                            </div>

                            {/* Status */}

                            <div className="um-form-group">

                                <label htmlFor="isActive">
                                    Status
                                </label>

                                <select
                                    id="isActive"
                                    name="isActive"
                                    value={createForm.isActive}
                                    onChange={handleCreateChange}
                                    className="um-input"
                                >

                                    <option value={1}>
                                        Active
                                    </option>

                                    <option value={0}>
                                        Inactive
                                    </option>

                                </select>

                            </div>

                            {/* 2FA */}

                            <div className="um-form-group">

                                <label>
                                    2FA
                                </label>

                                <label className="um-toggle">

                                    <input
                                        type="checkbox"
                                        name="is2FAEnabled"
                                        checked={
                                            createForm.is2FAEnabled
                                        }
                                        onChange={
                                            handleCreateChange
                                        }
                                    />

                                    <span className="um-toggle-slider"></span>

                                </label>

                            </div>

                            {/* SAVE */}

                            <div className="um-form-action">

                                <button
                                    type="submit"
                                    className="um-btn um-btn-primary"
                                >
                                    Save
                                </button>

                            </div>

                            {/* CANCEL */}

                            <div className="um-form-action">

                                <button
                                    type="button"
                                    className="um-btn um-btn-secondary"
                                    onClick={
                                        resetCreateForm
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>

                    </form>

                </section>

                {/* =================================================
                    USER LIST
                ================================================= */}

                <section className="um-card">

                    <div className="um-user-list-header">

                        <div className="um-user-list-title">

                            <h2>
                                User List
                            </h2>

                            <p>
                                Search and manage existing users.
                            </p>

                        </div>

                        <div className="um-inline-filters">

                            {/* Branch */}

                            <div className="um-inline-filter">

                                <label htmlFor="userBranchFilter">
                                    Branch
                                </label>

                                <select
                                    id="userBranchFilter"
                                    value={selectedBranch}
                                    onChange={
                                        handleBranchFilterChange
                                    }
                                    className="um-input"
                                >

                                    <option value="">
                                        All Branches
                                    </option>

                                    {branches.map(
                                        (branch, index) => {

                                            const branchCode =
                                                getValue(
                                                    branch,
                                                    'bpCode',
                                                    'BPCode',
                                                    ''
                                                )

                                            const branchName =
                                                getValue(
                                                    branch,
                                                    'branchName',
                                                    'BranchName',
                                                    branchCode
                                                )

                                            return (
                                                <option
                                                    key={
                                                        branchCode ||
                                                        index
                                                    }
                                                    value={branchCode}
                                                >
                                                    {branchName}
                                                </option>
                                            )
                                        }
                                    )}

                                </select>

                            </div>

                            {/* Phone */}

                            <div className="um-inline-filter">

                                <label htmlFor="userPhoneFilter">
                                    Phone
                                </label>

                                <input
                                    id="userPhoneFilter"
                                    type="text"
                                    inputMode="numeric"
                                    value={phoneFilter}
                                    onChange={
                                        handlePhoneFilterChange
                                    }
                                    maxLength={10}
                                    placeholder="Enter phone number"
                                    className="um-input"
                                />

                            </div>

                            {/* CLEAR */}

                            <button
                                type="button"
                                className="um-btn um-btn-secondary um-clear-filter-btn"
                                onClick={clearFilters}
                            >
                                Clear
                            </button>

                        </div>

                    </div>

                    {/* RECORD COUNT */}

                    {!loadingUsers &&
                        users.length > 0 && (
                            <div className="um-record-count">

                                {users.length} record
                                {users.length !== 1
                                    ? 's'
                                    : ''} found

                            </div>
                        )}

                    {/* LOADING */}

                    {loadingUsers && (
                        <div className="um-loading">

                            <div className="um-loading-dots">

                                <span></span>
                                <span></span>
                                <span></span>

                            </div>

                            <span>
                                Loading...
                            </span>

                        </div>
                    )}

                    {/* TABLE */}

                    {!loadingUsers &&
                        users.length > 0 && (
                            <div className="um-table-wrapper">

                                <table className="um-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Login ID
                                            </th>

                                            <th>
                                                User Name
                                            </th>

                                            <th>
                                                Phone
                                            </th>

                                            <th>
                                                Email
                                            </th>

                                            <th>
                                                Branch
                                            </th>

                                            <th>
                                                Role
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                2FA
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {users.map(
                                            (user, index) => {

                                                const userId =
                                                    Number(
                                                        getValue(
                                                            user,
                                                            'userID',
                                                            'UserID',
                                                            0
                                                        )
                                                    )

                                                const loginID =
                                                    getValue(
                                                        user,
                                                        'loginID',
                                                        'LoginID',
                                                        ''
                                                    )

                                                const userName =
                                                    getValue(
                                                        user,
                                                        'userName',
                                                        'UserName',
                                                        ''
                                                    )

                                                const phone =
                                                    getPhoneValue(
                                                        user
                                                    )

                                                const email =
                                                    getEmailValue(
                                                        user
                                                    )

                                                const branch =
                                                    getValue(
                                                        user,
                                                        'branchName',
                                                        'BranchName',
                                                        getValue(
                                                            user,
                                                            'bpCode',
                                                            'BPCode',
                                                            ''
                                                        )
                                                    )

                                                const roleId =
                                                    Number(
                                                        getValue(
                                                            user,
                                                            'roleID',
                                                            'RoleID',
                                                            0
                                                        )
                                                    )

                                                const role =
                                                    ROLES.find(
                                                        item =>
                                                            item.roleId ===
                                                            roleId
                                                    )

                                                const isActive =
                                                    getBooleanValue(
                                                        user,
                                                        'isActive',
                                                        'IsActive',
                                                        false
                                                    )

                                                const is2FA =
                                                    getBooleanValue(
                                                        user,
                                                        'is2FAEnabled',
                                                        'Is2FAEnabled',
                                                        false
                                                    )

                                                const canMapApprover =
                                                    roleId === 30 ||
                                                    roleId === 31

                                                // =========================================
                                                // IMPORTANT:
                                                // This comes from the backend/database.
                                                // It is NOT React-only state.
                                                // =========================================

                                                const isApproverMappingSaved =
                                                    getBooleanValue(
                                                        user,
                                                        'isApproverMapped',
                                                        'IsApproverMapped',
                                                        false
                                                    )

                                                return (
                                                    <tr
                                                        key={
                                                            userId ||
                                                            index
                                                        }
                                                    >

                                                        <td>
                                                            {loginID}
                                                        </td>

                                                        <td>
                                                            {userName}
                                                        </td>

                                                        <td>
                                                            {phone || '-'}
                                                        </td>

                                                        <td>
                                                            {email || '-'}
                                                        </td>

                                                        <td>
                                                            {branch}
                                                        </td>

                                                        <td>
                                                            {role?.roleName ||
                                                                roleId}
                                                        </td>

                                                        <td>

                                                            <span
                                                                className={
                                                                    isActive
                                                                        ? 'um-status um-status-active'
                                                                        : 'um-status um-status-inactive'
                                                                }
                                                            >
                                                                {isActive
                                                                    ? 'Active'
                                                                    : 'Inactive'}
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <span
                                                                className={
                                                                    is2FA
                                                                        ? 'um-status um-status-active'
                                                                        : 'um-status um-status-inactive'
                                                                }
                                                            >
                                                                {is2FA
                                                                    ? 'ON'
                                                                    : 'OFF'}
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <div className="um-action-buttons">

                                                                {/* EDIT */}

                                                                <button
                                                                    type="button"
                                                                    className="um-btn um-btn-small um-btn-primary"
                                                                    onClick={() =>
                                                                        handleEditUser(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                                {/* APPROVER */}

                                                                <button
                                                                    type="button"
                                                                    className="um-btn um-btn-small um-btn-secondary"
                                                                    disabled={
                                                                        !canMapApprover ||
                                                                        isApproverMappingSaved
                                                                    }
                                                                    title={
                                                                        !canMapApprover
                                                                            ? 'Approver mapping is available only for ASE and ASM'
                                                                            : isApproverMappingSaved
                                                                                ? 'Approver mapping already saved'
                                                                                : 'Manage Approvers'
                                                                    }
                                                                    onClick={() => {

                                                                        if (
                                                                            canMapApprover &&
                                                                            !isApproverMappingSaved
                                                                        ) {
                                                                            handleApproverMapping(
                                                                                user
                                                                            )
                                                                        }

                                                                    }}
                                                                >
                                                                    Approver
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                )
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    {/* NO RECORD */}

                    {!loadingUsers &&
                        users.length === 0 && (
                            <div className="um-no-record">
                                No users found.
                            </div>
                        )}

                </section>

                {/* =================================================
                    EDIT USER MODAL
                ================================================= */}

                {showEditModal && (

                    <div className="um-modal-overlay">

                        <div className="um-modal">

                            <div className="um-modal-header">

                                <div>

                                    <h3>
                                        Edit User
                                    </h3>

                                    <p>
                                        Update user details.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="um-modal-close"
                                    onClick={
                                        closeEditModal
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            {loadingEdit ? (

                                <div className="um-modal-loading">

                                    <div className="um-loading-dots">

                                        <span></span>
                                        <span></span>
                                        <span></span>

                                    </div>

                                    <span>
                                        Loading...
                                    </span>

                                </div>

                            ) : (

                                <form
                                    onSubmit={
                                        handleUpdateUser
                                    }
                                >

                                    <div className="um-modal-body">

                                        <div className="um-modal-grid">

                                            {/* Login ID */}

                                            <div className="um-form-group">

                                                <label>
                                                    Login ID
                                                </label>

                                                <input
                                                    type="text"
                                                    name="loginID"
                                                    value={
                                                        editForm.loginID
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    className={
                                                        editFieldErrors.loginID
                                                            ? 'um-input um-input-error'
                                                            : 'um-input'
                                                    }
                                                />

                                                {editFieldErrors.loginID && (
                                                    <span className="um-field-error">
                                                        {
                                                            editFieldErrors.loginID
                                                        }
                                                    </span>
                                                )}

                                            </div>

                                            {/* User Name */}

                                            <div className="um-form-group">

                                                <label>
                                                    User Name
                                                </label>

                                                <input
                                                    type="text"
                                                    name="userName"
                                                    value={
                                                        editForm.userName
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    className={
                                                        editFieldErrors.userName
                                                            ? 'um-input um-input-error'
                                                            : 'um-input'
                                                    }
                                                />

                                                {editFieldErrors.userName && (
                                                    <span className="um-field-error">
                                                        {
                                                            editFieldErrors.userName
                                                        }
                                                    </span>
                                                )}

                                            </div>

                                            {/* Phone */}

                                            <div className="um-form-group">

                                                <label>
                                                    Phone
                                                </label>

                                                <input
                                                    type="text"
                                                    name="phoneNumber"
                                                    inputMode="numeric"
                                                    maxLength={10}
                                                    value={
                                                        editForm.phoneNumber
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    className={
                                                        editFieldErrors.phoneNumber
                                                            ? 'um-input um-input-error'
                                                            : 'um-input'
                                                    }
                                                />

                                                {editFieldErrors.phoneNumber && (
                                                    <span className="um-field-error">
                                                        {
                                                            editFieldErrors.phoneNumber
                                                        }
                                                    </span>
                                                )}

                                            </div>

                                            {/* Email */}

                                            <div className="um-form-group">

                                                <label>
                                                    Email
                                                </label>

                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={
                                                        editForm.email
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    className={
                                                        editFieldErrors.email
                                                            ? 'um-input um-input-error'
                                                            : 'um-input'
                                                    }
                                                />

                                                {editFieldErrors.email && (
                                                    <span className="um-field-error">
                                                        {
                                                            editFieldErrors.email
                                                        }
                                                    </span>
                                                )}

                                            </div>

                                            {/* Status */}

                                            <div className="um-form-group">

                                                <label>
                                                    Status
                                                </label>

                                                <select
                                                    name="isActive"
                                                    value={
                                                        editForm.isActive
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    className="um-input"
                                                >

                                                    <option value={1}>
                                                        Active
                                                    </option>

                                                    <option value={0}>
                                                        Inactive
                                                    </option>

                                                </select>

                                            </div>

                                            {/* 2FA */}

                                            <div className="um-form-group">

                                                <label>
                                                    2FA
                                                </label>

                                                <label className="um-toggle">

                                                    <input
                                                        type="checkbox"
                                                        name="is2FAEnabled"
                                                        checked={
                                                            editForm.is2FAEnabled
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />

                                                    <span className="um-toggle-slider"></span>

                                                </label>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="um-modal-footer">

                                        <button
                                            type="button"
                                            className="um-btn um-btn-secondary"
                                            onClick={
                                                closeEditModal
                                            }
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="um-btn um-btn-primary"
                                        >
                                            Update
                                        </button>

                                    </div>

                                </form>
                            )}

                        </div>

                    </div>
                )}

                {/* =================================================
                    APPROVER MAPPING MODAL
                ================================================= */}

                {showApproverModal && (

                    <div className="um-modal-overlay">

                        <div className="um-modal um-approver-modal">

                            {/* HEADER */}

                            <div className="um-modal-header">

                                <div>

                                    <h3>
                                        Approver Mapping
                                    </h3>

                                </div>

                                <button
                                    type="button"
                                    className="um-modal-close"
                                    onClick={() => {

                                        setShowApproverModal(false)
                                        setSelectedRequestor(null)
                                        setApproverData(null)
                                        setAvailableApprovers([])

                                    }}
                                >
                                    ×
                                </button>

                            </div>

                            {/* LOADING */}

                            {loadingApprovers ? (

                                <div className="um-modal-loading">

                                    <div className="um-loading-dots">

                                        <span></span>
                                        <span></span>
                                        <span></span>

                                    </div>

                                    <span>
                                        Loading...
                                    </span>

                                </div>

                            ) : (

                                <>

                                    {/* =================================================
                                        REQUESTOR INFORMATION
                                    ================================================= */}

                                    <div className="um-approver-user-info">

                                        <div className="um-approver-info-item">

                                            <span className="um-approver-info-label">
                                                User Name
                                            </span>

                                            <span className="um-approver-info-value">

                                                {getValue(
                                                    selectedRequestor,
                                                    'userName',
                                                    'UserName',
                                                    ''
                                                ) || '-'}

                                            </span>

                                        </div>

                                        <div className="um-approver-info-item">

                                            <span className="um-approver-info-label">
                                                Branch
                                            </span>

                                            <span className="um-approver-info-value">

                                                {getValue(
                                                    selectedRequestor,
                                                    'branchName',
                                                    'BranchName',
                                                    getValue(
                                                        selectedRequestor,
                                                        'bpCode',
                                                        'BPCode',
                                                        ''
                                                    )
                                                ) || '-'}

                                            </span>

                                        </div>

                                        <div className="um-approver-info-item">

                                            <span className="um-approver-info-label">
                                                Role
                                            </span>

                                            <span className="um-approver-info-value">

                                                {(() => {

                                                    const roleId =
                                                        Number(
                                                            getValue(
                                                                selectedRequestor,
                                                                'roleID',
                                                                'RoleID',
                                                                0
                                                            )
                                                        )

                                                    const role =
                                                        ROLES.find(
                                                            item =>
                                                                item.roleId ===
                                                                roleId
                                                        )

                                                    return (
                                                        role?.roleName ||
                                                        getValue(
                                                            selectedRequestor,
                                                            'roleName',
                                                            'RoleName',
                                                            ''
                                                        ) ||
                                                        '-'
                                                    )

                                                })()}

                                            </span>

                                        </div>

                                    </div>

                                    {/* =================================================
                                        AVAILABLE APPROVERS
                                    ================================================= */}

                                    <div className="um-modal-body">

                                        <div className="um-approver-panel">

                                            <div className="um-panel-header">

                                                <h4>
                                                    Available Approvers
                                                </h4>

                                            </div>

                                            <div className="um-approver-list">

                                                {/* TABLE HEADER */}

                                                <div className="um-approver-table-header">

                                                    <div>
                                                        Role
                                                    </div>

                                                    <div>
                                                        User Name
                                                    </div>

                                                    <div>
                                                        Phone
                                                    </div>

                                                    <div>
                                                        Email
                                                    </div>

                                                    <div>
                                                        Action
                                                    </div>

                                                </div>

                                                {/* NO AVAILABLE APPROVERS */}

                                                {availableApprovers.length === 0 ? (

                                                    <div className="um-no-record">
                                                        No available approvers.
                                                    </div>

                                                ) : (

                                                    availableApprovers.map(
                                                        (approver, index) => {

                                                            const role =
                                                                getValue(
                                                                    approver,
                                                                    'approvalRole',
                                                                    'ApprovalRole',
                                                                    ''
                                                                )

                                                            const name =
                                                                getValue(
                                                                    approver,
                                                                    'userName',
                                                                    'UserName',
                                                                    ''
                                                                )

                                                            const phone =
                                                                getPhoneValue(
                                                                    approver
                                                                )

                                                            const email =
                                                                getEmailValue(
                                                                    approver
                                                                )

                                                            const userId =
                                                                Number(
                                                                    getValue(
                                                                        approver,
                                                                        'approverUserId',
                                                                        'ApproverUserId',
                                                                        getValue(
                                                                            approver,
                                                                            'userID',
                                                                            'UserID',
                                                                            index
                                                                        )
                                                                    )
                                                                )

                                                            return (

                                                                <div
                                                                    className="um-approver-table-row"
                                                                    key={
                                                                        userId ||
                                                                        `${role}-${index}`
                                                                    }
                                                                >

                                                                    {/* ROLE */}

                                                                    <div className="um-approver-role">

                                                                        <span>
                                                                            {role || '-'}
                                                                        </span>

                                                                    </div>

                                                                    {/* USER NAME */}

                                                                    <div className="um-approver-name">

                                                                        <strong>
                                                                            {name || '-'}
                                                                        </strong>

                                                                    </div>

                                                                    {/* PHONE */}

                                                                    <div className="um-approver-phone">

                                                                        {phone || '-'}

                                                                    </div>

                                                                    {/* EMAIL */}

                                                                    <div className="um-approver-email">

                                                                        {email || '-'}

                                                                    </div>

                                                                    {/* EDIT */}

                                                                    <div className="um-approver-action">

                                                                        <button
                                                                            type="button"
                                                                            className="um-btn um-btn-small um-btn-primary"
                                                                            onClick={() => {

                                                                                // Close Approver Mapping modal first
                                                                                setShowApproverModal(false)

                                                                                setSelectedRequestor(null)

                                                                                setApproverData(null)

                                                                                setAvailableApprovers([])

                                                                                // Open existing Edit User modal
                                                                                handleEditUser(
                                                                                    approver
                                                                                )

                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </button>

                                                                    </div>

                                                                </div>

                                                            )

                                                        }
                                                    )

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                    {/* =================================================
                                        FOOTER
                                    ================================================= */}

                                    <div className="um-modal-footer">

                                        <button
                                            type="button"
                                            className="um-btn um-btn-secondary"
                                            onClick={() => {

                                                setShowApproverModal(false)
                                                setSelectedRequestor(null)
                                                setApproverData(null)
                                                setAvailableApprovers([])

                                            }}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            className="um-btn um-btn-primary"
                                            disabled={
                                                savingApprovers ||
                                                availableApprovers.length === 0
                                            }
                                            onClick={
                                                handleSaveApproverMapping
                                            }
                                        >

                                            {savingApprovers
                                                ? 'Saving...'
                                                : 'Save Mapping'}

                                        </button>

                                    </div>

                                </>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </DashboardLayout>
    )
}

export default UserManagement