import React, { useState } from 'react';
import './AddCoCurricularActivityForm.css';

const AddCoCurricularActivityForm = ({ activity, onClose, onSubmit, semesterId }) => {
    const [formData, setFormData] = useState({
        enrollmentNumber: '',
        semesterId: semesterId || '',
        activityName: '',
        achievementLevel: '',
        date: '',
        description: '',
        certificateUrl: '',
        score: ''
    });


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5001/api/students/cocurricular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit activity');
            }

            const result = await response.json();
            console.log('Activity submitted successfully:', result);

            // Call the onSubmit callback if needed
            onSubmit(activity, isEditing);
        } catch (error) {
            console.error('Error submitting activity:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="activity-form-overlay">
            <div className="activity-form">
                <h2>{activity ? 'Edit' : 'Add'} Co-Curricular Activity</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Enrollment Number</label>
                        <input
                            type="text"
                            name="enrollmentNumber"
                            value={formData.enrollmentNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Semester ID</label>


                        <input
                            type="text"
                            name="semesterId"
                            value={formData.semesterId}
                            onChange={handleChange}
                            required
                        />
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
