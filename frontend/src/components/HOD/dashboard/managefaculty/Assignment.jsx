import React, { useState, useEffect } from "react";

const FacultyAssignment = ({ selectedFaculty }) => {
    const [assignment, setAssignment] = useState({
        batch: "",
        semester: "",
        subject: "",
        faculty: selectedFaculty?.id || "",
    });

    const [batches, setBatches] = useState([]);
    const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const subjects = ["Data Structures", "Digital Electronics", "Computer Networks", "Database Management"];

    // Fetch batches from backend using Fetch API
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/getAllBatches"); // Adjust URL if needed
                if (!response.ok) throw new Error("Failed to fetch batches");
                const data = await response.json();
                setBatches(data);
            } catch (error) {
                console.error("Error fetching batches:", error);
            }
        };

        fetchBatches();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Assignment Data:", assignment);
        // Handle assignment submission
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAssignment((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="faculty-assignment-container">
            <form onSubmit={handleSubmit} className="assignment-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Select Batch</label>
                        <select name="batch" value={assignment.batch} onChange={handleChange} required>
                            <option value="">Select Batch</option>
                            {batches.map((batch) => (
                                <option key={batch._id} value={batch.batchName}>{batch.batchName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Semester</label>
                        <select name="semester" value={assignment.semester} onChange={handleChange} required>
                            <option value="">Select Semester</option>
                            {semesters.map((sem) => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Subject</label>
                        <select name="subject" value={assignment.subject} onChange={handleChange} required>
                            <option value="">Select Subject</option>
                            {subjects.map((subject) => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Faculty Member</label>
                        <input
                            type="text"
                            value={selectedFaculty ? selectedFaculty.name : "Please select a faculty member"}
                            readOnly
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn">Assign Faculty</button>
                </div>
            </form>
        </div>
    );
};

export default FacultyAssignment;
