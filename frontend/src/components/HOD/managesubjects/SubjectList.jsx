
import React, { useState } from 'react';

const SubjectList = ({ onSelectSubject }) => {
    const [filters, setFilters] = useState({
        program: 'all',
        batch: 'all',
        semester: 'all'
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSubject, setNewSubject] = useState({
        name: '',
        code: '',
        courseType: 'degree',
        credits: '',
        subjectType: 'central'
    });

    const subjects = [
        { id: 1, code: 'CS101', name: 'Introduction to Programming', program: 'degree', batch: '2022-2026', semester: '1' },
        { id: 2, code: 'CS102', name: 'Data Structures', program: 'degree', batch: '2022-2026', semester: '2' },
        { id: 3, code: 'DIP101', name: 'Digital Electronics', program: 'diploma', batch: '2021-2024', semester: '1' },
    ];

    const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
    const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleAddSubject = async () => {
        try {
            await axios.post('/api/subjects', newSubject);
            setShowAddForm(false);
        } catch (error) {
            console.error('Error adding subject:', error);
        }
    };

    const filteredSubjects = subjects.filter(subject => (
        (filters.program === 'all' || subject.program === filters.program) &&
        (filters.batch === 'all' || subject.batch === filters.batch) &&
        (filters.semester === 'all' || subject.semester === filters.semester)
    ));

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
                {filteredSubjects.map(subject => (
                    <div key={subject.id} className="subject-card" onClick={() => onSelectSubject(subject)}>
                        <div className="subject-code">{subject.code}</div>
                        <div className="subject-name">{subject.name}</div>
                        <div className="subject-details">
                            <span>{subject.program}</span>
                            <span>{subject.batch}</span>
                            <span>Semester {subject.semester}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubjectList;
