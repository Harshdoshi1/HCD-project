// import React, { useState, useEffect } from 'react';
// import './ManageBatches.css';

// const ManageBatches = () => {
//     const [batches, setBatches] = useState([]);
//     const [newBatch, setNewBatch] = useState({ name: '', semester: { startDate: '', endDate: '' } });
//     const [selectedBatch, setSelectedBatch] = useState(null);
//     const [semesterToAdd, setSemesterToAdd] = useState({ startDate: '', endDate: '', name: 'Sem 1' });
//     const [showAddBatch, setShowAddBatch] = useState(false);
//     const [showAddSemester, setShowAddSemester] = useState(false);
//     const [semesterCount, setSemesterCount] = useState(1);
//     const [selectedSemester, setSelectedSemester] = useState('1');

//     useEffect(() => {
//         fetchBatches();
//     }, []);

//     const fetchBatches = async () => {
//         const fetchedBatches = await fetch('/api/batches');
//         setBatches(await fetchedBatches.json());
//     };

//     const handleAddBatch = () => {
//         const batchWithSemester = {
//             ...newBatch,
//             semester: [{ ...semesterToAdd, name: `Sem ${semesterCount}` }],
//             startDate: semesterToAdd.startDate
//         };

//         setBatches([...batches, batchWithSemester]);
//         setNewBatch({ name: '', semester: { startDate: '', endDate: '' } });
//         setSemesterToAdd({ startDate: '', endDate: '', name: 'Sem 1' });
//         setSemesterCount(semesterCount + 1);
//         setShowAddBatch(false);
//     };

//     const handleAddSemester = () => {
//         if (selectedBatch) {
//             const updatedBatches = batches.map(batch => {
//                 if (batch.name === selectedBatch.name) {
//                     return { ...batch, semester: [...batch.semester, { ...semesterToAdd, name: `Sem ${selectedSemester}` }] };
//                 }
//                 return batch;
//             });
//             setBatches(updatedBatches);
//             setSelectedBatch(null);
//             setSemesterToAdd({ startDate: '', endDate: '', name: 'Sem 1' });
//             setShowAddSemester(false);
//         }
//     };

//     const handleCancel = () => {
//         setNewBatch({ name: '', semester: { startDate: '', endDate: '' } });
//         setSemesterToAdd({ startDate: '', endDate: '', name: 'Sem 1' });
//         setShowAddBatch(false);
//         setShowAddSemester(false);
//     };

//     return (
//         <div className="manage-batches">
//             <h2>Manage Batches</h2>
//             <div className="buttons-container">
//                 <button onClick={() => { setShowAddBatch(true); setShowAddSemester(false); }}>Add Batch</button>
//                 <button onClick={() => { setShowAddBatch(false); setShowAddSemester(true); }}>Add Semester</button>
//             </div>

//             {showAddBatch && (
//                 <div className="add-section">
//                     <div className="headigsfordt">
//                         <h3>Add New Batch</h3>
//                         <p>Enter starting date of semester 1</p>
//                         <p>Enter ending date of semester 1</p>
//                     </div>
//                     <div className="form-row">
//                         <input
//                             type="text"
//                             placeholder="Batch Name"
//                             value={newBatch.name}
//                             onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
//                         />
//                         {semesterToAdd.startDate && semesterToAdd.endDate && (
//                             <p className="info-text">Starting Date of Sem 1: {semesterToAdd.startDate}, Ending Date: {semesterToAdd.endDate}</p>
//                         )}
//                         <input
//                             type="date"
//                             value={semesterToAdd.startDate}
//                             onChange={(e) => setSemesterToAdd({ ...semesterToAdd, startDate: e.target.value })}
//                         />
//                         <input
//                             type="date"
//                             value={semesterToAdd.endDate}
//                             onChange={(e) => setSemesterToAdd({ ...semesterToAdd, endDate: e.target.value })}
//                         />
//                     </div>
//                     <div className="form-actions">
//                         <button onClick={handleAddBatch}>Add Batch</button>
//                         <button className="cancel" onClick={handleCancel}>Cancel</button>
//                     </div>
//                 </div>
//             )}

//             {showAddSemester && (
//                 <div className="add-section">
//                     <div className="headigsfordt">
//                         <h3>Add Semester to Existing Batch</h3>
//                         <p className='stdate'>Enter starting date of new semester</p>
//                         <p>Enter ending date of new semester</p>
//                     </div>
//                     <div className="form-row">
//                         <select onChange={(e) => setSelectedBatch(batches.find(batch => batch.name === e.target.value))}>
//                             <option>Select Batch</option>
//                             {batches.map(batch => <option key={batch.name} value={batch.name}>{batch.name}</option>)}
//                         </select>
//                         <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
//                             {[...Array(8).keys()].map(num => (
//                                 <option key={num + 1} value={num + 1}>{num + 1}</option>
//                             ))}
//                         </select>
//                         <input
//                             type="date"
//                             value={semesterToAdd.startDate}
//                             onChange={(e) => setSemesterToAdd({ ...semesterToAdd, startDate: e.target.value })}
//                         />
//                         <input
//                             type="date"
//                             value={semesterToAdd.endDate}
//                             onChange={(e) => setSemesterToAdd({ ...semesterToAdd, endDate: e.target.value })}
//                         />
//                     </div>
//                     <div className="form-actions">
//                         <button onClick={handleAddSemester}>Add Semester</button>
//                         <button className="cancel" onClick={handleCancel}>Cancel</button>
//                     </div>
//                 </div>
//             )}

//             <div className="past-batches">
//                 <h3>Past Batches</h3>
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Batch Name</th>
//                             <th>Semester</th>
//                             <th>Start Date</th>
//                             <th>End Date</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {batches.map(batch => batch.semester.map((sem, index) => (
//                             <tr key={`${batch.name}-sem-${index}`}>
//                                 <td>{batch.name}</td>
//                                 <td>{sem.name}</td>
//                                 <td>{sem.startDate}</td>
//                                 <td>{sem.endDate}</td>
//                             </tr>
//                         )))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default ManageBatches;

import React, { useState, useEffect } from 'react';
import './ManageBatches.css';

const ManageBatches = () => {
    const [batches, setBatches] = useState([]);
    const [newBatch, setNewBatch] = useState({ batchName: '', batchStart: '', batchEnd: '', courseType: '' });
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [semesterToAdd, setSemesterToAdd] = useState({ semesterNumber: '', startDate: '', endDate: '' });
    const [showAddBatch, setShowAddBatch] = useState(false);
    const [showAddSemester, setShowAddSemester] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/users/getAllBatches');
            if (!response.ok) throw new Error('Failed to fetch batches');
            const data = await response.json();
            setBatches(data);
        } catch (error) {
            setError(error.message);
            console.error(error);
        }
    };

    const handleAddBatch = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/users/addBatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBatch)
            });
            if (!response.ok) throw new Error('Failed to add batch');

            await fetchBatches();
            setNewBatch({ batchName: '', batchStart: '', batchEnd: '', courseType: '' });
            setShowAddBatch(false);
        } catch (error) {
            setError(error.message);
            console.error(error);
        }
    };

    const handleAddSemester = async () => {
        if (!selectedBatch) {
            setError('Please select a batch first');
            return;
        }

        const semesterData = {
            batchName: selectedBatch.batchName,
            semesterNumber: semesterToAdd.semesterNumber,
            startDate: semesterToAdd.startDate,
            endDate: semesterToAdd.endDate
        };

        try {
            const response = await fetch('http://localhost:5001/api/users/addSemester', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(semesterData)
            });
            if (!response.ok) throw new Error('Failed to add semester');

            await fetchBatches();
            setSelectedBatch(null);
            setSemesterToAdd({ semesterNumber: '', startDate: '', endDate: '' });
            setShowAddSemester(false);
        } catch (error) {
            setError(error.message);
            console.error(error);
        }
    };

    const handleCancel = () => {
        setNewBatch({ batchName: '', batchStart: '', batchEnd: '', courseType: '' });
        setSemesterToAdd({ semesterNumber: '', startDate: '', endDate: '' });
        setShowAddBatch(false);
        setShowAddSemester(false);
        setError(null);
    };

    return (
        <div className="manage-batches">
            <h2>Manage Batches</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="buttons-container">
                <button onClick={() => { setShowAddBatch(true); setShowAddSemester(false); }}>Add Batch</button>
                <button onClick={() => { setShowAddBatch(false); setShowAddSemester(true); }}>Add Semester</button>
            </div>

            {showAddBatch && (
                <div className="add-section">
                    <h3>Add New Batch</h3>
                    <input type="text" placeholder="Batch Name" value={newBatch.batchName} onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })} />
                    <input type="date" value={newBatch.batchStart} onChange={(e) => setNewBatch({ ...newBatch, batchStart: e.target.value })} />
                    <input type="date" value={newBatch.batchEnd} onChange={(e) => setNewBatch({ ...newBatch, batchEnd: e.target.value })} />
                    <input type="text" placeholder="Course Type" value={newBatch.courseType} onChange={(e) => setNewBatch({ ...newBatch, courseType: e.target.value })} />
                    <button onClick={handleAddBatch}>Add Batch</button>
                    <button className="cancel" onClick={handleCancel}>Cancel</button>
                </div>
            )}

            {showAddSemester && (
                <div className="add-section">
                    <h3>Add Semester to Existing Batch</h3>
                    <select onChange={(e) => setSelectedBatch(batches.find(batch => batch.batchName === e.target.value) || null)}>
                        <option value="">Select Batch</option>
                        {batches.map(batch => <option key={batch.batchName} value={batch.batchName}>{batch.batchName}</option>)}
                    </select>
                    <input type="number" placeholder="Semester Number" value={semesterToAdd.semesterNumber} onChange={(e) => setSemesterToAdd({ ...semesterToAdd, semesterNumber: e.target.value })} />
                    <input type="date" value={semesterToAdd.startDate} onChange={(e) => setSemesterToAdd({ ...semesterToAdd, startDate: e.target.value })} />
                    <input type="date" value={semesterToAdd.endDate} onChange={(e) => setSemesterToAdd({ ...semesterToAdd, endDate: e.target.value })} />
                    <button onClick={handleAddSemester}>Add Semester</button>
                    <button className="cancel" onClick={handleCancel}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default ManageBatches;