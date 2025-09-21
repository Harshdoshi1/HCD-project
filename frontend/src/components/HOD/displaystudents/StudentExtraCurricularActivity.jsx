import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Trophy, Filter, Plus } from 'lucide-react';
import './StudentCoCurricularActivity.css';
import ExtraCurricularActivityForm from './components/ExtraCurricularActivityForm';
import { buildUrl } from '../../../../utils/apiConfig';

const StudentExtraCurricularActivity = ({ student, selectedSemester }) => {
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
        semester: selectedSemester,
        score: 0
    });

    useEffect(() => {
        fetchActivities();
    }, [student.id, selectedSemester]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const url = activityFilter === 'all'
                ? buildUrl(`/extracurricular/student/${student.id}`)
                : buildUrl(`/extracurricular/student/${student.id}/semester/${selectedSemester}`);

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
            semester: selectedSemester,
            score: 0
        });
    };

    const handleEditActivity = (activity) => {
        setShowAddForm(false);
        setShowEditForm(true);
        setNewActivity({
            ...activity,
            semester: activity.semester || selectedSemester,
            score: activity.score || 0
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = showEditForm
                ? buildUrl(`/extracurricular/update/${newActivity._id}`)
                : buildUrl('/extracurricular/add');

            const method = showEditForm ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newActivity,
                    studentId: student.id,
                    enrollmentNumber: student.enrollmentNumber,
                    score: newActivity.score || 0
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
            const response = await fetch(buildUrl(`/extracurricular/delete/${activityId}`), {
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

    const calculateActivityPoints = (activityList) => {
        return activityList.reduce((total, activity) => total + (activity.score || 0), 0);
    };

    const filterActivitiesBySemester = (activities, semester) => {
        return activities.filter(a => a.semester === semester);
    };

    const renderActivityCard = (activity) => (
        <div key={activity._id} className="activity-card">
            <div className="activity-header">
                <h4>{activity.title}</h4>
                <div className="activity-meta">
                    <span className="activity-date">
                        <Calendar size={14} /> {new Date(activity.date).toLocaleDateString()}
                    </span>
                    <span className="activity-score">
                        <Trophy size={14} /> {activity.score || 0} points
                    </span>
                </div>
            </div>
            <div className="activity-content">
                <p>{activity.description}</p>
                {activity.achievement && (
                    <div className="achievement-section">
                        <h5>Achievement:</h5>
                        <p>{activity.achievement}</p>
                    </div>
                )}
            </div>
            <div className="activity-footer">
                <div className="activity-actions">
                    <button className="edit-button" onClick={() => handleEditActivity(activity)}>
                        <FileText size={14} /> Edit
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteActivity(activity._id)}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    const renderActivityForm = () => (
        <ExtraCurricularActivityForm
            activity={showEditForm ? newActivity : null}
            onClose={() => {
                setShowAddForm(false);
                setShowEditForm(false);
            }}
            onSubmit={handleFormSubmit}
        />
    );

    return (
        <div className="activities-section">
            {error && <div className="error-message">{error}</div>}
            {loading ? (
                <div className="loading-spinner">Loading activities...</div>
            ) : (
                <>
                    <div className="activities-header">
                        <h3 className="section-title">Extra-Curricular Activities</h3>
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
                                <p>No extra-curricular activities found for {activityFilter === 'all' ? 'any semester' : `semester ${selectedSemester}`}.</p>
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

export default StudentExtraCurricularActivity;
