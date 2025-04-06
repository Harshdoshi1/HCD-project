import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import AddEventForm from './AddEventForm';
import ExcelUpload from './ExcelUpload';
import './EventManagement.css';

const EventManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExcelForm, setShowExcelForm] = useState(false);

  return (
    <div className="event-management-container">
      <div className="event-header">
        <h2>Event Management</h2>
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
      </div>
    </div>
  );
};

export default EventManagement;
