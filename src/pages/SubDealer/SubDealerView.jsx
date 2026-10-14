import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import { searchSubDealerRequisitions } from '../../api/subDealerApi'

import './SubDealerView.css'

function getSessionValue(...keys) {
    for (const key of keys) {
        const value = sessionStorage.getItem(key)
        if (value !== null && value !== '') return value
    }
    return ''
}

function getArray(response) {
    if (Array.isArray(response)) return response

    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.items)) return response.items
    if (Array.isArray(response?.results)) return response.results
    if (Array.isArray(response?.records)) return response.records

    return []
}

function getValue(record, ...keys) {
    for (const key of keys) {
        if (record?.[key] !== undefined && record[key] !== null) {
            return record[key]
        }
    }

    return ''
}

function getStatusLabel(status) {
    const value = String(status ?? '').trim()

    const statuses = {
        '1': 'Pending for Approval',
        '2': 'Correction Required',
        '3': 'Downloaded',
        '11': 'Sub-Dealer Code Issued',
        '12': 'Inprogress'
    }

    return statuses[value] || value || 'Closed'
}

function getStatusClass(status) {
    const label = getStatusLabel(status).toLowerCase()

    if (label.includes('pending')) return 'subdealer-view-status-pending'
    if (label.includes('correction')) return 'subdealer-view-status-correction'
    if (label.includes('downloaded')) return 'subdealer-view-status-downloaded'
    if (label.includes('issued')) return 'subdealer-view-status-issued'

    return 'subdealer-view-status-closed'
}

function formatDate(value) {
    if (!value) return '-'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return String(value)

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

function SubDealerView() {
    const navigate = useNavigate()

    const userId = getSessionValue('userId', 'UserID')

    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [searchText, setSearchText] = useState('')

    const loadRecords = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const response = await searchSubDealerRequisitions({
                CreatedBy: userId,
                RequisitionId: '',
                SubDealerStatus: '',
                BranchRefId: ''
            })

            setRecords(getArray(response))
        } catch (err) {
            setRecords([])
            setError(err?.message || 'Unable to load sub-dealer requisitions.')
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        loadRecords()
    }, [loadRecords])

    const filteredRecords = records.filter((record) => {
        const search = searchText.trim().toLowerCase()

        if (!search) return true

        const searchableValues = [
            getValue(record, 'RequisitionId', 'requisitionId', 'RequestId'),
            getValue(record, 'sapeccCode', 'SAPECCCode', 'sapECCCode', 'DealerCode'),
            getValue(record, 'SAPName', 'sapName', 'DealerName'),
            getValue(record, 'SubDealerCode', 'subDealerCode'),
            getValue(record, 'StoreName', 'storeName', 'Store Name'),
            getValue(record, 'PinCode', 'pinCode', 'Postal_Code'),
            getValue(record, 'State', 'state'),
            getValue(record, 'District', 'district'),
            getValue(record, 'SubDealerCity', 'subDealerCity', 'City'),
            getValue(record, 'ShopArea', 'shopArea', 'Location/Area'),
            getStatusLabel(
                getValue(record, 'SubDealerStatus', 'subDealerStatus', 'Status')
            )
        ]

        return searchableValues.some((value) =>
            String(value ?? '').toLowerCase().includes(search)
        )
    })

    return (
        <DashboardLayout title="Sub-Dealer Requisition">
            <div className="subdealer-view-page">
                <div className="subdealer-view-header">
                    <div>
                        {/* <h2>
                            <i className="fa fa-eye" aria-hidden="true"></i>
                            {' '}Sub-Dealer Requisition
                        </h2> */}
                        <p>View your submitted sub-dealer requisitions</p>
                    </div>

                    <button
                        type="button"
                        className="subdealer-view-back-button"
                        onClick={() => navigate(-1)}
                    >
                        <i className="fa fa-arrow-left" aria-hidden="true"></i>
                        Back
                    </button>
                </div>

                {error && (
                    <div className="subdealer-view-error">
                        {error}
                    </div>
                )}

                <div className="subdealer-view-toolbar">
                    <div className="subdealer-view-search">
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input
                            type="text"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Search requisitions..."
                            aria-label="Search requisitions"
                        />
                    </div>

                    <button
                        type="button"
                        className="subdealer-view-refresh-button"
                        onClick={loadRecords}
                        disabled={loading}
                    >
                        <i className="fa fa-refresh" aria-hidden="true"></i>
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                <div className="subdealer-view-table-wrapper">
                    <table className="subdealer-view-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Requisition ID</th>
                                <th>SAP ECC Code</th>
                                <th>SAP Name</th>
                                <th>Sub-Dealer Code</th>
                                <th>Store Name</th>
                                <th>PIN Code</th>
                                <th>State</th>
                                <th>District</th>
                                <th>Sub-Dealer City</th>
                                <th>Shop Area</th>
                                <th>Status</th>
                                <th>Created Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="13" className="subdealer-view-message">
                                        Loading requisitions...
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="13" className="subdealer-view-message">
                                        {searchText
                                            ? 'No matching requisitions found.'
                                            : 'No sub-dealer requisitions found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record, index) => {
                                    const status = getValue(
                                        record,
                                        'SubDealerStatus',
                                        'subDealerStatus',
                                        'Status'
                                    )

                                    return (
                                        <tr
                                            key={getValue(
                                                record,
                                                'RequisitionId',
                                                'requisitionId',
                                                'RequestId'
                                            ) || index}
                                        >
                                            <td>{index + 1}</td>
                                            <td>
                                                {getValue(
                                                    record,
                                                    'RequisitionId',
                                                    'requisitionId',
                                                    'RequestId'
                                                ) || '-'}
                                            </td>
                                            <td>
                                                {getValue(
                                                    record,
                                                    'sapeccCode',
                                                    'SAPECCCode',
                                                    'sapECCCode',
                                                    'DealerCode'
                                                ) || '-'}
                                            </td>
                                            <td>
                                                {getValue(
                                                    record,
                                                    'SAPName',
                                                    'sapName',
                                                    'DealerName'
                                                ) || '-'}
                                            </td>
                                            <td>
                                                {getValue(
                                                    record,
                                                    'SubDealerCode',
                                                    'subDealerCode'
                                                ) || '-'}
                                            </td>
                                            <td>
                                                {getValue(
                                                    record,
                                                    'StoreName',
                                                    'storeName',
                                                    'Store Name'
                                                ) || '-'}
                                            </td>
                                            <td>
                                                {getValue(
                                                    record,
                                                    'PinCode',
                                                    'pinCode',
                                                    'Postal_Code'
                                                ) || '-'}
                                            </td>
                                            <td>{getValue(record, 'State', 'state') || '-'}</td>
                                            <td>{getValue(record, 'District', 'district') || '-'}</td>
                                            <td>
                                                {getValue(
                                                    record,
                                                    'SubDealerCity',
                                                    'subDealerCity',
                                                    'City'
                                                ) || '-'}
                                            </td>
                                            <td>
                                                {getValue(
                                                    record,
                                                    'ShopArea',
                                                    'shopArea',
                                                    'Location/Area'
                                                ) || '-'}
                                            </td>
                                            <td>
                                                <span
                                                    className={`subdealer-view-status ${getStatusClass(status)}`}
                                                >
                                                    {getStatusLabel(status)}
                                                </span>
                                            </td>
                                            <td>
                                                {formatDate(
                                                    getValue(
                                                        record,
                                                        'CreatedDate',
                                                        'createdDate'
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="subdealer-view-footer">
                    Showing {filteredRecords.length} of {records.length} requisitions
                </div>
            </div>
        </DashboardLayout>
    )
}

export default SubDealerView