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
            !customerName.trim()
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
    //
    // Old WebForms page called btnSearch_Click
    // on first load when session values existed.
    //
    // We intentionally do not auto-search here
    // because the old search fields are empty and
    // the old validation would immediately show:
    // "You must enter at least one field!"
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

        return (

            <div className="one-search-result-field">

                <label>
                    {label}
                </label>

                <input
                    type="text"
                    value={value ?? ''}
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

                    {/* <div className="one-search-section-title">
                        One Search
                    </div> */}


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
                                    className="one-search-button"
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

                            Enter a Ticket Number, Serial Number,
                            or Customer Name and click Search.

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
                                ROW 1
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
                                label="Ticket No."
                                value={
                                    getValue(
                                        searchResult,
                                        'TicketNo'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 2
                            ================================= */}

                            <ResultField
                                label="Call Type"
                                value={
                                    getValue(
                                        searchResult,
                                        'TicketCallType'
                                    )
                                }
                            />

                            <ResultField
                                label="Product"
                                value={
                                    getValue(
                                        searchResult,
                                        'Product'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 3
                            ================================= */}

                            <ResultField
                                label="Model"
                                value={
                                    getValue(
                                        searchResult,
                                        'Model'
                                    )
                                }
                            />

                            <ResultField
                                label="Serial No."
                                value={
                                    getValue(
                                        searchResult,
                                        'ZZSERIAL_NUMB'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 4
                            ================================= */}

                            <ResultField
                                label="Machine Status"
                                value={
                                    getValue(
                                        searchResult,
                                        'ZZMACHINE_STATUS'
                                    )
                                }
                            />

                            <ResultField
                                label="DOP"
                                value={
                                    getValue(
                                        searchResult,
                                        'DOP'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 5
                            ================================= */}

                            <ResultField
                                label="DOI"
                                value={
                                    getValue(
                                        searchResult,
                                        'ProductDOI'
                                    )
                                }
                            />

                            <ResultField
                                label="Ticket Status"
                                value={
                                    getValue(
                                        searchResult,
                                        'TicketStatusCode'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 6
                            ================================= */}

                            <ResultField
                                label="Call Book Date"
                                value={
                                    getValue(
                                        searchResult,
                                        'CallBookDateValue'
                                    )
                                }
                            />

                            <ResultField
                                label="Branch"
                                value={
                                    getValue(
                                        searchResult,
                                        'BranchName'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 7
                            ================================= */}

                            <ResultField
                                label="Franchise"
                                value={
                                    getValue(
                                        searchResult,
                                        'Franchise'
                                    )
                                }
                            />

                            <ResultField
                                label="Branch Exe.Name"
                                value={
                                    getValue(
                                        searchResult,
                                        'Branch Exe Name'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 8
                            ================================= */}

                            <ResultField
                                label="Technician Name"
                                value={
                                    getValue(
                                        searchResult,
                                        'TECHNICIAN'
                                    )
                                }
                            />

                            <ResultField
                                label="Assign On"
                                value={
                                    getValue(
                                        searchResult,
                                        'ASSIGN_ON'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 9
                            ================================= */}

                            <ResultField
                                label="Cancelled On"
                                value={
                                    getValue(
                                        searchResult,
                                        'CANCELLED_ON'
                                    )
                                }
                            />

                            <ResultField
                                label="Soft Closer On"
                                value={
                                    getValue(
                                        searchResult,
                                        'Soft Closure Date'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 10
                            ================================= */}

                            <ResultField
                                label="Closed On"
                                value={
                                    getValue(
                                        searchResult,
                                        'CLOSED_TIME'
                                    )
                                }
                            />

                            <ResultField
                                label="Request Can.Date"
                                value={
                                    getValue(
                                        searchResult,
                                        'REQ_CAN_DA'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 11
                            ================================= */}

                            <ResultField
                                label="Status Reason"
                                value={
                                    getValue(
                                        searchResult,
                                        'ZZSTATUS_REASON1'
                                    )
                                }
                            />

                            <ResultField
                                label="Dealer Name"
                                value={
                                    getValue(
                                        searchResult,
                                        'DealerName'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 12
                            ================================= */}

                            <ResultField
                                label="Service Type"
                                value={
                                    getValue(
                                        searchResult,
                                        'ServiceType'
                                    )
                                }
                            />

                            <ResultField
                                label="Cancel Reason"
                                value={
                                    getValue(
                                        searchResult,
                                        'cancel_reason'
                                    )
                                }
                            />


                            {/* =================================
                                ROW 13
                            ================================= */}

                            <ResultField
                                label="Esclation Reason"
                                value={
                                    getValue(
                                        searchResult,
                                        'ESCLATION_LEVEL'
                                    )
                                }
                            />

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