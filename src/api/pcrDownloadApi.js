import API_BASE_URL, { authFetch } from './api'


// =========================================
// READ API RESPONSE SAFELY
// =========================================

async function readResponse(response) {

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

    return data
}


// =========================================
// SEARCH PCR DOWNLOAD
// =========================================

export async function searchPCRDownload(
    searchData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/FactoryPcr/search`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(searchData)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR download data.'
        )

    }


    return data
}


// =========================================
// DOWNLOAD PCR EXCEL
// =========================================

export async function downloadPCRExcel(
    fromDate,
    toDate,
    branchCode,
    branchName
) {

    const params =
        new URLSearchParams()


    params.append(
        'fromDate',
        fromDate || ''
    )


    params.append(
        'toDate',
        toDate || ''
    )


    params.append(
        'branchCode',
        branchCode || 'All'
    )


    if (branchName) {

        params.append(
            'branchName',
            branchName
        )

    }


    const response =
        await authFetch(
            `${API_BASE_URL}/api/FactoryPcr/export?${params.toString()}`
        )


    if (!response.ok) {

        const data =
            await readResponse(response)

        throw new Error(
            data.message ||
            'Unable to download PCR Excel.'
        )

    }


    // =========================================
    // GET EXCEL FILE
    // =========================================

    const blob =
        await response.blob()


    // =========================================
    // GET FILE NAME FROM BACKEND
    // =========================================

    const contentDisposition =
        response.headers.get(
            'Content-Disposition'
        )


    let fileName =
        'PCR.xlsx'


    if (contentDisposition) {

        const match =
            contentDisposition.match(
                /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i
            )


        if (
            match &&
            match[1]
        ) {

            fileName =
                decodeURIComponent(
                    match[1]
                )

        }

    }


    // =========================================
    // DOWNLOAD FILE
    // =========================================

    const url =
        window.URL.createObjectURL(blob)


    const link =
        document.createElement('a')


    link.href =
        url

    link.download =
        fileName


    document.body.appendChild(
        link
    )


    link.click()


    link.remove()


    window.URL.revokeObjectURL(
        url
    )

}