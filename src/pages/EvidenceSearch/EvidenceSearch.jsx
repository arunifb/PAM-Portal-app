import { useState } from 'react'
import './EvidenceSearch.css'

import { searchEvidence } from '../../api/evidenceApi'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

function EvidenceSearch() {
    // =========================================
    // SESSION VALUES
    // =========================================

    const bpCode = sessionStorage.getItem('bpCode') || ''
    const loginId = sessionStorage.getItem('loginId') || ''

    // =========================================
    // FORM STATE
    // =========================================

    const [ticketNo, setTicketNo] = useState('')

    // =========================================
    // SEARCH STATE
    // =========================================

    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [showResults, setShowResults] = useState(false)

    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async () => {
        setError('')
        setMessage('')
        setResults('')
        setShowResults(true)

        if (!ticketNo.trim()) {
            setError('Please enter Ticket No.')
            setResults([])
            return
        }

        if (!bpCode || !loginId) {
            setError(
                'Unable to identify the logged-in branch or franchise. Please log in again.'
            )
            setResults([])
            return
        }

        try {
            setLoading(true)

            const response = await searchEvidence(
                ticketNo,
                bpCode,
                loginId
            )

            const records = Array.isArray(response.data)
                ? response.data
                : []

            setResults(records)

            if (records.length === 0) {
                setMessage('No records found.')
            }
        } catch (err) {
            console.error('Evidence search error:', err)

            setResults([])
            setError(
                err.message || 'Unable to search evidence.'
            )
        } finally {
            setLoading(false)
        }
    }

    // =========================================
    // CLEAR
    // =========================================

    const handleClear = () => {
        setTicketNo('')
        setResults([])
        setError('')
        setMessage('')
        setShowResults(false)
    }

    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDate = (value) => {
        if (!value) return ''

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return value
        }

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    // =========================================
    // IMAGE PREVIEW
    // =========================================

    const renderImage = (url, altText) => {
        if (!url || !url.trim()) {
            return <span className="evidence-no-image">No image</span>
        }

        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="evidence-image-link"
                title="Open image in a new tab"
            >
                <img
                    src={url}
                    alt={altText}
                    className="evidence-image"
                    loading="lazy"
                    onError={(event) => {
                        event.currentTarget.style.display = 'none'
                        event.currentTarget.nextSibling.style.display = 'inline'
                    }}
                />
                <span
                    className="evidence-no-image"
                    style={{ display: 'none' }}
                >
                    Image unavailable
                </span>
            </a>
        )
    }

    // =========================================
    // UI
    // =========================================

    return (
        <DashboardLayout title="Evidence Search">
            <div className="evidence-search-page">

                {/* SEARCH FORM */}
                <div className="evidence-search-box">
                    <div className="evidence-search-form">
                        <div className="evidence-search-field">
                            <label htmlFor="evidenceTicketNo">
                                Ticket No:
                                <span className="required">*</span>
                            </label>

                            <input
                                id="evidenceTicketNo"
                                type="text"
                                value={ticketNo}
                                onChange={(event) => {
                                    setTicketNo(event.target.value)
                                    setError('')
                                    setMessage('')
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleSearch()
                                    }
                                }}
                                placeholder="Enter Ticket No"
                                maxLength={100}
                            />
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="evidence-search-error">
                            {error}
                        </div>
                    )}

                    {/* MESSAGE */}
                    {message && (
                        <div className="evidence-search-message">
                            {message}
                        </div>
                    )}

                    {/* BUTTONS */}
                    <div className="evidence-search-button-area">
                        <button
                            type="button"
                            className="btn-search evidence-search-button"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>

                        <button
                            type="button"
                            className="evidence-clear-button"
                            onClick={handleClear}
                            disabled={loading}
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* RESULTS */}
                {showResults && (
                    <>
                        {loading ? (
                            <div className="evidence-search-box">
                                <div className="evidence-loading">
                                    <div className="evidence-loading-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        ) : results.length > 0 ? (
                            <>
                                {/* TECHNICIAN DETAILS */}
                                <div className="evidence-search-box">
                                    <div className="evidence-section-heading">
                                        Technician Details
                                    </div>

                                    <div className="evidence-table-wrapper">
                                        <table className="evidence-table">
                                            <thead>
                                                <tr>
                                                    <th>SNo.</th>
                                                    <th>PARTNER ID</th>
                                                    <th>Name</th>
                                                    <th>Mobile No</th>
                                                    <th>Aadhar No</th>
                                                    <th>Blood Group</th>
                                                    <th>Profile</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {results.map((item, index) => (
                                                    <tr
                                                        key={`${item.partnerId || item.PartnerId || index}-${index}`}
                                                    >
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            {item.partnerId || item.PartnerId || ''}
                                                        </td>
                                                        <td>{item.name || item.Name || ''}</td>
                                                        <td>{item.mobileNo || item.MobileNo || ''}</td>
                                                        <td>{item.aadharNo || item.AadharNo || ''}</td>
                                                        <td>{item.bloodGroup || item.BloodGroup || ''}</td>
                                                        <td>
                                                            {renderImage(
                                                                item.profileUrl || item.ProfileUrl,
                                                                'Technician profile'
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* EVIDENCE DETAILS */}
                                <div className="evidence-search-box">
                                    <div className="evidence-section-heading">
                                        Captured Evidence
                                    </div>

                                    <div className="evidence-table-wrapper">
                                        <table className="evidence-table">
                                            <thead>
                                                <tr>
                                                    <th>SNo.</th>
                                                    <th>Ticket No</th>
                                                    <th>Invoice Photo</th>
                                                    <th>ODU Serial Photo</th>
                                                    <th>Signature Photo</th>
                                                    <th>Serial Photo</th>
                                                    <th>Upload Date</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {results.map((item, index) => (
                                                    <tr
                                                        key={`${item.ticketNo || item.TicketNo || index}-${index}`}
                                                    >
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            {item.ticketNo || item.TicketNo || ''}
                                                        </td>
                                                        <td>
                                                            {renderImage(
                                                                item.invoicePhoto || item.InvoicePhoto,
                                                                'Invoice photo'
                                                            )}
                                                        </td>
                                                        <td>
                                                            {renderImage(
                                                                item.oduSerialPhoto || item.ODUSerialPhoto,
                                                                'ODU serial photo'
                                                            )}
                                                        </td>
                                                        <td>
                                                            {renderImage(
                                                                item.signaturePhoto || item.SignaturePhoto,
                                                                'Signature photo'
                                                            )}
                                                        </td>
                                                        <td>
                                                            {renderImage(
                                                                item.serialPhoto || item.SerialPhoto,
                                                                'Serial photo'
                                                            )}
                                                        </td>
                                                        <td>
                                                            {formatDate(
                                                                item.uploadDate || item.UploadDate
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="evidence-search-box">
                                <div className="evidence-no-record">
                                    No records found.
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}

export default EvidenceSearch