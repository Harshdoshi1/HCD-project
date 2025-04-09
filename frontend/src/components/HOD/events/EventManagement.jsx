import React, { useState, useEffect } from 'react';
import { Plus, Upload } from 'lucide-react';
import AddEventForm from './AddEventForm';
import ExcelUpload from './ExcelUpload';
import './EventManagement.css';

const EventManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExcelForm, setShowExcelForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/events/all');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-management-container">
      <div className="event-header">
        <h2>Events</h2>
        <div className="action-buttons">
          <button
            className="add-event-button"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} /> Add Event
          </button>
          <button
            className="upload-excel-button"
            onClick={() => setShowExcelForm(true)}
          >
            Upload Participants
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddEventForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => setShowAddForm(false)}
        />
      )}

      {showExcelForm && (
        <ExcelUpload
          onClose={() => setShowExcelForm(false)}
          onSuccess={() => setShowExcelForm(false)}
        />
      )}

      <div className="event-list-container">
        {loading ? (
          <p>Loading events...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : events.length === 0 ? (
          <p>No events found</p>
        ) : (
          <div className="events-grid">
            {events.map((event, index) => (
              <div key={index} className="event-card">
                <h3>{event.eventName}</h3>
                <div className="event-details">
                  <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                  <p><strong>Category:</strong> {event.eventCategory}</p>
                  <p><strong>Level:</strong> {event.eventLevel}</p>
                  <p><strong>Description:</strong> {event.eventDescription}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;
