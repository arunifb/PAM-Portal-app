import API_BASE_URL, { authFetch } from './api'


// =========================================
// GET DASHBOARD MENU
// =========================================

export async function getDashboardMenu(roleId) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Dashboard/menu/${roleId}`,
            {
                method: 'GET'
            }
        )


    // =========================================
    // READ RESPONSE SAFELY
    // =========================================

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


    // =========================================
    // API ERROR
    // =========================================

    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Unable to load dashboard menu. Status: ${response.status}`
        )

    }


    // =========================================
    // SUCCESS
    // =========================================

    return data

}