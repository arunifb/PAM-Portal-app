import API_BASE_URL, { authFetch } from './api'


// =========================================
// GET SKILL SET PRODUCTS
// =========================================

export async function getSkillSetProducts() {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Technician/skill-report/product-types`
        )


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


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Unable to load products. Status: ${response.status}`
        )

    }


    const items =
        data.data || data || []

    return items.map(item => ({
        value: item.skillId,
        label: item.name
    }))

}


// =========================================
// GET SKILL SET REPORT DATA
// =========================================

export async function getSkillSetData(branchCode) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Technician/skill-report?branchCode=${encodeURIComponent(branchCode)}`
        )


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


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Unable to load skill report. Status: ${response.status}`
        )

    }


    return data

}


// =========================================
// EXPORT SKILL SET REPORT
// =========================================

export async function exportSkillSetData(branchCode) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/Technician/skill-report/export?branchCode=${encodeURIComponent(branchCode)}`
        )


    if (!response.ok) {

        let errorMessage =
            'Unable to export skill report.'

        try {

            const errorData =
                await response.json()

            errorMessage =
                errorData.message ||
                errorData.error ||
                errorMessage

        }
        catch {
            // ignore parse errors
        }

        throw new Error(errorMessage)

    }


    return response

}