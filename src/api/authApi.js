import API_BASE_URL from './api'


// =========================================
// LOGIN
// =========================================

export async function login(
    loginId,
    password,
    recaptchaToken
) {

    const response = await fetch(
        `${API_BASE_URL}/api/Auth/login`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                loginId,
                password,
                recaptchaToken
            })
        }
    )


    const data = await response.json()


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Login failed.'
        )

    }


    return data

}


// =========================================
// VERIFY TWO FACTOR
// =========================================

export async function verifyTwoFactor(
    userId,
    code
) {

    const response = await fetch(
        `${API_BASE_URL}/api/Auth/verify-2fa`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                userId,
                code
            })
        }
    )


    const data = await response.json()


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Two-factor authentication failed.'
        )

    }


    return data

}


// =========================================
// LOGOUT
// =========================================

export async function logout(userId) {

    const response = await fetch(
        `${API_BASE_URL}/api/Auth/logout?userId=${userId}`,
        {
            method: 'POST'
        }
    )


    const data = await response.json()


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Logout failed.'
        )

    }


    return data

}