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
// SEARCH SPARE STOCK
// =========================================

export async function searchSpareStock(
    searchData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/SpareStock/search`,
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
            'Unable to load Spares Stock data.'
        )

    }


    return data
}