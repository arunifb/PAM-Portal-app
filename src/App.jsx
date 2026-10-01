import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login/Login'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import TwoFactorAuth from './pages/TwoFactorAuth/TwoFactorAuth'
import Dashboard from './pages/Dashboard/Dashboard'
import ReportParameter from './pages/ReportParameter/ReportParameter'
import Click2Call from './pages/Click2Call/Click2Call'
import CallSummary from './pages/CallSummary/CallSummary'
import FranchiseView from './pages/FranchiseView/FranchiseView'
import OneSearch from './pages/OneSearch/OneSearch'
import DigitalContract from './pages/DigitalContract/DigitalContract'
import Inventory from './pages/Inventory/FranchiseeInventory'
import EditView from './pages/SubDealer/EditView'
import SkillSetView from './pages/SkillSetView/SkillSetView'
import BomExplodedView from './pages/BomExplodedView/BomExplodedView'
import DDRRegion from './pages/DDRRegion/DDRRegion'
import DigitalICR from './pages/DigitalICR/DigitalICR'
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

                   <Route
                        path="/franchise-view"
                        element={<FranchiseView />}
                    />

                    <Route
                        path="/one-search"
                        element={<OneSearch />}
                    />

                    <Route
                        path="/digital-contract"
                        element={<DigitalContract />}
                    />

                    <Route
                        path="/inventory"
                        element={<Inventory />}
                    />

                    <Route
                        path="/ddr-region"
                        element={<DDRRegion />}
                    />

                    <Route
                        path="/digital-icr"
                        element={<DigitalICR />}
                    />

                    <Route
                        path="/subdealer/editview"
                        element={<EditView />}
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