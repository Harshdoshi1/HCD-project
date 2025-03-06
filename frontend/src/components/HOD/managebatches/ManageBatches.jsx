
import React, { useState, useEffect } from 'react';
import './ManageBatches.css';

const ManageBatches = () => {
    const [batches, setBatches] = useState([]);
    const [newBatch, setNewBatch] = useState({ batchName: '', batchStart: '', batchEnd: '', courseType: '' });
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [semesterToAdd, setSemesterToAdd] = useState({ semesterNumber: '', startDate: '', endDate: '' });
    const [activeTab, setActiveTab] = useState('batch');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/users/getAllBatches');
            if (!response.ok) throw new Error('Failed to fetch batches');
            const data = await response.json();
            setBatches(data);
        } catch (error) {
            setError(error.message);
            alert('Error fetching batches: ' + error.message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBatch = async () => {
        // Validation
        if (!newBatch.batchName || !newBatch.batchStart || !newBatch.batchEnd || !newBatch.courseType) {
            setError('Please fill all the required fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/users/addBatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBatch)
            });
            if (!response.ok) throw new Error('Failed to add batch');

            await fetchBatches();
            setNewBatch({ batchName: '', batchStart: '', batchEnd: '', courseType: '' });
            alert('Batch added successfully!');
        } catch (error) {
            setError(error.message);
            alert('Error adding batch: ' + error.message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSemester = async () => {
        if (!selectedBatch) {
            setError('Please select a batch first');
            return;
        }

        if (!semesterToAdd.semesterNumber || !semesterToAdd.startDate || !semesterToAdd.endDate) {
            setError('Please fill all the required fields');
            return;
        }

        const semesterData = {
            batchName: selectedBatch.batchName,
            semesterNumber: semesterToAdd.semesterNumber,
            startDate: semesterToAdd.startDate,
            endDate: semesterToAdd.endDate
        };

        setIsLoading(true);
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
            alert('Semester added successfully!');
        } catch (error) {
            setError(error.message);
            alert('Error adding semester: ' + error.message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="manage-batches-container">
            <div className="header-section">
                <h4 className="page-title">Batch Management</h4>
            </div>

            <div className="tab-container">
                <div className="tab-list">
                    <button
                        className={`tab-button ${activeTab === 'batch' ? 'active' : ''}`}
                        onClick={() => setActiveTab('batch')}
                    >
                        Add New Batch
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'semester' ? 'active' : ''}`}
                        onClick={() => setActiveTab('semester')}
                    >
                        Add Semester
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'batch' && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Create New Batch</h2>
                                <p className="card-description">Add a new batch for your academic program</p>
                            </div>
                            <div className="card-content form-container">
                                <div className="form-group">
                                    <label htmlFor="batchName">Batch Name</label>
                                    <input
                                        id="batchName"
                                        className="input"
                                        placeholder="e.g., BTech 2023-27"
                                        value={newBatch.batchName}
                                        onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="batchStart">Start Date</label>
                                        <div className="date-input-wrapper">
                                            <input
                                                id="batchStart"
                                                className="input date-input"
                                                type="date"
                                                value={newBatch.batchStart}
                                                onChange={(e) => setNewBatch({ ...newBatch, batchStart: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="batchEnd">End Date</label>
                                        <div className="date-input-wrapper">
                                            <input
                                                id="batchEnd"
                                                className="input date-input"
                                                type="date"
                                                value={newBatch.batchEnd}
                                                onChange={(e) => setNewBatch({ ...newBatch, batchEnd: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="courseType">Course Type</label>
                                    <input
                                        id="courseType"
                                        className="input"
                                        placeholder="e.g., BTech, MTech, PhD"
                                        value={newBatch.courseType}
                                        onChange={(e) => setNewBatch({ ...newBatch, courseType: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="card-footer">
                                <button
                                    onClick={handleAddBatch}
                                    disabled={isLoading}
                                    className="button primary-button"
                                >
                                    Add Batch
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'semester' && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Add Semester to Batch</h2>
                                <p className="card-description">Create a new semester for an existing batch</p>
                            </div>
                            <div className="card-content form-container">
                                <div className="form-group">
                                    <label htmlFor="batchSelect">Select Batch</label>
                                    <select
                                        id="batchSelect"
                                        className="select"
                                        onChange={(e) => setSelectedBatch(batches.find(batch => batch.batchName === e.target.value) || null)}
                                    >
                                        <option value="">Select a batch</option>
                                        {batches.map(batch => (
                                            <option key={batch.batchName} value={batch.batchName}>
                                                {batch.batchName} ({batch.courseType})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedBatch && (
                                    <div className="selected-batch-info">
                                        <p><strong>Selected Batch:</strong> {selectedBatch.batchName}</p>
                                        <p><strong>Course:</strong> {selectedBatch.courseType}</p>
                                        <p><strong>Duration:</strong> {formatDate(selectedBatch.batchStart)} to {formatDate(selectedBatch.batchEnd)}</p>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="semesterNumber">Semester Number</label>
                                    <input
                                        id="semesterNumber"
                                        className="input"
                                        type="number"
                                        placeholder="e.g., 1, 2, 3"
                                        value={semesterToAdd.semesterNumber}
                                        onChange={(e) => setSemesterToAdd({ ...semesterToAdd, semesterNumber: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="semesterStart">Start Date</label>
                                        <div className="date-input-wrapper">
                                            <input
                                                id="semesterStart"
                                                className="input date-input"
                                                type="date"
                                                value={semesterToAdd.startDate}
                                                onChange={(e) => setSemesterToAdd({ ...semesterToAdd, startDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="semesterEnd">End Date</label>
                                        <div className="date-input-wrapper">
                                            <input
                                                id="semesterEnd"
                                                className="input date-input"
                                                type="date"
                                                value={semesterToAdd.endDate}
                                                onChange={(e) => setSemesterToAdd({ ...semesterToAdd, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button
                                    onClick={handleAddSemester}
                                    disabled={isLoading}
                                    className="button primary-button"
                                >
                                    Add Semester
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {batches.length > 0 && (
                <div className="batches-list-container">
                    <h2 className="section-title">Current Batches</h2>
                    <div className="batches-grid">
                        {batches.map((batch) => (
                            <div key={batch.batchName} className="batch-card">
                                <div className="batch-card-header">
                                    <h3 className="batch-title">{batch.batchName}</h3>
                                    {/* <p className="batch-subtitle">{batch.courseType}</p> */}
                                </div>
                                <div className="batch-card-content">
                                    <p><strong>Duration:</strong> {formatDate(batch.batchStart)} - {formatDate(batch.batchEnd)}</p>

                                    {batch.semesters && batch.semesters.length > 0 ? (
                                        <div className="semester-list">
                                            <h4>Semesters:</h4>
                                            <ul>
                                                {batch.semesters.map((semester) => (
                                                    <li key={semester.semesterNumber} className="semester-item">
                                                        <span className="semester-number">Semester {semester.semesterNumber}</span>
                                                        <span className="semester-dates">{formatDate(semester.startDate)} - {formatDate(semester.endDate)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="no-semesters">No semesters added yet</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBatches;