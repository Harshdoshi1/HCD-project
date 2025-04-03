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
    }, [filters.batch]);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                if (filters.batch === "all" || filters.semester === "all") {
                    setSubjects([]);
                    return;
                }
                const response = await fetch(
                    `http://localhost:5001/api/users/getSubjects/${filters.batch}/${filters.semester}`
                );
                if (!response.ok) throw new Error("Failed to fetch subjects");
                const data = await response.json();
                setSubjects(data.uniqueSubjects);
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
    };

    return (
        <div className="subject-list">
            <div className="filters-container-display-subject-list">

                <select className="professional-filter ds" name="batch" value={filters.batch} onChange={handleChange} required>
                    <option value="all">Batch</option>
                    {batches.map((batch, index) => (
                        <option key={batch._id || index} value={batch.batchName}>
                            {batch.batchName}
                        </option>
                    ))}
                </select>
                <select className="professional-filter ds" name="semester" value={filters.semester} onChange={handleChange} required>
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
                    subjects.map(subject => (
                        <div key={subject.sub_code} style={{ padding: '1px' }} className="subject-card" onClick={() => onSelectSubject(subject)}>
                            <div style={{ marginTop: '10px' }} className="subject-code">{subject.sub_code}</div>
                            <div className="subject-name">{subject.sub_name}</div>
                            <div className="subject-details">
                                <span>{filters.program}</span>
                                <span>{filters.semester !== 'all' ? `Semester ${filters.semester}` : 'All Semesters'}</span>
                            </div>
                        </div>
                    ))
                ) : (

                    <p className="no-subjects">No subjects found for the selected filters.</p>
                )}
            </div>
        </div>
    );
};

export default SubjectList;