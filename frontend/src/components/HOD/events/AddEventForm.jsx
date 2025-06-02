import React, { useState } from 'react';
import { X } from 'lucide-react';
import './AddEventForm.css';

const AddEventForm = ({ onClose, onSuccess }) => {

  const [formData, setFormData] = useState({
    eventId: '',
    eventName: '',
    eventType: 'co-curricular',
    eventCategory: '',
    points: '',
    duration: '',
    eventDate: ''
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert eventDate to date before sending

      const response = await fetch('http://localhost:5001/api/Events/createEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      const result = await response.json();
      console.log('Form submitted successfully:', result);
      onSuccess();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  return (
    <div className="add-event-overlay">
      <div className="add-event-modal">
        <div className="modal-header">
          <h3>Add New Event</h3>
          <button className="close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventId">Event ID</label>
              <input
                type="text"
                id="eventId"
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventName">Event Name</label>
              <input
                type="text"
                id="eventName"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventType">Event Type</label>
              <select
                id="eventType"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                required
              >
                <option value="co-curricular">Co-Curricular</option>
                <option value="extra-curricular">Extra-Curricular</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="eventCategory">Event Category</label>
              <input
                type="text"
                id="eventCategory"
                value={formData.eventCategory}
                onChange={(e) => setFormData({ ...formData, eventCategory: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="points">Points</label>
              <input
                type="number"
                id="points"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (hours)</label>
              <input
                type="number"
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="eventDate">Event Date</label>
            <input
              type="date"
              id="eventDate"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-button">Save Event</button>
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;
