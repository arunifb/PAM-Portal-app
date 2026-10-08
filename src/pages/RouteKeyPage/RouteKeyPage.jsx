import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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
import SparesSearch from '../SparesSearch/SparesSearch'
import UserManagement from '../UserManagement/UserManagement'
import CheckTicketStatus from '../CheckTicketStatus/CheckTicketStatus'
import Supersession from '../Supersession/Supersession'
import PCR from '../PCR/PCR'
import PCRDownload from '../PCRDownload/PCRDownload'
import AddPartCategory from '../AddPartCategory/AddPartCategory'
import LegalCase from '../LegalCase/LegalCase'
import ReportData from '../ReportData/ReportData'


function RouteKeyPage() {

    const { routeKey } = useParams()

    const navigate = useNavigate()


    // =========================================
    // STATE
    // =========================================

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [menuItem, setMenuItem] =
        useState(null)


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
    // RENDER CORRECT REACT PAGE
    // =========================================

    return (
        <PageComponent />
    )
}


export default RouteKeyPage