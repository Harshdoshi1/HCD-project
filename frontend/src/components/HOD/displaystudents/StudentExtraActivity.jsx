import React, { useState } from 'react';
import { Activity, Calendar, Trophy, Filter, Plus } from 'lucide-react';
import './StudentExtraActivity.css';

const StudentExtraActivity = ({ student, selectedSemester }) => {
    const [activityFilter, setActivityFilter] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [newActivity, setNewActivity] = useState({
        title: '',
        date: '',
        description: '',
        achievement: '',
        attachments: 0,
        semester: selectedSemester
    });

    const calculateActivityPoints = (activityList) => {
        return activityList.reduce((total, activity) => {
            let points = 0;
            if (activity.achievement && activity.achievement.toLowerCase().includes('first')) {
                points = 10;
            } else if (activity.achievement && activity.achievement.toLowerCase().includes('second')) {
                points = 8;
            } else if (activity.achievement && activity.achievement.toLowerCase().includes('third')) {
                points = 6;
            } else if (activity.achievement) {
                points = 5;
            } else {
                points = 3;
            }
            return total + points;
        }, 0);
    };

    const filterActivitiesBySemester = (activities, semester) => {
        if (activityFilter === 'all') return activities;
        return activities.filter(activity => activity.semester === semester);
    };

    const handleAddActivity = () => {
        setShowAddForm(true);
        setShowEditForm(false);
        setNewActivity({
            title: '',
            date: '',
            description: '',
            achievement: '',
            attachments: 0,
            semester: selectedSemester
        });
    };

    const handleEditActivity = (activity) => {
        setCurrentActivity(activity);
        setShowAddForm(false);
        setShowEditForm(true);
        setNewActivity({
            ...activity,
            semester: activity.semester || selectedSemester
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewActivity(prev => ({
            ...prev,
            [name]: name === 'attachments' ? parseInt(value) || 0 : value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setShowAddForm(false);
        setShowEditForm(false);
        alert(showAddForm ? 'Activity added successfully!' : 'Activity updated successfully!');
    };

    const renderActivityCard = (activity) => (
        <div key={activity.id} className="activity-card">
            <div className="activity-icon">
                <Activity size={18} />
            </div>
            <div className="activity-details">
                <h4 className="activity-title">{activity.title}</h4>
                <p className="activity-description">{activity.description}</p>
                <div className="activity-footer">
                    <span className="activity-date"><Calendar size={14} /> {activity.date}</span>
                    {activity.achievement && (
                        <span className="activity-achievement"><Trophy size={14} /> {activity.achievement}</span>
                    )}
                    <span className="activity-semester">Semester: {activity.semester || 'N/A'}</span>
                </div>
                {activity.attachments > 0 && (
                    <div className="activity-attachments">
                        <span className="attachments-label">
                            {activity.attachments} document{activity.attachments !== 1 ? 's' : ''} attached
                        </span>
                    </div>
                )}
            </div>
            <div className="activity-actions">
                <button className="action-button edit-button" onClick={() => handleEditActivity(activity)}>
                    +
                </button>
                <button className="action-button delete-button">
                    -
                </button>
            </div>
        </div>
    );

    const renderActivityForm = () => {
        const isEditMode = showEditForm;
        return (
            <div className="activity-form-overlay">
                <div className="activity-form-container">
                    <div className="form-header">
                        <h3>{isEditMode ? 'Edit Extra-Curricular Activity' : 'Add New Extra-Curricular Activity'}</h3>
                        <button className="close-form-button" onClick={() => {
                            setShowAddForm(false);
                            setShowEditForm(false);
                        }}>×</button>
                    </div>

                    <form onSubmit={handleFormSubmit} className="activity-form">
                        <div className="form-group">
                            <label htmlFor="title">Activity Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newActivity.title}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date">Date/Duration</label>
                            <input
                                type="text"
                                id="date"
                                name="date"
                                value={newActivity.date}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newActivity.description}
                                onChange={handleFormChange}
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="achievement">Achievement/Recognition (if any)</label>
                            <input
                                type="text"
                                id="achievement"
                                name="achievement"
                                value={newActivity.achievement}
                                onChange={handleFormChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="semester">Related Semester</label>
                            <select
                                id="semester"
                                name="semester"
                                value={newActivity.semester}
                                onChange={handleFormChange}
                            >
                                {[...Array(student.semester)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={() => {
                                setShowAddForm(false);
                                setShowEditForm(false);
                            }}>Cancel</button>
                            <button type="submit" className="add-activity-btn-co">
                                {isEditMode ? 'Update Activity' : 'Add Activity'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="activities-section">
            <div className="activities-header">
                <h3 className="section-title">Extra-Curricular Activities</h3>
                <div className="activities-actions">
                    <div className="filter-container">
                        <button
                            className={`filter-button ${activityFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActivityFilter('all')}
                        >
                            <Filter size={14} /> All Semesters
                        </button>
                        <button
                            className={`filter-button ${activityFilter === 'semester' ? 'active' : ''}`}
                            onClick={() => setActivityFilter('semester')}
                        >
                            <Filter size={14} /> Current Semester ({selectedSemester})
                        </button>
                    </div>
                    <button className="add-activity-button" onClick={handleAddActivity}>
                        <Plus size={14} /> Add Activity
                    </button>
                </div>
            </div>

            <div className="activities-summary">
                <div className="summary-card">
                    <h4>Total Activities</h4>
                    <div className="summary-value">{student.extraCurricular.length}</div>
                </div>
                <div className="summary-card">
                    <h4>Current Semester</h4>
                    <div className="summary-value">
                        {student.extraCurricular.filter(a => a.semester === selectedSemester).length}
                    </div>
                </div>
                <div className="summary-card">
                    <h4>Total Points</h4>
                    <div className="summary-value">{calculateActivityPoints(student.extraCurricular)}</div>
                </div>
                <div className="summary-card">
                    <h4>Semester Points</h4>
                    <div className="summary-value">
                        {calculateActivityPoints(student.extraCurricular.filter(a => a.semester === selectedSemester))}
                    </div>
                </div>
            </div>

            <div className="activities-list">
                {filterActivitiesBySemester(student.extraCurricular, selectedSemester).map(activity =>
                    renderActivityCard(activity)
                )}

                {filterActivitiesBySemester(student.extraCurricular, selectedSemester).length === 0 && (
                    <div className="no-activities-message">
                        <p>No extra-curricular activities found for {activityFilter === 'all' ? 'any semester' : `semester ${selectedSemester}`}.</p>
                        <button className="add-activity-button small" onClick={handleAddActivity}>
                            <Plus size={14} /> Add Activity
                        </button>
                    </div>
                )}
            </div>

            {(showAddForm || showEditForm) && renderActivityForm()}
        </div>
    );
};

export default StudentExtraActivity;