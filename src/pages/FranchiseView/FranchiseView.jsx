
import { useEffect, useState } from 'react'
import './FranchiseView.css'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getFranchiseViewBranches,
    searchFranchises,
    updateFranchise
} from '../../api/franchiseViewApi'

import {
    getRegions,
    getFranchises
} from '../../api/reportsApi'

import {
    getFranchiseStates,
    getFranchiseCities
} from '../../api/franchiseApi'

function FranchiseView() {
    // =========================================
    // SESSION VALUES
    // =========================================

    const sessionUserId = Number(
        sessionStorage.getItem('userId') || 0
    )

    const storedRoleId = Number(
    sessionStorage.getItem('roleId') || 0
)

const storedRoles = (() => {
    try {
        const value = JSON.parse(
            sessionStorage.getItem('roles') || '[]'
        )

        return Array.isArray(value)
            ? value.map(role => Number(role))
            : []
    } catch {
        return []
    }
})()

const roleId = storedRoleId || storedRoles[0] || 0

const isRole6 = roleId === 6 || storedRoles.includes(6)

    const sessionBpCode =
    sessionStorage.getItem('bpCode') ||
    sessionStorage.getItem('BPCode') ||
    ''

    const sessionLoginId =
        sessionStorage.getItem('loginId') || ''

    const sessionRegionCode =
    sessionStorage.getItem('regionCode') ||
    sessionStorage.getItem('RegionCode') ||
    ''

    //const isRole6 = roleId === 6

    // =========================================
    // REGION
    // =========================================

    const [regions, setRegions] = useState([])

    const [regionCode, setRegionCode] = useState(
        isRole6 ? sessionRegionCode : ''
    )

    const [regionLoading, setRegionLoading] = useState(false)

    // =========================================
    // SEARCH FORM
    // =========================================

    const [branch, setBranch] = useState(
        isRole6 ? sessionBpCode : ''
    )

    //const [franchiseCode, setFranchiseCode] = useState('')
    const [franchiseCode, setFranchiseCode] = useState(
    roleId === 5 ? sessionLoginId : ''
    )   
    const [frCode, setFrCode] = useState('')
    const [franchiseName, setFranchiseName] = useState('')
    const [mobileNo, setMobileNo] = useState('')
    const [emailId, setEmailId] = useState('')
    const [status, setStatus] = useState('')
    const [isFraOwnApp, setIsFraOwnApp] = useState('')

    const [states, setStates] = useState([])
    const [stateCode, setStateCode] = useState('')
    const [stateLoading, setStateLoading] = useState(false)

    const [cities, setCities] = useState([])
    const [cityCode, setCityCode] = useState('')
    const [cityLoading, setCityLoading] = useState(false)

    // =========================================
    // BRANCHES
    // =========================================

    const [branches, setBranches] = useState([])
    const [branchLoading, setBranchLoading] = useState(false)

    // =========================================
    // FRANCHISE DROPDOWN
    // =========================================

    const [franchisesList, setFranchisesList] = useState([])
    const [franchiseLoading, setFranchiseLoading] = useState(false)

    // =========================================
    // FRANCHISE DATA
    // =========================================

    const [franchises, setFranchises] = useState([])
    const [loading, setLoading] = useState(false)

    // =========================================
    // MESSAGE
    // =========================================

    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // =========================================
    // EDIT STATE
    // =========================================

    const [editingFrCode, setEditingFrCode] = useState(null)
    const [editMobile, setEditMobile] = useState('')
    const [editEmail, setEditEmail] = useState('')
    const [editContactPerson, setEditContactPerson] = useState('')
    const [editStatus, setEditStatus] = useState('')
    const [updateLoading, setUpdateLoading] = useState(false)

    // =========================================
    // VALUE HELPER
    // =========================================

    const getValue = (item, ...keys) => {
        if (!item) {
            return ''
        }

        const itemKeys = Object.keys(item)

        for (const key of keys) {
            const matchingKey = itemKeys.find(
                itemKey => itemKey.toLowerCase() === key.toLowerCase()
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
    // NORMALIZE API LIST RESPONSE
    // =========================================

    const getList = (response) => {
        if (Array.isArray(response)) {
            return response
        }

        if (Array.isArray(response?.data)) {
            return response.data
        }

        if (Array.isArray(response?.result)) {
            return response.result
        }

        return []
    }

    // =========================================
    // STATUS HELPERS
    // =========================================

    const getStatusText = (value) => {
        if (
            value === true ||
            value === 1 ||
            value === '1' ||
            String(value).toLowerCase() === 'active' ||
            String(value).toLowerCase() === 'true'
        ) {
            return 'Active'
        }

        return 'De-Activated'
    }

    const getStatusValue = (value) => {
        if (
            value === true ||
            value === 1 ||
            value === '1' ||
            String(value).toLowerCase() === 'active' ||
            String(value).toLowerCase() === 'true'
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

            const response = await getRegions('', sessionUserId)

            if (cancelled) return

            const regionList = getList(response)
            setRegions(regionList)

            if (isRole6) {
                const matchingRegion = regionList.find(item => {
                    const code = getValue(
                        item,
                        'RegionCode',
                        'regionCode',
                        'Code',
                        'code'
                    )

                    return (
                        String(code).trim().toLowerCase() ===
                        String(sessionRegionCode).trim().toLowerCase()
                    )
                })

                setRegionCode(
                    matchingRegion
                        ? String(
                              getValue(
                                  matchingRegion,
                                  'RegionCode',
                                  'regionCode',
                                  'Code',
                                  'code'
                              )
                          )
                        : sessionRegionCode
                )
            } else {
                setRegionCode('')
            }
        } catch (err) {
            if (cancelled) return

            console.error('Franchise region error:', err)
            setRegions([])

            setError(err.message || 'Unable to load regions.')
        } finally {
            if (!cancelled) {
                setRegionLoading(false)
            }
        }
    }

    loadRegions()

    return () => {
        cancelled = true
    }
}, [sessionUserId, isRole6, sessionRegionCode])

    // =========================================
    // LOAD STATES FOR ROLE 6
    // =========================================

    useEffect(() => {
        if (!isRole6) {
            setStates([])
            setStateCode('')
            return
        }

        let cancelled = false

        const loadStates = async () => {
            try {
                setStateLoading(true)

                const response = await getFranchiseStates()

                if (cancelled) {
                    return
                }

                setStates(getList(response))
            } catch (err) {
                if (cancelled) {
                    return
                }

                console.error('Franchise state error:', err)

                setStates([])
                setError(err.message || 'Unable to load states.')
            } finally {
                if (!cancelled) {
                    setStateLoading(false)
                }
            }
        }

        loadStates()

        return () => {
            cancelled = true
        }
    }, [isRole6])

    // =========================================
    // LOAD CITIES WHEN STATE CHANGES
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadCities = async () => {
            setCityCode('')
            setCities([])

            if (!isRole6 || !stateCode) {
                setCityLoading(false)
                return
            }

            try {
                setCityLoading(true)

                const response = await getFranchiseCities(stateCode)

                if (cancelled) {
                    return
                }

                setCities(getList(response))
            } catch (err) {
                if (cancelled) {
                    return
                }

                console.error('Franchise city error:', err)

                setCities([])
                setError(err.message || 'Unable to load cities.')
            } finally {
                if (!cancelled) {
                    setCityLoading(false)
                }
            }
        }

        loadCities()

        return () => {
            cancelled = true
        }
    }, [isRole6, stateCode])

    // =========================================
    // LOAD BRANCHES AFTER REGION SELECTION
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadBranches = async () => {
            setBranches([])
            setFranchisesList([])
            setFranchiseCode(roleId === 5 ? sessionLoginId : '')

            if (!regionCode) {
                if (!isRole6) {
                    setBranch('')
                }

                setBranchLoading(false)
                setFranchiseLoading(false)
                return
            }

            try {
                setBranchLoading(true)
                setError('')

                const response = await getFranchiseViewBranches(
                    sessionUserId,
                    regionCode
                )

                if (cancelled) return

                const branchList = getList(response)

                const validBranches = branchList.filter(item =>
                    String(
                        getValue(
                            item,
                            'BPCode',
                            'BpCode',
                            'bpCode',
                            'BranchCode',
                            'branchCode',
                            'BrCode',
                            'Brcode'
                        )
                    ).trim() !== ''
                )

                setBranches(validBranches)

                if (isRole6) {
    const matchingBranch = validBranches.find(item => {
        const code = getValue(
            item,
            'BPCode',
            'BranchCode',
            'BrCode',
            'Brcode'
        )

        return (
            String(code).trim().toLowerCase() ===
            String(sessionBpCode).trim().toLowerCase()
        )
    })

    setBranch(
        matchingBranch
            ? String(
                  getValue(
                      matchingBranch,
                      'BPCode',
                      'BranchCode',
                      'BrCode',
                      'Brcode'
                  )
              )
            : sessionBpCode
    )
} else {
    setBranch('')
}
            } catch (err) {
                if (cancelled) return

                console.error('Franchise branch error:', err)

                setBranches([])

                if (!isRole6) {
                    setBranch('')
                }

                setFranchisesList([])
                setFranchiseCode(roleId === 5 ? sessionLoginId : '')

                setError(err.message || 'Unable to load branches.')
            } finally {
                if (!cancelled) {
                    setBranchLoading(false)
                }
            }
        }

        loadBranches()

        return () => {
            cancelled = true
        }
    }, [
        regionCode,
        sessionUserId,
        isRole6,
        sessionBpCode,
        roleId,
        sessionLoginId
    ])

    // =========================================
// LOAD FRANCHISE DROPDOWN
// =========================================

useEffect(() => {
    let cancelled = false

    const loadFranchises = async () => {
        setFranchisesList([])
        setFranchiseCode(roleId === 5 ? sessionLoginId : '')

        if (!regionCode) {
            setFranchiseLoading(false)
            return
        }

        if (!branch && !isRole6 && roleId !== 5) {
            setFranchiseLoading(false)
            return
        }

        try {
            setFranchiseLoading(true)
            setError('')

            let bpCodeForFranchise = branch
            let loginIdForFranchise = sessionLoginId

            if (roleId === 5) {
                bpCodeForFranchise = sessionBpCode
                loginIdForFranchise = sessionLoginId
            } else if (isRole6) {
                bpCodeForFranchise = sessionBpCode
                loginIdForFranchise = sessionLoginId
            }

            if (!loginIdForFranchise.trim()) {
                throw new Error(
                    'Login ID is missing. Please check the logged-in user session.'
                )
            }

            const response = await getFranchises(
                bpCodeForFranchise,
                loginIdForFranchise
            )

            if (cancelled) return

            const franchiseList = getList(response)

            const validFranchises = franchiseList
                .filter(item =>
                    String(
                        getValue(
                            item,
                            'FrCode',
                            'Frcode',
                            'FRCode',
                            'frCode',
                            'LoginID',
                            'LoginId',
                            'loginId'
                        )
                    ).trim() !== ''
                )
                .sort((a, b) =>
                    String(
                        getValue(
                            a,
                            'FranchiseName',
                            'franchiseName',
                            'UserName',
                            'userName',
                            'Name',
                            'name'
                        )
                    ).localeCompare(
                        String(
                            getValue(
                                b,
                                'FranchiseName',
                                'franchiseName',
                                'UserName',
                                'userName',
                                'Name',
                                'name'
                            )
                        ),
                        undefined,
                        { sensitivity: 'base' }
                    )
                )

            setFranchisesList(validFranchises)

            if (roleId === 5) {
                const matchingFranchise = validFranchises.find(item =>
                    String(
                        getValue(
                            item,
                            'LoginID',
                            'LoginId',
                            'loginId',
                            'FrCode',
                            'Frcode',
                            'frCode'
                        )
                    ).trim().toLowerCase() ===
                    String(sessionLoginId).trim().toLowerCase()
                )

                setFranchiseCode(
                    matchingFranchise
                        ? String(
                              getValue(
                                  matchingFranchise,
                                  'LoginID',
                                  'LoginId',
                                  'loginId',
                                  'FrCode',
                                  'Frcode',
                                  'frCode'
                              )
                          )
                        : sessionLoginId
                )
            } else {
                setFranchiseCode('')
            }
        } catch (err) {
            if (cancelled) return

            console.error('Franchise dropdown error:', err)

            setFranchisesList([])
            setFranchiseCode(roleId === 5 ? sessionLoginId : '')
            setError(
                err.message || 'Unable to load franchises.'
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
    regionCode,
    branch,
    roleId,
    isRole6,
    sessionBpCode,
    sessionLoginId
])

    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async () => {
        if (!regionCode) {
            setError('Region is required.')
            return
        }

        if (!branch && isRole6) {
            setError('Branch is required.')
            return
        }

        try {
            setLoading(true)
            setError('')
            setSuccessMessage('')

            const request = {
                regionCode,
                branchCode: branch,
                frCode: frCode.trim(),
                franchiseName: franchiseName.trim(),
                mobileNo: mobileNo.trim(),

                // Role 6 uses Boolean True/False.
                // Other roles retain the existing 1/0 values.
                status: isRole6
                    ? status === ''
                        ? ''
                        : status === 'true'
                    : status,

                isFraOwnApp,

                stateCode: isRole6 ? stateCode : '',
                cityCode: isRole6 ? cityCode : '',
                emailId: isRole6 ? emailId.trim() : ''
            }

            console.log('Franchise Search Request:', request)

            const data = await searchFranchises(request)

            console.log('Franchise Search Response:', data)

            setFranchises(getList(data))
            setEditingFrCode(null)
        } catch (err) {
            console.error('Franchise search error:', err)

            setFranchises([])
            setError(err.message || 'Unable to search franchises.')
        } finally {
            setLoading(false)
        }
    }

    // =========================================
    // EDIT
    // =========================================

    const handleEdit = (item) => {
        setError('')
        setSuccessMessage('')

        const currentFrCode = getValue(item, 'frcode', 'FrCode')
        const currentStatus = getValue(item, 'isactive', 'IsActive')

        setEditingFrCode(currentFrCode)

        setEditMobile(
            String(
                getValue(
                    item,
                    'Phoneno',
                    'Phone',
                    'MobileNo',
                    'Mobileno'
                ) || ''
            )
        )

        setEditEmail(
            String(
                getValue(
                    item,
                    'EmailID',
                    'EmailId',
                    'Emailid'
                ) || ''
            )
        )

        setEditContactPerson(
            String(
                getValue(
                    item,
                    'CPerson',
                    'ContactPerson'
                ) || ''
            )
        )

        setEditStatus(getStatusValue(currentStatus))
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
    }

    // =========================================
    // UPDATE
    // =========================================

    const handleUpdate = async () => {
        if (!editingFrCode) {
            return
        }

        if (editStatus !== '1' && editStatus !== '0') {
            setError('Please select a valid status.')
            return
        }

        try {
            setUpdateLoading(true)
            setError('')
            setSuccessMessage('')

            const request = {
                FrCode: editingFrCode,
                Status: editStatus,
                UpdatedBy: sessionUserId,
                RoleId: String(roleId)
            }

            // Preserve existing full-edit behavior for other roles.
            // Role 6 sends only the status fields.
            if (!isRole6) {
                request.MobileNo = editMobile.trim()
                request.EmailId = editEmail.trim()
                request.ContactPerson = editContactPerson.trim()
            }

            console.log('Franchise Update Request:', request)

            const response = await updateFranchise(request)

            console.log('Franchise Update Response:', response)

            setEditingFrCode(null)
            setEditMobile('')
            setEditEmail('')
            setEditContactPerson('')
            setEditStatus('')

            setSuccessMessage(
                response?.message || 'Franchise updated successfully.'
            )

            await handleSearch()
        } catch (err) {
            console.error('Franchise update error:', err)

            setError(err.message || 'Unable to update franchise.')
        } finally {
            setUpdateLoading(false)
        }
    }

    // =========================================
    // RENDER
    // =========================================


    
    return (

        
        <DashboardLayout title="Franchise List">
            <div className="franchise-view-page">

                {/* SEARCH BOX */}
                <div className="franchise-view-box">
                    <div className="franchise-view-search-grid">

                        {/* REGION */}
                        <div className="franchise-field">
                            <label>Region</label>

                            <select
                                value={regionCode}
                                onChange={(event) => {
                                    setRegionCode(event.target.value)
                                    setBranch('')
                                    setFranchisesList([])
                                    setFranchiseCode('')
                                    setFranchises([])
                                    setError('')
                                    setSuccessMessage('')
                                }}
                                disabled={regionLoading || isRole6}
                            >
                                <option value="">Select Region</option>

                                {regions.map((item, index) => {
                                    const code = getValue(
                                        item,
                                        'regionCode',
                                        'RegionCode',
                                        'code',
                                        'Code'
                                    )

                                    const name = getValue(
                                        item,
                                        'regionName',
                                        'RegionName',
                                        'name',
                                        'Name'
                                    )

                                    return (
                                        <option
                                            key={code || `region-${index}`}
                                            value={code}
                                        >
                                            {name || code}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>

                        {/* BRANCH */}
                        <div className="franchise-field">
                            <label>Branch</label>

                            <select
                                value={branch}
                                onChange={(event) => {
                                    setBranch(event.target.value)
                                    setFranchiseCode('')
                                    setFranchisesList([])
                                }}
                                disabled={
                                    !regionCode ||
                                    branchLoading ||
                                    isRole6
                                }
                            >
                                <option value="">All</option>

                                {branches.map((item, index) => {
                                    const bpCode = getValue(
                                        item,
                                        'bpCode',
                                        'BPCode',
                                        'BPCODE',
                                        'branchCode',
                                        'BranchCode',
                                        'Brcode',
                                        'BrCode'
                                    )

                                    const branchName = getValue(
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
                                            {branchName || bpCode}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>

                        {/* FRANCHISE DROPDOWN - OTHER ROLES */}
                        {/* FRANCHISE DROPDOWN */}
<div className="franchise-field">
    <label>Franchise</label>

    <select
        value={franchiseCode}
        onChange={(event) => setFranchiseCode(event.target.value)}
        disabled={
            !regionCode ||
            franchiseLoading ||
            (roleId === 5)
        }
    >
        {roleId === 5 ? (
            <>
                {franchisesList.map((item, index) => {
                    const code = getValue(
                        item,
                        'LoginID',
                        'LoginId',
                        'loginId',
                        'FrCode',
                        'Frcode',
                        'frCode'
                    )

                    const name = getValue(
                        item,
                        'FranchiseName',
                        'franchiseName',
                        'UserName',
                        'userName',
                        'Name',
                        'name'
                    )

                    return (
                        <option
                            key={code || `franchise-${index}`}
                            value={code}
                        >
                            {name || code}
                        </option>
                    )
                })}

                {franchisesList.length === 0 && (
                    <option value={sessionLoginId}>
                        {sessionLoginId}
                    </option>
                )}
            </>
        ) : (
            <>
                <option value="">All</option>

                {franchisesList.map((item, index) => {
                    const code = getValue(
                        item,
                        'FrCode',
                        'Frcode',
                        'FRCode',
                        'frCode',
                        'LoginID',
                        'LoginId',
                        'loginId',
                        'BPCode',
                        'bpCode'
                    )

                    const name = getValue(
                        item,
                        'FranchiseName',
                        'franchiseName',
                        'UserName',
                        'userName',
                        'Name',
                        'name'
                    )

                    return (
                        <option
                            key={code || `franchise-${index}`}
                            value={code}
                        >
                            {name || code}
                        </option>
                    )
                })}
            </>
        )}
    </select>
</div>

                        {/* FRANCHISE CODE */}
                        <div className="franchise-field">
                            <label>Franchise Code</label>

                            <input
                                type="text"
                                value={frCode}
                                onChange={(event) =>
                                    setFrCode(event.target.value)
                                }
                            />
                        </div>

                        {/* FRANCHISE NAME */}
                        <div className="franchise-field">
                            <label>Franchise Name</label>

                            <input
                                type="text"
                                value={franchiseName}
                                onChange={(event) =>
                                    setFranchiseName(event.target.value)
                                }
                            />
                        </div>

                        {/* MOBILE */}
                        <div className="franchise-field">
                            <label>Mobile Number</label>

                            <input
                                type="text"
                                value={mobileNo}
                                maxLength={10}
                                onChange={(event) => {
                                    const value =
                                        event.target.value.replace(/\D/g, '')

                                    setMobileNo(value)
                                }}
                            />
                        </div>

                        {/* ROLE 6: EMAIL */}
                        {isRole6 && (
                            <div className="franchise-field">
                                <label>Email ID</label>

                                <input
                                    type="text"
                                    value={emailId}
                                    onChange={(event) =>
                                        setEmailId(event.target.value)
                                    }
                                />
                            </div>
                        )}

                        {/* ROLE 6: STATE */}
                        {isRole6 && (
                            <div className="franchise-field">
                                <label>State</label>

                                <select
                                    value={stateCode}
                                    onChange={(event) =>
                                        setStateCode(event.target.value)
                                    }
                                    disabled={stateLoading}
                                >
                                    <option value="">
                                        {stateLoading
                                            ? 'Loading states...'
                                            : 'All'}
                                    </option>

                                    {states.map((item, index) => {
                                        const code = getValue(
                                            item,
                                            'StateCode',
                                            'stateCode',
                                            'Code',
                                            'code'
                                        )

                                        const name = getValue(
                                            item,
                                            'StateName',
                                            'stateName',
                                            'Name',
                                            'name'
                                        )

                                        return (
                                            <option
                                                key={code || `state-${index}`}
                                                value={code}
                                            >
                                                {name || code}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                        )}

                        {/* ROLE 6: CITY */}
                        {isRole6 && (
                            <div className="franchise-field">
                                <label>City</label>

                                <select
                                    value={cityCode}
                                    onChange={(event) =>
                                        setCityCode(event.target.value)
                                    }
                                    disabled={!stateCode || cityLoading}
                                >
                                    <option value="">
                                        {!stateCode
                                            ? 'Select State First'
                                            : cityLoading
                                                ? 'Loading cities...'
                                                : 'All'}
                                    </option>

                                    {cities.map((item, index) => {
                                        const code = getValue(
                                            item,
                                            'CityCode',
                                            'cityCode',
                                            'Code',
                                            'code'
                                        )

                                        const name = getValue(
                                            item,
                                            'CityName',
                                            'cityName',
                                            'Name',
                                            'name'
                                        )

                                        return (
                                            <option
                                                key={code || `city-${index}`}
                                                value={code}
                                            >
                                                {name || code}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                        )}

                        {/* ROLE 6: ACTIVE | OTHER ROLES: STATUS */}
                        <div className="franchise-field">
                            <label>{isRole6 ? 'Active' : 'Status'}</label>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                            >
                                <option value="">All</option>

                                {isRole6 ? (
                                    <>
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="1">Active</option>
                                        <option value="0">De-Activated</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* FR OWN APP - OTHER ROLES */}
                        {!isRole6 && (
                            <div className="franchise-field">
                                <label>FrOWNApp</label>

                                <select
                                    value={isFraOwnApp}
                                    onChange={(event) =>
                                        setIsFraOwnApp(event.target.value)
                                    }
                                >
                                    <option value="">All</option>
                                    <option value="1">Enabled</option>
                                    <option value="0">Disabled</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* SEARCH BUTTON */}
                    <div className="franchise-search-actions">
                        <button
                            type="button"
                            className="btn-search franchise-search-button"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>

                {/* MESSAGES */}
                {error && (
                    <div className="franchise-message franchise-error">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="franchise-message franchise-success">
                        {successMessage}
                    </div>
                )}

                {/* RESULTS TABLE */}
                <div className="franchise-view-box">
                    <div className="franchise-table-wrapper">
                        <table className="franchise-table">
                            <thead>
                                <tr>
                                    <th>SNo.</th>
                                    <th>FrCode</th>
                                    <th>Franchise Name</th>
                                    <th>Mobile</th>
                                    <th>Email-ID</th>
                                    <th>CPerson</th>
                                    <th>FrOWNApp</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="franchise-loading"
                                        >
                                            Loading...
                                        </td>
                                    </tr>
                                )}

                                {!loading && franchises.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="franchise-empty"
                                        >
                                            No records found.
                                        </td>
                                    </tr>
                                )}

                                {!loading && franchises.map((item, index) => {
                                    const currentFrCode = getValue(
                                        item,
                                        'frcode',
                                        'FrCode'
                                    )

                                    const currentStatus = getValue(
                                        item,
                                        'isactive',
                                        'IsActive'
                                    )

                                    const currentFraOwnApp = getValue(
                                        item,
                                        'is_fo_app_enabled',
                                        'IsFraOwnApp'
                                    )

                                    const isEditing =
                                        String(editingFrCode) ===
                                        String(currentFrCode)

                                    return (
                                        <tr key={currentFrCode || index}>
                                            <td>{index + 1}</td>

                                            <td className="franchise-code">
                                                {currentFrCode || '-'}
                                            </td>

                                            <td>
                                                {getValue(
                                                    item,
                                                    'FranchiseName',
                                                    'franchiseName'
                                                ) || '-'}
                                            </td>

                                            {/* MOBILE */}
                                            <td>
                                                {isEditing && !isRole6 ? (
                                                    <input
                                                        type="text"
                                                        maxLength={10}
                                                        value={editMobile}
                                                        onChange={(event) => {
                                                            const value =
                                                                event.target.value.replace(
                                                                    /\D/g,
                                                                    ''
                                                                )

                                                            setEditMobile(value)
                                                        }}
                                                    />
                                                ) : (
                                                    getValue(
                                                        item,
                                                        'Phoneno',
                                                        'Phone',
                                                        'MobileNo',
                                                        'Mobileno'
                                                    ) || '-'
                                                )}
                                            </td>

                                            {/* EMAIL */}
                                            <td>
                                                {isEditing && !isRole6 ? (
                                                    <input
                                                        type="text"
                                                        value={editEmail}
                                                        onChange={(event) =>
                                                            setEditEmail(
                                                                event.target.value
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    getValue(
                                                        item,
                                                        'EmailID',
                                                        'EmailId',
                                                        'Emailid'
                                                    ) || '-'
                                                )}
                                            </td>

                                            {/* CONTACT PERSON */}
                                            <td>
                                                {isEditing && !isRole6 ? (
                                                    <input
                                                        type="text"
                                                        value={editContactPerson}
                                                        onChange={(event) =>
                                                            setEditContactPerson(
                                                                event.target.value
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    getValue(
                                                        item,
                                                        'CPerson',
                                                        'ContactPerson'
                                                    ) || '-'
                                                )}
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
                                                    {getFraOwnAppText(
                                                        currentFraOwnApp
                                                    )}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td>
                                                {isEditing ? (
                                                    <select
                                                        value={editStatus}
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
                                                ) : (
                                                    <span
                                                        className={
                                                            getStatusText(
                                                                currentStatus
                                                            ) === 'Active'
                                                                ? 'franchise-badge franchise-active'
                                                                : 'franchise-badge franchise-inactive'
                                                        }
                                                    >
                                                        {getStatusText(
                                                            currentStatus
                                                        )}
                                                    </span>
                                                )}
                                            </td>

                                            {/* ACTION */}
                                            <td>
                                                {isEditing ? (
                                                    <div className="franchise-action-buttons">
                                                        <button
                                                            type="button"
                                                            className="franchise-icon-button save"
                                                            title="Save"
                                                            onClick={handleUpdate}
                                                            disabled={updateLoading}
                                                        >
                                                            {updateLoading
                                                                ? '…'
                                                                : '💾'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="franchise-icon-button cancel"
                                                            title="Cancel"
                                                            onClick={handleCancel}
                                                            disabled={updateLoading}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="franchise-icon-button edit"
                                                        title="Edit"
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                    >
                                                        ✎
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default FranchiseView
