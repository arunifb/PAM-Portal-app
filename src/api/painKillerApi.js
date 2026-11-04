import API_BASE_URL, { authFetch } from './api'

// =========================================
// READ API RESPONSE
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

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.Message ||
            'Something went wrong.'
        )
    }

    return data
}

// =========================================
// GET RESPONSE DATA
// =========================================

function getData(response) {
    return response?.data ??
        response?.Data ??
        response?.result ??
        response?.Result ??
        response
}

// =========================================
// SEARCH PAIN KILLER
// POST api/PainKiller/search
// =========================================

export async function searchPainKiller(params) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PainKiller/search`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        }
    )

    const data = await readResponse(response)

    if (
        data?.isSuccess === false ||
        data?.IsSuccess === false
    ) {
        throw new Error(
            data?.message ||
            data?.Message ||
            'Unable to search Pain Killer records.'
        )
    }

    return getData(data) || []
}

// =========================================
// GET TICKET DETAILS
// GET api/PainKiller/detail/{ticketNo}
// =========================================

export async function getPainKillerDetail(ticketNo) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PainKiller/detail/${encodeURIComponent(ticketNo)}`
    )

    const data = await readResponse(response)

    if (
        data?.isSuccess === false ||
        data?.IsSuccess === false
    ) {
        throw new Error(
            data?.message ||
            data?.Message ||
            'Unable to load ticket details.'
        )
    }

    return getData(data)
}

// =========================================
// GET NOTES
// GET api/PainKiller/notes/{ticketNo}
// =========================================

export async function getPainKillerNotes(ticketNo) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PainKiller/notes/${encodeURIComponent(ticketNo)}`
    )

    const data = await readResponse(response)

    if (
        data?.isSuccess === false ||
        data?.IsSuccess === false
    ) {
        throw new Error(
            data?.message ||
            data?.Message ||
            'Unable to load notes.'
        )
    }

    return getData(data) || []
}

// =========================================
// GET CLICK2CALL
// GET api/PainKiller/click2call/{ticketNo}
// =========================================

export async function getPainKillerClick2Call(ticketNo) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PainKiller/click2call/${encodeURIComponent(ticketNo)}`
    )

    const data = await readResponse(response)

    if (
        data?.isSuccess === false ||
        data?.IsSuccess === false
    ) {
        throw new Error(
            data?.message ||
            data?.Message ||
            'Unable to load call details.'
        )
    }

    return getData(data) || []
}

// =========================================
// GET SUB-REASONS
// GET api/PainKiller/sub-reasons/{feedbackCode}
// =========================================

export async function getPainKillerSubReasons(feedbackCode) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PainKiller/sub-reasons/${encodeURIComponent(feedbackCode)}`
    )

    const data = await readResponse(response)

    if (
        data?.isSuccess === false ||
        data?.IsSuccess === false
    ) {
        throw new Error(
            data?.message ||
            data?.Message ||
            'Unable to load status sub-reasons.'
        )
    }

    return getData(data) || []
}

// =========================================
// SAVE AGENT ACTION
// POST api/PainKiller/save
// =========================================

export async function savePainKillerAction(payload) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PainKiller/save`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }
    )

    const data = await readResponse(response)

    if (
        data?.isSuccess === false ||
        data?.IsSuccess === false
    ) {
        throw new Error(
            data?.message ||
            data?.Message ||
            'Your information was not submitted.'
        )
    }

    return data
}