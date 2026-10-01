import { useEffect, useState } from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getSkillSetProducts,
    getSkillSetData,
    exportSkillSetData
} from '../../api/skillSetApi'

import './SkillSetView.css'


// =========================================
// SCORE COLUMNS CONFIG
// =========================================

const scoreColumns = [
    'WM', 'DW', 'CD', 'MW',
    'KA', 'AC', 'RF', 'IND',
    'WP', 'WD', 'Y5', 'ST'
]

const columnGroups = [
    { label: 'Minor Complaint', cols: ['WM', 'DW', 'CD', 'MW'] },
    { label: 'Major Complaint', cols: ['KA', 'AC', 'RF', 'IND'] },
    { label: 'Critical Complaint', cols: ['WP', 'WD', 'Y5', 'ST'] }
]


// =========================================
// SCORE COLOR (Branch/Trainer scale 0-5)
// =========================================

function getScoreClass(value) {

    if (value === null || value === undefined || value === '') {
        return ''
    }

    const num = Number(value)

    if (isNaN(num)) {
        return ''
    }

    switch (num) {
        case 0: return 'score-darkred'
        case 1: return 'score-darkkhaki'
        case 2: return 'score-darkorange'
        case 3: return 'score-darkgreen'
        case 4: return 'score-green'
        case 5: return 'score-darkgray'
        default: return ''
    }

}


// =========================================
// FORMAT DOJ
// =========================================

function formatDOJ(value) {

    if (!value) return ''

    // API returns "1900-01-01T00:00:00" as placeholder
    if (value.startsWith('1900-01-01')) return ''

    try {

        const date = new Date(value)

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })

    } catch {
        return ''
    }

}


// =========================================
// SKILL SET VIEW PAGE
// =========================================

function SkillSetView() {

    // =========================================
    // STATE
    // =========================================

    const [products, setProducts] =
        useState([])

    const [selectedProduct, setSelectedProduct] =
        useState('')

    const [selectedProductLabel, setSelectedProductLabel] =
        useState('')

    const [reportData, setReportData] =
        useState([])

    const [loading, setLoading] =
        useState(false)

    const [error, setError] =
        useState('')

    const [productError, setProductError] =
        useState('')

    const [exporting, setExporting] =
        useState(false)


    // =========================================
    // GET BRANCH CODE
    // =========================================

    const branchCode =
        sessionStorage.getItem('bpCode') || ''


    // =========================================
    // LOAD PRODUCTS ON MOUNT
    // =========================================

    useEffect(() => {

        const loadProducts = async () => {

            try {

                const items =
                    await getSkillSetProducts()

                setProducts(items)

                if (items.length > 0) {

                    setSelectedProduct(
                        items[0].value
                    )

                    setSelectedProductLabel(
                        items[0].label
                    )

                }

            } catch (err) {

                console.error(
                    'Product load error:', err
                )

                setProductError(
                    err.message ||
                    'Unable to load products.'
                )

            }

        }

        loadProducts()

    }, [])


    // =========================================
    // LOAD REPORT DATA ON MOUNT
    // =========================================

    useEffect(() => {

        if (!branchCode) {

            setError(
                'Branch code is not available.'
            )

            return
        }

        loadReport()

    }, [branchCode])


    // =========================================
    // LOAD REPORT
    // =========================================

    const loadReport = async () => {

        if (!branchCode) {

            setError(
                'Branch code is not available.'
            )

            return
        }

        setLoading(true)
        setError('')

        try {

            const result =
                await getSkillSetData(branchCode)

            setReportData(
                result.data || []
            )

        } catch (err) {

            console.error(
                'Report load error:', err
            )

            setError(
                err.message ||
                'Unable to load report data.'
            )

        } finally {

            setLoading(false)

        }

    }


    // =========================================
    // EXPORT
    // =========================================

    const handleExport = async () => {

        if (!branchCode) {

            alert('Branch code is not available.')
            return
        }

        setExporting(true)

        try {

            const response =
                await exportSkillSetData(branchCode)

            const blob =
                await response.blob()

            const url =
                window.URL.createObjectURL(blob)

            const link =
                document.createElement('a')

            link.href = url

            link.download =
                `SkillCertificationReport_${branchCode}_${new Date().toISOString().slice(0, 10)}.xlsx`

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            window.URL.revokeObjectURL(url)

        } catch (err) {

            console.error(
                'Export error:', err
            )

            alert(
                err.message ||
                'Unable to export report.'
            )

        } finally {

            setExporting(false)

        }

    }


    // =========================================
    // PRODUCT CHANGE (cosmetic — changes title only)
    // =========================================

    const handleProductChange = (e) => {

        const value = e.target.value

        setSelectedProduct(value)

        const found =
            products.find(
                p => String(p.value) === String(value)
            )

        setSelectedProductLabel(
            found ? found.label : ''
        )

    }


    // =========================================
    // UI
    // =========================================

    return (

        <DashboardLayout title="Skill Set View">

            <div className="skillset-container">


                {/* ============================
                    PAGE TITLE
                ============================ */}

                <div className="skillset-title">
                    Product Knowledge Skill Identification and
                    Certification Of Service Ambassadors
                </div>


                {/* ============================
                    TOOLBAR
                ============================ */}

                <div className="skillset-toolbar">

                    <div className="skillset-toolbar-left">

                        <select
                            className="skillset-dropdown"
                            value={selectedProduct}
                            onChange={handleProductChange}
                        >

                            {productError && (
                                <option value="">
                                    {productError}
                                </option>
                            )}

                            {!productError &&
                                products.length === 0 && (
                                    <option value="">
                                        Loading...
                                    </option>
                                )}

                            {products.map(item => (

                                <option
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </option>

                            ))}

                        </select>

                    </div>

                    <div className="skillset-toolbar-right">

                        <button
                            type="button"
                            className="skillset-btn skillset-btn-report"
                            onClick={loadReport}
                            disabled={loading}
                        >
                            {loading
                                ? 'Loading...'
                                : 'Report'}
                        </button>

                        <button
                            type="button"
                            className="skillset-btn skillset-btn-export"
                            onClick={handleExport}
                            disabled={
                                exporting ||
                                reportData.length === 0
                            }
                        >
                            {exporting
                                ? 'Exporting...'
                                : 'Export'}
                        </button>

                    </div>

                </div>


                {/* ============================
                    SELECTED PRODUCT HEADER
                ============================ */}

                {selectedProductLabel && (

                    <div className="skillset-product-header">
                        {selectedProductLabel}
                    </div>

                )}


                {/* ============================
                    ERROR
                ============================ */}

                {error && (

                    <div className="skillset-error">
                        {error}
                    </div>

                )}


                {/* ============================
                    TABLE
                ============================ */}

                {!error && !loading &&
                    reportData.length > 0 && (

                        <div className="skillset-table-wrapper">

                            <table className="skillset-table">


                                {/* ========================
                                    COLUMN GROUP HEADER
                                ======================== */}

                                <thead>

                                    <tr className="skillset-group-row">

                                        <th colSpan={6}></th>

                                        {columnGroups.map(
                                            (group) => (

                                                <th
                                                    key={group.label}
                                                    colSpan={group.cols.length}
                                                    className="skillset-group-header"
                                                >
                                                    {group.label}
                                                </th>

                                            )
                                        )}

                                    </tr>


                                    {/* ====================
                                        COLUMN HEADERS
                                    ==================== */}

                                    <tr>
                                        <th>Franchise Name</th>
                                        <th>Technician Name</th>
                                        <th>Mobile No</th>
                                        <th>DOJ</th>
                                        <th>BPext</th>
                                        <th>Qualification</th>

                                        {scoreColumns.map(
                                            col => (

                                                <th
                                                    key={col}
                                                    className="skillset-score-header"
                                                >
                                                    {col}
                                                </th>

                                            )
                                        )}

                                    </tr>

                                </thead>


                                {/* ========================
                                    DATA ROWS
                                ======================== */}

                                <tbody>

                                    {reportData.map(
                                        (row, index) => (

                                            <tr key={index}>

                                                <td>{row.FranchiseName || ''}</td>

                                                <td>{row.Name || ''}</td>

                                                <td>{row.MobileNo || ''}</td>

                                                <td>{formatDOJ(row.DOJ)}</td>

                                                <td>{row.BPext || ''}</td>

                                                <td>{row.Qualification || ''}</td>

                                                {scoreColumns.map(
                                                    col => (

                                                        <td
                                                            key={col}
                                                            className={
                                                                `skillset-score-cell ${getScoreClass(row[col])}`
                                                            }
                                                        >
                                                            {row[col] !== null &&
                                                                row[col] !== undefined
                                                                ? row[col]
                                                                : ''}
                                                        </td>

                                                    )
                                                )}

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}


                {/* ============================
                    NO DATA
                ============================ */}

                {!error && !loading &&
                    reportData.length === 0 && (

                        <div className="skillset-no-data">
                            No data found.
                        </div>

                    )}


                {/* ============================
                    LOADING
                ============================ */}

                {loading && (

                    <div className="skillset-loading">
                        Loading report data...
                    </div>

                )}


            </div>

        </DashboardLayout>

    )

}


export default SkillSetView