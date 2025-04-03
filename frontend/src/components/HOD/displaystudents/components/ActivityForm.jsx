import React, { useState, useEffect } from 'react';
import './ActivityForm.css';

const ActivityForm = ({ activity, onSubmit, onClose, isEdit, currentSemester, activityType }) => {
    const [formData, setFormData] = useState({
        enrollmentNumber: '',
        semester: currentSemester || 1,
        activityName: '',
        achievementLevel: '',
        date: '',
        description: '',
        certificateUrl: ''
    });

    useEffect(() => {
        if (activity && isEdit) {
            setFormData({
                enrollmentNumber: activity.enrollmentNumber || '',
                semester: activity.semester || currentSemester || 1,
                activityName: activity.activityName || '',
                achievementLevel: activity.achievementLevel || '',
                date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : '',
                description: activity.description || '',
                certificateUrl: activity.certificateUrl || ''
            });
        } else {
            setFormData(prev => ({
                ...prev,
                semester: currentSemester || 1
            }));
        }
    }, [activity, isEdit, currentSemester]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            id: activity?.id || Date.now().toString(),
            type: activityType || (activity?.type || '')
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'semester' ? parseInt(value) : value
        }));
    };

    return (
        <div className="activity-form-overlay">
            <div className="activity-form-container">
                <div className="form-header">
                    <h3>{isEdit ? 'Edit Extra-Curricular Activity' : 'Add Extra-Curricular Activity'}</h3>
                    <button className="close-form-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="activity-form">
                    <div className="form-grid">
                        {/* First Column */}
                        <div className="form-group">
                            <label>Enrollment Number</label>
                            <input
                                type="text"
                                name="enrollmentNumber"
                                value={formData.enrollmentNumber}
                                onChange={handleChange}
                                required
                                placeholder="Enter student's enrollment number"
                                disabled={isEdit}
                            />
                        </div>
                        <div className="form-group">
                            <label>Semester</label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Semester</option>
                                {[...Array(8)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Semester {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Activity Name</label>
                            <input
                                type="text"
                                name="activityName"
                                value={formData.activityName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Second Column */}
                        <div className="form-group">
                            <label>Achievement Level</label>
                            <input
                                type="text"
                                name="achievementLevel"
                                value={formData.achievementLevel}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                            />
                        </div>
                        <div className="form-group">
                            <label>Certificate URL</label>
                            <input
                                type="text"
                                name="certificateUrl"
                                value={formData.certificateUrl}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                            {isEdit ? 'Update Activity' : 'Add Activity'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivityForm;
