import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import {
    getProcessNotes,
    getCompanyDivisions,
    getProcessNoteAreas,
    getProcessNoteModules,
    // getProcessNoteFolders,
    // getProcessNoteSubfolders,
    searchProcessNotes,
    downloadProcessNote
} from '../../api/processNoteApi'
import './TrainingManual.css'

const EMPTY_FILTERS = {
    compDiviId: '0',
    areaId: '0',
    moduleId: '0',
    folderId: '0',
    subfolderId: '0',
    processFor: ''
}

function getRows(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.result)) return data.result
    if (Array.isArray(data?.results)) return data.results
    return []
}

function getField(row, ...names) {
    for (const name of names) {
        const key = Object.keys(row || {}).find(
            item => item.toLowerCase() === name.toLowerCase()
        )

        if (key && row[key] !== null && row[key] !== undefined) {
            return row[key]
        }
    }

    return ''
}

function getId(item) {
    return String(
        getField(
            item,
            'id',
            'value',
            'compDiviId',
            'areaId',
            'moduleId',
            'folderId',
            'subfolderId',
            'dirId',
            'subDirId',
            'configId'
        ) ?? ''
    )
}

function getLabel(item) {
    return String(
        getField(
            item,
            'configName',
            'area',
            'areaName',
            'module',
            'moduleName',
            'dirName',
            'folderName',
            'subfolderName',
            'subDirName',
            'name',
            'label',
            'text'
        ) ?? ''
    )
}

function getFileIcon(extension) {
    const ext = String(extension || '').toLowerCase()

    if (ext.includes('pdf')) {
        return {
            icon: 'fa-file-pdf-o',
            className: 'tm-file-pdf',
            label: 'PDF'
        }
    }

    if (['.doc', '.docx'].some(value => ext.includes(value))) {
        return {
            icon: 'fa-file-word-o',
            className: 'tm-file-word',
            label: 'Word'
        }
    }

    if (['.xls', '.xlsx', '.csv'].some(value => ext.includes(value))) {
        return {
            icon: 'fa-file-excel-o',
            className: 'tm-file-excel',
            label: 'Excel'
        }
    }

    if (['.jpg', '.jpeg', '.png', '.gif'].some(value => ext.includes(value))) {
        return {
            icon: 'fa-file-image-o',
            className: 'tm-file-image',
            label: 'Image'
        }
    }

    return {
        icon: 'fa-file-o',
        className: 'tm-file-default',
        label: 'File'
    }
}

function getDownloadFilename(row) {
    const filename = getField(row, 'fileName', 'name')

    if (filename) return String(filename)

    const extension = getField(row, 'ext', 'extension')

    return `training-manual${extension ? String(extension) : ''}`
}

function TrainingManual() {
    const [filters, setFilters] = useState({ ...EMPTY_FILTERS })

    const [companyDivisions, setCompanyDivisions] = useState([])
    const [areas, setAreas] = useState([])
    const [modules, setModules] = useState([])
    const [folders, setFolders] = useState([])
    const [subfolders, setSubfolders] = useState([])
    const [manuals, setManuals] = useState([])

    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [downloadingId, setDownloadingId] = useState(null)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')

    const updateFilter = (field, value) => {
        setFilters(previous => ({
            ...previous,
            [field]: value
        }))
    }

    const loadInitialData = useCallback(async () => {
        setLoading(true)
        setError('')
        setNotice('')

        try {
            const [divisionData, noteData] = await Promise.all([
                getCompanyDivisions(),
                getProcessNotes(6)
            ])

            setCompanyDivisions(getRows(divisionData))
            setManuals(getRows(noteData))
        } catch (err) {
            setError(err.message || 'Unable to load training manuals.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadInitialData()
    }, [loadInitialData])

    const handleCompanyChange = async value => {
        setFilters(previous => ({
            ...previous,
            compDiviId: value,
            areaId: '0',
            moduleId: '0',
            folderId: '0',
            subfolderId: '0'
        }))

        setAreas([])
        setModules([])
        setFolders([])
        setSubfolders([])
        setError('')
        setNotice('')

        if (value === '0') return

        try {
            const data = await getProcessNoteAreas(value)
            setAreas(getRows(data))
        } catch (err) {
            setError(err.message || 'Unable to load areas.')
        }
    }

    const handleAreaChange = async value => {
        setFilters(previous => ({
            ...previous,
            areaId: value,
            moduleId: '0',
            folderId: '0',
            subfolderId: '0'
        }))

        setModules([])
        setFolders([])
        setSubfolders([])
        setError('')
        setNotice('')

        if (value === '0') return

        try {
            const data = await getProcessNoteModules(value)
            setModules(getRows(data))
        } catch (err) {
            setError(err.message || 'Unable to load modules.')
        }
    }

    const handleModuleChange = value => {
        setFilters(previous => ({
            ...previous,
            moduleId: value,
            folderId: '0',
            subfolderId: '0'
        }))

        // Folder and Subfolder menus are not required for now.
        // setFolders([])
        // setSubfolders([])

        setError('')
        setNotice('')

        // Do not call getProcessNoteFolders(value) here.
    }

    // const handleFolderChange = async value => {
    //     setFilters(previous => ({
    //         ...previous,
    //         folderId: value,
    //         subfolderId: '0'
    //     }))
    //
    //     setSubfolders([])
    //     setError('')
    //     setNotice('')
    //
    //     if (value === '0') return
    //
    //     try {
    //         const data = await getProcessNoteSubfolders(value)
    //         setSubfolders(getRows(data))
    //     } catch (err) {
    //         setError(err.message || 'Unable to load subfolders.')
    //     }
    // }

    const handleSearch = async event => {
        event.preventDefault()

        setSearching(true)
        setError('')
        setNotice('')

        try {
            const request = {
                companyId: filters.compDiviId,
                areaId: filters.areaId,
                moduleId: filters.moduleId,
                textSearch: filters.processFor.trim()
            }

            const data = await searchProcessNotes(request)

            setManuals(getRows(data))
            setNotice('Search completed.')

            setTimeout(() => {
                setNotice('')
            }, 2000)
        } catch (err) {
            setError(err.message || 'Unable to search training manuals.')
        } finally {
            setSearching(false)
        }
    }

    const handleReset = async () => {
        setFilters({ ...EMPTY_FILTERS })
        setAreas([])
        setModules([])
        setFolders([])
        setSubfolders([])
        setError('')
        setNotice('')

        await loadInitialData()
    }

    const handleDownload = async row => {
        const id = getField(row, 'id', 'processNoteId')

        if (id === '') {
            setError('The file ID is missing from the API response.')
            return
        }

        setDownloadingId(String(id))
        setError('')
        setNotice('')

        try {
            const blob = await downloadProcessNote(id)
            const objectUrl = window.URL.createObjectURL(blob)
            const anchor = document.createElement('a')

            anchor.href = objectUrl
            anchor.download = getDownloadFilename(row)

            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()

            window.URL.revokeObjectURL(objectUrl)
            setNotice('Download started.')
        } catch (err) {
            setError(err.message || 'Unable to download the file.')
        } finally {
            setDownloadingId(null)
        }
    }

    return (
        <DashboardLayout title="Training Manual">
            <div className="training-manual-page">
                <form className="tm-box" onSubmit={handleSearch}>
                    {/* <div className="tm-section-heading">
                        <h2>
                            <i className="fa fa-bell" aria-hidden="true" />
                            {' '}Notification &amp; Training Manual Process Note
                        </h2>
                    </div> */}

                    <div className="tm-filter-grid">
                        {/* Company / Division */}
                        <div className="tm-field">
                            <label htmlFor="tm-company">
                                Company / Division
                                <span className="tm-required">*</span>
                            </label>

                            <select
                                id="tm-company"
                                value={filters.compDiviId}
                                onChange={event =>
                                    handleCompanyChange(event.target.value)
                                }
                            >
                                <option value="0">
                                    Select Company / Division
                                </option>

                                {companyDivisions.map((item, index) => (
                                    <option
                                        key={`${getId(item)}-${index}`}
                                        value={getId(item)}
                                    >
                                        {getLabel(item)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Area */}
                        <div className="tm-field">
                            <label htmlFor="tm-area">
                                Area
                                <span className="tm-required">*</span>
                            </label>

                            <select
                                id="tm-area"
                                value={filters.areaId}
                                disabled={filters.compDiviId === '0'}
                                onChange={event =>
                                    handleAreaChange(event.target.value)
                                }
                            >
                                <option value="0">Select Area</option>

                                {areas.map((item, index) => (
                                    <option
                                        key={`${getId(item)}-${index}`}
                                        value={getId(item)}
                                    >
                                        {getLabel(item)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Module */}
                        <div className="tm-field">
                            <label htmlFor="tm-module">Module</label>

                            <select
                                id="tm-module"
                                value={filters.moduleId}
                                disabled={filters.areaId === '0'}
                                onChange={event =>
                                    handleModuleChange(event.target.value)
                                }
                            >
                                <option value="0">Select Module</option>

                                {modules.map((item, index) => (
                                    <option
                                        key={`${getId(item)}-${index}`}
                                        value={getId(item)}
                                    >
                                        {getLabel(item)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Folder - currently not required */}
                        {/* <div className="tm-field">
                            <label htmlFor="tm-folder">
                                Folder
                                <span className="tm-required">*</span>
                            </label>

                            <select
                                id="tm-folder"
                                value={filters.folderId}
                                disabled={filters.moduleId === '0'}
                                onChange={event =>
                                    handleFolderChange(event.target.value)
                                }
                            >
                                <option value="0">Select Folder</option>

                                {folders.map((item, index) => (
                                    <option
                                        key={`${getId(item)}-${index}`}
                                        value={getId(item)}
                                    >
                                        {getLabel(item)}
                                    </option>
                                ))}
                            </select>
                        </div> */}

                        {/* Subfolder - currently not required */}
                        {/* <div className="tm-field">
                            <label htmlFor="tm-subfolder">
                                Subfolder
                                <span className="tm-required">*</span>
                            </label>

                            <select
                                id="tm-subfolder"
                                value={filters.subfolderId}
                                disabled={filters.folderId === '0'}
                                onChange={event =>
                                    updateFilter('subfolderId', event.target.value)
                                }
                            >
                                <option value="0">Select Subfolder</option>

                                {subfolders.map((item, index) => (
                                    <option
                                        key={`${getId(item)}-${index}`}
                                        value={getId(item)}
                                    >
                                        {getLabel(item)}
                                    </option>
                                ))}
                            </select>
                        </div> */}

                        {/* Process Note + Search + Reset */}
                        <div className="tm-field tm-process-search-group">
                            <div className="tm-process-input">
                                <label htmlFor="tm-process-for">
                                    Process Note
                                </label>

                                <input
                                    id="tm-process-for"
                                    type="text"
                                    maxLength={250}
                                    placeholder="Search by process note"
                                    value={filters.processFor}
                                    onChange={event =>
                                        updateFilter(
                                            'processFor',
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="tm-inline-buttons">
                                <button
                                    type="button"
                                    className="tm-clear-button"
                                    onClick={handleReset}
                                    disabled={loading || searching}
                                >
                                    <i
                                        className="fa fa-refresh"
                                        aria-hidden="true"
                                    />
                                    {' '}Reset
                                </button>

                                <button
                                    type="submit"
                                    className="tm-search-button"
                                    disabled={loading || searching}
                                >
                                    <i
                                        className="fa fa-search"
                                        aria-hidden="true"
                                    />
                                    {' '}
                                    {searching ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Error message */}
                {error && (
                    <div className="tm-error" role="alert">
                        <i
                            className="fa fa-exclamation-circle"
                            aria-hidden="true"
                        />
                        {' '}{error}
                    </div>
                )}

                {/* Success message */}
                {notice && !error && (
                    <div className="tm-notice" role="status">
                        <i
                            className="fa fa-check-circle"
                            aria-hidden="true"
                        />
                        {' '}{notice}
                    </div>
                )}

                {/* Training Manual List */}
                <section className="tm-box tm-results-box">
                    <div className="tm-results-heading">
                        <h2>Training Manual List</h2>

                        <span className="tm-result-count">
                            {manuals.length}{' '}
                            {manuals.length === 1 ? 'record' : 'records'}
                        </span>
                    </div>

                    <div className="tm-table-wrapper">
                        <table className="tm-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Company / Division</th>
                                    <th>Area</th>
                                    <th>Module</th>
                                    <th>Process Note</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="tm-table-message"
                                        >
                                            <div className="tm-loading">
                                                <div className="tm-loading-dots">
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>

                                                <span>
                                                    Loading training manuals...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : manuals.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="tm-table-message"
                                        >
                                            <i
                                                className="fa fa-folder-open-o"
                                                aria-hidden="true"
                                            />
                                            {' '}No Records Found
                                        </td>
                                    </tr>
                                ) : (
                                    manuals.map((row, index) => {
                                        const id = getField(
                                            row,
                                            'id',
                                            'processNoteId'
                                        )

                                        const extension = getField(
                                            row,
                                            'ext',
                                            'extension'
                                        )

                                        const file = getFileIcon(extension)

                                        const activeValue = getField(
                                            row,
                                            'isActive',
                                            'status'
                                        )

                                        const isActive =
                                            activeValue === true ||
                                            ['true', 'active', '1'].includes(
                                                String(activeValue).toLowerCase()
                                            )

                                        return (
                                            <tr key={id || index}>
                                                <td>{index + 1}</td>

                                                <td>
                                                    {getField(
                                                        row,
                                                        'compDivi',
                                                        'companyDivision'
                                                    )}
                                                </td>

                                                <td>
                                                    {getField(
                                                        row,
                                                        'module',
                                                        'area'
                                                    )}
                                                </td>

                                                <td>
                                                    {getField(
                                                        row,
                                                        'manualModule'
                                                    )}
                                                </td>

                                                <td className="tm-process-note">
                                                    {getField(row, 'processFor')}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`tm-file-type ${file.className}`}
                                                        title={file.label}
                                                    >
                                                        <i
                                                            className={`fa ${file.icon}`}
                                                            aria-hidden="true"
                                                        />
                                                        {' '}{file.label}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`tm-status ${
                                                            isActive
                                                                ? 'tm-status-active'
                                                                : 'tm-status-inactive'
                                                        }`}
                                                    >
                                                        {isActive
                                                            ? 'Active'
                                                            : 'InActive'}
                                                    </span>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="tm-download-button"
                                                        title="Download file"
                                                        disabled={
                                                            String(downloadingId) ===
                                                            String(id)
                                                        }
                                                        onClick={() =>
                                                            handleDownload(row)
                                                        }
                                                    >
                                                        <i
                                                            className={`fa ${
                                                                String(downloadingId) ===
                                                                String(id)
                                                                    ? 'fa-spinner fa-spin'
                                                                    : 'fa-download'
                                                            }`}
                                                            aria-hidden="true"
                                                        />

                                                        {' '}

                                                        {String(downloadingId) ===
                                                        String(id)
                                                            ? 'Downloading'
                                                            : 'Download'}
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    )
}

export default TrainingManual