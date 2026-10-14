import API_BASE_URL from './api'


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

    if (!accessToken) {
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

export async function verifyTwoFactor(
    userId,
    code
) {

    const accessToken = getStoredAccessToken()

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
            'Two-factor authentication failed.'
        )
    }

    return data
}


// =========================================
// LOGOUT
// =========================================

export async function logout(userId) {

    const accessToken = getStoredAccessToken()

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


    // =========================================
    // CLEAR AUTH SESSION
    // =========================================

    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('tokenExpiresIn')
    sessionStorage.removeItem('accessTokenExpiresAt')
    sessionStorage.removeItem('tokenRole')

    sessionStorage.removeItem('userId')
    sessionStorage.removeItem('loginId')
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('roleId')
    sessionStorage.removeItem('bpCode')
    sessionStorage.removeItem('regionCode')

    return data
}