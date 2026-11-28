
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import './Login.css'

import ifbLogo from '../../assets/ifb-logo.png'

import {
    UserRound,
    KeyRound
} from 'lucide-react'

import { login } from '../../api/authApi'

import {
    getRecaptchaToken,
    loadRecaptcha
} from '../../utils/recaptcha'


function Login() {

    // =========================================
    // STATE
    // =========================================

    const [username, setUsername] = useState('')

    const [password, setPassword] = useState('')

    const [showPassword, setShowPassword] = useState(false)

    const [message, setMessage] = useState('')

    const [isLoading, setIsLoading] = useState(false)


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
            // =========================================

            console.time('API Login')

            const data = await login(
                username.trim(),
                password,
                recaptchaToken
            )

            console.timeEnd('API Login')


            // =========================================
            // TWO-FACTOR AUTHENTICATION
            // =========================================

            if (data.requiresTwoFactor) {

                // TEMPORARY USER DATA

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


                // TEMPORARY MULTIPLE ROLES

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


                // NAVIGATE TO 2FA

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
            // MULTIPLE ROLES
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
            // DASHBOARD
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

            {/* MAIN LOGIN AREA */}

            <main className="login-main">

                <div className="login-card">


                    {/* =====================================
                        IFB LOGO
                    ===================================== */}

                    <div className="login-logo-area">

                        <img
                            src={ifbLogo}
                            alt="IFB Industries"
                            className="login-logo"
                        />

                    </div>


                    {/* =====================================
                        LOGIN HEADING
                    ===================================== */}

                    <div className="login-heading">

                        <div className="login-brand-label">
                            IFB INDUSTRIES
                        </div>

                        <h1>
                            PAM Portal
                        </h1>

                        <p>
                            Privileged Access Management
                        </p>

                        <div className="login-accent"></div>

                    </div>


                    {/* =====================================
                        SECURITY INFORMATION
                    ===================================== */}

                    <div className="pam-review">

                        <div className="pam-review-icon">

                            <KeyRound
                                size={20}
                                strokeWidth={1.8}
                            />

                        </div>


                        <div className="pam-review-content">

                            <div className="pam-review-title">
                                SAP Emergency User Review
                            </div>

                            <div className="pam-review-subtitle">
                                Secure privileged access management
                            </div>

                        </div>


                        <div className="pam-review-badge">
                            SECURE
                        </div>

                    </div>


                    {/* =====================================
                        ERROR MESSAGE
                    ===================================== */}

                    {message && (

                        <div
                            className="login-message"
                            role="alert"
                        >
                            {message}
                        </div>

                    )}


                    {/* =====================================
                        LOGIN FORM
                    ===================================== */}

                    <form
                        className="login-form"
                        onSubmit={(event) => {

                            event.preventDefault()

                            handleLogin()

                        }}
                    >


                        {/* =================================
                            USERNAME
                        ================================= */}

                        <div className="form-group">

                            <label
                                htmlFor="username"
                                className="form-label"
                            >
                                Login ID
                            </label>


                            <div className="input-icon-wrapper">

                                <UserRound
                                    size={18}
                                    strokeWidth={1.8}
                                    className="input-icon"
                                />


                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="form-input"
                                    autoComplete="username"
                                    placeholder="Enter your Login ID"
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


                        {/* =================================
                            PASSWORD
                        ================================= */}

                        <div className="form-group">

                            <label
                                htmlFor="password"
                                className="form-label"
                            >
                                Password
                            </label>


                            <div className="input-icon-wrapper">

                                <KeyRound
                                    size={18}
                                    strokeWidth={1.8}
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
                                    className="form-input password-input"
                                    autoComplete="current-password"
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


                                {/* SHOW / HIDE PASSWORD */}

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={isLoading}
                                    aria-label={
                                        showPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >

                                    {
                                        showPassword
                                            ? 'Hide'
                                            : 'Show'
                                    }

                                </button>

                            </div>

                        </div>


                        {/* =================================
                            RESET PASSWORD
                        ================================= */}

                        <div className="reset-password">

                            <Link to="/reset-password">
                                Forgot or reset your password?
                            </Link>

                        </div>


                        {/* =================================
                            CAPTCHA INFORMATION
                        ================================= */}

                        <div className="captcha-info">

                            <div className="captcha-icon">
                                🔒
                            </div>


                            <div className="captcha-text">

                                <strong>
                                    Protected Sign-in
                                </strong>

                                <span>
                                    This login is protected by reCAPTCHA Enterprise.
                                </span>

                            </div>

                        </div>


                        {/* =================================
                            LOGIN BUTTON
                        ================================= */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading}
                        >

                            {isLoading ? (

                                <>

                                    <span className="login-spinner"></span>

                                    Logging in...

                                </>

                            ) : (

                                'Login to PAM Portal'

                            )}

                        </button>

                    </form>


                    {/* =====================================
                        CARD FOOTER
                    ===================================== */}

                    <div className="login-card-footer">

                        <span>
                            © IFB Industries Ltd.
                        </span>

                        <span className="footer-divider">
                            |
                        </span>

                        <span>
                            Secure Enterprise Access
                        </span>

                    </div>

                </div>

            </main>

        </div>

    )

}


export default Login
