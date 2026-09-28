import API_BASE_URL from './api'


// =========================================
// GET REPORT LIST
// =========================================

export async function getReportList(
    roleId,
    reportCategory
) {

    const response = await fetch(
        `${API_BASE_URL}/api/Reports/list?roleId=${encodeURIComponent(roleId)}&reportCategory=${encodeURIComponent(reportCategory)}`
    )

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load report list.'
        )
    }

    return data
}


// =========================================
// GET REPORT PARAMETERS
// =========================================

export async function getReportParameters(
    reportId
) {

    const response = await fetch(
        `${API_BASE_URL}/api/Reports/${encodeURIComponent(reportId)}/parameters`
    )

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load report parameters.'
        )
    }

    return data
}


// =========================================
// GET REGIONS
// =========================================

export async function getRegions(
    regionCode = ''
) {

    const url = regionCode
        ? `${API_BASE_URL}/api/Reports/regions?regionCode=${encodeURIComponent(regionCode)}`
        : `${API_BASE_URL}/api/Reports/regions`

    const response = await fetch(url)

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load regions.'
        )
    }

    return data
}


// =========================================
// GET BRANCHES
// =========================================

export async function getBranches(
    roleId,
    regionCode,
    bpCode = ''
) {

    const url =
        `${API_BASE_URL}/api/Reports/branches` +
        `?roleId=${encodeURIComponent(roleId)}` +
        `&regionCode=${encodeURIComponent(regionCode)}` +
        `&bpCode=${encodeURIComponent(bpCode)}`

    const response = await fetch(url)

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load branches.'
        )
    }

    return data
}


// =========================================
// GET FRANCHISES
// =========================================

export async function getFranchises(
    roleId,
    bpCode,
    loginId
) {

    const url =
        `${API_BASE_URL}/api/Reports/franchises` +
        `?roleId=${encodeURIComponent(roleId)}` +
        `&bpCode=${encodeURIComponent(bpCode)}` +
        `&loginId=${encodeURIComponent(loginId)}`

    const response = await fetch(url)

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load franchises.'
        )
    }

    return data
}


// =========================================
// GET PRODUCTS
// =========================================

export async function getProducts() {

    const response = await fetch(
        `${API_BASE_URL}/api/Reports/products`
    )

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load products.'
        )
    }

    return data
}


// =========================================
// GET CALL BOOK DT OPTIONS
// =========================================

export async function getCallBookDt() {

    const response = await fetch(
        `${API_BASE_URL}/api/Reports/date-filters`
    )

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load Call Book DT options.'
        )
    }

    return data
}


// =========================================
// GET CALL TYPES
// =========================================

export async function getCallTypes() {

    const response = await fetch(
        `${API_BASE_URL}/api/Reports/call-types`
    )

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load call types.'
        )
    }

    return data
}


// =========================================
// GET STATUSES
// =========================================

export async function getStatuses() {

    const response = await fetch(
        `${API_BASE_URL}/api/Reports/status`
    )

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load Status options.'
        )
    }

    return data
}


// =========================================
// RUN REPORT
// =========================================

export async function runReport(
    reportId,
    parameters
) {

    const response = await fetch(
        `${API_BASE_URL}/api/Reports/${encodeURIComponent(reportId)}/run`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parameters: parameters
            })
        }
    )

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to run report.'
        )
    }

    return data
}



// =========================================
// GET CALL SUMMARY
// =========================================

export async function getCallSummary(
    branchCode
) {

    const response = await fetch(
        `${API_BASE_URL}/api/Reports/call-summary?branchCode=${encodeURIComponent(branchCode)}`
    )

    const data = await response.json()

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load call summary.'
        )
    }

    return data
}