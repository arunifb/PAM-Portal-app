
import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import {
    getCompanyDivisions,
    getProcessNoteAreas,
    getProcessNoteModules
} from '../../api/processNoteApi'
import './TrainingManual.css'

const getItemId = item =>
    item?.id ?? item?.Id ?? ''

const getItemText = item =>
    item?.text ??
    item?.Text ??
    item?.configName ??
    item?.ConfigName ??
    item?.area ??
    item?.Area ??
    item?.module ??
    item?.Module ??
    ''

function TrainingManualAdd({ onBack }) {

    const [companyDivisions, setCompanyDivisions] = useState([])
    const [areas, setAreas] = useState([])
    const [modules, setModules] = useState([])

    const [form, setForm] = useState({
        compDiviId: '',
        areaId: '',
        moduleId: '',
        processNote: '',
        file: null
    })

    const [loading, setLoading] = useState(false)
    const [loadingAreas, setLoadingAreas] = useState(false)
    const [loadingModules, setLoadingModules] = useState(false)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [masterModal, setMasterModal] = useState('')

    useEffect(() => {
        const loadCompanyDivisions = async () => {
            try {
                setLoading(true)

                const response = await getCompanyDivisions()

                setCompanyDivisions(
                    Array.isArray(response) ? response : []
                )
            } catch (err) {
                setError(
                    err.message || 'Unable to load company/division.'
                )
            } finally {
                setLoading(false)
            }
        }

        loadCompanyDivisions()
    }, [])

    const handleCompanyChange = async event => {
        const value = event.target.value

        setForm(prev => ({
            ...prev,
            compDiviId: value,
            areaId: '',
            moduleId: ''
        }))

        setAreas([])
        setModules([])
        setError('')
        setSuccess('')

        if (!value) return

        try {
            setLoadingAreas(true)

            const response = await getProcessNoteAreas(value)

            setAreas(Array.isArray(response) ? response : [])
        } catch (err) {
            setError(err.message || 'Unable to load areas.')
        } finally {
            setLoadingAreas(false)
        }
    }

    const handleAreaChange = async event => {
        const value = event.target.value

        setForm(prev => ({
            ...prev,
            areaId: value,
            moduleId: ''
        }))

        setModules([])
        setError('')
        setSuccess('')

        if (!value) return

        try {
            setLoadingModules(true)

            const response = await getProcessNoteModules(value)

            setModules(Array.isArray(response) ? response : [])
        } catch (err) {
            setError(err.message || 'Unable to load modules.')
        } finally {
            setLoadingModules(false)
        }
    }

    const handleChange = event => {
        const { name, value } = event.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))

        setError('')
        setSuccess('')
    }

    const handleFileChange = event => {
        const file = event.target.files?.[0] || null

        setForm(prev => ({
            ...prev,
            file
        }))

        setError('')
        setSuccess('')
    }

    const handleSave = async event => {
        event.preventDefault()

        setError('')
        setSuccess('')

        if (!form.compDiviId) {
            setError('Please select company/division.')
            return
        }

        if (!form.areaId) {
            setError('Please select area.')
            return
        }

        if (!form.moduleId) {
            setError('Please select module.')
            return
        }

        if (!form.file) {
            setError('Please select process file.')
            return
        }

        if (!form.processNote.trim()) {
            setError('Please enter process note.')
            return
        }

        if (form.processNote.length > 64) {
            setError('Process note cannot exceed 64 characters.')
            return
        }

        // Upload API is not available yet.
        setError('Process Note upload API is not connected yet.')
    }

    const openMasterModal = type => {
        setMasterModal(type)
    }

    return (
        <DashboardLayout>
            <div className="training-manual-page">

                <div className="tm-add-top-actions">
                    <button
                        type="button"
                        className="tm-back-button"
                        onClick={onBack}
                    >
                        <i className="fa fa-arrow-left" /> Back
                    </button>
                </div>

                <div className="tm-box">
                    <div className="tm-box-content">
                        <form onSubmit={handleSave}>

                            <div className="tm-add-form-row">

                                {/* COMPANY / DIVISION */}
                                <div className="tm-add-field tm-company-field">
                                    <label>
                                        Company/Division
                                        <span className="tm-required">*</span>

                                        <button
                                            type="button"
                                            className="tm-master-add-button"
                                            title="Add Company/Division"
                                            onClick={() => openMasterModal('division')}
                                        >
                                            <i className="fa fa-plus" />
                                        </button>
                                    </label>

                                    <select
                                        value={form.compDiviId}
                                        onChange={handleCompanyChange}
                                        disabled={loading}
                                    >
                                        <option value="">
                                            -- Select Company/Division --
                                        </option>

                                        {companyDivisions.map(item => (
                                            <option
                                                key={getItemId(item)}
                                                value={getItemId(item)}
                                            >
                                                {getItemText(item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* AREA */}
                                <div className="tm-add-field">
                                    <label>
                                        Area
                                        <span className="tm-required">*</span>

                                        <button
                                            type="button"
                                            className="tm-master-add-button"
                                            title="Add Area"
                                            onClick={() => openMasterModal('area')}
                                        >
                                            <i className="fa fa-plus" />
                                        </button>
                                    </label>

                                    <select
                                        value={form.areaId}
                                        onChange={handleAreaChange}
                                        disabled={!form.compDiviId || loadingAreas}
                                    >
                                        <option value="">-- Select Area --</option>

                                        {areas.map(item => (
                                            <option
                                                key={getItemId(item)}
                                                value={getItemId(item)}
                                            >
                                                {getItemText(item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* MODULE */}
                                <div className="tm-add-field">
                                    <label>
                                        Module
                                        <span className="tm-required">*</span>

                                        <button
                                            type="button"
                                            className="tm-master-add-button"
                                            title="Add Module"
                                            onClick={() => openMasterModal('module')}
                                        >
                                            <i className="fa fa-plus" />
                                        </button>
                                    </label>

                                    <select
                                        value={form.moduleId}
                                        onChange={handleChange}
                                        name="moduleId"
                                        disabled={!form.areaId || loadingModules}
                                    >
                                        <option value="">-- Select Module --</option>

                                        {modules.map(item => (
                                            <option
                                                key={getItemId(item)}
                                                value={getItemId(item)}
                                            >
                                                {getItemText(item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="tm-add-form-row">

                                <div className="tm-add-field tm-file-field">
                                    <label>
                                        Upload Process Note
                                        <span className="tm-required">*</span>
                                    </label>

                                    <input
                                        type="file"
                                        className="tm-file-input"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <div className="tm-add-field tm-process-note-field">
                                    <label>
                                        Process Note
                                        <span className="tm-required">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="processNote"
                                        value={form.processNote}
                                        onChange={handleChange}
                                        maxLength={64}
                                        placeholder="type here about process note in 64 character only."
                                    />
                                </div>

                            </div>

                            {error && (
                                <div className="tm-error">
                                    <i className="fa fa-exclamation-circle" />
                                    {' '}{error}
                                </div>
                            )}

                            {success && (
                                <div className="tm-success">
                                    <i className="fa fa-check-circle" />
                                    {' '}{success}
                                </div>
                            )}

                            <div className="tm-add-actions">
                                <button
                                    type="submit"
                                    className="btn-search tm-save-button"
                                    disabled={loading}
                                >
                                    <i className="fa fa-save" /> Save
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

                {masterModal && (
                    <TrainingManualMasterModal
                        type={masterModal}
                        onClose={() => setMasterModal('')}
                    />
                )}

            </div>
        </DashboardLayout>
    )
}

/* =====================================================
   MASTER DATA MODAL
===================================================== */


function TrainingManualMasterModal({ type, onClose }) {
    const [rows, setRows] = useState([])
    const [divisions, setDivisions] = useState([])
    const [footerAreas, setFooterAreas] = useState([])

    const [footerDivisionId, setFooterDivisionId] = useState('')
    const [footerAreaId, setFooterAreaId] = useState('')
    const [footerModuleName, setFooterModuleName] = useState('')
    const [loading, setLoading] = useState(true)
    const [loadingFooterAreas, setLoadingFooterAreas] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        const loadMasterData = async () => {
            try {
                setLoading(true)
                setError('')

                const divisionResponse = await getCompanyDivisions()

                const divisionList = Array.isArray(divisionResponse)
                    ? divisionResponse
                    : []

                if (cancelled) return

                setDivisions(divisionList)

                let result = []

                // DIVISION MASTER
                if (type === 'division') {
                    result = divisionList.map(item => ({
                        id: getItemId(item),
                        name: getItemText(item)
                    }))
                }

                // AREA MASTER
                if (type === 'area') {
                    const areaGroups = await Promise.all(
                        divisionList.map(async division => {
                            const response = await getProcessNoteAreas(
                                getItemId(division)
                            )

                            return (Array.isArray(response) ? response : [])
                                .map(item => ({
                                    id: getItemId(item),
                                    name: getItemText(item),
                                    divisionName: getItemText(division)
                                }))
                        })
                    )

                    result = areaGroups.flat()
                }

                // MODULE MASTER
                if (type === 'module') {
                    const areaGroups = await Promise.all(
                        divisionList.map(async division => {
                            const response = await getProcessNoteAreas(
                                getItemId(division)
                            )

                            return {
                                divisionName: getItemText(division),
                                areas: Array.isArray(response) ? response : []
                            }
                        })
                    )

                    const moduleGroups = await Promise.all(
                        areaGroups.flatMap(group =>
                            group.areas.map(async area => {
                                const response = await getProcessNoteModules(
                                    getItemId(area)
                                )

                                return (Array.isArray(response) ? response : [])
                                    .map(item => ({
                                        id: getItemId(item),
                                        name: getItemText(item)
                                    }))
                            })
                        )
                    )

                    result = moduleGroups.flat()
                }

                if (!cancelled) {
                    setRows(result)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message || 'Unable to load master records.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadMasterData()

        return () => {
            cancelled = true
        }
    }, [type])

    // MODULE FOOTER: LOAD AREAS WHEN DIVISION CHANGES
    const handleFooterDivisionChange = async event => {
    const divisionId = event.target.value

    setFooterDivisionId(divisionId)
    setFooterAreaId('')
    setFooterModuleName('')
    setFooterAreas([])

    if (!divisionId) return

    try {
        setLoadingFooterAreas(true)
        setError('')

        const response = await getProcessNoteAreas(divisionId)

        setFooterAreas(Array.isArray(response) ? response : [])
    } catch (err) {
        setError(err.message || 'Unable to load areas.')
    } finally {
        setLoadingFooterAreas(false)
    }
}

    const titles = {
        division: 'Add/Modify',
        area: 'Add/Modify',
        module: 'Add/Modify - Module'
    }

    const renderLoadingRow = columnCount => (
        <tr>
            <td colSpan={columnCount} className="tm-master-empty">
                <i className="fa fa-spinner fa-spin"></i>
                {' '}Loading...
            </td>
        </tr>
    )

    const renderEmptyRow = columnCount => (
        <tr>
            <td colSpan={columnCount}>
                <b className="tm-master-empty-message">
                    There no data found
                </b>
            </td>
        </tr>
    )

    // =========================================
    // DIVISION MASTER - ORIGINAL 2 COLUMNS
    // =========================================
    const renderDivisionModal = () => (
        <div className="tm-master-table-wrapper">
            <table className="tm-master-grid">
                <thead>
                    <tr>
                        <th>Company/Division</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {loading
                        ? renderLoadingRow(2)
                        : rows.length === 0
                            ? renderEmptyRow(2)
                            : rows.map((item, index) => (
                                <tr key={`${item.id}-${index}`}>
                                    <td>{item.name}</td>
                                    <td className="tm-master-action-cell">
                                        <button
                                            type="button"
                                            className="tm-master-edit-button"
                                            disabled
                                            title="Update API is not available yet"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                    }

                    {/* ORIGINAL WEBFORMS FOOTER ROW */}
                    <tr className="tm-master-footer-row">
                        <td>
                            <input
                                type="text"
                                placeholder="Enter Company/Division"
                                aria-label="Company/Division"
                            />
                        </td>

                        <td className="tm-master-action-cell">
                            <button
                                type="button"
                                className="tm-master-footer-add"
                                disabled
                                title="Add API is not available yet"
                            >
                                <i className="fa fa-plus"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )

    // =========================================
    // AREA MASTER - ORIGINAL 4 COLUMNS
    // =========================================
    
    const renderAreaModal = () => (
        <div className="tm-master-table-wrapper">
            <table className="tm-master-grid tm-master-area-grid">
                <colgroup>
                    <col style={{ width: '40%' }} />
                    <col style={{ width: '40%' }} />
                    <col style={{ width: '20%' }} />
                </colgroup>

                <thead>
                    <tr>
                        <th>Division/Company</th>
                        <th>Module</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        renderLoadingRow(3)
                    ) : rows.length === 0 ? (
                        renderEmptyRow(3)
                    ) : (
                        rows.map((item, index) => (
                            <tr key={`${item.id}-${index}`}>
                                <td>{item.divisionName}</td>
                                <td>{item.name}</td>
                                <td className="tm-master-action-cell">
                                    <button
                                        type="button"
                                        className="tm-master-edit-button"
                                        disabled
                                        title="Update API is not available yet"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}

                    {/* ADD AREA FOOTER ROW */}
                    <tr className="tm-master-footer-row">
                        <td>
                            <select
                                value={footerDivisionId}
                                onChange={event =>
                                    setFooterDivisionId(event.target.value)
                                }
                                aria-label="Division/Company"
                            >
                                <option value="">
                                    Select Division/Company
                                </option>

                                {divisions.map(item => (
                                    <option
                                        key={getItemId(item)}
                                        value={getItemId(item)}
                                    >
                                        {getItemText(item)}
                                    </option>
                                ))}
                            </select>
                        </td>

                        <td>
                            <input
                                type="text"
                                placeholder="Enter Area"
                                aria-label="Area"
                            />
                        </td>

                        <td className="tm-master-action-cell">
                            <button
                                type="button"
                                className="tm-master-footer-add"
                                disabled
                                title="Add API is not available yet"
                            >
                                <i className="fa fa-plus"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
    // =========================================
    // MODULE MASTER - ORIGINAL 4 COLUMNS
    // =========================================
    // =========================================


        const renderModuleModal = () => (
            <div className="tm-master-table-wrapper">
                <table className="tm-master-grid tm-master-module-grid">

                    <colgroup>
                        <col style={{ width: '27%' }} />
                        <col style={{ width: '27%' }} />
                        <col style={{ width: '27%' }} />
                        <col style={{ width: '19%' }} />
                    </colgroup>

                    <thead>
                        <tr>
                            {/* One Module heading spanning three positions */}
                            <th colSpan={3}>Module</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            renderLoadingRow(4)
                        ) : rows.length === 0 ? (
                            renderEmptyRow(4)
                        ) : (
                            rows.map((item, index) => (
                                <tr key={`${item.id}-${index}`}>

                                    {/* One loaded Module column */}
                                    <td colSpan={3} className="tm-master-module-name">
                                        {item.name}
                                    </td>

                                    <td className="tm-master-action-cell">
                                        <button
                                            type="button"
                                            className="tm-master-edit-button"
                                            disabled
                                            title="Update API is not available yet"
                                        >
                                            Edit
                                        </button>
                                    </td>

                                </tr>
                            ))
                        )}

                        {/* ORIGINAL WEBFORMS ADD / FOOTER ROW */}
                        <tr className="tm-master-footer-row">

                            {/* FIELD 1: COMPANY / DIVISION */}
                            <td>
                                <select
                                    value={footerDivisionId}
                                    onChange={handleFooterDivisionChange}
                                    aria-label="Division/Company"
                                >
                                    <option value="">
                                        Select Division/Company
                                    </option>

                                    {divisions.map(item => (
                                        <option
                                            key={getItemId(item)}
                                            value={getItemId(item)}
                                        >
                                            {getItemText(item)}
                                        </option>
                                    ))}
                                </select>
                            </td>

                            {/* FIELD 2: AREA */}
                            <td>
                                <select
                                    value={footerAreaId}
                                    onChange={event =>
                                        setFooterAreaId(event.target.value)
                                    }
                                    disabled={!footerDivisionId || loadingFooterAreas}
                                    aria-label="Area"
                                >
                                    <option value="">
                                        {loadingFooterAreas
                                            ? 'Loading areas...'
                                            : 'Select Area'}
                                    </option>

                                    {footerAreas.map(item => (
                                        <option
                                            key={getItemId(item)}
                                            value={getItemId(item)}
                                        >
                                            {getItemText(item)}
                                        </option>
                                    ))}
                                </select>
                            </td>

                            {/* FIELD 3: MODULE NAME */}
                            <td>
                                <input
                                    type="text"
                                    value={footerModuleName}
                                    onChange={event =>
                                        setFooterModuleName(event.target.value)
                                    }
                                    placeholder="Enter Module"
                                    aria-label="Module"
                                />
                            </td>

                            {/* ACTION: PLUS */}
                            <td className="tm-master-action-cell">
                                <button
                                    type="button"
                                    className="tm-master-footer-add"
                                    disabled
                                    title="Add API is not available yet"
                                >
                                    <i className="fa fa-plus"></i>
                                </button>
                            </td>

                        </tr>
                    </tbody>
                </table>
            </div>
        )

    return (
        <div className="tm-master-modal-overlay">
            <div
                className="tm-master-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tm-master-modal-title"
            >
                {/* MODAL HEADER */}
                <div className="tm-master-modal-header">
                    <h3 id="tm-master-modal-title">
                        <i className="fa fa-edit"></i>
                        {' '}{titles[type]}
                    </h3>

                    <button
                        type="button"
                        className="tm-master-close"
                        onClick={onClose}
                        aria-label="Close modal"
                        title="Close"
                    >
                        &times;
                    </button>
                </div>

                {/* MODAL BODY */}
                <div className="tm-master-modal-body">

                    {error && (
                        <div className="tm-error">
                            <i className="fa fa-exclamation-circle"></i>
                            {' '}{error}
                        </div>
                    )}

                    {type === 'division' && renderDivisionModal()}
                    {type === 'area' && renderAreaModal()}
                    {type === 'module' && renderModuleModal()}

                </div>
            </div>
        </div>
    )
}


export default TrainingManualAdd
