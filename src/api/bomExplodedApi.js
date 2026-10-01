import API_BASE_URL, { authFetch } from './api'


// =============================================
// SEARCH BOM EXPLODED RECORDS
// =============================================

export async function searchBomExploded(
    id = 0,
    modelCode = '',
    name = ''
) {

    const params = new URLSearchParams({
        id: id.toString(),
        modelCode,
        name
    })


    const response =
        await authFetch(
            `${API_BASE_URL}/api/BomExploded/search?${params.toString()}`
        )


    const text =
        await response.text()


    let data = null


    if (text) {

        try {
            data = JSON.parse(text)
        }
        catch {
            throw new Error(
                'Invalid response received while loading BOM exploded records.'
            )
        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to load BOM exploded records.'
        )

    }


    return data

}


// =============================================
// GET PRODUCT MODELS (by product code)
// =============================================

export async function getProductModels(
    productCode
) {

    const params = new URLSearchParams({
        productCode
    })


    const response =
        await authFetch(
            `${API_BASE_URL}/api/BomExploded/product-models?${params.toString()}`
        )


    const text =
        await response.text()


    let data = null


    if (text) {

        try {
            data = JSON.parse(text)
        }
        catch {
            throw new Error(
                'Invalid response received while loading product models.'
            )
        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to load product models.'
        )

    }


    return data

}


// =============================================
// UPLOAD BOM EXPLODED FILE
// =============================================

export async function uploadBomExploded(
    productCode,
    modelCode,
    file
) {

    const formData = new FormData()
    formData.append('ProductCode', productCode)
    formData.append('ModelCode', modelCode)
    formData.append('File', file)


    const response =
        await authFetch(
            `${API_BASE_URL}/api/BomExploded`,
            {
                method: 'POST',
                body: formData
                // Note: Do NOT set Content-Type header —
                // browser sets it with boundary for multipart/form-data
            }
        )


    const text =
        await response.text()


    let data = null


    if (text) {

        try {
            data = JSON.parse(text)
        }
        catch {
            throw new Error(
                'Invalid response received while uploading file.'
            )
        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to upload file.'
        )

    }


    return data

}


// =============================================
// DOWNLOAD BOM EXPLODED FILE
// =============================================

export async function downloadBomExploded(id) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/BomExploded/${id}/download`
        )


    if (!response.ok) {

        let errorMsg = 'Unable to download file.'

        try {
            const errData = await response.json()
            errorMsg = errData?.message || errorMsg
        }
        catch {
            // response wasn't JSON
        }

        throw new Error(errorMsg)

    }


    // Response is the raw file — trigger browser download
    const blob = await response.blob()

    const contentDisposition =
        response.headers.get('Content-Disposition') || ''

    // Extract filename from header: attachment; filename=drawing.pdf
    let fileName = 'download'

    const match =
        contentDisposition.match(/filename[^;=\n]*=["']?([^"';\n]*)/)

    if (match && match[1]) {
        fileName = match[1]
    }


    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

}


// =============================================
// DELETE BOM EXPLODED RECORD
// =============================================

export async function deleteBomExploded(id) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/BomExploded/${id}`,
            {
                method: 'DELETE'
            }
        )


    const text =
        await response.text()


    let data = null


    if (text) {

        try {
            data = JSON.parse(text)
        }
        catch {
            throw new Error(
                'Invalid response received while deleting record.'
            )
        }

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'Unable to delete record.'
        )

    }


    return data

}