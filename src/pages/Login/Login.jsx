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


            console.log(
                'Login: reCAPTCHA token received:',
                !!recaptchaToken
            )


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

                console.log('Role ID:', data.roleID)
console.log('Roles:', data.roles)


            console.timeEnd('API Login')


            console.log(
                'Login API response:',
                data
            )


            // =========================================
            // CHECK TWO-FACTOR AUTHENTICATION
            // =========================================

            if (data.requiresTwoFactor) {

                console.log(
                    'Two-factor authentication required.'
                )


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

            // sessionStorage.setItem(
            //     'bpCode',
            //     data.bpCode || ''
            // )

            // sessionStorage.setItem(
            //     'regionCode',
            //     data.regionCode || ''
            // )

            sessionStorage.setItem(
            'bpCode',
            String(data.bpCode || data.BPCode || data.branches || '')
             )

            sessionStorage.setItem(
                'regionCode',
                String(data.regionCode || data.RegionCode || data.regions || '')
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
                    LEFT / BRAND SECTION
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
                            e-Training Application
                        </div>

                    </div>


                    <div className="welcome-content">

                        <h1>
                            Welcome Back
                        </h1>

                        <p>
                            Sign in to access the e-Training
                            application and continue your
                            learning and training activities.
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
                                Two-factor authentication is enabled
                                for enhanced account security.
                            </span>

                        </div>

                    </div>

                </section>


                {/* =========================================
                    RIGHT / LOGIN FORM SECTION
                ========================================= */}

                <section className="login-form-section">


                    {/* =========================================
                        LOGIN HEADER
                    ========================================= */}

                    <div className="login-header">

                        <div className="small-title">
                            e-Training
                        </div>

                        <h2>
                            Login to your account
                        </h2>

                        <p>
                            Enter your Login-ID and Password
                            to log on.
                        </p>

                    </div>


                    {/* =========================================
                        SECURITY NOTICE
                    ========================================= */}

                    <div className="security-notice">

                        <div className="notice-icon">
                            🔔
                        </div>

                        <div className="notice-text">

                            <strong>
                                Security Notice
                            </strong>

                            For security, from 9th October
                            we've enabled two-factor authentication.
                            If your mobile number or email is missing,
                            you can't log in. Please update your
                            details and reset your password.
                            Thank you!

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
                                <UserRound size={16} strokeWidth={1.8} />
                                <span>Login-ID</span>
                            </label>


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


                        {/* =========================================
                            PASSWORD
                        ========================================= */}

                        <div className="form-group">

                           <label
                                className="form-label"
                                htmlFor="password"
                            >
                                <KeyRound size={16} strokeWidth={1.8} />
                                
                                <span>Password</span>
                            </label>


                            <div className="input-wrapper">

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
                        e-Training Application

                    </div>

                </section>

            </div>

        </div>

    )

}


export default Login