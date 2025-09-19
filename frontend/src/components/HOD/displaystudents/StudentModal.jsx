import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './StudentModal.css';

const StudentModal = ({ isOpen, onClose, onSuccess = () => { } }) => {
    const [studentData, setStudentData] = useState({
        name: '',
        email: '',
        enrollment: '',
        batchID: '',
        currentSemester: '',
    });
    const [batches, setBatches] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isManualEntry, setIsManualEntry] = useState(true);
    const [parsedData, setParsedData] = useState([]);
    const [resultOpen, setResultOpen] = useState(false);
    const [uploadResult, setUploadResult] = useState({ successCount: 0, failedCount: 0, failed: [] });

    useEffect(() => {
        if (isOpen) {
            const fetchBatches = async () => {
                try {
                    const response = await fetch("http://localhost:5001/api/batches/getAllBatches");
                    if (!response.ok) throw new Error("Failed to fetch batches");
                    const data = await response.json();

                    if (!Array.isArray(data)) {
                        console.error("Expected array of batches, got:", typeof data);
                        return;
                    }

                    setBatches(data.map(batch => ({
                        id: batch.id,
                        batchName: batch.batchName,
                        batchStart: batch.batchStart,
                        batchEnd: batch.batchEnd
                    })));
                } catch (error) {
                    console.error("Error fetching batches:", error);
                }
            };

            fetchBatches();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudentData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);

        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = (event) => {
            const binaryString = event.target.result;
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            setParsedData(data);
        };
        reader.onerror = (error) => console.error("Error reading file:", error);
    };

    const uploadAllStudents = async () => {
        if (parsedData.length === 0) {
            alert("No data to upload. Please select a valid file.");
            return;
        }

        // Validate required headers and build payload using desired column names
        const REQUIRED_HEADERS = ['Enrollment Number', 'Name', 'Email', 'Batch Name', 'Semester'];
        const firstRow = parsedData[0] || {};
        const presentHeaders = Object.keys(firstRow);
        const missing = REQUIRED_HEADERS.filter(h => !presentHeaders.includes(h));
        if (missing.length) {
            alert(`Invalid file format. Missing columns: ${missing.join(', ')}\nExpected columns (in order): ${REQUIRED_HEADERS.join(' | ')}`);
            return;
        }

        const studentsPayload = [];
        for (const row of parsedData) {
            const enrollment = row['Enrollment Number']?.toString().trim();
            const name = row['Name']?.toString().trim();
            const email = row['Email']?.toString().trim();
            const batchID = row['Batch Name']?.toString().trim();
            const currentSemester = parseInt(row['Semester']);

            if (!enrollment || !name || !email || !batchID || isNaN(currentSemester)) {
                console.warn('Skipping invalid row:', row);
                continue;
            }

            studentsPayload.push({ enrollment, name, email, batchID, currentSemester });
        }

        if (studentsPayload.length === 0) {
            alert('No valid rows found to upload. Please check your file content.');
            return;
        }

        try {
            const resp = await fetch('http://localhost:5001/api/students/bulkUpload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: studentsPayload })
            });
            const data = await resp.json();
            if (!resp.ok) {
                console.error('Bulk upload failed:', data);
                setUploadResult({
                    successCount: 0,
                    failedCount: data.failed?.length || studentsPayload.length,
                    failed: data.failed || [{ enrollment: '-', reason: data.error || data.message || 'Bulk upload failed' }]
                });
                setResultOpen(true);
                return;
            }
            // Show summary in result modal
            setUploadResult({
                successCount: data.successCount ?? studentsPayload.length,
                failedCount: data.failedCount ?? 0,
                failed: Array.isArray(data.failed) ? data.failed : []
            });
            setResultOpen(true);
        } catch (e) {
            console.error('Bulk upload error:', e);
            setUploadResult({
                successCount: 0,
                failedCount: studentsPayload.length,
                failed: [{ enrollment: '-', reason: 'Network/server error during upload' }]
            });
            setResultOpen(true);
        }

        setSelectedFile(null);
        setParsedData([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedBatch = batches.find(b => b.id === parseInt(studentData.batchID));
        if (!selectedBatch) {
            alert('Please select a valid batch');
            return;
        }

        // Validate current semester is a number
        const currentSem = parseInt(studentData.currentSemester);
        if (isNaN(currentSem) || currentSem < 1 || currentSem > 8) {
            alert('Please enter a valid semester number (1-8)');
            return;
        }

        try {
            console.log('Submitting student data:', {
                name: studentData.name,
                email: studentData.email,
                enrollment: studentData.enrollment,
                batchID: selectedBatch.batchName,
                currentSemester: currentSem
            });

            const response = await fetch('http://localhost:5001/api/students/createStudent', {
                method: 'POST',
                body: JSON.stringify({
                    name: studentData.name,
                    email: studentData.email,
                    enrollment: studentData.enrollment,
                    batchID: selectedBatch.batchName,
                    currentSemester: currentSem
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                console.error('Error response:', data);
                alert(data.error || data.message || 'Failed to add student');
            }
        } catch (error) {
            console.error('Failed to add student:', error);
            alert('Failed to add student. Try again.');
        }
    };

    const clearManualEntryFields = () => {
        setStudentData({ name: '', email: '', enrollment: '', batchID: '', currentSemester: '' });
    };

    const clearFileUpload = () => {
        setSelectedFile(null);
        setParsedData([]);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content-add-student-model">
                <h2>Add Student</h2>
                <div className="toggle-buttons">
                    <button style={{ marginRight: '5px' }} onClick={() => setIsManualEntry(true)}>Manual Entry</button>
                    <button onClick={() => setIsManualEntry(false)}>File Upload</button>
                </div>

                {isManualEntry ? (
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="name" placeholder="Student Name" value={studentData.name} onChange={handleChange} required />
                        <input type="email" name="email" placeholder="Student Email" value={studentData.email} onChange={handleChange} required />
                        <input type="number" name="enrollment" placeholder="Enrollment Number" value={studentData.enrollment} onChange={handleChange} required />
                        <select name="batchID" className="batch-dropdown" value={studentData.batchID || ""} onChange={handleChange} required>
                            <option value="">Select Batch</option>
                            {batches.map((batch) => (
                                <option key={batch.id} value={batch.id}>{batch.batchName}</option>
                            ))}
                        </select>
                        <input type="number" name="currentSemester" placeholder="Current Semester" value={studentData.currentSemester} onChange={handleChange} required min="1" max="8" />
                        <button type="button" onClick={clearManualEntryFields}>Clear Fields</button>
                        <div className="actions-add-student-model">
                            <button type="button" onClick={onClose}>Cancel</button>
                            <button type="submit">Add Student</button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Accepted file format:</strong> Excel (.xlsx, .xls)
                            <br />
                            <strong>Example :</strong>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: '1px solid #ddd', padding: '6px' }}>Enrollment Number</th>
                                        <th style={{ border: '1px solid #ddd', padding: '6px' }}>Name</th>
                                        <th style={{ border: '1px solid #ddd', padding: '6px' }}>Email</th>
                                        <th style={{ border: '1px solid #ddd', padding: '6px' }}>Batch Name</th>
                                        <th style={{ border: '1px solid #ddd', padding: '6px' }}>Semester</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>92200133001</td>
                                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>Ritesh sanchala</td>
                                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>ritesh@ggmail.com</td>
                                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>Gegree 22-26</td>
                                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>3</td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>92200133002</td>
                                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>Harsh Doshi</td>
                                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>harsh@gmail.com</td>
                                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>Degree 22-26</td>
                                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>3</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>

                        <input type="file" accept=".xls,.xlsx" onChange={handleFile} />
                        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
                        <div className='file-upload-add-student'>
                            <button type="button" onClick={onClose}>Cancel</button>
                            <button type="button" style={{ backgroundColor: '#007bff', marginLeft: '5px' }} onClick={uploadAllStudents}>Add Students</button>
                        </div>
                    </div>
                )}
            </div>
            {resultOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-add-student-model">
                        <h3>Bulk Upload Summary</h3>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Successful entries:</strong> {uploadResult.successCount}
                            <br />
                            <strong>Failed entries:</strong> {uploadResult.failedCount}
                        </div>
                        {uploadResult.failedCount > 0 && (
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Enrollment</th>
                                            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {uploadResult.failed.map((f, idx) => (
                                            <tr key={idx}>
                                                <td style={{ border: '1px solid #ddd', padding: '6px' }}>{f.enrollment || '-'}</td>
                                                <td style={{ border: '1px solid #ddd', padding: '6px' }}>{f.reason || 'Failed'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className='file-upload-add-student' style={{ marginTop: '12px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setResultOpen(false);
                                    // Refresh parent list upon close
                                    onSuccess();
                                    onClose();
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentModal;