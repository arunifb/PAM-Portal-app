import API_BASE_URL, {
    authFetch
} from './api'

import {
    getOAuthToken
} from './authApi'


// =========================================
// GET ACCESS TOKEN
// =========================================

async function ensureAccessToken() {

    let accessToken =
        sessionStorage.getItem(
            'accessToken'
        )


    // =========================================
    // TOKEN ALREADY EXISTS
    // =========================================

    if (accessToken) {

        return accessToken

    }


    // =========================================
    // GENERATE OAUTH TOKEN
    // =========================================

    const tokenData =
        await getOAuthToken()


    accessToken =
        tokenData.access_token


    return accessToken
}


// =========================================
// FORGOT PASSWORD
// =========================================

export async function forgotPassword(
    loginId
) {

    // =========================================
    // ENSURE ACCESS TOKEN EXISTS
    // =========================================

    await ensureAccessToken()


    // =========================================
    // CALL FORGOT PASSWORD API
    // =========================================

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Auth/forgot-password`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'Accept':
                        'application/json'
                },

                body: JSON.stringify({
                    loginId
                })
            }
        )


    // =========================================
    // READ RESPONSE
    // =========================================

    const responseText =
        await response.text()


    let data = {}


    if (responseText) {

        try {

            data =
                JSON.parse(
                    responseText
                )

        }
        catch {

            throw new Error(
                'Server returned an invalid response.'
            )

        }

    }


    // =========================================
    // CHECK RESPONSE
    // =========================================

    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error_description ||
            data.error ||
            'Unable to request password reset.'
        )

    }


    return data
}


// =========================================
// RESET PASSWORD
// =========================================

export async function resetPassword(
    loginId,
    verificationCode,
    newPassword
) {

    // =========================================
    // ENSURE ACCESS TOKEN EXISTS
    // =========================================

    await ensureAccessToken()


    // =========================================
    // CALL RESET PASSWORD API
    // =========================================

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Auth/reset-password`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'Accept':
                        'application/json'
                },

                body: JSON.stringify({
                    loginId,
                    verificationCode,
                    newPassword
                })
            }
        )


    // =========================================
    // READ RESPONSE
    // =========================================

    const responseText =
        await response.text()


    let data = {}


    if (responseText) {

        try {

            data =
                JSON.parse(
                    responseText
                )

        }
        catch {

            throw new Error(
                'Server returned an invalid response.'
            )

        }

    }


    // =========================================
    // CHECK RESPONSE
    // =========================================

    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error_description ||
            data.error ||
            'Password reset failed.'
        )

    }


    return data
}