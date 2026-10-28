import API_BASE_URL, { authFetch } from './api'

async function readResponse(response) {
    const responseText = await response.text()

    if (!responseText) {
        return {}
    }

    try {
        return JSON.parse(responseText)
    } catch {
        throw new Error('Server returned an invalid response.')
    }
}

async function getJson(url, fallbackMessage) {
    const response = await authFetch(url)
    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(data.message || fallbackMessage)
    }

    return data
}

// Initial process note list
export async function getProcessNotes(roleId = 6) {
    return getJson(
        `${API_BASE_URL}/api/processnote?roleId=${encodeURIComponent(roleId)}`,
        'Unable to load training manuals.'
    )
}

// Company / Division dropdown
export async function getCompanyDivisions() {
    return getJson(
        `${API_BASE_URL}/api/processnote/company-divisions`,
        'Unable to load Company / Division.'
    )
}

// Area dropdown
export async function getProcessNoteAreas(compDiviId) {
    return getJson(
        `${API_BASE_URL}/api/processnote/areas/${encodeURIComponent(compDiviId)}`,
        'Unable to load areas.'
    )
}

// Module dropdown
export async function getProcessNoteModules(areaId) {
    return getJson(
        `${API_BASE_URL}/api/processnote/modules/${encodeURIComponent(areaId)}`,
        'Unable to load modules.'
    )
}

// Folder dropdown
export async function getProcessNoteFolders(moduleId) {
    return getJson(
        `${API_BASE_URL}/api/processnote/folders/${encodeURIComponent(moduleId)}`,
        'Unable to load folders.'
    )
}

// Subfolder dropdown
export async function getProcessNoteSubfolders(folderId) {
    return getJson(
        `${API_BASE_URL}/api/processnote/subfolders/${encodeURIComponent(folderId)}`,
        'Unable to load subfolders.'
    )
}

// Search process notes
export async function searchProcessNotes(filters) {
    const response = await authFetch(
        `${API_BASE_URL}/api/processnote/search`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filters)
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to search training manuals.'
        )
    }

    return data
}

// Download a manual file
export async function downloadProcessNote(id) {
    const response = await authFetch(
        `${API_BASE_URL}/api/processnote/${encodeURIComponent(id)}/download`
    )

    if (!response.ok) {
        let message = 'Unable to download the file.'

        try {
            const data = await readResponse(response)
            message = data.message || message
        } catch {
            // Keep the default message if the error response is not JSON.
        }

        throw new Error(message)
    }

    return response.blob()
}