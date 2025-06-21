import React from 'react';
import './BatchOverviewModal.css';

const BatchOverviewModal = ({ isOpen, onClose, batch }) => {
    if (!isOpen || !batch) return null;

    // Generate dummy data for demonstration
    const generateDummyData = () => {
        const semesters = batch.semesters || [];
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

    const semesterData = generateDummyData();

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
                    </div>

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
                                                        {semester.classes.map((cls, clsIndex) => (
                                                            <div key={clsIndex} className="class-detail-item">
                                                                <span className="class-name">{cls.name}</span>
                                                                <span className="class-students">({cls.students} students)</span>
                                                            </div>
                                                        ))}
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