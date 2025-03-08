

import React, { useState, useEffect } from 'react';
import './StudentModal.css';

const StudentModal = ({ isOpen, onClose }) => {
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentEnrollment, setStudentEnrollment] = useState('');
    const [studentBatchID, setStudentBatchID] = useState('');
    const [file, setFile] = useState(null);
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/users/getAllBatches");
                if (!response.ok) throw new Error("Failed to fetch batches");
                const data = await response.json();
                setBatches(data);
            } catch (error) {
                console.error("Error fetching batches:", error);
            }
        };

        fetchBatches();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Student Name:', studentName);
        console.log('Student Email:', studentEmail);
        console.log('Student Enrollment number:', studentEnrollment);
        console.log('Student Batch ID:', studentBatchID);
        console.log('File:', file);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add Student</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
                    <input type="email" placeholder="Student Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required />
                    <input type="number" placeholder="Enrollment Number" value={studentEnrollment} onChange={(e) => setStudentEnrollment(e.target.value)} required />

                    {/* Batch ID Dropdown */}
                    <select
                        className="batch-dropdown"
                        value={studentBatchID}
                        onChange={(e) => setStudentBatchID(e.target.value)}
                        required
                    >
                        <option value="">Select Batch</option>
                        {batches.map((batch, index) => (
                            <option key={batch._id || index} value={batch.batchName}>
                                {batch.batchName}
                            </option>
                        ))}
                    </select>

                    <input type="file" onChange={handleFileChange} />
                    <div className="actions-add-student-model">
                        <button type="button" onClick={onClose}>Close</button>
                        <button type="submit">Add Student</button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentModal;
