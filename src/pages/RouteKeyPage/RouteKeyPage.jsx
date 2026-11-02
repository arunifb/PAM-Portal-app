import { useEffect, useState, Suspense} from 'react'
//import { useEffect, useState, useRef } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
import {
    useParams,
    useNavigate,
    useLocation,
    useSearchParams
} from 'react-router-dom'

import { getDashboardMenu } from '../../api/dashboardApi'
import { logout } from '../../api/authApi'

//import Click2Call from '../Click2Call/Click2Call'
import CallSummary from '../CallSummary/CallSummary'
import FranchiseView from '../FranchiseView/FranchiseView'
//import OneSearch from '../OneSearch/OneSearch'
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
//import TrainingManual from '../TrainingManual/TrainingManual'
import SubDealerView from '../SubDealer/SubDealerView'
import PCRVendorDetails from '../PCRVendorDetails/PCRVendorDetails'
import PCRRefurbishVendorMaster from '../PCRVendorDetails/PCRRefurbishVendorMaster'
import {
    getPageByReactUrl
} from '../../routes/pageRegistry'
// import VendorCreation from '../Vendor/Creation'

function RouteKeyPage() {

    const { routeKey } = useParams()

    const navigate = useNavigate()


    const handleBackToLogin = async () => {
    const userId = sessionStorage.getItem('userId')

        try {
            if (userId) {
                await logout(userId)
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            sessionStorage.clear()
            navigate('/', { replace: true })
        }
    }


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

    const [searchParams, setSearchParams] = useSearchParams()

// Default to Add Franchise; preserve the selected view on refresh.
const franchiseView =
    searchParams.get('view') === 'list' ? 'list' : 'add'

const setFranchiseView = (view) => {
    if (view === 'list') {
        setSearchParams({ view: 'list' })
    } else {
        setSearchParams({})
    }
}


// =========================================
// PCR VENDOR DETAILS STATE
// =========================================

const [pcrView, setPcrView] = useState(
    () => location.state?.pcrView || 'vendor-details'
)

const [pcrSelectedRecord, setPcrSelectedRecord] = useState(
    () => location.state?.pcrSelectedRecord || null
)

    const [technicianView, setTechnicianView] = useState('list')
    const [technicianListState, setTechnicianListState] = useState(null)
    const [refreshAfterAdd, setRefreshAfterAdd] = useState(0)
    const [technicianEditState, setTechnicianEditState] = useState(null)


    // =========================================
    // REACT URL -> COMPONENT
    // =========================================

    const routeComponents = {

        // '/click2call':
        //     Click2Call,

        '/call-summary':
            CallSummary,

        '/franchise-view':
            FranchiseView,

        // '/one-search':
        //     OneSearch,

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

        // '/training-manual':
        //     TrainingManual,

        '/sub-dealer-view':
            SubDealerView,

        '/pcr-vendor-details':
            PCRVendorDetails,

        '/pcr-refurbish-vendor-master':
            PCRRefurbishVendorMaster,

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
}, [routeKey, location.pathname])




// =========================================
// RESET PCR STATE WHEN LEAVING PCR MENU
// =========================================

useEffect(() => {
    if (!menuItem) return

    const currentReactUrl = menuItem.reactUrl
        ?.toLowerCase()
        .trim()

    if (currentReactUrl !== '/pcr-vendor-details') {
        setPcrView('vendor-details')
        setPcrSelectedRecord(null)
    }
}, [menuItem, routeKey, location.pathname])

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

    // =========================================
    // 404 NOT FOUND DESIGN
    // =========================================

    if (error || !menuItem) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    width: '100%',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '20px',
                    boxSizing: 'border-box',
                    fontFamily: 'Arial, sans-serif'
                }}
            >
                <h1
                    style={{
                        fontSize: 'clamp(90px, 15vw, 180px)',
                        fontWeight: 400,
                        lineHeight: 0.9,
                        letterSpacing: '-8px',
                        margin: '0 0 30px',
                        color: '#000000'
                    }}
                >
                    404
                </h1>

                <h4
                    style={{
                        fontSize: 'clamp(16px, 2vw, 24px)',
                        fontWeight: 700,
                        letterSpacing: '6px',
                        textTransform: 'uppercase',
                        margin: '0 0 35px',
                        color: '#000000'
                    }}
                >
                    NOT FOUND
                </h4>

                <button
                    type="button"
                    onClick={handleBackToLogin}
                    style={{
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        border: '2px solid #000000',
                        padding: '14px 34px',
                        fontSize: '14px',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                    }}
                >
                    Back to Login
                </button>
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


    // const PageComponent =
    //     routeComponents[reactUrl]

    const PageComponent =
    routeComponents[reactUrl] ||
    getPageByReactUrl(reactUrl)


    // =========================================
    // REACT PAGE NOT MAPPED
    // =========================================

    if (!PageComponent) {
    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#ffffff',
                color: '#000000',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'switzer, sans-serif'
            }}
        >
            <h1
                style={{
                    fontSize: 'clamp(90px, 15vw, 180px)',
                    fontWeight: 900,
                    lineHeight: 0.9,
                    margin: '0 0 45px'
                }}
            >
                404
            </h1>

            <h4
                style={{
                    fontSize: 'clamp(16px, 2vw, 24px)',
                    letterSpacing: '10px',
                    margin: '0 0 35px'
                }}
            >
                NOT FOUND
            </h4>

            <button
                type="button"
                onClick={handleBackToLogin}
                style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: '2px solid #000000',
                    padding: '14px 34px',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    cursor: 'pointer'
                }}
            >
                Back to Login
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

    if (reactUrl === '/pcr-vendor-details') {
    return (
        <PCRVendorDetails
            activePage={pcrView}
            selectedPCRRecord={pcrSelectedRecord}
            onChangePage={(page, record = null) => {
                setPcrView(page)
                setPcrSelectedRecord(record)

                navigate(location.pathname, {
                    replace: true,
                    state: {
                        ...location.state,
                        pcrView: page,
                        pcrSelectedRecord: record
                    }
                })
            }}
        />
    )
}

return (
    <Suspense
        fallback={
            <div style={{ padding: '40px', textAlign: 'center' }}>
                Loading page...
            </div>
        }
    >
        <PageComponent />
    </Suspense>
)

    }


export default RouteKeyPage