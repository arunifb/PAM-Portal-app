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
// GET ALL SUPERSESSION MATERIALS
// GET /api/Supersession
// =====================================================

export async function getSupersessionMaterials() {
    const response = await authFetch(
        `${API_BASE_URL}/api/Supersession`,
        {
            method: 'GET'
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to load supersession data.'
        )
    }

    return Array.isArray(data.data)
        ? data.data
        : []
}

// =====================================================
// PREVIEW EXCEL FILE
// POST /api/Supersession/preview
// =====================================================

export async function previewSupersession(file) {
    if (!file) {
        throw new Error('Please select a file to upload.')
    }

    const formData = new FormData()

    formData.append('file', file)

    const response = await authFetch(
        `${API_BASE_URL}/api/Supersession/preview`,
        {
            method: 'POST',
            body: formData
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to preview the Excel file.'
        )
    }

    return {
        message: data.message || '',
        rows: Array.isArray(data.data)
            ? data.data
            : []
    }
}

// =====================================================
// SAVE SUPERSESSION MATERIALS
// POST /api/Supersession/save
// =====================================================

export async function saveSupersessionMaterials(
    materials
) {
    if (!Array.isArray(materials) || materials.length === 0) {
        throw new Error(
            'No data available to insert.'
        )
    }

    const response = await authFetch(
        `${API_BASE_URL}/api/Supersession/save`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                materials
            })
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to insert supersession data.'
        )
    }

    return data
}