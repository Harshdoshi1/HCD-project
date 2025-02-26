// import React, { useState, useEffect } from 'react';

// const SubjectList = ({ onSelectSubject, showAddForm, setShowAddForm }) => {
//     const [filters, setFilters] = useState({
//         program: 'degree',
//         batch: 'all',
//         semester: 'all'
//     });
//     const [subjects, setSubjects] = useState([]);
//     const [newSubject, setNewSubject] = useState({
//         name: '',
//         code: '',
//         courseType: 'degree',
//         credits: '',
//         subjectType: 'central'
//     });

//     const batches = ['2022-2026', '2021-2025', '2020-2024', '2019-2023'];
//     const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

//     const fetchSubjects = async () => {
//         if (filters.program === 'all') {
//             setSubjects([]);
//             return;
//         }

//         try {
//             const response = await fetch('http://localhost:5001/api/users/getSubjects', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     program: filters.program,
//                 })
//             });

//             const data = await response.json();
//             if (response.ok) {
//                 setSubjects(data.subjects);
//             } else {
//                 console.error('Failed to fetch subjects:', data.message);
//             }
//         } catch (error) {
//             console.error('Error fetching subjects:', error);
//         }
//     };

//     useEffect(() => {
//         fetchSubjects();
//     }, [filters.program, filters.batch, filters.semester]);

//     const handleFilterChange = (filterType, value) => {
//         setFilters(prev => ({ ...prev, [filterType]: value }));
//     };

//     const handleAddSubject = async () => {
//         try {
//             const response = await fetch('http://localhost:5001/api/users/addSubject', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(newSubject)
//             });

//             if (response.ok) {
//                 setShowAddForm(false);
//                 fetchSubjects();
//             } else {
//                 console.error('Failed to add subject:', response.statusText);
//             }
//         } catch (error) {
//             console.error('Error adding subject:', error);
//         }
//     };

//     const handleChange = (e) => {
//         handleFilterChange(e.target.name, e.target.value);
//     };

//     return (
//         <div className="subject-list">
//             <div className="filters-container-display-subject-list">
//                 <select className="professional-filter ds" name="program" value={filters.program} onChange={handleChange} required>
//                     <option value="all">All Programs</option>
//                     <option value="degree">Degree</option>
//                     <option value="diploma">Diploma</option>
//                 </select>
//                 <select className="professional-filter ds" name="batch" value={filters.batch} onChange={handleChange} required>
//                     <option value="all">Batch</option>
//                     {batches.map((batch, index) => (
//                         <option key={batch} value={batch}>{batch}</option>
//                     ))}
//                 </select>
//                 <select className="professional-filter ds" name="semester" value={filters.semester} onChange={handleChange} required>
//                     <option value="all">Semester</option>
//                     {semesters.map((sem, index) => (
//                         <option key={sem} value={sem}>Semester {sem}</option>
//                     ))}
//                 </select>
//             </div>

//             {showAddForm && (
//                 <div className="subject-modal">
//                     <div className="modal-overlay" onClick={() => setShowAddForm(false)} />
//                     <div className="modal-content">
//                         <div className="modal-header">
//                             <h3>Create New Subject</h3>
//                             <button onClick={() => setShowAddForm(false)}>&times;</button>
//                         </div>
//                         <div className="modal-body">
//                             <input type="text" placeholder="Subject Name" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} />
//                             <input type="text" placeholder="Subject Code" value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} />
//                             <select value={newSubject.courseType} onChange={(e) => setNewSubject({ ...newSubject, courseType: e.target.value })}>
//                                 <option value="degree">Degree Course</option>
//                                 <option value="diploma">Diploma Course</option>
//                             </select>
//                             <select value={newSubject.subjectType} onChange={(e) => setNewSubject({ ...newSubject, subjectType: e.target.value })}>
//                                 <option value="central">Central Subject</option>
//                                 <option value="departmental">Departmental Subject</option>
//                             </select>
//                             <input type="number" placeholder="Credits" value={newSubject.credits} onChange={(e) => setNewSubject({ ...newSubject, credits: e.target.value })} />
//                         </div>
//                         <div className="modal-footer">
//                             <button className="modal-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
//                             <button className="modal-confirm" onClick={handleAddSubject}>Save Changes</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <div className="subjects-grid">
//                 {subjects.length > 0 ? (
//                     subjects.map(subject => (
//                         <div key={subject.sub_code} style={{ padding: '1px' }} className="subject-card" onClick={() => onSelectSubject(subject)}>
//                             <div style={{ marginTop: '10px' }} className="subject-code">{subject.sub_code}</div>
//                             <div className="subject-name">{subject.sub_name}</div>
//                             <div className="subject-details">
//                                 <span>{filters.program}</span>
//                                 {/* <span>{filters.batch !== 'all' ? filters.batch : 'Alxl Batches'}</span> */}
//                                 <span>{filters.semester !== 'all' ? `Semester ${filters.semester}` : 'All Semesters'}</span>
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <p className="no-subjects">No subjects found for the selected filters.</p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default SubjectList;

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
            <div className="filters-container-subject-list">
                <select name="program" className='professional-filter' value={filters.program} onChange={(e) => handleFilterChange('program', e.target.value)}>
                    <option value="all">All Programs</option>
                    <option value="degree">Degree</option>
                    <option value="diploma">Diploma</option>
                </select>
                <select name="batch" className='professional-filter' value={filters.batch} onChange={(e) => handleFilterChange('batch', e.target.value)}>
                    <option value="all">Batch</option>
                    {batches.map(batch => <option key={batch.id} value={batch.batchName}>{batch.batchName}</option>)}
                </select>
                <select name="semester" className='professional-filter' value={filters.semester} onChange={(e) => handleFilterChange('semester', e.target.value)}>
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