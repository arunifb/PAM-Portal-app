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
// SEARCH TECHNICIANS
// GET /api/Technician/search
// =====================================================

export async function searchTechnicians(searchData) {
    const params = new URLSearchParams()

    params.append('regionCode', searchData.regionCode || '')
    params.append('branchCode', searchData.branchCode || '')
    params.append('franchiseCode', searchData.franchiseCode || '')
    params.append('name', searchData.name || '')
    params.append('mobileNo', searchData.mobileNo || '')
    params.append('status', searchData.status ?? '')
    params.append('roleId', searchData.roleId || 1)

    const response = await authFetch(
        `${API_BASE_URL}/api/Technician/search?${params.toString()}`,
        {
            method: 'GET'
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to load technician data.'
        )
    }

    return data
}

// =====================================================
// EXPORT / DOWNLOAD TECHNICIANS
// GET /api/Technician/export
// =====================================================

export async function exportTechnicians(searchData) {
    const params = new URLSearchParams()

    params.append('regionCode', searchData.regionCode || '')
    params.append('branchCode', searchData.branchCode || '')
    params.append('franchiseCode', searchData.franchiseCode || '')
    params.append('name', searchData.name || '')
    params.append('mobileNo', searchData.mobileNo || '')
    params.append('status', searchData.status ?? '')
    params.append('roleId', searchData.roleId || 1)

    const response = await authFetch(
        `${API_BASE_URL}/api/Technician/export?${params.toString()}`,
        {
            method: 'GET'
        }
    )

    if (!response.ok) {
        const data = await readResponse(response)

        throw new Error(
            data.message || 'Unable to download technician data.'
        )
    }

    return await response.blob()
}

// =====================================================
// REALLOCATE TECHNICIAN
// POST /api/Technician/reallocate
// =====================================================

export async function reallocateTechnician(techId, franchiseCode) {
    const response = await authFetch(
        `${API_BASE_URL}/api/Technician/reallocate`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                techId: Number(techId),
                franchiseCode: franchiseCode
            })
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to reallocate technician.'
        )
    }

    return data
}

// =====================================================
// GENERATE PARTNER ID
// POST /api/Technician/generate-partner-id
// =====================================================

export async function generatePartnerId(techId) {
    const response = await authFetch(
        `${API_BASE_URL}/api/Technician/generate-partner-id`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                techId: Number(techId)
            })
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to generate partner ID.'
        )
    }

    return data
}