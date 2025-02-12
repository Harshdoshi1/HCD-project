// import React, { useState } from 'react';
// import './AssignSubject.css';

// const AssignSubject = () => {
//     const [programType, setProgramType] = useState('degree');
//     const [selectedBatch, setSelectedBatch] = useState('');
//     const [selectedSemester, setSelectedSemester] = useState('');
//     const [selectedSubjects, setSelectedSubjects] = useState([]);

//     const subjects = [
//         { id: 1, name: 'Mathematics I', code: 'MAT101' },
//         { id: 2, name: 'Physics', code: 'PHY101' },
//         { id: 3, name: 'Chemistry', code: 'CHE101' },
//         { id: 4, name: 'Biology', code: 'BIO101' },
//         { id: 5, name: 'Computer Science', code: 'CS101' }
//     ];

//     const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
//     const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

//     const toggleAssignment = (subject) => {
//         setSelectedSubjects((prev) =>
//             prev.find((s) => s.id === subject.id)
//                 ? prev.filter((s) => s.id !== subject.id)
//                 : [...prev, subject]
//         );
//     };

//     return (
//         <div className="assign-subject-container">
//             <div className="filter-panel">
//                 <div className="filter-group">
//                     <label>Program Type:</label>
//                     <select value={programType} onChange={(e) => setProgramType(e.target.value)}>
//                         <option value="degree">Degree</option>
//                         <option value="diploma">Diploma</option>
//                     </select>
//                 </div>
//                 <div className="filter-group">
//                     <label>Batch:</label>
//                     <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
//                         <option value="">Select Batch</option>
//                         {batches.map((batch) => (
//                             <option key={batch} value={batch}>{batch}</option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className="filter-group">
//                     <label>Semester:</label>
//                     <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
//                         <option value="">Select Semester</option>
//                         {semesters.map((sem) => (
//                             <option key={sem} value={sem}>Semester {sem}</option>
//                         ))}
//                     </select>
//                 </div>
//             </div>

//             <div className="selected-filters">
//                 <h3>Selected Filters</h3>
//                 <p>{programType} | {selectedBatch || 'Select Batch'} | Semester {selectedSemester || 'Select Semester'}</p>
//             </div>

//             <div className="selected-subjects">
//                 <h3>Selected Subjects</h3>
//                 <div className="subject-list">
//                     {selectedSubjects.length > 0 ? (
//                         selectedSubjects.map((subject) => (
//                             <div key={subject.id} className="subject-card selected" onClick={() => toggleAssignment(subject)}>
//                                 <h4>{subject.name}</h4>
//                                 <p>Code: {subject.code}</p>
//                             </div>
//                         ))
//                     ) : (
//                         <p>No subjects selected.</p>
//                     )}
//                 </div>
//             </div>

//             <div className="all-subjects">
//                 <h3>All Available Subjects</h3>
//                 <div className="subject-list">
//                     {subjects.map((subject) => (
//                         <div key={subject.id} className="subject-card" onClick={() => toggleAssignment(subject)}>
//                             <h4>{subject.name}</h4>
//                             <p>Code: {subject.code}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AssignSubject;


import React, { useState } from 'react';

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

    return (
        <div className="assign-subject">
            <div className="filters-section">
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