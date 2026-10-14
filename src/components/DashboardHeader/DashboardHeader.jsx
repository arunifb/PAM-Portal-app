
import './DashboardHeader.css'
import ifbLogo from '../../assets/ifb-logo.png'
import UserProfile from '../UserProfile'

function DashboardHeader({
    title,
    icon,
    sidebarCollapsed,
    onToggleSidebar
}) {
    return (
        <header className="dashboard-header">
            {/* HEADER LEFT */}

            <div className="dashboard-header-left">
                {/* IFB LOGO + SIDEBAR TOGGLE */}

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
                            onClick={onToggleSidebar}
                            aria-label="Open sidebar"
                        >
                            ☰
                        </button>
                    </div>
                )}

                {/* PAGE TITLE WITH SQL MENU ICON */}

                <div className="dashboard-breadcrumb">
                    {icon && (
                        <i
                            className={`dashboard-breadcrumb-icon ${icon}`}
                            aria-hidden="true"
                        />
                    )}

                    <span className="dashboard-breadcrumb-current">
                        {title}
                    </span>
                </div>
            </div>

            {/* USER PROFILE */}

            <UserProfile />
        </header>
    )
}

export default DashboardHeader
