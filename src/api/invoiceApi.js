import API_BASE_URL, { authFetch } from './api'

// =========================================
// READ API RESPONSE SAFELY
// =========================================

async function readResponse(response) {
    const responseText = await response.text()

    let data = {}

    if (responseText) {
        try {
            data = JSON.parse(responseText)
        } catch {
            throw new Error(
                'Server returned an invalid response.'
            )
        }
    }

    return data
}

// =========================================
// GET PLANTS BY USER
// =========================================

export async function getInvoicePlants(userId) {
    const response = await authFetch(
        `${API_BASE_URL}/api/Invoice/plants/${encodeURIComponent(userId)}`
    )

    const data = await readResponse(response)

    if (!response.ok || data.isSuccess === false) {
        throw new Error(
            data.message || 'Unable to load plants.'
        )
    }

    return data.data ?? data.Data ?? []
}

// =========================================
// SEARCH INVOICES
// =========================================

export async function searchInvoices(filters) {
    const response = await authFetch(
        `${API_BASE_URL}/api/Invoice/search`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                UserId: Number(filters.userId),
                InvoiceNo: filters.invoiceNo?.trim() || '',
                Plant: filters.plant || '',
                InvoiceType: filters.invoiceType || '',
                FromDate: filters.fromDate || '',
                ToDate: filters.toDate || ''
            })
        }
    )

    const data = await readResponse(response)

    if (!response.ok || data.isSuccess === false) {
        throw new Error(
            data.message || 'Unable to search invoices.'
        )
    }

    return data.data ?? data.Data ?? []
}

// =========================================
// OPEN OR DOWNLOAD INVOICE PDF
// =========================================

export async function openInvoicePdf(fileName, download = false) {
    if (!fileName) {
        throw new Error('Invoice file name is missing.')
    }

    const params = new URLSearchParams({
        file: fileName,
        inline: String(!download)
    })

    const response = await authFetch(
        `${API_BASE_URL}/api/Invoice/download?${params.toString()}`,
        {
            headers: {
                Accept: 'application/pdf'
            }
        }
    )

    if (!response.ok) {
        const data = await readResponse(response)

        throw new Error(
            data.message || 'Unable to open invoice PDF.'
        )
    }

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    if (download) {
        const link = document.createElement('a')

        link.href = blobUrl
        link.download = fileName

        document.body.appendChild(link)
        link.click()
        link.remove()

        setTimeout(() => {
            URL.revokeObjectURL(blobUrl)
        }, 1000)

        return
    }

    const openedWindow = window.open(blobUrl, '_blank')

    if (!openedWindow) {
        URL.revokeObjectURL(blobUrl)

        throw new Error(
            'The PDF window was blocked. Please allow pop-ups and try again.'
        )
    }

    setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
    }, 60000)
}

// =========================================
// UPDATE PRINT STATUS
// =========================================

export async function updateInvoicePrintStatus(invoiceNo) {
    const response = await authFetch(
        `${API_BASE_URL}/api/Invoice/print-status`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                InvoiceNo: invoiceNo
            })
        }
    )

    const data = await readResponse(response)

    if (!response.ok || data.isSuccess === false) {
        throw new Error(
            data.message || 'Unable to update invoice print status.'
        )
    }

    return data
}