import React, { useState } from 'react';
import { Plus, Calendar, Trophy, FileText } from 'lucide-react';
import './ActivityForm.css';

const AddExtraCurricularActivityForm = ({ onClose, onSubmit, activity: initialActivity, isEditing = false }) => {
  const [activity, setActivity] = useState(initialActivity || {
    title: '',
    description: '',
    date: '',
    semester: 1,
    activityType: 'Sports',
    position: 'Participant',
    venue: 'College',
    points: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(activity, isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="activity-form-overlay">
      <div className="activity-form">
        <h3>{isEditing ? 'Edit Extra-Curricular Activity' : 'Add Extra-Curricular Activity'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={activity.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="semester">Semester:</label>
            <select
              id="semester"
              name="semester"
              value={activity.semester}
              onChange={handleChange}
              required
            >
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="activityType">Activity Type:</label>
            <select
              id="activityType"
              name="activityType"
              value={activity.activityType}
              onChange={handleChange}
              required
            >
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural</option>
              <option value="Social">Social Service</option>
              <option value="Leadership">Leadership</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="position">Position/Achievement:</label>
            <select
              id="position"
              name="position"
              value={activity.position}
              onChange={handleChange}
              required
            >
              <option value="Winner">Winner</option>
              <option value="Runner-up">Runner-up</option>
              <option value="Participant">Participant</option>
              <option value="Organizer">Organizer</option>
              <option value="Volunteer">Volunteer</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="venue">Venue Level:</label>
            <select
              id="venue"
              name="venue"
              value={activity.venue}
              onChange={handleChange}
              required
            >
              <option value="College">College</option>
              <option value="University">University</option>
              <option value="State">State</option>
              <option value="National">National</option>
              <option value="International">International</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="points">Points:</label>
            <input
              type="number"
              id="points"
              name="points"
              value={activity.points}
              onChange={handleChange}
              min="1"
              max="100"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {isEditing ? 'Update' : 'Add'} Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExtraCurricularActivityForm;