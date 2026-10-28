import { useEffect, useState, useRef } from 'react'
import './BomExplodedView.css'

import {
    searchBomExploded,
    getProductModels,
    uploadBomExploded,
    downloadBomExploded,
    deleteBomExploded
} from '../../api/bomExplodedApi'

import { getProducts } from '../../api/reportsApi'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'


function BomExplodedView() {

    // =========================================
    // SESSION VALUES
    // =========================================

    const roleId =
        sessionStorage.getItem('roleId') ||
        sessionStorage.getItem('roleID') ||
        ''


    // Upload/Delete visible only for role id 22
const canUploadDelete = roleId === '22'


    // =========================================
    // DROPDOWN STATE
    // =========================================

    const [products, setProducts] = useState([])
    const [models, setModels] = useState([])
    const [selectedProduct, setSelectedProduct] = useState('')
    const [selectedModel, setSelectedModel] = useState('')

    const [productLoading, setProductLoading] = useState(false)
    const [modelLoading, setModelLoading] = useState(false)


    // =========================================
    // FILE UPLOAD STATE
    // =========================================

    const fileInputRef = useRef(null)
    const [uploading, setUploading] = useState(false)
    const [fileName, setFileName] = useState('')


    // =========================================
    // GRID STATE
    // =========================================

    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')


    // =========================================
    // LOAD PRODUCTS ON MOUNT
    // =========================================

    useEffect(() => {

        loadProducts()
        loadRecords()

    }, [])


    async function loadProducts() {

        setProductLoading(true)

        try {

            const result = await getProducts()

            setProducts(
                Array.isArray(result)
                    ? result
                    : (result?.data || [])
            )

        }
        catch (err) {
            console.error('Failed to load products:', err)
        }
        finally {
            setProductLoading(false)
        }

    }


    // =========================================
    // LOAD MODELS WHEN PRODUCT CHANGES
    // =========================================

    async function handleProductChange(e) {

        const productCode = e.target.value
        setSelectedProduct(productCode)
        setSelectedModel('')
        setModels([])


        if (!productCode) return


        setModelLoading(true)

        try {

            const result =
                await getProductModels(productCode)

            setModels(
                result?.data || []
            )

        }
        catch (err) {
            console.error('Failed to load models:', err)
        }
        finally {
            setModelLoading(false)
        }

    }


    // =========================================
    // LOAD ALL RECORDS
    // =========================================

    async function loadRecords() {

        setLoading(true)
        setError('')
        setSearching(false)

        try {

            const result =
                await searchBomExploded(0, '', '')

            setRecords(
                result?.data || []
            )

        }
        catch (err) {

            setError(
                err.message ||
                'Failed to load records.'
            )

        }
        finally {
            setLoading(false)
        }

    }


    // =========================================
    // SEARCH BY PRODUCT + MODEL
    // =========================================

    async function handleSearch() {

        if (!selectedProduct && !selectedModel) {
            alert('Please select a Product or Model to search.')
            return
        }

        setLoading(true)
        setError('')
        setSuccessMsg('')
        setSearching(true)

        try {

            // API accepts modelCode — pass selectedModel
            const result =
                await searchBomExploded(
                    0,
                    selectedModel || '',
                    ''
                )

            let filtered = result?.data || []

            // Client-side filter by product if selected
            // (API does not have a product code param)
            if (selectedProduct && filtered.length > 0) {

                const pCode = selectedProduct.toLowerCase()

                filtered = filtered.filter((row) => {

                    const rowProduct = (
                        row.product ||
                        row.Product ||
                        ''
                    ).toLowerCase()

                    return rowProduct.includes(pCode)

                })
            }

            setRecords(filtered)

        }
        catch (err) {

            setError(
                err.message ||
                'Search failed.'
            )

        }
        finally {
            setLoading(false)
        }

    }


    // =========================================
    // SHOW ALL (RESET SEARCH)
    // =========================================

    async function handleShowAll() {

        setSelectedProduct('')
        setSelectedModel('')
        setModels([])
        await loadRecords()

    }


    // =========================================
    // UPLOAD FILE
    // =========================================

    async function handleUpload() {

        // Client-side validation
        if (!selectedProduct) {
            alert('No product selected.')
            return
        }

        if (!selectedModel) {
            alert('No model selected.')
            return
        }

        const file = fileInputRef.current?.files?.[0]

        if (!file) {
            alert('No files selected.')
            return
        }


        setUploading(true)
        setError('')
        setSuccessMsg('')

        try {

            const result =
                await uploadBomExploded(
                    selectedProduct,
                    selectedModel,
                    file
                )

            setSuccessMsg(
                result?.message ||
                'Uploaded successfully.'
            )

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            setFileName('')

            // Reload grid
            await loadRecords()

        }
        catch (err) {

            setError(
                err.message ||
                'Upload failed.'
            )

        }
        finally {
            setUploading(false)
        }

    }


    // =========================================
    // DOWNLOAD FILE
    // =========================================

    async function handleDownload(id) {

        try {
            await downloadBomExploded(id)
        }
        catch (err) {

            setError(
                err.message ||
                'Download failed.'
            )

        }

    }


    // =========================================
    // DELETE RECORD
    // =========================================

    async function handleDelete(id) {

        if (!window.confirm('Are you sure you want to delete this record?')) {
            return
        }

        setError('')
        setSuccessMsg('')

        try {

            const result =
                await deleteBomExploded(id)

            setSuccessMsg(
                result?.message ||
                'Deleted successfully.'
            )

            // Reload grid
            await loadRecords()

        }
        catch (err) {

            setError(
                err.message ||
                'Delete failed.'
            )

        }

    }


    // =========================================
    // GET FILE TYPE ICON CLASS
    // =========================================

    function getFileTypeIcon(contentType) {

        if (!contentType) return 'fa fa-file-o'

        const ct = contentType.toLowerCase()

        if (ct.includes('pdf'))
            return 'fa fa-file-pdf-o'

        if (ct.includes('jpg') || ct.includes('jpeg') || ct.includes('png') || ct.includes('image'))
            return 'fa fa-picture-o'

        if (ct.includes('excel') || ct.includes('spreadsheet'))
            return 'fa fa-file-excel-o'

        if (ct.includes('word') || ct.includes('document'))
            return 'fa fa-file-word-o'

        return 'fa fa-file-o'

    }


    // =========================================
    // FORMAT DATE
    // =========================================

    function formatDate(dateStr) {

        if (!dateStr) return ''

        try {

            const date = new Date(dateStr)

            return date.toLocaleDateString(
                'en-GB',
                {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }
            )

        }
        catch {
            return dateStr
        }

    }


    // =========================================
    // RENDER
    // =========================================

    return (
        <DashboardLayout title="Exploded View">
            <div className="bom-container">


                {/* ===== TOOLBAR ===== */}

                <div className="bom-toolbar">

                    <div className="bom-toolbar-row">

                        {/* Product Dropdown */}
                        <div className="bom-field">
                            <label className="bom-label">
                                Select Product
                            </label>
                            <select
                                className="bom-select"
                                value={selectedProduct}
                                onChange={handleProductChange}
                                disabled={productLoading}
                            >
                                <option value="">
                                    {productLoading
                                        ? 'Loading...'
                                        : '-- Select --'}
                                </option>

                                {products.map((p) => (
                                    <option
                                        key={p.productCode}
                                        value={p.productCode}
                                    >
                                        {p.productName}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* Model Dropdown */}
                        <div className="bom-field bom-field-wide">
                            <label className="bom-label">
                                Select Model
                            </label>
                            <select
                                className="bom-select"
                                value={selectedModel}
                                onChange={(e) =>
                                    setSelectedModel(e.target.value)
                                }
                                disabled={modelLoading || !selectedProduct}
                            >
                                <option value="">
                                    {modelLoading
                                        ? 'Loading...'
                                        : '-- Select --'}
                                </option>

                                {models.map((m) => (
                                    <option
                                        key={m.modelCode}
                                        value={m.modelCode}
                                    >
                                        {m.modelName}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* Search Button */}
                        <div className="bom-field bom-field-btn">
                            <button
                                className="bom-btn bom-btn-search"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                <i className="fa fa-search"></i>
                                Search
                            </button>
                        </div>


                        {/* Show All Button */}
                        {searching && (
                            <div className="bom-field bom-field-btn">
                                <button
                                    className="bom-btn bom-btn-reset"
                                    onClick={handleShowAll}
                                    disabled={loading}
                                >
                                    <i className="fa fa-refresh"></i>
                                    Show All
                                </button>
                            </div>
                        )}


                        {/* File Upload — custom picker (only the button opens the dialog) */}
                        {canUploadDelete && (
                            <>
                                <div className="bom-field bom-field-btn">
                                    <div className="bom-file-picker">
                                        {/* Hidden native input */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={(e) =>
                                                setFileName(
                                                    e.target.files?.[0]?.name || ''
                                                )
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="bom-btn bom-btn-choose"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <i className="fa fa-folder-open"></i>
                                            Choose File
                                        </button>

                                        <span className="bom-file-name">
                                            {fileName || 'No file chosen'}
                                        </span>
                                    </div>
                                </div>

                                <div className="bom-field bom-field-btn">
                                    <button
                                        className="bom-btn bom-btn-upload"
                                        onClick={handleUpload}
                                        disabled={uploading}
                                    >
                                        <i className="fa fa-upload"></i>
                                        {uploading
                                            ? 'Uploading...'
                                            : 'Upload'}
                                    </button>
                                </div>
                            </>
                        )}

                    </div>

                </div>


                {/* ===== MESSAGES ===== */}

                {error && (
                    <div className="bom-msg bom-msg-error">
                        <i className="fa fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="bom-msg bom-msg-success">
                        <i className="fa fa-check-circle"></i>
                        {successMsg}
                    </div>
                )}


                {/* ===== RECORD COUNT ===== */}

                {!loading && records.length > 0 && (
                    <div className="bom-record-count">
                        Showing <strong>{records.length}</strong>
                        {records.length === 1
                            ? ' record'
                            : ' records'}
                        {searching && ' (filtered)'}
                    </div>
                )}


                {/* ===== DATA TABLE ===== */}

                <div className="bom-table-wrapper">
                    <div className="bom-table-scroll">

                        {loading ? (

                            <div className="bom-loading">
                                <i className="fa fa-spinner fa-spin"></i>
                                Loading records...
                            </div>

                        ) : records.length === 0 ? (

                            <div className="bom-no-data">
                                <span className="label label-danger">
                                    {searching
                                        ? 'No matching records found.'
                                        : 'There no data found.'}
                                </span>
                            </div>

                        ) : (

                            <table className="bom-table">

                                <thead>
                                    <tr>
                                        <th>Sr No</th>
                                        <th>#Product</th>
                                        <th>#FG Code</th>
                                        <th>#Model</th>
                                        <th>Drawing Name/No</th>
                                        <th>File Type</th>
                                        <th>Key Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {records.map((row, index) => (

                                        <tr key={row.id || index}>

                                            <td>{index + 1}</td>

                                            <td>{row.product || row.Product || ''}</td>

                                            <td>{row.fgCode || row.FgCode || row.fG_Code || ''}</td>

                                            <td>{row.modelName || row.ModelName || ''}</td>

                                            <td>{row.name || row.Name || ''}</td>

                                            <td>
                                                <i
                                                    className={getFileTypeIcon(
                                                        row.contentType || row.ContentType || ''
                                                    )}
                                                    title={row.contentType || row.ContentType || ''}
                                                ></i>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    row.createdDate || row.CreatedDate || ''
                                                )}
                                            </td>

                                            <td className="bom-actions">

                                                <button
                                                    className="bom-action-btn bom-action-view"
                                                    title="View / Download"
                                                    onClick={() =>
                                                        handleDownload(
                                                            row.id || row.Id
                                                        )
                                                    }
                                                >
                                                    <i className="fa fa-eye"></i>
                                                </button>

                                                {canUploadDelete && (
                                                    <button
                                                        className="bom-action-btn bom-action-delete"
                                                        title="Delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                row.id || row.Id
                                                            )
                                                        }
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                )}

                                            </td>

                                        </tr>

                                    ))}
                                </tbody>

                            </table>

                        )}

                    </div>
                </div>


            </div>
        </DashboardLayout>
    )

}


export default BomExplodedView