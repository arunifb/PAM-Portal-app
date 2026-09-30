import API_BASE_URL, { authFetch } from './api'

export async function searchOneSearch({
    ticketNo = '',
    rcnNumber = '',
    serialNo = '',
    name = '',
    regionCode = ''
}) {
    const params = new URLSearchParams({
        ticketNo,
        rcnNumber,
        serialNo,
        name,
        regionCode
    })

    const response = await authFetch(
        `${API_BASE_URL}/api/OneSearch/search?${params.toString()}`
    )

    const text = await response.text()

    let data = null

    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            throw new Error(
                'Invalid response received from One Search API.'
            )
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            'Unable to search call register.'
        )
    }

    if (!data?.isSuccess) {
        throw new Error(
            data?.message ||
            'No data found.'
        )
    }

    return data?.data || []
}