import React, { useState, useEffect } from "react";

const FacultyAssignment = ({ selectedFaculty }) => {
    const [assignment, setAssignment] = useState({
        batch: "",
        semester: "",
        subject: "",
        faculty: selectedFaculty?.id || "",
    });

    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [faculties, setFaculties] = useState([]);

    const subjects = ["Data Structures", "Digital Electronics", "Computer Networks", "Database Management"];

    // Fetch all batches from backend
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

    // Fetch faculty members from backend
    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/users/getAllUsers");
                if (!response.ok) throw new Error("Failed to fetch faculty members");
                const data = await response.json();

                // Filter only users with role "Faculty"
                const facultyList = data.filter(user => user.role === "Faculty");
                setFaculties(facultyList);
            } catch (error) {
                console.error("Error fetching faculty members:", error);
            }
        };

        fetchFaculties();
    }, []);

    // Fetch semesters when batch is selected
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                if (!assignment.batch) {
                    setSemesters([]); // Reset semesters when no batch is selected
                    return;
                }

                const response = await fetch(`http://localhost:5001/api/users/getSemestersByBatch/${assignment.batch}`);
                if (!response.ok) throw new Error("Failed to fetch semesters");
                const data = await response.json();
                setSemesters(data);
            } catch (error) {
                console.error("Error fetching semesters:", error);
            }
        };

        fetchSemesters();
    }, [assignment.batch]); // Runs every time batch changes

    const handleChange = (e) => {
        const { name, value } = e.target;

        setAssignment((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "batch" ? { semester: "" } : {}), // Reset semester when batch changes
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Assignment Data:", assignment);
        // Submit assignment data to the backend here
    };

    return (
        <div className="faculty-assignment-container">
            <form onSubmit={handleSubmit} className="assignment-form">
                <div className="form-grid">

                    <div className="form-group">
                        <label>Select Batch</label>
                        <select name="batch" value={assignment.batch} onChange={handleChange} required>
                            <option value="">Select Batch</option>
                            {batches.map((batch, index) => (
                                <option key={batch._id || index} value={batch.batchName}>{batch.batchName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Semester</label>
                        <select name="semester" value={assignment.semester} onChange={handleChange} required>
                            <option value="">Select Semester</option>
                            {semesters.map((sem, index) => (
                                <option key={sem._id || index} value={sem.semesterNumber}>Semester {sem.semesterNumber}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Subject</label>
                        <select name="subject" value={assignment.subject} onChange={handleChange} required>
                            <option value="">Select Subject</option>
                            {subjects.map((subject, index) => (
                                <option key={subject + index} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Faculty</label>
                        <select name="faculty" value={assignment.faculty} onChange={handleChange} required>
                            <option value="">Select Faculty</option>
                            {faculties.map((faculty, index) => (
                                <option key={faculty._id || index} value={faculty._id}>{faculty.name}</option>
                            ))}
                        </select>
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
