import React, { useState, useEffect } from "react";
import "./AssignSubject.css";

const AssignSubject = () => {
    // State for filters and data
    const [filters, setFilters] = useState({
        batch: "all",
        semester: "all"
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch batches from the database
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/batches/getAllBatches");
                if (!response.ok) throw new Error("Failed to fetch batches");
                const data = await response.json();
                // Map Supabase response to match frontend structure
                const mappedBatches = data.map(batch => ({
                    batchName: batch.name,
                    courseType: batch.program,
                    id: batch.id
                }));
                setBatches(mappedBatches);
            } catch (error) {
                console.error("Error fetching batches:", error);
                setError("Failed to fetch batches");
            }
        };

        fetchBatches();
    }, []);

    // Function to fetch all unique subjects (extracted for reuse)
    const fetchAllUniqueSubjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:5001/api/subjects/getAllUniqueSubjects");
            
            if (!response.ok) {
                if (response.status === 404) {
                    setAvailableSubjects([]);
                    setError("No subjects found");
                    return;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched unique subjects:", data);

            if (!data || !Array.isArray(data.subjects)) {
                throw new Error("Unexpected response format: Expected an array");
            }

            setAvailableSubjects(data.subjects);
        } catch (error) {
            console.error("Error fetching subjects:", error);
            setError("Failed to fetch subjects: " + error.message);
            setAvailableSubjects([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all subjects initially from UniqueSubDegrees table
    useEffect(() => {
        fetchAllUniqueSubjects();
    }, []);

    // Fetch subjects by batch when batch filter changes
    useEffect(() => {
        if (filters.batch === "all" || !isFiltering) return;

        const fetchSubjectsByBatchWithDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // If both batch and semester are selected
                if (filters.semester !== "all") {
                    const response = await fetch(
                        `http://localhost:5001/api/subjects/getSubjectsByBatchAndSemesterWithDetails/${filters.batch}/${filters.semester}`
                    );
                    
                    if (!response.ok) {
                        if (response.status === 404) {
                            setAvailableSubjects([]);
                            setError("No subjects found for this batch and semester");
                            return;
                        }
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log("Fetched subjects by batch and semester:", data);
                    setAvailableSubjects(data.subjects);
                } else {
                    // If only batch is selected
                    const response = await fetch(
                        `http://localhost:5001/api/subjects/getSubjectsByBatchWithDetails/${filters.batch}`
                    );
                    
                    if (!response.ok) {
                        if (response.status === 404) {
                            setAvailableSubjects([]);
                            setError("No subjects found for this batch");
                            return;
                        }
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log("Fetched subjects by batch:", data);
                    setAvailableSubjects(data.subjects);
                }
            } catch (error) {
                console.error("Error fetching filtered subjects:", error);
                setError("Failed to fetch subjects: " + error.message);
                setAvailableSubjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectsByBatchWithDetails();
    }, [filters.batch, filters.semester, isFiltering]);

    // Fetch semesters based on selected batch
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                if (!filters.batch || filters.batch === "all") {
                    setSemesters([]);
                    return;
                }

                // Properly encode the batch name for the URL
                const encodedBatchName = encodeURIComponent(filters.batch);
                console.log(`Fetching semesters for batch: ${filters.batch} (encoded: ${encodedBatchName})`);
                
                const response = await fetch(`http://localhost:5001/api/semesters/getSemestersByBatch/${encodedBatchName}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        console.log(`No semesters found for batch: ${filters.batch}`);
                        setSemesters([]);
                        return;
                    }
                    throw new Error(`Failed to fetch semesters: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log(`Fetched ${data.length} semesters for batch: ${filters.batch}`, data);
                
                // Handle Supabase response format and sort semesters by semester_number
                if (Array.isArray(data)) {
                    const sortedSemesters = [...data].sort((a, b) => 
                        (a.semester_number || 0) - (b.semester_number || 0)
                    );
                    setSemesters(sortedSemesters);
                } else {
                    console.error("Unexpected semester data format:", data);
                    setSemesters([]);
                }
            } catch (error) {
                console.error("Error fetching semesters:", error);
                setSemesters([]);
                setError(`Failed to fetch semesters: ${error.message}`);
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

                // Properly encode the batch name for the URL
                const encodedBatchName = encodeURIComponent(assignFilters.batch);
                console.log(`Fetching semesters for assigned batch: ${assignFilters.batch} (encoded: ${encodedBatchName})`);
                
                const response = await fetch(`http://localhost:5001/api/semesters/getSemestersByBatch/${encodedBatchName}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        console.log(`No semesters found for assigned batch: ${assignFilters.batch}`);
                        setAssignSemesters([]);
                        return;
                    }
                    throw new Error(`Failed to fetch semesters: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log(`Fetched ${data.length} semesters for assigned batch: ${assignFilters.batch}`, data);
                
                // Handle Supabase response format and sort semesters by semester_number
                if (Array.isArray(data)) {
                    const sortedSemesters = [...data].sort((a, b) => 
                        (a.semester_number || 0) - (b.semester_number || 0)
                    );
                    setAssignSemesters(sortedSemesters);
                } else {
                    console.error("Unexpected semester data format for assignment:", data);
                    setAssignSemesters([]);
                }
            } catch (error) {
                console.error("Error fetching semesters for assignment:", error);
                setAssignSemesters([]);
                setError(`Failed to fetch semesters for assignment: ${error.message}`);
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
        if (name !== "searchQuery") {
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
        fetchAllUniqueSubjects();
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

        setLoading(true);
        setError(null);

        try {
            // Map subjects correctly, ensuring all required fields are present
            const subjects = selectedSubjects.map((subject) => {
                // Get the subject name from either subjectName or sub_name property
                const subjectName = subject.subjectName || subject.sub_name;
                
                if (!subjectName) {
                    throw new Error(`Missing subject name for subject code: ${subject.sub_code}`);
                }
                
                return {
                    subjectName: subjectName,
                    semesterNumber: parseInt(assignFilters.semester),
                    batchName: assignFilters.batch,
                };
            });

            console.log("Assigning subjects:", subjects);

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
                const errorMessage = data.message || "Unknown error occurred";
                console.error("Error response:", data);
                alert(`Error: ${errorMessage}`);
                setError(errorMessage);
            }
        } catch (error) {
            console.error("Error saving subjects:", error);
            setError(`Failed to assign subjects: ${error.message}`);
            alert(`Failed to assign subjects: ${error.message}`);
        } finally {
            setLoading(false);
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
                                    <option key={batch.id || index} value={batch.batchName}>
                                        {batch.batchName}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="professional-filter"
                                name="semester-to-assign"
                                value={assignFilters.semester}
                                onChange={handleAssignFiltersChange}
                                required
                            >
                                <option value="all">Semester</option>
                                {assignSemesters.map((sem, index) => (
                                    <option key={sem.id || index} value={sem.semester_number}>
                                        Semester {sem.semester_number}
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
                                        {subject.sub_code} - {subject.sub_name || subject.subjectName} ({subject.sub_credit})
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
                <div className="credits-summary">
                    <p>Total Credits: <strong>{totalCredits}</strong></p>
                    <button 
                        className="save-subjects-btn" 
                        onClick={handleSaveSubjects}
                        disabled={selectedSubjects.length === 0 || assignFilters.batch === "all" || assignFilters.semester === "all"}
                    >
                        {loading ? "Saving..." : "Save Subjects"}
                    </button>
                </div>
            </div>

            <div className="Seconddiv-availabe-sub-for-assign">
                <div className="top-things-for-selected-sub-asssign">
                    <span>All</span>&nbsp; <span> Subjects</span>
                    <div className="filters-container-assign-subject-two">
                        <div className="filter-group-assign-subject-two">
                            <select
                                className="professional-filter"
                                name="batch"
                                value={filters.batch}
                                onChange={handleChange}
                            >
                                <option value="all">All Batches</option>
                                {batches.map((batch, index) => (
                                    <option key={batch.id || index} value={batch.batchName}>
                                        {batch.batchName}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="professional-filter"
                                name="semester"
                                value={filters.semester}
                                onChange={handleChange}
                                required
                            >
                                <option value="all">Semester</option>
                                {semesters.map((sem, index) => (
                                    <option key={sem.id || index} value={sem.semester_number}>
                                        Semester {sem.semester_number}
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
                <div className="available-subjects-container">
                    {loading ? (
                        <div className="loading-message">Loading subjects...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : availableSubjects.length === 0 ? (
                        <div className="no-subjects-message">
                            {isFiltering ? "No subjects found for the selected filters." : "No subjects available."}
                        </div>
                    ) : (
                        <div className="subjects-grid">
                            {availableSubjects.map((subject, index) => (
                                <div
                                    key={subject.sub_code || index}
                                    className="subject-card"
                                    onClick={() => handleSubjectSelect(subject)}
                                >
                                    <div className="subject-code">{subject.sub_code}</div>
                                    <div className="subject-name">{subject.sub_name}</div>
                                    <div className="subject-details">
                                        <div><strong>Credits:</strong> {subject.sub_credit}</div>
                                        <div><strong>Type:</strong> {subject.sub_level}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignSubject;
