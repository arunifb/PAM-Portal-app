// src/api/msmeApi.js

import API_BASE_URL, { authFetch } from './api'

// =========================================
// READ API RESPONSE SAFELY
// =========================================

async function readResponse(response) {
    const responseText = await response.text()

    let data = {}

    if (responseText) {
        try {
            data = JSON.parse(responseText)
        } catch {
            throw new Error('Server returned an invalid response.')
        }
    }

    return data
}

// =========================================
// SEARCH VENDOR BY REF NO
// GET /api/vendormsme/search/{refNo}
// =========================================

export async function searchVendorMsme(refNo) {
    const response = await authFetch(
        `${API_BASE_URL}/api/vendormsme/search/${encodeURIComponent(refNo)}`,
        {
            method: 'GET'
        }
    )

    const data = await readResponse(response)

    if (
        !response.ok ||
        data.IsSuccess === false ||
        data.isSuccess === false
    ) {
        throw new Error(
            data.Message ||
            data.message ||
            'Unable to search vendor.'
        )
    }

    return data
}

// =========================================
// UPLOAD MSME DOCUMENT
// POST /api/vendormsme/upload
// =========================================

export async function uploadVendorMsme({
    refId,
    msmeRegNo,
    userId,
    uploadId,
    file
}) {
    const formData = new FormData()

    formData.append('RefId', String(refId))
    formData.append('MsmeRegNo', msmeRegNo.trim())
    formData.append('UserId', userId)
    formData.append('UploadId', uploadId || '')
    formData.append('File', file)

    const response = await authFetch(
        `${API_BASE_URL}/api/vendormsme/upload`,
        {
            method: 'POST',
            body: formData
        }
    )

    const data = await readResponse(response)

    if (
        !response.ok ||
        data.IsSuccess === false ||
        data.isSuccess === false
    ) {
        throw new Error(
            data.Message ||
            data.message ||
            'Unable to upload MSME document.'
        )
    }

    return data
}