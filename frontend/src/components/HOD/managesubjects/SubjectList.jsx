// import React, { useState } from 'react';

// const SubjectList = ({ onSelectSubject }) => {
//     const [programType, setProgramType] = useState('all');
//     const [selectedBatch, setSelectedBatch] = useState('all');
//     const [selectedSemester, setSelectedSemester] = useState('all');

//     // Sample data - replace with your actual data
//     const subjects = [
//         { id: 1, name: 'Mathematics I', code: 'MAT101', program: 'degree', batch: '2022-2026', semester: 1 },
//         { id: 2, name: 'Physics', code: 'PHY101', program: 'degree', batch: '2022-2026', semester: 2 },
//         { id: 3, name: 'Programming Fundamentals', code: 'CSE101', program: 'diploma', batch: '2021-2025', semester: 1 },
//         // Add more subjects as needed
//     ];

//     const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
//     const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

//     const filteredSubjects = subjects.filter(subject => {
//         return (programType === 'all' || subject.program === programType) &&
//             (selectedBatch === 'all' || subject.batch === selectedBatch) &&
//             (selectedSemester === 'all' || subject.semester === parseInt(selectedSemester));
//     });

//     return (
//         <div className="subject-list">
//             <div className="filters">
//                 <div className="filter-group">
//                     <label>Program Type:</label>
//                     <select value={programType} onChange={(e) => setProgramType(e.target.value)}>
//                         <option value="all">All Programs</option>
//                         <option value="degree">Degree</option>
//                         <option value="diploma">Diploma</option>
//                     </select>
//                 </div>

//                 <div className="filter-group">
//                     <label>Batch:</label>
//                     <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
//                         <option value="all">All Batches</option>
//                         {batches.map(batch => (
//                             <option key={batch} value={batch}>{batch}</option>
//                         ))}
//                     </select>
//                 </div>

//                 <div className="filter-group">
//                     <label>Semester:</label>
//                     <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
//                         <option value="all">All Semesters</option>
//                         {semesters.map(sem => (
//                             <option key={sem} value={sem}>Semester {sem}</option>
//                         ))}
//                     </select>
//                 </div>
//             </div>

//             <div className="subjects-grid">
//                 {filteredSubjects.map(subject => (
//                     <div
//                         key={subject.id}
//                         className="subject-card"
//                         onClick={() => onSelectSubject(subject)}
//                     >
//                         <h3>{subject.name}</h3>
//                         <p>Code: {subject.code}</p>
//                         <p>Semester: {subject.semester}</p>
//                         <p>Batch: {subject.batch}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default SubjectList;

import React, { useState } from 'react';

const SubjectList = ({ onSelectSubject }) => {
    const [filters, setFilters] = useState({
        program: 'all',
        batch: 'all',
        semester: 'all'
    });

    // Sample data - replace with your actual data
    const subjects = [
        { id: 1, code: 'CS101', name: 'Introduction to Programming', program: 'degree', batch: '2022-2026', semester: '1' },
        { id: 2, code: 'CS102', name: 'Data Structures', program: 'degree', batch: '2022-2026', semester: '2' },
        { id: 3, code: 'DIP101', name: 'Digital Electronics', program: 'diploma', batch: '2021-2024', semester: '1' },
        // Add more subjects as needed
    ];

    const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
    const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const filteredSubjects = subjects.filter(subject => {
        return (filters.program === 'all' || subject.program === filters.program) &&
            (filters.batch === 'all' || subject.batch === filters.batch) &&
            (filters.semester === 'all' || subject.semester === filters.semester);
    });

    return (
        <div className="subject-list">
            <div className="filters-section">
                <div className="filter-group">
                    <label>Program:</label>
                    <select
                        value={filters.program}
                        onChange={(e) => handleFilterChange('program', e.target.value)}
                    >
                        <option value="all">All Programs</option>
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
                        <option value="all">All Batches</option>
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
                        <option value="all">All Semesters</option>
                        {semesters.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="subjects-grid">
                {filteredSubjects.map(subject => (
                    <div
                        key={subject.id}
                        className="subject-card"
                        onClick={() => onSelectSubject(subject)}
                    >
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