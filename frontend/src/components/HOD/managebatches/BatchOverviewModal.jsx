import React, { useState, useEffect } from 'react';
import './BatchOverviewModal.css';
import { buildUrl } from '../../../utils/apiConfig';

const BatchOverviewModal = ({ isOpen, onClose, batch }) => {
    const [batchInfo, setBatchInfo] = useState(null);
    const [semesterData, setSemesterData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && batch) {
            fetchSemesterWiseBatchInfo();
        }
    }, [isOpen, batch]);

    const fetchSemesterWiseBatchInfo = async () => {
        if (!batch) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(buildUrl(`/class-sections/getSemesterWiseBatchInfo/${encodeURIComponent(batch.batchName)}`));
            if (!response.ok) {
                throw new Error('Failed to fetch batch information');
            }

            const data = await response.json();
            setBatchInfo(data);
            setSemesterData(data.semesters || []);
        } catch (error) {
            console.error('Error fetching semester-wise batch info:', error);
            setError(error.message);
            // Fallback to dummy data if API fails
            setSemesterData(generateDummyData());
        } finally {
            setIsLoading(false);
        }
    };

    // Generate dummy data for demonstration (fallback)
    const generateDummyData = () => {
        const semesters = batch?.semesters || [];
        return semesters.map((semester, index) => {
            const numClasses = Math.floor(Math.random() * 4) + 1; // 1-4 classes
            const studentsPerClass = Math.floor(Math.random() * 20) + 30; // 30-50 students per class
            const totalStudents = numClasses * studentsPerClass;

            return {
                semesterNumber: semester.semesterNumber,
                startDate: semester.startDate,
                endDate: semester.endDate,
                totalStudents,
                totalClasses: numClasses,
                studentsPerClass,
                classes: Array.from({ length: numClasses }, (_, i) => ({
                    name: `Class ${String.fromCharCode(65 + i)}`,
                    students: studentsPerClass
                }))
            };
        });
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

    // Calculate total batch statistics
    const calculateBatchStats = () => {
        if (!semesterData.length) return { totalStudents: 0, totalClasses: 0, averageStudentsPerClass: 0 };

        const totalStudents = semesterData.reduce((sum, semester) => sum + semester.totalStudents, 0);
        const totalClasses = semesterData.reduce((sum, semester) => sum + semester.totalClasses, 0);
        const averageStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

        return { totalStudents, totalClasses, averageStudentsPerClass };
    };

    const batchStats = calculateBatchStats();

    if (!isOpen || !batch) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Batch Overview: {batch.batchName}</h2>
                    <button className="modal-close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="batch-summary">
                        <div className="summary-item">
                            <span className="summary-label">Course Type:</span>
                            <span className="summary-value">{batch.courseType}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Duration:</span>
                            <span className="summary-value">
                                {formatDate(batch.batchStart)} - {formatDate(batch.batchEnd)}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Total Semesters:</span>
                            <span className="summary-value">{semesterData.length}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Total Classes:</span>
                            <span className="summary-value">{batchStats.totalClasses}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Total Students:</span>
                            <span className="summary-value">{batchStats.totalStudents}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Avg Students/Class:</span>
                            <span className="summary-value">{batchStats.averageStudentsPerClass}</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-message">
                            <p>Loading batch information...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <p>Error loading data: {error}</p>
                            <p>Showing dummy data for demonstration.</p>
                        </div>
                    ) : null}

                    {semesterData.length > 0 ? (
                        <div className="semester-overview">
                            <h3 className="overview-title">Semester-wise Distribution</h3>
                            <div className="table-container">
                                <table className="overview-table">
                                    <thead>
                                        <tr>
                                            <th>Semester</th>
                                            <th>Duration</th>
                                            <th>Total Students</th>
                                            <th>Total Classes</th>
                                            <th>Students per Class</th>
                                            <th>Class Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {semesterData.map((semester, index) => (
                                            <tr key={index}>
                                                <td className="semester-cell">
                                                    <strong>Semester {semester.semesterNumber}</strong>
                                                </td>
                                                <td className="duration-cell">
                                                    {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                                                </td>
                                                <td className="students-cell">
                                                    <span className="student-count">{semester.totalStudents}</span>
                                                </td>
                                                <td className="classes-cell">
                                                    <span className="class-count">{semester.totalClasses}</span>
                                                </td>
                                                <td className="per-class-cell">
                                                    <span className="per-class-count">{semester.studentsPerClass}</span>
                                                </td>
                                                <td className="details-cell">
                                                    <div className="class-details">
                                                        {semester.classes.length > 0 ? (
                                                            semester.classes.map((cls, clsIndex) => (
                                                                <div key={clsIndex} className="class-detail-item">
                                                                    <span className="class-name">{cls.name}</span>
                                                                    <span className="class-students">({cls.students} students)</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="no-classes">No classes configured</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="no-data-message">
                            <p>No semesters have been added to this batch yet.</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="button secondary-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BatchOverviewModal; 