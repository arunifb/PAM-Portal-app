import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import '../../pages/Dashboard/Dashboard.css'

import ifbLogo from '../../assets/ifb-logo.png'

import { logout } from '../../api/authApi'
import { getDashboardMenu } from '../../api/dashboardApi'

import DashboardHeader from '../DashboardHeader/DashboardHeader'


function DashboardLayout({
    title,
    children
}) {

    const location = useLocation()
    const navigate = useNavigate()


    // =========================================
    // SIDEBAR
    // =========================================

    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(true)


    // =========================================
    // DASHBOARD MENU
    // =========================================

    const [menuItems, setMenuItems] =
        useState([])

    const [menuLoading, setMenuLoading] =
        useState(false)

    const [menuError, setMenuError] =
        useState('')


    // =========================================
    // LOAD DASHBOARD MENU
    //
    // Load only once per browser session.
    // This prevents every page navigation from
    // calling the dashboard menu API again.
    // =========================================

    useEffect(() => {

        const loadDashboardMenu = async () => {

            const roleId =
                sessionStorage.getItem('roleId')


            if (!roleId) {

                setMenuError(
                    'Role information is not available.'
                )

                return
            }


            // =====================================
            // CHECK SESSION STORAGE FIRST
            // =====================================

            const savedMenu =
                sessionStorage.getItem(
                    'dashboardMenu'
                )


            if (savedMenu) {

                try {

                    const parsedMenu =
                        JSON.parse(savedMenu)


                    if (
                        Array.isArray(parsedMenu) &&
                        parsedMenu.length > 0
                    ) {

                        setMenuItems(
                            parsedMenu
                        )

                        return

                    }

                }
                catch (error) {

                    console.error(
                        'Invalid saved dashboard menu:',
                        error
                    )

                    sessionStorage.removeItem(
                        'dashboardMenu'
                    )

                }

            }


            // =====================================
            // LOAD FROM API
            // =====================================

            try {

                setMenuLoading(true)

                setMenuError('')


                const data =
                    await getDashboardMenu(
                        roleId
                    )


                if (!Array.isArray(data)) {

                    throw new Error(
                        'Invalid dashboard menu response.'
                    )

                }


                const formattedMenu =
                    data.map(
                        (item, index) => ({

                            id:
                                index + 1,

                            name:
                                item.menuName,

                            url:
                                item.menuURL,

                            reactUrl:
                                item.reactUrl,

                            routeKey:
                                item.routeKey,

                            icon:
                                item.menuImage

                        })
                    )


                setMenuItems(
                    formattedMenu
                )


                // =====================================
                // SAVE MENU
                // =====================================

                sessionStorage.setItem(
                    'dashboardMenu',
                    JSON.stringify(
                        formattedMenu
                    )
                )

            }
            catch (error) {

                console.error(
                    'Dashboard menu error:',
                    error
                )


                setMenuError(
                    error.message ||
                    'Unable to load dashboard menu.'
                )

            }
            finally {

                setMenuLoading(false)

            }

        }


        loadDashboardMenu()

    }, [])


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

        }
        catch (error) {

            console.error(
                'Logout error:',
                error
            )

        }
        finally {

            sessionStorage.clear()

            navigate('/')

        }

    }


    // =========================================
    // MENU CLICK
    //
    // Dashboard uses /dashboard.
    //
    // All other menu items use the RouteKey
    // received from the database.
    // =========================================

    const handleMenuClick = (item) => {

        if (!item) {
            return
        }


        // =====================================
        // DASHBOARD
        // =====================================

        if (
            item.name === 'Dashboard'
        ) {

            navigate('/dashboard')

            return
        }


        // =====================================
        // ROUTE KEY
        //
        // Example:
        //
        // RouteKey:
        // 43DDCC31-125F-4F9C-B325-BB5CADA392A9
        //
        // Browser URL:
        // /43DDCC31-125F-4F9C-B325-BB5CADA392A9
        // =====================================

        if (item.routeKey) {

            console.log(
                'Navigating using RouteKey:',
                item.routeKey
            )

            console.log(
                'Menu Name:',
                item.name
            )

            console.log(
                'ReactUrl:',
                item.reactUrl
            )


            // =====================================
            // REPORT DATA
            //
            // Every time Report Data is clicked
            // from the sidebar, reset the selected
            // report and show the report list.
            //
            // URL remains the same RouteKey URL.
            // =====================================

            if (
                item.reactUrl &&
                item.reactUrl.toLowerCase().trim() ===
                    '/report-data'
            ) {

                navigate(
                    `/${item.routeKey}`,
                    {
                        state: {
                            resetReportData:
                                Date.now()
                        }
                    }
                )

                return
            }


            // =====================================
            // ALL OTHER ROUTEKEY PAGES
            // =====================================

            navigate(
                `/${item.routeKey}`
            )

            return
        }


        // =====================================
        // FALLBACK
        //
        // Only used if RouteKey is not available.
        // =====================================

        if (item.reactUrl) {

            navigate(
                item.reactUrl
            )

            return
        }


        // =====================================
        // OLD URL FALLBACK
        // =====================================

        if (item.url) {

            window.location.href =
                item.url

        }

    }


    // =========================================
    // MENU ACTIVE STATE
    // =========================================

    const isMenuActive = (item) => {

        if (!item) {
            return false
        }


        const currentPath =
            location.pathname.toLowerCase()


        // =====================================
        // DASHBOARD
        // =====================================

        if (
            item.name === 'Dashboard'
        ) {

            return (
                currentPath ===
                '/dashboard'
            )
        }


        // =====================================
        // ROUTE KEY
        // =====================================

        if (item.routeKey) {

            const routeKeyPath =
                `/${item.routeKey}`.toLowerCase()


            return (
                currentPath ===
                routeKeyPath
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

            {/* =================================
                LEFT SIDEBAR
            ================================= */}

            <aside className="dashboard-sidebar">


                {/* SIDEBAR TOGGLE */}

                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={() =>
                        setSidebarCollapsed(
                            !sidebarCollapsed
                        )
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


                    {!menuLoading &&
                        menuError && (

                            <div className="sidebar-menu-message">
                                {menuError}
                            </div>

                        )}


                    {!menuLoading &&
                        !menuError &&
                        menuItems.map(
                            (item) => (

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
                                            className={
                                                item.icon
                                            }
                                            aria-hidden="true"
                                        />

                                    </span>


                                    <span>
                                        {item.name}
                                    </span>

                                </button>

                            )
                        )}

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

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================
                MAIN CONTENT
            ================================= */}

            <main className="dashboard-main">


                {/* COMMON HEADER */}

                <DashboardHeader
                    title={title}
                    sidebarCollapsed={
                        sidebarCollapsed
                    }
                    onToggleSidebar={() =>
                        setSidebarCollapsed(false)
                    }
                />


                {/* PAGE CONTENT */}

                {children}


                {/* COMMON FOOTER */}

                <footer className="dashboard-footer">

                    © IFB Industries Ltd.
                    &nbsp;|&nbsp;
                    e-Training Application

                </footer>

            </main>

        </div>
    )
}


export default DashboardLayout