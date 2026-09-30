import API_BASE_URL, { authFetch } from './api'


// =============================================
// SEARCH SUB-DEALER REQUISITIONS
// =============================================

export async function searchSubDealerRequisitions(
    request
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/SubDealer/search`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(request)
            }
        )


    const text =
        await response.text()


    let data = null


    if (text) {

        try {

            data =
                JSON.parse(text)

        }
        catch {

            throw new Error(
                'Invalid response received from Sub-Dealer search.'
            )

        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to search sub-dealer requisitions.'
        )

    }


    return data || []

}


// =============================================
// GET SUB-DEALER BY ID
// =============================================

export async function getSubDealerById(
    id
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/SubDealer/${id}`
        )


    const text =
        await response.text()


    let data = null


    if (text) {

        try {

            data =
                JSON.parse(text)

        }
        catch {

            throw new Error(
                'Invalid response received while loading sub-dealer details.'
            )

        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to load sub-dealer details.'
        )

    }


    return data

}


// =============================================
// UPDATE SUB-DEALER REQUISITION
// =============================================

export async function updateSubDealerRequisition(
    request
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/SubDealer/update`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(request)
            }
        )


    const text =
        await response.text()


    let data = null


    if (text) {

        try {

            data =
                JSON.parse(text)

        }
        catch {

            throw new Error(
                'Invalid response received while updating sub-dealer requisition.'
            )

        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to update sub-dealer requisition.'
        )

    }


    return data

}


// =============================================
// DOWNLOAD SUB-DEALER REQUISITIONS
// =============================================

export async function downloadSubDealerRequisitions(
    request
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/SubDealer/download`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(request)
            }
        )


    if (!response.ok) {

        const text =
            await response.text()


        let data = null


        if (text) {

            try {

                data =
                    JSON.parse(text)

            }
            catch {
                // Response may not be JSON
            }

        }


        throw new Error(
            data?.message ||
            'Unable to download sub-dealer requisitions.'
        )

    }


    return await response.blob()

}


// =============================================
// DOWNLOAD SUB-DEALER RELATIONS
// =============================================

export async function downloadSubDealerRelations(
    request
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/SubDealer/download-relations`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(request)
            }
        )


    if (!response.ok) {

        const text =
            await response.text()


        let data = null


        if (text) {

            try {

                data =
                    JSON.parse(text)

            }
            catch {
                // Response may not be JSON
            }

        }


        throw new Error(
            data?.message ||
            'Unable to download sub-dealer relations.'
        )

    }


    return await response.blob()

}