import React, { useState, useEffect } from 'react';
import { Filter, Plus, Calendar, Trophy, FileText } from 'lucide-react';
import './Activities.css';

const ExtraCurricularActivities = ({
  studentEnrollment,
  student,
  selectedSemester,
  activityFilter,
  setActivityFilter,
  setSelectedSemester,
  handleAddActivity,
  handleEditActivity,
  handleDeleteActivity,
  filterActivitiesBySemester
}) => {
  const [activities, setActivities] = useState([]);
  const fetchAllActivities = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/students/extracurricular/getextra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollmentNumber: studentEnrollment }),
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      } else {
        console.error('Failed to fetch all activities');
      }
    } catch (error) {
      console.error('Error fetching all activities:', error);
    }//
  };
  const fetchSemesterActivities = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/students/extracurricular/getExtraWithSem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentNumber: studentEnrollment,
          semesterId: parseInt(selectedSemester, 10),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === 'No activities found for the given enrollment number and semester') {
          setActivities([]);
        } else {
          setActivities(data);
        }
      } else {
        console.error('Failed to fetch semester activities');
      }
    } catch (error) {
      console.error('Error fetching semester activities:', error);
    }
  };

  useEffect(() => {
    if (activityFilter === 'all') {
      fetchAllActivities();
    } else if (activityFilter === 'semester') {
      fetchSemesterActivities();
    }
  }, [studentEnrollment, selectedSemester, activityFilter]);


  return (
    <div className="activities-section">
      <div className="activities-header"></div>
      <h3 className="section-title">Extra-Curricular Activities of {studentEnrollment}</h3>
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
              disabled={i + 1 > student.semester}
            >
              <Filter size={14} /> Sem {i + 1}
            </button>
          ))}
          {/* shifter from here */}
        </div>
        <button className="add-activity-button" onClick={() => handleAddActivity('extra')}>
          <Plus size={14} /> Add Activity
        </button>
      </div>

      <div className="activities-summary">
        <div className="summary-card">
          <h4>Total Activities</h4>
          <div className="summary-value">{student.extraCurricular ? student.extraCurricular.length : 0}</div>
        </div>
        <div className="summary-card">
          <h4>Current Semester</h4>
          <div className="summary-value">
            {(student.coCurricular || []).filter(a => a && a.semester === selectedSemester).length}
          </div>
        </div>

        <div className="summary-card">
          <h4>Total Points</h4>
          {/* <div className="summary-value">{calculateActivityPoints(student.coCurricular || [])}</div> */}
        </div>
        <div className="summary-card">
          <h4>Semester Points</h4>
          <div className="summary-value">
            {/* {calculateActivityPoints((student.coCurricular || []).filter(a => a && a.semester === selectedSemester))} */}
          </div>
        </div>
      </div>

      <h3>Extra-Curricular Activities</h3>
      <div className="activities-list-co-curricular">
        {activities.length > 0 ? (
          activities.map(activity => (
            <div key={`${activity.id}-${activity.date}`} className="extra-activities-activity-card">
              <h4>{activity.activityName}</h4>
              <p><strong>Achievement:</strong> {activity.achievementLevel}</p>
              <p><strong>Date:</strong> {new Date(activity.date).toLocaleDateString('en-IN')}</p>
              <p><strong>Description:</strong> {activity.description}</p>
              <p><strong>Score:</strong> {activity.score}</p>
              <a href={activity.certificateUrl} target="_blank" rel="noopener noreferrer">
                View Certificate
              </a>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#999' }}>No activities found for this filter.</p>
        )}
      </div>
    </div>
  );
};
export default ExtraCurricularActivities;