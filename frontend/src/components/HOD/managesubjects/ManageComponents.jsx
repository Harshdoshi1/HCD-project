// import React, { useState } from 'react';
// const ManageComponents = ({ selectedSubject }) => {
//     const [programType, setProgramType] = useState('degree');
//     const [selectedBatch, setSelectedBatch] = useState('');
//     const [selectedSemester, setSelectedSemester] = useState('');
//     const [selectedSubjectLocal, setSelectedSubjectLocal] = useState('');
//     const [components, setComponents] = useState({
//         ESE: 0,
//         CSE: 0,
//         IA: 0,
//         TW: 0,
//         Viva: 0
//     });
//     const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
//     const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
//     const subjects = [
//         { id: 1, name: 'Mathematics I', code: 'MAT101' },
//         { id: 2, name: 'Physics', code: 'PHY101' },
//         // Add more subjects as needed
//     ];
//     const handleWeightageChange = (component, value) => {
//         setComponents(prev => ({
//             ...prev,
//             [component]: parseInt(value) || 0
//         }));
//     };
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         // Implement your save logic here
//         console.log('Saving components:', components);
//     };
//     const totalWeightage = Object.values(components).reduce((sum, value) => sum + value, 0);
//     return (
//         <div className="manage-components">
//             <div className="component-selection-panel">
//                 <div className="selection-group">
//                     <label>Program Type:</label>
//                     <select value={programType} onChange={(e) => setProgramType(e.target.value)}>
//                         <option value="degree">Degree</option>
//                         <option value="diploma">Diploma</option>
//                     </select>
//                 </div>
//                 <div className="selection-group">
//                     <label>Batch:</label>
//                     <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
//                         <option value="">Select Batch</option>
//                         {batches.map(batch => (
//                             <option key={batch} value={batch}>{batch}</option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className="selection-group">
//                     <label>Semester:</label>
//                     <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
//                         <option value="">Select Semester</option>
//                         {semesters.map(sem => (
//                             <option key={sem} value={sem}>Semester {sem}</option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className="selection-group">
//                     <label>Subject:</label>
//                     <select value={selectedSubjectLocal} onChange={(e) => setSelectedSubjectLocal(e.target.value)}>
//                         <option value="">Select Subject</option>
//                         {subjects.map(subject => (
//                             <option key={subject.id} value={subject.id}>
//                                 {subject.name} ({subject.code})
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//             </div>
//             <form onSubmit={handleSubmit} className="components-form">
//                 <div className="components-grid">
//                     {Object.entries(components).map(([component, weightage]) => (
//                         <div key={component} className="component-card">
//                             <h3>{component}</h3>
//                             <div className="weightage-input">
//                                 <label>Weightage (%):</label>
//                                 <input
//                                     type="number"
//                                     min="0"
//                                     max="100"
//                                     value={weightage}
//                                     onChange={(e) => handleWeightageChange(component, e.target.value)}
//                                 />
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//                 <div className="total-weightage">
//                     Total Weightage: {totalWeightage}%
//                     {totalWeightage !== 100 && (
//                         <span className="weightage-warning">
//                             (Total weightage must be 100%)
//                         </span>
//                     )}
//                 </div>
//                 <button
//                     type="submit"
//                     className="save-button"
//                     disabled={totalWeightage !== 100}
//                 >
//                     Save Components
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default ManageComponents;


import React, { useState } from 'react';

const ManageComponents = ({ selectedSubject }) => {
    const [filters, setFilters] = useState({
        program: '',
        batch: '',
        semester: '',
        subject: ''
    });

    const [components, setComponents] = useState({
        ESE: { weightage: 0, enabled: true },
        CSE: { weightage: 0, enabled: true },
        IA: { weightage: 0, enabled: true },
        TW: { weightage: 0, enabled: true },
        Viva: { weightage: 0, enabled: true }
    });

    const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
    const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());
    const subjects = ['CS101', 'CS102', 'CS103']; // Replace with actual subjects

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleWeightageChange = (component, value) => {
        setComponents(prev => ({
            ...prev,
            [component]: { ...prev[component], weightage: parseInt(value) || 0 }
        }));
    };

    const handleComponentToggle = (component) => {
        setComponents(prev => ({
            ...prev,
            [component]: { ...prev[component], enabled: !prev[component].enabled }
        }));
    };

    const getTotalWeightage = () => {
        return Object.values(components).reduce((total, comp) =>
            total + (comp.enabled ? comp.weightage : 0), 0
        );
    };

    const handleSave = () => {
        const totalWeightage = getTotalWeightage();
        if (totalWeightage !== 100) {
            alert('Total weightage must equal 100%');
            return;
        }

        // Save logic here
        alert('Components saved successfully!');
    };

    return (
        <div className="manage-components">
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

                <div className="filter-group">
                    <label>Subject:</label>
                    <select
                        value={filters.subject}
                        onChange={(e) => handleFilterChange('subject', e.target.value)}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="components-section">
                {Object.entries(components).map(([name, component]) => (
                    <div key={name} className="component-item">
                        <div className="component-header">
                            <label className="component-label">
                                <input
                                    type="checkbox"
                                    checked={component.enabled}
                                    onChange={() => handleComponentToggle(name)}
                                />
                                {name}
                            </label>
                        </div>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={component.weightage}
                            onChange={(e) => handleWeightageChange(name, e.target.value)}
                            disabled={!component.enabled}
                            className="weightage-input"
                        />
                        <span className="percentage">%</span>
                    </div>
                ))}

                <div className="total-weightage">
                    Total Weightage: {getTotalWeightage()}%
                </div>

                <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={getTotalWeightage() !== 100}
                >
                    Save Components
                </button>
            </div>
        </div>
    );
};

export default ManageComponents;