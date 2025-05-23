import React, { useState } from 'react';
import { FaFileExcel, FaUpload, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './GradesUploadModal.css';

const GradesUploadModal = ({ isOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ success: false, message: '' });
    const [previewData, setPreviewData] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setUploadStatus({ success: false, message: '' });
            
            // Read the Excel file for preview
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = evt.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    // Validate the data structure
                    const isValid = validateExcelData(jsonData);
                    if (isValid) {
                        setPreviewData(jsonData.slice(0, 5)); // Show first 5 rows for preview
                        setShowPreview(true);
                    } else {
                        setUploadStatus({
                            success: false,
                            message: 'Invalid Excel format. Please ensure your file has EnrollmentNumber, SubjectCode, and Grade columns.'
                        });
                        setFile(null);
                        setFileName('');
                    }
                } catch (error) {
                    console.error('Error reading Excel file:', error);
                    setUploadStatus({
                        success: false,
                        message: 'Error reading Excel file. Please check the file format.'
                    });
                    setFile(null);
                    setFileName('');
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const validateExcelData = (data) => {
        if (!data || data.length === 0) return false;
        
        // Check if the first row has the required columns
        const firstRow = data[0];
        return firstRow.hasOwnProperty('EnrollmentNumber') && 
               firstRow.hasOwnProperty('SubjectCode') && 
               firstRow.hasOwnProperty('Grade');
    };

    const handleUpload = async () => {
        if (!file) return;
        
        setUploading(true);
        setUploadStatus({ success: false, message: '' });
        
        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const data = evt.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    // Send the parsed data to the server
                    const response = await axios.post('http://localhost:5001/api/grades/upload', {
                        gradesData: jsonData
                    });
                    
                    setUploadStatus({
                        success: true,
                        message: `Successfully processed ${response.data.processed} grade entries. ${response.data.errors || 0} errors.`
                    });
                } catch (error) {
                    console.error('Error processing Excel data:', error);
                    setUploadStatus({
                        success: false,
                        message: error.response?.data?.message || 'Error processing Excel data. Please try again.'
                    });
                } finally {
                    setUploading(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus({
                success: false,
                message: 'Error uploading file. Please try again.'
            });
            setUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            setFile(droppedFile);
            setFileName(droppedFile.name);
            
            // Read the Excel file for preview
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = evt.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    // Validate the data structure
                    const isValid = validateExcelData(jsonData);
                    if (isValid) {
                        setPreviewData(jsonData.slice(0, 5)); // Show first 5 rows for preview
                        setShowPreview(true);
                    } else {
                        setUploadStatus({
                            success: false,
                            message: 'Invalid Excel format. Please ensure your file has EnrollmentNumber, SubjectCode, and Grade columns.'
                        });
                        setFile(null);
                        setFileName('');
                    }
                } catch (error) {
                    console.error('Error reading Excel file:', error);
                    setUploadStatus({
                        success: false,
                        message: 'Error reading Excel file. Please check the file format.'
                    });
                    setFile(null);
                    setFileName('');
                }
            };
            reader.readAsArrayBuffer(droppedFile);
        } else {
            setUploadStatus({
                success: false,
                message: 'Please upload an Excel (.xlsx) file.'
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="grades-upload-modal">
                <div className="modal-header">
                    <h2><FaFileExcel /> Upload Grades</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="modal-content">
                    <div className="upload-instructions-grade-upload">
                        <p>Upload an Excel file with the following columns:</p>
                        <ul>
                            <li><strong>EnrollmentNumber</strong> - Student enrollment number</li>
                            <li><strong>SubjectCode</strong> - Subject code</li>
                            <li><strong>Grade</strong> - Student's grade</li>
                        </ul>
                    </div>
                    
                    <div 
                        className="file-drop-area-grade-upload"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div className="file-icon">
                            <FaFileExcel />
                        </div>
                        <p>Drag & Drop your Excel file here</p>
                        <p className="or-text">OR</p>
                        <label className="file-select-btn">
                            Browse Files
                            <input 
                                type="file" 
                                accept=".xlsx" 
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {fileName && <p className="selected-file">Selected: {fileName}</p>}
                    </div>
                    
                    {showPreview && previewData.length > 0 && (
                        <div className="preview-section">
                            <h3>Preview (First 5 rows)</h3>
                            <div className="preview-table-container">
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            <th>Enrollment Number</th>
                                            <th>Subject Code</th>
                                            <th>Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.EnrollmentNumber}</td>
                                                <td>{row.SubjectCode}</td>
                                                <td>{row.Grade}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                    {uploadStatus.message && (
                        <div className={`upload-status ${uploadStatus.success ? 'success' : 'error'}`}>
                            {uploadStatus.message}
                        </div>
                    )}
                </div>
                
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button 
                        className="upload-btn" 
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload Grades'}
                        {!uploading && <FaUpload />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GradesUploadModal;
