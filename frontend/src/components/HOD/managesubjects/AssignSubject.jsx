import React, { useState, useEffect } from "react";

const AssignSubject = () => {
    const [filters, setFilters] = useState({
        program: "all",
        batch: "all",
        semester: "all",
    });

    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);

    // Fetch batches from the database
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

    // Fetch semesters based on selected batch
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                if (!filters.batch || filters.batch === "all") {
                    setSemesters([]);
                    return;
                }

                const response = await fetch(`http://localhost:5001/api/users/getSemestersByBatch/${filters.batch}`);
                if (!response.ok) throw new Error("Failed to fetch semesters");
                const data = await response.json();
                setSemesters(data);
            } catch (error) {
                console.error("Error fetching semesters:", error);
            }
        };

        fetchSemesters();
    }, [filters.batch]); // Runs when batch changes

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "batch" ? { semester: "all" } : {}), // Reset semester when batch changes
        }));
    };

    // Fetch subjects based on selected program
    useEffect(() => {
        const fetchSubjects = async () => {
            if (filters.program === "all") {
                setAvailableSubjects([]);
                return;
            }
            try {
                const response = await fetch("http://localhost:5001/api/users/getSubjects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ program: filters.program }),
                });
                const data = await response.json();
                if (response.ok) {
                    setAvailableSubjects(data.subjects);
                } else {
                    console.error("Failed to fetch subjects:", data.message);
                }
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };

        fetchSubjects();
    }, [filters.program]); // Runs when program changes

    // Handle subject selection
    const handleSubjectSelect = (subject) => {
        setSelectedSubjects((prev) => {
            const isAlreadySelected = prev.some((s) => s.sub_code === subject.sub_code);
            if (!isAlreadySelected) {
                return [...prev, subject];
            }
            return prev;
        });
    };

    // Remove subject from selected list
    const handleSubjectRemove = (subject) => {
        setSelectedSubjects((prev) => prev.filter((s) => s.sub_code !== subject.sub_code));
    };

    // Save selected subjects
    const handleSaveSubjects = async () => {
        if (filters.batch === "all" || filters.semester === "all") {
            alert("Please select a valid Batch and Semester.");
            return;
        }

        if (selectedSubjects.length === 0) {
            alert("Please select at least one subject.");
            return;
        }

        try {
            const subjects = selectedSubjects.map((subject) => ({
                subjectName: subject.sub_name,
                semesterNumber: filters.semester,
                batchName: filters.batch,
            }));

            const response = await fetch("http://localhost:5001/api/users/assignSubject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subjects }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Subjects assigned successfully!");
                setSelectedSubjects([]); // Clear selection after saving
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error saving subjects:", error);
            alert("Failed to assign subjects.");
        }
    };

    // Calculate total credits
    const totalCredits = selectedSubjects.reduce(
        (sum, subject) => sum + (subject.sub_credit || 0),
        0
    );

    return (
        <div className="assign-subject-container">
            {/* Filters */}
            <div className="filters-container">
                <div className="filter-group">
                    <select
                        className="professional-filter"
                        value={filters.program}
                        onChange={handleChange}
                        name="program"
                    >
                        <option value="all">All Programs</option>
                        <option value="degree">Degree</option>
                        <option value="diploma">Diploma</option>
                    </select>

                    <select className="professional-filter" name="batch" value={filters.batch} onChange={handleChange} required>
                        <option value="all">Select Batch</option>
                        {batches.map((batch, index) => (
                            <option key={batch._id || index} value={batch.batchName}>
                                {batch.batchName}
                            </option>
                        ))}
                    </select>

                    <select className="professional-filter" name="semester" value={filters.semester} onChange={handleChange} required>
                        <option value="all">Select Semester</option>
                        {semesters.map((sem, index) => (
                            <option key={sem._id || index} value={sem.semesterNumber}>
                                Semester {sem.semesterNumber}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Selected Subjects */}
            <div className="selected-subjects-section">
                <div className="selected-subjects-header">
                    <h3 className="heading1-as">Selected Subjects</h3>
                    <div className="selected-subjects-stats">
                        <span>Selected: {selectedSubjects.length}</span>
                        <span>Total Credits: {totalCredits}</span>
                    </div>
                </div>
                <div className="selected-subjects-container">
                    {selectedSubjects.map((subject, index) => (
                        <div key={subject.sub_code || index} className="subject-item">
                            <span>
                                {subject.sub_code} - {subject.sub_name} ({subject.sub_credit} credits)
                            </span>
                            <button className="remove-subject-btn" onClick={() => handleSubjectRemove(subject)}>
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Available Subjects */}
            <div className="all-subjects-section">
                <h3 className="heading2-as">Available Subjects</h3>
                <div className="all-subjects-container">
                    {availableSubjects.length > 0 ? (
                        availableSubjects.map((subject, index) => (
                            <div key={subject.sub_code || index} className="subject-item" onClick={() => handleSubjectSelect(subject)}>
                                <span>
                                    {subject.sub_code} - {subject.sub_name}
                                </span>
                                <span className="subject-credits">{subject.sub_credit} credits</span>
                            </div>
                        ))
                    ) : (
                        <p>No subjects available for the selected program.</p>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <div className="save-subjects-section">
                <button className="save-subjects-btn" onClick={handleSaveSubjects}>
                    Save Selected Subjects
                </button>
            </div>
        </div>
    );
};

export default AssignSubject;