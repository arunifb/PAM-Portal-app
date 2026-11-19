import API_BASE_URL, { authFetch } from './api'

async function readJsonResponse(response) {
    const responseText = await response.text()

    let data = {}

    if (responseText) {
        try {
            data = JSON.parse(responseText)
        } catch {
            throw new Error('Server returned an invalid response.')
        }
    }

    if (!response.ok || data.isSuccess === false) {
        throw new Error(data.message || 'ORA DB Log API request failed.')
    }

    return data
}

// Load Type dropdown
export async function getOraLogTypes() {
    const response = await authFetch(
        `${API_BASE_URL}/api/pam/OraLog/types`,
        {
            method: 'GET'
        }
    )

    return readJsonResponse(response)
}

// Load grid records / Search
export async function getOraLogList(logType = '0') {
    const params = new URLSearchParams({
        logType: logType || '0'
    })

    const response = await authFetch(
        `${API_BASE_URL}/api/pam/OraLog/list?${params.toString()}`,
        {
            method: 'GET'
        }
    )

    const data = await readJsonResponse(response)

    return Array.isArray(data.data) ? data.data : []
}

// Upload file
export async function uploadOraLog({
    period,
    logType,
    fileName,
    createdBy,
    file
}) {
    const formData = new FormData()

    formData.append('PDate', period)
    formData.append('LogType', logType)
    formData.append('FileName', fileName)
    formData.append('CreatedBy', String(createdBy))
    formData.append('File', file)

    const response = await authFetch(
        `${API_BASE_URL}/api/pam/OraLog/upload`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json'
            },
            body: formData
        }
    )

    return readJsonResponse(response)
}

// Download uploaded file

// Download uploaded file
export async function downloadOraLog(id, logType) {
    if (id === undefined || id === null || String(id).trim() === '') {
        throw new Error('Record ID is missing. Cannot download file.')
    }

    if (!logType) {
        throw new Error('Log Type is missing.')
    }

    const params = new URLSearchParams({
        logType: logType
    })

    const response = await authFetch(
        `${API_BASE_URL}/api/pam/OraLog/download/${encodeURIComponent(id)}?${params.toString()}`,
        {
            method: 'GET',
            headers: {
                Accept: '*/*'
            }
        }
    )

    if (!response.ok) {
        let message = 'Unable to download the file.'

        try {
            const data = await response.json()
            message = data.message || message
        } catch {
            // Use default message
        }

        throw new Error(message)
    }

    const blob = await response.blob()

    const disposition = response.headers.get('Content-Disposition') || ''

    let fileName = 'ORA_DB_Log'

    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
    const normalMatch = disposition.match(/filename="?([^";]+)"?/i)

    if (utf8Match) {
        fileName = decodeURIComponent(utf8Match[1])
    } else if (normalMatch) {
        fileName = normalMatch[1]
    }

    const fileUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = fileUrl
    link.download = fileName

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl)
    }, 1000)

    return true
}


// Update Reviewed Remark
export async function updateOraLogReview(id, remark) {
    const response = await authFetch(
        `${API_BASE_URL}/api/pam/OraLog/review`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id,
                remark
            })
        }
    )

    return readJsonResponse(response)
}