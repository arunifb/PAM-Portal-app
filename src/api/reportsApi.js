import API_BASE_URL, { authFetch } from './api'


// =========================================
// READ API RESPONSE SAFELY
// =========================================

async function readResponse(response) {

    const responseText =
        await response.text()

    let data = {}

    if (responseText) {

        try {

            data =
                JSON.parse(responseText)

        }
        catch {

            throw new Error(
                'Server returned an invalid response.'
            )

        }

    }

    return data
}


// =========================================
// GET REPORT LIST
// =========================================

export async function getReportList(
    roleId,
    reportCategory
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/list?roleId=${encodeURIComponent(roleId)}&reportCategory=${encodeURIComponent(reportCategory)}`
        )


    const data =
        await readResponse(response)


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

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/${encodeURIComponent(reportId)}/parameters`
        )


    const data =
        await readResponse(response)


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
    regionCode = '',
    userId = ''
) {

    const params = new URLSearchParams()

    if (regionCode) {
        params.append(
            'regionCode',
            regionCode
        )
    }

    if (userId) {
        params.append(
            'userId',
            userId
        )
    }

    const queryString =
        params.toString()

    const url =
        `${API_BASE_URL}/api/Reports/regions` +
        (queryString ? `?${queryString}` : '')


    const response =
        await authFetch(url)


    const data =
        await readResponse(response)


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

export async function getBranches(userId, regionCode = '') {
    const params = new URLSearchParams();

    params.append('userId', userId);

    if (regionCode) {
        params.append('regionCode', regionCode);
    }

    const response = await authFetch(
        `${API_BASE_URL}/api/Reports/branches?${params.toString()}`
    );

    const data = await readResponse(response);

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to load branches.'
        );
    }

    return data;
}


// =========================================
// GET FRANCHISES
// =========================================

// export async function getFranchises(
//     roleId,
//     bpCode,
//     loginId
// ) {

//     const url =
//         `${API_BASE_URL}/api/Reports/franchises` +
//         `?roleId=${encodeURIComponent(roleId)}` +
//         `&bpCode=${encodeURIComponent(bpCode)}` +
//         `&loginId=${encodeURIComponent(loginId)}`


//     const response =
//         await authFetch(url)


//     const data =
//         await readResponse(response)


//     if (!response.ok) {

//         throw new Error(
//             data.message ||
//             'Unable to load franchises.'
//         )

//     }


//     return data
// }

export async function getFranchises(bpCode, loginId) {
    const url =
        `${API_BASE_URL}/api/Reports/franchises` +
        `?bpCode=${encodeURIComponent(bpCode)}` +
        `&loginId=${encodeURIComponent(loginId)}`

    const response = await authFetch(url)
    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load franchises.')
    }

    return data
}


// =========================================
// GET PRODUCTS
// =========================================

export async function getProducts() {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/products`
        )


    const data =
        await readResponse(response)


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

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/date-filters`
        )


    const data =
        await readResponse(response)


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

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/call-types`
        )


    const data =
        await readResponse(response)


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

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/status`
        )


    const data =
        await readResponse(response)


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

    const response =
        await authFetch(
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


    const data =
        await readResponse(response)


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

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/call-summary?branchCode=${encodeURIComponent(branchCode)}`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load call summary.'
        )

    }


    return data
}