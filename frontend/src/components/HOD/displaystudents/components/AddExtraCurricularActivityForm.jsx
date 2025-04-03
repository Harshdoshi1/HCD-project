import React, { useState } from 'react';
import { Plus, Calendar, Trophy, FileText } from 'lucide-react';
import './ActivityForm.css';

const AddExtraCurricularActivityForm = ({ onClose, onSubmit, formData: initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        enrollmentNumber: '',
        semester: '',
        activityName: '',
        achievementLevel: '',
        date: '',
        description: '',
        certificateUrl: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="activity-form-overlay">
            <div className="activity-form-container">
                <div className="form-header">
                    <h3>{initialData ? 'Edit Extra-Curricular Activity' : 'Add Extra-Curricular Activity'}</h3>
                    <button className="close-form-button" onClick={onClose}>
                        ×
                    </button>
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
                                disabled={initialData}
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
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                            {initialData ? 'Update Activity' : 'Add Activity'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExtraCurricularActivityForm;
