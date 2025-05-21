import React, { useState, useEffect } from 'react';
import './ManageBatches.css';
import PassStudents from './PassStudents';

const ManageBatches = () => {
    const [batches, setBatches] = useState([]);
    const [newBatch, setNewBatch] = useState({ batchName: '', batchStart: '', batchEnd: '', courseType: '' });
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [semesterToAdd, setSemesterToAdd] = useState({ semesterNumber: '', startDate: '', endDate: '' });
    const [activeTab, setActiveTab] = useState('batch');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPassStudentsModalOpen, setIsPassStudentsModalOpen] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setIsLoading(true);
        try {
            console.log('Fetching batches for ManageBatches component...');
            const response = await fetch('http://localhost:5001/api/batches/getAllBatches');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch batches: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Batches data received:', data);
            
            if (Array.isArray(data) && data.length > 0) {
                // Process the batches to ensure they have consistent property names
                const processedBatches = data.map(batch => ({
                    id: batch.id,
                    batchName: batch.name || batch.batchName,
                    batchStart: batch.start_date || batch.batchStart,
                    batchEnd: batch.end_date || batch.batchEnd,
                    courseType: batch.program || batch.courseType || 'Unknown',
                    current_semester: batch.current_semester || 1,
                    // Add other properties as needed
                    semesters: batch.semesters || [] // Placeholder for semesters
                }));
                console.log('Processed batches:', processedBatches);
                setBatches(processedBatches);
            } else {
                console.warn('No batches found or empty array returned');
                setBatches([]);
            }
        } catch (error) {
            setError(error.message);
            console.error('Error fetching batches:', error);
            alert('Error fetching batches: ' + error.message);
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
            console.log('Adding new batch:', newBatch);
            
            // Create payload with the expected property names
            const batchPayload = {
                batchName: newBatch.batchName.trim(),
                batchStart: newBatch.batchStart,
                batchEnd: newBatch.batchEnd,
                courseType: newBatch.courseType
            };
            
            const response = await fetch('http://localhost:5001/api/batches/addBatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(batchPayload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to add batch: ${errorData.message || response.statusText}`);
            }

            const responseData = await response.json();
            console.log('Batch added successfully:', responseData);
            
            await fetchBatches();
            setNewBatch({ batchName: '', batchStart: '', batchEnd: '', courseType: '' });
            alert('Batch added successfully!');
        } catch (error) {
            setError(error.message);
            alert('Error adding batch: ' + error.message);
            console.error('Error adding batch:', error);
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
            endDate: semesterToAdd.endDate,

        };

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/semesters/addSemester', {
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

    const handleOpenPassStudentsModal = () => {
        setIsPassStudentsModalOpen(true);
    };

    const handleClosePassStudentsModal = () => {
        setIsPassStudentsModalOpen(false);
    };

    return (

        <div className="manage-batches-container">
            <div className="manage-batch-header">
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
                <button
                    className={`tab-button ${activeTab === 'update' ? 'active' : ''}`}
                    onClick={handleOpenPassStudentsModal}
                >
                    Update Semester
                </button>
            </div>

            <div className="tab-container">

                <div className="tab-content">
                    {activeTab === 'batch' && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Create New Batch</h2>
                                <p className="card-description">Add a new batch for your academic program</p>
                            </div>
                            <div className="card-content form-container">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    <div className="form-group" style={{ flex: '1' }}>
                                        <label htmlFor="batchName">Batch Name</label>
                                        <input
                                            id="batchName"
                                            className="input"
                                            placeholder="e.g., BTech 2023-27"
                                            value={newBatch.batchName}
                                            onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group" style={{ flex: '1' }}>
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

                                    <div className="form-group" style={{ flex: '1' }}>
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

                                    <div className="form-group" style={{ flex: '1' }}>
                                        <label htmlFor="courseType">Course Type</label>
                                        <input
                                            id="courseType"
                                            className="input"
                                            placeholder="e.g., BTech, MTech, PhD"
                                            value={newBatch.courseType}
                                            onChange={(e) => setNewBatch({ ...newBatch, courseType: e.target.value })}
                                        />
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
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    <div className="form-group" style={{ flex: '1' }}>
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

                                    <div className="form-group" style={{ flex: '1' }}>
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

                                    <div className="form-group" style={{ flex: '1' }}>
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

                                    <div className="form-group" style={{ flex: '1' }}>
                                        <label htmlFor="batchSelect">Select Batch</label>
                                        <select
                                            id="batchSelect"
                                            className="select"
                                            onChange={(e) => {
                                                const selectedId = e.target.value;
                                                const foundBatch = batches.find(batch => batch.id === selectedId);
                                                console.log('Selected batch:', foundBatch);
                                                setSelectedBatch(foundBatch);
                                            }}
                                        >
                                            <option value="">Select a batch</option>
                                            {batches.map(batch => (
                                                <option key={batch.id} value={batch.id}>
                                                    {batch.batchName} ({batch.courseType})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="card-footer">
                                        <button
                                            onClick={handleAddSemester}
                                            disabled={isLoading}
                                            style={{ flex: '0 0 auto' }}
                                            className="button primary-button"
                                        >
                                            Add Semester
                                        </button>
                                    </div>
                                </div>
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
                            <div key={batch.id} className="batch-card">
                                <div className="batch-card-header">
                                    <h3 className="batch-title">{batch.batchName}</h3>
                                </div>
                                <div className="batch-card-content">
                                    <p><strong>Type:</strong> {batch.courseType}</p>
                                    <p><strong>Duration:</strong> {formatDate(batch.batchStart)} - {formatDate(batch.batchEnd)}</p>
                                    <p><strong>Current Semester:</strong> {batch.current_semester}</p>
                                    
                                    <button 
                                        className="button secondary-button"
                                        style={{ marginTop: '10px' }}
                                        onClick={() => {
                                            setSelectedBatch(batch);
                                            setActiveTab('semester');
                                            document.getElementById('semesterTab').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        Add Semester
                                    </button>

                                    {batch.semesters && batch.semesters.length > 0 ? (
                                        <div className="semester-list">
                                            <h4>Semesters:</h4>
                                            <ul>
                                                {batch.semesters.map((semester) => (
                                                    <li key={semester.id || semester.semesterNumber} className="semester-item">
                                                        <span className="semester-number">Semester {semester.semester_number || semester.semesterNumber}</span>
                                                        <span className="semester-dates">
                                                            {formatDate(semester.start_date || semester.startDate)} - 
                                                            {formatDate(semester.end_date || semester.endDate)}
                                                        </span>
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
            {/* PassStudents Modal */}
            <PassStudents 
                isOpen={isPassStudentsModalOpen} 
                onClose={handleClosePassStudentsModal} 
            />
        </div>
    );
};

export default ManageBatches;