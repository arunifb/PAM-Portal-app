import { useEffect, useState, Suspense } from 'react'

import {
    useParams,
    useNavigate,
    useLocation,
    useSearchParams
} from 'react-router-dom'

import { getDashboardMenu } from '../../api/dashboardApi'
import { logout } from '../../api/authApi'

import {
    getPageByReactUrl
} from '../../routes/pageRegistry'

// import EMUIDUpload from '../../pages/EMUIDUpload/EMUIDUpload'


function RouteKeyPage() {

    const { routeKey } = useParams()

    const navigate = useNavigate()


    const handleBackToLogin = async () => {

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

            navigate(
                '/',
                { replace: true }
            )

        }
    }


    const location = useLocation()


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

    const [searchParams, setSearchParams] =
        useSearchParams()


    // =========================================
    // FRANCHISE NAVIGATION STATE
    // =========================================

    // Default to Add Franchise;
    // preserve the selected view on refresh.

    const franchiseView =
        searchParams.get('view') === 'list'
            ? 'list'
            : 'add'


    const setFranchiseView = (view) => {

        if (view === 'list') {

            setSearchParams({
                view: 'list'
            })

        } else {

            setSearchParams({})

        }

    }


    // =========================================
    // TRAINING MANUAL NAVIGATION STATE
    // Restore Add/List page after browser refresh
    // =========================================

    const TRAINING_MANUAL_STORAGE_KEY =
        'trainingManualNavigationState'


    const getSavedTrainingManualState = () => {

        try {

            const saved =
                sessionStorage.getItem(
                    TRAINING_MANUAL_STORAGE_KEY
                )

            if (!saved) {
                return null
            }

            const parsed =
                JSON.parse(saved)

            if (
                String(parsed.routeKey).toLowerCase() ===
                String(routeKey).toLowerCase()
            ) {

                return parsed

            }

            return null

        } catch (error) {

            sessionStorage.removeItem(
                TRAINING_MANUAL_STORAGE_KEY
            )

            return null

        }

    }


    const [trainingManualView, setTrainingManualView] =
        useState(
            () =>
                getSavedTrainingManualState()?.view ??
                'list'
        )


    // =========================================
    // PCR VENDOR DETAILS STATE
    // =========================================

    const [pcrView, setPcrView] =
        useState(
            () =>
                location.state?.pcrView ||
                'vendor-details'
        )


    const [pcrSelectedRecord, setPcrSelectedRecord] =
        useState(
            () =>
                location.state?.pcrSelectedRecord ||
                null
        )


    // =========================================
    // TECHNICIAN NAVIGATION STATE
    // Restore Edit page after browser refresh
    // =========================================

    const TECHNICIAN_STORAGE_KEY =
        'technicianNavigationState'


    const getSavedTechnicianState = () => {

        try {

            const saved =
                sessionStorage.getItem(
                    TECHNICIAN_STORAGE_KEY
                )

            if (!saved) {
                return null
            }

            const parsed =
                JSON.parse(saved)

            if (
                String(parsed.routeKey).toLowerCase() ===
                String(routeKey).toLowerCase()
            ) {

                return parsed

            }

            return null

        } catch (error) {

            sessionStorage.removeItem(
                TECHNICIAN_STORAGE_KEY
            )

            return null

        }

    }


    const [technicianView, setTechnicianView] =
        useState(
            () =>
                getSavedTechnicianState()?.view ??
                'list'
        )


    const [technicianListState, setTechnicianListState] =
        useState(
            () =>
                getSavedTechnicianState()?.listState ??
                null
        )


    const [refreshAfterAdd, setRefreshAfterAdd] =
        useState(0)


    const [technicianEditState, setTechnicianEditState] =
        useState(
            () =>
                getSavedTechnicianState()?.editState ??
                null
        )


    // =========================================
    // PAIN KILLER STATE
    // RESTORE AFTER REFRESH
    // =========================================

    const PAIN_KILLER_STORAGE_KEY =
        'painKillerNavigationState'


    const getSavedPainKillerState = () => {

        try {

            const saved =
                sessionStorage.getItem(
                    PAIN_KILLER_STORAGE_KEY
                )

            if (!saved) {
                return null
            }

            const parsed =
                JSON.parse(saved)

            if (
                String(parsed.routeKey).toLowerCase() ===
                String(routeKey).toLowerCase()
            ) {

                return parsed

            }

            return null

        } catch (error) {

            sessionStorage.removeItem(
                PAIN_KILLER_STORAGE_KEY
            )

            return null

        }

    }


    const [painKillerListState, setPainKillerListState] =
        useState(
            () =>
                getSavedPainKillerState()?.listState ??
                null
        )


    const [painKillerEditState, setPainKillerEditState] =
        useState(
            () =>
                getSavedPainKillerState()?.editState ??
                null
        )


    const [refreshPainKiller, setRefreshPainKiller] =
        useState(0)


    // =========================================
    // REACT URL -> COMPONENT
    // =========================================

    const routeComponents = {

        // =====================================
        // EMUID UPLOAD
        // =====================================

        // '/emuid-upload': EMUIDUpload

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

                document.title =
                    `eTraining-${menuName}`

            }

        }

    }, [
        menuItem
    ])


    // =========================================
    // TECHNICIAN NAVIGATION STATE VALIDATION
    // Clear saved state only when leaving Technician
    // =========================================

    useEffect(() => {

        if (!menuItem) {
            return
        }


        const currentReactUrl =
            menuItem.reactUrl
                ?.toLowerCase()
                .trim()


        if (
            currentReactUrl !==
            '/technician'
        ) {

            sessionStorage.removeItem(
                TECHNICIAN_STORAGE_KEY
            )

            setTechnicianView('list')

            setTechnicianEditState(null)

            setTechnicianListState(null)

        }

    }, [
        menuItem,
        routeKey
    ])


    // =========================================
    // RESET PCR STATE WHEN LEAVING PCR MENU
    // =========================================

    useEffect(() => {

        if (!menuItem) {
            return
        }


        const currentReactUrl =
            menuItem.reactUrl
                ?.toLowerCase()
                .trim()


        if (
            currentReactUrl !==
            '/pcr-vendor-details'
        ) {

            setPcrView(
                'vendor-details'
            )

            setPcrSelectedRecord(
                null
            )

        }

    }, [
        menuItem,
        routeKey,
        location.pathname
    ])


    // =========================================
    // PAIN KILLER NAVIGATION STATE VALIDATION
    // =========================================

    useEffect(() => {

        if (!menuItem) {
            return
        }


        const currentReactUrl =
            menuItem.reactUrl
                ?.toLowerCase()
                .trim()


        if (
            currentReactUrl !==
            '/pain-killer'
        ) {

            sessionStorage.removeItem(
                PAIN_KILLER_STORAGE_KEY
            )

            setPainKillerEditState(null)

            setPainKillerListState(null)

        }

    }, [
        menuItem,
        routeKey
    ])


    // =========================================
    // TRAINING MANUAL NAVIGATION STATE VALIDATION
    // Clear saved state when leaving Training Manual
    // =========================================

    useEffect(() => {

        if (!menuItem) {
            return
        }


        const currentReactUrl =
            menuItem.reactUrl
                ?.toLowerCase()
                .trim()


        if (
            currentReactUrl !==
            '/training-manual'
        ) {

            sessionStorage.removeItem(
                TRAINING_MANUAL_STORAGE_KEY
            )

            setTrainingManualView(
                'list'
            )

        }

    }, [
        menuItem,
        routeKey
    ])


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
                        fontSize:
                            'clamp(90px, 15vw, 180px)',
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
                        fontSize:
                            'clamp(16px, 2vw, 24px)',
                        fontWeight: 700,
                        letterSpacing: '6px',
                        textTransform: 'uppercase',
                        margin: '0 0 35px',
                        color: '#000000'
                    }}
                >
                    NOT FOUND
                </h4>


                <p
                    style={{
                        fontSize: '15px',
                        fontWeight: 400,
                        color: '#555555',
                        margin: '-15px 0 30px',
                        lineHeight: 1.6,
                        maxWidth: '500px'
                    }}
                >
                    The page you are looking for was moved,
                    removed, renamed or might never existed
                </p>


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


    const PageComponent =
        routeComponents[reactUrl] ||
        getPageByReactUrl(reactUrl)


    // =========================================
    // REPORT DATA / REPORT SUMMARY
    // =========================================

    if (
        reactUrl === '/report-data' ||
        reactUrl === '/report-summary'
    ) {

        const reportCategory =
            reactUrl === '/report-data'
                ? 'D'
                : 'S'


        return (

            <ReportData
                key={reactUrl}
                reportCategory={
                    reportCategory
                }
                title={
                    menuItem.name ||
                    menuItem.menuName ||
                    menuItem.MenuName ||
                    'Reports'
                }
            />

        )

    }


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
                        fontSize:
                            'clamp(90px, 15vw, 180px)',
                        fontWeight: 900,
                        lineHeight: 0.9,
                        margin: '0 0 45px'
                    }}
                >
                    404
                </h1>


                <h4
                    style={{
                        fontSize:
                            'clamp(16px, 2vw, 24px)',
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
    // RENDER FRANCHISE PAGES
    // WITHOUT URL CHANGE
    // =========================================

    if (
        reactUrl === '/add-franchise'
    ) {

        if (
            franchiseView === 'list'
        ) {

            return (

                <FranchiseList
                    onAddFranchise={() =>
                        setFranchiseView(
                            'add'
                        )
                    }
                />

            )

        }


        return (

            <AddFranchise
                onBack={() =>
                    setFranchiseView(
                        'list'
                    )
                }
            />

        )

    }


    // =========================================
    // TRAINING MANUAL LIST / ADD
    // =========================================

    if (
        reactUrl === '/training-manual'
    ) {

        // =====================================
        // SHOW ADD PAGE
        // =====================================

        if (
            trainingManualView === 'add'
        ) {

            return (

                <TrainingManualAdd
                    onBack={() => {

                        sessionStorage.removeItem(
                            TRAINING_MANUAL_STORAGE_KEY
                        )

                        setTrainingManualView(
                            'list'
                        )

                    }}
                />

            )

        }


        // =====================================
        // SHOW LIST PAGE
        // =====================================

        return (

            <TrainingManual
                onAdd={() => {

                    const savedState = {
                        routeKey,
                        view: 'add'
                    }


                    sessionStorage.setItem(
                        TRAINING_MANUAL_STORAGE_KEY,
                        JSON.stringify(
                            savedState
                        )
                    )


                    setTrainingManualView(
                        'add'
                    )

                }}
            />

        )

    }


    // =========================================
    // TECHNICIAN LIST / ADD / EDIT
    // =========================================

    if (
        reactUrl === '/technician'
    ) {

        // =====================================
        // SHOW ADD PAGE
        // =====================================

        if (
            technicianView === 'add'
        ) {

            return (

                <TechnicianAdd
                    onBack={(result) => {

                        sessionStorage.removeItem(
                            TECHNICIAN_STORAGE_KEY
                        )


                        setTechnicianView(
                            'list'
                        )


                        if (
                            result?.listState
                        ) {

                            setTechnicianListState(
                                result.listState
                            )

                        }


                        if (
                            result?.refreshTechnicians
                        ) {

                            setRefreshAfterAdd(
                                (prev) =>
                                    prev + 1
                            )

                        }

                    }}
                    listState={
                        technicianListState
                    }
                />

            )

        }


        // =====================================
        // SHOW EDIT PAGE
        // =====================================

        if (
            technicianEditState
        ) {

            return (

                <TechnicianEdit
                    techId={
                        technicianEditState.techId
                    }
                    profileMode={
                        technicianEditState.profileMode
                    }
                    listState={
                        technicianEditState.listState
                    }
                    onBack={() => {

                        sessionStorage.removeItem(
                            TECHNICIAN_STORAGE_KEY
                        )


                        setTechnicianEditState(
                            null
                        )

                    }}
                />

            )

        }


        // =====================================
        // SHOW TECHNICIAN LIST
        // =====================================

        return (

            <Technician
                onAddTechnician={(listState) => {

                    const savedState = {
                        routeKey,
                        view: 'add',
                        listState
                    }


                    sessionStorage.setItem(
                        TECHNICIAN_STORAGE_KEY,
                        JSON.stringify(
                            savedState
                        )
                    )


                    setTechnicianListState(
                        listState
                    )

                    setTechnicianView(
                        'add'
                    )

                }}


                onEditTechnician={(editState) => {

                    const savedState = {
                        routeKey,
                        view: 'edit',
                        editState,
                        listState:
                            editState.listState
                    }


                    // Save Technician Edit
                    // navigation state
                    // before changing React state.

                    sessionStorage.setItem(
                        TECHNICIAN_STORAGE_KEY,
                        JSON.stringify(
                            savedState
                        )
                    )


                    setTechnicianListState(
                        editState.listState
                    )

                    setTechnicianEditState(
                        editState
                    )

                }}


                restoreListState={
                    technicianListState
                }

                refreshAfterAdd={
                    refreshAfterAdd
                }

            />

        )

    }


    // =========================================
    // PAIN KILLER LIST / EDIT
    // =========================================

    if (
        reactUrl === '/pain-killer'
    ) {

        // =====================================
        // SHOW PAIN KILLER EDIT
        // =====================================

        if (
            painKillerEditState
        ) {

            return (

                <PainKillerEdit
                    refid={
                        painKillerEditState.refid
                    }
                    listState={
                        painKillerEditState.listState
                    }
                    onBack={(result) => {

                        setPainKillerEditState(
                            null
                        )


                        sessionStorage.removeItem(
                            PAIN_KILLER_STORAGE_KEY
                        )


                        if (
                            result?.listState
                        ) {

                            setPainKillerListState(
                                result.listState
                            )

                        }


                        if (
                            result?.refreshPainKiller
                        ) {

                            setRefreshPainKiller(
                                prev =>
                                    prev + 1
                            )

                        }

                    }}
                />

            )

        }


        // =====================================
        // SHOW PAIN KILLER LIST
        // =====================================

        return (

            <PainKiller
                onEditPainKiller={(editState) => {

                    const savedState = {
                        routeKey,
                        editState,
                        listState:
                            editState.listState
                    }


                    // Save before changing
                    // React state

                    sessionStorage.setItem(
                        PAIN_KILLER_STORAGE_KEY,
                        JSON.stringify(
                            savedState
                        )
                    )


                    setPainKillerListState(
                        editState.listState
                    )

                    setPainKillerEditState(
                        editState
                    )

                }}


                restoreListState={
                    painKillerListState
                }


                refreshAfterEdit={
                    refreshPainKiller
                }

            />

        )

    }


    // =========================================
    // SUB DEALER VIEW
    // =========================================

    if (
        reactUrl === '/subdealer/editview' &&
        showSubDealerView
    ) {

        return (
            <SubDealerView />
        )

    }


    // =========================================
    // PCR VENDOR DETAILS
    // =========================================

    if (
        reactUrl === '/pcr-vendor-details'
    ) {

        return (

            <PCRVendorDetails
                activePage={
                    pcrView
                }

                selectedPCRRecord={
                    pcrSelectedRecord
                }

                onChangePage={(
                    page,
                    record = null
                ) => {

                    setPcrView(
                        page
                    )

                    setPcrSelectedRecord(
                        record
                    )


                    navigate(
                        location.pathname,
                        {
                            replace: true,
                            state: {
                                ...location.state,
                                pcrView:
                                    page,
                                pcrSelectedRecord:
                                    record
                            }
                        }
                    )

                }}

            />

        )

    }


    // =========================================
    // DEFAULT REACT PAGE
    // =========================================

    return (

        <Suspense
            fallback={

                <div
                    style={{
                        padding: '40px',
                        textAlign: 'center'
                    }}
                >
                    Loading page...
                </div>

            }
        >

            <PageComponent />

        </Suspense>

    )

}


export default RouteKeyPage