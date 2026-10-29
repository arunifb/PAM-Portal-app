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
// SEARCH PCR
// =========================================

export async function searchPCR(
    searchData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/search`,
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
            'Unable to load PCR data.'
        )

    }


    return data
}


// =========================================
// GET PCR STATUS LIST
// =========================================

export async function getPCRStatuses() {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/statuses`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR status options.'
        )

    }


    return data
}


// =========================================
// GET PCR DETAIL
// =========================================

export async function getPCRDetail(
    refId
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/detail/${encodeURIComponent(refId)}`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR detail.'
        )

    }


    return data
}


// =========================================
// GET PCR PROBLEMS
// =========================================

export async function getPCRProblems() {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/problems`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR problems.'
        )

    }


    return data
}


// =========================================
// GET PCR SUPPLIERS
// =========================================

export async function getPCRSuppliers() {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/suppliers`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR suppliers.'
        )

    }


    return data
}


// =========================================
// GET PCR SEGREGATION STATUSES
// =========================================

export async function getPCRSegregationStatuses(
    roleId
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/segregation-statuses?roleId=${encodeURIComponent(roleId)}`
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to load PCR segregation statuses.'
        )

    }


    return data
}


// =========================================
// SAVE PCR ANALYSIS
// =========================================

export async function savePCRAnalysis(
    analysisData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/analysis`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(analysisData)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to save PCR analysis.'
        )

    }


    return data
}


// =========================================
// UPDATE PCR STATUS
// =========================================

export async function updatePCRStatus(
    statusData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/update-status`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(statusData)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to update PCR status.'
        )

    }


    return data
}


// =========================================
// ADD PART CATEGORY
// =========================================

export async function addPartCategory(
    categoryData
) {

    const response =
        await authFetch(
            `${API_BASE_URL}/api/PCRSegregation/part-category`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(categoryData)
            }
        )


    const data =
        await readResponse(response)


    if (!response.ok) {

        throw new Error(
            data.message ||
            'Unable to save part category.'
        )

    }


    return data
}



// PCR Vendor Details

// =========================================
// SHARED PCR API HELPERS
// Append below the existing functions
// =========================================

async function readPCRFileResponse(response) {
    if (!response.ok) {
        let message = 'Unable to download the PCR file.';

        try {
            const data = await response.clone().json();
            message = data.message || message;
        } catch {
            // The response may not contain JSON.
        }

        throw new Error(message);
    }

    return response.blob();
}

async function postPCRRequest(endpoint, payload) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/${endpoint}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }
    );

    const data = await readResponse(response);

    if (!response.ok) {
        throw new Error(data.message || 'PCR request failed.');
    }

    return data;
}

// =========================================
// GET PLANTS
// =========================================

export async function getPCRPlants(bpCode) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/plants/${encodeURIComponent(bpCode || '')}`
    );

    const data = await readResponse(response);

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load plants.');
    }

    return data;
}

// =========================================
// GET VENDORS
// =========================================

export async function getPCRVendors() {
    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/vendors`
    );

    const data = await readResponse(response);

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load vendors.');
    }

    return data;
}

// =========================================
// GET FRANCHISES BY PLANT
// =========================================

export async function getPCRFranchises(plantCode) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/franchises/${encodeURIComponent(plantCode || '')}`
    );

    const data = await readResponse(response);

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load franchises.');
    }

    return data;
}

// =========================================
// SEARCH PCR COMPONENTS
// =========================================

export async function searchPCRComponents(searchData) {
    return postPCRRequest('component-search', searchData);
}

// =========================================
// GET MONTHLY COUNT
// =========================================

export async function getPCRCount(countData) {
    return postPCRRequest('count', countData);
}

// =========================================
// GET VENDOR COUNT
// =========================================

export async function getPCRVendorCount(countData) {
    return postPCRRequest('vendor-count', countData);
}

// =========================================
// SAVE AS DRAFT
// =========================================

export async function savePCRDraft(draftData) {
    return postPCRRequest('save-draft', draftData);
}

// =========================================
// SAVE AND SUBMIT
// =========================================

export async function savePCRSubmit(submitData) {
    return postPCRRequest('save-submit', submitData);
}

// =========================================
// PCR DISPATCH
// =========================================

export async function dispatchPCR(dispatchData) {
    return postPCRRequest('dispatch', dispatchData);
}

// =========================================
// EXPORT NEW FORMAT
// =========================================

export async function exportPCRNew(exportData) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/export-new`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(exportData)
        }
    );

    return readPCRFileResponse(response);
}

// =========================================
// EXPORT OLD FORMAT
// =========================================

export async function exportPCROld(exportData, branchName = '') {
    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/export-old?branchName=${encodeURIComponent(branchName)}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(exportData)
        }
    );

    return readPCRFileResponse(response);
}

// =========================================
// PRINT PCR
// =========================================

export async function printPCR(printData) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/print`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(printData)
        }
    );

    return readPCRFileResponse(response);
}


// =========================================
// PCR REFURBISH VENDOR MASTER
// =========================================

// GET REFURBISH VENDOR MASTER LIST
export async function getPCRRefurbishVendorMasterList(
    searchText = ''
) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/refurbish-vendor-master?searchText=${encodeURIComponent(searchText)}`
    );

    const data = await readResponse(response);

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Unable to load PCR refurbish vendor master list.'
        );
    }

    return data;
}


// GET CONFIG VENDORS
// Reuse the existing vendors endpoint.
export async function getPCRConfigVendors() {
    return getPCRVendors();
}


// ADD OR UPDATE REFURBISH VENDOR MASTER
export async function savePCRRefurbishVendorMaster(
    vendorData,
    action,
    userId
) {
    const payload = {
        ...vendorData,
        Action: action,
        UserId: Number(userId) || 0
    }

    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/refurbish-vendor-master`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.Message ||
            'Unable to save PCR refurbish vendor master.'
        )
    }

    return data
}


// =========================================
// PCR PART CATEGORY MASTER
// Separate from the existing RoleID 6 workflow
// =========================================

// GET PART CATEGORY MASTER LIST
export async function getPCRPartCategoryMasterList(
    searchText = ''
) {
    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/part-category-master?searchText=${encodeURIComponent(searchText)}`
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.Message ||
            'Unable to load PCR Part Category Master.'
        )
    }

    return data
}

// ADD OR UPDATE PART CATEGORY MASTER
export async function savePCRPartCategoryMaster(
    categoryData,
    action,
    userId
) {
    const payload = {
        ...categoryData,
        Action: action,
        UserId: Number(userId) || 0
    }

    const response = await authFetch(
        `${API_BASE_URL}/api/PCRSegregation/part-category-master`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }
    )

    const data = await readResponse(response)

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.Message ||
            'Unable to save PCR Part Category Master.'
        )
    }

    return data
}