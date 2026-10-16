const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL

let redirectingToLogin = false
let expiryTimer = null
let logoutInProgress = false


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

    if (!expiresAt) return false

    return Date.now() >= expiresAt

}


// =========================================
// STOP TOKEN EXPIRY TIMER
// =========================================

export function stopTokenExpiryTimer() {

    if (expiryTimer) {

        clearTimeout(expiryTimer)
        expiryTimer = null

    }

}


// =========================================
// LOGOUT API + REDIRECT
// =========================================

export async function logoutAndRedirect() {

    if (logoutInProgress) return

    logoutInProgress = true

    stopTokenExpiryTimer()

    const accessToken = getAccessToken()

    const userId = sessionStorage.getItem(
        'userId'
    )

    try {

        if (accessToken && userId) {

            const response = await fetch(
                `${API_BASE_URL}/api/Auth/logout?userId=${encodeURIComponent(userId)}`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            )

            if (!response.ok) {

                console.warn(
                    'Logout API returned:',
                    response.status
                )

            }

        }

    } catch (error) {

        console.error(
            'Logout API request failed:',
            error
        )

    } finally {

        redirectToLogin()

    }

}


// =========================================
// START AUTOMATIC TOKEN EXPIRY TIMER
// =========================================

export function startTokenExpiryTimer() {

    stopTokenExpiryTimer()

    const accessToken = getAccessToken()

    const expiresAt = Number(
        sessionStorage.getItem(
            'accessTokenExpiresAt'
        )
    )

    if (!accessToken || !expiresAt) return

    const remainingTime = expiresAt - Date.now()

    if (remainingTime <= 0) {

        logoutAndRedirect()
        return

    }

    expiryTimer = setTimeout(() => {

        logoutAndRedirect()

    }, remainingTime)

}


// =========================================
// AUTHENTICATED API REQUEST
// =========================================

export async function authFetch(
    url,
    options = {}
) {

    const accessToken = getAccessToken()

    if (!accessToken) {

        redirectToLogin()

        throw new Error(
            'Access token is missing. Please login again.'
        )

    }

    if (isAccessTokenExpired()) {

        await logoutAndRedirect()

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

    if (response.status === 401) {

        await logoutAndRedirect()

        throw new Error(
            'Your session has expired. Please login again.'
        )

    }

    return response

}


// =========================================
// RESTORE TIMER AFTER PAGE REFRESH
// =========================================

if (getAccessToken()) {

    startTokenExpiryTimer()

}


// =========================================
// BEST-EFFORT LOGOUT WHEN TAB/BROWSER CLOSES
// =========================================

function handlePageExit() {
    const accessToken = sessionStorage.getItem('accessToken')
    const userId = sessionStorage.getItem('userId')

    if (!accessToken || !userId) return

    const logoutUrl =
        `${API_BASE_URL}/api/Auth/logout?userId=${encodeURIComponent(userId)}`

    fetch(logoutUrl, {
        method: 'POST',
        keepalive: true,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    }).catch((error) => {
        console.warn('Browser-exit logout request failed:', error)
    })
}

if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', handlePageExit)
    window.addEventListener('beforeunload', handlePageExit)
}


// =========================================
// DEFAULT EXPORT
// =========================================

export default API_BASE_URL