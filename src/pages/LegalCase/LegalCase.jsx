import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getLegalCaseHeaders,
    exportLegalCases
} from '../../api/legalCaseApi'

import './LegalCase.css'


function LegalCase() {

    const navigate = useNavigate()

    const [legalCases, setLegalCases] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [downloading, setDownloading] =
        useState(false)


    // =========================================
    // USER SESSION VALUES
    // =========================================

    const roleId =
        sessionStorage.getItem('roleId') || ''

    const bpCode =
        Number(
            sessionStorage.getItem('bpCode') || 0
        )

    const userId =
        Number(
            sessionStorage.getItem('userId') || 0
        )

    const regionCode =
        sessionStorage.getItem('regionCode') || ''


    // =========================================
    // FILTER DATA
    // =========================================

    const filterData = {
        roleId,
        bpCode,
        userId,
        regionCode
    }


    // =========================================
    // LOAD LEGAL CASES
    // =========================================

    const loadLegalCases = async () => {

        try {

            setLoading(true)
            setError('')

            const response =
                await getLegalCaseHeaders(
                    filterData
                )

            if (response?.isSuccess) {

                setLegalCases(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                )

            }
            else {

                setLegalCases([])

                setError(
                    response?.message ||
                    'Unable to load legal case data.'
                )

            }

        }
        catch (err) {

            setLegalCases([])

            setError(
                err?.message ||
                'Unable to load legal case data.'
            )

        }
        finally {

            setLoading(false)

        }
    }


    useEffect(() => {

        loadLegalCases()

    }, [])


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return ''
        }

        const date =
            new Date(dateValue)

        if (Number.isNaN(date.getTime())) {
            return ''
        }

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

        const day =
            String(
                date.getDate()
            ).padStart(2, '0')

        const month =
            months[date.getMonth()]

        const year =
            date.getFullYear()

        return `${day}-${month}-${year}`
    }


    // =========================================
    // DETAILS
    // =========================================

    const handleDetails = (legalCaseHeaderID) => {

        navigate(
            `/legal-case-details/${legalCaseHeaderID}`
        )

    }


    // =========================================
    // ADD NEW
    // =========================================

    const handleAddNew = () => {

        navigate('/legal-case/add')

    }


    // =========================================
    // DOWNLOAD
    // =========================================

    const handleDownload = async () => {

        try {

            setDownloading(true)
            setError('')

            const blob =
                await exportLegalCases(
                    filterData
                )

            const url =
                window.URL.createObjectURL(
                    blob
                )

            const link =
                document.createElement('a')

            link.href = url

            const today =
                new Date()

            const day =
                String(
                    today.getDate()
                ).padStart(2, '0')

            const month =
                String(
                    today.getMonth() + 1
                ).padStart(2, '0')

            const year =
                today.getFullYear()

            link.download =
                `Legal Case_${day}${month}${year}.xlsx`

            document.body.appendChild(link)

            link.click()

            link.remove()

            window.URL.revokeObjectURL(url)

        }
        catch (err) {

            setError(
                err?.message ||
                'Unable to download legal case data.'
            )

        }
        finally {

            setDownloading(false)

        }
    }


    return (

        <DashboardLayout title="Legal Case">

            <div className="legal-case-page">

                {/* =========================================
                    ACTION BAR
                ========================================= */}

                <div className="legal-case-action-bar">

                    <div className="legal-case-summary">

                        <span className="legal-case-summary-title">
                            Legal Case Records
                        </span>

                        {!loading && (
                            <span className="legal-case-count">
                                {legalCases.length}
                            </span>
                        )}

                    </div>


                    <div className="legal-case-actions">

                        {roleId === '6' && (

                            <button
                                type="button"
                                className="legal-case-add-btn"
                                onClick={handleAddNew}
                                disabled={
                                    loading ||
                                    downloading
                                }
                            >
                                <span className="legal-case-btn-icon">
                                    +
                                </span>

                                Add New
                            </button>

                        )}


                        <button
                            type="button"
                            className="legal-case-download-btn"
                            onClick={handleDownload}
                            disabled={
                                loading ||
                                downloading
                            }
                        >

                            <span className="legal-case-btn-icon">
                                ↓
                            </span>

                            {downloading
                                ? 'Downloading...'
                                : 'Download'}

                        </button>

                    </div>

                </div>


                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (

                    <div className="legal-case-error">
                        <span className="legal-case-error-icon">
                            !
                        </span>

                        <span>
                            {error}
                        </span>
                    </div>

                )}


                {/* =========================================
                    TABLE CARD
                ========================================= */}

                <div className="legal-case-box">

                    <div className="legal-case-table-wrapper">

                        {loading ? (

                            <div className="legal-case-loading">

                                <div className="legal-case-spinner"></div>

                                <span>
                                    Loading legal cases...
                                </span>

                            </div>

                        ) : legalCases.length === 0 ? (

                            <div className="legal-case-empty-wrapper">

                                <div className="legal-case-empty-icon">
                                    ⚖
                                </div>

                                <div className="legal-case-empty">
                                    There no case details found.
                                </div>

                            </div>

                        ) : (

                            <table className="legal-case-table">

                                <thead>

                                    <tr>

                                        <th>Branch</th>

                                        <th>Case No</th>

                                        <th>Product Model</th>

                                        <th>
                                            Case Filing Date
                                        </th>

                                        <th>
                                            Date Of Purchage
                                        </th>

                                        <th>
                                            Case Title
                                        </th>

                                        <th>
                                            Court/Forum/Commission
                                        </th>

                                        <th>
                                            Advocate Name
                                        </th>

                                        <th>
                                            Concerned Executive
                                        </th>

                                        <th>
                                            Last Date Hearing
                                        </th>

                                        <th>
                                            Next Date Hearing
                                        </th>

                                        <th>Status</th>

                                        {/* <th>Details</th> */}

                                    </tr>

                                </thead>


                                <tbody>

                                    {legalCases.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.legalCaseHeaderID
                                                }
                                            >

                                                <td>
                                                    {
                                                        item.branchName
                                                    }
                                                </td>

                                                <td>
                                                    <span className="legal-case-number">
                                                        {
                                                            item.caseNo
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        item.product_Model
                                                    }
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        item.casefiling
                                                    )}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        item.dop
                                                    )}
                                                </td>

                                                <td className="legal-case-title-cell">
                                                    {
                                                        item.casetitle
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.court_Forum_Commission
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.advocateName
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.concernedExecutive
                                                    }
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        item.last_Date_Hearing
                                                    )}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        item.next_Date_Hearing
                                                    )}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `legal-case-status ${
                                                                item.status
                                                                    ?.toLowerCase()
                                                                    .replace(
                                                                        /\s+/g,
                                                                        '-'
                                                                    )
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            item.status
                                                        }
                                                    </span>

                                                </td>

                                                {/* <td>

                                                    <button
                                                        type="button"
                                                        className="legal-case-details-btn"
                                                        onClick={() =>
                                                            handleDetails(
                                                                item.legalCaseHeaderID
                                                            )
                                                        }
                                                    >
                                                        View Details
                                                    </button>

                                                </td> */}

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>

                </div>

            </div>

        </DashboardLayout>

    )
}


export default LegalCase