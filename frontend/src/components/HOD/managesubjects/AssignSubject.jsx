// import React, { useState, useEffect } from "react";

// const AssignSubject = () => {
//     const [filters, setFilters] = useState({
//         program: "all",
//         batch: "all",
//         semester: "all",

//     });

//     const [availableSubjects, setAvailableSubjects] = useState([]);
//     const [selectedSubjects, setSelectedSubjects] = useState([]);
//     const [batches, setBatches] = useState([]);
//     const [semesters, setSemesters] = useState([]);

//     //fetch batches
//     useEffect(() => {
//         const fetchBatches = async () => {
//             try {
//                 const response = await fetch("http://localhost:5001/api/users/getAllBatches");
//                 if (!response.ok) throw new Error("Failed to fetch batches");
//                 const data = await response.json();
//                 setBatches(data);
//             } catch (error) {
//                 console.error("Error fetching batches:", error);
//             }
//         };

//         fetchBatches();
//     }, []);


//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         setAssignment((prev) => ({
//             ...prev,
//             [name]: value,
//             ...(name === "batch" ? { semester: "", subject: "" } : {}),
//             ...(name === "semester" ? { subject: "" } : {}),
//         }));
//     };
//     // Fetch subjects based on selected program
//     const fetchSubjects = async () => {
//         if (filters.program === "all") {
//             setAvailableSubjects([]);
//             return;
//         }
//         try {
//             const response = await fetch(
//                 "http://localhost:5001/api/users/getSubjects",
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ program: filters.program }),
//                 }
//             );
//             const data = await response.json();
//             if (response.ok) {
//                 setAvailableSubjects(data.subjects);
//             } else {
//                 console.error("Failed to fetch subjects:", data.message);
//             }
//         } catch (error) {
//             console.error("Error fetching subjects:", error);
//         }
//     };

//     useEffect(() => {
//         fetchSubjects();
//     }, [filters.program]);

//     const handleFilterChange = (filterType, value) => {
//         setFilters((prev) => ({ ...prev, [filterType]: value }));
//     };

//     // Handle subject selection
//     const handleSubjectSelect = (subject) => {
//         setSelectedSubjects((prev) => {
//             const isAlreadySelected = prev.some(
//                 (s) => s.sub_code === subject.sub_code
//             );
//             if (!isAlreadySelected) {
//                 return [...prev, subject]; // Append new selection
//             }
//             return prev;
//         });
//     };

//     // Remove subject from selected list
//     const handleSubjectRemove = (subject) => {
//         setSelectedSubjects((prev) =>
//             prev.filter((s) => s.sub_code !== subject.sub_code)
//         );
//     };

//     // Save selected subjects
//     const handleSaveSubjects = async () => {
//         if (filters.batch === "all" || filters.semester === "all") {
//             alert("Please select a valid Batch and Semester.");
//             return;
//         }

//         if (selectedSubjects.length === 0) {
//             alert("Please select at least one subject.");
//             return;
//         }

//         try {
//             const subjects = selectedSubjects.map((subject) => ({
//                 subjectName: subject.sub_name,
//                 semesterNumber: filters.semester,
//                 batchName: filters.batch,
//             }));

//             const response = await fetch(
//                 "http://localhost:5001/api/users/assignSubject",
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ subjects }),
//                 }
//             );

//             const data = await response.json();
//             if (response.ok) {
//                 alert("Subjects assigned successfully!");
//             } else {
//                 alert(`Error: ${data.message}`);
//             }
//         } catch (error) {
//             console.error("Error saving subjects:", error);
//             alert("Failed to assign subjects.");
//         }
//     };

//     // Calculate total credits
//     const totalCredits = selectedSubjects.reduce(
//         (sum, subject) => sum + (subject.sub_credit || 0),
//         0
//     );

//     return (
//         <div className="assign-subject-container">
//             {/* Filters */}
//             <div className="filters-container">
//                 <div className="filter-group">
//                     <select
//                         className="professional-filter"
//                         value={filters.program}
//                         onChange={(e) => handleFilterChange("program", e.target.value)}
//                     >
//                         <option value="all">All Programs</option>
//                         <option value="degree">Degree</option>
//                         <option value="diploma">Diploma</option>
//                     </select>

//                     <select className="professional-filter" name="batch" value={filters.batch} onChange={handleChange} required>
//                         <option value="">Select Batch</option>
//                         {batches.map((batch, index) => (
//                             <option key={batch._id || index} value={batch.batchName}>
//                                 {batch.batchName}
//                             </option>
//                         ))}
//                     </select>

//                     <select className="professional-filter" name="semester" value={filters.semester} onChange={handleChange} required>
//                         <option value="">Select Semester</option>
//                         {semesters.map((sem, index) => (
//                             <option key={sem._id || index} value={sem.semesterNumber}>
//                                 Semester {sem.semesterNumber}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//             </div>

//             {/* Selected Subjects */}
//             <div className="selected-subjects-section">
//                 <div className="selected-subjects-header">
//                     <h3 className='heading1-as' style={{ textAlign: 'left' }}>Selected Subjects</h3>          <div className="selected-subjects-stats">
//                         <span className="subject-count">
//                             Selected: {selectedSubjects.length}
//                         </span>
//                         <span className="total-credits">Total Credits: {totalCredits}</span>
//                     </div>
//                 </div>
//                 <div className="selected-subjects-container">
//                     {selectedSubjects.map((subject, index) => (
//                         <div key={subject.sub_code || index} className="subject-item">
//                             <div className="subject-info">
//                                 <span>
//                                     {subject.sub_code} - {subject.sub_name} ({subject.sub_credit}{" "}
//                                     credits)
//                                 </span>
//                             </div>
//                             <button
//                                 className="remove-subject-btn"
//                                 onClick={() => handleSubjectRemove(subject)}
//                             >
//                                 ×
//                             </button>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Available Subjects */}
//             <div className="all-subjects-section">
//                 <h3 className='heading2-as' style={{ textAlign: 'left' }}>Available Subjects</h3>        <div className="all-subjects-container">
//                     {availableSubjects.length > 0 ? (
//                         availableSubjects.map((subject, index) => (
//                             <div
//                                 key={subject.sub_code || index}
//                                 className="subject-item"
//                                 onClick={() => handleSubjectSelect(subject)}
//                             >
//                                 <span>
//                                     {subject.sub_code} - {subject.sub_name}
//                                 </span>
//                                 <span className="subject-credits">
//                                     {subject.sub_credit} credits
//                                 </span>
//                             </div>
//                         ))
//                     ) : (
//                         <p>No subjects available for the selected program.</p>
//                     )}
//                 </div>
//             </div>
//             {/* <div className="all-subjects-section">
//                 <h3 className='heading2-as' style={{ textAlign: 'left' }}>Available Subjects</h3>

//                 <div className="all-subjects-container">
//                     {allSubjects.map(subject => (
//                         <div
//                             key={subject.id}
//                             className="subject-item"
//                             onClick={() => handleSubjectSelect(subject)}
//                         >
//                             <span>{subject.code} - {subject.name}</span>
//                             <span className="subject-credits">{subject.credits} credits</span>
//                         </div>
//                     ))}
//                 </div>
//             </div> */}

//             {/* Save Button */}
//             {/* <div className="save-subjects-section">
//         <button className="save-subjects-btn" onClick={handleSaveSubjects}>
//           Save Selected Subjects
//         </button>
//       </div> */}

//             <div className="save-subjects-section">
//                 <button
//                     className="save-subjects-btn"
//                     onClick={handleSaveSubjects}
//                 >
//                     Save Selected Subjects
//                 </button>
//             </div>

//         </div>
//     );
// };

// export default AssignSubject;

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

    // Fetch Batches
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

    // Fetch Semesters when Batch is selected
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                if (filters.batch === "all") {
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
    }, [filters.batch]);

    // Fetch subjects based on program, batch, and semester filters
    useEffect(() => {
        const fetchSubjects = async () => {
            if (filters.program === "all" || filters.batch === "all" || filters.semester === "all") {
                setAvailableSubjects([]);
                return;
            }

            try {
                const response = await fetch("http://localhost:5001/api/users/getSubjects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        program: filters.program,
                        batch: filters.batch,
                        semester: filters.semester,
                    }),
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
    }, [filters]);

    // Handle filter changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle subject selection
    const handleSubjectSelect = (subject) => {
        setSelectedSubjects((prev) => {
            const isAlreadySelected = prev.some((s) => s.sub_code === subject.sub_code);
            if (!isAlreadySelected) {
                return [...prev, subject]; // Append new selection
            }
            return prev;
        });
    };

    // Remove subject from selected list
    const handleSubjectRemove = (subject) => {
        setSelectedSubjects((prev) =>
            prev.filter((s) => s.sub_code !== subject.sub_code)
        );
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

                    <select
                        className="professional-filter"
                        name="batch"
                        value={filters.batch}
                        onChange={handleChange}
                        required
                    >
                        <option value="all">Select Batch</option>
                        {batches.map((batch) => (
                            <option key={batch._id || batch.batchName} value={batch.batchName}>
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
                        <option value="all">Select Semester</option>
                        {semesters.map((semester) => (
                            <option key={semester._id || semester.value} value={semester.value}>
                                Semester {semester.value}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Selected Subjects */}
            <div className="selected-subjects-section">
                <div className="selected-subjects-header">
                    <h3 className="heading1-as" style={{ textAlign: "left" }}>
                        Selected Subjects
                    </h3>
                    <div className="selected-subjects-stats">
                        <span className="subject-count">Selected: {selectedSubjects.length}</span>
                        <span className="total-credits">Total Credits: {totalCredits}</span>
                    </div>
                </div>
                <div className="selected-subjects-container">
                    {selectedSubjects.map((subject) => (
                        <div key={subject.sub_code} className="subject-item">
                            <div className="subject-info">
                                <span>
                                    {subject.sub_code} - {subject.sub_name} ({subject.sub_credit}{" "}
                                    credits)
                                </span>
                            </div>
                            <button
                                className="remove-subject-btn"
                                onClick={() => handleSubjectRemove(subject)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Available Subjects */}
            <div className="all-subjects-section">
                <h3 className="heading2-as" style={{ textAlign: "left" }}>
                    Available Subjects
                </h3>
                <div className="all-subjects-container">
                    {availableSubjects.length > 0 ? (
                        availableSubjects.map((subject) => (
                            <div
                                key={subject.sub_code} // Ensuring the key prop is unique
                                className="subject-item"
                                onClick={() => handleSubjectSelect(subject)}
                            >
                                <span>
                                    {subject.sub_code} - {subject.sub_name}
                                </span>
                                <span className="subject-credits">
                                    {subject.sub_credit} credits
                                </span>
                            </div>
                        ))
                    ) : (
                        <p>No subjects available for the selected program, batch, or semester.</p>
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
