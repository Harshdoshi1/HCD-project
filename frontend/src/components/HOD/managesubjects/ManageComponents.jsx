// import React, { useState } from 'react';
// import './Subject.css';

// const ManageComponents = ({ selectedSubject }) => {
//     const [filters, setFilters] = useState({
//         program: 'all',
//         batch: 'all',
//         semester: 'all'
//     });
//     const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
//     const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

//     const [selectedSubjects, setSelectedSubjects] = useState([]);

//     const handleFilterChange = (filterType, value) => {
//         setFilters(prev => ({ ...prev, [filterType]: value }));
//     };

//     const [totalWeightage, setTotalWeightage] = useState(0);
//     const [weightages, setWeightages] = useState({
//         CA: 0,
//         ESE: 0,
//         IA: 0,
//         TW: 0,
//         VIVA: 0,
//     });
//     const allSubjects = [
//         { id: 1, code: 'CS101', name: 'Introduction to Programming', credits: 4 },
//         { id: 2, code: 'CS102', name: 'Data Structures', credits: 4 },
//         { id: 3, code: 'CS201', name: 'Database Management Systems', credits: 3 },
//         { id: 4, code: 'CS202', name: 'Operating Systems', credits: 4 },
//         { id: 5, code: 'CS301', name: 'Computer Networks', credits: 3 },
//         { id: 6, code: 'CS302', name: 'Software Engineering', credits: 4 },
//         { id: 7, code: 'CS401', name: 'Artificial Intelligence', credits: 3 },
//         { id: 8, code: 'CS402', name: 'Web Development', credits: 4 },
//         { id: 9, code: 'CS501', name: 'Machine Learning', credits: 4 },
//         { id: 10, code: 'CS502', name: 'Cloud Computing', credits: 3 },
//         { id: 11, code: 'CS601', name: 'Cybersecurity', credits: 4 },
//         { id: 12, code: 'CS602', name: 'Mobile App Development', credits: 3 },
//         { id: 13, code: 'CS701', name: 'Big Data Analytics', credits: 4 },
//         { id: 14, code: 'CS702', name: 'Internet of Things', credits: 3 },
//         { id: 15, code: 'CS801', name: 'Blockchain Technology', credits: 4 }
//     ];
//     const handleWeightageChange = (component, value) => {
//         const newValue = parseInt(value) || 0;
//         setWeightages(prev => {
//             const updated = { ...prev, [component]: newValue };
//             const total = Object.values(updated).reduce((a, b) => a + b, 0);
//             setTotalWeightage(total);
//             return updated;
//         });
//     };

//     const handleSave = () => {
//         if (totalWeightage !== 100) {
//             alert('Total weightage must equal 100%');
//             return;
//         }
//         // Add save logic here
//         console.log('Saving components...', weightages);
//         alert('Components saved successfully!');
//     };

//     return (
//         <div className="manage-weightage-container">

//             <div className="filters-container">
//                 <div className="filter-group">
//                     <select
//                         className="professional-filter"
//                         value={filters.program}
//                         onChange={(e) => handleFilterChange('program', e.target.value)}
//                     >
//                         <option value="all">All Programs</option>
//                         <option value="degree">Degree</option>
//                         <option value="diploma">Diploma</option>
//                     </select>

//                     <select
//                         className="professional-filter"
//                         value={filters.batch}
//                         onChange={(e) => handleFilterChange('batch', e.target.value)}
//                     >
//                         <option value="all">All Batches</option>
//                         {batches.map(batch => (
//                             <option key={batch} value={batch}>{batch}</option>
//                         ))}
//                     </select>

//                     <select
//                         className="professional-filter"
//                         value={filters.semester}
//                         onChange={(e) => handleFilterChange('semester', e.target.value)}
//                     >
//                         <option value="all">All Semesters</option>
//                         {semesters.map(sem => (
//                             <option key={sem} value={sem}>Semester {sem}</option>
//                         ))}
//                     </select>
//                 </div>
//             </div>

//             <div className="weightage-header">
//                 <h3>Manage Component Weightage</h3>
//                 <span className="total-weightage">Total: {totalWeightage}%</span>
//             </div>
//             <table className="weightage-table">
//                 <thead>
//                     <tr>
//                         <th>Component</th>
//                         <th>Weightage (%)</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     <tr>
//                         <td>Continuous Assessment (CA)</td>
//                         <td>
//                             <input
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 className="weightage-input"
//                                 value={weightages.CA}
//                                 onChange={(e) => handleWeightageChange('CA', e.target.value)}
//                             />
//                         </td>
//                     </tr>
//                     <tr>
//                         <td>End Semester Exam (ESE)</td>
//                         <td>
//                             <input
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 className="weightage-input"
//                                 value={weightages.ESE}
//                                 onChange={(e) => handleWeightageChange('ESE', e.target.value)}
//                             />
//                         </td>
//                     </tr>
//                     <tr>
//                         <td>Internal Assessment (IA)</td>
//                         <td>
//                             <input
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 className="weightage-input"
//                                 value={weightages.IA}
//                                 onChange={(e) => handleWeightageChange('IA', e.target.value)}
//                             />
//                         </td>
//                     </tr>
//                     <tr>
//                         <td>Term Work (TW)</td>
//                         <td>
//                             <input
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 className="weightage-input"
//                                 value={weightages.TW}
//                                 onChange={(e) => handleWeightageChange('TW', e.target.value)}
//                             />
//                         </td>
//                     </tr>
//                     <tr>
//                         <td>Viva</td>
//                         <td>
//                             <input
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 className="weightage-input"
//                                 value={weightages.VIVA}
//                                 onChange={(e) => handleWeightageChange('VIVA', e.target.value)}
//                             />
//                         </td>
//                     </tr>
//                 </tbody>
//             </table>
//             <button
//                 className="save-weightage-btn"
//                 onClick={handleSave}
//                 disabled={totalWeightage !== 100}
//             >
//                 Save Weightage
//             </button>
//         </div>
//     );
// };

// export default ManageComponents;

import React, { useState } from 'react';
import './Subject.css';

const ManageComponents = ({ selectedSubject }) => {
    const [filters, setFilters] = useState({
        program: 'all',
        batch: 'all',
        semester: 'all',
        subject: 'all'
    });
    const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
    const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const [totalWeightage, setTotalWeightage] = useState(0);
    const [weightages, setWeightages] = useState({
        CA: 0,
        ESE: 0,
        IA: 0,
        TW: 0,
        VIVA: 0,
    });
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
    const handleWeightageChange = (component, value) => {
        const newValue = parseInt(value) || 0;
        setWeightages(prev => {
            const updated = { ...prev, [component]: newValue };
            const total = Object.values(updated).reduce((a, b) => a + b, 0);
            setTotalWeightage(total);
            return updated;
        });
    };

    const handleSave = () => {
        if (totalWeightage !== 100) {
            alert('Total weightage must equal 100%');
            return;
        }
        // Add save logic here
        console.log('Saving components...', weightages);
        alert('Components saved successfully!');
    };

    return (
        <div className="manage-weightage-container">

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

                    <select
                        className="professional-filter"
                        value={filters.subject}
                        onChange={(e) => handleFilterChange('subject', e.target.value)}
                    >
                        <option value="all">All Subjects</option>
                        {allSubjects.map(subject => (
                            <option key={subject.id} value={subject.code}>{subject.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="weightage-header">
                <h3>Manage Component Weightage</h3>
                <span className="total-weightage">Total: {totalWeightage}%</span>
            </div>
            <table className="weightage-table">
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Weightage (%)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Continuous Assessment (CA)</td>
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="weightage-input"
                                value={weightages.CA}
                                onChange={(e) => handleWeightageChange('CA', e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>End Semester Exam (ESE)</td>
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="weightage-input"
                                value={weightages.ESE}
                                onChange={(e) => handleWeightageChange('ESE', e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Internal Assessment (IA)</td>
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="weightage-input"
                                value={weightages.IA}
                                onChange={(e) => handleWeightageChange('IA', e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Term Work (TW)</td>
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="weightage-input"
                                value={weightages.TW}
                                onChange={(e) => handleWeightageChange('TW', e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Viva</td>
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="weightage-input"
                                value={weightages.VIVA}
                                onChange={(e) => handleWeightageChange('VIVA', e.target.value)}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            <button
                className="save-weightage-btn"
                onClick={handleSave}
                disabled={totalWeightage !== 100}
            >
                Save Weightage
            </button>
        </div>
    );
};

export default ManageComponents;
