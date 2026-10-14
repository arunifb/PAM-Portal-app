// import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

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
import SparesStock from './pages/SparesStock/SparesStock'
import Technician from './pages/Technician/Technician'
import SparesSearch from './pages/SparesSearch/SparesSearch'
import UserManagement from './pages/UserManagement/UserManagement'
import CheckTicketStatus from './pages/CheckTicketStatus/CheckTicketStatus'
import Supersession from './pages/Supersession/Supersession'
import PCR from './pages/PCR/PCR'
import PCRDownload from './pages/PCRDownload/PCRDownload'
import AddPartCategory from './pages/AddPartCategory/AddPartCategory'
import LegalCase from './pages/LegalCase/LegalCase'
import RouteKeyPage from './pages/RouteKeyPage/RouteKeyPage'
import AddFranchise from './pages/AddFranchise/AddFranchise'
import FranchiseList from './pages/Franchise/FranchiseList'
import TechnicianEdit from './pages/Technician/TechnicianEdit'
import AddTechSkill from './pages/AddTechSkill/AddTechSkill'
import EvidenceSearch from './pages/EvidenceSearch/EvidenceSearch'
import TechnicianAdd from './pages/Technician/TechnicianAdd'
import UploadMSMEDoc from './pages/UploadMSMEDoc/UploadMSMEDoc'
import SearchInvoice from './pages/SearchInvoice/SearchInvoice'
import TrainingManual from './pages/TrainingManual/TrainingManual'
import SubDealerView from './pages/SubDealer/SubDealerView'
import Creation from './pages/Vendor/Creation'
import ProtectedRoute from './components/ProtectedRoute'


function PageTitleUpdater() {
    const location = useLocation()

    useEffect(() => {
        const pageTitles = {
            '/': 'Login',
            '/reset-password': 'Reset Password',
            '/2fa': 'Two Factor Authentication',
            '/dashboard': 'Dashboard',
            '/report-parameter': 'Report Parameter',
            '/click2call': 'Click2Call',
            '/call-summary': 'Call Summary',
            '/franchise-view': 'Franchise View',
            '/one-search': 'One Search',
            '/digital-contract': 'Digital Contract',
            '/inventory': 'Inventory',
            '/ddr-region': 'DDR Region',
            '/digital-icr': 'Digital ICR',
            '/spares-stock': 'Spares Stock',
            '/technician': 'Technician',
            '/technician/edit': 'Edit Technician',
            '/technician/add': 'Add Technician',
            '/spares-search': 'Spares Search',
            '/check-ticket-status': 'Check Ticket Status',
            '/user-management': 'User Management',
            '/supersession': 'Supersession',
            '/pcr': 'PCR',
            '/pcr-download': 'PCR Download',
            '/add-part-category': 'Add Part Category',
            '/legal-case': 'Legal Case',
            '/add-franchise': 'Add Franchise',
            '/franchise-list': 'Franchise List',
            '/subdealer/editview': 'Subdealer',
            '/add-tech-skill': 'Add Tech Skill',
            '/evidence-search': 'Evidence Search',
            '/upload-msme-doc': 'Upload MSME Document',
            '/search-invoice': 'Search Invoice',
            '/skill-set-view': 'Skill Set View',
            '/bom-exploded-view': 'BOM Exploded View'
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
                        REPORT PARAMETER
                        
                        This is an internal React page.
                        It is opened from ReportData.jsx
                        using navigate() with location.state.
                    ========================================= */}

                    <Route
                        path="/report-parameter"
                        element={<ReportParameter />}
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
                        path="/spares-stock"
                        element={<SparesStock />}
                    />

                    <Route
                        path="/technician"
                        element={<Technician />}
                    />

                    {/* <Route
                        path="/technician/edit/:techId"
                        element={<TechnicianEdit />}
                    /> */}

                    <Route
                        path="/technician/edit"
                        element={<TechnicianEdit />}
                    />

                    <Route
                        path="/technician/add"
                        element={<TechnicianAdd />}
                    />

                    <Route
                        path="/spares-search"
                        element={<SparesSearch />}
                    />

                    <Route
                        path="/check-ticket-status"
                        element={<CheckTicketStatus />}
                    />

                    <Route
                        path="/user-management"
                        element={<UserManagement />}
                    />

                    <Route
                        path="/supersession"
                        element={<Supersession />}
                    />

                    <Route
                        path="/pcr"
                        element={<PCR />}
                    />

                    <Route
                        path="/pcr-download"
                        element={<PCRDownload />}
                    />

                    <Route
                        path="/add-part-category"
                        element={<AddPartCategory />}
                    />

                    <Route
                        path="/legal-case"
                        element={<LegalCase />}
                    />

                    <Route
                        path="/add-franchise"
                        element={<AddFranchise />}
                    />

                    <Route
                        path="/franchise-list"
                        element={<FranchiseList />}
                    />

                    <Route
                        path="/subdealer/editview"
                        element={<EditView />}
                    />

                    <Route
                        path="/add-tech-skill"
                        element={<AddTechSkill />}
                    />

                    <Route
                        path="/evidence-search"
                        element={<EvidenceSearch />}
                    />

                    <Route
                        path="/upload-msme-doc"
                        element={<UploadMSMEDoc />}
                    />

                    <Route
                        path="/search-invoice"
                        element={<SearchInvoice />}
                    />

                    <Route
                        path="/training-manual"
                        element={<TrainingManual />}
                    />

                    <Route
                        path="/sub-dealer-view"
                        element={<SubDealerView />}
                    />

                    <Route 
                        path="/vendor/creation" 
                        element={<Creation />} />


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