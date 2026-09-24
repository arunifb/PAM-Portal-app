import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login/Login'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import TwoFactorAuth from './pages/TwoFactorAuth/TwoFactorAuth'
import Dashboard from './pages/Dashboard/Dashboard'
import ReportParameter from './pages/ReportParameter/ReportParameter'
import ProtectedRoute from './components/ProtectedRoute'


function App() {

    return (

        <BrowserRouter>

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
                        REPORT PARAMETER
                    ========================================= */}

                    <Route
                        path="/report-parameter"
                        element={
                            <ReportParameter
                                report={{
                                    reportID: 239,
                                    reportType: 'Report 239'
                                }}
                            />
                        }
                    />


                </Route>


            </Routes>

        </BrowserRouter>

    )

}


export default App