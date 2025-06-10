import React, { useState, useEffect } from 'react';
import './ManageBatches.css';
import PassStudents from './PassStudents';

const ManageBatches = () => {
    const [batches, setBatches] = useState([]);
    const [newBatch, setNewBatch] = useState({ batchName: '', batchStart: '', batchEnd: '', courseType: '' });
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [semesterToAdd, setSemesterToAdd] = useState({
        semesterNumber: '',
        startDate: '',
        endDate: '',
        numberOfClasses: ''
    });
    const [classDetails, setClassDetails] = useState([]);
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
            const response = await fetch('http://localhost:5001/api/batches/getAllBatches');
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
            const response = await fetch('http://localhost:5001/api/batches/addBatch', {
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

        // Validate class names if classes are being added
        if (semesterToAdd.numberOfClasses > 0) {
            const classNames = classDetails.map(detail => detail.className);
            const uniqueClassNames = new Set(classNames);
            if (classNames.length !== uniqueClassNames.size) {
                setError('Duplicate class names are not allowed');
                return;
            }
            if (classNames.some(name => !name.trim())) {
                setError('All classes must have a name');
                return;
            }
        }

        const semesterData = {
            batchName: selectedBatch.batchName,
            semesterNumber: semesterToAdd.semesterNumber,
            startDate: semesterToAdd.startDate,
            endDate: semesterToAdd.endDate,
        };

        setIsLoading(true);
        try {
            // First create the semester
            const semesterResponse = await fetch('http://localhost:5001/api/semesters/addSemester', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(semesterData)
            });

            if (!semesterResponse.ok) {
                const errorData = await semesterResponse.json();
                throw new Error(errorData.message || 'Failed to add semester');
            }

            const semesterResult = await semesterResponse.json();

            // If classes are specified, create them
            if (semesterToAdd.numberOfClasses > 0 && classDetails.length > 0) {
                const classesData = {
                    semesterId: semesterResult.id,
                    classes: classDetails.map(classDetail => ({
                        className: classDetail.className,
                        numberOfStudents: 0 // Default value, can be updated later
                    }))
                };

                const classesResponse = await fetch('http://localhost:5001/api/classes/createMultipleClasses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(classesData)
                });

                if (!classesResponse.ok) {
                    const errorData = await classesResponse.json();
                    throw new Error(errorData.message || 'Failed to add classes');
                }
            }

            await fetchBatches();
            setSelectedBatch(null);
            setSemesterToAdd({ semesterNumber: '', startDate: '', endDate: '', numberOfClasses: '' });
            setClassDetails([]);
            alert('Semester and classes added successfully!');
        } catch (error) {
            setError(error.message);
            alert('Error: ' + error.message);
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

    const handleNumberOfClassesChange = (e) => {
        const numClasses = parseInt(e.target.value) || 0;
        setSemesterToAdd({ ...semesterToAdd, numberOfClasses: numClasses });

        // Initialize class details array with empty objects
        const newClassDetails = Array(numClasses).fill().map((_, index) => ({
            className: '',
            file: null
        }));
        setClassDetails(newClassDetails);
    };

    const handleClassDetailChange = (index, field, value) => {
        const newClassDetails = [...classDetails];
        newClassDetails[index] = {
            ...newClassDetails[index],
            [field]: value
        };
        setClassDetails(newClassDetails);
    };

    const handleFileUpload = (index, file) => {
        handleClassDetailChange(index, 'file', file);
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

                                    <div className="form-group" style={{ flex: '1' }}>
                                        <label htmlFor="numberOfClasses">Number of Classes</label>
                                        <input
                                            id="numberOfClasses"
                                            className="input"
                                            type="number"
                                            min="1"
                                            placeholder="Enter number of classes"
                                            value={semesterToAdd.numberOfClasses}
                                            onChange={handleNumberOfClassesChange}
                                        />
                                    </div>
                                </div>

                                {semesterToAdd.numberOfClasses > 0 && (
                                    <div className="class-details-container">
                                        <h3 className="class-details-title">Class Details</h3>
                                        <div className="class-details-grid">
                                            {classDetails.map((classDetail, index) => (
                                                <div key={index} className="class-detail-card">
                                                    <div className="form-group">
                                                        <label htmlFor={`className-${index}`}>Class Name</label>
                                                        <input
                                                            id={`className-${index}`}
                                                            className="input"
                                                            placeholder={`e.g., Class ${String.fromCharCode(65 + index)}`}
                                                            value={classDetail.className}
                                                            onChange={(e) => handleClassDetailChange(index, 'className', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor={`file-${index}`}>Student List (Excel)</label>
                                                        <div className="file-upload-container">
                                                            <input
                                                                id={`file-${index}`}
                                                                type="file"
                                                                accept=".xlsx,.xls"
                                                                onChange={(e) => handleFileUpload(index, e.target.files[0])}
                                                                className="file-input"
                                                            />
                                                            <button className="upload-button">
                                                                {classDetail.file ? classDetail.file.name : 'Upload Excel'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
            {/* PassStudents Modal */}
            <PassStudents
                isOpen={isPassStudentsModalOpen}
                onClose={handleClosePassStudentsModal}
            />
        </div>
    );
};

export default ManageBatches;