import React, { useState, useEffect } from "react";
import "./AssignSubject.css";

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
    const [assignSemesters, setAssignSemesters] = useState([]);
    const [assignFilters, setAssignFilters] = useState({
        batch: "all",
        semester: "all",
    });
    const [isFiltering, setIsFiltering] = useState(false);

    // Fetch batches from the database
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/batches/getAllBatches");
                if (!response.ok) throw new Error("Failed to fetch batches");
                const data = await response.json();
                setBatches(data);
            } catch (error) {
                console.error("Error fetching batches:", error);
            }
        };

        fetchBatches();
    }, []);

    // Fetch all subjects initially and when program changes
    useEffect(() => {
        const fetchAllSubjects = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/subjects/getSubjects"); // Replace with actual API URL

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Fetched subjects:", data); // Debugging log

                if (!data || !Array.isArray(data.subjects)) {
                    throw new Error("Unexpected response format: Expected an array");
                }

                setAvailableSubjects(data.subjects); // Update the state with fetched data
            } catch (error) {
                console.error("Error fetching subjects:", error);
                setAvailableSubjects([]); // Set empty array on error
            }
        };


        fetchAllSubjects();
    }, [filters.program, isFiltering]);

    // Fetch filtered subjects when applying filter
    useEffect(() => {
        const fetchFilteredSubjects = async () => {
            if (!isFiltering) return; // Only fetch when filtering is active

            try {
                const response = await fetch(
                    `http://localhost:5001/api/subjects/getSubjects/${filters.batch}/${filters.semester}`
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        setAvailableSubjects([]); // No subjects found for this combination
                        return;
                    }
                    throw new Error("Failed to fetch filtered subjects");
                }

                const data = await response.json();
                const subjects = data.uniqueSubjects || [];

                // Filter by program if needed
                const filteredData = filters.program === "all"
                    ? subjects
                    : subjects.filter(subject => subject.courseType === filters.program);

                setAvailableSubjects(filteredData);
            } catch (error) {
                console.error("Error fetching filtered subjects:", error);
                setAvailableSubjects([]); // Reset on error
            }
        };

        fetchFilteredSubjects();
    }, [isFiltering, filters]);

    // Fetch semesters based on selected batch
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                if (!filters.batch || filters.batch === "all") {
                    setSemesters([]);
                    return;
                }

                const response = await fetch(`http://localhost:5001/api/semesters/getSemestersByBatch/${filters.batch}`);
                if (!response.ok) throw new Error("Failed to fetch semesters");
                const data = await response.json();
                setSemesters(data);
            } catch (error) {
                console.error("Error fetching semesters:", error);
            }
        };

        fetchSemesters();
    }, [filters.batch]);

    // Fetch semesters for assigned subjects section
    useEffect(() => {
        const fetchAssignSemesters = async () => {
            try {
                if (!assignFilters.batch || assignFilters.batch === "all") {
                    setAssignSemesters([]);
                    return;
                }

                const response = await fetch(`http://localhost:5001/api/semesters/getSemestersByBatch/${assignFilters.batch}`);
                if (!response.ok) throw new Error("Failed to fetch semesters");
                const data = await response.json();
                setAssignSemesters(data);
            } catch (error) {
                console.error("Error fetching semesters:", error);
            }
        };

        fetchAssignSemesters();
    }, [assignFilters.batch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "batch" ? { semester: "all" } : {}), // Reset semester when batch changes
        }));
        if (name !== "program") {
            setIsFiltering(false); // Reset filtering state when changing batch or semester
        }
    };

    const handleFilter = () => {
        if (filters.batch === "all" || filters.semester === "all") {
            alert("Please select both batch and semester to apply filter");
            return;
        }
        setIsFiltering(true);
    };

    const clearFilter = () => {
        setIsFiltering(false);
        setFilters(prev => ({
            ...prev,
            batch: "all",
            semester: "all"
        }));
        setSemesters([]);
    };

    // Handle filters for selected subjects section
    const handleAssignFiltersChange = (e) => {
        const { name, value } = e.target;
        const filterName = name.replace("-to-assign", "");

        setAssignFilters((prev) => ({
            ...prev,
            [filterName]: value,
            ...(name === "batch-to-assign" ? { semester: "all" } : {}), // Reset semester when batch changes
        }));
    };

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
        if (assignFilters.batch === "all" || assignFilters.semester === "all") {
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
                semesterNumber: assignFilters.semester,
                batchName: assignFilters.batch,
            }));

            const response = await fetch("http://localhost:5001/api/subjects/assignSubject", {
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
            <div className="Firstdiv-selected-sub-for-assign">
                <div className="top-things-for-selected-sub-asssign">
                    <span>Assigned</span>&nbsp; <span> Subjects</span>
                    <div className="filters-container-assign-subject-one">
                        <div className="filter-group-assign-subject-one">


                            <select
                                className="professional-filter"
                                name="batch-to-assign"
                                value={assignFilters.batch}
                                onChange={handleAssignFiltersChange}

                                required
                            >
                                <option value="all">Batch</option>
                                {batches.map((batch, index) => (
                                    <option key={batch._id || index} value={batch.batchName}>
                                        {batch.batchName}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="professional-filter"
                                name="semester-to-assign"
                                value={assignFilters.semester}
                                onChange={handleAssignFiltersChange}
                                // onClick={alert("sndoisc")}
                                required
                            >
                                <option value="all">Semester</option>
                                {assignSemesters.map((sem, index) => (
                                    <option key={sem._id || index} value={sem.semesterNumber}>
                                        Semester {sem.semesterNumber}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="selected-subjects-section">
                    <div className="selected-subjects-container">
                        {selectedSubjects.map((subject, index) => (
                            <div key={subject.sub_code || index} className="subject-item" style={{ flexDirection: "row" }}>
                                <div className="spantag">
                                    <span>
                                        {subject.sub_code} - {subject.sub_name} ({subject.sub_credit} )
                                    </span>
                                </div>
                                <div className="canceltag">
                                    <button className="remove-subject-btn" onClick={() => handleSubjectRemove(subject)}>
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="Seconddiv-availabe-sub-for-assign">
                <div className="top-things-for-selected-sub-asssign">
                    <span>All</span>&nbsp; <span> Subjects</span>
                    <div className="filters-container-assign-subject-two">
                        <div className="filter-group-assign-subject-two">
                            <select
                                className="professional-filter"
                                name="program"
                                value={filters.program}
                                onChange={handleChange}
                            >
                                <option value="all">All Programs</option>
                                <option value="degree">Degree</option>
                                <option value="diploma">Diploma</option>
                            </select>

                            <select
                                className="professional-filter"
                                name="batch"
                                value={filters.batch}
                                onChange={handleChange}
                            >
                                <option value="all">All Batches</option>
                                {batches.map((batch, index) => (
                                    <option key={batch._id || index} value={batch.batchName}>
                                        {batch.batchName}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="professional-filter"
                                name="semester"
                                value={filters.semester}
                                onChange={handleChange}
                            >
                                <option value="all">All Semesters</option>
                                {semesters.map((sem, index) => (
                                    <option key={sem._id || index} value={sem.semesterNumber}>
                                        Semester {sem.semesterNumber}
                                    </option>
                                ))}
                            </select>

                            <button
                                className="apply-filter-button"
                                onClick={handleFilter}
                                disabled={filters.batch === "all" || filters.semester === "all"}
                            >
                                Apply Filter
                            </button>
                            {isFiltering && (
                                <button
                                    className="clear-filter-button"
                                    onClick={clearFilter}
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="all-subjects-section">
                    <div></div>
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
                            <p>No subjects available for the selected batch and semester.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="save-subjects-section">
                <button className="save-subjects-btn-final" onClick={handleSaveSubjects}>
                    Save Selected Subjects
                </button>
            </div>
        </div>
    );
};

export default AssignSubject;