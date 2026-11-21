import API_BASE_URL, {
    startTokenExpiryTimer,
    stopTokenExpiryTimer,
    logoutAndRedirect
} from './api'


// =========================================
// GET OAUTH ACCESS TOKEN
// =========================================

export async function getOAuthToken() {

    const clientId =
        import.meta.env.VITE_OAUTH_CLIENT_ID

    const clientSecret =
        import.meta.env.VITE_OAUTH_CLIENT_SECRET


    // =========================================
    // VALIDATE CLIENT CREDENTIALS
    // =========================================

    if (!clientId) {
        throw new Error(
            'OAuth client ID is missing.'
        )
    }

    if (!clientSecret) {
        throw new Error(
            'OAuth client secret is missing.'
        )
    }


    // =========================================
    // CALL OAUTH TOKEN API
    // =========================================

    const response = await fetch(
        `${API_BASE_URL}/api/oauth/token`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },

            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret
            })
        }
    )


    // =========================================
    // READ RESPONSE SAFELY
    // =========================================

    const contentType =
        response.headers.get('content-type') || ''

    let data = {}

    if (contentType.includes('application/json')) {
        data = await response.json()
    }


    // =========================================
    // CHECK RESPONSE
    // =========================================

    if (!response.ok) {
        throw new Error(
            data.error_description ||
            data.message ||
            data.error ||
            'Unable to generate access token.'
        )
    }


    // =========================================
    // CHECK ACCESS TOKEN
    // =========================================

    if (!data.access_token) {
        throw new Error(
            'Access token was not returned by the server.'
        )
    }


    // =========================================
    // SAVE TOKEN AND EXPIRY TIME
    // =========================================

    const expiresIn = Number(data.expires_in || 0)

    stopTokenExpiryTimer()

    sessionStorage.setItem(
        'accessToken',
        data.access_token
    )

    sessionStorage.setItem(
        'tokenExpiresIn',
        String(expiresIn)
    )

    sessionStorage.setItem(
        'accessTokenExpiresAt',
        String(
            expiresIn > 0
                ? Date.now() + expiresIn * 1000
                : 0
        )
    )

    sessionStorage.setItem(
        'tokenRole',
        data.role || ''
    )


    // =========================================
    // START AUTOMATIC TOKEN EXPIRY TIMER
    // =========================================

    startTokenExpiryTimer()


    console.log(
        'OAuth access token generated successfully.'
    )

    return data
}


// =========================================
// GET STORED ACCESS TOKEN
// =========================================

function getStoredAccessToken() {

    const accessToken =
        sessionStorage.getItem('accessToken')

    if (!accessToken) {
        throw new Error(
            'Access token is missing.'
        )
    }

    return accessToken
}


// =========================================
// LOGIN
// =========================================

export async function login(
    loginId,
    password,
    recaptchaToken
) {

    let accessToken =
        sessionStorage.getItem('accessToken')

    const expiresAt = Number(
        sessionStorage.getItem('accessTokenExpiresAt')
    )

    // Generate a new token if missing or expired.
    if (
        !accessToken ||
        (expiresAt > 0 && Date.now() >= expiresAt)
    ) {
        stopTokenExpiryTimer()

        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('tokenExpiresIn')
        sessionStorage.removeItem('accessTokenExpiresAt')
        sessionStorage.removeItem('tokenRole')

        const tokenData = await getOAuthToken()
        accessToken = tokenData.access_token
    }


    // =========================================
    // CALL LOGIN API
    // =========================================

    const response = await fetch(
        `${API_BASE_URL}/api/Auth/login`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },

            body: JSON.stringify({
                loginId,
                password,
                recaptchaToken
            })
        }
    )


    // =========================================
    // READ RESPONSE SAFELY
    // =========================================

    const contentType =
        response.headers.get('content-type') || ''

    let data = {}

    if (contentType.includes('application/json')) {
        data = await response.json()
    }


    // =========================================
    // CHECK RESPONSE
    // =========================================

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error_description ||
            data.error ||
            'Login failed.'
        )
    }

    console.log('Login API successful.')

    return data
}


// =========================================
// VERIFY TWO FACTOR
// =========================================

// export async function verifyTwoFactor(
//     userId,
//     code
// ) {

//     const accessToken = getStoredAccessToken()

//     const expiresAt = Number(
//         sessionStorage.getItem('accessTokenExpiresAt')
//     )

//     if (expiresAt > 0 && Date.now() >= expiresAt) {
//         await logoutAndRedirect()

//         throw new Error(
//             'Your session has expired. Please login again.'
//         )
//     }

//     const response = await fetch(
//         `${API_BASE_URL}/api/Auth/verify-2fa`,
//         {
//             method: 'POST',

//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json',
//                 'Authorization': `Bearer ${accessToken}`
//             },

//             body: JSON.stringify({
//                 userId,
//                 code
//             })
//         }
//     )


//     // =========================================
//     // READ RESPONSE SAFELY
//     // =========================================

//     const contentType =
//         response.headers.get('content-type') || ''

//     let data = {}

//     if (contentType.includes('application/json')) {
//         data = await response.json()
//     }


//     // =========================================
//     // CHECK RESPONSE
//     // =========================================

//     if (response.status === 401) {
//         await logoutAndRedirect()

//         throw new Error(
//             'Your session has expired. Please login again.'
//         )
//     }

//     if (!response.ok) {
//         throw new Error(
//             data.message ||
//             data.error_description ||
//             data.error ||
//             'Two-factor authentication failed.'
//         )
//     }

//     return data
// }

// =========================================
// VERIFY TWO FACTOR
// =========================================

export async function verifyTwoFactor(userId, code) {

    const accessToken = getStoredAccessToken()

    const expiresAt = Number(
        sessionStorage.getItem('accessTokenExpiresAt')
    )

    // Check token expiry before calling the API.
    if (expiresAt > 0 && Date.now() >= expiresAt) {
        throw new Error(
            'Your login session has expired. Please login again.'
        )
    }

    const response = await fetch(
        `${API_BASE_URL}/api/Auth/verify-2fa`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },

            body: JSON.stringify({
                userId,
                code
            })
        }
    )

    // Read response safely.
    const contentType =
        response.headers.get('content-type') || ''

    let data = {}

    if (contentType.includes('application/json')) {
        data = await response.json()
    }

    // Do not automatically redirect on every 401.
    // An invalid authentication code should show an error
    // on the TwoFactorAuth page.
    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error_description ||
            data.error ||
            'Invalid or expired authentication code.'
        )
    }

    return data
}


// =========================================
// RESEND TWO FACTOR CODE
// =========================================

export async function resendTwoFactorCode(loginId) {

    const accessToken = getStoredAccessToken()

    const expiresAt = Number(
        sessionStorage.getItem('accessTokenExpiresAt')
    )

    if (expiresAt > 0 && Date.now() >= expiresAt) {
        throw new Error(
            'Your login session has expired. Please login again.'
        )
    }

    const response = await fetch(
        `${API_BASE_URL}/api/Auth/resend-2fa-code`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },

            body: JSON.stringify({
                loginId
            })
        }
    )

    const contentType =
        response.headers.get('content-type') || ''

    let data = {}

    if (contentType.includes('application/json')) {
        data = await response.json()
    }

    if (!response.ok) {

        const error = new Error(
            data.message ||
            data.error_description ||
            data.error ||
            'Unable to resend authentication code.'
        )

        error.retryAfterSeconds =
            Number(
                data.retryAfterSeconds ??
                data.RetryAfterSeconds ??
                response.headers.get('Retry-After') ??
                0
            )

        throw error
    }

    return data
}

// =========================================
// LOGOUT
// =========================================

export async function logout(userId) {

    const accessToken =
        sessionStorage.getItem('accessToken')

    stopTokenExpiryTimer()

    try {

        if (!accessToken) {
            return {}
        }

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


        // =========================================
        // READ RESPONSE SAFELY
        // =========================================

        const contentType =
            response.headers.get('content-type') || ''

        let data = {}

        if (contentType.includes('application/json')) {
            data = await response.json()
        }


        // =========================================
        // CHECK RESPONSE
        // =========================================

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error_description ||
                data.error ||
                'Logout failed.'
            )
        }

        return data

    } finally {

        // Clear local session whether the request succeeds or fails.
        sessionStorage.clear()

    }
}


// =========================================
// GET USER PROFILE
// =========================================

export async function getUserProfile(userId) {

    const accessToken =
        getStoredAccessToken()

    const expiresAt = Number(
        sessionStorage.getItem('accessTokenExpiresAt')
    )

    // Check token expiry before calling the API.
    if (
        expiresAt > 0 &&
        Date.now() >= expiresAt
    ) {
        throw new Error(
            'Your login session has expired. Please login again.'
        )
    }


    // =========================================
    // CALL USER PROFILE API
    // =========================================

    const response = await fetch(
        `${API_BASE_URL}/api/Auth/user-profile/${encodeURIComponent(userId)}`,
        {
            method: 'GET',

            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }
    )


    // =========================================
    // READ RESPONSE SAFELY
    // =========================================

    const contentType =
        response.headers.get('content-type') || ''

    let data = {}

    if (contentType.includes('application/json')) {
        data = await response.json()
    }


    // =========================================
    // CHECK RESPONSE
    // =========================================

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error_description ||
            data.error ||
            'Unable to load user profile.'
        )
    }


    // =========================================
    // RETURN PROFILE DATA
    // =========================================

    return data
}