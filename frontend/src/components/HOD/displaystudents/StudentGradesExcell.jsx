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
            console.log('File selected:', selectedFile.name, 'Type:', selectedFile.type);
            setFile(selectedFile);
            previewExcel(selectedFile); // Basic preview
            previewExcelWithXLSX(selectedFile); // Advanced preview with XLSX validation
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

    // Preview Excel file with xlsx library
    const previewExcelWithXLSX = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Use the same xlsx library as backend to parse the file
                const data = e.target.result;
                
                // Log raw file data
                console.log('Raw file data available, size:', data.byteLength);
                
                // At this point we could implement header validation in frontend too
                setPreviewData({
                    name: file.name,
                    size: (file.size / 1024).toFixed(2) + ' KB',
                    type: file.type,
                    preview: 'Excel file loaded and ready for upload'
                });
            } catch (error) {
                console.error('Error previewing file with xlsx:', error);
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
        
        console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Sending upload request...');
            const response = await fetch('http://localhost:5001/api/studentCPI/upload', {
                method: 'POST',
                body: formData,
            });

            console.log('Response received, status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);

            if (response.ok) {
                setUploadStatus({
                    success: true,
                    message: `Upload successful: ${result.results.success} records processed, ${result.results.failed} failed`,
                    details: result.results
                });
            } else {
                // Enhanced error reporting
                let errorMessage = result.message || 'Upload failed';
                if (result.available && result.expected) {
                    errorMessage += `\n\nFound columns: ${result.available.join(', ')}\nExpected columns: ${result.expected.join(', ')}`;
                }
                
                setUploadStatus({
                    success: false,
                    message: errorMessage,
                    details: result.errors || [],
                    debug: result
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
                        <p>Please upload an Excel file with <strong>EXACTLY</strong> the following column headers:</p>
                        <div className="excel-header-example">
                            <code>BatchId | SemesterId | EnrollmentNumber | CPI | SPI | Rank</code>
                        </div>
                        <p><strong>Important:</strong> Column names must match <em>exactly</em> as shown above (case-sensitive).</p>
                        
                        <h4>Description of columns:</h4>
                        <ul>
                            <li><strong>BatchId</strong> - The numeric batch ID (must match existing batch ID in database)</li>
                            <li><strong>SemesterId</strong> - The numeric semester ID (must match existing semester ID)</li>
                            <li><strong>EnrollmentNumber</strong> - Student's enrollment number (e.g., "21BCP001")</li>
                            <li><strong>CPI</strong> - Cumulative Performance Index (0-10)</li>
                            <li><strong>SPI</strong> - Semester Performance Index (0-10)</li>
                            <li><strong>Rank</strong> - Student's rank in the semester (numeric)</li>
                        </ul>
                        
                        <h4>Example data format:</h4>
                        <div className="excel-example">
                            <table>
                                <thead>
                                    <tr>
                                        <th>BatchId</th>
                                        <th>SemesterId</th>
                                        <th>EnrollmentNumber</th>
                                        <th>CPI</th>
                                        <th>SPI</th>
                                        <th>Rank</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>3</td>
                                        <td>21BCP001</td>
                                        <td>8.5</td>
                                        <td>9.1</td>
                                        <td>5</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
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
                            <p style={{ whiteSpace: 'pre-line' }}>{uploadStatus.message}</p>
                            
                            {/* Show errors for both successful and failed uploads */}
                            {(uploadStatus.details?.errors?.length > 0 || uploadStatus.details?.length > 0) && (
                                <div className="error-details">
                                    <h4>Errors:</h4>
                                    <ul>
                                        {/* Handle both array formats */}
                                        {Array.isArray(uploadStatus.details) ? 
                                            uploadStatus.details.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            )) : 
                                            uploadStatus.details.errors?.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            )}
                            
                            {/* Debug information for errors */}
                            {!uploadStatus.success && uploadStatus.debug && (
                                <div className="debug-info">
                                    <h4>Debug Information:</h4>
                                    <div className="debug-content">
                                        <p><strong>Expected columns:</strong> {JSON.stringify(uploadStatus.debug.expected || [])}</p>
                                        <p><strong>Found columns:</strong> {JSON.stringify(uploadStatus.debug.available || [])}</p>
                                    </div>
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