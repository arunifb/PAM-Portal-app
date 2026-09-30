import API_BASE_URL, { authFetch } from './api'

function parseResponse(text) {
    if (!text) {
        return null
    }

    try {
        return JSON.parse(text)
    } catch {
        throw new Error(
            'Invalid response received from Digital Contract API.'
        )
    }
}

// =========================================
// SEARCH DIGITAL CONTRACT
// =========================================

export async function searchDigitalContracts(request) {
    const params = new URLSearchParams({
        icrNo: request.icrNo || '',
        regionCode: request.regionCode || '',
        branchCode: request.branchCode || '',
        franchiseCode: request.franchiseCode || '',
        refId: request.refId
            ? String(request.refId)
            : '0',
        status: request.status || '',
        icrType: request.icrType || '',
        fromDate: request.fromDate || '',
        toDate: request.toDate || ''
    })

    const response = await authFetch(
        `${API_BASE_URL}/api/DigitalContract/search?${params.toString()}`
    )

    const text = await response.text()

    const data = parseResponse(text)

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to search digital contract details.'
        )
    }

    if (!data?.isSuccess) {
        throw new Error(
            data?.message ||
            'Digital contract search failed.'
        )
    }

    return data
}

// =========================================
// EXPORT DIGITAL CONTRACT
// =========================================

export async function exportDigitalContracts(request) {
    const params = new URLSearchParams({
        icrNo: request.icrNo || '',
        regionCode: request.regionCode || '',
        branchCode: request.branchCode || '',
        franchiseCode: request.franchiseCode || '',
        refId: request.refId
            ? String(request.refId)
            : '0',
        status: request.status || '',
        icrType: request.icrType || '',
        fromDate: request.fromDate || '',
        toDate: request.toDate || ''
    })

    const response = await authFetch(
        `${API_BASE_URL}/api/DigitalContract/export?${params.toString()}`
    )

    if (!response.ok) {
        const text = await response.text()
        const data = parseResponse(text)

        throw new Error(
            data?.message ||
            'Unable to download digital contract details.'
        )
    }

    return await response.blob()
}

// =========================================
// RESEND REQUEST
// =========================================

export async function resendDigitalContractRequest(
    refId,
    updatedBy
) {
    const response = await authFetch(
        `${API_BASE_URL}/api/DigitalContract/resend-request`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refId,
                updatedBy
            })
        }
    )

    const text = await response.text()

    const data = parseResponse(text)

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to resend digital contract request.'
        )
    }

    if (!data?.isSuccess) {
        throw new Error(
            data?.message ||
            'Digital contract request failed.'
        )
    }

    return data
}

// =========================================
// RESEND RECEIPT
// =========================================

export async function resendDigitalReceipt(
    refId
) {
    const response = await authFetch(
        `${API_BASE_URL}/api/DigitalContract/resend-receipt`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refId,
                updatedBy: 0
            })
        }
    )

    const text = await response.text()

    const data = parseResponse(text)

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to resend digital receipt.'
        )
    }

    if (!data?.isSuccess) {
        throw new Error(
            data?.message ||
            'Digital receipt resend failed.'
        )
    }

    return data
}

// =========================================
// GET REGIONS
// =========================================

export async function getDigitalContractRegions(
    regionCode = ''
) {
    const params = new URLSearchParams()

    if (regionCode) {
        params.set(
            'regionCode',
            regionCode
        )
    }

    const query =
        params.toString()

    const response = await authFetch(
        `${API_BASE_URL}/api/Reports/regions${query ? `?${query}` : ''}`
    )

    const text =
        await response.text()

    const data =
        parseResponse(text)

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to load regions.'
        )
    }

    return data || []
}

// =========================================
// GET BRANCHES
// =========================================

export async function getDigitalContractBranches(
    roleId,
    regionCode,
    bpCode
) {
    const params =
        new URLSearchParams({
            roleId:
                roleId?.toString() || '',
            regionCode:
                regionCode || '',
            bpCode:
                bpCode || ''
        })

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/branches?${params.toString()}`
        )

    const text =
        await response.text()

    const data =
        parseResponse(text)

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to load branches.'
        )
    }

    return data || []
}

// =========================================
// GET FRANCHISES
// =========================================

export async function getDigitalContractFranchises(
    roleId,
    bpCode,
    loginId
) {
    const params =
        new URLSearchParams({
            roleId:
                roleId?.toString() || '',
            bpCode:
                bpCode || '',
            loginId:
                loginId || ''
        })

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/franchises?${params.toString()}`
        )

    const text =
        await response.text()

    const data =
        parseResponse(text)

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to load franchises.'
        )
    }

    return data || []
}