
import { useEffect, useState } from 'react'
import './AddTechSkill.css'

import {
    getRegions,
    getBranches,
    getFranchises
} from '../../api/reportsApi'

import {
    getTechnicianSkillMatrix,
    saveTechnicianSkillMatrix,
    downloadTechnicianSkillSet
} from '../../api/technicianSkillApi'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

function AddTechSkill() {
    // =========================================
    // SESSION VALUES
    // =========================================

    const sessionUserId = Number(
        sessionStorage.getItem('userId') || 0
    )

    const loginId = sessionStorage.getItem('loginId') || ''

    const sessionRegionCode =
        sessionStorage.getItem('regionCode') ||
        sessionStorage.getItem('RegionCode') ||
        ''

    const bpCode =
        sessionStorage.getItem('bpCode') ||
        sessionStorage.getItem('BPCode') ||
        ''

    // Read assigned roles from sessionStorage.
    const storedRoles = (() => {
        try {
            const roles = JSON.parse(
                sessionStorage.getItem('roles') || '[]'
            )

            return Array.isArray(roles)
                ? roles.map(role =>
                    String(
                        typeof role === 'object' && role !== null
                            ? role.roleId ??
                              role.RoleID ??
                              role.id ??
                              role.ID ??
                              ''
                            : role
                    )
                )
                : []
        } catch {
            return []
        }
    })()

    // Fallback for sessions that store only roleId.
    const roleId = Number(
        sessionStorage.getItem('roleId') ||
        sessionStorage.getItem('roleID') ||
        0
    )

    const hasAssignedRole = (id) =>
        storedRoles.includes(String(id)) ||
        roleId === Number(id)

    // Role 3 automatically selects its assigned region and branch.
    const shouldAutoSelectRegionBranch = hasAssignedRole(3)

    // =========================================
    // DROPDOWN STATE
    // =========================================

    const [regions, setRegions] = useState([])
    const [branches, setBranches] = useState([])
    const [franchises, setFranchises] = useState([])

    const [region, setRegion] = useState(
        shouldAutoSelectRegionBranch ? sessionRegionCode : ''
    )

    const [branch, setBranch] = useState(
        shouldAutoSelectRegionBranch ? bpCode : ''
    )

    const [franchise, setFranchise] = useState('')

    const [regionLoading, setRegionLoading] = useState(false)
    const [branchLoading, setBranchLoading] = useState(false)
    const [franchiseLoading, setFranchiseLoading] = useState(false)

    // =========================================
    // SKILL MATRIX STATE
    // =========================================

    const [products, setProducts] = useState([])
    const [technicians, setTechnicians] = useState([])
    const [matrixLoading, setMatrixLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // =========================================
    // DROPDOWN HELPERS
    // =========================================

    const getRegionCode = (item) =>
        item.regionCode ?? item.RegionCode ?? ''

    const getRegionName = (item) =>
        item.regionName ??
        item.RegionName ??
        item.name ??
        item.Name ??
        ''

    const getBranchCode = (item) =>
        item.bpCode ?? item.BPCode ?? ''

    const getBranchName = (item) =>
        item.branchName ?? item.BranchName ?? ''

    const getFranchiseCode = (item) =>
        item.frCode ??
        item.FrCode ??
        item.Frcode ??
        item.FRCode ??
        item.frcode ??
        item.loginId ??
        item.LoginID ??
        ''

    const getFranchiseName = (item) =>
        item.franchiseName ??
        item.FranchiseName ??
        item.userName ??
        item.UserName ??
        ''

    // =========================================
    // LOAD REGIONS
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadRegions = async () => {
            try {
                setRegionLoading(true)
                setError('')

                const data = await getRegions('', sessionUserId)

                if (cancelled) return

                if (!Array.isArray(data)) {
                    throw new Error('Invalid region response.')
                }

                setRegions(data)

                if (shouldAutoSelectRegionBranch) {
                    const matchingRegion = data.find(
                        item =>
                            String(getRegionCode(item)).trim().toLowerCase() ===
                            String(sessionRegionCode).trim().toLowerCase()
                    )

                    setRegion(
                        matchingRegion ? getRegionCode(matchingRegion) : ''
                    )
                }
            } catch (err) {
                if (cancelled) return

                setRegions([])
                setRegion('')

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
    }, [
        sessionUserId,
        shouldAutoSelectRegionBranch,
        sessionRegionCode
    ])

    // =========================================
    // LOAD BRANCHES WHEN REGION CHANGES
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadBranches = async () => {
            setBranches([])
            setBranch('')
            setFranchises([])
            setFranchise('')
            setProducts([])
            setTechnicians([])

            if (!region) {
                setBranchLoading(false)
                return
            }

            try {
                setBranchLoading(true)
                setError('')
                setMessage('')

                const data = await getBranches(sessionUserId, region)

                if (cancelled) return

                if (!Array.isArray(data)) {
                    throw new Error('Invalid branch response.')
                }

                const validBranches = data.filter(
                    item =>
                        item &&
                        getBranchCode(item) &&
                        getBranchName(item)
                )

                setBranches(validBranches)

                if (shouldAutoSelectRegionBranch) {
                    const matchingBranch = validBranches.find(
                        item =>
                            String(getBranchCode(item)).trim().toLowerCase() ===
                            String(bpCode).trim().toLowerCase()
                    )

                    setBranch(
                        matchingBranch ? getBranchCode(matchingBranch) : ''
                    )
                }
            } catch (err) {
                if (cancelled) return

                setBranches([])
                setBranch('')

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
        region,
        sessionUserId,
        shouldAutoSelectRegionBranch,
        bpCode
    ])

    // =========================================
    // LOAD FRANCHISES WHEN BRANCH CHANGES
    // API signature: getFranchises(bpCode, loginId)
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadFranchises = async () => {
            setFranchises([])
            setFranchise('')
            setProducts([])
            setTechnicians([])

            if (!branch) {
                setFranchiseLoading(false)
                return
            }

            try {
                setFranchiseLoading(true)
                setError('')
                setMessage('')

                // FIX: pass the selected BPCode and LoginID only.
                const data = await getFranchises(branch, loginId)

                if (cancelled) return

                if (!Array.isArray(data)) {
                    throw new Error('Invalid franchise response.')
                }

                const sortedFranchises = [...data].sort((a, b) =>
                    String(getFranchiseName(a)).localeCompare(
                        String(getFranchiseName(b)),
                        undefined,
                        { sensitivity: 'base' }
                    )
                )

                setFranchises(sortedFranchises)

                // Match LoginID against the franchise identifier.
                const normalizedLoginId = String(loginId).trim().toLowerCase()

                const matchingFranchise = sortedFranchises.find(item => {
                    const franchiseCode = String(
                        getFranchiseCode(item)
                    ).trim().toLowerCase()

                    const franchiseLoginId = String(
                        item.loginId ??
                        item.LoginID ??
                        item.loginID ??
                        ''
                    ).trim().toLowerCase()

                    return (
                        (normalizedLoginId &&
                            franchiseCode === normalizedLoginId) ||
                        (normalizedLoginId &&
                            franchiseLoginId === normalizedLoginId)
                    )
                })

                if (matchingFranchise) {
                    setFranchise(String(getFranchiseCode(matchingFranchise)))
                }
            } catch (err) {
                if (cancelled) return

                setFranchises([])
                setFranchise('')

                setError(err.message || 'Unable to load franchises.')
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
    }, [branch, loginId])

    // =========================================
    // LOAD SKILL MATRIX WHEN FRANCHISE CHANGES
    // =========================================

    useEffect(() => {
        let cancelled = false

        const loadSkillMatrix = async () => {
            setProducts([])
            setTechnicians([])

            if (!franchise) {
                setMatrixLoading(false)
                return
            }

            try {
                setMatrixLoading(true)
                setError('')
                setMessage('')

                const data = await getTechnicianSkillMatrix(franchise)

                if (cancelled) return

                const productList = Array.isArray(data.products)
                    ? data.products
                    : []

                const rows = Array.isArray(data.rows)
                    ? data.rows
                    : []

                setProducts(productList)

                setTechnicians(
                    rows.map(row => ({
                        techId: row.techId ?? row.TechId ?? row.techID,
                        name: row.name ?? row.Name ?? '',
                        scores: {
                            ...(row.scores ?? row.Scores ?? {})
                        }
                    }))
                )

                if (rows.length === 0) {
                    setMessage('No technicians found for this franchise.')
                }
            } catch (err) {
                if (cancelled) return

                setProducts([])
                setTechnicians([])

                setError(
                    err.message ||
                    'Unable to load technician skill matrix.'
                )
            } finally {
                if (!cancelled) {
                    setMatrixLoading(false)
                }
            }
        }

        loadSkillMatrix()

        return () => {
            cancelled = true
        }
    }, [franchise])

    // =========================================
    // REGION CHANGE
    // =========================================

    const handleRegionChange = (event) => {
        setRegion(event.target.value)
        setBranch('')
        setFranchise('')
        setBranches([])
        setFranchises([])
        setProducts([])
        setTechnicians([])
        setError('')
        setMessage('')
    }

    // =========================================
    // BRANCH CHANGE
    // =========================================

    const handleBranchChange = (event) => {
        setBranch(event.target.value)
        setFranchise('')
        setFranchises([])
        setProducts([])
        setTechnicians([])
        setError('')
        setMessage('')
    }

    // =========================================
    // FRANCHISE CHANGE
    // =========================================

    const handleFranchiseChange = (event) => {
        setFranchise(event.target.value)
        setProducts([])
        setTechnicians([])
        setError('')
        setMessage('')
    }

    // =========================================
    // UPDATE SKILL SCORE
    // =========================================

    const handleScoreChange = (techId, productCode, value) => {
        if (value !== '' && !/^\d+$/.test(value)) {
            return
        }

        setTechnicians(previous =>
            previous.map(technician =>
                String(technician.techId) === String(techId)
                    ? {
                        ...technician,
                        scores: {
                            ...technician.scores,
                            [productCode]: value
                        }
                    }
                    : technician
            )
        )
    }

    // =========================================
    // SAVE SKILL MATRIX
    // =========================================

    const handleSave = async () => {
        setError('')
        setMessage('')

        if (!region) {
            setError('Please select a region.')
            return
        }

        if (!branch) {
            setError('Please select a branch.')
            return
        }

        if (!franchise) {
            setError('Please select a franchise.')
            return
        }

        if (technicians.length === 0 || products.length === 0) {
            setError('No skill matrix data available to save.')
            return
        }

        const items = []

        technicians.forEach(technician => {
            products.forEach(product => {
                const score =
                    technician.scores?.[product.code] ??
                    technician.scores?.[product.Code] ??
                    ''

                if (String(score).trim() !== '') {
                    items.push({
                        techId: Number(technician.techId),
                        productCode: product.code ?? product.Code ?? '',
                        score: String(score).trim()
                    })
                }
            })
        })

        if (items.length === 0) {
            setError('Please enter at least one skill score.')
            return
        }

        try {
            setSaving(true)

            const result = await saveTechnicianSkillMatrix(items)

            setMessage(
                `Skill scores saved successfully. Rows affected: ${result.rowsAffected ?? 0}.`
            )
        } catch (err) {
            setError(err.message || 'Unable to save skill scores.')
        } finally {
            setSaving(false)
        }
    }

    // =========================================
    // DOWNLOAD SKILL MATRIX
    // =========================================

    const handleDownload = async () => {
        setError('')
        setMessage('')

        if (!region) {
            setError('Please select a region.')
            return
        }

        if (!branch) {
            setError('Please select a branch.')
            return
        }

        if (!franchise) {
            setError('Please select a franchise.')
            return
        }

        try {
            setDownloading(true)

            await downloadTechnicianSkillSet(branch, franchise)
        } catch (err) {
            setError(
                err.message ||
                'Unable to download technician skill set.'
            )
        } finally {
            setDownloading(false)
        }
    }

    // =========================================
    // UI
    // =========================================

    return (
        <DashboardLayout title="Add/Update Skill Set">
            <div className="add-tech-skill-page">
                <div className="add-tech-skill-card">

                    {/* FILTERS */}
                    <div className="add-tech-skill-filters">

                        <div className="add-tech-skill-field">
                            <label>
                                Region <span className="required">*</span>
                            </label>

                            <select
                                value={region}
                                onChange={handleRegionChange}
                                disabled={regionLoading || saving}
                            >
                                <option value="">Select Region</option>

                                {regions.map((item, index) => {
                                    const code = getRegionCode(item)

                                    return (
                                        <option
                                            key={code || `region-${index}`}
                                            value={code}
                                        >
                                            {getRegionName(item)}
                                        </option>
                                    )
                                })}
                            </select>

                            {regionLoading && (
                                <small>Loading regions...</small>
                            )}
                        </div>

                        <div className="add-tech-skill-field">
                            <label>
                                Branch <span className="required">*</span>
                            </label>

                            <select
                                value={branch}
                                onChange={handleBranchChange}
                                disabled={!region || branchLoading || saving}
                            >
                                <option value="">Select Branch</option>

                                {branches.map((item, index) => {
                                    const code = getBranchCode(item)

                                    return (
                                        <option
                                            key={`${code}-${index}`}
                                            value={code}
                                        >
                                            {getBranchName(item)}
                                        </option>
                                    )
                                })}
                            </select>

                            {branchLoading && (
                                <small>Loading branches...</small>
                            )}
                        </div>

                        <div className="add-tech-skill-field">
                            <label>
                                Franchise <span className="required">*</span>
                            </label>

                            <select
                                value={franchise}
                                onChange={handleFranchiseChange}
                                disabled={!branch || franchiseLoading || saving}
                            >
                                <option value="">Select Franchise</option>

                                {franchises.map((item, index) => {
                                    const code = getFranchiseCode(item)

                                    return (
                                        <option
                                            key={`${code}-${index}`}
                                            value={String(code)}
                                        >
                                            {getFranchiseName(item) || code}
                                        </option>
                                    )
                                })}
                            </select>

                            {franchiseLoading && (
                                <small>Loading franchises...</small>
                            )}
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="add-tech-skill-error">
                            {error}
                        </div>
                    )}

                    {/* SUCCESS / INFO */}
                    {message && (
                        <div className="add-tech-skill-message">
                            {message}
                        </div>
                    )}

                    {/* MATRIX LOADING */}
                    {matrixLoading && (
                        <div className="add-tech-skill-loading">
                            Loading technician skill matrix...
                        </div>
                    )}

                    {/* SKILL TABLE */}
                    {!matrixLoading && franchise && (
                        <div className="add-tech-skill-table-wrapper">
                            <table className="add-tech-skill-table">
                                <thead>
                                    <tr>
                                        <th className="tech-id-column">
                                            Tech ID
                                        </th>

                                        <th className="tech-name-column">
                                            Technician Name
                                        </th>

                                        {products.map((product, index) => (
                                            <th
                                                key={
                                                    product.code ??
                                                    product.Code ??
                                                    index
                                                }
                                            >
                                                {product.code ??
                                                    product.Code ??
                                                    ''}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {technicians.length > 0 ? (
                                        technicians.map((technician, index) => (
                                            <tr
                                                key={
                                                    technician.techId ??
                                                    `tech-${index}`
                                                }
                                            >
                                                <td>{technician.techId}</td>
                                                <td>{technician.name}</td>

                                                {products.map(
                                                    (product, productIndex) => {
                                                        const code =
                                                            product.code ??
                                                            product.Code ??
                                                            ''

                                                        const score =
                                                            technician.scores?.[code] ?? ''

                                                        return (
                                                            <td
                                                                key={`${code}-${productIndex}`}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    pattern="[0-9]*"
                                                                    aria-label={`${technician.name} ${code} skill score`}
                                                                    value={score}
                                                                    onChange={event =>
                                                                        handleScoreChange(
                                                                            technician.techId,
                                                                            code,
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    disabled={saving}
                                                                />
                                                            </td>
                                                        )
                                                    }
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={Math.max(
                                                    products.length + 2,
                                                    2
                                                )}
                                                className="add-tech-skill-empty"
                                            >
                                                No technicians found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* SAVE AND DOWNLOAD BUTTONS */}
                    {franchise &&
                        !matrixLoading &&
                        technicians.length > 0 && (
                            <div className="add-tech-skill-actions">
                                <button
                                    type="button"
                                    className="add-tech-skill-download"
                                    onClick={handleDownload}
                                    disabled={saving || downloading}
                                >
                                    {downloading ? 'Downloading...' : 'Download'}
                                </button>

                                <button
                                    type="button"
                                    className="add-tech-skill-save"
                                    onClick={handleSave}
                                    disabled={saving || downloading}
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default AddTechSkill
