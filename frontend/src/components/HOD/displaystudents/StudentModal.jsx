import React, { useState, useEffect } from 'react';
import './StudentModal.css';

const StudentModal = ({ isOpen, onClose, onSuccess }) => {
    const [studentData, setStudentData] = useState({
        name: '',
        email: '',
        enrollment: '',
        batchID: '', // Ensure this stores batch _id
    });

    const [file, setFile] = useState(null);
    const [batches, setBatches] = useState([]);

    // Fetch all batches on component mount
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/users/getAllBatches");
                if (!response.ok) throw new Error("Failed to fetch batches");
                const data = await response.json();
                console.log("Fetched Batches:", data); // Debugging
                setBatches(data);
            } catch (error) {
                console.error("Error fetching batches:", error);
            }
        };

        fetchBatches();
    }, []);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Updated ${name}:`, value); // Debugging
        setStudentData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle file input change
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', studentData.name);
        formData.append('email', studentData.email);
        formData.append('enrollmentNumber', studentData.enrollment);
        formData.append('batchID', studentData.batchID);

        if (file) {
            formData.append('file', file);
        }

        try {
            const response = await fetch('http://localhost:5001/api/students/createStudent', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Student added:', data);
                onSuccess();
                onClose();
            } else {
                alert(data.error);
            }
        } catch (error) {
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

                    <select name="batchID" className="batch-dropdown" value={studentData.batchID} onChange={handleChange} required>
                        <option value="">Select Batch</option>
                        {batches.map((batch) => (
                            <option key={batch.batchName} value={batch.batchName}>
                                {batch.batchName}
                            </option>
                        ))}
                    </select>



                    <input type="file" onChange={handleFileChange} />

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
