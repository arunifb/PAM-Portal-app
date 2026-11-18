// import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Login from './pages/Login/Login'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import TwoFactorAuth from './pages/TwoFactorAuth/TwoFactorAuth'
import Dashboard from './pages/Dashboard/Dashboard'

import RouteKeyPage from './pages/RouteKeyPage/RouteKeyPage'

import ProtectedRoute from './components/ProtectedRoute'


function PageTitleUpdater() {
    const location = useLocation()

    useEffect(() => {
        const pageTitles = {
            '/': 'Login',
            '/reset-password': 'Reset Password',
            '/2fa': 'Two Factor Authentication',
            '/dashboard': 'Dashboard',
            
        }

        const pageName = pageTitles[location.pathname] || 'eTraining'

        document.title = `eTraining-${pageName}`
    }, [location.pathname])

    return null
}


function App() {

    return (

        <BrowserRouter>

            <PageTitleUpdater />

            <Routes>

                {/* =========================================
                    PUBLIC PAGES
                ========================================= */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

                <Route
                    path="/2fa"
                    element={<TwoFactorAuth />}
                />


                {/* =========================================
                    PROTECTED PAGES
                ========================================= */}

                <Route
                    element={<ProtectedRoute />}
                >

                    {/* =========================================
                        DASHBOARD
                    ========================================= */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />


                    {/* =========================================
                        DYNAMIC ROUTE KEY
                        
                        RouteKey comes from Menu table.
                        
                        Example:
                        /43DDCC31-125F-4F9C-B325-BB5CADA392A9
                        
                        RouteKeyPage then finds:
                        ReactUrl = /report-data
                        
                        and renders ReportData.jsx.
                    ========================================= */}

                    <Route
                        path="/:routeKey"
                        element={<RouteKeyPage />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    )
}

export default App