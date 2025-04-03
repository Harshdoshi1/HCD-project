import React from 'react';
import { Filter, Plus, Calendar, Trophy, FileText } from 'lucide-react';
import './Activities.css';

const CoCurricularActivities = ({ 
  student, 
  selectedSemester, 
  activityFilter, 
  setActivityFilter, 
  setSelectedSemester, 
  handleAddActivity, 
  handleEditActivity,
  filterActivitiesBySemester,
  calculateActivityPoints 
}) => {
  return (
    <div className="activities-section">
      <div className="activities-header">
        <h3 className="section-title">Co-Curricular Activities</h3>
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
                className={`filter-button ${activityFilter === 'semester' && selectedSemester === i + 1 ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSemester(i + 1);
                  setActivityFilter('semester');
                }}
                disabled={i + 1 > student.semester}
              >
                <Filter size={14} /> Sem {i + 1}
              </button>
            ))}
          </div>
          <button className="add-activity-button" onClick={() => handleAddActivity('co')}>
            <Plus size={14} /> Add Activity
          </button>
        </div>
      </div>

      <div className="activities-summary">
        <div className="summary-card">
          <h4>Total Activities</h4>
          <div className="summary-value">{student.coCurricular.length}</div>
        </div>
        <div className="summary-card">
          <h4>Current Semester</h4>
          <div className="summary-value">
            {student.coCurricular.filter(a => a.semester === selectedSemester).length}
          </div>
        </div>
        <div className="summary-card">
          <h4>Total Points</h4>
          <div className="summary-value">{calculateActivityPoints(student.coCurricular)}</div>
        </div>
        <div className="summary-card">
          <h4>Semester Points</h4>
          <div className="summary-value">
            {calculateActivityPoints(student.coCurricular.filter(a => a.semester === selectedSemester))}
          </div>
        </div>
      </div>

      <div className="activities-list improved-activities-list">
        {filterActivitiesBySemester(student.coCurricular, selectedSemester).map(activity => (
          <div key={activity.id} className="activity-card improved-activity-card">
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
            </div>
            <div className="activity-actions">
              <button className="action-button edit-button" onClick={() => handleEditActivity(activity, 'co')}>
                +
              </button>
              <button className="action-button delete-button">
                -
              </button>
            </div>
          </div>
        ))}

        {filterActivitiesBySemester(student.coCurricular, selectedSemester).length === 0 && (
          <div className="no-activities-message">
            <p>No co-curricular activities found for {activityFilter === 'all' ? 'any semester' : `semester ${selectedSemester}`}.</p>
            <button className="add-activity-button small" onClick={() => handleAddActivity('co')}>
              <Plus size={14} /> Add Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoCurricularActivities;