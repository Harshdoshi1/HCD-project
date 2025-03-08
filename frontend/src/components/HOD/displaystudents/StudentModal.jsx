import React, { useState, useEffect } from 'react';
import './StudentModal.css';

const StudentModal = ({ isOpen, onClose, onSuccess = () => { } }) => {
    const [studentData, setStudentData] = useState({
        name: '',
        email: '',
        enrollment: '',
        batchID: '', // Should store batch _id, not batchName
    });

    const [batches, setBatches] = useState([]);

    // Fetch batches only when the modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchBatches = async () => {
                try {
                    const response = await fetch("http://localhost:5001/api/users/getAllBatches");
                    if (!response.ok) throw new Error("Failed to fetch batches");
                    const data = await response.json();
                    console.log("Fetched Batches:", data);

                    if (!Array.isArray(data)) {
                        console.error("Expected array of batches, got:", typeof data);
                        return;
                    }

                    // Map the batches to a consistent format
                    const formattedBatches = data.map(batch => ({
                        id: batch.id,
                        batchName: batch.batchName,
                        batchStart: batch.batchStart,
                        batchEnd: batch.batchEnd
                    }));

                    console.log("Formatted batches:", formattedBatches);
                    setBatches(formattedBatches);
                } catch (error) {
                    console.error("Error fetching batches:", error);
                }
            };

            fetchBatches();
        }
    }, [isOpen]);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Updated ${name}:`, value);
        setStudentData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Current batches:", batches);
        console.log("Submitting Student Data:", studentData);

        // Find the selected batch using id
        const selectedBatch = batches.find(b => b.id === parseInt(studentData.batchID));
        console.log("Selected Batch:", selectedBatch);

        if (!selectedBatch) {
            console.error("No batch found with ID:", studentData.batchID);
            alert('Please select a valid batch');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/students/createStudent', {
                method: 'POST',
                body: JSON.stringify({
                    name: studentData.name,
                    email: studentData.email,
                    enrollment: studentData.enrollment,
                    batchID: selectedBatch.batchName // Send batchName since backend expects it
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log("Server Response:", data);

            if (response.ok) {
                console.log('Student added successfully:', data);

                if (typeof onSuccess === "function") {
                    onSuccess();
                } else {
                    console.error("onSuccess is not a function:", onSuccess);
                }

                onClose();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Failed to add student:', error);
            alert('Failed to add student. Try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add Student</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Student Name"
                        value={studentData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Student Email"
                        value={studentData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="number"
                        name="enrollment"
                        placeholder="Enrollment Number"
                        value={studentData.enrollment}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="batchID"
                        className="batch-dropdown"
                        value={studentData.batchID || ""}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Batch</option>
                        {batches.map((batch) => (
                            <option key={batch.id} value={batch.id}>
                                {batch.batchName}
                            </option>
                        ))}
                    </select>

                    <div className="actions-add-student-model">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Add Student</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentModal;
