import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
//import { useLocation, useNavigate } from 'react-router-dom'
import { getReportList } from '../../api/reportsApi'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import ReportParameter from '../ReportParameter/ReportParameter'

import './ReportData.css'

function ReportData({ onReportCountChange }) {

    const location = useLocation()

    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // =========================================
    // SELECTED REPORT
    // =========================================

    const [selectedReport, setSelectedReport] = useState(() => {
    try {
        const savedReport = sessionStorage.getItem('selectedReport')
        return savedReport ? JSON.parse(savedReport) : null
        } catch (error) {
            console.error('Failed to restore selected report:', error)
            return null
        }
    })

    // =========================================
    // UPDATE TAB TITLE FOR SELECTED REPORT
    // =========================================

    useEffect(() => {
        if (selectedReport) {
            document.title = `eTraining-${selectedReport.reportType}`
        } else {
            document.title = 'eTraining-Report Data'
        }
    }, [selectedReport])

        // =========================================
        // RESET REPORT DATA LIST
        // =========================================

        useEffect(() => {
        if (location.state?.resetReportData) {
            sessionStorage.removeItem('selectedReport')
            setSelectedReport(null)
        }
    }, [location.state?.resetReportData])


    // =========================================
    // LOAD REPORTS
    // =========================================

    useEffect(() => {

        const loadReports = async () => {

            const roleId =
                sessionStorage.getItem('roleId')

            if (!roleId) {

                setError(
                    'Role information is not available.'
                )

                setLoading(false)

                return
            }

            try {

                const data =
                    await getReportList(
                        roleId,
                        'D'
                    )

                if (!Array.isArray(data)) {

                    throw new Error(
                        'Invalid report list response.'
                    )
                }

                setReports(data)

                // Send report count to Dashboard
                if (onReportCountChange) {

                    onReportCountChange(
                        data.length
                    )

                }

            } catch (error) {

                console.error(
                    'Report list error:',
                    error
                )

                setError(
                    error.message ||
                    'Unable to load reports.'
                )

                // Reset count if report loading fails
                if (onReportCountChange) {

                    onReportCountChange(0)

                }

            } finally {

                setLoading(false)

            }
        }

        loadReports()

    }, [onReportCountChange])


    // =========================================
    // REPORT CARD CLICK
    // =========================================

    const handleReportClick = (report) => {
    sessionStorage.setItem('selectedReport', JSON.stringify(report))
    setSelectedReport(report)
}


    // =========================================
    // REPORT PARAMETER
    // =========================================

    if (selectedReport) {
    return (
        <ReportParameter
            report={selectedReport}
            onBack={() => {
                sessionStorage.removeItem('selectedReport')
                setSelectedReport(null)
            }}
        />
    )
}


    // =========================================
    // PAGE CONTENT
    // =========================================

    const renderContent = () => {

        // =========================================
        // LOADING
        // =========================================

        if (loading) {

            return (
                <section className="report-data-section">

                    <div className="report-loading">

                        <div className="report-loading-spinner">
                        </div>

                        <span>
                            Loading reports...
                        </span>

                    </div>

                </section>
            )
        }


        // =========================================
        // ERROR
        // =========================================

        if (error) {

            return (
                <section className="report-data-section">

                    <div className="report-empty-state error">

                        <div className="report-empty-icon">

                            <i
                                className="fa fa-exclamation-triangle"
                                aria-hidden="true"
                            />

                        </div>

                        <h3>
                            Unable to load reports
                        </h3>

                        <p>
                            {error}
                        </p>

                    </div>

                </section>
            )
        }


        // =========================================
        // NO REPORTS
        // =========================================

        if (reports.length === 0) {

            return (
                <section className="report-data-section">

                    <div className="report-empty-state">

                        <div className="report-empty-icon">

                            <i
                                className="fa fa-file-text-o"
                                aria-hidden="true"
                            />

                        </div>

                        <h3>
                            No reports available
                        </h3>

                        <p>
                            There are currently no reports
                            available for your role.
                        </p>

                    </div>

                </section>
            )
        }


        // =========================================
        // REPORT LIST
        // =========================================

        return (

            <section className="report-data-section">

                <div className="report-list-grid">

                    {reports.map((report) => (

                        <button
                            key={report.reportID}
                            type="button"
                            className="report-card"
                            onClick={() =>
                                handleReportClick(report)
                            }
                        >

                            <div className="report-card-top">

                                <div className="report-card-icon">

                                    <span className="fa-stack">

                                        <i
                                            className="fa fa-circle fa-stack-2x"
                                            aria-hidden="true"
                                        />

                                        <i
                                            className={`fa ${report.imageUrl} fa-inverse fa-stack-1x`}
                                            aria-hidden="true"
                                        />

                                    </span>

                                </div>

                                <span className="report-card-arrow">

                                    <i
                                        className="fa fa-arrow-right"
                                        aria-hidden="true"
                                    />

                                </span>

                            </div>


                            <div className="report-card-content">

                                <span className="report-card-name">
                                    {report.reportType}
                                </span>

                                <span className="report-card-description">
                                    View report details
                                </span>

                            </div>

                        </button>

                    ))}

                </div>

            </section>
        )
    }


    // =========================================
    // DASHBOARD LAYOUT
    // =========================================

    return (

        <DashboardLayout title="Report Data">

            {renderContent()}

        </DashboardLayout>
    )
}

export default ReportData