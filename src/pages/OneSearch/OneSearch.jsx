
import { useEffect, useState } from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import { searchOneSearch } from '../../api/oneSearchApi'

import './OneSearch.css'


function OneSearch() {

    // =========================================
    // SEARCH FIELDS
    // =========================================

    const [ticketNo, setTicketNo] =
        useState('')

    const [serialNo, setSerialNo] =
        useState('')

    const [customerName, setCustomerName] =
        useState('')

    const [searchMobileNumber, setSearchMobileNumber] =
        useState('')


    // =========================================
    // RESULT
    // =========================================

    const [searchResult, setSearchResult] =
        useState(null)


    // =========================================
    // MESSAGE
    // =========================================

    const [message, setMessage] =
        useState('')

    const [messageType, setMessageType] =
        useState('')


    // =========================================
    // LOADING
    // =========================================

    const [loading, setLoading] =
        useState(false)


    // =========================================
    // GET REGION CODE
    // =========================================

    const regionCode =
        sessionStorage.getItem('regionCode') || ''


    // =========================================
    // CLEAR RESULT
    // =========================================

    const clearResult = () => {

        setSearchResult(null)

    }


    // =========================================
    // GET VALUE
    // Handles different API casing
    // =========================================

    const getValue = (
        row,
        fieldName
    ) => {

        if (!row) {
            return ''
        }

        const key =
            Object.keys(row).find(
                key =>
                    key.toLowerCase() ===
                    fieldName.toLowerCase()
            )

        return key
            ? row[key] ?? ''
            : ''
    }


    // =========================================
    // SEARCH
    // =========================================

    const handleSearch = async (
        event
    ) => {

        event?.preventDefault()

        setMessage('')
        setMessageType('')


        // =====================================
        // SAME VALIDATION AS OLD WEBFORMS
        // =====================================

        if (
            !ticketNo.trim() &&
            !serialNo.trim() &&
            !customerName.trim() &&
            !searchMobileNumber.trim()
        ) {

            clearResult()

            setMessage(
                'You must enter at least one field!'
            )

            setMessageType('error')

            return
        }


        // =====================================
        // CLEAR OLD RESULT
        // =====================================

        clearResult()

        setLoading(true)


        try {

            const data =
                await searchOneSearch({

                    ticketNo:
                        ticketNo.trim(),

                    rcnNumber:
                        '',

                    serialNo:
                        serialNo.trim(),

                    name:
                        customerName.trim(),

                    mobileNumber:
                        searchMobileNumber.trim(),

                    regionCode
                })


            // =================================
            // API RETURNS ARRAY
            // OLD PAGE USED FIRST ROW ONLY
            // =================================

            if (
                !Array.isArray(data) ||
                data.length === 0
            ) {

                setMessage(
                    'There no data found'
                )

                setMessageType(
                    'error'
                )

                clearResult()

                return
            }


            setSearchResult(
                data[0]
            )


            setMessage('')
            setMessageType('')


        } catch (error) {

            console.error(
                'One Search error:',
                error
            )


            setMessage(
                error.message ||
                'Unable to search call register.'
            )

            setMessageType(
                'error'
            )

            clearResult()

        } finally {

            setLoading(false)

        }
    }


    // =========================================
    // AUTO LOAD
    // =========================================

    useEffect(() => {

        // No automatic search.

    }, [])


    // =========================================
    // RESULT FIELD COMPONENT
    // =========================================

    const ResultField = ({
    label,
    value
}) => {

    const displayValue =
        value === null ||
        value === undefined ||
        String(value).trim() === ''
            ? 'NA'
            : value

    return (
        <div className="one-search-result-field">

            <label>
                {label}
            </label>

            <input
                type="text"
                value={displayValue}
                readOnly
                disabled
            />

        </div>
    )
}


    // =========================================
    // UI
    // =========================================

    return (

        <DashboardLayout
            title="One Search"
        >

            <div className="one-search-page">


                {/* =================================
                    SEARCH SECTION
                ================================= */}

                <div className="one-search-box">

                    <form
                        onSubmit={handleSearch}
                    >

                        <div className="one-search-form-grid">


                            {/* TICKET NUMBER */}

                            <div className="one-search-field">

                                <label htmlFor="ticketNo">
                                    Ticket Number
                                </label>

                                <input
                                    id="ticketNo"
                                    type="text"
                                    value={ticketNo}
                                    onChange={event =>
                                        setTicketNo(
                                            event.target.value
                                        )
                                    }
                                    maxLength={10}
                                    placeholder="Enter ticket number"
                                />

                            </div>


                            {/* MOBILE NUMBER */}

                            <div className="one-search-field">

                                <label htmlFor="searchMobileNumber">
                                    Mobile Number
                                </label>

                                <input
                                    id="searchMobileNumber"
                                    type="text"
                                    value={searchMobileNumber}
                                    onChange={event =>
                                        setSearchMobileNumber(
                                            event.target.value
                                        )
                                    }
                                    maxLength={15}
                                    placeholder="Enter mobile number"
                                />

                            </div>


                            {/* SERIAL NUMBER */}

                            <div className="one-search-field">

                                <label htmlFor="serialNo">
                                    Serial Number
                                </label>

                                <input
                                    id="serialNo"
                                    type="text"
                                    value={serialNo}
                                    onChange={event =>
                                        setSerialNo(
                                            event.target.value
                                        )
                                    }
                                    maxLength={32}
                                    placeholder="Enter serial number"
                                />

                            </div>


                            {/* CUSTOMER NAME */}

                            <div className="one-search-field">

                                <label htmlFor="customerName">
                                    Customer Name
                                </label>

                                <input
                                    id="customerName"
                                    type="text"
                                    value={customerName}
                                    onChange={event =>
                                        setCustomerName(
                                            event.target.value
                                        )
                                    }
                                    maxLength={64}
                                    placeholder="Enter customer name"
                                />

                            </div>


                            {/* SEARCH BUTTON */}

                            <div className="one-search-button-wrapper">

                                <button
                                    type="submit"
                                    className="btn-search one-search-button"
                                    disabled={loading}
                                >

                                    {loading
                                        ? 'Searching...'
                                        : 'Search'
                                    }

                                </button>

                            </div>

                        </div>

                    </form>

                </div>


                {/* =================================
                    MESSAGE
                ================================= */}

                {message && (

                    <div
                        className={
                            messageType === 'error'
                                ? 'one-search-message one-search-error'
                                : 'one-search-message one-search-success'
                        }
                    >

                        {message}

                    </div>

                )}


                {/* =================================
                    RESULT SECTION
                ================================= */}

                <div className="one-search-box">


                    <div className="one-search-section-title">
                        Search Result
                    </div>


                    {!searchResult && !loading && (

                        <div className="one-search-no-result">

                            Enter a Ticket Number, Mobile Number,
                            Serial Number, or Customer Name and click Search.

                        </div>

                    )}


                    {loading && (

                        <div className="one-search-loading">

                            Searching...

                        </div>

                    )}


                    {searchResult && !loading && (

                        <div className="one-search-result-grid">


                            {/* =================================
                                CUSTOMER DETAILS
                            ================================= */}

                            <ResultField
                                label="Customer Name"
                                value={
                                    getValue(
                                        searchResult,
                                        'CustomerName'
                                    )
                                }
                            />

                            <ResultField
                                label="Customer Mobile Number"
                                value={
                                    getValue(
                                        searchResult,
                                        'CustomerMobileNumber'
                                    )
                                }
                            />

                            <ResultField
                                label="Alternate Number"
                                value={
                                    getValue(
                                        searchResult,
                                        'AltNumber'
                                    )
                                }
                            />

                            <ResultField
                                label="Email ID"
                                value={
                                    getValue(
                                        searchResult,
                                        'EmailId'
                                    )
                                }
                            />

                            <ResultField
                                label="Address"
                                value={
                                    getValue(
                                        searchResult,
                                        'Address'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 1
                            ================================= */}

                            <ResultField
                                label="Ticket No."
                                value={
                                    getValue(
                                        searchResult,
                                        'TicketNo'
                                    )
                                }
                            />

                            <ResultField
                                label="Call Type"
                                value={
                                    getValue(
                                        searchResult,
                                        'TicketCallType'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 2
                            ================================= */}

                            <ResultField
                                label="Product"
                                value={
                                    getValue(
                                        searchResult,
                                        'Product'
                                    )
                                }
                            />

                            <ResultField
                                label="Model"
                                value={
                                    getValue(
                                        searchResult,
                                        'Model'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 3
                            ================================= */}

                            <ResultField
                                label="Serial No."
                                value={
                                    getValue(
                                        searchResult,
                                        'ZZSERIAL_NUMB'
                                    )
                                }
                            />

                            <ResultField
                                label="Machine Status"
                                value={
                                    getValue(
                                        searchResult,
                                        'ZZMACHINE_STATUS'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 4
                            ================================= */}

                            <ResultField
                                label="DOP"
                                value={
                                    getValue(
                                        searchResult,
                                        'DOP'
                                    )
                                }
                            />

                            <ResultField
                                label="DOI"
                                value={
                                    getValue(
                                        searchResult,
                                        'ProductDOI'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 5
                            ================================= */}

                            <ResultField
                                label="Ticket Status"
                                value={
                                    getValue(
                                        searchResult,
                                        'TicketStatusCode'
                                    )
                                }
                            />

                            <ResultField
                                label="Call Book Date"
                                value={
                                    getValue(
                                        searchResult,
                                        'CallBookDateValue'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 6
                            ================================= */}

                            <ResultField
                                label="Branch"
                                value={
                                    getValue(
                                        searchResult,
                                        'BranchName'
                                    )
                                }
                            />

                            <ResultField
                                label="Franchise"
                                value={
                                    getValue(
                                        searchResult,
                                        'Franchise'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 7
                            ================================= */}

                            <ResultField
                                label="Branch Exe.Name"
                                value={
                                    getValue(
                                        searchResult,
                                        'Branch Exe Name'
                                    )
                                }
                            />

                            <ResultField
                                label="Technician Name"
                                value={
                                    getValue(
                                        searchResult,
                                        'TECHNICIAN'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 8
                            ================================= */}

                            <ResultField
                                label="Assign On"
                                value={
                                    getValue(
                                        searchResult,
                                        'ASSIGN_ON'
                                    )
                                }
                            />

                            <ResultField
                                label="Cancelled On"
                                value={
                                    getValue(
                                        searchResult,
                                        'CANCELLED_ON'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 9
                            ================================= */}

                            <ResultField
                                label="Soft Closer On"
                                value={
                                    getValue(
                                        searchResult,
                                        'Soft Closure Date'
                                    )
                                }
                            />

                            <ResultField
                                label="Closed On"
                                value={
                                    getValue(
                                        searchResult,
                                        'CLOSED_TIME'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 10
                            ================================= */}

                            <ResultField
                                label="Request Can.Date"
                                value={
                                    getValue(
                                        searchResult,
                                        'REQ_CAN_DA'
                                    )
                                }
                            />

                            <ResultField
                                label="Status Reason"
                                value={
                                    getValue(
                                        searchResult,
                                        'ZZSTATUS_REASON1'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 11
                            ================================= */}

                            <ResultField
                                label="Dealer Name"
                                value={
                                    getValue(
                                        searchResult,
                                        'DealerName'
                                    )
                                }
                            />

                            <ResultField
                                label="Service Type"
                                value={
                                    getValue(
                                        searchResult,
                                        'ServiceType'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 12
                            ================================= */}

                            <ResultField
                                label="Cancel Reason"
                                value={
                                    getValue(
                                        searchResult,
                                        'cancel_reason'
                                    )
                                }
                            />

                            <ResultField
                                label="Esclation Reason"
                                value={
                                    getValue(
                                        searchResult,
                                        'ESCLATION_LEVEL'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 13
                            ================================= */}

                            <ResultField
                                label="Medium/Source"
                                value={
                                    getValue(
                                        searchResult,
                                        'Orgin'
                                    )
                                }
                            />

                        </div>

                    )}

                </div>

            </div>

        </DashboardLayout>

    )
}


export default OneSearch
