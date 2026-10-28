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


// =========================================
// DOWNLOAD TECHNICIAN SKILL SET
// GET: /api/Technician/skillset/download
// =========================================

export async function downloadTechnicianSkillSet(branchCode, franchiseCode) {
    if (!branchCode || !franchiseCode) {
        throw new Error('Please select a branch and franchise.')
    }

    // Build API query parameters.
    const params = new URLSearchParams({
        branchCode: String(branchCode),
        frCode: String(franchiseCode)
    })

    // Call the download API.
    const response = await authFetch(
        `${API_BASE_URL}/api/Technician/skillset/download?${params.toString()}`
    )

    // Handle API errors.
    if (!response.ok) {
        const responseText = await response.text()
        let errorMessage = 'Unable to download technician skill set.'

        if (responseText) {
            try {
                const data = JSON.parse(responseText)

                errorMessage =
                    typeof data === 'string'
                        ? data
                        : data.message ||
                          data.title ||
                          errorMessage
            } catch {
                errorMessage = responseText
            }
        }

        throw new Error(errorMessage)
    }

    // Generate timestamp in yyyyMMddHHmmss format.
    const now = new Date()

    const timestamp =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0')

    // Generate dynamic filename.
    const fileName =
        `CertificationReport_${franchiseCode}_${timestamp}.xlsx`

    // Read the Excel file returned by the backend.
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)

    // Trigger browser download.
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName

    document.body.appendChild(link)
    link.click()
    link.remove()

    // Release the temporary URL.
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
}