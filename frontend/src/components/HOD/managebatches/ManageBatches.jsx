import React, { useState, useEffect } from 'react';
import './ManageBatches.css';

const ManageBatches = () => {
    const [batches, setBatches] = useState([]);
    const [newBatch, setNewBatch] = useState({ name: '', semester: { startDate: '', endDate: '' } });
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [semesterToAdd, setSemesterToAdd] = useState({ startDate: '', endDate: '', name: 'Sem 1' });
    const [showAddBatch, setShowAddBatch] = useState(false);
    const [showAddSemester, setShowAddSemester] = useState(false);
    const [semesterCount, setSemesterCount] = useState(1);
    const [selectedSemester, setSelectedSemester] = useState('1');

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        const fetchedBatches = await fetch('/api/batches');
        setBatches(await fetchedBatches.json());
    };

    const handleAddBatch = () => {
        const batchWithSemester = {
            ...newBatch,
            semester: [{ ...semesterToAdd, name: `Sem ${semesterCount}` }],
            startDate: semesterToAdd.startDate
        };

        setBatches([...batches, batchWithSemester]);
        setNewBatch({ name: '', semester: { startDate: '', endDate: '' } });
        setSemesterToAdd({ startDate: '', endDate: '', name: 'Sem 1' });
        setSemesterCount(semesterCount + 1);
        setShowAddBatch(false);
    };

    const handleAddSemester = () => {
        if (selectedBatch) {
            const updatedBatches = batches.map(batch => {
                if (batch.name === selectedBatch.name) {
                    return { ...batch, semester: [...batch.semester, { ...semesterToAdd, name: `Sem ${selectedSemester}` }] };
                }
                return batch;
            });
            setBatches(updatedBatches);
            setSelectedBatch(null);
            setSemesterToAdd({ startDate: '', endDate: '', name: 'Sem 1' });
            setShowAddSemester(false);
        }
    };

    const handleCancel = () => {
        setNewBatch({ name: '', semester: { startDate: '', endDate: '' } });
        setSemesterToAdd({ startDate: '', endDate: '', name: 'Sem 1' });
        setShowAddBatch(false);
        setShowAddSemester(false);
    };

    return (
        <div className="manage-batches">
            <h2>Manage Batches</h2>
            <div className="buttons-container">
                <button onClick={() => { setShowAddBatch(true); setShowAddSemester(false); }}>Add Batch</button>
                <button onClick={() => { setShowAddBatch(false); setShowAddSemester(true); }}>Add Semester</button>
            </div>

            {showAddBatch && (
                <div className="add-section">
                    <div className="headigsfordt">
                        <h3>Add New Batch</h3>
                        <p>Enter starting date of semester 1</p>
                        <p>Enter ending date of semester 1</p>
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Batch Name"
                            value={newBatch.name}
                            onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                        />
                        {semesterToAdd.startDate && semesterToAdd.endDate && (
                            <p className="info-text">Starting Date of Sem 1: {semesterToAdd.startDate}, Ending Date: {semesterToAdd.endDate}</p>
                        )}
                        <input
                            type="date"
                            value={semesterToAdd.startDate}
                            onChange={(e) => setSemesterToAdd({ ...semesterToAdd, startDate: e.target.value })}
                        />
                        <input
                            type="date"
                            value={semesterToAdd.endDate}
                            onChange={(e) => setSemesterToAdd({ ...semesterToAdd, endDate: e.target.value })}
                        />
                    </div>
                    <div className="form-actions">
                        <button onClick={handleAddBatch}>Add Batch</button>
                        <button className="cancel" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            )}

            {showAddSemester && (
                <div className="add-section">
                    <div className="headigsfordt">
                        <h3>Add Semester to Existing Batch</h3>
                        <p className='stdate'>Enter starting date of new semester</p>
                        <p>Enter ending date of new semester</p>
                    </div>
                    <div className="form-row">
                        <select onChange={(e) => setSelectedBatch(batches.find(batch => batch.name === e.target.value))}>
                            <option>Select Batch</option>
                            {batches.map(batch => <option key={batch.name} value={batch.name}>{batch.name}</option>)}
                        </select>
                        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                            {[...Array(8).keys()].map(num => (
                                <option key={num + 1} value={num + 1}>{num + 1}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={semesterToAdd.startDate}
                            onChange={(e) => setSemesterToAdd({ ...semesterToAdd, startDate: e.target.value })}
                        />
                        <input
                            type="date"
                            value={semesterToAdd.endDate}
                            onChange={(e) => setSemesterToAdd({ ...semesterToAdd, endDate: e.target.value })}
                        />
                    </div>
                    <div className="form-actions">
                        <button onClick={handleAddSemester}>Add Semester</button>
                        <button className="cancel" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="past-batches">
                <h3>Past Batches</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Batch Name</th>
                            <th>Semester</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batches.map(batch => batch.semester.map((sem, index) => (
                            <tr key={`${batch.name}-sem-${index}`}>
                                <td>{batch.name}</td>
                                <td>{sem.name}</td>
                                <td>{sem.startDate}</td>
                                <td>{sem.endDate}</td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageBatches;
