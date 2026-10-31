
import API_BASE_URL, { authFetch } from './api'

// Read API response safely
async function readResponse(response) {
    const responseText = await response.text()

    if (!responseText) {
        return {}
    }

    try {
        return JSON.parse(responseText)
    } catch {
        throw new Error('Server returned an invalid response.')
    }
}

// GET STATES
export async function getFranchiseStates() {
    const response = await authFetch(
        `${API_BASE_URL}/api/FranchiseMaster/states`
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load states.')
    }

    return data
}

// GET CITIES BY STATE
export async function getFranchiseCities(stateCode) {
    const response = await authFetch(
        `${API_BASE_URL}/api/FranchiseMaster/cities?stateCode=${encodeURIComponent(stateCode)}`
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load cities.')
    }

    return data
}

// GET FRANCHISE LIST BY BRANCH
export async function getFranchiseList(bpCode) {
    const response = await authFetch(
        `${API_BASE_URL}/api/FranchiseMaster/list?bpCode=${encodeURIComponent(bpCode)}`
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load franchise list.')
    }

    return data
}

// SAVE FRANCHISE
export async function saveFranchise(request) {
    const response = await authFetch(
        `${API_BASE_URL}/api/FranchiseMaster`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(data.message || 'Unable to save franchise.')
    }

    return data
}

// SEARCH FRANCHISES

export async function searchFranchises(request) {
    const activeValue = request.Active ?? request.IsActive ?? null

    const response = await authFetch(
        `${API_BASE_URL}/api/FranchiseMaster/search`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                FrCode: request.FrCode || '',
                FranchiseName: request.FranchiseName || '',
                BrCode: request.BPCode || request.BrCode || '',
                StateCode: request.StateCode || '',
                CityCode: request.CityCode || '',
                PhoneNo: request.PhoneNo || '',
                MobileNo: request.Mobile || request.MobileNo || '',
                Email: request.EmailID || request.Email || '',
                IsActive: activeValue == null || activeValue === ''
    ? ''
    : activeValue
            })
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to search franchises.'
        )
    }

    if (data.isSuccess === false) {
        throw new Error(
            data.message || 'Franchise search failed.'
        )
    }

    return data
}


// =============================================
// UPDATE FRANCHISE STATUS
// POST /api/FranchiseMaster/status
// =============================================

export async function updateFranchiseStatus(request) {
    const response = await authFetch(
        `${API_BASE_URL}/api/FranchiseMaster/status`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }
    )

    const data = await readResponse(response)

    if (!response.ok || data.isSuccess === false) {
        throw new Error(
            data.message || 'Unable to update franchise status.'
        )
    }

    return data
}

