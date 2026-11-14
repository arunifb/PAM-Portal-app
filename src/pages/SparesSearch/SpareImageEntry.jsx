
import { useRef, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'
import './SpareImageEntry.css'

function SpareImageEntry() {
    const [searchCode, setSearchCode] = useState('')
    const [spareCode, setSpareCode] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [showUploadSection, setShowUploadSection] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const fileInputRef = useRef(null)

    // ADD SPARE IMAGE
    const handleAddImage = () => {
        setSearchCode('')
        setSpareCode('')
        setSelectedFile(null)
        setPreviewUrl('')
        setShowUploadSection(true)
        setShowSuccess(false)
        setError('')

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // SEARCH SPARE IMAGE
    const handleSearch = async () => {
        const code = searchCode.trim()

        if (!code) {
            setError('Please enter spare code to search!!')
            return
        }

        setError('')
        setShowSuccess(false)
        setIsSearching(true)

        try {
            // BACKEND API PENDING:
            // Search for code.jpg, code.jpeg or code.png
            // inside the SpareImages folder.

            setError(
                'Spare image search API is pending from backend.'
            )
            setShowUploadSection(false)
            setPreviewUrl('')
            setSpareCode('')
        } finally {
            setIsSearching(false)
        }
    }

    // FILE SELECTION AND PREVIEW
    const handleFileChange = (event) => {
        const file = event.target.files?.[0]

        if (!file) {
            setSelectedFile(null)
            setPreviewUrl('')
            return
        }

        const allowedTypes = [
            'image/jpeg',
            'image/png'
        ]

        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a JPG, JPEG or PNG image.')
            event.target.value = ''
            setSelectedFile(null)
            setPreviewUrl('')
            return
        }

        setError('')
        setSelectedFile(file)

        const reader = new FileReader()

        reader.onload = (e) => {
            setPreviewUrl(e.target.result)
        }

        reader.readAsDataURL(file)
    }

    // UPLOAD SPARE IMAGE
    const handleUpload = async () => {
        if (!spareCode.trim()) {
            setError('Please enter spare code!!')
            return
        }

        if (!selectedFile) {
            setError('Please upload spare image!!')
            return
        }

        setError('')

        // BACKEND API PENDING:
        // Upload image using spareCode as filename.
        // Backend should replace an existing image.

        setError(
            'Spare image upload API is pending from backend.'
        )
    }

    return (
        <DashboardLayout title="Spares Image Add / Edit">

            <div className="spare-image-page">

                {/* SUCCESS MESSAGE */}
                {showSuccess && (
                    <div className="spare-image-success">
                        SPARE IMAGE UPLOADED SUCCESSFULLY!!
                    </div>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="spare-image-alert">
                        {error}
                    </div>
                )}

                {/* SEARCH AND ADD */}
                <div className="spare-image-search-box">

                    <div className="spare-image-search-field">

                        <input
                            type="text"
                            placeholder="Enter Spare Code to search ..."
                            value={searchCode}
                            onChange={(e) =>
                                setSearchCode(e.target.value)
                            }
                            autoComplete="off"
                        />

                        <button
                            type="button"
                            className="btn-search spare-image-search-button"
                            onClick={handleSearch}
                            disabled={isSearching}
                            title="Search"
                        >
                            <span className="fa fa-search" />
                        </button>

                    </div>

                    <button
                        type="button"
                        className="btn-search spare-image-add-button"
                        onClick={handleAddImage}
                    >
                        ADD SPARE IMAGE
                    </button>

                </div>

                {/* UPLOAD SECTION */}
                {showUploadSection && (
                    <div className="spare-image-upload-section">

                        <div className="spare-image-upload-grid">

                            {/* SPARE CODE */}
                            <div className="spare-image-field spare-image-code-field">
                                <label>SPARE CODE :</label>

                                <input
                                    type="text"
                                    placeholder="Enter Spare Code..."
                                    value={spareCode}
                                    onChange={(e) =>
                                        setSpareCode(e.target.value)
                                    }
                                    autoComplete="off"
                                />
                            </div>

                            {/* FILE UPLOAD */}
                            <div className="spare-image-field spare-image-file-field">
                                <label>SPARE IMAGE UPLOAD :</label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* UPLOAD BUTTON */}
                            <div className="spare-image-upload-button-wrapper">
                                <button
                                    type="button"
                                    className="spare-image-upload-button"
                                    onClick={handleUpload}
                                >
                                    UPLOAD
                                </button>
                            </div>

                        </div>

                        {/* IMAGE PREVIEW */}
                        {previewUrl && (
                            <div className="spare-image-preview">

                                <label>UPLOADED IMAGE</label>

                                <img
                                    src={previewUrl}
                                    alt="Spare preview"
                                />

                            </div>
                        )}

                    </div>
                )}

            </div>

        </DashboardLayout>
    )
}

export default SpareImageEntry
