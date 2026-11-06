import { useEffect, useRef, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getModelNames,
    verifyAirFryMapping,
    getSpareCodes,
    getSpareDescriptions,
    getSpareInfo,
    getSpareInfoByCode
} from '../../api/sparesApi'

import './SparesSearch.css'

function SparesSearch() {

    // =====================================================
    // MODEL
    // =====================================================

    const [modelName, setModelName] = useState('')
    const [modelSuggestions, setModelSuggestions] = useState([])
    const [showModelSuggestions, setShowModelSuggestions] = useState(false)

    // =====================================================
    // VARIANT
    // =====================================================

    const [variant, setVariant] = useState('Select')
    const [variantEnabled, setVariantEnabled] = useState(false)

    // =====================================================
    // SPARE DESCRIPTION
    // =====================================================

    const [spareDescription, setSpareDescription] = useState('')
    const [descriptionSuggestions, setDescriptionSuggestions] = useState([])
    const [showDescriptionSuggestions, setShowDescriptionSuggestions] =
        useState(false)

    // =====================================================
    // SPARE CODE
    // =====================================================

    const [spareCode, setSpareCode] = useState('')
    const [codeSuggestions, setCodeSuggestions] = useState([])
    const [showCodeSuggestions, setShowCodeSuggestions] = useState(false)

    // =====================================================
    // SPARE INFORMATION
    // =====================================================

    const [spareInfo, setSpareInfo] = useState(null)

    // =====================================================
    // UI STATE
    // =====================================================

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // =====================================================
    // REFS
    // =====================================================

    const modelRef = useRef(null)
    const descriptionRef = useRef(null)
    const codeRef = useRef(null)

    // =====================================================
    // CLEAR ERROR
    // =====================================================

    const clearError = () => {
        setError('')
    }

    // =====================================================
    // CLEAR SPARE INFORMATION
    // =====================================================

    const clearSpareInfo = () => {
        setSpareInfo(null)
    }

    // =====================================================
    // MODEL INPUT CHANGE
    // =====================================================

    const handleModelChange = async (value) => {

        setModelName(value)
        clearError()

        // Same behavior as old page:
        // clearing model clears all dependent fields

        if (!value.trim()) {
            setSpareDescription('')
            setSpareCode('')
            setVariant('Select')
            setVariantEnabled(false)

            setModelSuggestions([])
            setShowModelSuggestions(false)

            clearSpareInfo()

            return
        }

        // User is typing a new model,
        // therefore previous selected result is cleared.

        setSpareInfo(null)
        setSpareDescription('')
        setSpareCode('')
        setVariant('Select')
        setVariantEnabled(false)

        if (value.trim().length < 2) {
            setModelSuggestions([])
            setShowModelSuggestions(false)
            return
        }

        try {
            const suggestions = await getModelNames(value)

            setModelSuggestions(suggestions)
            setShowModelSuggestions(suggestions.length > 0)
        } catch (err) {
            setModelSuggestions([])
            setShowModelSuggestions(false)
            setError(err.message || 'Unable to load model names.')
        }
    }

    // =====================================================
    // MODEL SELECTION
    // =====================================================

    const handleModelSelect = async (selectedModel) => {

        setModelName(selectedModel)

        setModelSuggestions([])
        setShowModelSuggestions(false)

        setSpareDescription('')
        setSpareCode('')

        setVariant('Select')
        setVariantEnabled(false)

        clearSpareInfo()
        clearError()

        setLoading(true)

        try {

            const hasAirFryMapping =
                await verifyAirFryMapping(selectedModel)

            if (hasAirFryMapping) {
                setVariantEnabled(true)
            } else {
                setVariantEnabled(false)
            }

        } catch (err) {

            setVariantEnabled(false)

            setError(
                err.message ||
                'Unable to verify Air Fry mapping.'
            )

        } finally {
            setLoading(false)
        }
    }

    // =====================================================
    // VARIANT CHANGE
    // =====================================================

    const handleVariantChange = (value) => {

        setVariant(value)

        setSpareDescription('')
        setSpareCode('')

        setDescriptionSuggestions([])
        setShowDescriptionSuggestions(false)

        clearSpareInfo()
        clearError()
    }

    // =====================================================
    // SPARE DESCRIPTION CHANGE
    // =====================================================

    const handleDescriptionChange = async (value) => {

        setSpareDescription(value)
        setSpareCode('')

        clearSpareInfo()
        clearError()

        if (!value.trim()) {

            setDescriptionSuggestions([])
            setShowDescriptionSuggestions(false)

            return
        }

        if (!modelName) {
            setDescriptionSuggestions([])
            setShowDescriptionSuggestions(false)
            return
        }

        if (value.trim().length < 2) {

            setDescriptionSuggestions([])
            setShowDescriptionSuggestions(false)

            return
        }

        try {

            const suggestions =
                await getSpareDescriptions(
                    value,
                    modelName,
                    variant
                )

            setDescriptionSuggestions(suggestions)
            setShowDescriptionSuggestions(
                suggestions.length > 0
            )

        } catch (err) {

            setDescriptionSuggestions([])
            setShowDescriptionSuggestions(false)

            setError(
                err.message ||
                'Unable to load spare descriptions.'
            )
        }
    }

    // =====================================================
    // SPARE DESCRIPTION SELECTION
    // =====================================================

    const handleDescriptionSelect = async (selectedDescription) => {

        setSpareDescription(selectedDescription)

        setDescriptionSuggestions([])
        setShowDescriptionSuggestions(false)

        setSpareCode('')

        clearError()

        if (!modelName) {
            return
        }

        setLoading(true)

        try {

            const data =
                await getSpareInfo(
                    selectedDescription,
                    modelName
                )

                console.log('Spare API response:', data)
                console.log('Response property names:', Object.keys(data || {}))

            setSpareInfo(data)

        } catch (err) {

            setSpareInfo(null)

            setError(
                err.message ||
                'Unable to load spare information.'
            )

        } finally {
            setLoading(false)
        }
    }

    // =====================================================
    // SPARE CODE CHANGE
    // =====================================================

    const handleCodeChange = async (value) => {

        setSpareCode(value)

        clearError()

        if (!value.trim()) {

            setCodeSuggestions([])
            setShowCodeSuggestions(false)

            setSpareDescription('')

            clearSpareInfo()

            return
        }

        if (value.trim().length < 2) {

            setCodeSuggestions([])
            setShowCodeSuggestions(false)

            return
        }

        try {

            const suggestions =
                await getSpareCodes(value)

            setCodeSuggestions(suggestions)

            setShowCodeSuggestions(
                suggestions.length > 0
            )

        } catch (err) {

            setCodeSuggestions([])
            setShowCodeSuggestions(false)

            setError(
                err.message ||
                'Unable to load spare codes.'
            )
        }
    }

    // =====================================================
    // SPARE CODE SELECTION
    // =====================================================

    const handleCodeSelect = async (selectedCode) => {

        setSpareCode(selectedCode)

        setCodeSuggestions([])
        setShowCodeSuggestions(false)

        // Same behavior as old page:
        // Selecting spare code clears model search.

        setModelName('')
        setModelSuggestions([])
        setShowModelSuggestions(false)

        setSpareDescription('')

        setVariant('Select')
        setVariantEnabled(false)

        clearError()

        setLoading(true)

        try {

            const data =
                await getSpareInfoByCode(
                    selectedCode
                )

                console.log('Spare API response by code:', data)
                console.log('Response property names:', Object.keys(data || {}))

            setSpareInfo(data)

        } catch (err) {

            setSpareInfo(null)

            setError(
                err.message ||
                'Unable to load spare information.'
            )

        } finally {
            setLoading(false)
        }
    }

    // =====================================================
    // IMAGE ERROR
    // =====================================================

    const handleImageError = (event) => {
        event.currentTarget.style.display = 'none'
    }

    // =====================================================
    // CLOSE AUTOCOMPLETE WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                modelRef.current &&
                !modelRef.current.contains(event.target)
            ) {
                setShowModelSuggestions(false)
            }

            if (
                descriptionRef.current &&
                !descriptionRef.current.contains(event.target)
            ) {
                setShowDescriptionSuggestions(false)
            }

            if (
                codeRef.current &&
                !codeRef.current.contains(event.target)
            ) {
                setShowCodeSuggestions(false)
            }
        }

        document.addEventListener(
            'mousedown',
            handleOutsideClick
        )

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick
            )
        }

    }, [])

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <DashboardLayout title="Spares Details">

            <div className="spares-page">

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="spares-alert spares-alert-error">
                        {error}
                    </div>
                )}

                {/* =================================================
                    SEARCH FILTER BOX
                ================================================= */}

                <div className="spares-filter-box">

                    {/* MODEL NAME */}

                    <div
                        className="spares-filter-item"
                        ref={modelRef}
                    >
                        <label htmlFor="spares-model">
                            Model Name
                        </label>

                        <input
                            id="spares-model"
                            type="text"
                            value={modelName}
                            placeholder="Enter Model Name ..."
                            autoComplete="off"
                            onChange={(event) =>
                                handleModelChange(
                                    event.target.value
                                )
                            }
                            onFocus={() => {
                                if (
                                    modelSuggestions.length > 0
                                ) {
                                    setShowModelSuggestions(true)
                                }
                            }}
                        />

                        {showModelSuggestions && (
                            <div className="spares-autocomplete">

                                {modelSuggestions.map(
                                    (item, index) => (
                                        <button
                                            type="button"
                                            className="spares-autocomplete-item"
                                            key={`${item}-${index}`}
                                            onMouseDown={(event) =>
                                                event.preventDefault()
                                            }
                                            onClick={() =>
                                                handleModelSelect(item)
                                            }
                                        >
                                            {item}
                                        </button>
                                    )
                                )}

                            </div>
                        )}
                    </div>

                    {/* VARIANT */}

                    <div className="spares-filter-item">
                        <label htmlFor="spares-variant">
                            Variant
                        </label>

                        <select
                            id="spares-variant"
                            value={variant}
                            disabled={!variantEnabled}
                            onChange={(event) =>
                                handleVariantChange(
                                    event.target.value
                                )
                            }
                        >
                            <option value="Select">
                                Select Variant
                            </option>

                            <option value="Air Fry">
                                Air Fry
                            </option>

                            <option value="Non Air Fry">
                                Non Air Fry
                            </option>
                        </select>
                    </div>

                    {/* SPARE DESCRIPTION */}

                    <div
                        className="spares-filter-item"
                        ref={descriptionRef}
                    >
                        <label htmlFor="spares-description">
                            Spare Description
                        </label>

                        <input
                            id="spares-description"
                            type="text"
                            value={spareDescription}
                            placeholder="Enter Spare Description ..."
                            autoComplete="off"
                            disabled={!modelName}
                            onChange={(event) =>
                                handleDescriptionChange(
                                    event.target.value
                                )
                            }
                            onFocus={() => {
                                if (
                                    descriptionSuggestions.length > 0
                                ) {
                                    setShowDescriptionSuggestions(
                                        true
                                    )
                                }
                            }}
                        />

                        {showDescriptionSuggestions && (
                            <div className="spares-autocomplete">

                                {descriptionSuggestions.map(
                                    (item, index) => (
                                        <button
                                            type="button"
                                            className="spares-autocomplete-item"
                                            key={`${item}-${index}`}
                                            onMouseDown={(event) =>
                                                event.preventDefault()
                                            }
                                            onClick={() =>
                                                handleDescriptionSelect(
                                                    item
                                                )
                                            }
                                        >
                                            {item}
                                        </button>
                                    )
                                )}

                            </div>
                        )}
                    </div>

                    {/* SPARE CODE */}

                    <div
                        className="spares-filter-item"
                        ref={codeRef}
                    >
                        <label htmlFor="spares-code">
                            Spare Code
                        </label>

                        <input
                            id="spares-code"
                            type="text"
                            value={spareCode}
                            placeholder="Enter Spare Code ..."
                            autoComplete="off"
                            onChange={(event) =>
                                handleCodeChange(
                                    event.target.value
                                )
                            }
                            onFocus={() => {
                                if (
                                    codeSuggestions.length > 0
                                ) {
                                    setShowCodeSuggestions(true)
                                }
                            }}
                        />

                        {showCodeSuggestions && (
                            <div className="spares-autocomplete">

                                {codeSuggestions.map(
                                    (item, index) => (
                                        <button
                                            type="button"
                                            className="spares-autocomplete-item"
                                            key={`${item}-${index}`}
                                            onMouseDown={(event) =>
                                                event.preventDefault()
                                            }
                                            onClick={() =>
                                                handleCodeSelect(item)
                                            }
                                        >
                                            {item}
                                        </button>
                                    )
                                )}

                            </div>
                        )}
                    </div>

                </div>

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (
                    <div className="spares-loading">
                        <div className="spares-loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <span className="spares-loading-text">
                            Loading...
                        </span>
                    </div>
                )}

                {/* =================================================
                    MODEL NAME RESULT
                ================================================= */}

                {modelName && spareInfo && (
                    <div className="spares-report-section">

                        <div className="spares-section-header">
                            Model Information
                        </div>

                        <div className="spares-model-result">
                            <div className="spares-result-label">
                                Model Name
                            </div>

                            <div className="spares-result-value">
                                {modelName}
                            </div>
                        </div>

                    </div>
                )}

                {/* =================================================
                    SPARE INFORMATION
                ================================================= */}

                {spareInfo && (
                    <div className="spares-report-section">

                        <div className="spares-section-header">
                            Spare Information
                        </div>

                        <div className="spares-info-grid">

                            <div className="spares-info-item">
                                <span className="spares-info-label">
                                    Spare Description
                                </span>

                                <span className="spares-info-value">
                                    {spareInfo.spare_Description || 'NA'}
                                </span>
                            </div>

                            <div className="spares-info-item">
                                <span className="spares-info-label">
                                    Spare Code
                                </span>

                                
                                <span className="spares-info-value">
                                    {spareInfo.spare_Code || 'NA'}
                                </span>
                            </div>

                            <div className="spares-info-item">
                                <span className="spares-info-label">
                                    Pricing
                                </span>

                                <span className="spares-info-value">
                                    {spareInfo.pricing?.trim() || 'NA'}
                                </span>
                            </div>

                        </div>

                    </div>
                )}

                {/* =================================================
                    COMPATIBLE MODELS
                ================================================= */}

                {spareInfo &&
                    Array.isArray(spareInfo.modelname) &&
                    spareInfo.modelname.length > 0 && (

                        <div className="spares-report-section">

                            <div className="spares-section-header">
                                Compatible Models
                            </div>

                            <div className="spares-table-wrapper">

                                <table className="spares-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                S.No
                                            </th>

                                            <th>
                                                Model Name
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {spareInfo.modelname.map(
                                            (model, index) => (
                                                <tr
                                                    key={`${model}-${index}`}
                                                >
                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td>
                                                        {model}
                                                    </td>
                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>
                    )}

                {/* =================================================
                    IMAGE
                ================================================= */}

                {/* =================================================
                    IMAGE
                ================================================= */}

                {spareInfo && (
                    <div className="spares-report-section">
                        <div className="spares-section-header">
                            Spare Image
                        </div>

                        <div className="spares-image-container">
                            {spareInfo.image ? (
                                <img
                                    src={spareInfo.image}
                                    alt={spareInfo.spare_Description || 'Spare'}
                                    className="spares-image"
                                    onError={(event) => {
                                        console.error(
                                            'Failed to load spare image:',
                                            event.currentTarget.src
                                        )
                                    }}
                                />
                            ) : (
                                <p>Image not available.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* =================================================
                    NO RESULT
                ================================================= */}

                {!loading &&
                    !spareInfo &&
                    !error &&
                    (modelName ||
                        spareDescription ||
                        spareCode) && (
                        <div className="spares-no-record">
                            Select a model, spare description,
                            or spare code to view details.
                        </div>
                    )}

            </div>

        </DashboardLayout>
    )
}

export default SparesSearch