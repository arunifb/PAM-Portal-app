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
// GET DDR REGION REPORT
// =========================================

export async function getDDRRegionReport(
    request
) {

    if (!request) {

        throw new Error(
            'DDR region report request is required.'
        )

    }


    const response =
        await authFetch(
            `${API_BASE_URL}/api/DDRRegion/report`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(request)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load DDR region report.'
        )

    }


    if (data.isSuccess === false) {

        throw new Error(
            data.message ||
            'Unable to load DDR region report.'
        )

    }


    return data
}


// =========================================
// EXPORT DDR REGION REPORT
// =========================================

export async function exportDDRRegionReport(
    request
) {

    if (!request) {

        throw new Error(
            'DDR region export request is required.'
        )

    }


    const response =
        await authFetch(
            `${API_BASE_URL}/api/DDRRegion/export`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',

                    'Accept':
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },

                body: JSON.stringify(request)
            }
        )


    if (!response.ok) {

        let message =
            'Unable to export DDR region report.'


        try {

            const data =
                await response.json()

            message =
                data.message ||
                message

        }
        catch {

        }


        throw new Error(message)

    }


    return await response.blob()
}