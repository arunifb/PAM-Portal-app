import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './ResetPassword.css'

import ifbLogo from '../../assets/ifb-logo.png'

import {
    forgotPassword,
    resetPassword
} from '../../api/passwordApi'


function ResetPassword() {

    // =========================================
    // STATE
    // =========================================

    const [loginId, setLoginId] =
        useState('')

    const [verificationCode, setVerificationCode] =
        useState('')

    const [newPassword, setNewPassword] =
        useState('')

    const [message, setMessage] =
        useState('')

    const [messageType, setMessageType] =
        useState('')

    const [showVerification, setShowVerification] =
        useState(false)

    const [requestSubmitted, setRequestSubmitted] =
        useState(false)

    const [passwordResetSuccessful, setPasswordResetSuccessful] =
        useState(false)

    const [isLoading, setIsLoading] =
        useState(false)


    const navigate = useNavigate()


    // =========================================
    // REQUEST PASSWORD RESET
    // =========================================

    const handleResetRequest = async (event) => {

        event.preventDefault()

        setMessage('')
        setMessageType('')

        if (!loginId.trim()) {

            setMessage(
                'Please enter valid login-id.'
            )

            setMessageType(
                'error'
            )

            return
        }

        try {

            setIsLoading(true)

            const data =
                await forgotPassword(
                    loginId.trim()
                )

            setShowVerification(true)

            setRequestSubmitted(true)

            setMessage(
                data.message
            )

            setMessageType(
                'success'
            )

        }
        catch (error) {

            console.error(
                'Forgot password error:',
                error
            )

            setMessage(
                error.message ||
                'Unable to request password reset.'
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
    // RESET PASSWORD
    // =========================================

    const handlePasswordReset = async (event) => {

        event.preventDefault()

        setMessage('')
        setMessageType('')

        if (!verificationCode.trim()) {

            setMessage(
                'Please enter the verification code.'
            )

            setMessageType(
                'error'
            )

            return
        }

        if (verificationCode.length !== 6) {

            setMessage(
                'Please enter a valid 6-digit verification code.'
            )

            setMessageType(
                'error'
            )

            return
        }

        if (!newPassword.trim()) {

            setMessage(
                'Please enter a new password.'
            )

            setMessageType(
                'error'
            )

            return
        }

        try {

            setIsLoading(true)

            await resetPassword(
                loginId.trim(),
                verificationCode,
                newPassword
            )

            setMessage(
                'Password reset successfully.'
            )

            setMessageType(
                'success'
            )

            setPasswordResetSuccessful(
                true
            )

            setTimeout(() => {

                navigate('/')

            }, 3000)

        }
        catch (error) {

            console.error(
                'Reset password error:',
                error
            )

            setMessage(
                error.message ||
                'Password reset failed.'
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
    // BACK TO LOGIN
    // =========================================

    const handleBackToLogin = (event) => {

        event.preventDefault()

        navigate('/')

    }


    // =========================================
    // UI
    // =========================================

    return (

        <div className="reset-password-page">

            <div className="reset-password-container">

                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="reset-password-header">

                    <img
                        src={ifbLogo}
                        alt="IFB Industries"
                        className="reset-password-logo"
                    />

                    <h1>
                        Reset Password
                    </h1>

                    <p>
                        You can reset your password here.
                    </p>

                </div>


                {/* =========================================
                    RESET PASSWORD CARD
                ========================================= */}

                <div className="reset-password-card">

                    <div className="reset-password-card-header">

                        <div>

                            <p>
                                Enter your Login-ID to request a password reset.
                            </p>

                        </div>

                    </div>


                    {/* =========================================
                        LOGIN ID FORM
                    ========================================= */}

                    <form
                        onSubmit={
                            handleResetRequest
                        }
                    >

                        <div className="form-group">

                            <label htmlFor="loginId">
                                Login-ID
                            </label>

                            <input
                                id="loginId"
                                type="text"
                                className="form-input"
                                value={loginId}
                                onChange={(event) => {

                                    setLoginId(
                                        event.target.value
                                    )

                                    if (message) {

                                        setMessage('')
                                        setMessageType('')

                                    }

                                }}
                                disabled={
                                    requestSubmitted ||
                                    isLoading
                                }
                                autoComplete="off"
                            />

                        </div>


                        {!requestSubmitted && (

                            <button
                                type="submit"
                                className="request-reset-button"
                                disabled={isLoading}
                            >

                                {
                                    isLoading
                                        ? 'Sending...'
                                        : 'Request Reset'
                                }

                            </button>

                        )}

                    </form>


                    {/* =========================================
                        VERIFICATION SECTION
                    ========================================= */}

                    {showVerification && (

                        <div className="verification-section">

                            {passwordResetSuccessful ? (

                                <>

                                    <div className="reset-message success">

                                        Password reset successfully.

                                    </div>


                                    <div className="back-to-login">

                                        <a
                                            href="/"
                                            onClick={
                                                handleBackToLogin
                                            }
                                        >
                                            Back to Login
                                        </a>

                                    </div>

                                </>

                            ) : (

                                <>

                                    {/* MESSAGE */}

                                    {message && (

                                        <div
                                            className={
                                                `reset-message ${messageType}`
                                            }
                                        >
                                            {message}
                                        </div>

                                    )}


                                    <h3>
                                        Two-factor authentication (2FA)
                                    </h3>


                                    <p className="verification-description">

                                        Enter the verification code sent to
                                        your registered email address and
                                        mobile number.

                                    </p>


                                    {/* VERIFICATION CODE */}

                                    <div className="form-group">

                                        <label
                                            htmlFor="verificationCode"
                                        >
                                            Enter 2FA Code
                                        </label>

                                        <input
                                            id="verificationCode"
                                            type="text"
                                            className="form-input"
                                            value={verificationCode}
                                            onChange={(event) => {

                                                const value =
                                                    event.target.value
                                                        .replace(/\D/g, '')
                                                        .slice(0, 6)

                                                setVerificationCode(
                                                    value
                                                )

                                                if (message) {

                                                    setMessage('')
                                                    setMessageType('')

                                                }

                                            }}
                                            maxLength="6"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            disabled={isLoading}
                                        />

                                    </div>


                                    {/* NEW PASSWORD */}

                                    <div className="form-group">

                                        <label
                                            htmlFor="newPassword"
                                        >
                                            New Password
                                        </label>

                                        <input
                                            id="newPassword"
                                            type="password"
                                            className="form-input"
                                            value={newPassword}
                                            onChange={(event) => {

                                                setNewPassword(
                                                    event.target.value
                                                )

                                                if (message) {

                                                    setMessage('')
                                                    setMessageType('')

                                                }

                                            }}
                                            maxLength="12"
                                            autoComplete="new-password"
                                            disabled={isLoading}
                                        />

                                    </div>


                                    {/* RESET BUTTON */}

                                    <button
                                        type="button"
                                        className="reset-password-button"
                                        onClick={
                                            handlePasswordReset
                                        }
                                        disabled={isLoading}
                                    >

                                        {
                                            isLoading
                                                ? 'Resetting...'
                                                : 'Reset Password'
                                        }

                                    </button>

                                </>

                            )}

                        </div>

                    )}

                </div>


                {/* =========================================
                    BACK TO LOGIN
                ========================================= */}

                {!passwordResetSuccessful && (

                    <div className="back-to-login">

                        <a
                            href="/"
                            onClick={
                                handleBackToLogin
                            }
                        >
                            Back to Login
                        </a>

                    </div>

                )}

            </div>

        </div>

    )

}


export default ResetPassword