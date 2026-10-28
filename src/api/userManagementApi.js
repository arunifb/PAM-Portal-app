import API_BASE_URL, { authFetch } from './api'


// =========================================
// READ API RESPONSE SAFELY
// =========================================

async function readResponse(response) {

    const responseText =
        await response.text()

    let data = {}

    if (responseText) {

        try {

            data =
                JSON.parse(responseText)

        }
        catch {

            throw new Error(
                'Server returned an invalid response.'
            )

        }

    }

    return data
}


// =========================================
// GET USER LIST
// =========================================

export async function getUsers(
    regionCode,
    branchCode = '',
    phoneNumber = ''
) {

    const url =
        `${API_BASE_URL}/api/UserManagement/users` +
        `?regionCode=${encodeURIComponent(regionCode || '')}` +
        `&branchCode=${encodeURIComponent(branchCode || '')}` +
        `&phoneNumber=${encodeURIComponent(phoneNumber || '')}`


    const response =
        await authFetch(url, {
            method: 'GET'
        })


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
        data.message ||
        data.Message ||
        data.error ||
        `Unable to load users. Status: ${response.status}`
    )

    }


    return data
}


// =========================================
// CREATE USER
// =========================================

export async function createUser(user) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/UserManagement/users`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(user)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Unable to create user. Status: ${response.status}`
        )

    }


    return data
}


// =========================================
// GET USER FOR EDIT
// =========================================

export async function getUserForEdit(
    userId
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/UserManagement/users/${encodeURIComponent(userId)}/edit`,
            {
                method: 'GET'
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Unable to load user details. Status: ${response.status}`
        )

    }


    return data
}


// =========================================
// UPDATE USER
// =========================================

export async function updateUser(
    userId,
    user
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/UserManagement/users/${encodeURIComponent(userId)}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(user)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Unable to update user. Status: ${response.status}`
        )

    }


    return data
}


// =========================================
// CHECK LOGIN ID
// =========================================

export async function checkLoginId(
    loginId
) {

    const url =
        `${API_BASE_URL}/api/UserManagement/users/check-login` +
        `?loginId=${encodeURIComponent(loginId || '')}`


    const response =
        await authFetch(url, {
            method: 'GET'
        })


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Unable to check Login ID. Status: ${response.status}`
        )

    }


    return data
}


// =========================================
// CHECK PHONE NUMBER
// =========================================

export async function checkPhone(
    phoneNumber,
    userId = null
) {

    let url =
        `${API_BASE_URL}/api/UserManagement/users/check-phone` +
        `?phoneNumber=${encodeURIComponent(phoneNumber || '')}`


    if (
        userId !== null &&
        userId !== undefined
    ) {

        url +=
            `&userId=${encodeURIComponent(userId)}`

    }


    const response =
        await authFetch(url, {
            method: 'GET'
        })


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Unable to check phone number. Status: ${response.status}`
        )

    }


    return data
}


// =========================================
// GET APPROVER MAPPING DATA
// =========================================

export async function getApproverMapping(
    userId
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/UserManagement/users/${encodeURIComponent(userId)}/approver-mapping`,
            {
                method: 'GET'
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Unable to load approver mapping. Status: ${response.status}`
        )

    }


    return data
}


// =========================================
// SAVE APPROVER MAPPING
// =========================================

export async function saveApproverMapping(
    userId,
    approvers
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/UserManagement/users/${encodeURIComponent(userId)}/approver-mapping`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    requestorId: userId,

                    approvers: approvers
                })
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Unable to save approver mapping. Status: ${response.status}`
        )

    }


    return data
}

export async function saveUserMatrix(userId, payload) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/UserManagement/users/${encodeURIComponent(userId)}/matrix`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(payload)
            }
        )

    const data =
        await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Unable to save user matrix. Status: ${response.status}`
        )
    }

    return data
}

export async function getUserMatrix(userId) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/UserManagement/users/${encodeURIComponent(userId)}/matrix`,
            {
                method: 'GET'
            }
        )

    const data =
        await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Unable to load user matrix. Status: ${response.status}`
        )
    }

    return data
}

export async function getRoles(roleId = '') {

    const query =
        roleId
            ? `?roleId=${encodeURIComponent(roleId)}`
            : ''

    const response =
        await authFetch(
            `${API_BASE_URL}/api/UserManagement/roles${query}`,
            {
                method: 'GET'
            }
        )

    const data =
        await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Unable to load roles. Status: ${response.status}`
        )
    }

    return data
}