import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import '../../pages/Dashboard/Dashboard.css'

import ifbLogo from '../../assets/ifb-logo.png'

import { logout } from '../../api/authApi'
import { getDashboardMenu } from '../../api/dashboardApi'

import DashboardHeader from '../DashboardHeader/DashboardHeader'

function DashboardLayout({ title, icon: pageIcon, children }) {
    const location = useLocation()
    const navigate = useNavigate()

    // =========================================
    // SIDEBAR
    // Preserve state during page navigation
    // =========================================

    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const savedState = sessionStorage.getItem('sidebarCollapsed')
        return savedState === null ? true : savedState === 'true'
    })

    useEffect(() => {
        sessionStorage.setItem(
            'sidebarCollapsed',
            String(sidebarCollapsed)
        )
    }, [sidebarCollapsed])

    // =========================================
    // DASHBOARD MENU
    // =========================================

    const [menuItems, setMenuItems] = useState([])
    const [menuLoading, setMenuLoading] = useState(false)
    const [menuError, setMenuError] = useState('')

    // =========================================
    // NORMALIZE URL PATH
    // =========================================

    const normalizePath = (path) => {
        if (!path) return '/'

        const normalized = path
            .split('?')[0]
            .split('#')[0]
            .replace(/\/+$/, '')
            .toLowerCase()

        return normalized || '/'
    }

    const currentPath = normalizePath(location.pathname)

    // =========================================
    // LOAD DASHBOARD MENU
    // Load from session storage first.
    // =========================================

    useEffect(() => {
        let isMounted = true

        const loadDashboardMenu = async () => {
            const userId = sessionStorage.getItem('userId')

            if (!userId) {
                if (isMounted) {
                    setMenuError(
                        'User information is not available.'
                    )
                }
                return
            }

            const savedMenu = sessionStorage.getItem('dashboardMenu')

            if (savedMenu) {
                try {
                    const parsedMenu = JSON.parse(savedMenu)

                    if (
                        Array.isArray(parsedMenu) &&
                        parsedMenu.length > 0
                    ) {
                        if (isMounted) {
                            setMenuItems(parsedMenu)
                        }
                        return
                    }
                } catch (error) {
                    console.error(
                        'Invalid saved dashboard menu:',
                        error
                    )

                    sessionStorage.removeItem('dashboardMenu')
                }
            }

            try {
                if (isMounted) {
                    setMenuLoading(true)
                    setMenuError('')
                }

                const data = await getDashboardMenu(userId)

                if (!Array.isArray(data)) {
                    throw new Error(
                        'Invalid dashboard menu response.'
                    )
                }

                const formattedMenu = data.map((item, index) => ({
                    id: index + 1,
                    name: item.menuName,
                    url: item.menuURL,
                    reactUrl: item.reactUrl,
                    routeKey: item.routeKey,
                    icon: item.menuImage
                }))

                sessionStorage.setItem(
                    'dashboardMenu',
                    JSON.stringify(formattedMenu)
                )

                if (isMounted) {
                    setMenuItems(formattedMenu)
                }
            } catch (error) {
                console.error(
                    'Dashboard menu error:',
                    error
                )

                if (isMounted) {
                    setMenuError(
                        error.message ||
                        'Unable to load dashboard menu.'
                    )
                }
            } finally {
                if (isMounted) {
                    setMenuLoading(false)
                }
            }
        }

        loadDashboardMenu()

        return () => {
            isMounted = false
        }
    }, [])

    // =========================================
    // CURRENT PAGE MENU
    // Use SQL MenuName and MenuImage in header.
    // =========================================

    const currentMenuItem = menuItems.find((item) => {
        if (!item) return false

        // Dashboard
        if (
            item.name?.toLowerCase() === 'dashboard' &&
            currentPath === '/dashboard'
        ) {
            return true
        }

        // Match pages navigated using RouteKey
        if (item.routeKey) {
            const routeKeyPath = normalizePath(
                `/${item.routeKey}`
            )

            if (currentPath === routeKeyPath) {
                return true
            }
        }

        // Fallback: match ReactUrl
        if (item.reactUrl) {
            const reactPath = normalizePath(item.reactUrl)

            if (currentPath === reactPath) {
                return true
            }
        }

        return false
    })

    const headerTitle = title || currentMenuItem?.name || 'Dashboard'
    const headerIcon = pageIcon || currentMenuItem?.icon || ''

// console.log('DashboardLayout DEBUG:', {
//     pageTitleProp: title,
//     currentPath,
//     matchedMenu: currentMenuItem?.name,
//     finalHeaderTitle: headerTitle
// })
    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = async () => {
        const userId = sessionStorage.getItem('userId')

        try {
            if (userId) {
                await logout(userId)
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            sessionStorage.clear()
            navigate('/')
        }
    }

    // =========================================
    // MENU CLICK
    // =========================================

    const handleMenuClick = (item) => {
        if (!item) return

        // Dashboard
        if (item.name?.toLowerCase() === 'dashboard') {
            navigate('/dashboard')
            return
        }

        // RouteKey navigation
        if (item.routeKey) {
            console.log(
                'Navigating using RouteKey:',
                item.routeKey
            )

            console.log('Menu Name:', item.name)
            console.log('ReactUrl:', item.reactUrl)

            // Reset the previous report selection when opening
// Report Data from the sidebar.
if (
    item.reactUrl &&
    normalizePath(item.reactUrl) === '/report-data'
) {
    sessionStorage.removeItem('selectedReport')

    navigate(`/${item.routeKey}`)

    return
}

            // All other RouteKey pages
            navigate(`/${item.routeKey}`)
            return
        }

        // React URL fallback
        if (item.reactUrl) {
            navigate(item.reactUrl)
            return
        }

        // Legacy URL fallback
        if (item.url) {
            window.location.href = item.url
        }
    }

    // =========================================
    // MENU ACTIVE STATE
    // =========================================

    const isMenuActive = (item) => {
        if (!item) return false

        if (
            item.name?.toLowerCase() === 'dashboard' &&
            currentPath === '/dashboard'
        ) {
            return true
        }

        if (item.routeKey) {
            if (
                currentPath ===
                normalizePath(`/${item.routeKey}`)
            ) {
                return true
            }
        }

        if (item.reactUrl) {
            return (
                currentPath === normalizePath(item.reactUrl)
            )
        }

        return false
    }

    // =========================================
    // UI
    // =========================================

    return (
        <div
            className={
                sidebarCollapsed
                    ? 'dashboard-page sidebar-collapsed'
                    : 'dashboard-page'
            }
        >
            {/* LEFT SIDEBAR */}

            <aside className="dashboard-sidebar">
                {/* SIDEBAR TOGGLE */}

                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={() =>
                        setSidebarCollapsed((prev) => !prev)
                    }
                    aria-label={
                        sidebarCollapsed
                            ? 'Open sidebar'
                            : 'Close sidebar'
                    }
                >
                    ☰
                </button>

                {/* SIDEBAR LOGO */}

                <div className="sidebar-logo">
                    <img
                        src={ifbLogo}
                        alt="IFB Industries"
                    />
                </div>

                {/* SIDEBAR MENU */}

                <nav className="sidebar-menu">
                    {menuLoading && (
                        <div className="sidebar-menu-message">
                            Loading menu...
                        </div>
                    )}

                    {!menuLoading && menuError && (
                        <div className="sidebar-menu-message">
                            {menuError}
                        </div>
                    )}

                    {!menuLoading &&
                        !menuError &&
                        menuItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={
                                    isMenuActive(item)
                                        ? 'sidebar-menu-item active'
                                        : 'sidebar-menu-item'
                                }
                                onClick={() =>
                                    handleMenuClick(item)
                                }
                            >
                                <span className="menu-icon">
                                    <i
                                        className={item.icon || ''}
                                        aria-hidden="true"
                                    />
                                </span>

                                <span>{item.name}</span>
                            </button>
                        ))}
                </nav>

                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">
                    <button
                        type="button"
                        className="sidebar-menu-item logout-item"
                        onClick={handleLogout}
                    >
                        <span className="menu-icon">
                            ↪
                        </span>

                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}

            <main className="dashboard-main">
                {/* COMMON HEADER */}

                <DashboardHeader
                    title={headerTitle}
                    icon={headerIcon}
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={() =>
                        setSidebarCollapsed(false)
                    }
                />

                {/* PAGE CONTENT */}

                {children}

                {/* COMMON FOOTER */}

                <footer className="dashboard-footer">
                    © {new Date().getFullYear()} IFB Industries Ltd.
                    &nbsp;|&nbsp;
                    e-Training Application
                </footer>
            </main>
        </div>
    )
}

export default DashboardLayout