import './Subject.css'
import React, { useState } from 'react';
// import { saveAssignedSubjects } from '../../../services/subjectService';

const AssignSubject = ({ selectedSubject }) => {
    const [filters, setFilters] = useState({
        program: '',
        batch: '',
        semester: ''
    });
    const [availableSubjects, setAvailableSubjects] = useState([
        { id: 1, code: 'CS101', name: 'Introduction to Programming' },
        { id: 2, code: 'CS102', name: 'Data Structures' },
        { id: 3, code: 'CS103', name: 'Database Management' },
        // Add more subjects as needed
    ]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
    const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleSubjectSelect = (subject) => {
        if (!selectedSubjects.some(s => s.id === subject.id)) {
            setSelectedSubjects([...selectedSubjects, subject]);
            setAvailableSubjects(availableSubjects.filter(s => s.id !== subject.id));
        }
    };

    const handleSubjectRemove = (subject) => {
        setSelectedSubjects(selectedSubjects.filter(s => s.id !== subject.id));
        setAvailableSubjects([...availableSubjects, subject]);
    };

    const handleSave = async () => {
        if (!filters.program || !filters.batch || !filters.semester) {
            alert('Please select program, batch and semester before saving');
            return;
        }

        try {
            await saveAssignedSubjects({
                program: filters.program,
                batch: filters.batch,
                semester: filters.semester,
                subjects: selectedSubjects.map(s => s.id)
            });
            alert('Subjects saved successfully!');
            // Clear selection after save
            setSelectedSubjects([]);
        } catch (error) {
            alert('Failed to save subjects. Please try again.');
        }
    };

    return (
        <div className="assign-subject">
            <div className="filters-section-assign-subjects">
                <div className="filter-group">
                    <label>Program:</label>
                    <select
                        value={filters.program}
                        onChange={(e) => handleFilterChange('program', e.target.value)}
                    >
                        <option value="">Select Program</option>
                        <option value="degree">Degree</option>
                        <option value="diploma">Diploma</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Batch:</label>
                    <select
                        value={filters.batch}
                        onChange={(e) => handleFilterChange('batch', e.target.value)}
                    >
                        <option value="">Select Batch</option>
                        {batches.map(batch => (
                            <option key={batch} value={batch}>{batch}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Semester:</label>
                    <select
                        value={filters.semester}
                        onChange={(e) => handleFilterChange('semester', e.target.value)}
                    >
                        <option value="">Select Semester</option>
                        {semesters.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="save-section">
                <button 
                    className="save-button"
                    onClick={handleSave}
                    disabled={selectedSubjects.length === 0}
                >
                    Save Selected Subjects
                </button>
            </div>

            <div className="subjects-containers">
                <div className="container-section">
                    <h3>Available Subjects</h3>
                    <div className="subjects-list">
                        {availableSubjects.map(subject => (
                            <div
                                key={subject.id}
                                className="subject-item"
                                onClick={() => handleSubjectSelect(subject)}
                            >
                                <div className="subject-code">{subject.code}</div>
                                <div className="subject-name">{subject.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="container-section">
                    <h3>Selected Subjects</h3>
                    <div className="subjects-list selected">
                        {selectedSubjects.map(subject => (
                            <div
                                key={subject.id}
                                className="subject-item selected"
                            >
                                <div className="subject-code">{subject.code}</div>
                                <div className="subject-name">{subject.name}</div>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleSubjectRemove(subject)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignSubject;