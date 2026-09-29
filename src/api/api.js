const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL


// =========================================
// GET ACCESS TOKEN
// =========================================

export function getAccessToken() {

    return sessionStorage.getItem(
        'accessToken'
    )

}


// =========================================
// AUTHENTICATED API REQUEST
// =========================================

export async function authFetch(
    url,
    options = {}
) {

    const accessToken =
        getAccessToken()


    if (!accessToken) {

        throw new Error(
            'Access token is missing. Please login again.'
        )

    }


    const headers = {

        'Accept': 'application/json',

        ...(options.headers || {}),

        'Authorization':
            `Bearer ${accessToken}`

    }


    return fetch(
        url,
        {
            ...options,
            headers
        }
    )

}


export default API_BASE_URL