import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import './Dashboard.css'

import ifbLogo from '../../assets/ifb-logo.png'

import { logout } from '../../api/authApi'
import { getDashboardMenu } from '../../api/dashboardApi'

import ReportData from '../ReportData/ReportData'
import UserProfile from '../../components/UserProfile'


function Dashboard() {

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
        useState(true)

    const [menuError, setMenuError] =
        useState('')


    // =========================================
    // ACTIVE SECTION
    // =========================================

    const [activeSection, setActiveSection] =
        useState('dashboard')


    // =========================================
    // REPORT COUNT
    // =========================================

    const [reportCount, setReportCount] =
        useState(0)


    // =========================================
    // HANDLE NAVIGATION FROM OTHER PAGES
    // =========================================

    useEffect(() => {

        if (location.state?.activeSection) {

            setActiveSection(
                location.state.activeSection
            )

            navigate(
                location.pathname,
                {
                    replace: true,
                    state: {}
                }
            )
        }

    }, [
        location,
        navigate
    ])


    // =========================================
    // LOAD DASHBOARD MENU
    // =========================================

    useEffect(() => {

        const loadDashboardMenu = async () => {

            const roleId =
                sessionStorage.getItem('roleId')


            if (!roleId) {

                setMenuError(
                    'Role information is not available.'
                )

                setMenuLoading(false)

                return
            }


            try {

                const data =
                    await getDashboardMenu(roleId)


                if (!Array.isArray(data)) {

                    throw new Error(
                        'Invalid dashboard menu response.'
                    )
                }


                // =========================================
                // FORMAT MENU DATA
                // =========================================
                //
                // ReactUrl = React page mapping
                // RouteKey = browser URL
                //
                // Both values come from the database.
                // =========================================

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


                // =========================================
                // DEBUG
                // =========================================

                console.log(
                    'Dashboard menu with RouteKey:',
                    formattedMenu
                )


            } catch (error) {

                console.error(
                    'Dashboard menu error:',
                    error
                )


                setMenuError(
                    error.message ||
                    'Unable to load dashboard menu.'
                )


            } finally {

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
    // MENU CLICK
    // =========================================

    const handleMenuClick = (item) => {

        if (!item) {
            return
        }


        const menuName =
            item.name
                ?.toLowerCase()
                .trim() || ''


        // =========================================
        // DASHBOARD
        // =========================================

        if (
            menuName === 'dashboard'
        ) {

            setActiveSection(
                'dashboard'
            )

            return
        }


        // =========================================
        // ROUTEKEY NAVIGATION
        // =========================================
        //
        // RouteKey comes from the database.
        //
        // Example:
        //
        // RoleID = 1
        // ReactUrl = /click2call
        // RouteKey =
        // 8D0EC516-E566-478D-8CE8-49458F63A5F6
        //
        // Browser URL:
        //
        // /8D0EC516-E566-478D-8CE8-49458F63A5F6
        //
        // =========================================

        if (
            item.routeKey
        ) {

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


            navigate(
                `/${item.routeKey}`
            )

            return
        }


        // =========================================
        // FALLBACK TO REACT URL
        // =========================================
        //
        // This is only used if RouteKey is not
        // available for a particular menu item.
        // =========================================

        if (
            item.reactUrl
        ) {

            console.log(
                'RouteKey not available. Using ReactUrl:',
                item.reactUrl
            )


            navigate(
                item.reactUrl
            )

            return
        }


        // =========================================
        // FALLBACK TO OLD MENU URL
        // =========================================

        if (
            item.url
        ) {

            window.location.href =
                item.url

            return
        }

    }


    // =========================================
    // REPORT COUNT CHANGE
    // =========================================

    const handleReportCountChange = (
        count
    ) => {

        setReportCount(
            count
        )
    }


    // =========================================
    // MENU ACTIVE STATE
    // =========================================

    const isMenuActive = (item) => {

        if (!item) {
            return false
        }


        const menuName =
            item.name
                ?.toLowerCase()
                .trim() || ''


        const currentPath =
            location.pathname


        // =========================================
        // DASHBOARD
        // =========================================

        if (
            menuName === 'dashboard'
        ) {

            return (
                currentPath === '/dashboard' &&
                activeSection === 'dashboard'
            )
        }


        // =========================================
        // ROUTEKEY ACTIVE STATE
        // =========================================
        //
        // The current browser URL is compared
        // with the RouteKey belonging to this
        // menu item.
        //
        // Example:
        //
        // currentPath:
        // /8D0EC516-E566-478D-8CE8-49458F63A5F6
        //
        // item.routeKey:
        // 8D0EC516-E566-478D-8CE8-49458F63A5F6
        //
        // =========================================

        if (
            item.routeKey
        ) {

            const routeKeyPath =
                `/${item.routeKey}`


            if (
                currentPath.toLowerCase() ===
                routeKeyPath.toLowerCase()
            ) {

                return true
            }
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
                SIDEBAR
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


                {/* IFB LOGO */}

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
                                        handleMenuClick(
                                            item
                                        )
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
                        onClick={
                            handleLogout
                        }
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


                {/* HEADER */}

                <header className="dashboard-header">


                    {/* HEADER LEFT */}

                    <div className="dashboard-header-left">


                        {/* COLLAPSED HEADER BRAND */}

                        {sidebarCollapsed && (

                            <div className="collapsed-header-brand">

                                <img
                                    src={ifbLogo}
                                    alt="IFB Industries"
                                    className="collapsed-header-logo"
                                />

                                <button
                                    type="button"
                                    className="collapsed-sidebar-toggle"
                                    onClick={() =>
                                        setSidebarCollapsed(
                                            false
                                        )
                                    }
                                    aria-label="Open sidebar"
                                >
                                    ☰
                                </button>

                            </div>

                        )}


                        {/* PAGE TITLE */}

                        <div className="dashboard-breadcrumb">

                            <span className="dashboard-breadcrumb-current">

                                Dashboard

                            </span>


                        </div>

                    </div>


                    {/* USER PROFILE */}

                    <UserProfile />

                </header>


                {/* =================================
                    DASHBOARD
                ================================= */}

                {activeSection ===
                    'dashboard' && (

                    <section className="dashboard-menu-section">

                        {menuLoading && (

                            <div className="dashboard-menu-message">
                                Loading dashboard menu...
                            </div>

                        )}


                        {!menuLoading &&
                            menuError && (

                            <div className="dashboard-menu-message error">
                                {menuError}
                            </div>

                        )}


                        {!menuLoading &&
                            !menuError &&
                            menuItems.length === 0 && (

                            <div className="dashboard-menu-message">
                                No dashboard menu items are available.
                            </div>

                        )}


                        {!menuLoading &&
                            !menuError &&
                            menuItems.length > 0 && (

                            <div className="dashboard-menu-grid">

                                {menuItems.map(
                                    (item) => (

                                        <button
                                            key={item.id}
                                            type="button"
                                            className="dashboard-menu-card"
                                            onClick={() =>
                                                handleMenuClick(
                                                    item
                                                )
                                            }
                                        >

                                            <span className="dashboard-menu-icon">

                                                <span className="fa-stack fa-3x">

                                                    <i
                                                        className="fa fa-circle fa-stack-2x"
                                                        aria-hidden="true"
                                                    />

                                                    <i
                                                        className={`${item.icon} fa-inverse fa-stack-1x`}
                                                        title={
                                                            item.name
                                                        }
                                                        aria-hidden="true"
                                                    />

                                                </span>

                                            </span>


                                            <span className="dashboard-menu-name">

                                                {item.name}

                                            </span>

                                        </button>

                                    )
                                )}

                            </div>

                        )}

                    </section>

                )}


                {/* =================================
                    REPORT DATA
                ================================= */}

                {activeSection ===
                    'report-data' && (

                    <ReportData
                        onReportCountChange={
                            handleReportCountChange
                        }
                    />

                )}


                {/* =================================
                    FOOTER
                ================================= */}

                <footer className="dashboard-footer">

                    © IFB Industries Ltd.
                    &nbsp;|&nbsp;
                    e-Training Application

                </footer>

            </main>

        </div>

    )
}


export default Dashboard