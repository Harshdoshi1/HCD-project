import React, { useState } from 'react';
import './Subject.css';

const AssignSubject = () => {
    const [filters, setFilters] = useState({
        program: 'all',
        batch: 'all',
        semester: 'all'
    });

    // Dummy data with 15 subjects
    const allSubjects = [
        { id: 1, code: 'CS101', name: 'Introduction to Programming', credits: 4 },
        { id: 2, code: 'CS102', name: 'Data Structures', credits: 4 },
        { id: 3, code: 'CS201', name: 'Database Management Systems', credits: 3 },
        { id: 4, code: 'CS202', name: 'Operating Systems', credits: 4 },
        { id: 5, code: 'CS301', name: 'Computer Networks', credits: 3 },
        { id: 6, code: 'CS302', name: 'Software Engineering', credits: 4 },
        { id: 7, code: 'CS401', name: 'Artificial Intelligence', credits: 3 },
        { id: 8, code: 'CS402', name: 'Web Development', credits: 4 },
        { id: 9, code: 'CS501', name: 'Machine Learning', credits: 4 },
        { id: 10, code: 'CS502', name: 'Cloud Computing', credits: 3 },
        { id: 11, code: 'CS601', name: 'Cybersecurity', credits: 4 },
        { id: 12, code: 'CS602', name: 'Mobile App Development', credits: 3 },
        { id: 13, code: 'CS701', name: 'Big Data Analytics', credits: 4 },
        { id: 14, code: 'CS702', name: 'Internet of Things', credits: 3 },
        { id: 15, code: 'CS801', name: 'Blockchain Technology', credits: 4 }
    ];

    const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
    const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleSubjectSelect = (subject) => {
        if (!selectedSubjects.find(s => s.id === subject.id)) {
            setSelectedSubjects([...selectedSubjects, subject]);
        }
    };

    const handleSubjectRemove = (subject) => {
        setSelectedSubjects(selectedSubjects.filter(s => s.id !== subject.id));
    };

    const handleSaveSubjects = () => {
        console.log('Saving selected subjects:', selectedSubjects);
        // Add your save logic here
    };

    return (
        <div className="assign-subject-container">
            <div className="filters-container">
                <div className="filter-group">
                    <select
                        className="professional-filter"
                        value={filters.program}
                        onChange={(e) => handleFilterChange('program', e.target.value)}
                    >
                        <option value="all">All Programs</option>
                        <option value="degree">Degree</option>
                        <option value="diploma">Diploma</option>
                    </select>

                    <select
                        className="professional-filter"
                        value={filters.batch}
                        onChange={(e) => handleFilterChange('batch', e.target.value)}
                    >
                        <option value="all">All Batches</option>
                        {batches.map(batch => (
                            <option key={batch} value={batch}>{batch}</option>
                        ))}
                    </select>

                    <select
                        className="professional-filter"
                        value={filters.semester}
                        onChange={(e) => handleFilterChange('semester', e.target.value)}
                    >
                        <option value="all">All Semesters</option>
                        {semesters.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="selected-subjects-section">
                <div className="selected-subjects-header">
                    <h3 className='heading1-as' style={{ textAlign: 'left' }}>Selected Subjects</h3>
                    <div className="selected-subjects-stats">
                        <span className="subject-count">Selected: {selectedSubjects.length}</span>
                        <span className="total-credits">
                            Total Credits: {selectedSubjects.reduce((sum, subject) => sum + subject.credits, 0)}
                        </span>
                    </div>
                </div>
                <div className="selected-subjects-container">
                    {selectedSubjects.map(subject => (
                        <div key={subject.id} className="subject-item">
                            <div className="subject-info">
                                <span>{subject.code} - {subject.name} ({subject.credits} credits)</span>
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

            <div className="all-subjects-section">
                <h3 className='heading2-as' style={{ textAlign: 'left' }}>Available Subjects</h3>

                <div className="all-subjects-container">
                    {allSubjects.map(subject => (
                        <div
                            key={subject.id}
                            className="subject-item"
                            onClick={() => handleSubjectSelect(subject)}
                        >
                            <span>{subject.code} - {subject.name}</span>
                            <span className="subject-credits">{subject.credits} credits</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="save-subjects-section">
                <button
                    className="save-subjects-btn"
                    onClick={handleSaveSubjects}
                >
                    Save Selected Subjects
                </button>
            </div>
        </div>
    );
};

export default AssignSubject;