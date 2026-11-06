import {
    useEffect,
    useState
} from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getSupersessionMaterials,
    previewSupersession,
    saveSupersessionMaterials
} from '../../api/supersessionApi'

import './Supersession.css'

// =====================================================
// SUPERSESSION PAGE
// =====================================================

function Supersession() {

    // =====================================================
    // STATE
    // =====================================================

    const [file, setFile] = useState(null)

    const [previewRows, setPreviewRows] =
        useState([])

    const [materials, setMaterials] =
        useState([])

    const [loading, setLoading] =
        useState(false)

    const [uploading, setUploading] =
        useState(false)

    const [saving, setSaving] =
        useState(false)

    const [message, setMessage] =
        useState('')

    const [messageType, setMessageType] =
        useState('')

    // =====================================================
    // LOAD EXISTING DATA
    // =====================================================

    useEffect(() => {
        loadMaterials()
    }, [])

    // =====================================================
    // GET EXISTING MATERIALS
    // =====================================================

    async function loadMaterials() {

        try {

            setLoading(true)

            setMessage('')
            setMessageType('')

            const data =
                await getSupersessionMaterials()

            setMaterials(data)

        } catch (error) {

            setMessage(
                error.message ||
                'Unable to load supersession data.'
            )

            setMessageType('error')

        } finally {

            setLoading(false)
        }
    }

    // =====================================================
    // FILE CHANGE
    // =====================================================

    function handleFileChange(event) {

        const selectedFile =
            event.target.files?.[0]

        setFile(selectedFile || null)

        setPreviewRows([])

        setMessage('')
        setMessageType('')
    }

    // =====================================================
    // UPLOAD & PREVIEW
    // =====================================================

    async function handlePreview() {

        if (!file) {

            setMessage(
                'Please select a file to upload.'
            )

            setMessageType('error')

            return
        }

        const extension =
            file.name
                .split('.')
                .pop()
                ?.toLowerCase()

        if (
            extension !== 'xls' &&
            extension !== 'xlsx'
        ) {

            setMessage(
                'Only .xls or .xlsx files are allowed.'
            )

            setMessageType('error')

            return
        }

        try {

            setUploading(true)

            setMessage('')
            setMessageType('')

            const result =
                await previewSupersession(file)

            setPreviewRows(
                Array.isArray(result.rows)
                    ? result.rows
                    : []
            )

            setMessage(
                result.message ||
                'Excel file loaded successfully.'
            )

            setMessageType('success')

        } catch (error) {

            setPreviewRows([])

            setMessage(
                error.message ||
                'Unable to preview the Excel file.'
            )

            setMessageType('error')

        } finally {

            setUploading(false)
        }
    }

    // =====================================================
    // SAVE DATA
    // =====================================================

    async function handleSave() {

        if (
            !Array.isArray(previewRows) ||
            previewRows.length === 0
        ) {

            setMessage(
                'No data available to insert.'
            )

            setMessageType('error')

            return
        }

        try {

            setSaving(true)

            setMessage('')
            setMessageType('')

            const result =
                await saveSupersessionMaterials(
                    previewRows
                )

            setMessage(
                result.message ||
                'Data inserted successfully!'
            )

            setMessageType('success')

            // -------------------------------------------------
            // Reload data from database
            // -------------------------------------------------

            await loadMaterials()

            // -------------------------------------------------
            // Clear preview
            // -------------------------------------------------

            setPreviewRows([])

            setFile(null)

            const fileInput =
                document.getElementById(
                    'supersessionExcel'
                )

            if (fileInput) {
                fileInput.value = ''
            }

        } catch (error) {

            setMessage(
                error.message ||
                'Unable to insert supersession data.'
            )

            setMessageType('error')

        } finally {

            setSaving(false)
        }
    }

    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(value) {

        if (!value) {
            return ''
        }

        const date =
            new Date(value)

        if (Number.isNaN(date.getTime())) {
            return value
        }

        const day =
            String(date.getDate())
                .padStart(2, '0')

        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ]

        const month =
            months[date.getMonth()]

        const year =
            date.getFullYear()

        return `${day}-${month}-${year}`
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <DashboardLayout
            title="Supersession View"
        >
            <div className="supersession-page">

            {/* =====================================================
                MESSAGE
            ===================================================== */}

            {message && (
                <div
                    className={
                        messageType === 'success'
                            ? 'supersession-message success'
                            : 'supersession-message error'
                    }
                >
                    {message}
                </div>
            )}

            {/* =====================================================
                UPLOAD SECTION
            ===================================================== */}

            <div className="supersession-card supersession-upload-card">

                <div className="supersession-card-header">
                    <h4>
                        Upload Excel File
                    </h4>
                </div>

                <div className="supersession-card-body">

                    <div className="supersession-upload-row">

                        <label
                            htmlFor="supersessionExcel"
                            className="supersession-label"
                        >
                            Select Upload File
                        </label>

                        <div className="supersession-file-wrapper">

                            <input
                                id="supersessionExcel"
                                type="file"
                                className="form-control"
                                accept=".xls,.xlsx"
                                onChange={
                                    handleFileChange
                                }
                            />

                        </div>

                        <div className="supersession-upload-button">

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={
                                    handlePreview
                                }
                                disabled={
                                    uploading
                                }
                            >
                                {uploading
                                    ? 'Uploading...'
                                    : 'Upload & Preview'}
                            </button>

                        </div>

                    </div>

                    <hr />

                    {/* =================================================
                        PREVIEW GRID
                    ================================================= */}

                    {previewRows.length > 0 && (
                        <div className="supersession-preview-section">

                            <div className="supersession-section-title">
                                Preview
                            </div>

                            <div className="supersession-table-wrapper">

                                <table className="table table-bordered table-striped table-hover supersession-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                Purchasing Doc. Type
                                            </th>

                                            <th>
                                                Purch. Organization
                                            </th>

                                            <th>
                                                Company Code
                                            </th>

                                            <th>
                                                Plant
                                            </th>

                                            <th>
                                                Valid From
                                            </th>

                                            <th>
                                                Valid To
                                            </th>

                                            <th>
                                                Primary Material
                                            </th>

                                            <th>
                                                Material
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {previewRows.map(
                                            (row, index) => (

                                                <tr
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            row.purchasingDocType ||
                                                            ''
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            row.purchOrganization ||
                                                            ''
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            row.companyCode ||
                                                            ''
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            row.plant ||
                                                            ''
                                                        }
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            row.validFrom
                                                        )}
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            row.validTo
                                                        )}
                                                    </td>

                                                    <td>
                                                        {
                                                            row.primaryMaterial ||
                                                            ''
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            row.material ||
                                                            ''
                                                        }
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>
                    )}

                    {/* =================================================
                        NO PREVIEW DATA
                    ================================================= */}

                    {!uploading &&
                        previewRows.length === 0 &&
                        file && (
                            <div className="supersession-empty-preview">
                                No data available
                            </div>
                        )}

                    {/* =================================================
                        SAVE BUTTON
                    ================================================= */}

                    <div className="supersession-save-row">

                        {/* <button
                            type="button"
                            className="btn btn-success"
                            onClick={
                                handleSave
                            }
                            disabled={
                                saving ||
                                previewRows.length === 0
                            }
                        >
                            {saving
                                ? 'Inserting...'
                                : 'Insert to Database'}
                        </button> */}

                    </div>

                </div>

            </div>

            {/* =====================================================
                DATABASE DATA
            ===================================================== */}

            <div className="supersession-card supersession-existing-card">

                <div className="supersession-card-header">

                    <h4>
                        Existing Supersession Data
                    </h4>

                </div>

                <div className="supersession-card-body">

                    {loading ? (

                        <div className="supersession-loading">
                            Loading data...
                        </div>

                    ) : materials.length === 0 ? (

                        <div className="supersession-empty-preview">
                            No data available
                        </div>

                    ) : (

                        <div className="supersession-table-wrapper">

                            <table className="table table-bordered table-striped table-hover supersession-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Purchasing Doc. Type
                                        </th>

                                        <th>
                                            Purch. Organization
                                        </th>

                                        <th>
                                            Company Code
                                        </th>

                                        <th>
                                            Plant
                                        </th>

                                        <th>
                                            Valid From
                                        </th>

                                        <th>
                                            Valid To
                                        </th>

                                        <th>
                                            Primary Material
                                        </th>

                                        <th>
                                            Material
                                        </th>

                                        <th>
                                            Created Date
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {materials.map(
                                        (row, index) => (

                                            <tr
                                                key={
                                                    row.id ??
                                                    index
                                                }
                                            >

                                                <td>
                                                    {
                                                        row.id ??
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        row.purchasingDocType ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        row.purchOrganization ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        row.companyCode ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        row.plant ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        row.validFrom
                                                    )}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        row.validTo
                                                    )}
                                                </td>

                                                <td>
                                                    {
                                                        row.primaryMaterial ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        row.material ||
                                                        ''
                                                    }
                                                </td>

                                                <td>
                                                    {formatDate(row.createdDate)}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

            </div>

        </DashboardLayout>
    )
}

export default Supersession