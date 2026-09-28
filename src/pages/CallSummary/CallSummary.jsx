import { useEffect, useState } from 'react'

import Highcharts from 'highcharts'
import HighchartsReactModule from 'highcharts-react-official'

const HighchartsReact =
    HighchartsReactModule.default ||
    HighchartsReactModule

import 'highcharts/modules/treemap'

import './CallSummary.css'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import { getCallSummary } from '../../api/reportsApi'


// =========================================
// COLORS
// Same colors used in old Web Forms page
// =========================================

const colors = [
    '#FD8767',
    '#FC8B68',
    '#FC9069',
    '#FC956A',
    '#FC996B',
    '#FC9E6C',
    '#FCA26D',
    '#FCA76E',
    '#FCAB6F',
    '#FCB070',
    '#FCB471',
    '#FCB972',
    '#FCBD73',
    '#FCC274',
    '#FCC675',
    '#FCCB76',
    '#FDCF77',
    '#FCD478',
    '#FCD879',
    '#FCDD7A',
    '#FCE17B',
    '#FCE67C',
    '#FCEA7D',
    '#FCEF7E',
    '#FCF078'
]


function CallSummary() {

    const [callSummaryData, setCallSummaryData] =
        useState([])


    // =========================================
    // LOAD CALL SUMMARY
    // =========================================

    useEffect(() => {

        const loadCallSummary = async () => {

            const branchCode =
                sessionStorage.getItem('bpCode')

            if (!branchCode) {

                console.error(
                    'BP Code is not available.'
                )

                return
            }

            try {

                const response =
                    await getCallSummary(branchCode)


                setCallSummaryData(
                    response.data || []
                )


                console.log(
                    'Call Summary API response:',
                    response
                )

            } catch (error) {

                console.error(
                    'Call Summary error:',
                    error
                )

            }

        }


        loadCallSummary()

    }, [])


    // =========================================
    // BUILD TREEMAP DATA
    // =========================================

    const buildChartData = (rows) => {

        const chartData = []

        const branchGroups = {}


        // =====================================
        // GROUP BY BRANCH
        // =====================================

        rows.forEach((row) => {

            const branchCode =
                String(row.BrCode ?? '')

            const branchName =
                String(row.Branch ?? '').trim()

            const franchiseCode =
                String(row.FrCode ?? '')

            const franchiseName =
                String(row.Franchise ?? '').trim()

            const status =
                String(row.Status ?? '').trim()

            const ticketCount =
                Number(row.TicketCount ?? 0)

            const count =
                Number(row.Count ?? 0)


            if (!branchGroups[branchCode]) {

                branchGroups[branchCode] = {

                    branchCode,

                    branchName,

                    ticketCount: 0,

                    count: 0,

                    franchises: {}

                }

            }


            branchGroups[branchCode].ticketCount +=
                ticketCount


            branchGroups[branchCode].count =
                Math.max(
                    branchGroups[branchCode].count,
                    count
                )


            if (
                !branchGroups[branchCode]
                    .franchises[franchiseCode]
            ) {

                branchGroups[branchCode]
                    .franchises[franchiseCode] = {

                        franchiseCode,

                        franchiseName,

                        ticketCount: 0,

                        statuses: []

                    }

            }


            branchGroups[branchCode]
                .franchises[franchiseCode]
                .ticketCount += ticketCount


            branchGroups[branchCode]
                .franchises[franchiseCode]
                .statuses.push({

                    status,

                    ticketCount

                })

        })


        // =====================================
        // SORT BRANCHES
        // Same as old Web Forms code
        // OrderByDescending(x => x.Count)
        // =====================================

        const branches =
            Object.values(branchGroups)
                .sort(
                    (a, b) =>
                        b.count - a.count
                )


        // =====================================
        // CREATE CHART DATA
        // =====================================

        branches.forEach(
            (branch, branchIndex) => {

                const branchId =
                    `id_${branchIndex}`


                // =================================
                // BRANCH
                // =================================

                chartData.push({

                    id: branchId,

                    name:
                        branch.branchName,

                    parent:
                        null,

                    value:
                        branch.ticketCount,

                    color:
                        colors[
                            branchIndex %
                            colors.length
                        ]

                })


                // =================================
                // FRANCHISE
                // =================================

                const franchises =
                    Object.values(
                        branch.franchises
                    )


                franchises.forEach(
                    (franchise, franchiseIndex) => {

                        const franchiseId =
                            `id_${branchIndex}_${franchiseIndex}`


                        chartData.push({

                            id: franchiseId,

                            name:
                                franchise.franchiseName,

                            parent:
                                branchId,

                            value:
                                franchise.ticketCount,

                            color:
                                colors[
                                    franchiseIndex %
                                    colors.length
                                ]

                        })


                        // =============================
                        // STATUS
                        // =============================

                        franchise.statuses.forEach(
                            (
                                status,
                                statusIndex
                            ) => {

                                chartData.push({

                                    id:
                                        `id_${branchIndex}_${franchiseIndex}_${statusIndex}`,

                                    name:
                                        status.status,

                                    parent:
                                        franchiseId,

                                    value:
                                        status.ticketCount,

                                    color:
                                        colors[
                                            statusIndex %
                                            colors.length
                                        ]

                                })

                            }
                        )

                    }
                )

            }
        )


        return chartData
    }


    // =========================================
    // CREATE CHART DATA
    // =========================================

    const chartData =
        buildChartData(
            callSummaryData
        )


    console.log(
        'Treemap chart data:',
        chartData
    )


    // =========================================
    // HIGHCHARTS CONFIGURATION
    // =========================================

    const chartOptions = {

        accessibility: {
            describeSingleSeries: true
        },

        chart: {
            height: 600,
            width: 800
        },

        series: [
            {
                type: 'treemap',

                layoutAlgorithm: 'squarified',

                allowDrillToNode: true,

                animationLimit: 1000,

                turboThreshold: 10000,

                dataLabels: {
                    enabled: false
                },

                levelIsConstant: false,

                levels: [
                    {
                        level: 1,

                        dataLabels: {
                            enabled: true
                        },

                        borderWidth: 3
                    }
                ],

                opacity: 1.0,

                data: chartData
            }
        ],

        subtitle: {
            text: 'Click points to drill down.'
        },

        title: {
            text: 'Call Summary'
        },

        credits: {
            enabled: true,
            text: 'etraining.ifbhub.com',
            href: 'https://etraining.ifbhub.com'
        }
    }


    // =========================================
    // PAGE
    // =========================================

    return (

        <DashboardLayout title="Call Summary">

            <div className="call-summary-container">

                <HighchartsReact
                    highcharts={Highcharts}
                    options={chartOptions}
                />

            </div>

        </DashboardLayout>

    )
}


export default CallSummary