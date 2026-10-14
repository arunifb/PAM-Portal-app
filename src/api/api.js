const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL

let redirectingToLogin = false


// =========================================
// REDIRECT TO LOGIN
// =========================================

export function redirectToLogin() {

    if (redirectingToLogin) return

    redirectingToLogin = true

    sessionStorage.clear()

    if (window.location.pathname !== '/') {

        window.location.replace('/')

    } else {

        redirectingToLogin = false

    }

}


// =========================================
// GET ACCESS TOKEN
// =========================================

export function getAccessToken() {

    return sessionStorage.getItem(
        'accessToken'
    )

}


// =========================================
// CHECK TOKEN EXPIRY
// =========================================

export function isAccessTokenExpired() {

    const expiresAt = Number(
        sessionStorage.getItem(
            'accessTokenExpiresAt'
        )
    )

    // If expiry time is not stored,
    // let the API validate the token.
    if (!expiresAt) return false

    return Date.now() >= expiresAt

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


    // Check whether token exists.
    if (!accessToken) {

        redirectToLogin()

        throw new Error(
            'Access token is missing. Please login again.'
        )

    }


    // Check whether token has expired.
    if (isAccessTokenExpired()) {

        redirectToLogin()

        throw new Error(
            'Your session has expired. Please login again.'
        )

    }


    const headers = {

        'Accept': 'application/json',

        ...(options.headers || {}),

        'Authorization':
            `Bearer ${accessToken}`

    }


    const response = await fetch(
        url,
        {
            ...options,
            headers
        }
    )


    // Redirect when the API returns 401.
    if (response.status === 401) {

        redirectToLogin()

        throw new Error(
            'Your session has expired. Please login again.'
        )

    }


    return response

}


// =========================================
// DEFAULT EXPORT
// =========================================

export default API_BASE_URL