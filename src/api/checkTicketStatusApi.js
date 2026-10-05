import API_BASE_URL, { authFetch } from './api'

// =====================================================
// COMMON RESPONSE HANDLER
// =====================================================

async function readResponse(response) {
    const responseText = await response.text()

    let data = {}

    if (responseText) {
        try {
            data = JSON.parse(responseText)
        } catch {
            throw new Error('Server returned an invalid response.')
        }
    }

    return data
}

// =====================================================
// UPLOAD TICKET STATUS EXCEL FILE
// POST /api/CheckTicketStatus/upload
// =====================================================

export async function uploadCheckTicketStatus(file) {
    if (!file) {
        throw new Error('Please select a file.')
    }

    const formData = new FormData()

    formData.append('file', file)

    const response = await authFetch(
        `${API_BASE_URL}/api/CheckTicketStatus/upload`,
        {
            method: 'POST',
            body: formData
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.Message ||
            data.message ||
            'Unable to upload ticket status file.'
        )
    }

    if (data.IsSuccess === false || data.isSuccess === false) {
        throw new Error(
            data.Message ||
            data.message ||
            'Unable to process ticket status file.'
        )
    }

    return data
}

// =====================================================
// EXPORT TICKET STATUS REPORT
// POST /api/CheckTicketStatus/export
// =====================================================

export async function exportCheckTicketStatus(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('No data available to download.')
    }

    const response = await authFetch(
        `${API_BASE_URL}/api/CheckTicketStatus/export`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rows: rows
            })
        }
    )

    if (!response.ok) {
        const data = await readResponse(response)

        throw new Error(
            data.Message ||
            data.message ||
            'Unable to download ticket status report.'
        )
    }

    return await response.blob()
}