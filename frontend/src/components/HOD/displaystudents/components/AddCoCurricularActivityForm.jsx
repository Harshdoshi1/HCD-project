import React, { useState } from 'react';

const AddCoCurricularActivityForm = ({ activity, onClose, onSubmit, semesterId }) => {
    const [formData, setFormData] = useState({
        activityName: activity ? activity.activityName : '',
        achievementLevel: activity ? activity.achievementLevel : '',
        date: activity ? activity.date : '',
        description: activity ? activity.description : '',
        certificateUrl: activity ? activity.certificateUrl : '',
        score: activity ? activity.score : '',
        enrollmentNumber: activity ? activity.enrollmentNumber : '92200133017'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/students/cocurricular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    semesterId: Number(semesterId) || null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add co-curricular activity');
            }

            const data = await response.json();
            onSubmit(data);
            onClose();
        } catch (error) {
            console.error('Error adding co-curricular activity:', error);
            alert(error.message || 'Failed to add co-curricular activity. Please try again.');
        }
    };

    return (
        <div className="activity-form-overlay">
            <div className="activity-form">
                <h2>{activity ? 'Edit' : 'Add'} Co-Curricular Activity</h2>
                <form onSubmit={handleSubmit}>
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
                            required
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
                        />
                    </div>

                    <div className="form-group">
                        <label>Certificate URL</label>
                        <input
                            type="url"
                            name="certificateUrl"
                            value={formData.certificateUrl}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Score</label>
                        <input
                            type="number"
                            name="score"
                            value={formData.score}
                            onChange={handleChange}
                        />
                    </div>

                    <input
                        type="hidden"
                        name="enrollmentNumber"
                        value={formData.enrollmentNumber}
                    />

                    <div className="form-buttons">
                        <button type="submit" className="submit-btn">
                            {activity ? 'Update' : 'Add'} Activity
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCoCurricularActivityForm;
