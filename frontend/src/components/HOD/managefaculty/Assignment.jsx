import React, { useState, useEffect } from "react";
import Select from "react-select";
import './AssignFaculty.css';

const FacultyAssignment = ({ selectedFaculty }) => {
    const [assignment, setAssignment] = useState({
        batch: null,
        semester: null,
        subject: null,
        faculty: selectedFaculty ? { value: selectedFaculty.id, label: selectedFaculty.name } : null,
    });

    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                console.log('Fetching batches...');
                const response = await fetch("http://localhost:5001/api/batches/getAllBatches");
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch batches");
                }
                const data = await response.json();
                console.log('Received batch data:', data);
                
                if (!Array.isArray(data)) {
                    console.error('Expected array of batches but got:', typeof data);
                    throw new Error('Invalid data format received from server');
                }

                const mappedBatches = data
                    .filter(batch => batch && (batch.name || batch.batchName)) // Filter out invalid entries
                    .map(batch => ({
                        value: batch.name || batch.batchName,
                        label: batch.name || batch.batchName
                    }));

                console.log('Mapped batches:', mappedBatches);
                setBatches(mappedBatches);
            } catch (error) {
                console.error("Error fetching batches:", error);
            }
        };
        fetchBatches();
    }, []);

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/users/getAllUsers");
                if (!response.ok) throw new Error("Failed to fetch faculty members");
                const data = await response.json();
                console.log("Fetched Users:", data);

                // Remove role-based filtering
                setFaculties(data.map(user => ({ value: user.id, label: user.name })));
            } catch (error) {
                console.error("Error fetching faculty members:", error);
            }
        };
        fetchFaculties();
    }, []);


    useEffect(() => {
        const fetchSemesters = async () => {
            // Clear semesters if no batch is selected
            if (!assignment.batch || !assignment.batch.value) {
                setSemesters([]);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5001/api/semesters/getSemestersByBatch/${encodeURIComponent(assignment.batch.value)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch semesters");
                }
                const data = await response.json();
                setSemesters(data.map(sem => ({
                    value: sem.semester_number,
                    label: `Semester ${sem.semester_number}`
                })));
            } catch (error) {
                console.error("Error fetching semesters:", error);
                setSemesters([]);
            }
        };
        fetchSemesters();
    }, [assignment.batch]);

    useEffect(() => {
        if (!assignment.batch || !assignment.semester) return;
        const fetchSubjects = async () => {
            try {
                if (!assignment.batch?.value || !assignment.semester?.value) {
                    console.log('Batch or semester not selected');
                    setSubjects([]);
                    return;
                }

                console.log('Fetching subjects with:', {
                    batch: assignment.batch.value,
                    semester: assignment.semester.value
                });

                const response = await fetch(
                    `http://localhost:5001/api/subjects/getSubjectsByBatchAndSemesterWithDetails/${encodeURIComponent(assignment.batch.value)}/${assignment.semester.value}`
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('No subjects found for this batch and semester');
                        setSubjects([]);
                        return;
                    }
                    throw new Error(`Failed to fetch subjects: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Subject API Response:', data);

                // Map subjects with their details
                const mappedSubjects = data.subjects.map(subject => ({
                    value: subject.subject_name,
                    label: subject.sub_code ?
                        `${subject.subject_name} (${subject.sub_code})` :
                        subject.subject_name
                }));

                console.log('Mapped subjects:', mappedSubjects);
                setSubjects(mappedSubjects);
            } catch (error) {
                console.error("Error fetching subjects:", error);
                setSubjects([]);
                // Show error to user
                alert(`Failed to fetch subjects: ${error.message}`);
            }
        };
        fetchSubjects();
    }, [assignment.batch, assignment.semester]);

    const handleChange = (selectedOption, { name }) => {
        setAssignment(prev => ({
            ...prev,
            [name]: selectedOption,
            ...(name === "batch" ? { semester: null, subject: null } : {}),
            ...(name === "semester" ? { subject: null } : {}),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5001/api/faculties/createAssignSubject", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(assignment),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to assign faculty");
            }

            alert("Faculty assigned successfully!");
            console.log("Assignment Successful:", data);

            // Reset form after successful submission
            setAssignment({
                batch: "",
                semester: "",
                subject: "",
                faculty: selectedFaculty?.id || "",
            });

        } catch (error) {
            console.error("Error assigning faculty:", error);
            alert(error.message);
        }
    };

    return (
        <div className="faculty-assignment-container">
            <header style={{ textAlign: 'left' }}>
                <h2 style={{ textAlign: 'left' }}>Assign Faculty for Subject</h2>
                <p style={{ textAlign: 'left' }}>Please select the faculty member and the subject they will be assigned to.</p>
                <br />
            </header>
            <form onSubmit={handleSubmit} className="assignment-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Select Batch</label>
                        <Select
                            name="batch"
                            value={assignment.batch}
                            onChange={handleChange}
                            options={batches}
                            placeholder="Select Batch"
                            isSearchable
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Semester</label>
                        <Select
                            name="semester"
                            value={assignment.semester}
                            onChange={handleChange}
                            options={semesters}
                            placeholder="Select Semester"
                            isSearchable
                            isDisabled={!assignment.batch}
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Subject</label>
                        <Select
                            name="subject"
                            value={assignment.subject}
                            onChange={handleChange}
                            options={subjects}
                            placeholder="Select Subject"
                            isSearchable
                            isDisabled={!assignment.batch || !assignment.semester}
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Faculty</label>
                        <Select
                            name="faculty"
                            value={assignment.faculty}
                            onChange={handleChange}
                            options={faculties}
                            placeholder="Select Faculty"
                            isSearchable
                        />
                    </div>
                </div>

                <button type="submit" className="submit-btn-assign-faculty">Assign Faculty</button>
            </form>
        </div>
    );
};

export default FacultyAssignment;
