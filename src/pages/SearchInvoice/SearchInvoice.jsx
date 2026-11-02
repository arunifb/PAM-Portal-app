import { useEffect, useState } from 'react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getInvoicePlants,
    searchInvoices,
    openInvoicePdf,
    updateInvoicePrintStatus
} from '../../api/invoiceApi'

import './SearchInvoice.css'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarDays } from 'lucide-react'


//Date Picker

function parseInvoiceDate(value) {
    if (!value) return null

    const [year, month, day] = value.split('-').map(Number)

    if (!year || !month || !day) return null

    const date = new Date(year, month - 1, day)

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null
    }

    return date
}

function formatInvoiceInputDate(date) {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function SearchInvoice() {
    const userId = sessionStorage.getItem('userId')

    const today = new Date()
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-')

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const sixMonthsAgoString = [
        sixMonthsAgo.getFullYear(),
        String(sixMonthsAgo.getMonth() + 1).padStart(2, '0'),
        String(sixMonthsAgo.getDate()).padStart(2, '0')
    ].join('-')

    const [plants, setPlants] = useState([])
    const [filters, setFilters] = useState({
        plant: '',
        invoiceNo: '',
        invoiceType: '',
        fromDate: todayString,
        toDate: todayString
    })

    const [invoices, setInvoices] = useState([])
    const [selectedInvoices, setSelectedInvoices] = useState([])
    const [loadingPlants, setLoadingPlants] = useState(true)
    const [searching, setSearching] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // =========================================
    // LOAD PLANTS
    // =========================================

    useEffect(() => {
        let active = true

        async function loadPlants() {
            try {
                setLoadingPlants(true)
                setError('')

                if (!userId) {
                    throw new Error(
                        'User information is missing. Please log in again.'
                    )
                }

                const data = await getInvoicePlants(userId)

                if (active) {
                    setPlants(
                        Array.isArray(data)
                            ? data
                            : []
                    )
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.message || 'Unable to load plants.'
                    )
                }
            } finally {
                if (active) {
                    setLoadingPlants(false)
                }
            }
        }

        loadPlants()

        return () => {
            active = false
        }
    }, [userId])

    // =========================================
    // FILTER CHANGE
    // =========================================

    function handleFilterChange(event) {
        const { name, value } = event.target

        setFilters(previous => ({
            ...previous,
            [name]: value
        }))
    }

    // =========================================
    // SEARCH INVOICES
    // =========================================

    async function handleSearch(event) {
        event.preventDefault()

        setError('')
        setMessage('')
        setSelectedInvoices([])

        if (!userId) {
            setError('User information is missing. Please log in again.')
            return
        }

        if (
            filters.fromDate &&
            filters.toDate &&
            filters.fromDate > filters.toDate
        ) {
            setError(
                'Invoice From Date cannot be later than Invoice To Date.'
            )
            return
        }

        try {
            setSearching(true)

            const formatDate = value => {
                if (!value) return ''

                const [year, month, day] = value.split('-')

                return `${day}/${month}/${year}`
            }

            const data = await searchInvoices({
                userId,
                invoiceNo: filters.invoiceNo,
                plant: filters.plant,
                invoiceType: filters.invoiceType,
                fromDate: formatDate(filters.fromDate),
                toDate: formatDate(filters.toDate)
            })

            setInvoices(
                Array.isArray(data)
                    ? data
                    : []
            )

            if (!Array.isArray(data) || data.length === 0) {
                setMessage('No data found!!!!')
            }
        } catch (err) {
            setInvoices([])
            setError(
                err.message || 'Unable to search invoices.'
            )
        } finally {
            setSearching(false)
        }
    }

    // =========================================
    // SELECT / DESELECT ALL
    // =========================================

    function handleSelectAll(event) {
        if (event.target.checked) {
            setSelectedInvoices(
                invoices.map((invoice, index) =>
                    getInvoiceKey(invoice, index)
                )
            )
        } else {
            setSelectedInvoices([])
        }
    }

    function handleSelectInvoice(key) {
        setSelectedInvoices(previous =>
            previous.includes(key)
                ? previous.filter(item => item !== key)
                : [...previous, key]
        )
    }

    function getInvoiceKey(invoice, index) {
        return `${invoice.InvoiceNo ?? invoice.invoiceNo ?? ''}_${invoice.InvName ?? invoice.invName ?? ''}_${index}`
    }

    // =========================================
    // VIEW / DOWNLOAD PDF
    // =========================================

    async function handleView(invoice) {
        try {
            setError('')

            await openInvoicePdf(
                invoice.InvName ?? invoice.invName,
                false
            )
        } catch (err) {
            setError(
                err.message || 'Unable to open invoice.'
            )
        }
    }

    async function handleDownload(invoice) {
        try {
            setError('')

            await openInvoicePdf(
                invoice.InvName ?? invoice.invName,
                true
            )
        } catch (err) {
            setError(
                err.message || 'Unable to download invoice.'
            )
        }
    }

    // =========================================
    // PRINT SELECTED
    // =========================================

    async function handlePrintSelected() {
        if (selectedInvoices.length === 0) {
            setError('Please select at least one invoice.')
            return
        }

        setError('')
        setMessage(
            'Bulk PDF merge is not available in the current API. Selected invoices have not been merged.'
        )
    }

    // =========================================
    // PRINT SINGLE INVOICE
    // =========================================

    async function handlePrint(invoice) {
        const fileName = invoice.InvName ?? invoice.invName
        const invoiceNo = invoice.InvoiceNo ?? invoice.invoiceNo
        const isPrint = invoice.IsPrint ?? invoice.isPrint

        if (isPrint === 'Y') {
            setError('Printing is disabled for this invoice.')
            return
        }

        try {
            setError('')

            await openInvoicePdf(fileName, false)

            // Use the invoice number, not the PDF filename.
            await updateInvoicePrintStatus(invoiceNo)

            setInvoices(previous =>
                previous.map(item => {
                    const currentNo =
                        item.InvoiceNo ?? item.invoiceNo

                    return currentNo === invoiceNo
                        ? { ...item, IsPrint: 'Y' }
                        : item
                })
            )
        } catch (err) {
            setError(
                err.message || 'Unable to print invoice.'
            )
        }
    }

    // =========================================
    // FORMAT INVOICE DATE
    // =========================================

    function formatInvoiceDate(value) {
        if (!value) return ''

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return value
        }

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/ /g, '-')
    }

    // =========================================
    // RENDER
    // =========================================

    return (
        <DashboardLayout title="Search Invoice With Digital Signature">
            <div className="search-invoice-page">
                

                <form
                    className="search-invoice-form"
                    onSubmit={handleSearch}
                >
                    <div className="invoice-filter-grid">
                        <div className="invoice-field">
                            <label htmlFor="plant">Plant</label>

                            <select
                                id="plant"
                                name="plant"
                                value={filters.plant}
                                onChange={handleFilterChange}
                                disabled={loadingPlants}
                            >
                                <option value="">All</option>

                                {plants.map((plant, index) => {
                                    const value =
                                        typeof plant === 'string'
                                            ? plant
                                            : plant.Plant ??
                                              plant.plant ??
                                              ''

                                    return (
                                        <option
                                            key={`${value}_${index}`}
                                            value={value}
                                        >
                                            {value}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>

                        <div className="invoice-field">
                            <label htmlFor="invoiceNo">
                                Invoice Number
                            </label>

                            <input
                                id="invoiceNo"
                                name="invoiceNo"
                                type="text"
                                maxLength={10}
                                value={filters.invoiceNo}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="invoice-field">
                            <label htmlFor="invoiceType">
                                Invoice Type
                            </label>

                            <select
                                id="invoiceType"
                                name="invoiceType"
                                value={filters.invoiceType}
                                onChange={handleFilterChange}
                            >
                                <option value="">All</option>
                                <option value="Org">Org</option>
                                <option value="All">All</option>
                            </select>
                        </div>

                        <div className="invoice-field">
                            <label htmlFor="fromDate">Invoice From Date</label>

                            <div className="invoice-date-picker-container">
                                <DatePicker
                                    id="fromDate"
                                    selected={parseInvoiceDate(filters.fromDate)}
                                    onChange={date => {
                                        const value = formatInvoiceInputDate(date)

                                        setFilters(previous => ({
                                            ...previous,
                                            fromDate: value,
                                            toDate:
                                                value &&
                                                previous.toDate &&
                                                previous.toDate < value
                                                    ? value
                                                    : previous.toDate
                                        }))
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="dd/mm/yyyy"
                                    minDate={parseInvoiceDate(sixMonthsAgoString)}
                                    maxDate={parseInvoiceDate(todayString)}
                                    className="invoice-date-control"
                                    calendarClassName="invoice-calendar"
                                    showPopperArrow={false}
                                    autoComplete="off"
                                    isClearable={false}
                                    popperPlacement="bottom-start"
                                />

                                <button
                                    type="button"
                                    className="invoice-calendar-icon"
                                    aria-label="Open Invoice From Date calendar"
                                    onClick={event => {
                                        const input = event.currentTarget
                                            .parentElement
                                            .querySelector('input')

                                        input?.focus()
                                        input?.click()
                                    }}
                                >
                                    <CalendarDays size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="invoice-field">
                            <label htmlFor="toDate">Invoice To Date</label>

                            <div className="invoice-date-picker-container">
                                <DatePicker
                                    id="toDate"
                                    selected={parseInvoiceDate(filters.toDate)}
                                    onChange={date => {
                                        setFilters(previous => ({
                                            ...previous,
                                            toDate: formatInvoiceInputDate(date)
                                        }))
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="dd/mm/yyyy"
                                    minDate={
                                        parseInvoiceDate(filters.fromDate) ||
                                        parseInvoiceDate(sixMonthsAgoString)
                                    }
                                    maxDate={parseInvoiceDate(todayString)}
                                    className="invoice-date-control"
                                    calendarClassName="invoice-calendar"
                                    showPopperArrow={false}
                                    autoComplete="off"
                                    isClearable={false}
                                    popperPlacement="bottom-end"
                                />

                                <button
                                    type="button"
                                    className="invoice-calendar-icon"
                                    aria-label="Open Invoice To Date calendar"
                                    onClick={event => {
                                        const input = event.currentTarget
                                            .parentElement
                                            .querySelector('input')

                                        input?.focus()
                                        input?.click()
                                    }}
                                >
                                    <CalendarDays size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="invoice-search-actions">
                        <button
                            type="submit"
                            className="btn-search invoice-btn invoice-btn-primary"
                            disabled={searching || loadingPlants}
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="invoice-alert invoice-alert-error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="invoice-alert invoice-alert-info">
                        {message}
                    </div>
                )}

                <div className="invoice-results">
                    <div className="invoice-results-header">
                        <h3>Invoice List</h3>

                        <button
                            type="button"
                            className="invoice-btn invoice-btn-primary"
                            onClick={handlePrintSelected}
                            disabled={selectedInvoices.length === 0}
                        >
                            Print Selected
                        </button>
                    </div>

                    <div className="invoice-table-wrapper">
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            aria-label="Select all invoices"
                                            checked={
                                                invoices.length > 0 &&
                                                selectedInvoices.length === invoices.length
                                            }
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th>Invoice No</th>
                                    <th>Plant</th>
                                    <th>Customer Name</th>
                                    <th>File Name</th>
                                    <th>Status</th>
                                    <th>Invoice Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="invoice-empty"
                                        >
                                            {searching
                                                ? 'Loading invoices...'
                                                : 'No data found!!!!'}
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice, index) => {
                                        const key =
                                            getInvoiceKey(invoice, index)

                                        const invoiceNo =
                                            invoice.InvoiceNo ??
                                            invoice.invoiceNo ??
                                            ''

                                        const isPrint =
                                            invoice.IsPrint ??
                                            invoice.isPrint ??
                                            ''

                                        return (
                                            <tr key={key}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Select invoice ${invoiceNo}`}
                                                        checked={selectedInvoices.includes(key)}
                                                        onChange={() =>
                                                            handleSelectInvoice(key)
                                                        }
                                                    />
                                                </td>

                                                <td>{invoiceNo}</td>

                                                <td>
                                                    {invoice.Plant ??
                                                        invoice.plant ??
                                                        ''}
                                                </td>

                                                <td>
                                                    {invoice.Cust_Name ??
                                                        invoice.cust_Name ??
                                                        ''}
                                                </td>

                                                <td>
                                                    {invoice.InvName ??
                                                        invoice.invName ??
                                                        ''}
                                                </td>

                                                <td>
                                                    {isPrint === 'Y'
                                                        ? 'Print Option Disabled'
                                                        : invoice.Status ??
                                                          invoice.status ??
                                                          ''}
                                                </td>

                                                <td>
                                                    {formatInvoiceDate(
                                                        invoice.Inv_Date ??
                                                        invoice.inv_Date
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="invoice-row-actions">
                                                        <button
                                                            type="button"
                                                            title="View PDF"
                                                            onClick={() =>
                                                                handleView(invoice)
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Download PDF"
                                                            onClick={() =>
                                                                handleDownload(invoice)
                                                            }
                                                        >
                                                            Download
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Print invoice"
                                                            disabled={isPrint === 'Y'}
                                                            onClick={() =>
                                                                handlePrint(invoice)
                                                            }
                                                        >
                                                            Print
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default SearchInvoice