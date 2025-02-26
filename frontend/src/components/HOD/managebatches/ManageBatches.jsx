import React, { useState, useEffect } from 'react';
import './ManageBatches.css';

const ManageBatches = () => {
    const [batches, setBatches] = useState([]);
    const [newBatch, setNewBatch] = useState({ name: '', semester: { startDate: '', endDate: '' } });
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [semesterToAdd, setSemesterToAdd] = useState({ startDate: '', endDate: '' });
    const [showAddBatch, setShowAddBatch] = useState(false);  // Initially false, no form shown
    const [showAddSemester, setShowAddSemester] = useState(false);  // Initially false, no form shown
    const [semesterCount, setSemesterCount] = useState(1);  // Tracks the number of semesters for new batch

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        const fetchedBatches = await fetch('/api/batches');
        setBatches(await fetchedBatches.json());
    };

    const handleAddBatch = () => {
        // Ensure the first semester's start date is used for the batch
        const batchWithSemester = {
            ...newBatch,
            semester: { ...semesterToAdd, name: `Sem ${semesterCount}` },
            startDate: semesterToAdd.startDate // Set the start date of the first semester as the batch start date
        };

        setBatches([...batches, batchWithSemester]);
        setNewBatch({ name: '', semester: { startDate: '', endDate: '' } });
        setSemesterToAdd({ startDate: '', endDate: '' });
        setSemesterCount(semesterCount + 1);
        setShowAddBatch(false); // Close the add batch form after submission
    };

    const handleAddSemester = () => {
        if (selectedBatch) {
            const updatedBatches = batches.map(batch => {
                if (batch.name === selectedBatch.name) {
                    const semesterName = `Sem ${batch.semester.length + 1}`;
                    return { ...batch, semester: [...batch.semester, { ...semesterToAdd, name: semesterName }] };
                }
                return batch;
            });
            setBatches(updatedBatches);
            setSelectedBatch(null);
            setSemesterToAdd({ startDate: '', endDate: '' });
            setShowAddSemester(false); // Close the add semester form after submission
        }
    };

    const handleCancel = () => {
        setNewBatch({ name: '', semester: { startDate: '', endDate: '' } });
        setSemesterToAdd({ startDate: '', endDate: '' });
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
                    <h3>Add New Batch</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Batch Name"
                            value={newBatch.name}
                            onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                        />
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
                    <h3>Add Semester to Existing Batch</h3>
                    <div className="form-row">
                        <select onChange={(e) => setSelectedBatch(batches.find(batch => batch.name === e.target.value))}>
                            <option>Select Batch</option>
                            {batches.map(batch => <option key={batch.name} value={batch.name}>{batch.name}</option>)}
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
