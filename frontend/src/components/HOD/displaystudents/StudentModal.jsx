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
            const data = XLSX.utils.sheet_to_json(sheet);
            setParsedData(data);
        };
        reader.onerror = (error) => console.error("Error reading file:", error);
    };

    const uploadAllStudents = async () => {
        if (parsedData.length === 0) {
            alert("No data to upload. Please select a valid file.");
            return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const row of parsedData) {
            try {
                // Log the data being sent for debugging
                console.log('Uploading student data:', {
                    name: row.NAME,
                    email: row.EMAIL,
                    enrollment: row.ROLLNO,
                    batchID: row.BATCH,
                    currentSemester: row.CURRENTSEM
                });

                // Validate current semester is a number
                const currentSem = parseInt(row.CURRENTSEM);
                if (isNaN(currentSem)) {
                    console.error('Invalid current semester value:', row.CURRENTSEM);
                    errorCount++;
                    continue;
                }

                const response = await fetch('http://localhost:5001/api/students/createStudent', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: row.NAME,
                        email: row.EMAIL,
                        enrollment: row.ROLLNO,
                        batchID: row.BATCH,
                        currentSemester: currentSem
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('Failed to upload row:', data);
                    errorCount++;
                } else {
                    successCount++;
                }
            } catch (error) {
                console.error('Error uploading student:', error);
                errorCount++;
            }
        }

        // Provide detailed feedback
        if (errorCount > 0) {
            alert(`Upload completed with issues:\n${successCount} students added successfully\n${errorCount} students failed to upload\n\nCheck console for details.`);
        } else {
            alert(`All ${successCount} students uploaded successfully!`);
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
            <div className="modal-content">
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
                    <div >
                        <input type="file" accept=".xls,.xlsx" onChange={handleFile} />
                        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
                        <div className='file-upload-add-student'>
                            <button type="button" onClick={onClose}>Cancel</button>
                            <button type="button" style={{ backgroundColor: '#007bff', marginLeft: '5px' }} onClick={uploadAllStudents}>Add Students</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentModal;