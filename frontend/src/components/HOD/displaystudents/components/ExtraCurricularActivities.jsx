
import React, { useEffect, useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import './Activities.css';
import './StudentActivityContainer.css';

const ExtraCurricularActivities = ({
  studentEnrollment,
  student,
  selectedSemester,
  activityFilter,
  setActivityFilter,
  setSelectedSemester,
  handleAddActivity,
  calculateActivityPoints
}) => {
  const [activities, setActivities] = useState([]);

  const fetchAllActivitiesidforstudent = async () => {
    try {
      console.log('Fetching activities for enrollment:', studentEnrollment);
      const response = await fetch('http://localhost:5001/api/events/fetchEventsIDsbyEnroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentNumber: studentEnrollment
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received event IDs:', data);
        if (data && data.length > 0) {
          // Collect all event IDs from the response
          const allEventIds = data
            .map(item => item.eventId) // Get all eventId strings
            .filter(id => id) // Remove any undefined or null values
            .join(','); // Join them with commas

          if (allEventIds) {
            await fetchEventDetailsFromEventIds(allEventIds);
          } else {
            console.log('No event IDs found');
            setActivities({ data: [] });
          }
        } else {
          console.log('No event IDs found');
          setActivities({ data: [] });
        }
      } else {
        console.error('Failed to fetch all activities');
        setActivities({ data: [] });
      }
    } catch (error) {
      console.error('Error fetching all activities:', error);
      setActivities({ data: [] });
    }
  };
  const fetchEventDetailsFromEventIds = async (eventIds) => {
    try {
      console.log('Fetching details for event IDs:', eventIds);
      // If eventIds is already a string, use it directly, otherwise join the array
      const eventIdsString = typeof eventIds === 'string' ? eventIds : eventIds.join(',');

      const response = await fetch('http://localhost:5001/api/events/fetchEventsByEventIds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventIds: eventIdsString,
          eventType: 'extra-curricular'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received event details:', data);
        setActivities({ data: data.data || [] });
      } else {
        console.error('Failed to fetch event details');
        setActivities({ data: [] });
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      setActivities({ data: [] });
    }
  };
  const fetchAllActivitiesWithSemesterAndEnrollment = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/events/fetchEventsbyEnrollandSemester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentNumber: studentEnrollment,
          semester: parseInt(selectedSemester)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0].eventId) {
          await fetchEventDetailsFromEventIds(data[0].eventId);
        } else {
          setActivities({ data: [] });
        }
      } else {
        console.error('Failed to fetch all activities');
        setActivities({ data: [] });
      }
    } catch (error) {
      console.error('Error fetching all activities:', error);
      setActivities({ data: [] });
    }
  };


  useEffect(() => {
    if (activityFilter === 'all') {
      fetchAllActivitiesidforstudent();
    } else if (activityFilter === 'semester') {
      fetchAllActivitiesWithSemesterAndEnrollment();
    }
  }, [studentEnrollment, selectedSemester, activityFilter]);

  return (
    <div className="activities-section">
      <div className="activities-header">
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
          <div className="summary-value">{activities?.data ? activities.data.length : 0}</div>
        </div>
        <div className="summary-card">
          <h4>Total Points</h4>
          <div className="summary-value">
            {activities?.data ? activities.data.reduce((sum, activity) => sum + activity.points, 0) : 0}
          </div>
        </div>
      </div>

      <div className="activities-list">
        {activities?.data && activities.data.length > 0 ? (
          activities.data.map((activity) => (
            <div key={activity.eventId} className="activity-card">
              <div className="activity-header">
                <h4>{activity.eventName}</h4>
                <span className="points">{activity.points} points</span>
              </div>
              <div className="activity-details">
                <p><strong>Category:</strong> {activity.eventCategory}</p>
                <p><strong>Date:</strong> {new Date(activity.date).toLocaleDateString()}</p>
                <p><strong>Duration:</strong> {activity.duration} {activity.duration === 1 ? 'day' : 'days'}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-activities">No activities found</p>
        )}
      </div>
    </div>
  );
};
export default ExtraCurricularActivities;