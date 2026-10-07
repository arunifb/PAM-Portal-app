import { useState } from 'react'

import { addPartCategory } from '../../api/pcrApi'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import './AddPartCategory.css'


function AddPartCategory({
    pcrState,
    onBack
}) {


    // =====================================================
    // FORM STATE
    // =====================================================

    const [subCategory, setSubCategory] = useState('')
    const [partCode, setPartCode] = useState('')
    const [partCategory, setPartCategory] = useState('')


    // =====================================================
    // MESSAGE STATE
    // =====================================================

    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')


    // =====================================================
    // LOADING STATE
    // =====================================================

    const [loading, setLoading] = useState(false)


    // =====================================================
    // VALIDATION STATE
    // =====================================================

    const [errors, setErrors] = useState({
        subCategory: '',
        partCode: '',
        partCategory: ''
    })


    // =====================================================
    // CLEAR MESSAGE
    // =====================================================

    const clearMessage = () => {

        setMessage('')
        setMessageType('')

    }


    // =====================================================
    // HANDLE FIELD CHANGE
    // =====================================================

    const handleFieldChange = (
        field,
        value
    ) => {

        clearMessage()

        setErrors(prev => ({
            ...prev,
            [field]: ''
        }))


        if (field === 'subCategory') {

            setSubCategory(value)

        }
        else if (field === 'partCode') {

            setPartCode(value)

        }
        else if (field === 'partCategory') {

            setPartCategory(value)

        }

    }


    // =====================================================
    // VALIDATE FORM
    // =====================================================

    const validateForm = () => {

        const newErrors = {
            subCategory: '',
            partCode: '',
            partCategory: ''
        }

        let isValid = true


        // =================================================
        // SUB CATEGORY
        // =================================================

        if (!subCategory.trim()) {

            newErrors.subCategory =
                'Sub Category must be filled out.'

            isValid = false

        }


        // =================================================
        // PART CODE
        // =================================================

        if (!partCode) {

            newErrors.partCode =
                'Part Code must be filled out.'

            isValid = false

        }


        // =================================================
        // PART CATEGORY
        // =================================================

        if (!partCategory) {

            newErrors.partCategory =
                'Part Category must be filled out.'

            isValid = false

        }


        setErrors(newErrors)

        return isValid

    }


    // =====================================================
    // SAVE & SUBMIT
    // =====================================================

    const handleSave = async () => {

        clearMessage()


        // =================================================
        // VALIDATE FORM
        // =================================================

        if (!validateForm()) {

            return

        }


        // =================================================
        // PREPARE API DATA
        // =================================================

        const categoryData = {

            // Old WebForms:
            // txtSubCategory.Text.Trim()

            subCategory:
                subCategory.trim(),

            // Old WebForms:
            // txtPartCode.Text

            partCode:
                partCode,

            // Old WebForms:
            // txtPartCategory.Text

            partCategory:
                partCategory

        }


        try {

            setLoading(true)


            // =================================================
            // CALL API
            // =================================================

            const data =
                await addPartCategory(
                    categoryData
                )


            // =================================================
            // API RESPONSE
            // =================================================

            if (data?.isSuccess) {

                setMessage(
                    data.message ||
                    'Data saved and submitted successfully'
                )

                setMessageType('success')


                // =============================================
                // CLEAR FORM ONLY AFTER SUCCESS
                // =============================================

                setSubCategory('')
                setPartCode('')
                setPartCategory('')


                setErrors({
                    subCategory: '',
                    partCode: '',
                    partCategory: ''
                })


                // =============================================
                // HIDE SUCCESS MESSAGE AFTER 2 SECONDS
                // =============================================

                setTimeout(() => {

                    setMessage('')
                    setMessageType('')

                }, 2000)

            }
            else {

                // =============================================
                // API RETURNED FAILURE
                // =============================================

                setMessage(
                    data?.message ||
                    'Unable to save part category.'
                )

                setMessageType('error')

            }

        }
        catch (error) {

            // =================================================
            // API / NETWORK ERROR
            // =================================================

            setMessage(
                error?.message ||
                'Unable to save part category.'
            )

            setMessageType('error')

        }
        finally {

            setLoading(false)

        }

    }


    // =====================================================
    // BACK TO PCR
    // =====================================================
    //
    // IMPORTANT:
    // Do NOT use navigate().
    //
    // PCR.jsx passes onBack={handleBackToPCR}.
    //
    // This immediately changes:
    //
    // activePage = 'add-category'
    //
    // to:
    //
    // activePage = 'pcr'
    //
    // Therefore the PCR RouteKey stays in the browser URL.
    //
    // =====================================================

    const handleBack = () => {

        if (loading) {

            return

        }


        if (onBack) {

            onBack()

        }

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <DashboardLayout title="Add Part Category">

            <div className="add-part-category-page">


                {/* =========================================
                    PAGE HEADER
                ========================================= */}

                <div className="add-part-category-header">

                    <button
                        type="button"
                        className="add-part-category-back-btn"
                        onClick={handleBack}
                        disabled={loading}
                    >
                        ← Back
                    </button>

                </div>


                {/* =========================================
                    MESSAGE
                ========================================= */}

                {message && (

                    <div
                        className={
                            `add-part-category-message ${messageType}`
                        }
                    >
                        {message}
                    </div>

                )}


                {/* =========================================
                    FORM BOX
                ========================================= */}

                <div className="add-part-category-box">

                    <div className="add-part-category-form">


                        {/* =====================================
                            SUB CATEGORY
                        ===================================== */}

                        <div className="add-part-category-field">

                            <label htmlFor="subCategory">

                                Sub Category

                                <span className="required">
                                    *
                                </span>

                            </label>


                            <input
                                id="subCategory"
                                type="text"
                                className={
                                    errors.subCategory
                                        ? 'input-error'
                                        : ''
                                }
                                placeholder="eg:-FL/TL"
                                value={subCategory}
                                disabled={loading}
                                onChange={(e) =>
                                    handleFieldChange(
                                        'subCategory',
                                        e.target.value
                                    )
                                }
                            />


                            {errors.subCategory && (

                                <div className="field-error">
                                    {errors.subCategory}
                                </div>

                            )}

                        </div>


                        {/* =====================================
                            PART CODE
                        ===================================== */}

                        <div className="add-part-category-field">

                            <label htmlFor="partCode">

                                Part Code

                                <span className="required">
                                    *
                                </span>

                            </label>


                            <input
                                id="partCode"
                                type="text"
                                className={
                                    errors.partCode
                                        ? 'input-error'
                                        : ''
                                }
                                placeholder="eg:-component no."
                                value={partCode}
                                disabled={loading}
                                onChange={(e) =>
                                    handleFieldChange(
                                        'partCode',
                                        e.target.value
                                    )
                                }
                            />


                            {errors.partCode && (

                                <div className="field-error">
                                    {errors.partCode}
                                </div>

                            )}

                        </div>


                        {/* =====================================
                            PART CATEGORY
                        ===================================== */}

                        <div className="add-part-category-field">

                            <label htmlFor="partCategory">

                                Part Category

                                <span className="required">
                                    *
                                </span>

                            </label>


                            <input
                                id="partCategory"
                                type="text"
                                value={partCategory}
                                className={
                                    errors.partCategory
                                        ? 'input-error'
                                        : ''
                                }
                                disabled={loading}
                                onChange={(e) =>
                                    handleFieldChange(
                                        'partCategory',
                                        e.target.value
                                    )
                                }
                            />


                            {errors.partCategory && (

                                <div className="field-error">
                                    {errors.partCategory}
                                </div>

                            )}

                        </div>

                    </div>


                    {/* =========================================
                        ACTIONS
                    ========================================= */}

                    <div className="add-part-category-actions">

                        <button
                            type="button"
                            className="add-part-category-save-btn"
                            onClick={handleSave}
                            disabled={loading}
                        >

                            {loading
                                ? 'Saving...'
                                : 'Save & Submit'}

                        </button>

                    </div>

                </div>

            </div>

        </DashboardLayout>

    )

}


export default AddPartCategory