import React, { useState, useEffect } from 'react';
import './ActivityForm.css';

const ActivityForm = ({ activity, onSubmit, onClose, isEdit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        achievement: ''
    });

    useEffect(() => {
        if (activity && isEdit) {
            setFormData({
                title: activity.title || '',
                description: activity.description || '',
                date: activity.date || '',
                achievement: activity.achievement || ''
            });
        }
    }, [activity, isEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            id: activity?.id
        });
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
            <div className="activity-form-container">
                <div className="form-header">
                    <h3>{isEdit ? 'Edit Activity' : 'Add New Activity'}</h3>
                    <button className="close-form-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="activity-form">
                    <div className="form-group">
                        <label htmlFor="title">Activity Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="achievement">Achievement/Outcome</label>
                        <input
                            type="text"
                            id="achievement"
                            name="achievement"
                            value={formData.achievement}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                            {isEdit ? 'Update' : 'Add'} Activity
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivityForm;
