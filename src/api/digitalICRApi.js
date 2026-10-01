import API_BASE_URL, { authFetch } from './api'


// =========================================
// READ API RESPONSE
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
// SEARCH DIGITAL ICR
// =========================================

export async function searchDigitalICR(
    searchData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/DigitalICR/search`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body:
                    JSON.stringify(searchData)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load Digital ICR data.'
        )

    }


    return data
}


// =========================================
// EXPORT DIGITAL ICR
// =========================================

export async function exportDigitalICR(
    searchData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/DigitalICR/export`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body:
                    JSON.stringify(searchData)
            }
        )


    if (!response.ok) {

        const data =
            await readResponse(response)

        throw new Error(
            data.message ||
            'Unable to download Digital ICR.'
        )

    }


    return await response.blob()
}