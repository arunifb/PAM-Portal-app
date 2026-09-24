import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './TwoFactorAuth.css'

import ifbLogo from '../../assets/ifb-logo.png'

import { verifyTwoFactor } from '../../api/authApi'


function TwoFactorAuth() {

    const navigate = useNavigate()


    // =========================================
    // STATE
    // =========================================

    const [code, setCode] =
        useState('')

    const [message, setMessage] =
        useState('')

    const [messageType, setMessageType] =
        useState('')

    const [isLoading, setIsLoading] =
        useState(false)


    // =========================================
    // CHECK 2FA SESSION
    // =========================================

    useEffect(() => {

        const userId =
            sessionStorage.getItem(
                'twoFactorUserId'
            )


        /*
         * The user should reach this page
         * only after Login has required 2FA.
         *
         * If there is no temporary user ID,
         * send the user back to Login.
         */

        if (!userId) {

            navigate(
                '/',
                {
                    replace: true
                }
            )

        }

    }, [navigate])


    // =========================================
    // CODE CHANGE
    // =========================================

    const handleCodeChange = (event) => {

        const value =
            event.target.value
                .replace(/\D/g, '')
                .slice(0, 6)


        setCode(value)


        /*
         * Clear old message as soon as
         * the user starts entering code again.
         */

        if (message) {

            setMessage('')
            setMessageType('')

        }

    }


    // =========================================
    // VERIFY TWO FACTOR CODE
    // =========================================

    const handleVerify = async (event) => {

        event.preventDefault()


        setMessage('')
        setMessageType('')


        // =========================================
        // CODE VALIDATION
        // =========================================

        if (!code.trim()) {

            setMessage(
                'Please enter the authentication code.'
            )

            setMessageType(
                'error'
            )

            return

        }


        if (code.length !== 6) {

            setMessage(
                'Please enter a valid 6-digit authentication code.'
            )

            setMessageType(
                'error'
            )

            return

        }


        // =========================================
        // GET TEMPORARY USER ID
        // =========================================

        const userId =
            sessionStorage.getItem(
                'twoFactorUserId'
            )


        if (!userId) {

            setMessage(
                'Your login session has expired. Please login again.'
            )

            setMessageType(
                'error'
            )

            return

        }


        try {

            setIsLoading(true)


            // =========================================
            // CALL BACKEND 2FA API
            // =========================================

            const data =
                await verifyTwoFactor(
                    Number(userId),
                    code
                )


            console.log(
                '2FA verification successful:',
                data
            )


            // =========================================
            // MOVE TEMPORARY USER DATA
            // TO NORMAL SESSION
            // =========================================

            const twoFactorUserId =
                sessionStorage.getItem(
                    'twoFactorUserId'
                )

            const twoFactorLoginId =
                sessionStorage.getItem(
                    'twoFactorLoginId'
                )

            const twoFactorUsername =
                sessionStorage.getItem(
                    'twoFactorUsername'
                )

            const twoFactorRoleId =
                sessionStorage.getItem(
                    'twoFactorRoleId'
                )

            const twoFactorBpCode =
                sessionStorage.getItem(
                    'twoFactorBpCode'
                )

            const twoFactorRegionCode =
                sessionStorage.getItem(
                    'twoFactorRegionCode'
                )


            // =========================================
            // SAVE NORMAL SESSION
            // =========================================

            sessionStorage.setItem(
                'userId',
                twoFactorUserId || ''
            )

            sessionStorage.setItem(
                'loginId',
                twoFactorLoginId || ''
            )

            sessionStorage.setItem(
                'username',
                twoFactorUsername || ''
            )

            sessionStorage.setItem(
                'roleId',
                twoFactorRoleId || ''
            )

            sessionStorage.setItem(
                'bpCode',
                twoFactorBpCode || ''
            )

            sessionStorage.setItem(
                'regionCode',
                twoFactorRegionCode || ''
            )


            // =========================================
            // REMOVE TEMPORARY 2FA DATA
            // =========================================

            sessionStorage.removeItem(
                'twoFactorUserId'
            )

            sessionStorage.removeItem(
                'twoFactorLoginId'
            )

            sessionStorage.removeItem(
                'twoFactorUsername'
            )

            sessionStorage.removeItem(
                'twoFactorRoleId'
            )

            sessionStorage.removeItem(
                'twoFactorBpCode'
            )

            sessionStorage.removeItem(
                'twoFactorRegionCode'
            )


            // =========================================
            // GO TO DASHBOARD
            // =========================================

            navigate(
                '/dashboard',
                {
                    replace: true
                }
            )

        }
        catch (error) {

            console.error(
                '2FA verification error:',
                error
            )


            setMessage(
                error.message ||
                'Invalid or expired authentication code.'
            )

            setMessageType(
                'error'
            )

        }
        finally {

            setIsLoading(false)

        }

    }


    // =========================================
    // RESEND CODE
    // =========================================

    const handleResendCode = (event) => {

        event.preventDefault()


        /*
         * IMPORTANT:
         *
         * Your current backend does not have
         * a resend-2fa endpoint.
         *
         * Therefore we do not call a fake API.
         */

        setMessage(
            'Resend Code is not available yet.'
        )

        setMessageType(
            'error'
        )

    }


    // =========================================
    // BACK TO LOGIN
    // =========================================

    const handleBackToLogin = (event) => {

        event.preventDefault()


        // =========================================
        // REMOVE TEMPORARY 2FA DATA
        // =========================================

        sessionStorage.removeItem(
            'twoFactorUserId'
        )

        sessionStorage.removeItem(
            'twoFactorLoginId'
        )

        sessionStorage.removeItem(
            'twoFactorUsername'
        )

        sessionStorage.removeItem(
            'twoFactorRoleId'
        )

        sessionStorage.removeItem(
            'twoFactorBpCode'
        )

        sessionStorage.removeItem(
            'twoFactorRegionCode'
        )


        // =========================================
        // RETURN TO LOGIN
        // =========================================

        navigate(
            '/',
            {
                replace: true
            }
        )

    }


    // =========================================
    // UI
    // =========================================

    return (

        <div className="two-factor-page">

            <div className="two-factor-container">


                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="two-factor-header">

                    <img
                        src={ifbLogo}
                        alt="IFB Industries"
                        className="two-factor-logo"
                    />

                    <h1>
                        Two-factor authentication
                    </h1>

                </div>


                {/* =========================================
                    AUTHENTICATION CARD
                ========================================= */}

                <div className="two-factor-card">

                    <div className="two-factor-card-body">


                        {/* =========================================
                            ICON
                        ========================================= */}

                        <div className="authentication-icon">
                            🔐
                        </div>


                        {/* =========================================
                            TITLE
                        ========================================= */}

                        <h2>
                            Authentication code
                        </h2>


                        {/* =========================================
                            MESSAGE
                        ========================================= */}

                        {message && (

                            <div
                                className={
                                    `two-factor-message ${messageType}`
                                }
                            >
                                {message}
                            </div>

                        )}


                        {/* =========================================
                            FORM
                        ========================================= */}

                        <form
                            onSubmit={handleVerify}
                        >

                            <div className="form-group">

                                <label
                                    htmlFor="authenticationCode"
                                >
                                    Authentication Code
                                </label>


                                <input
                                    id="authenticationCode"
                                    type="text"
                                    className="two-factor-input"
                                    placeholder="XXXXXX"
                                    value={code}
                                    onChange={
                                        handleCodeChange
                                    }
                                    maxLength="6"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    disabled={isLoading}
                                />

                            </div>


                            {/* =========================================
                                VERIFY BUTTON
                            ========================================= */}

                            <button
                                type="submit"
                                className="verify-button"
                                disabled={
                                    isLoading ||
                                    code.length !== 6
                                }
                            >

                                {
                                    isLoading
                                        ? 'Verifying...'
                                        : 'Verify'
                                }

                            </button>

                        </form>


                        {/* =========================================
                            DESCRIPTION
                        ========================================= */}

                        <p className="two-factor-description">

                            We just sent you an authentication code
                            via email and SMS. Enter the code above
                            to verify your identity.

                        </p>

                    </div>

                </div>


                {/* =========================================
                    HELP CARD
                ========================================= */}

                <div className="two-factor-help-card">

                    <div className="two-factor-help-body">

                        <h3>
                            Having problems?
                        </h3>


                        <ul>


                            {/* =========================================
                                RESEND
                            ========================================= */}

                            <li>

                                <a
                                    href="#"
                                    onClick={
                                        handleResendCode
                                    }
                                >
                                    Resend Code
                                </a>

                            </li>


                            {/* =========================================
                                RECOVERY
                            ========================================= */}

                            <li>
                                Use a recovery code or begin
                                2FA account recovery.
                            </li>


                            {/* =========================================
                                NOT RECEIVED
                            ========================================= */}

                            <li>
                                If you didn't receive a code,
                                try again.
                            </li>


                            {/* =========================================
                                BACK TO LOGIN
                            ========================================= */}

                            <li>

                                <a
                                    href="#"
                                    onClick={
                                        handleBackToLogin
                                    }
                                >
                                    Back to Login
                                </a>

                            </li>

                        </ul>

                    </div>

                </div>

            </div>

        </div>

    )

}


export default TwoFactorAuth