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
// SEARCH PCR
// =========================================

export async function searchPCR(
    searchData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/search`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(searchData)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR data.'
        )

    }


    return data
}


// =========================================
// GET PCR STATUS LIST
// =========================================

export async function getPCRStatuses() {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/statuses`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR status options.'
        )

    }


    return data
}


// =========================================
// GET PCR DETAIL
// =========================================

export async function getPCRDetail(
    refId
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/detail/${encodeURIComponent(refId)}`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR detail.'
        )

    }


    return data
}


// =========================================
// GET PCR PROBLEMS
// =========================================

export async function getPCRProblems() {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/problems`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR problems.'
        )

    }


    return data
}


// =========================================
// GET PCR SUPPLIERS
// =========================================

export async function getPCRSuppliers() {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/suppliers`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR suppliers.'
        )

    }


    return data
}


// =========================================
// GET PCR SEGREGATION STATUSES
// =========================================

export async function getPCRSegregationStatuses(
    roleId
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/segregation-statuses?roleId=${encodeURIComponent(roleId)}`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR segregation statuses.'
        )

    }


    return data
}


// =========================================
// SAVE PCR ANALYSIS
// =========================================

export async function savePCRAnalysis(
    analysisData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/analysis`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(analysisData)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to save PCR analysis.'
        )

    }


    return data
}


// =========================================
// UPDATE PCR STATUS
// =========================================

export async function updatePCRStatus(
    statusData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/update-status`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(statusData)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to update PCR status.'
        )

    }


    return data
}


// =========================================
// ADD PART CATEGORY
// =========================================

export async function addPartCategory(
    categoryData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/part-category`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(categoryData)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to save part category.'
        )

    }


    return data
}