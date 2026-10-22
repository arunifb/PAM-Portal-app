import { useEffect, useState } from 'react'
//import { useEffect, useState, useRef } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

import { getDashboardMenu } from '../../api/dashboardApi'

import Click2Call from '../Click2Call/Click2Call'
import CallSummary from '../CallSummary/CallSummary'
import FranchiseView from '../FranchiseView/FranchiseView'
import OneSearch from '../OneSearch/OneSearch'
import DigitalContract from '../DigitalContract/DigitalContract'
import Inventory from '../Inventory/FranchiseeInventory'
import EditView from '../SubDealer/EditView'
import SkillSetView from '../SkillSetView/SkillSetView'
import BomExplodedView from '../BomExplodedView/BomExplodedView'
import DDRRegion from '../DDRRegion/DDRRegion'
import DigitalICR from '../DigitalICR/DigitalICR'
import SparesStock from '../SparesStock/SparesStock'
import Technician from '../Technician/Technician'
import TechnicianEdit from '../Technician/TechnicianEdit'
import SparesSearch from '../SparesSearch/SparesSearch'
import UserManagement from '../UserManagement/UserManagement'
import CheckTicketStatus from '../CheckTicketStatus/CheckTicketStatus'
import Supersession from '../Supersession/Supersession'
import PCR from '../PCR/PCR'
import PCRDownload from '../PCRDownload/PCRDownload'
import AddPartCategory from '../AddPartCategory/AddPartCategory'
import LegalCase from '../LegalCase/LegalCase'
import ReportData from '../ReportData/ReportData'
import AddFranchise from '../AddFranchise/AddFranchise'
import FranchiseList from '../Franchise/FranchiseList'
import AddTechSkill from '../AddTechSkill/AddTechSkill'
import EvidenceSearch from '../EvidenceSearch/EvidenceSearch'
import TechnicianAdd from '../Technician/TechnicianAdd'
import UploadMSMEDoc from '../UploadMSMEDoc/UploadMSMEDoc'
import SearchInvoice from '../SearchInvoice/SearchInvoice'
import TrainingManual from '../TrainingManual/TrainingManual'
import SubDealerView from '../SubDealer/SubDealerView'
// import VendorCreation from '../Vendor/Creation'

function RouteKeyPage() {

    const { routeKey } = useParams()

    const navigate = useNavigate()


    const location = useLocation()

    // const previousRouteKey = useRef(routeKey)

    const showSubDealerView =
        location.state?.showSubDealerView === true


    // =========================================
    // STATE
    // =========================================

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [menuItem, setMenuItem] =
        useState(null)

    const [franchiseView, setFranchiseView] = useState('add')

    const [technicianView, setTechnicianView] = useState('list')
    const [technicianListState, setTechnicianListState] = useState(null)
    const [refreshAfterAdd, setRefreshAfterAdd] = useState(0)
    const [technicianEditState, setTechnicianEditState] = useState(null)


    // =========================================
    // REACT URL -> COMPONENT
    // =========================================

    const routeComponents = {

        '/click2call':
            Click2Call,

        '/call-summary':
            CallSummary,

        '/franchise-view':
            FranchiseView,

        '/one-search':
            OneSearch,

        '/digital-contract':
            DigitalContract,

        '/inventory':
            Inventory,

        '/subdealer/editview':
            EditView,

        '/skill-set-view':
            SkillSetView,

        '/bom-exploded-view':
            BomExplodedView,

        '/ddr-region':
            DDRRegion,

        '/digital-icr':
            DigitalICR,

        '/spares-stock':
            SparesStock,

        '/technician':
            Technician,

        '/technician/add':
            TechnicianAdd,

        '/spares-search':
            SparesSearch,

        '/user-management':
            UserManagement,

        '/check-ticket-status':
            CheckTicketStatus,

        '/supersession':
            Supersession,

        '/pcr':
            PCR,

        '/pcr-download':
            PCRDownload,

        '/add-part-category':
            AddPartCategory,

        '/legal-case':
            LegalCase,

        '/add-franchise': AddFranchise,

        '/franchise-list': FranchiseList,

        '/add-tech-skill':
                 AddTechSkill,

        '/evidence-search':
                EvidenceSearch,

        '/upload-msme-doc':
                UploadMSMEDoc,
                
        '/search-invoice': SearchInvoice,

        '/training-manual':
            TrainingManual,

        '/sub-dealer-view':
            SubDealerView,

        // '/vendor/creation': 
        // VendorCreation,

        // =========================================
        // REPORT DATA
        // =========================================

        '/report-data':
            ReportData

    }


    // =========================================
    // LOAD MENU BY USER
    // =========================================

    useEffect(() => {

        const loadMenu = async () => {

            const userId =
                sessionStorage.getItem('userId')


            if (!userId) {

                setError(
                    'User information is not available.'
                )

                setLoading(false)

                return
            }


            if (!routeKey) {

                setError(
                    'RouteKey is not available.'
                )

                setLoading(false)

                return
            }


            try {

                const data =
                    await getDashboardMenu(userId)


                if (!Array.isArray(data)) {

                    throw new Error(
                        'Invalid dashboard menu response.'
                    )
                }


                


                // =========================================
                // FIND MENU USING ROUTEKEY
                // =========================================

                const matchedMenu =
                    data.find(
                        (item) =>
                            item.routeKey &&
                            item.routeKey.toLowerCase() ===
                                routeKey.toLowerCase()
                    )


                if (!matchedMenu) {

                    throw new Error(
                        'The requested menu was not found for your user.'
                    )
                }


                setMenuItem(
                    matchedMenu
                )


                console.log(
                    'UserID:',
                    userId
                )

                console.log(
                    'RouteKey matched menu:',
                    matchedMenu
                )


            } catch (error) {

                console.error(
                    'RouteKey page error:',
                    error
                )

                setError(
                    error.message ||
                    'Unable to load requested page.'
                )

            } finally {

                setLoading(false)

            }
        }


        loadMenu()

    }, [
        routeKey
    ])


    // =========================================
// UPDATE BROWSER TAB TITLE FROM MENU NAME
// =========================================

useEffect(() => {
    if (menuItem) {
        const menuName =
            menuItem.menuName ||
            menuItem.MenuName

        if (menuName) {
            document.title = `eTraining-${menuName}`
        }
    }
}, [menuItem])

useEffect(() => {
    // Reset Technician Management to its default list view
    setTechnicianView('list')
    setTechnicianEditState(null)
    setTechnicianListState(null)

    // Reset Franchise Management to Add Franchise
    setFranchiseView('add')
}, [routeKey, location.pathname])


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <div
                style={{
                    padding: '40px',
                    textAlign: 'center'
                }}
            >
                Loading page...
            </div>

        )
    }


    // =========================================
    // ERROR
    // =========================================

    if (error) {

        return (

            <div
                style={{
                    padding: '40px',
                    textAlign: 'center'
                }}
            >

                <h2>
                    Unable to open page
                </h2>

                <p>
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate('/dashboard')
                    }
                >
                    Back to Dashboard
                </button>

            </div>

        )
    }


    // =========================================
    // NO MENU
    // =========================================

    if (!menuItem) {

        return (

            <div
                style={{
                    padding: '40px',
                    textAlign: 'center'
                }}
            >
                Menu item not found.
            </div>

        )
    }


    // =========================================
    // GET REACT COMPONENT
    // =========================================

    const reactUrl =
        menuItem.reactUrl
            ?.toLowerCase()
            .trim()


    const PageComponent =
        routeComponents[reactUrl]


    // =========================================
    // REACT PAGE NOT MAPPED
    // =========================================

    if (!PageComponent) {

        return (

            <div
                style={{
                    padding: '40px',
                    textAlign: 'center'
                }}
            >

                <h2>
                    Page is not available
                </h2>

                <p>
                    No React page is mapped for:
                </p>

                <strong>
                    {menuItem.reactUrl || 'No ReactUrl'}
                </strong>

                <br />
                <br />

                <button
                    type="button"
                    onClick={() =>
                        navigate('/dashboard')
                    }
                >
                    Back to Dashboard
                </button>

            </div>

        )
    }


    // =========================================
    // RENDER FRANCHISE PAGES WITHOUT URL CHANGE
    // =========================================

    if (reactUrl === '/add-franchise') {
        if (franchiseView === 'list') {
            return (
                <FranchiseList
                    onAddFranchise={() => setFranchiseView('add')}
                />
            )
        }

        return (
            <AddFranchise
                onBack={() => setFranchiseView('list')}
            />
        )
    }



    // if (reactUrl === '/technician') {
    //     if (technicianView === 'add') {
    //         return (
    //             <TechnicianAdd
    //                 onBack={(result) => {
    //                     setTechnicianView('list')

    //                     if (result?.listState) {
    //                         setTechnicianListState(result.listState)
    //                     }

    //                     if (result?.refreshTechnicians) {
    //                         setRefreshAfterAdd((prev) => prev + 1)
    //                     }
    //                 }}
    //                 listState={technicianListState}
    //             />
    //         )
    //     }

    //     return (
    //         <Technician
    //             onAddTechnician={(listState) => {
    //                 setTechnicianListState(listState)
    //                 setTechnicianView('add')
    //             }}
    //             restoreListState={technicianListState}
    //             refreshAfterAdd={refreshAfterAdd}
    //         />
    //     )
    // }

    if (reactUrl === '/technician') {
    if (technicianView === 'add') {
        return (
            <TechnicianAdd
                onBack={(result) => {
                    setTechnicianView('list')

                    if (result?.listState) {
                        setTechnicianListState(result.listState)
                    }

                    if (result?.refreshTechnicians) {
                        setRefreshAfterAdd((prev) => prev + 1)
                    }
                }}
                listState={technicianListState}
            />
        )
    }

    // Show Technician Edit without changing the URL
    if (technicianEditState) {
        return (
            <TechnicianEdit
                techId={technicianEditState.techId}
                profileMode={technicianEditState.profileMode}
                listState={technicianEditState.listState}
                onBack={() => {
                    setTechnicianEditState(null)
                }}
            />
        )
    }

    // Show Technician list
    return (
        <Technician
            onAddTechnician={(listState) => {
                setTechnicianListState(listState)
                setTechnicianView('add')
            }}
            onEditTechnician={(editState) => {
                setTechnicianListState(editState.listState)
                setTechnicianEditState(editState)
            }}
            restoreListState={technicianListState}
            refreshAfterAdd={refreshAfterAdd}
        />
    )
}


    if (
        reactUrl === '/subdealer/editview' &&
        showSubDealerView
            ) {
            return <SubDealerView />
        }

    return <PageComponent />

    }


export default RouteKeyPage