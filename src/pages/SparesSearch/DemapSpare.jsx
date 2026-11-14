
import { useEffect, useRef, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import {
    getModelNames,
    getSpareDescriptions,
    getSpareInfo
} from '../../api/sparesApi'

import './DemapSpare.css'

function DemapSpare() {

    // =====================================================
    // MODEL
    // =====================================================

    const [modelName, setModelName] = useState('')
    const [modelSuggestions, setModelSuggestions] = useState([])
    const [showModelSuggestions, setShowModelSuggestions] = useState(false)

    // =====================================================
    // SPARE DESCRIPTION
    // =====================================================

    const [spareDescription, setSpareDescription] = useState('')
    const [descriptionSuggestions, setDescriptionSuggestions] = useState([])
    const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false)

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
        setSpareDescription('')

        setDescriptionSuggestions([])
        setShowDescriptionSuggestions(false)

        setModelSuggestions([])
        setShowModelSuggestions(false)

        clearSpareInfo()
        setError('')

        if (!value.trim() || value.trim().length < 2) {
            return
        }

        try {

            const suggestions = await getModelNames(value)

            setModelSuggestions(suggestions)
            setShowModelSuggestions(suggestions.length > 0)

        } catch (err) {

            setError(err.message || 'Unable to load model names.')

        }
    }

    // =====================================================
    // MODEL SELECTION
    // =====================================================

    const handleModelSelect = (selectedModel) => {

        setModelName(selectedModel)

        setModelSuggestions([])
        setShowModelSuggestions(false)

        setSpareDescription('')

        setDescriptionSuggestions([])
        setShowDescriptionSuggestions(false)

        clearSpareInfo()
        setError('')
    }

    // =====================================================
    // SPARE DESCRIPTION CHANGE
    // =====================================================

    const handleDescriptionChange = async (value) => {

        setSpareDescription(value)

        clearSpareInfo()
        setError('')

        if (!value.trim() || value.trim().length < 2 || !modelName) {

            setDescriptionSuggestions([])
            setShowDescriptionSuggestions(false)

            return
        }

        try {

            const suggestions = await getSpareDescriptions(
                value,
                modelName,
                'Select'
            )

            setDescriptionSuggestions(suggestions)
            setShowDescriptionSuggestions(suggestions.length > 0)

        } catch (err) {

            setDescriptionSuggestions([])
            setShowDescriptionSuggestions(false)

            setError(err.message || 'Unable to load spare descriptions.')

        }
    }

    // =====================================================
    // SPARE DESCRIPTION SELECTION
    // =====================================================

    const handleDescriptionSelect = async (selectedDescription) => {

        setSpareDescription(selectedDescription)

        setDescriptionSuggestions([])
        setShowDescriptionSuggestions(false)

        clearSpareInfo()
        setError('')
        setLoading(true)

        try {

            const data = await getSpareInfo(
                selectedDescription,
                modelName
            )

            setSpareInfo(data)

        } catch (err) {

            setError(
                err.message || 'Unable to load spare information.'
            )

        } finally {

            setLoading(false)

        }
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
        }

        document.addEventListener('mousedown', handleOutsideClick)

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
        }

    }, [])

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <DashboardLayout title="De-Map Spare">

            <div className="demap-page">

                {/* ERROR */}

                {error && (
                    <div className="demap-alert demap-alert-error">
                        {error}
                    </div>
                )}

                {/* SEARCH FILTER BOX */}

                <div className="demap-filter-box">

                    {/* MODEL NAME */}

                    <div
                        className="demap-filter-item"
                        ref={modelRef}
                    >

                        <label htmlFor="demap-model">
                            Model Name
                        </label>

                        <input
                            id="demap-model"
                            type="text"
                            value={modelName}
                            placeholder="Enter Model Name ..."
                            autoComplete="off"
                            onChange={(event) =>
                                handleModelChange(event.target.value)
                            }
                            onFocus={() => {
                                if (modelSuggestions.length > 0) {
                                    setShowModelSuggestions(true)
                                }
                            }}
                        />

                        {showModelSuggestions && (
                            <div className="demap-autocomplete">

                                {modelSuggestions.map((item, index) => (

                                    <button
                                        type="button"
                                        className="demap-autocomplete-item"
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

                                ))}

                            </div>
                        )}

                    </div>

                    {/* SPARE DESCRIPTION + DE-MAP BUTTON */}

                    <div
                        className="demap-filter-item"
                        ref={descriptionRef}
                    >

                        <label htmlFor="demap-description">
                            Spare Description
                        </label>

                        <div className="demap-description-input-row">

                            <input
                                id="demap-description"
                                type="text"
                                value={spareDescription}
                                placeholder="Enter Spare Description ..."
                                autoComplete="off"
                                disabled={!modelName}
                                onChange={(event) =>
                                    handleDescriptionChange(event.target.value)
                                }
                                onFocus={() => {
                                    if (descriptionSuggestions.length > 0) {
                                        setShowDescriptionSuggestions(true)
                                    }
                                }}
                            />

                            {spareDescription.trim() && (
                                <button
                                    type="button"
                                    className="demap-button"
                                    disabled
                                    title="Delete API is pending from backend."
                                >
                                    De-Map Spare
                                </button>
                            )}

                        </div>

                        {showDescriptionSuggestions && (
                            <div className="demap-autocomplete">

                                {descriptionSuggestions.map((item, index) => (

                                    <button
                                        type="button"
                                        className="demap-autocomplete-item"
                                        key={`${item}-${index}`}
                                        onMouseDown={(event) =>
                                            event.preventDefault()
                                        }
                                        onClick={() =>
                                            handleDescriptionSelect(item)
                                        }
                                    >
                                        {item}
                                    </button>

                                ))}

                            </div>
                        )}

                    </div>

                </div>

                {/* LOADING */}

                {loading && (
                    <div className="demap-loading">
                        Loading...
                    </div>
                )}

                {/* MODEL INFORMATION */}

                {spareInfo && (
                    <div className="demap-report-section">

                        <div className="demap-section-header">
                            Model Information
                        </div>

                        <div className="demap-model-result">

                            <div className="demap-result-label">
                                Model Name
                            </div>

                            <div className="demap-result-value">
                                {modelName}
                            </div>

                        </div>

                    </div>
                )}

                {/* SPARE INFORMATION */}

                {spareInfo && (
                    <div className="demap-report-section">

                        <div className="demap-section-header">
                            Spare Information
                        </div>

                        <div className="demap-info-grid">

                            <div className="demap-info-item">

                                <span className="demap-info-label">
                                    Spare Description
                                </span>

                                <span className="demap-info-value">
                                    {spareInfo.spare_Description ||
                                        spareInfo.Spare_Description ||
                                        'NA'}
                                </span>

                            </div>

                            <div className="demap-info-item">

                                <span className="demap-info-label">
                                    Spare Code
                                </span>

                                <span className="demap-info-value">
                                    {spareInfo.spare_Code ||
                                        spareInfo.Spare_Code ||
                                        'NA'}
                                </span>

                            </div>

                            <div className="demap-info-item">

                                <span className="demap-info-label">
                                    Pricing
                                </span>

                                <span className="demap-info-value">
                                    {(
                                        spareInfo.pricing ??
                                        spareInfo.Pricing ??
                                        ''
                                    ).toString().trim() || 'NA'}
                                </span>

                            </div>

                        </div>

                    </div>
                )}

                {/* NO RESULT */}

                {!loading && !spareInfo && !error &&
                    (modelName || spareDescription) && (
                        <div className="demap-no-record">
                            Select a model and spare description to view details.
                        </div>
                    )}

            </div>

        </DashboardLayout>
    )
}

export default DemapSpare
