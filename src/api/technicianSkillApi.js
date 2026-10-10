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
// HANDLE API RESPONSE
// =========================================

async function handleResponse(response, defaultMessage) {
    const data = await readResponse(response)

    if (!response.ok) {
        const errorMessage =
            typeof data === 'string'
                ? data
                : data.message ||
                  data.title ||
                  defaultMessage

        throw new Error(errorMessage)
    }

    return data
}

// =========================================
// GET TECHNICIAN SKILL MATRIX
// GET: /api/Technician/skills
// =========================================

export async function getTechnicianSkillMatrix(franchiseCode) {
    if (!franchiseCode) {
        throw new Error('Please select a franchise.')
    }

    const url =
        `${API_BASE_URL}/api/Technician/skills` +
        `?franchiseCode=${encodeURIComponent(franchiseCode)}`

    const response = await authFetch(url)

    return await handleResponse(
        response,
        'Unable to load technician skill matrix.'
    )
}

// =========================================
// SAVE TECHNICIAN SKILL MATRIX
// POST: /api/Technician/skills
// =========================================

export async function saveTechnicianSkillMatrix(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('No skill scores supplied.')
    }

    const requestBody = {
        items: items.map(item => ({
            techId: Number(item.techId),
            productCode: String(item.productCode ?? ''),
            score: String(item.score ?? '')
        }))
    }

    const response = await authFetch(
        `${API_BASE_URL}/api/Technician/skills`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }
    )

    return await handleResponse(
        response,
        'Unable to save technician skill scores.'
    )
}