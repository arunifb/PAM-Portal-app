import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getReportList } from '../../api/reportsApi'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import ReportParameter from '../ReportParameter/ReportParameter'

import './ReportData.css'

function ReportData({
    onReportCountChange,
    reportCategory = 'D',
    title = 'Report Data'
}) {
    const location = useLocation()

    // Separate selected report storage for Data and Summary.
    const selectedReportStorageKey =
        reportCategory === 'S'
            ? 'selectedReport_S'
            : 'selectedReport'

    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // =========================================
    // SELECTED REPORT
    // =========================================

    const [selectedReport, setSelectedReport] = useState(() => {
        try {
            const savedReport = sessionStorage.getItem(
                selectedReportStorageKey
            )

            return savedReport ? JSON.parse(savedReport) : null
        } catch (error) {
            console.error('Failed to restore selected report:', error)
            return null
        }
    })

    // =========================================
    // UPDATE TAB TITLE
    // =========================================

    useEffect(() => {
        document.title = selectedReport
            ? `eTraining-${selectedReport.reportType}`
            : `eTraining-${title}`
    }, [selectedReport, title])

    // =========================================
    // RESET SELECTED REPORT
    // =========================================

    useEffect(() => {
        if (location.state?.resetReportData) {
            sessionStorage.removeItem(selectedReportStorageKey)
            setSelectedReport(null)
        }
    }, [
        location.state?.resetReportData,
        selectedReportStorageKey
    ])

    // =========================================
    // LOAD REPORTS
    // =========================================

    useEffect(() => {
        let isMounted = true

        const loadReports = async () => {
            setLoading(true)
            setError('')

            try {
                const storedRoleId = sessionStorage.getItem('roleId')
                const storedRoles = sessionStorage.getItem('roles')

                let reportRoleId = storedRoleId

                // If roleId is 0, attempt to use the stored roles.
                if (!storedRoleId || storedRoleId === '0') {
                    let parsedRoles = []

                    try {
                        parsedRoles = storedRoles
                            ? JSON.parse(storedRoles)
                            : []
                    } catch (parseError) {
                        console.error(
                            'Unable to parse stored roles:',
                            parseError
                        )
                    }

                    if (
                        Array.isArray(parsedRoles) &&
                        parsedRoles.length > 0
                    ) {
                        reportRoleId = parsedRoles
                            .map(String)
                            .filter(role => /^\d+$/.test(role))
                            .join(',')
                    }
                }

                if (!reportRoleId) {
                    throw new Error(
                        'Valid role information is not available.'
                    )
                }

                if (reportRoleId === '0') {
                    throw new Error(
                        'A valid report role could not be determined.'
                    )
                }

                console.log('Report List request:', {
                    roleId: reportRoleId,
                    reportCategory
                })

                const data = await getReportList(
                    reportRoleId,
                    reportCategory
                )

                if (!Array.isArray(data)) {
                    throw new Error(
                        'Invalid report list response.'
                    )
                }

                if (!isMounted) return

                setReports(data)

                if (onReportCountChange) {
                    onReportCountChange(data.length)
                }
            } catch (error) {
                console.error('Report list error:', error)

                if (!isMounted) return

                setError(
                    error.message || 'Unable to load reports.'
                )

                setReports([])

                if (onReportCountChange) {
                    onReportCountChange(0)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadReports()

        return () => {
            isMounted = false
        }
    }, [onReportCountChange, reportCategory])

    // =========================================
    // REPORT CARD CLICK
    // =========================================

    const handleReportClick = (report) => {
        sessionStorage.setItem(
            selectedReportStorageKey,
            JSON.stringify(report)
        )

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
                    sessionStorage.removeItem(
                        selectedReportStorageKey
                    )

                    setSelectedReport(null)
                }}
            />
        )
    }

    // =========================================
    // PAGE CONTENT
    // =========================================

    const renderContent = () => {
        if (loading) {
            return (
                <section className="report-data-section">
                    <div className="report-loading">
                        <div className="report-loading-spinner" />
                        <span>Loading reports...</span>
                    </div>
                </section>
            )
        }

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

                        <h3>Unable to load reports</h3>
                        <p>{error}</p>
                    </div>
                </section>
            )
        }

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

                        <h3>No reports available</h3>
                        <p>
                            There are currently no reports available
                            for your role.
                        </p>
                    </div>
                </section>
            )
        }

        return (
            <section className="report-data-section">
                <div className="report-list-grid">
                    {reports.map((report) => (
                        <button
                            key={report.reportID}
                            type="button"
                            className="report-card"
                            onClick={() => handleReportClick(report)}
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
        <DashboardLayout title={title}>
            {renderContent()}
        </DashboardLayout>
    )
}

export default ReportData