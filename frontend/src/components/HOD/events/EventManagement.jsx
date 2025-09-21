import React, { useState, useEffect } from 'react';
import { Plus, Upload, Filter } from 'lucide-react';
import AddEventForm from './AddEventForm';
import ExcelUpload from './ExcelUpload';
import './EventManagement.css';
import { buildUrl } from '../../../utils/apiConfig';

const EventManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExcelForm, setShowExcelForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
    fetchOutcomes();
  }, []);

  const fetchOutcomes = async () => {
    try {
      const response = await fetch('')
    } catch {

    }
    finally {

    }
  }
  const fetchEvents = async () => {
    try {
      const response = await fetch(buildUrl('/events/all'));
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

  // Filter events based on the active filter
  const filteredEvents = activeFilter === 'all'
    ? events
    : events.filter(event => event.eventType === activeFilter);

  return (
    <div className="event-management-container">
      <div className="event-header">
        <h2>Events</h2>

        <div className="event-filters">
          <div className="filter-buttons">
            <button
              className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-button ${activeFilter === 'co-curricular' ? 'active' : ''}`}
              onClick={() => setActiveFilter('co-curricular')}
            >
              Co-Curricular
            </button>
            <button
              className={`filter-button ${activeFilter === 'extra-curricular' ? 'active' : ''}`}
              onClick={() => setActiveFilter('extra-curricular')}
            >
              Extra-Curricular
            </button>
          </div>
        </div>

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
            <Upload size={16} /> Upload Participants
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddEventForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchEvents(); // Refresh the events list
          }}
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
        ) : filteredEvents.length === 0 ? (
          <p className="no-events-message">No events found for the selected filter</p>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event, index) => (
              <div
                key={index}
                className="event-card"
              >
                <div className="event-name-container">
                  <h3>{event.eventName}</h3>
                </div>
                {event.points && (
                  <div className="event-points">
                    <span className="points-value">{event.points}</span>
                    <span className="points-label">points</span>
                  </div>
                )}
                <div className="event-details">
                  <p><strong>Category:</strong> {event.eventCategory}</p>
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  <p><strong>Duration:</strong> {event.duration} {event.duration === 1 ? 'hour' : 'hours'}</p>
                </div>

                {event.outcomes && event.outcomes.length > 0 && (
                  <div className="event-outcomes">
                    <h4>Associated Outcomes</h4>
                    <div className="outcomes-tags">
                      {event.outcomes.map((outcome, idx) => (
                        <span
                          key={idx}
                          className={`outcome-tag ${outcome.outcome_type === 'Technical' ? 'technical' : 'non-technical'}`}
                        >
                          {outcome.outcome}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;
