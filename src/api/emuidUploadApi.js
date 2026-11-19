
import API_BASE_URL, { authFetch } from './api'

// =========================================
// HELPER: READ API RESPONSE
// =========================================

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
        throw new Error(
            data.message ||
            data.Message ||
            `Request failed with status ${response.status}`
        )
    }

    return data
}


// =========================================
// GET SESSION USER ID
// =========================================

function getSessionUserId() {
    return (
        sessionStorage.getItem('userId') ||
        sessionStorage.getItem('UserID') ||
        sessionStorage.getItem('userID') ||
        sessionStorage.getItem('UserId') ||
        ''
    )
}


// =========================================
// GET LOG TYPES
// GET api/pam/FireFighter/types
// =========================================

export async function getEmuidLogTypes() {

    const response = await authFetch(
        `${API_BASE_URL}/api/pam/FireFighter/types`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        }
    )

    return readJsonResponse(response)
}


// =========================================
// GET EMUID RECORDS
// GET api/pam/FireFighter/list
// =========================================

export async function getEmuidList(logType = '0') {

    const userId = getSessionUserId()

    if (!userId || Number(userId) <= 0) {
        throw new Error('User ID is missing. Please login again.')
    }

    const params = new URLSearchParams({
        logType: logType || '0',
        userId: userId
    })

    const response = await authFetch(
        `${API_BASE_URL}/api/pam/FireFighter/list?${params.toString()}`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        }
    )

    const data = await readJsonResponse(response)

    return Array.isArray(data)
        ? data
        : Array.isArray(data.data)
            ? data.data
            : []
}


// =========================================
// UPLOAD EMUID FILE
// POST api/pam/FireFighter/upload
// =========================================

export async function uploadEmuidFile({
    period,
    logType,
    fileName,
    createdBy,
    file
}) {

    const formData = new FormData()

    formData.append('PDate', period)
    formData.append('LogType', logType || 'EMUID')
    formData.append('FileName', fileName)
    formData.append('CreatedBy', String(createdBy))
    formData.append('File', file)

    const response = await authFetch(
        `${API_BASE_URL}/api/pam/FireFighter/upload`,
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


// =========================================
// DOWNLOAD EMUID FILE
// GET api/pam/FireFighter/download/{id}
// =========================================

export async function downloadEmuidFile(id, logType = 'EMUID') {

    const userId = getSessionUserId()

    if (
        id === undefined ||
        id === null ||
        String(id).trim() === ''
    ) {
        throw new Error('Record ID is missing.')
    }

    if (!userId || Number(userId) <= 0) {
        throw new Error('User ID is missing. Please login again.')
    }

    const params = new URLSearchParams({
        logType: logType || 'EMUID',
        userId: userId
    })

    const response = await authFetch(
        `${API_BASE_URL}/api/pam/FireFighter/download/${encodeURIComponent(id)}?${params.toString()}`,
        {
            method: 'GET',
            headers: {
                Accept: '*/*'
            }
        }
    )

    if (!response.ok) {

        let errorMessage = 'Unable to download file.'

        try {
            const data = await response.json()

            errorMessage =
                data.message ||
                data.Message ||
                errorMessage

        } catch {
            // Keep default error message.
        }

        throw new Error(errorMessage)
    }

    const blob = await response.blob()

    const disposition =
        response.headers.get('Content-Disposition') || ''

    let downloadName = 'EMUID_File'

    const utf8Match =
        disposition.match(/filename\*=UTF-8''([^;]+)/i)

    const normalMatch =
        disposition.match(/filename="?([^";]+)"?/i)

    if (utf8Match?.[1]) {

        downloadName =
            decodeURIComponent(utf8Match[1])

    } else if (normalMatch?.[1]) {

        downloadName =
            normalMatch[1]

    }

    const fileUrl =
        window.URL.createObjectURL(blob)

    const link =
        document.createElement('a')

    link.href = fileUrl
    link.download = downloadName

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    window.setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl)
    }, 1000)

    return true
}


// =========================================
// UPDATE REVIEWED REMARK
// POST api/pam/FireFighter/review
// =========================================

export async function updateEmuidReview(id, remark) {

    const response = await authFetch(
        `${API_BASE_URL}/api/pam/FireFighter/review`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                id: Number(id),
                remark: remark
            })
        }
    )

    return readJsonResponse(response)
}
