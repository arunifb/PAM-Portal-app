import API_BASE_URL, { authFetch } from './api'


// =============================================
// GET BRANCHES
// =============================================

// =============================================
// GET BRANCHES FOR FRANCHISE VIEW
// =============================================

export async function getFranchiseViewBranches(
    userId,
    regionCode
) {
    const params = new URLSearchParams({
        userId: userId?.toString() || '',
        regionCode: regionCode || ''
    })

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/branches?${params.toString()}`
        )

    const text =
        await response.text()

    let data = null

    if (text) {
        try {
            data = JSON.parse(text)
        }
        catch {
            throw new Error(
                'Invalid response received while loading branches.'
            )
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to load branches.'
        )
    }

    return data || []
}


// =============================================
// SEARCH FRANCHISEES
// =============================================

export async function searchFranchises(
    request
) {

    const params = new URLSearchParams({

        regionCode:
            request.regionCode || '',

        branchCode:
            request.branchCode || '',

        frCode:
            request.frCode || '',

        franchiseName:
            request.franchiseName || '',

        mobileNo:
            request.mobileNo || '',

        status:
            request.status || '',

        isFraOwnApp:
            request.isFraOwnApp || ''

    })


    const response =
        await authFetch(
            `${API_BASE_URL}/api/FranchiseView/search?${params.toString()}`
        )


    const text =
        await response.text()


    let data = null


    if (text) {

        try {

            data = JSON.parse(text)

        } catch {

            throw new Error(
                'Invalid response received while searching franchises.'
            )

        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to search franchises.'
        )

    }


    // API response:
    //
    // {
    //   isSuccess: true,
    //   message: "...",
    //   count: 10,
    //   data: [...]
    // }

    return data?.data || []

}


// =============================================
// UPDATE FRANCHISE
// =============================================

export async function updateFranchise(
    request
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/FranchiseView`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    FrCode:
                        request.FrCode,

                    MobileNo:
                        request.MobileNo,

                    EmailId:
                        request.EmailId,

                    ContactPerson:
                        request.ContactPerson,

                    Status:
                        request.Status,

                    UpdatedBy:
                        request.UpdatedBy
                })
            }
        )


    const text =
        await response.text()


    let data = null


    if (text) {

        try {

            data = JSON.parse(text)

        } catch {

            throw new Error(
                'Invalid response received while updating franchise.'
            )

        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to update franchise.'
        )

    }


    if (!data?.isSuccess) {

        throw new Error(
            data?.message ||
            'Franchise update failed.'
        )

    }


    return data
}