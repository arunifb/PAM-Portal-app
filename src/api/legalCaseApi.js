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
// GET LEGAL CASE HEADERS
// =========================================

export async function getLegalCaseHeaders(
    filterData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/LegalCase/headers`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(filterData)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load legal case data.'
        )

    }


    return data
}


// =========================================
// EXPORT LEGAL CASES
// =========================================

export async function exportLegalCases(
    filterData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/LegalCase/export`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(filterData)
            }
        )


    if (!response.ok) {

        const data =
            await readResponse(response)

        throw new Error(
            data.message ||
            'Unable to download legal case data.'
        )

    }


    return await response.blob()
}