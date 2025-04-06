import React, { useState } from 'react';
import { Filter, Plus, Calendar, Trophy, FileText } from 'lucide-react';
import './Activities.css';

const ExtraCurricularActivities = () => {
  const dummyActivities = [
    {
      id: 1,
      title: 'College Cultural Fest',
      description: 'Participated in dance competition and secured 2nd place.',
      date: '2024-11-15',
      achievement: 'Runner-up',
      semester: 3,
    },
    {
      id: 2,
      title: 'Intercollege Hackathon',
      description: 'Developed a web app for mental health support.',
      date: '2024-04-08',
      achievement: 'Winner',
      semester: 2,
    },
    {
      id: 3,
      title: 'Photography Contest',
      description: 'Received appreciation for landscape photography.',
      date: '2025-01-20',
      achievement: 'Participant',
      semester: 4,
    },
  ];

  const [selectedSemester, setSelectedSemester] = useState(1);
  const [activityFilter, setActivityFilter] = useState('all');

  const handleAddActivity = () => alert('Add activity clicked!');
  const handleEditActivity = (activity) => alert(`Edit activity: ${activity.title}`);
  const handleDeleteActivity = (id) => alert(`Delete activity with id: ${id}`);

  const filterActivitiesBySemester = (activities, semester) => {
    if (activityFilter === 'all') return activities;
    return activities.filter((a) => a.semester === semester);
  };

  const calculateActivityPoints = (activities) => {
    return activities.length * 10; // Example: 10 points per activity
  };

  const filteredActivities = filterActivitiesBySemester(dummyActivities, selectedSemester);

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
            {[...Array(8)].map((_, i) => (
              <button
                key={i + 1}
                className={`filter-button ${activityFilter === 'semester' && selectedSemester === i + 1 ? 'active' : ''
                  }`}
                onClick={() => {
                  setSelectedSemester(i + 1);
                  setActivityFilter('semester');
                }}
              >
                <Filter size={14} /> Sem {i + 1}
              </button>
            ))}
          </div>
          <button className="add-activity-button" onClick={handleAddActivity}>
            <Plus size={14} /> Add Activity
          </button>
        </div>
      </div>

      <div className="activities-summary">
        <div className="summary-card">
          <h4>Total Activities</h4>
          <div className="summary-value">{dummyActivities.length}</div>
        </div>
        <div className="summary-card">
          <h4>Current Semester</h4>
          <div className="summary-value">
            {dummyActivities.filter((a) => a.semester === selectedSemester).length}
          </div>
        </div>
        <div className="summary-card">
          <h4>Semester Points</h4>
          <div className="summary-value">
            {calculateActivityPoints(dummyActivities.filter((a) => a.semester === selectedSemester))}
          </div>
        </div>
      </div>

      <div className="activities-list">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="activity-card improved-activity-card">
              <div className="activity-content">
                <div className="activity-icon">
                  <FileText size={18} />
                </div>
                <div className="activity-details">
                  <h4 className="activity-title">{activity.title}</h4>
                  <p className="activity-description">{activity.description}</p>
                  <div className="activity-footer">
                    <span className="activity-date">
                      <Calendar size={14} /> {activity.date}
                    </span>
                    {activity.achievement && (
                      <span className="activity-achievement">
                        <Trophy size={14} /> {activity.achievement}
                      </span>
                    )}
                    <span className="activity-semester">Semester: {activity.semester}</span>
                  </div>
                </div>
              </div>
              <div className="activity-actions">
                <button className="action-button edit-button" onClick={() => handleEditActivity(activity)}>
                  Edit
                </button>
                <button className="action-button delete-button" onClick={() => handleDeleteActivity(activity.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-activities">
            <p>No extra-curricular activities found for the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtraCurricularActivities;