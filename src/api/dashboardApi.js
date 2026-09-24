import API_BASE_URL from './api'

export async function getDashboardMenu(roleId) {

    const response = await fetch(
        `${API_BASE_URL}/api/Dashboard/menu/${roleId}`,
        {
            method: 'GET'
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to load dashboard menu.'
        )
    }

    return data
}