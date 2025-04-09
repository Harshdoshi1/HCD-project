import React, { useState } from 'react';
import './ActivityForm.css';
import './AddExtraCurricularActivityForm.css';

const AddExtraCurricularActivityForm = ({ onClose, onSubmit, activity: initialActivity, isEditing = false }) => {
  const [activity, setActivity] = useState(initialActivity || {
    enrollmentNumber: '',
    semesterId: '',
    activityName: '',
    achievementLevel: '',
    date: '',
    description: '',
    certificateUrl: '',
    score: ''

  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5001/api/students/extracurricular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
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
    setActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="activity-form-overlay-form-for-extra">
      <div className="activity-form-for-extra">
        <h3>{isEditing ? 'Edit Extra-Curricular Activity' : 'Add Extra-Curricular Activity'}</h3>
        <form onSubmit={handleSubmit}>

          <div className="form-fields-container-form-for-extra">
            <div className="form-group">
              <label htmlFor="enrollmentNumber">Enrollment Number:</label>
              <input
                type="text"
                id="enrollmentNumber"
                name="enrollmentNumber"
                value={activity.enrollmentNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="semesterId">Semester ID:</label>
              <input
                type="text"
                id="semesterId"
                name="semesterId"
                value={activity.semesterId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="activityName">Activity Name:</label>
              <input
                type="text"
                id="activityName"
                name="activityName"
                value={activity.activityName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="achievementLevel">Achievement Level:</label>
              <input
                type="text"
                id="achievementLevel"
                name="achievementLevel"
                value={activity.achievementLevel}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={activity.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={activity.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="certificateUrl">Certificate URL:</label>
              <input
                type="url"
                id="certificateUrl"
                name="certificateUrl"
                value={activity.certificateUrl}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="score">Score:</label>
              <input
                type="number"
                id="score"
                name="score"
                value={activity.score}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="form-actions full-width">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {isEditing ? 'Update' : 'Add'} Activity
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExtraCurricularActivityForm;
