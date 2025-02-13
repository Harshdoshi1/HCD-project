import React, { useState, useEffect } from 'react';

const AssignSubject = () => {
    const [filters, setFilters] = useState({
        program: 'all',
        batch: 'all',
        semester: 'all'
    });

    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
    const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

    // Fetch subjects based on program selection
    const fetchSubjects = async () => {
        if (filters.program === 'all') {
            setAvailableSubjects([]);
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/users/getSubjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ program: filters.program })
            });
            const data = await response.json();
            if (response.ok) {
                setAvailableSubjects(data.subjects);
            } else {
                console.error('Failed to fetch subjects:', data.message);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [filters.program]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleSubjectSelect = (subject) => {
        if (!selectedSubjects.some(s => s.id === subject.id)) {
            setSelectedSubjects([...selectedSubjects, subject]);
        }
    };

    const handleSubjectRemove = (subject) => {
        setSelectedSubjects(selectedSubjects.filter(s => s.id !== subject.id));
    };

    const handleSaveSubjects = async () => {
        if (filters.batch === 'all' || filters.semester === 'all') {
            alert("Please select a valid Batch and Semester.");
            return;
        }

        if (selectedSubjects.length === 0) {
            alert("Please select at least one subject.");
            return;
        }

        try {
            const subjects = selectedSubjects.map(subject => ({
                subjectName: subject.sub_name,
                semesterNumber: filters.semester,
                batchName: filters.batch
            }));

            const response = await fetch('http://localhost:5000/api/users/assignSubject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjects })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Subjects assigned successfully!');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error saving subjects:', error);
            alert('Failed to assign subjects.');
        }
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
                <h3 className='heading1-as'>Selected Subjects</h3>
                <div className="selected-subjects-container">
                    {selectedSubjects.map((subject, index) => (
                        <div key={subject.id || subject.sub_code || index} className="subject-item">
                            <span>{subject.sub_code} - {subject.sub_name} ({subject.sub_credit} credits)</span>
                            <button className="remove-subject-btn" onClick={() => handleSubjectRemove(subject)}>×</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="all-subjects-section">
                <h3 className='heading2-as'>Available Subjects</h3>
                <div className="all-subjects-container">
                    {availableSubjects.length > 0 ? (
                        availableSubjects.map((subject, index) => (
                            <div key={subject.id || subject.sub_code || index} className="subject-item" onClick={() => handleSubjectSelect(subject)}>
                                <span>{subject.sub_code} - {subject.sub_name}</span>
                                <span className="subject-credits">{subject.sub_credit} credits</span>
                            </div>
                        ))
                    ) : (
                        <p>No subjects available for the selected program.</p>
                    )}
                </div>
            </div>

            <div className="save-subjects-section">
                <button className="save-subjects-btn" onClick={handleSaveSubjects}>Save Selected Subjects</button>
            </div>
        </div>
    );
};

export default AssignSubject;
