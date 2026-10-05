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
        useState(true)

    const [menuError, setMenuError] =
        useState('')


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
        // REPORT DATA
        // =====================================

        if (
            item.name === 'Report Data'
        ) {

            navigate(
                '/dashboard',
                {
                    state: {
                        activeSection:
                            'report-data'
                    }
                }
            )

            return
        }


        // =====================================
        // CLICK 2 CALL
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('click 2 call')
            ||
            item.url
                ?.toLowerCase()
                .includes('click2call.aspx')
        ) {

            navigate(
                '/click2call'
            )

            return
        }


        // =====================================
        // CALL SUMMARY
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('call summary')
            ||
            item.url
                ?.toLowerCase()
                .includes('callsummary.aspx')
        ) {

            navigate(
                '/call-summary'
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

            console.log(
                'Menu clicked:',
                item.name,
                item.url
            )

            navigate(
                '/skill-set-view'
            )

            return
        }


        // =====================================
        // BOM EXPLODED VIEW
        // =====================================

        if (
            item.url
                ?.toLowerCase()
                .includes('bom_exploded_view.aspx')
        ) {

            navigate(
                '/bom-exploded-view'
            )

            return
        }


        // =====================================
        // FRANCHISE VIEW
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('franchise view')
            ||
            item.url
                ?.toLowerCase()
                .includes('franchiseview.aspx')
        ) {

            navigate(
                '/franchise-view'
            )

            return
        }


        // =====================================
        // INVENTORY
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('inventory')
            ||
            item.url
                ?.toLowerCase()
                .includes('franchiseeinventory.aspx')
        ) {

            navigate(
                '/inventory'
            )

            return
        }


        // =====================================
        // DDR REGION MONITORING
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('ddr region')
            ||
            item.name
                ?.toLowerCase()
                .includes('ddr monitoring')
            ||
            item.url
                ?.toLowerCase()
                .includes('ddrrequest.aspx')
        ) {

            navigate(
                '/ddr-region'
            )

            return
        }


        // =====================================
        // ONE SEARCH
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('one search')
            ||
            item.url
                ?.toLowerCase()
                .includes('onesearch.aspx')
        ) {

            navigate(
                '/one-search'
            )

            return
        }


        // =====================================
        // DIGITAL CONTRACT
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('digital contract')
            ||
            item.url
                ?.toLowerCase()
                .includes('digitalcontract.aspx')
        ) {

            navigate(
                '/digital-contract'
            )

            return
        }


        // =====================================
        // SUB-DEALER
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('sub-dealer')
            ||
            item.name
                ?.toLowerCase()
                .includes('subdealer')
            ||
            item.url
                ?.toLowerCase()
                .includes('editview.aspx')
            ||
            item.url
                ?.toLowerCase()
                .includes('subdealer.aspx')
        ) {

            navigate(
                '/subdealer/editview'
            )

            return
        }


        // =====================================
        // DIGITAL ICR
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('digital icr')
            ||
            item.url
                ?.toLowerCase()
                .includes('digitalicr.aspx')
        ) {

            navigate(
                '/digital-icr'
            )

            return
        }


        // =====================================
        // SPARES STOCK
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('spares stock')
            ||
            item.name
                ?.toLowerCase()
                .includes('spare stock')
            ||
            item.url
                ?.toLowerCase()
                .includes('sparesstock.aspx')
        ) {

            navigate(
                '/spares-stock'
            )

            return
        }


        // =====================================
        // TECHNICIAN
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('technician')
            ||
            item.url
                ?.toLowerCase()
                .includes('addtech.aspx')
        ) {

            navigate(
                '/technician'
            )

            return
        }


        // =====================================
        // OTHER MENU ITEMS
        // =====================================

        if (!item.url) {
            return
        }


        window.location.href =
            item.url
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
        // REPORT DATA
        // =====================================

        if (
            item.name === 'Report Data'
        ) {

            return (
                currentPath ===
                '/dashboard' &&
                location.state?.activeSection ===
                'report-data'
            )
        }


        // =====================================
        // CLICK 2 CALL
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('click 2 call')
            ||
            item.url
                ?.toLowerCase()
                .includes('click2call.aspx')
        ) {

            return (
                currentPath ===
                '/click2call'
            )
        }


        // =====================================
        // CALL SUMMARY
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('call summary')
            ||
            item.url
                ?.toLowerCase()
                .includes('callsummary.aspx')
        ) {

            return (
                currentPath ===
                '/call-summary'
            )
        }


        // =====================================
        // SKILL SET VIEW
        // =====================================

        if (
            item.url
                ?.toLowerCase()
                .includes('techskillmasterreport.aspx')
        ) {

            return (
                currentPath ===
                '/skill-set-view'
            )
        }


        // =====================================
        // BOM EXPLODED VIEW
        // =====================================

        if (
            item.url
                ?.toLowerCase()
                .includes('bom_exploded_view.aspx')
        ) {

            return (
                currentPath ===
                '/bom-exploded-view'
            )
        }


        // =====================================
        // FRANCHISE VIEW
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('franchise view')
            ||
            item.url
                ?.toLowerCase()
                .includes('franchiseview.aspx')
        ) {

            return (
                currentPath ===
                '/franchise-view'
            )
        }


        // =====================================
        // INVENTORY
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('inventory')
            ||
            item.url
                ?.toLowerCase()
                .includes('franchiseeinventory.aspx')
        ) {

            return (
                currentPath ===
                '/inventory'
            )
        }


        // =====================================
        // DDR REGION MONITORING
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('ddr region')
            ||
            item.name
                ?.toLowerCase()
                .includes('ddr monitoring')
            ||
            item.url
                ?.toLowerCase()
                .includes('ddrrequest.aspx')
        ) {

            return (
                currentPath ===
                '/ddr-region'
            )
        }


        // =====================================
        // ONE SEARCH
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('one search')
            ||
            item.url
                ?.toLowerCase()
                .includes('onesearch.aspx')
        ) {

            return (
                currentPath ===
                '/one-search'
            )
        }


        // =====================================
        // DIGITAL CONTRACT
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('digital contract')
            ||
            item.url
                ?.toLowerCase()
                .includes('digitalcontract.aspx')
        ) {

            return (
                currentPath ===
                '/digital-contract'
            )
        }


        // =====================================
        // DIGITAL ICR
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('digital icr')
            ||
            item.url
                ?.toLowerCase()
                .includes('digitalicr.aspx')
        ) {

            return (
                currentPath ===
                '/digital-icr'
            )
        }


        // =====================================
        // SPARES STOCK
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('spares stock')
            ||
            item.name
                ?.toLowerCase()
                .includes('spare stock')
            ||
            item.url
                ?.toLowerCase()
                .includes('sparesstock.aspx')
        ) {

            return (
                currentPath ===
                '/spares-stock'
            )
        }


        // =====================================
        // TECHNICIAN
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('technician')
            ||
            item.url
                ?.toLowerCase()
                .includes('addtech.aspx')
        ) {

            return (
                currentPath ===
                '/technician'
            )
        }


        // =====================================
        // SUB-DEALER
        // =====================================

        if (
            item.name
                ?.toLowerCase()
                .includes('sub-dealer')
            ||
            item.name
                ?.toLowerCase()
                .includes('subdealer')
            ||
            item.url
                ?.toLowerCase()
                .includes('editview.aspx')
            ||
            item.url
                ?.toLowerCase()
                .includes('subdealer.aspx')
        ) {

            return (
                currentPath ===
                '/subdealer/editview'
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