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
// SEARCH INVENTORY
// =========================================

export async function searchInventory(request) {

    if (!request) {

        throw new Error(
            'Inventory search request is required.'
        )

    }


    const {
        branchCode = '',
        materialCategory = '',
        franchiseCodes = '',
        fgDescription = ''
    } = request


    if (!branchCode) {

        throw new Error(
            'Branch code is required.'
        )

    }


    const url =
        `${API_BASE_URL}/api/Inventory/search` +
        `?branchCode=${encodeURIComponent(branchCode)}` +
        `&materialCategory=${encodeURIComponent(materialCategory)}` +
        `&franchiseCodes=${encodeURIComponent(franchiseCodes)}` +
        `&fgDescription=${encodeURIComponent(fgDescription)}`


    const response =
        await authFetch(url)


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to search inventory.'
        )

    }


    return data
}


// =========================================
// EXPORT INVENTORY
// =========================================

export async function exportInventory(request) {

    if (!request) {

        throw new Error(
            'Inventory export request is required.'
        )

    }


    const {
        branchCode = '',
        materialCategory = '',
        franchiseCodes = '',
        fgDescription = ''
    } = request


    if (!branchCode) {

        throw new Error(
            'Branch code is required.'
        )

    }


    const url =
        `${API_BASE_URL}/api/Inventory/export` +
        `?branchCode=${encodeURIComponent(branchCode)}` +
        `&materialCategory=${encodeURIComponent(materialCategory)}` +
        `&franchiseCodes=${encodeURIComponent(franchiseCodes)}` +
        `&fgDescription=${encodeURIComponent(fgDescription)}`


    const response =
        await authFetch(
            url,
            {
                headers: {
                    'Accept':
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            }
        )


    if (!response.ok) {

        let message =
            'Unable to export inventory.'


        try {

            const data =
                await response.json()

            message =
                data.message ||
                message

        }
        catch {

            // Keep default message

        }


        throw new Error(message)

    }


    return await response.blob()
}