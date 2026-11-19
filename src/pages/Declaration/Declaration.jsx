import { useState } from 'react'
import { Download } from 'lucide-react'

import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'

import { downloadDeclaration } from '../../api/declarationApi'

import './Declaration.css'


function Declaration() {

    const [isLoading, setIsLoading] = useState(false)

    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')


    // =========================================
    // DOWNLOAD DECLARATION
    // =========================================

    const handleDownload = async () => {

        setMessage('')
        setMessageType('')

        try {

            setIsLoading(true)

            await downloadDeclaration()

            setMessage(
                'Declaration document downloaded successfully.'
            )

            setMessageType('success')

        } catch (error) {

            console.error(
                'Declaration download error:',
                error
            )

            setMessage(
                error.message ||
                'Unable to download declaration document.'
            )

            setMessageType('danger')

        } finally {

            setIsLoading(false)

        }

    }


    // =========================================
    // RENDER
    // =========================================

    return (

        <DashboardLayout title="Declaration">

            <div className="declaration-page">

                <div className="declaration-card">

                    {/* MESSAGE */}

                    {message && (

                        <div
                            className={
                                `declaration-alert declaration-alert-${messageType}`
                            }
                        >
                            {message}
                        </div>

                    )}


                    {/* DECLARATION BUTTON */}

                    <div className="declaration-form">

                        <div className="declaration-form-row">

                            {/* <label>
                                Declaration
                            </label> */}

                            <div className="declaration-field">

                                <button
                                    type="button"
                                    className="declaration-btn"
                                    onClick={handleDownload}
                                    disabled={isLoading}
                                >

                                    <Download size={15} />

                                    {isLoading
                                        ? 'Downloading...'
                                        : 'Declaration'
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </DashboardLayout>

    )

}


export default Declaration