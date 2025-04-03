import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Trophy, Filter, Plus } from 'lucide-react';
import './StudentCoCurricularActivity.css';

const API_BASE_URL = 'http://localhost:5000/api/cocurricular';

const StudentCoCurricularActivity = ({ student, selectedSemester }) => {
    const [activityFilter, setActivityFilter] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newActivity, setNewActivity] = useState({
        title: '',
        date: '',
        description: '',
        achievement: '',
        attachments: 0,
        semester: selectedSemester
    });

    useEffect(() => {
        fetchActivities();
    }, [student.id, selectedSemester]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const url = activityFilter === 'all'
                ? `${API_BASE_URL}/student/${student.id}`
                : `${API_BASE_URL}/student/${student.id}/semester/${selectedSemester}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }
            const data = await response.json();
            setActivities(data);
            setError(null);
        } catch (err) {
            setError('Error loading activities: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddActivity = async () => {
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
        setShowAddForm(false);
        setShowEditForm(true);
        setNewActivity({
            ...activity,
            semester: activity.semester || selectedSemester
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = showEditForm
                ? `${API_BASE_URL}/update/${newActivity._id}`
                : `${API_BASE_URL}/add`;

            const method = showEditForm ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newActivity,
                    studentId: student.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save activity');
            }

            await fetchActivities();
            setShowAddForm(false);
            setShowEditForm(false);
            alert(showAddForm ? 'Activity added successfully!' : 'Activity updated successfully!');
        } catch (err) {
            alert('Error saving activity: ' + err.message);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (!window.confirm('Are you sure you want to delete this activity?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/delete/${activityId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete activity');
            }

            await fetchActivities();
            alert('Activity deleted successfully!');
        } catch (err) {
            alert('Error deleting activity: ' + err.message);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewActivity(prev => ({
            ...prev,
            [name]: name === 'attachments' ? parseInt(value) || 0 : value
        }));
    };

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

    const renderActivityCard = (activity) => (
        <div key={activity._id} className="activity-card">
            <div className="activity-icon">
                <FileText size={18} />
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
                <button className="action-button delete-button" onClick={() => handleDeleteActivity(activity._id)}>
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
                        <h3>{isEditMode ? 'Edit Co-Curricular Activity' : 'Add New Co-Curricular Activity'}</h3>
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
                            <button type="submit" className="submit-button">
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
            {error && <div className="error-message">{error}</div>}
            {loading ? (
                <div className="loading-spinner">Loading activities...</div>
            ) : (
                <>
                    <div className="activities-header">
                        <h3 className="section-title">Co-Curricular Activities</h3>
                        <div className="activities-actions">
                            <div className="filter-container">
                                <button
                                    className={`filter-button ${activityFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActivityFilter('all');
                                        fetchActivities();
                                    }}
                                >
                                    <Filter size={14} /> All Semesters
                                </button>
                                <button
                                    className={`filter-button ${activityFilter === 'semester' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActivityFilter('semester');
                                        fetchActivities();
                                    }}
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
                            <div className="summary-value">{activities.length}</div>
                        </div>
                        <div className="summary-card">
                            <h4>Current Semester</h4>
                            <div className="summary-value">
                                {activities.filter(a => a.semester === selectedSemester).length}
                            </div>
                        </div>
                        <div className="summary-card">
                            <h4>Total Points</h4>
                            <div className="summary-value">{calculateActivityPoints(activities)}</div>
                        </div>
                        <div className="summary-card">
                            <h4>Semester Points</h4>
                            <div className="summary-value">
                                {calculateActivityPoints(activities.filter(a => a.semester === selectedSemester))}
                            </div>
                        </div>
                    </div>

                    <div className="activities-list">
                        {activities.map(activity =>
                            renderActivityCard(activity)
                        )}

                        {activities.length === 0 && (
                            <div className="no-activities-message">
                                <p>No co-curricular activities found for {activityFilter === 'all' ? 'any semester' : `semester ${selectedSemester}`}.</p>
                                <button className="add-activity-button small" onClick={handleAddActivity}>
                                    <Plus size={14} /> Add Activity
                                </button>
                            </div>
                        )}
                    </div>

                    {(showAddForm || showEditForm) && renderActivityForm()}
                </>
            )}
        </div>
    );
};

export default StudentCoCurricularActivity;
