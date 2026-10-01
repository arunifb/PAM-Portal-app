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


                const formattedMenu =
                    data.map(
                        (item, index) => ({

                            id:
                                index + 1,

                            name:
                                item.menuName,

                            url:
                                item.menuURL,

                            icon:
                                item.menuImage

                        })
                    )


                setMenuItems(
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


        const menuUrl =
            item.url
                ?.toLowerCase()
                .trim() || ''


        // =========================================
        // REPORT DATA
        // =========================================

        if (
            menuName === 'report data'
        ) {

            setActiveSection(
                'report-data'
            )

            return
        }


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
        // CLICK 2 CALL
        // =========================================

        if (
            menuName.includes('click 2 call') ||
            menuUrl.includes('click2call.aspx')
        ) {

            navigate(
                '/click2call'
            )

            return
        }


        // =========================================
        // CALL SUMMARY
        // =========================================

        if (
            menuName.includes('call summary') ||
            menuUrl.includes('callsummary')
        ) {

            navigate(
                '/call-summary'
            )

            return
        }


        // =========================================
        // FRANCHISE VIEW
        // =========================================

        if (
            menuName.includes('franchise') ||
            menuUrl.includes('franchiseview.aspx')
        ) {

            navigate(
                '/franchise-view'
            )

            return
        }


        // =========================================
        // ONE SEARCH
        // =========================================

        if (
            menuName.includes('one search') ||
            menuUrl.includes('onesearch.aspx')
        ) {

            navigate(
                '/one-search'
            )

            return
        }


        // =========================================
        // DIGITAL CONTRACT
        // =========================================

        if (
            menuName.includes('digital contract') ||
            menuUrl.includes('digitalcontract.aspx')
        ) {

            navigate(
                '/digital-contract'
            )

            return
        }


        // =========================================
        // INVENTORY
        // =========================================

        if (
            menuName.includes('inventory') ||
            menuUrl.includes('franchiseeinventory.aspx')
        ) {

            navigate(
                '/inventory'
            )

            return
        }


        // =========================================
        // SUB-DEALER EDIT VIEW
        // =========================================

        if (
            menuName.includes('sub-dealer') ||
    menuName.includes('subdealer') ||
    menuUrl.includes('editview.aspx') ||
    menuUrl.includes('subdealer.aspx')
        ) {

            navigate(
                '/subdealer/editview'
            )

            return
        }

// =====================================
// SKILL SET VIEW
// =====================================

if (
    item.url
        ?.toLowerCase()
        .includes('techskillmasterreport.aspx')
) {
    navigate('/skill-set-view')
    return
}


        // =========================================
        // BOM EXPLODED VIEW
        // =========================================

        if (
            item.url
                ?.toLowerCase()
                .includes('bom_exploded_view.aspx')
        ) {
            navigate('/bom-exploded-view')
            return
        }

        // =========================================
        // OTHER MENU ITEMS
        // =========================================

        if (!item.url) {
            return
        }


        window.location.href =
            item.url
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


        const menuUrl =
            item.url
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
        // REPORT DATA
        // =========================================

        if (
            menuName === 'report data'
        ) {

            return (
                currentPath === '/dashboard' &&
                activeSection === 'report-data'
            )
        }


        // =========================================
        // CLICK 2 CALL
        // =========================================

        if (
            menuName.includes('click 2 call') ||
            menuUrl.includes('click2call.aspx')
        ) {

            return (
                currentPath === '/click2call'
            )
        }


        // =========================================
        // CALL SUMMARY
        // =========================================

        if (
            menuName.includes('call summary') ||
            menuUrl.includes('callsummary')
        ) {

            return (
                currentPath === '/call-summary'
            )
        }


        // =========================================
        // FRANCHISE VIEW
        // =========================================

        if (
            menuName.includes('franchise') ||
            menuUrl.includes('franchiseview.aspx')
        ) {

            return (
                currentPath === '/franchise-view'
            )
        }


        // =========================================
        // ONE SEARCH
        // =========================================

        if (
            menuName.includes('one search') ||
            menuUrl.includes('onesearch.aspx')
        ) {

            return (
                currentPath === '/one-search'
            )
        }


        // =========================================
        // DIGITAL CONTRACT
        // =========================================

        if (
            menuName.includes('digital contract') ||
            menuUrl.includes('digitalcontract.aspx')
        ) {

            return (
                currentPath === '/digital-contract'
            )
        }


        // =========================================
        // INVENTORY
        // =========================================

        if (
            menuName.includes('inventory') ||
            menuUrl.includes('franchiseeinventory.aspx')
        ) {

            return (
                currentPath === '/inventory'
            )
        }


        // =========================================
        // SUB-DEALER EDIT VIEW
        // =========================================

        if (
            menuName.includes('sub-dealer') ||
            menuName.includes('subdealer') ||
            menuUrl.includes('editview.aspx')
        ) {

            return (
                currentPath === '/subdealer/editview'
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

                                {activeSection ===
                                'report-data'
                                    ? 'Report Data'
                                    : 'Dashboard'}

                            </span>


                            {activeSection ===
                                'report-data' && (

                                <span className="dashboard-report-count">

                                    {reportCount}

                                    <span>

                                        {reportCount === 1
                                            ? 'Report'
                                            : 'Reports'}

                                    </span>

                                </span>

                            )}

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