import API_BASE_URL, { authFetch } from './api'

// =========================================
// DOWNLOAD DECLARATION DOCUMENT
// =========================================

export async function downloadDeclaration() {

    const response = await authFetch(
        `${API_BASE_URL}/api/pam/Declaration/download`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/octet-stream'
            }
        }
    )

    if (!response.ok) {

        let message = 'Unable to download declaration document.'

        try {

            const data = await response.json()

            message =
                data.message ||
                message

        } catch {
            // Keep default message
        }

        throw new Error(message)

    }

    // Get file as Blob
    const blob = await response.blob()

    // Extract filename from Content-Disposition
    const disposition =
        response.headers.get('Content-Disposition') || ''

    let fileName =
        'Technical support and housekeeping User Activity Confirmation DB.docx'

    const utf8Match =
        disposition.match(/filename\*=UTF-8''([^;]+)/i)

    const normalMatch =
        disposition.match(/filename="?([^";]+)"?/i)

    if (utf8Match) {

        fileName = decodeURIComponent(utf8Match[1])

    } else if (normalMatch) {

        fileName = normalMatch[1]

    }

    // Trigger browser download
    const url =
        window.URL.createObjectURL(blob)

    const link =
        document.createElement('a')

    link.href = url
    link.download = fileName

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)

    return true

}