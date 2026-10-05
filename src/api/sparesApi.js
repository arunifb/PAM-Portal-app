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
// GET MODEL NAMES
// GET /api/Spares/models?term=
// =====================================================

export async function getModelNames(term) {
    if (!term || term.trim().length < 2) {
        return []
    }

    const params = new URLSearchParams()
    params.append('term', term.trim())

    const response = await authFetch(
        `${API_BASE_URL}/api/Spares/models?${params.toString()}`,
        {
            method: 'GET'
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to load model names.'
        )
    }

    return Array.isArray(data) ? data : []
}

// =====================================================
// VERIFY AIR FRY MAPPING
// GET /api/Spares/verify-airfry?modelName=
// =====================================================

export async function verifyAirFryMapping(modelName) {
    if (!modelName) {
        return false
    }

    const params = new URLSearchParams()
    params.append('modelName', modelName)

    const response = await authFetch(
        `${API_BASE_URL}/api/Spares/verify-airfry?${params.toString()}`,
        {
            method: 'GET'
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to verify Air Fry mapping.'
        )
    }

    return data === true
}

// =====================================================
// GET SPARE CODES
// GET /api/Spares/codes?term=
// =====================================================

export async function getSpareCodes(term) {
    if (!term || term.trim().length < 2) {
        return []
    }

    const params = new URLSearchParams()
    params.append('term', term.trim())

    const response = await authFetch(
        `${API_BASE_URL}/api/Spares/codes?${params.toString()}`,
        {
            method: 'GET'
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to load spare codes.'
        )
    }

    return Array.isArray(data) ? data : []
}

// =====================================================
// GET SPARE DESCRIPTIONS
// GET /api/Spares/descriptions
// =====================================================

export async function getSpareDescriptions(
    desc,
    material,
    variant = 'Select'
) {
    if (!desc || desc.trim().length < 2) {
        return []
    }

    const params = new URLSearchParams()

    params.append('desc', desc.trim())
    params.append('material', material || '')
    params.append('variant', variant || 'Select')

    const response = await authFetch(
        `${API_BASE_URL}/api/Spares/descriptions?${params.toString()}`,
        {
            method: 'GET'
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to load spare descriptions.'
        )
    }

    return Array.isArray(data) ? data : []
}

// =====================================================
// GET SPARE INFO
// GET /api/Spares/info
// =====================================================

export async function getSpareInfo(spareDesc, material) {
    const params = new URLSearchParams()

    params.append('sparedesc', spareDesc || '')
    params.append('material', material || '')

    const response = await authFetch(
        `${API_BASE_URL}/api/Spares/info?${params.toString()}`,
        {
            method: 'GET'
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to load spare information.'
        )
    }

    return data
}

// =====================================================
// GET SPARE + COMPATIBLE MODELS BY CODE
// GET /api/Spares/info-by-code
// =====================================================

export async function getSpareInfoByCode(spareCode) {
    const params = new URLSearchParams()

    params.append('sparecode', spareCode || '')

    const response = await authFetch(
        `${API_BASE_URL}/api/Spares/info-by-code?${params.toString()}`,
        {
            method: 'GET'
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to load spare information.'
        )
    }

    return data
}