import React, { useState } from 'react';
import { FaFileExcel, FaUpload, FaTimes } from 'react-icons/fa';
import './StudentGradesExcell.css';

const StudentGradesExcell = ({ isOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [previewData, setPreviewData] = useState(null);

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            previewExcel(selectedFile);
        }
    };

    // Preview Excel file
    const previewExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // This is just a simple preview - in a real app, you'd use a library like xlsx
                // to properly parse the Excel file
                setPreviewData({
                    name: file.name,
                    size: (file.size / 1024).toFixed(2) + ' KB',
                    type: file.type
                });
            } catch (error) {
                console.error('Error previewing file:', error);
                setPreviewData(null);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        setUploading(true);
        setUploadStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5001/api/studentCPI/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setUploadStatus({
                    success: true,
                    message: `Upload successful: ${result.results.success} records processed, ${result.results.failed} failed`,
                    details: result.results
                });
            } else {
                setUploadStatus({
                    success: false,
                    message: result.message || 'Upload failed',
                    details: result.errors || []
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus({
                success: false,
                message: 'Error uploading file: ' + error.message,
                details: []
            });
        } finally {
            setUploading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFile(null);
        setPreviewData(null);
        setUploadStatus(null);
    };

    if (!isOpen) return null;

    return (
        <div className="student-grades-modal-overlay">
            <div className="student-grades-modal">
                <div className="student-grades-modal-header">
                    <h2>Upload Student CPI/SPI Data</h2>
                    <button className="close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="student-grades-modal-content">
                    <div className="upload-instructions">
                        <h3>Instructions</h3>
                        <p>Please upload an Excel file with the following columns:</p>
                        <ul>
                            <li>BatchId - The batch name (must match existing batch)</li>
                            <li>SemesterId - The semester number</li>
                            <li>EnrollmentNumber - Student's enrollment number</li>
                            <li>CPI - Cumulative Performance Index (0-10)</li>
                            <li>SPI - Semester Performance Index (0-10)</li>
                            <li>Rank - Student's rank in the semester</li>
                        </ul>
                    </div>

                    <div className="file-upload-container">
                        <div className="file-upload-area">
                            <FaFileExcel className="excel-icon" />
                            <h3>Upload Excel File</h3>
                            <p>Drag and drop or click to browse</p>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                        </div>

                        {previewData && (
                            <div className="file-preview">
                                <h3>Selected File</h3>
                                <p><strong>Name:</strong> {previewData.name}</p>
                                <p><strong>Size:</strong> {previewData.size}</p>
                                <p><strong>Type:</strong> {previewData.type}</p>
                                <div className="preview-actions">
                                    <button
                                        className="upload-button"
                                        onClick={handleUpload}
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload File'}
                                        <FaUpload className="upload-icon" />
                                    </button>
                                    <button
                                        className="reset-button"
                                        onClick={resetForm}
                                        disabled={uploading}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {uploadStatus && (
                        <div className={`upload-status ${uploadStatus.success ? 'success' : 'error'}`}>
                            <h3>{uploadStatus.success ? 'Upload Successful' : 'Upload Failed'}</h3>
                            <p>{uploadStatus.message}</p>

                            {uploadStatus.details.errors && uploadStatus.details.errors.length > 0 && (
                                <div className="error-details">
                                    <h4>Error Details:</h4>
                                    <ul>
                                        {uploadStatus.details.errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="student-grades-modal-footer">
                    <button className="cancel-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentGradesExcell;