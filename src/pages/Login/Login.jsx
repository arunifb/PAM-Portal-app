import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import './Login.css'

import ifbLogo from '../../assets/ifb-logo.png'
import { UserRound, KeyRound } from 'lucide-react'

import { login } from '../../api/authApi'

import {
    getRecaptchaToken,
    loadRecaptcha
} from '../../utils/recaptcha'


function Login() {

    // =========================================
    // STATE
    // =========================================

    const [username, setUsername] =
        useState('')

    const [password, setPassword] =
        useState('')

    const [showPassword, setShowPassword] =
        useState(false)

    const [message, setMessage] =
        useState('')

    const [isLoading, setIsLoading] =
        useState(false)


    const navigate = useNavigate()


    // =========================================
    // LOAD reCAPTCHA
    // =========================================

    useEffect(() => {

        loadRecaptcha().catch((error) => {

            console.error(
                'Failed to preload reCAPTCHA:',
                error
            )

        })

    }, [])


    // =========================================
    // LOGIN
    // =========================================

    const handleLogin = async () => {

        setMessage('')


        // =========================================
        // USERNAME VALIDATION
        // =========================================

        if (username.trim() === '') {

            setMessage(
                'Please enter your username.'
            )

            return

        }


        // =========================================
        // PASSWORD VALIDATION
        // =========================================

        if (password.trim() === '') {

            setMessage(
                'Please enter your password.'
            )

            return

        }


        try {

            setIsLoading(true)


            // =========================================
            // GET reCAPTCHA TOKEN
            // =========================================

            console.time('reCAPTCHA')

            const recaptchaToken =
                await getRecaptchaToken()

            console.timeEnd('reCAPTCHA')


            // =========================================
            // LOGIN API
            //
            // authApi.js automatically:
            //
            // 1. Gets OAuth access token
            // 2. Adds Bearer token
            // 3. Calls /api/Auth/login
            //
            // =========================================

            console.time('API Login')

            const data =
                await login(
                    username.trim(),
                    password,
                    recaptchaToken
                )

            console.timeEnd('API Login')


            // =========================================
            // CHECK TWO-FACTOR AUTHENTICATION
            // =========================================

            if (data.requiresTwoFactor) {

                // =========================================
                // TEMPORARY 2FA USER DATA
                // =========================================

                sessionStorage.setItem(
                    'twoFactorUserId',
                    String(data.userId)
                )

                sessionStorage.setItem(
                    'twoFactorLoginId',
                    data.loginid || ''
                )

                sessionStorage.setItem(
                    'twoFactorUsername',
                    data.username || ''
                )

                sessionStorage.setItem(
                    'twoFactorRoleId',
                    String(data.roleID ?? '')
                )

                sessionStorage.setItem(
                    'twoFactorBpCode',
                    data.bpCode || ''
                )

                sessionStorage.setItem(
                    'twoFactorRegionCode',
                    data.regionCode || ''
                )


                // =========================================
                // TEMPORARY 2FA MULTIPLE ROLES
                // =========================================

                sessionStorage.setItem(
                    'twoFactorRoles',
                    JSON.stringify(data.roles || [])
                )

                sessionStorage.setItem(
                    'twoFactorRegions',
                    data.regions || ''
                )

                sessionStorage.setItem(
                    'twoFactorBranches',
                    data.branches || ''
                )


                // =========================================
                // GO TO 2FA
                // =========================================

                navigate('/2fa')

                return

            }


            // =========================================
            // NORMAL LOGIN
            // =========================================

            sessionStorage.setItem(
                'userId',
                String(data.userId)
            )

            sessionStorage.setItem(
                'loginId',
                data.loginid || ''
            )

            sessionStorage.setItem(
                'username',
                data.username || ''
            )

            sessionStorage.setItem(
                'roleId',
                String(data.roleID ?? '')
            )


            // =========================================
            // BP CODE
            // =========================================

            sessionStorage.setItem(
                'bpCode',
                String(
                    data.bpCode ||
                    data.BPCode ||
                    data.branches ||
                    ''
                )
            )


            // =========================================
            // REGION CODE
            // =========================================

            sessionStorage.setItem(
                'regionCode',
                String(
                    data.regionCode ||
                    data.RegionCode ||
                    data.regions ||
                    ''
                )
            )


            // =========================================
            // STORE MULTIPLE ROLES
            // =========================================

            sessionStorage.setItem(
                'roles',
                JSON.stringify(data.roles || [])
            )

            sessionStorage.setItem(
                'regions',
                data.regions || ''
            )

            sessionStorage.setItem(
                'branches',
                data.branches || ''
            )


            // =========================================
            // GO TO DASHBOARD
            // =========================================

            navigate('/dashboard')

        }
        catch (error) {

            console.error(
                'Login error:',
                error
            )

            setMessage(
                error?.message ||
                'Login failed.'
            )

        }
        finally {

            setIsLoading(false)

        }

    }


    // =========================================
    // UI
    // =========================================

    return (

        <div className="login-page">

            <div className="login-card">


                {/* =========================================
                    LEFT / PAM BRAND SECTION
                ========================================= */}

                <section className="login-brand-section">

                    <div className="brand-content">

                        <img
                            src={ifbLogo}
                            alt="IFB Industries"
                            className="ifb-logo"
                        />

                        <div className="brand-divider"></div>

                        <div className="brand-subtitle">
                            PAM Portal
                        </div>

                    </div>


                    <div className="welcome-content">

                        <div className="portal-label">
                            PRIVILEGED ACCESS MANAGEMENT
                        </div>

                        <h1>
                            Welcome Back
                        </h1>

                        <p>
                            Securely access the PAM Portal to manage
                            privileged accounts, emergency users and
                            authorized system access.
                        </p>

                    </div>


                    <div className="brand-security">

                        <div className="security-icon">
                            🔐
                        </div>

                        <div className="security-text">

                            <strong>
                                Secure Access
                            </strong>

                            <span>
                                Your access is protected with
                                enhanced authentication and
                                security controls.
                            </span>

                        </div>

                    </div>

                </section>


                {/* =========================================
                    RIGHT / LOGIN SECTION
                ========================================= */}

                <section className="login-form-section">


                    {/* =========================================
                        LOGIN HEADER
                    ========================================= */}

                    <div className="login-header">

                        <div className="small-title">
                            PAM Portal
                        </div>

                        <h2>
                            Sign in to your account
                        </h2>

                        <p>
                            Enter your Login-ID and Password
                            to continue.
                        </p>

                    </div>


                    {/* =========================================
                        SAP EMERGENCY USER REVIEW
                    ========================================= */}

                    <div className="pam-review">

                        <div className="pam-review-icon">
                            🔐
                        </div>

                        <div className="pam-review-content">

                            <div className="pam-review-title">
                                SAP Emergency User Review
                            </div>

                            <div className="pam-review-subtitle">
                                PAM Portal
                            </div>

                        </div>

                        <div className="pam-review-badge">
                            PAM
                        </div>

                    </div>


                    {/* =========================================
                        MESSAGE
                    ========================================= */}

                    {message && (

                        <div className="login-message show">
                            {message}
                        </div>

                    )}


                    {/* =========================================
                        LOGIN FORM
                    ========================================= */}

                    <form
                        onSubmit={(event) => {

                            event.preventDefault()

                            handleLogin()

                        }}
                    >


                        {/* =========================================
                            USERNAME
                        ========================================= */}

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="username"
                            >
                                Login-ID
                            </label>

                            <div className="input-icon-wrapper">

                                <UserRound
                                    size={18}
                                    strokeWidth={2.5}
                                    className="input-icon"
                                />

                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="form-input"
                                    autoComplete="off"
                                    placeholder="Enter your loginID"
                                    value={username}
                                    onChange={(event) => {

                                        setUsername(
                                            event.target.value
                                        )

                                        setMessage('')

                                    }}
                                    disabled={isLoading}
                                />

                            </div>

                        </div>


                        {/* =========================================
                            PASSWORD
                        ========================================= */}

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="password"
                            >
                                Password
                            </label>

                            <div className="input-icon-wrapper">

                                <KeyRound
                                    size={18}
                                    strokeWidth={2.5}
                                    className="input-icon"
                                />

                                <input
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    autoComplete="off"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => {

                                        setPassword(
                                            event.target.value
                                        )

                                        setMessage('')

                                    }}
                                    disabled={isLoading}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={isLoading}
                                >

                                    {
                                        showPassword
                                            ? 'Hide'
                                            : 'Show'
                                    }

                                </button>

                            </div>

                        </div>


                        {/* =========================================
                            RESET PASSWORD
                        ========================================= */}

                        <div className="reset-password">

                            <Link to="/reset-password">
                                Reset Your Password? Click here
                            </Link>

                        </div>


                        {/* =========================================
                            CAPTCHA INFORMATION
                        ========================================= */}

                        <div className="captcha-info">

                            <span className="captcha-info-icon">
                                🔒
                            </span>

                            <span>
                                This login is protected by
                                reCAPTCHA Enterprise.
                            </span>

                        </div>


                        {/* =========================================
                            LOGIN BUTTON
                        ========================================= */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading}
                        >

                            {
                                isLoading
                                    ? 'Logging in...'
                                    : 'Login'
                            }

                        </button>

                    </form>


                    {/* =========================================
                        FOOTER
                    ========================================= */}

                    <div className="login-footer">

                        © IFB Industries Ltd. &nbsp;|&nbsp;
                        PAM Portal

                    </div>

                </section>

            </div>

        </div>

    )

}


export default Login