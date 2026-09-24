import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api/authApi'

import './UserProfile.css'

function UserProfile() {

    const navigate = useNavigate()

    // =========================================
    // USER DETAILS
    // =========================================

    const username =
        sessionStorage.getItem('username') || 'User'

    const loginId =
        sessionStorage.getItem('loginId') || ''

    // =========================================
    // USER MENU
    // =========================================

    const [showUserMenu, setShowUserMenu] =
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

    }

    // =========================================
    // SETTINGS
    // =========================================

    const handleSettings = () => {

        setShowUserMenu(false)

    }

    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = async () => {

        const userId =
            sessionStorage.getItem('userId')

        try {

            if (userId) {

                await logout(userId)

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

        <div
            className="dashboard-user-area"
            ref={userMenuRef}
        >

            {/* =================================
                USER PROFILE BUTTON
            ================================= */}

            <button
                type="button"
                className="user-profile-button"
                onClick={() =>
                    setShowUserMenu(
                        !showUserMenu
                    )
                }
            >

                {/* AVATAR */}

                <div className="user-avatar">

                    {username
                        .charAt(0)
                        .toUpperCase()}

                </div>


                {/* USER DETAILS */}

                <div className="user-details">

                    <span className="welcome-text">
                        Welcome,
                    </span>

                    <strong>
                        {username}
                    </strong>

                </div>


                {/* ARROW */}

                <span
                    className={`user-arrow ${
                        showUserMenu
                            ? 'open'
                            : ''
                    }`}
                >
                    ▼
                </span>

            </button>


            {/* =================================
                DROPDOWN
            ================================= */}

            {showUserMenu && (

                <div className="user-dropdown">

                    {/* PROFILE */}

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


                    {/* SETTINGS */}

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


                    {/* LOGOUT */}

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

    )

}

export default UserProfile