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
// SEARCH CAPTURE EVIDENCE
// =========================================

export async function searchEvidence(
    ticketNo,
    branchCode,
    franchiseCode
) {
    const response = await authFetch(
        `${API_BASE_URL}/api/Evidence/search`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                ticketNo: ticketNo.trim(),
                branchCode,
                franchiseCode
            })
        }
    )

    const data = await readResponse(response)

    if (!response.ok || data.isSuccess === false) {
        throw new Error(
            data.message ||
            'Unable to search evidence.'
        )
    }

    return data
}