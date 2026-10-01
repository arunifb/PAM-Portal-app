import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login/Login'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import TwoFactorAuth from './pages/TwoFactorAuth/TwoFactorAuth'
import Dashboard from './pages/Dashboard/Dashboard'
import ReportParameter from './pages/ReportParameter/ReportParameter'
import Click2Call from './pages/Click2Call/Click2Call'
import CallSummary from './pages/CallSummary/CallSummary'
import ProtectedRoute from './components/ProtectedRoute'
import SkillSetView from './pages/SkillSetView/SkillSetView'
import BomExplodedView from './pages/BomExplodedView/BomExplodedView'

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


                    {/* =========================================
                        CLICK 2 CALL
                    ========================================= */}

                    <Route
                        path="/click2call"
                        element={<Click2Call />}
                    />

                     <Route
                        path="/call-summary"
                        element={<CallSummary />}
                    />
                    {/* =========================================
                        SKILL SET VIEW
                    ========================================= */}

                    <Route
                        path="/skill-set-view"
                        element={<SkillSetView />}
                    />
                    {/* =========================================
                        BOM EXPLODED VIEW
                    ========================================= */}

                    <Route
                        path="/bom-exploded-view"
                        element={<BomExplodedView />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    )

}


export default App