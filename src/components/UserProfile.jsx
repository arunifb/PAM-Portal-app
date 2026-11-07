
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api/authApi'

import './UserProfile.css'

// =========================================
// SESSION HELPER
// =========================================

function getSessionValue(...keys) {

    for (const key of keys) {

        const value = sessionStorage.getItem(key)

        if (value) {
            return value
        }

    }

    return ''

}

// =========================================
// GET ROLE NAMES FROM SESSION
// =========================================

// =========================================
// GET ROLE IDs AND ROLE NAMES FROM SESSION
// =========================================

function getUserRoles() {

    const roleNameMap = {
        '1': 'Region User',
        '3': 'Trainer User',
        '5': 'Franchise User',
        '6': 'Branch User',
        '2': 'Call Center User',
        '7': 'Factory User'
    }

    try {

        // First check whether API has supplied roleNames
        const roleNames = JSON.parse(
            sessionStorage.getItem('roleNames') || '[]'
        )

        if (Array.isArray(roleNames) && roleNames.length > 0) {
            return roleNames.join(', ')
        }

        // Otherwise use existing role IDs
        const roles = JSON.parse(
            sessionStorage.getItem('roles') || '[]'
        )

        if (Array.isArray(roles) && roles.length > 0) {

            return roles
                .map(roleId => roleNameMap[String(roleId)] || `Role ${roleId}`)
                .join(', ')

        }

        // Fallback for older session data
        const roleId = getSessionValue('roleId', 'roleID', 'RoleID')

        if (roleId && roleId !== '0') {
            return roleNameMap[roleId] || `Role ${roleId}`
        }

        return 'N/A'

    } catch (error) {

        console.error('Unable to read user roles:', error)

        return 'N/A'

    }

}

// =========================================
// USER PROFILE
// =========================================

function UserProfile() {

    const navigate = useNavigate()

    // =========================================
    // USER DETAILS
    // =========================================

    const username =
        getSessionValue('username', 'UserName') || 'User'

    const loginId =
        getSessionValue('loginId', 'LoginID')

    const userId =
        getSessionValue('userId', 'UserID')

    const mobile =
        getSessionValue('mobileNo', 'MobileNo', 'mobile', 'Mobile')

    const email =
        getSessionValue('emailId', 'EmailID', 'email', 'Email')

    const roleName = getUserRoles()

    const regionCode =
        getSessionValue('regionCode', 'RegionCode')

    const bpCode =
        getSessionValue('bpCode', 'BPCode')

    // =========================================
    // USER MENU
    // =========================================

    const [showUserMenu, setShowUserMenu] =
        useState(false)

    const [showProfileModal, setShowProfileModal] =
        useState(false)

    const userMenuRef = useRef(null)

    // =========================================
    // CLOSE MENU WHEN CLICKING OUTSIDE
    // =========================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)
            ) {

                setShowUserMenu(false)

            }

        }

        document.addEventListener(
            'mousedown',
            handleClickOutside
        )

        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            )

        }

    }, [])

    // =========================================
    // PROFILE
    // =========================================

    const handleProfile = () => {

        setShowUserMenu(false)
        setShowProfileModal(true)

    }

    // =========================================
    // CLOSE PROFILE MODAL
    // =========================================

    const handleCloseProfile = () => {

        setShowProfileModal(false)

    }

    // =========================================
    // SETTINGS
    // =========================================

    const handleSettings = async () => {

        setShowUserMenu(false)

        const currentUserId =
            sessionStorage.getItem('userId')

        try {

            if (currentUserId) {

                await logout(currentUserId)

            }

        } catch (error) {

            console.error(
                'Logout error:',
                error
            )

        } finally {

            sessionStorage.clear()

            navigate('/reset-password')

        }

    }

    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = async () => {

        const currentUserId =
            sessionStorage.getItem('userId')

        try {

            if (currentUserId) {

                await logout(currentUserId)

            }

        } catch (error) {

            console.error(
                'Logout error:',
                error
            )

        } finally {

            sessionStorage.clear()

            navigate('/')

        }

    }

    // =========================================
    // UI
    // =========================================

    return (

        <>
            <div
                className="dashboard-user-area"
                ref={userMenuRef}
            >

                {/* USER PROFILE BUTTON */}

                <button
                    type="button"
                    className="user-profile-button"
                    onClick={() =>
                        setShowUserMenu(!showUserMenu)
                    }
                >

                    <div className="user-avatar">

                        {username.charAt(0).toUpperCase()}

                    </div>

                    <div className="user-details">

                        <span className="welcome-text">
                            Welcome,
                        </span>

                        <strong>
                            {username}
                        </strong>

                    </div>

                    <span
                        className={`user-arrow ${
                            showUserMenu ? 'open' : ''
                        }`}
                    >
                        ▼
                    </span>

                </button>

                {/* DROPDOWN */}

                {showUserMenu && (

                    <div className="user-dropdown">

                        <button
                            type="button"
                            className="user-menu-item"
                            onClick={handleProfile}
                        >

                            <i
                                className="fa fa-user"
                                aria-hidden="true"
                            ></i>

                            <span>
                                Profile
                            </span>

                        </button>

                        <button
                            type="button"
                            className="user-menu-item"
                            onClick={handleSettings}
                        >

                            <i
                                className="fa fa-cog"
                                aria-hidden="true"
                            ></i>

                            <span>
                                Settings
                            </span>

                        </button>

                        <hr />

                        <button
                            type="button"
                            className="user-menu-item logout-item"
                            onClick={handleLogout}
                        >

                            <i
                                className="fa fa-sign-out"
                                aria-hidden="true"
                            ></i>

                            <span>
                                Logout
                            </span>

                        </button>

                    </div>

                )}

            </div>

            {/* =========================================
                PROFILE MODAL
            ========================================= */}

            {showProfileModal && (

                <div
                    className="profile-modal-overlay"
                    onClick={handleCloseProfile}
                >

                    <div
                        className="profile-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="profile-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >

                        {/* HEADER */}

                        <div className="profile-modal-header">

                            <div className="profile-modal-heading">

                                <div className="profile-modal-icon">
                                    <i
                                        className="fa fa-user"
                                        aria-hidden="true"
                                    ></i>
                                </div>

                                <div className="profile-heading-details">

                                    <h2 id="profile-modal-title">
                                        My Profile
                                    </h2>

                                    <p>
                                        {username}

                                        <span className="profile-role-separator">
                                            •
                                        </span>

                                        {roleName}
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                className="profile-modal-close"
                                onClick={handleCloseProfile}
                                aria-label="Close profile"
                            >
                                &times;
                            </button>

                        </div>

                        {/* PROFILE CONTENT */}

                        <div className="profile-modal-body">

                            <div className="profile-info-heading">
                                Personal Information
                            </div>

                            <div className="profile-info-grid">

                                {/* FULL NAME */}

                                <div className="profile-info-card">

                                    <div className="profile-field-icon">
                                        <i
                                            className="fa fa-user-o"
                                            aria-hidden="true"
                                        ></i>
                                    </div>

                                    <div className="profile-field-content">

                                        <label>Full Name</label>

                                        <p>{username}</p>

                                    </div>

                                </div>

                                {/* LOGIN ID */}

                                <div className="profile-info-card">

                                    <div className="profile-field-icon">
                                        <i
                                            className="fa fa-id-card-o"
                                            aria-hidden="true"
                                        ></i>
                                    </div>

                                    <div className="profile-field-content">

                                        <label>Login ID</label>

                                        <p>{loginId || 'N/A'}</p>

                                    </div>

                                </div>

                                {/* MOBILE NUMBER */}

                                <div className="profile-info-card">

                                    <div className="profile-field-icon">
                                        <i
                                            className="fa fa-mobile"
                                            aria-hidden="true"
                                        ></i>
                                    </div>

                                    <div className="profile-field-content">

                                        <label>Mobile Number</label>

                                        <p>{mobile || 'N/A'}</p>

                                    </div>

                                </div>

                                {/* EMAIL ADDRESS */}

                                <div className="profile-info-card">

                                    <div className="profile-field-icon">
                                        <i
                                            className="fa fa-envelope-o"
                                            aria-hidden="true"
                                        ></i>
                                    </div>

                                    <div className="profile-field-content">

                                        <label>Email Address</label>

                                        <p>{email || 'N/A'}</p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* FOOTER */}

                        <div className="profile-modal-footer">

                            <button
                                type="button"
                                onClick={handleCloseProfile}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>

    )

}

export default UserProfile
