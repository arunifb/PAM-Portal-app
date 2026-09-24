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

    // Sidebar starts collapsed after login
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

    const [menuItems, setMenuItems] = useState([])

    const [menuLoading, setMenuLoading] = useState(true)

    const [menuError, setMenuError] = useState('')

    const [activeSection, setActiveSection] = useState('dashboard')


    // =========================================
    // HANDLE NAVIGATION FROM OTHER PAGES
    // =========================================

    useEffect(() => {

        if (location.state?.activeSection) {

            setActiveSection(
                location.state.activeSection
            )

            // Clear navigation state after reading it
            navigate(location.pathname, {
                replace: true,
                state: {}
            })
        }

    }, [
        location,
        navigate
    ])


    // =========================================
    // REPORT COUNT
    // =========================================

    const [reportCount, setReportCount] = useState(0)


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

                const formattedMenu = data.map(
                    (item, index) => ({

                        id: index + 1,

                        name: item.menuName,

                        url: item.menuURL,

                        icon: item.menuImage

                    })
                )

                setMenuItems(formattedMenu)

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

        // Report Data should open
        // inside the right section
        if (item.name === 'Report Data') {

            setActiveSection('report-data')

            return
        }

        // Dashboard should show
        // the normal dashboard menu
        if (item.name === 'Dashboard') {

            setActiveSection('dashboard')

            return
        }

        // Existing menu behavior
        if (!item.url) {
            return
        }

        window.location.href = item.url
    }


    // =========================================
    // REPORT COUNT CHANGE
    // =========================================

    const handleReportCountChange = (count) => {

        setReportCount(count)

    }


    return (

        <div
            className={
                sidebarCollapsed
                    ? 'dashboard-page sidebar-collapsed'
                    : 'dashboard-page'
            }
        >

            {/* SIDEBAR */}

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

                    <div className="sidebar-title">
                        e-Training
                    </div>

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
                                    (
                                        item.name === 'Dashboard' &&
                                        activeSection === 'dashboard'
                                    ) ||
                                    (
                                        item.name === 'Report Data' &&
                                        activeSection === 'report-data'
                                    )
                                        ? 'sidebar-menu-item active'
                                        : 'sidebar-menu-item'
                                }
                                onClick={() =>
                                    handleMenuClick(item)
                                }
                            >

                                <span className="menu-icon">

                                    <i
                                        className={item.icon}
                                        aria-hidden="true"
                                    />

                                </span>

                                <span>
                                    {item.name}
                                </span>

                            </button>

                        ))
                    }

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


            {/* MAIN CONTENT */}

            <main className="dashboard-main">

                {/* HEADER */}

                <header className="dashboard-header">

                    <div className="dashboard-breadcrumb">

                        <span className="dashboard-breadcrumb-current">

                            {activeSection === 'report-data'
                                ? 'Report Data'
                                : 'Dashboard'}

                        </span>

                        {/* <span className="dashboard-breadcrumb-separator">
                            /
                        </span> */}

                        {/* <span className="dashboard-breadcrumb-app">
                            eTraining Application
                        </span> */}

                        {activeSection === 'report-data' && (

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


                    {/* USER PROFILE */}

                    <UserProfile
                        
                    />

                </header>


                {/* DASHBOARD */}

                {activeSection === 'dashboard' && (

                    <section className="dashboard-menu-section">

                        {menuLoading && (

                            <div className="dashboard-menu-message">
                                Loading dashboard menu...
                            </div>

                        )}

                        {!menuLoading && menuError && (

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

                                    {menuItems.map((item) => (

                                        <button
                                            key={item.id}
                                            type="button"
                                            className="dashboard-menu-card"
                                            onClick={() =>
                                                handleMenuClick(item)
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
                                                        title={item.name}
                                                        aria-hidden="true"
                                                    />

                                                </span>

                                            </span>

                                            <span className="dashboard-menu-name">
                                                {item.name}
                                            </span>

                                        </button>

                                    ))}

                                </div>

                            )}

                    </section>

                )}


                {/* REPORT DATA */}

                {activeSection === 'report-data' && (

                    <ReportData
                        onReportCountChange={
                            handleReportCountChange
                        }
                    />

                )}


                {/* FOOTER */}

                <footer className="dashboard-footer">

                    © IFB Industries Ltd. &nbsp;|&nbsp;
                    e-Training Application

                </footer>

            </main>

        </div>
    )
}

export default Dashboard