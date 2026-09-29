import API_BASE_URL, { authFetch } from './api'


// =============================================
// GET BRANCHES
// =============================================

export async function getClick2CallBranches(
    roleId,
    regionCode,
    bpCode
) {

    const params = new URLSearchParams({

        roleId:
            roleId?.toString() || '',

        regionCode:
            regionCode || '',

        bpCode:
            bpCode || ''

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

            data =
                JSON.parse(text)

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
// GET FRANCHISES
// =============================================

export async function getClick2CallFranchises(
    roleId,
    bpCode,
    loginId
) {

    const params = new URLSearchParams({

        roleId:
            roleId?.toString() || '',

        bpCode:
            bpCode || '',

        loginId:
            loginId || ''

    })


    const response =
        await authFetch(
            `${API_BASE_URL}/api/Reports/franchises?${params.toString()}`
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
                'Invalid response received while loading franchises.'
            )

        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to load franchises.'
        )

    }


    return data || []

}


// =============================================
// SEARCH CLICK 2 CALL
// =============================================

export async function searchClick2Call(
    request
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Click2Call/search`,
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
                'Invalid response received from Click 2 Call search.'
            )

        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to search Click 2 Call.'
        )

    }


    return data || []

}