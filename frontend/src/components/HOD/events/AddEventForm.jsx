import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./AddEventForm.css";

const AddEventForm = ({ onClose, onSuccess }) => {
  const [outcomes, setOutcomes] = useState({
    technical: [],
    nonTechnical: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    eventId: "",
    eventName: "",
    eventType: "co-curricular",
    eventCategory: "",
    points: "",
    duration: "",
    eventDate: "",
    outcomes: []
  });

  useEffect(() => {
    fetchEventOutcomes();
  }, []);

  // Debug log to see formData changes
  useEffect(() => {
    console.log("formData changed:", formData);
  }, [formData]);

  const fetchEventOutcomes = async () => {
    try {
      console.log("Fetching event outcomes...");

      const technicalResponse = await fetch(
        "http://localhost:5001/api/event-outcomes/type/Technical"
      );
      const nonTechnicalResponse = await fetch(
        "http://localhost:5001/api/event-outcomes/type/Non-Technical"
      );

      console.log("Technical response status:", technicalResponse.status);
      console.log("Non-technical response status:", nonTechnicalResponse.status);

      if (!technicalResponse.ok || !nonTechnicalResponse.ok) {
        throw new Error("Failed to fetch outcomes");
      }

      const technicalData = await technicalResponse.json();
      const nonTechnicalData = await nonTechnicalResponse.json();
      console.log("fetch tech outcomes: ", technicalData);
      console.log("fetched nonTechnical outcomes: ", nonTechnicalData);

      const technicalOutcomes = technicalData.data || [];
      const nonTechnicalOutcomes = nonTechnicalData.data || [];

      console.log("Technical outcomes array:", technicalOutcomes);
      console.log("Non-technical outcomes array:", nonTechnicalOutcomes);

      setOutcomes({
        technical: technicalOutcomes,
        nonTechnical: nonTechnicalOutcomes,
      });
    } catch (error) {
      console.error("Error fetching outcomes:", error);
    }
  };

  const handleOutcomeChange = (outcomeId) => {
    console.log('Outcome clicked:', outcomeId);
    console.log('Current formData.outcomes:', formData.outcomes);

    setFormData(prev => {
      const currentOutcomes = prev.outcomes || [];
      const isSelected = currentOutcomes.includes(outcomeId);

      console.log('Is selected:', isSelected);

      if (isSelected) {
        const newOutcomes = currentOutcomes.filter(id => id !== outcomeId);
        console.log('Removing outcome, new outcomes:', newOutcomes);
        return {
          ...prev,
          outcomes: newOutcomes
        };
      } else {
        const newOutcomes = [...currentOutcomes, outcomeId];
        console.log('Adding outcome, new outcomes:', newOutcomes);
        return {
          ...prev,
          outcomes: newOutcomes
        };
      }
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:5001/api/events/createEvent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save event");
      }

      const result = await response.json();
      console.log("Form submitted successfully:", result);

      // Reset form data
      setFormData({
        eventId: "",
        eventName: "",
        eventType: "co-curricular",
        eventCategory: "",
        points: "",
        duration: "",
        eventDate: "",
        outcomes: []
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving event:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="add-event-overlay"
      onClick={(e) => e.target.className === "add-event-overlay" && onClose()}
    >
      <div className="add-event-modal" onClick={(e) => e.stopPropagation()}>
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
                onChange={(e) =>
                  setFormData({ ...formData, eventId: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventName">Event Name</label>
              <input
                type="text"
                id="eventName"
                value={formData.eventName}
                onChange={(e) =>
                  setFormData({ ...formData, eventName: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, eventCategory: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, points: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (hours)</label>
              <input
                type="number"
                id="duration"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
              />
            </div>
          </div>

          {/* <div className="form-row outcomes-section">
            <div className="form-group">
              <label>Technical Outcomes</label>
              <div className="outcomes-checkboxes">
                {outcomes.technical.length > 0 ? (
                  outcomes.technical.map((outcome) => (
                    <label key={outcome.outcome_id} className="outcome-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.outcomes.includes(outcome.outcome_id)}
                        onChange={() => handleOutcomeChange(outcome.outcome_id)}
                      />
                      <span>{outcome.outcome}</span>
                    </label>
                  ))
                ) : (
                  <p className="no-outcomes">No technical outcomes available</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Non-Technical Outcomes</label>
              <div className="outcomes-checkboxes">
                {outcomes.nonTechnical.length > 0 ? (
                  outcomes.nonTechnical.map((outcome) => (
                    <label key={outcome.outcome_id} className="outcome-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.outcomes.includes(outcome.outcome_id)}
                        onChange={() => handleOutcomeChange(outcome.outcome_id)}
                      />
                      <span>{outcome.outcome}</span>
                    </label>
                  ))
                ) : (
                  <p className="no-outcomes">No non-technical outcomes available</p>
                )}
              </div>
            </div>
          </div> */}
          <div
            className="form-row outcomes-section"
            style={{ display: "flex", gap: "20px", margin: "15px 0" }}
          >
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontWeight: "bold", marginBottom: "8px", display: "block" }}>
                Technical Outcomes
              </label>
              <div
                className="outcomes-checkboxes"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                }}
              >
                {outcomes.technical.length > 0 ? (
                  outcomes.technical.map((outcome) => (
                    <label
                      key={outcome.outcome_id}
                      className="outcome-checkbox"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.outcomes && formData.outcomes.includes(outcome.outcome_id)}
                        onChange={() => handleOutcomeChange(outcome.outcome_id)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          accentColor: "#007bff",
                        }}
                      />
                      <span>{outcome.outcome}</span>
                    </label>
                  ))
                ) : (
                  <p className="no-outcomes">No technical outcomes available</p>
                )}
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontWeight: "bold", marginBottom: "8px", display: "block" }}>
                Non-Technical Outcomes
              </label>
              <div
                className="outcomes-checkboxes"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                }}
              >
                {outcomes.nonTechnical.length > 0 ? (
                  outcomes.nonTechnical.map((outcome) => (
                    <label
                      key={outcome.outcome_id}
                      className="outcome-checkbox"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.outcomes && formData.outcomes.includes(outcome.outcome_id)}
                        onChange={() => handleOutcomeChange(outcome.outcome_id)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          accentColor: "#007bff",
                        }}
                      />
                      <span>{outcome.outcome}</span>
                    </label>
                  ))
                ) : (
                  <p className="no-outcomes">No non-technical outcomes available</p>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventDate">Event Date</label>
            <input
              type="date"
              id="eventDate"
              value={formData.eventDate}
              onChange={(e) =>
                setFormData({ ...formData, eventDate: e.target.value })
              }
              required
            />
          </div>

          {/* Debug section - remove this after testing */}
          {/* <div className="form-group" style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
            <label style={{ fontWeight: 'bold' }}>Debug Info:</label>
            <p>Selected Outcomes: {JSON.stringify(formData.outcomes)}</p>
            <p>Technical Outcomes Count: {outcomes.technical.length}</p>
            <p>Non-Technical Outcomes Count: {outcomes.nonTechnical.length}</p>
          </div> */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-buttons">
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;
