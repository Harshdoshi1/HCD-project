import React, { useState, useEffect } from 'react';
import "./SubjectList.css";
const SubjectList = ({ onSelectSubject }) => {
    const [filters, setFilters] = useState({
        program: 'degree',
        batch: 'all',
        semester: 'all'
    });

    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);

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
                console.log("dasada", data);
                setSemesters(data);
            } catch (error) {
                console.error("Error fetching semesters:", error);
            }
        };
        fetchSemesters();
    }, [filters.batch]);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                if (filters.batch === "all" || filters.semester === "all") {
                    setSubjects([]);
                    return;
                }
                const response = await fetch(
                    `http://localhost:5001/api/subjects/getSubjects/${encodeURIComponent(filters.batch)}/${filters.semester}`
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    throw new Error(errorData.message || "Failed to fetch subjects");
                }
                const data = await response.json();
                console.log('Subjects API Response:', data);
                setSubjects(data.uniqueSubjects || data.subjects || []);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };
        fetchSubjects();
    }, [filters.batch, filters.semester]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            ...(name === "batch" ? { semester: "all" } : {}),
        }));
        // Clear subjects immediately on filter change
        setSubjects([]);
    };

    return (
        <div className="subject-list">
            <div className="filters-container-display-subject-list">

                <select className="professional-filter-ds" name="batch" value={filters.batch} onChange={handleChange} required>
                    <option value="all">Batch</option>
                    {batches.map((batch, index) => (
                        <option key={batch._id || index} value={batch.batchName}>
                            {batch.batchName}
                        </option>
                    ))}
                </select>
                <select className="professional-filter-ds" name="semester" value={filters.semester} onChange={handleChange} required>
                    <option value="all">Semester</option>
                    {semesters.map((sem, index) => (
                        <option key={sem._id || index} value={sem.semesterNumber}>
                            Semester {sem.semesterNumber}
                        </option>
                    ))}
                </select>
            </div>

            <div className="subjects-grid">
                {subjects.length > 0 ? (
                    subjects.map((subject, index) => {
                        const code = subject.sub_code || subject.subjectCode || subject.code;
                        const name = subject.sub_name || subject.subjectName || subject.name;
                        return (
                            <div key={subject._id || code || index} className="subject-card" onClick={() => onSelectSubject(subject)}>
                                {code && (
                                    <div className="subject-code">{code}</div>
                                )}
                                <div className="subject-name">
                                    {name}
                                </div>
                                <div className="subject-details">
                                    <div><strong>Type:</strong> {filters.program.charAt(0).toUpperCase() + filters.program.slice(1)}</div>
                                    {(subject.sub_credit || subject.credits) &&
                                        <div><strong>Credits:</strong> {subject.sub_credit || subject.credits}</div>}
                                    {(subject.sub_type || subject.type) &&
                                        <div><strong>Category:</strong> {subject.sub_type || subject.type}</div>}
                                    <div><strong>Semester:</strong> {filters.semester}</div>
                                    <div><strong>Batch:</strong> {filters.batch}</div>
                                </div>
                            </div>
                        );
                    })
                ) : (

                    <p className="no-subjects">No subjects found for the selected filters.</p>
                )}
            </div>
        </div>
    );
};

export default SubjectList;