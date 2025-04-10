import React, { useState, useEffect } from 'react';
import './AddCoCurricularActivityForm.css';

const AddCoCurricularActivityForm = ({ activity, onClose, onSubmit, semesterId }) => {
    const [formData, setFormData] = useState({
        enrollmentNumber: '',
        semester: semesterId || '',
        eventName: '',
        participationTypeId: ''
    });

    const [activities, setActivities] = useState([]);
    const [participationTypes, setParticipationTypes] = useState([]);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/events/allCoCurricularnames');
                const data = await response.json();
                if (data.success) {
                    setActivities(data.data);
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            }
        };

        const fetchParticipationTypes = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/events/allParticipationTypes');
                const data = await response.json();
                if (data.success) {
                    setParticipationTypes(data.data);
                }
            } catch (error) {
                console.error('Error fetching participation types:', error);
            }
        };

        fetchActivities();
        fetchParticipationTypes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5001/api/events/insertIntoStudentPoints', {
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
                        <label>Semester</label>
                        <input
                            type="text"
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Event Name</label>
                        <select
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleChange}
                            required
                            className="form-select"
                        >
                            <option value="">Select Event</option>
                            {activities.map((activity, index) => (
                                <option key={index} value={activity.eventName}>
                                    {activity.eventName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Participation Type</label>
                        <select
                            name="participationTypeId"
                            value={formData.participationTypeId}
                            onChange={handleChange}
                            required
                            className="form-select"
                        >
                            <option value="">Select Type</option>
                            {participationTypes.map((role, index) => (
                                <option key={index} value={role.types}>
                                    {role.types}
                                </option>
                            ))}
                        </select>
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
