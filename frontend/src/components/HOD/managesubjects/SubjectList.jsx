import React, { useState, useEffect } from 'react';

const SubjectList = ({ onSelectSubject, showAddForm, setShowAddForm }) => {
    const [filters, setFilters] = useState({
        program: 'degree',
        batch: 'all',
        semester: 'all'
    });

    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({
        name: '',
        code: '',
        courseType: 'degree',
        credits: '',
        subjectType: 'central'
    });

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

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/users/getSubjects/${filters.batch}/${filters.semester}`);
            if (!response.ok) throw new Error("Failed to fetch subjects");
            const data = await response.json();
            setSubjects(data.uniqueSubjects);
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [filters.program, filters.batch, filters.semester]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleAddSubject = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/users/addSubject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubject)
            });
            if (response.ok) {
                setShowAddForm(false);
                fetchSubjects();
            } else {
                console.error('Failed to add subject:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding subject:', error);
        }
    };

    return (
        <div className="subject-list">
            <div className="filters-container">
                <select name="program" value={filters.program} onChange={(e) => handleFilterChange('program', e.target.value)}>
                    <option value="all">All Programs</option>
                    <option value="degree">Degree</option>
                    <option value="diploma">Diploma</option>
                </select>
                <select name="batch" value={filters.batch} onChange={(e) => handleFilterChange('batch', e.target.value)}>
                    <option value="all">Batch</option>
                    {batches.map(batch => <option key={batch.id} value={batch.batchName}>{batch.batchName}</option>)}
                </select>
                <select name="semester" value={filters.semester} onChange={(e) => handleFilterChange('semester', e.target.value)}>
                    <option value="all">Semester</option>
                    {semesters.map(sem => <option key={sem.id} value={sem.semesterNumber}>Semester {sem.semesterNumber}</option>)}
                </select>
            </div>

            {showAddForm && (
                <div className="modal">
                    <div className="modal-overlay" onClick={() => setShowAddForm(false)} />
                    <div className="modal-content">
                        <h3>Create New Subject</h3>
                        <input type="text" placeholder="Subject Name" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} />
                        <input type="text" placeholder="Subject Code" value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} />
                        <input type="number" placeholder="Credits" value={newSubject.credits} onChange={(e) => setNewSubject({ ...newSubject, credits: e.target.value })} />
                        <button onClick={handleAddSubject}>Save</button>
                    </div>
                </div>
            )}

            <div className="subjects-grid">
                {subjects.length > 0 ? subjects.map(subject => (
                    <div key={subject.sub_code} className="subject-card" onClick={() => onSelectSubject(subject)}>
                        <div className="subject-code">{subject.sub_code}</div>
                        <div className="subject-name">{subject.sub_name}</div>
                        <div className="subject-details">{subject.sub_level}</div>
                    </div>
                )) : <p>No subjects found.</p>}
            </div>
        </div>
    );
};

export default SubjectList;