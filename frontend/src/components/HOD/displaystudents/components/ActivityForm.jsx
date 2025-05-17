import React, { useState, useEffect } from 'react';
import './ActivityForm.css';

const ActivityForm = ({ formType, activity, onSubmit, onClose, isEdit, currentSemester, activityType }) => {
    const [formData, setFormData] = useState({
        enrollmentNumber: '',
        semester: currentSemester || 1,
        activityName: '',
        achievementLevel: '',
        date: '',
        description: '',
        certificateUrl: '',
        score: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (activity && isEdit) {
            setFormData({
                enrollmentNumber: activity.enrollmentNumber || '',
                semester: activity.semester || currentSemester || 1,
                activityName: activity.activityName || activity.title || '',
                achievementLevel: activity.achievementLevel || activity.achievement || '',
                date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : '',
                description: activity.description || '',
                certificateUrl: activity.certificateUrl || '',
                score: activity.score || ''
            });
        } else {
            setFormData(prev => ({
                ...prev,
                semester: currentSemester || 1
            }));
        }
    }, [activity, isEdit, currentSemester]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'semester' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Prepare the data for API call
            const data = {
                enrollmentNumber: formData.enrollmentNumber,
                semesterId: formData.semester,
                activityName: formData.activityName,
                achievementLevel: formData.achievementLevel,
                date: new Date(formData.date).toISOString(),
                description: formData.description,
                certificateUrl: formData.certificateUrl,
                score: formData.score || 0
            };

            // Determine the API endpoint based on formType
            let apiUrl = '';
            if (formType === 'co-curricular') {
                apiUrl = 'http://localhost:5001/api/students/cocurricular/';
            } else if (formType === 'extra-curricular') {
                apiUrl = 'http://localhost:5001/api/students/extracurricular/';
            } else {
                throw new Error('Invalid form type specified');
            }

            // Add ID if editing
            if (isEdit && activity?.id) {
                apiUrl += activity.id;
            }

            // Make API call
            const response = await fetch(apiUrl, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'add'} activity`);
            }

            const responseData = await response.json();

            // Call the onSubmit callback with the response data
            onSubmit(responseData.data || responseData);
        } catch (error) {
            console.error(`Error ${isEdit ? 'updating' : 'adding'} activity:`, error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Determine form title based on formType and isEdit
    const getFormTitle = () => {
        if (formType === 'co-curricular') {
            return isEdit ? 'Edit Co-Curricular Activity' : 'Add New Co-Curricular Activity';
        } else if (formType === 'extra-curricular') {
            return isEdit ? 'Edit Extra-Curricular Activity' : 'Add New Extra-Curricular Activity';
        }
        return isEdit ? 'Edit Activity' : 'Add New Activity';
    };

    return (
        <div className="activity-form-overlay">
            <div className="activity-form-container">
                <div className="form-header">
                    <h3>{getFormTitle()}</h3>
                    <button className="close-form-button" onClick={onClose}>×</button>
                </div>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="activity-form">
                    <div className="form-grid">
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
                            <label>Score</label>
                            <input
                                type="number"
                                name="score"
                                value={formData.score}
                                onChange={handleChange}
                                required
                                min="0"
                                max="100"
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
                        <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Update Activity' : 'Add Activity')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivityForm;