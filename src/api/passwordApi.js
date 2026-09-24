import API_BASE_URL from './api'

export async function forgotPassword(loginId) {
    const response = await fetch(
        `${API_BASE_URL}/api/Auth/forgot-password`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loginId
            })
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to request password reset.'
        )
    }

    return data
}

export async function resetPassword(
    loginId,
    verificationCode,
    newPassword
) {
    const response = await fetch(
        `${API_BASE_URL}/api/Auth/reset-password`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loginId,
                verificationCode,
                newPassword
            })
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || 'Password reset failed.'
        )
    }

    return data
}