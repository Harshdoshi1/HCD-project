import React, { useState, useEffect } from 'react';

const SubjectList = ({ onSelectSubject }) => {
    const [filters, setFilters] = useState({
        program: 'degree',
        batch: 'all',
        semester: 'all'
    });
    const [subjects, setSubjects] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSubject, setNewSubject] = useState({
        name: '',
        code: '',
        courseType: 'degree',
        credits: '',
        subjectType: 'central'
    });

    const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
    const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

    // Fetch subjects using POST request
    const fetchSubjects = async () => {
        if (filters.program === 'all') {
            setSubjects([]); // Reset if "All Programs" is selected
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/users/getSubjects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    program: filters.program,
                    // batch: filters.batch === 'all' ? null : filters.batch,
                    // semester: filters.semester === 'all' ? null : filters.semester
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSubjects(data.subjects);
            } else {
                console.error('Failed to fetch subjects:', data.message);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    // Fetch subjects when program, batch, or semester filter changes
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSubject)
            });

            if (response.ok) {
                setShowAddForm(false);
                fetchSubjects(); // Refresh subjects list
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
                <div className="filter-group">
                    <select className="professional-filter" value={filters.program} onChange={(e) => handleFilterChange('program', e.target.value)}>
                        <option value="all">All Programs</option>
                        <option value="degree">Degree</option>
                        <option value="diploma">Diploma</option>
                    </select>
                    <select className="professional-filter" value={filters.batch} onChange={(e) => handleFilterChange('batch', e.target.value)}>
                        <option value="all">All Batches</option>
                        {batches.map(batch => <option key={batch} value={batch}>{batch}</option>)}
                    </select>
                    <select className="professional-filter" value={filters.semester} onChange={(e) => handleFilterChange('semester', e.target.value)}>
                        <option value="all">All Semesters</option>
                        {semesters.map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                    </select>
                </div>
                <button className="subject-add-toggle" onClick={() => setShowAddForm(true)}>Add New Subject</button>
            </div>

            {showAddForm && (
                <div className="subject-modal">
                    <div className="modal-overlay" onClick={() => setShowAddForm(false)} />
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create New Subject</h3>
                            <button onClick={() => setShowAddForm(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <input type="text" placeholder="Subject Name" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} />
                            <input type="text" placeholder="Subject Code" value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} />
                            <select value={newSubject.courseType} onChange={(e) => setNewSubject({ ...newSubject, courseType: e.target.value })}>
                                <option value="degree">Degree Course</option>
                                <option value="diploma">Diploma Course</option>
                            </select>
                            <select value={newSubject.subjectType} onChange={(e) => setNewSubject({ ...newSubject, subjectType: e.target.value })}>
                                <option value="central">Central Subject</option>
                                <option value="departmental">Departmental Subject</option>
                            </select>
                            <input type="number" placeholder="Credits" value={newSubject.credits} onChange={(e) => setNewSubject({ ...newSubject, credits: e.target.value })} />
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                            <button className="modal-confirm" onClick={handleAddSubject}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="subjects-grid">
                {subjects.length > 0 ? (
                    subjects.map(subject => (
                        <div key={subject.sub_code} className="subject-card" onClick={() => onSelectSubject(subject)}>
                            <div className="subject-code">{subject.sub_code}</div>
                            <div className="subject-name">{subject.sub_name}</div>
                            <div className="subject-details">
                                <span>{filters.program}</span>
                                <span>{filters.batch !== 'all' ? filters.batch : 'All Batches'}</span>
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
