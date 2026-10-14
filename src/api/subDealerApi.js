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



// =============================================
// CREATE SUB-DEALER REQUISITION - ROLE ID 6
// =============================================

export async function createSubDealerRequisition(request) {
    const response = await authFetch(
        `${API_BASE_URL}/api/SubDealer`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }
    )

    const text = await response.text()
    let data = null

    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            if (!response.ok) {
                throw new Error(
                    'Unable to create sub-dealer requisition.'
                )
            }
            data = text
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.title ||
            'Unable to create sub-dealer requisition.'
        )
    }

    return data
}


// =============================================
// SEARCH DEALERS - ROLE ID 6
// =============================================

export async function searchSubDealerDealers(term) {
    const response = await authFetch(
        `${API_BASE_URL}/api/SubDealer/dealers?term=${encodeURIComponent(term)}`
    )

    const text = await response.text()
    let data = null

    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            throw new Error(
                'Invalid response received while searching dealers.'
            )
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to search dealers.'
        )
    }

    return Array.isArray(data)
        ? data
        : data?.data || []
}


// =============================================
// LOOK UP PIN CODE / AREA - ROLE ID 6
// =============================================

export async function getSubDealerArea(pincode) {
    const response = await authFetch(
        `${API_BASE_URL}/api/SubDealer/area?pincode=${encodeURIComponent(pincode)}`
    )

    const text = await response.text()
    let data = null

    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            throw new Error(
                'Invalid response received for PIN code.'
            )
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to find PIN code details.'
        )
    }

    return data
}


// =============================================
// SEARCH SUB-DEALER NAMES - ROLE ID 6
// =============================================

export async function searchSubDealerNames(
    term,
    billToPartyCode
) {
    const params = new URLSearchParams({
        term: term || '',
        billToPartyCode: billToPartyCode || ''
    })

    const response = await authFetch(
        `${API_BASE_URL}/api/SubDealer/subdealers?${params.toString()}`
    )

    const text = await response.text()
    let data = null

    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            throw new Error(
                'Invalid response received while searching sub-dealers.'
            )
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to search sub-dealer names.'
        )
    }

    return Array.isArray(data)
        ? data
        : data?.data || []
}


// =============================================
// CHECK EXISTING SUB-DEALER REQUEST - ROLE ID 6
// =============================================

export async function searchExistingSubDealer(request) {
    const response = await authFetch(
        `${API_BASE_URL}/api/SubDealer/dealer-search`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }
    )

    const text = await response.text()
    let data = null

    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            throw new Error(
                'Invalid response received while checking existing sub-dealers.'
            )
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to check existing sub-dealers.'
        )
    }

    return data
}