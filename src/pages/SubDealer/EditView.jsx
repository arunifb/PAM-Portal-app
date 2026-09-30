import { useEffect, useState } from 'react'

import DashboardLayout
    from '../../components/DashboardLayout/DashboardLayout'

import {
    searchSubDealerRequisitions,
    getSubDealerById,
    updateSubDealerRequisition,
    downloadSubDealerRequisitions
} from '../../api/subDealerApi'

import './EditView.css'


function EditView() {

    // =========================================
    // SEARCH
    // =========================================

    const [searchStatus, setSearchStatus] =
        useState('1')

    const [records, setRecords] =
        useState([])

    const [selectedIds, setSelectedIds] =
        useState([])

    const [loading, setLoading] =
        useState(false)

    const [error, setError] =
        useState('')

    const [success, setSuccess] =
        useState('')


    // =========================================
    // MODAL
    // =========================================

    const [showModal, setShowModal] =
        useState(false)

    const [modalMode, setModalMode] =
        useState('edit')

    const [modalLoading, setModalLoading] =
        useState(false)


    // =========================================
    // SELECTED RECORD
    // =========================================

    const [selectedRecord, setSelectedRecord] =
        useState(null)


    // =========================================
    // FORM
    // =========================================

    const [formData, setFormData] =
        useState({
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


    // =========================================
    // LOAD INITIAL DATA
    // =========================================

    useEffect(() => {

        loadRecords('1')

    }, [])


    // =========================================
    // SEARCH
    // =========================================

    const loadRecords = async (
        status = searchStatus
    ) => {

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


            const data =
                await searchSubDealerRequisitions(
                    request
                )


            if (!Array.isArray(data)) {

                throw new Error(
                    'Invalid sub-dealer response.'
                )
            }


            setRecords(data)


        } catch (err) {

            console.error(
                'Sub-dealer search error:',
                err
            )


            setRecords([])

            setError(
                err.message ||
                'Unable to load sub-dealer requisitions.'
            )

        } finally {

            setLoading(false)

        }
    }


    // =========================================
    // SEARCH BUTTON
    // =========================================

    const handleSearch = () => {

        loadRecords(
            searchStatus
        )
    }


    // =========================================
    // CHECKBOX
    // =========================================

    const handleCheckboxChange = (
        requisitionId
    ) => {

        const id =
            String(requisitionId)


        setSelectedIds(
            previous => {

                if (
                    previous.includes(id)
                ) {

                    return previous.filter(
                        item =>
                            item !== id
                    )
                }


                return [
                    ...previous,
                    id
                ]
            }
        )
    }


    // =========================================
    // SELECT ALL
    // =========================================

    const handleSelectAll = (
        checked
    ) => {

        if (!checked) {

            setSelectedIds([])

            return
        }


        setSelectedIds(
            records.map(
                record =>
                    String(
                        record.requisitionId
                    )
            )
        )
    }


    // =========================================
    // EDIT / VIEW
    // =========================================

    const handleOpenModal = async (
        record,
        mode
    ) => {

        setModalMode(
            mode
        )

        setShowModal(true)

        setModalLoading(true)

        setError('')

        setSuccess('')


        try {

            const id =
                record?.requisitionId


            const data =
                await getSubDealerById(
                    id
                )


            if (!data) {

                throw new Error(
                    'Sub-dealer details not found.'
                )
            }


            setSelectedRecord(
                data
            )


            setFormData({
                requisitionId:
                    data.requisitionId ??
                    id ??
                    '',

                // API returns "sapeccCode"
                dealerCode:
                    data.sapeccCode ??
                    '',

                dealerName:
                    data.sapName ??
                    '',

                storeName:
                    data.storeName ??
                    '',

                subDealerCode:
                    data.subDealerCode ??
                    '',

                postalCode:
                    data.pinCode ??
                    '',

                state:
                    data.state ??
                    '',

                district:
                    data.district ??
                    '',

                city:
                    data.subDealerCity ??
                    '',

                area:
                    data.shopArea ??
                    '',

                status:
                    getStatusValue(
                        data.subDealerStatus
                    )
            })


        } catch (err) {

            console.error(
                'Sub-dealer details error:',
                err
            )


            setError(
                err.message ||
                'Unable to load sub-dealer details.'
            )


            setShowModal(false)

        } finally {

            setModalLoading(false)

        }
    }


    // =========================================
    // STATUS VALUE
    // =========================================

    const getStatusValue = (
        status
    ) => {

        if (
            status === 'Inprogress'
        ) {

            return '12'
        }


        if (
            status ===
            'Sub-Dealer Code Issued'
        ) {

            return '11'
        }


        if (
            status === '12' ||
            status === 12
        ) {

            return '12'
        }


        if (
            status === '11' ||
            status === 11
        ) {

            return '11'
        }


        return 'Please select'
    }


    // =========================================
    // FORM CHANGE
    // =========================================

    const handleFormChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target


        setFormData(
            previous => ({
                ...previous,
                [name]: value
            })
        )
    }


    // =========================================
    // SAVE CHANGES
    // =========================================

    const handleSave = async () => {

        setError('')

        setSuccess('')


        if (
            formData.subDealerCode
                .trim()
                .toUpperCase() ===
            'DUMMYCODE'
        ) {

            setError(
                'Please enter sub-Dealer code which already created in CRM'
            )

            return
        }


        if (
            formData.status ===
            'Please select'
        ) {

            setError(
                'Please select status.'
            )

            return
        }


        try {

            const updatedBy =
                sessionStorage.getItem(
                    'userId'
                ) || ''


            const request = {

                SubDealerId:
                    Number(
                        formData.requisitionId
                    ),

                SubDealerCode:
                    formData.subDealerCode
                        .trim(),

                SubDealerStatus:
                    formData.status,

                UpdatedBy:
                    updatedBy
            }


            await updateSubDealerRequisition(
                request
            )


            setSuccess(
                'Record updated successfully.'
            )


            setShowModal(false)


            await loadRecords(
                searchStatus
            )


        } catch (err) {

            console.error(
                'Sub-dealer update error:',
                err
            )


            setError(
                err.message ||
                'Unable to update sub-dealer requisition.'
            )
        }
    }


    // =========================================
    // DOWNLOAD
    // =========================================

    const handleDownload = async () => {

        setError('')

        setSuccess('')


        if (
            selectedIds.length === 0
        ) {

            setError(
                'Please select at least one requisition.'
            )

            return
        }


        try {

            const updatedBy =
                sessionStorage.getItem(
                    'userId'
                ) || ''


            const request = {

                RequisitionIds:
                    selectedIds.join(','),

                UpdatedBy:
                    updatedBy
            }


            const blob =
                await downloadSubDealerRequisitions(
                    request
                )


            if (!blob) {

                throw new Error(
                    'No file received from server.'
                )
            }


            const url =
                window.URL.createObjectURL(
                    blob
                )


            const link =
                document.createElement('a')


            link.href =
                url


            const now =
                new Date()


            const pad = (
                value
            ) =>
                String(value)
                    .padStart(2, '0')


            const fileName =
                `SubDealer_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.txt`


            link.download =
                fileName


            document.body.appendChild(
                link
            )


            link.click()


            link.remove()


            window.URL.revokeObjectURL(
                url
            )


            setSuccess(
                'Download completed successfully.'
            )


            await loadRecords(
                searchStatus
            )


        } catch (err) {

            console.error(
                'Sub-dealer download error:',
                err
            )


            setError(
                err.message ||
                'Unable to download sub-dealer requisitions.'
            )
        }
    }


    // =========================================
    // CLOSE MODAL
    // =========================================

    const handleCloseModal = () => {

        setShowModal(false)

        setSelectedRecord(null)

        setError('')
    }


    // =========================================
    // STATUS CLASS
    // =========================================

    const getStatusClass = (
        status
    ) => {

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


    // =========================================
    // UI
    // =========================================

    return (

        <DashboardLayout
            title="Sub-Dealer Requisition"
        >

            <div className="subdealer-editview-page">


                {/* =================================
                    COMPACT TOP BAR
                ================================= */}

                <div className="subdealer-top-bar">


                    {/* LEFT - STATUS */}

                    <div className="subdealer-status-filter">

                        <label htmlFor="ddlSearchStatus">
                            Status
                        </label>

                        <select
                            id="ddlSearchStatus"
                            value={searchStatus}
                            onChange={
                                event =>
                                    setSearchStatus(
                                        event.target.value
                                    )
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


                    {/* RIGHT - ACTION BUTTONS */}

                    <div className="subdealer-page-actions">

                        <button
                            type="button"
                            className="subdealer-search-button"
                            onClick={
                                handleSearch
                            }
                        >

                            <i
                                className="fa fa-search"
                                aria-hidden="true"
                            />

                            <span>
                                Search
                            </span>

                        </button>


                        <button
                            type="button"
                            className="subdealer-download-button"
                            onClick={
                                handleDownload
                            }
                        >

                            <i
                                className="fa fa-download"
                                aria-hidden="true"
                            />

                            <span>
                                Download
                            </span>

                        </button>

                    </div>

                </div>


                {/* =================================
                    SUCCESS
                ================================= */}

                {success && (

                    <div className="subdealer-success-message">

                        {success}

                    </div>

                )}


                {/* =================================
                    ERROR
                ================================= */}

                {error && !showModal && (

                    <div className="subdealer-error-message">

                        {error}

                    </div>

                )}


                {/* =================================
                    TABLE
                ================================= */}

                <div className="subdealer-table-wrapper">

                    {loading ? (

                        <div className="subdealer-table-message">

                            Loading...

                        </div>

                    ) : records.length === 0 ? (

                        <div className="subdealer-table-message">

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
                                                selectedIds.length ===
                                                records.length
                                            }
                                            onChange={
                                                event =>
                                                    handleSelectAll(
                                                        event.target.checked
                                                    )
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

                                {records.map(
                                    (
                                        record,
                                        index
                                    ) => {

                                        const id =
                                            String(
                                                record.requisitionId
                                            )


                                        const isIssued =
                                            record.subDealerStatus ===
                                            'Sub-Dealer Code Issued'


                                        return (

                                            <tr
                                                key={
                                                    id
                                                }
                                            >

                                                <td className="checkbox-column">

                                                    <input
                                                        type="checkbox"
                                                        value={id}
                                                        checked={
                                                            selectedIds.includes(
                                                                id
                                                            )
                                                        }
                                                        onChange={() =>
                                                            handleCheckboxChange(
                                                                id
                                                            )
                                                        }
                                                    />

                                                </td>


                                                <td>
                                                    {
                                                        record.rowIndex ||
                                                        index + 1
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.requisitionId
                                                    }
                                                </td>


                                                {/* DEALER CODE */}

                                                <td>
                                                    {
                                                        record.sapeccCode
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.sapName
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.subDealerCode
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.storeName
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.pinCode
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.state
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.district
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.subDealerCity
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.shopArea
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.productvalues
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `subdealer-status ${getStatusClass(
                                                                record.subDealerStatus
                                                            )}`
                                                        }
                                                    >
                                                        {
                                                            record.subDealerStatus
                                                        }
                                                    </span>

                                                </td>


                                                <td>
                                                    {
                                                        record.createdDate
                                                    }
                                                </td>


                                                <td>

                                                    <div className="subdealer-action-buttons">

                                                        {isIssued ? (

                                                            <button
                                                                type="button"
                                                                className="subdealer-view-button"
                                                                onClick={() =>
                                                                    handleOpenModal(
                                                                        record,
                                                                        'view'
                                                                    )
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
                                                                    handleOpenModal(
                                                                        record,
                                                                        'edit'
                                                                    )
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

                                    }
                                )}

                            </tbody>

                        </table>

                    )}

                </div>


                {/* =================================
                    MODAL
                ================================= */}

                {showModal && (

                    <div
                        className="subdealer-modal-overlay"
                        onMouseDown={
                            event => {

                                if (
                                    event.target ===
                                    event.currentTarget
                                ) {

                                    handleCloseModal()

                                }

                            }
                        }
                    >

                        <div className="subdealer-modal">


                            {/* MODAL HEADER */}

                            <div className="subdealer-modal-header">

                                <h3>
                                    Sub-Dealer Requisition
                                </h3>


                                <button
                                    type="button"
                                    className="subdealer-modal-close"
                                    onClick={
                                        handleCloseModal
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {/* MODAL BODY */}

                            <div className="subdealer-modal-body">

                                {modalLoading ? (

                                    <div className="subdealer-modal-loading">

                                        Loading...

                                    </div>

                                ) : (

                                    <>

                                        <div className="subdealer-form-row">

                                            <span
                                                id="requisitionId"
                                                className="subdealer-hidden-id"
                                            >
                                                {
                                                    formData.requisitionId
                                                }
                                            </span>

                                        </div>


                                        <div className="subdealer-form-group">

                                            <label>
                                                Dealer Code
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    formData.dealerCode
                                                }
                                                disabled
                                            />

                                        </div>


                                        <div className="subdealer-form-group">

                                            <label>
                                                Dealer Name
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    formData.dealerName
                                                }
                                                disabled
                                            />

                                        </div>


                                        <div className="subdealer-form-group">

                                            <label>
                                                Sub-Dealer Name
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    formData.storeName
                                                }
                                                disabled
                                            />

                                        </div>


                                        <div className="subdealer-form-group">

                                            <label>
                                                Sub-Dealer Code
                                            </label>

                                            <input
                                                type="text"
                                                name="subDealerCode"
                                                value={
                                                    formData.subDealerCode
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                disabled={
                                                    modalMode ===
                                                    'view'
                                                }
                                            />

                                        </div>


                                        <div className="subdealer-form-group">

                                            <label>
                                                Postal Code
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    formData.postalCode
                                                }
                                                disabled
                                            />

                                        </div>


                                        <div className="subdealer-form-group">

                                            <label>
                                                State
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    formData.state
                                                }
                                                disabled
                                            />

                                        </div>


                                        <div className="subdealer-form-group">

                                            <label>
                                                District
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    formData.district
                                                }
                                                disabled
                                            />

                                        </div>


                                        <div className="subdealer-form-group">

                                            <label>
                                                City
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    formData.city
                                                }
                                                disabled
                                            />

                                        </div>


                                        <div className="subdealer-form-group">

                                            <label>
                                                Area
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    formData.area
                                                }
                                                disabled
                                            />

                                        </div>


                                        <div className="subdealer-form-group">

                                            <label>
                                                Status
                                            </label>

                                            <select
                                                name="status"
                                                value={
                                                    formData.status
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                disabled={
                                                    modalMode ===
                                                    'view'
                                                }
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


                            {/* MODAL FOOTER */}

                            {!modalLoading && (

                                <div className="subdealer-modal-footer">

                                    {modalMode ===
                                        'edit' && (

                                        <button
                                            type="button"
                                            className="subdealer-save-button"
                                            onClick={
                                                handleSave
                                            }
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
                                        onClick={
                                            handleCloseModal
                                        }
                                    >
                                        Close
                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </DashboardLayout>
    )
}


export default EditView