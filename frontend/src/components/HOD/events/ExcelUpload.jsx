
import './ExcelUpload.css';
import { useState, useEffect } from 'react';
import { FileXls, Upload } from 'phosphor-react';
import * as XLSX from 'xlsx';

const ExcelUpload = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [eventName, setEventName] = useState('');
  // const [eventDate, setEventDate] = useState('');
  const [allEventNames, setAllEventNames] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch event names when component mounts
  useEffect(() => {
    const fetchEventNames = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/Events/getAllEventNames', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch event names');
        }

        const result = await response.json();
        console.log('Fetched event names:', result);
        
        if (result.success && Array.isArray(result.data)) {
          setAllEventNames(result.data);
          // Initialize filtered events with all event names
          setFilteredEvents(result.data);
        }
      } catch (error) {
        console.error('Error fetching event names:', error);
      }
    };

    fetchEventNames();
  }, []);


  const handleEventNameChange = (e) => {
    const value = e.target.value;
    setEventName(value);

    if (value.trim() && Array.isArray(allEventNames)) {
      const filtered = allEventNames.filter(name =>
        name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredEvents(filtered);
      setShowSuggestions(true);
    } else if (value.trim() === '') {
      // If input is empty, show all event names
      setFilteredEvents(allEventNames);
      setShowSuggestions(true);
    } else {
      setFilteredEvents([]);
      setShowSuggestions(false);
    }
    
    // For debugging
    console.log('Current input:', value);
    console.log('Filtered events:', filtered);
    console.log('Show suggestions:', showSuggestions);
  };

  const handleSuggestionClick = (name) => {
    setEventName(name);
    setShowSuggestions(false);
  };


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
    } else {
      alert('Please select a valid Excel (.xlsx) file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an Excel file');
      return;
    }

    const processExcelData = async () => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Convert Excel data to proper format
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          .map(row => row[0])
          .filter(enrollment => enrollment != null)
          .map(enrollment => String(enrollment).trim()) // Ensure enrollment numbers are strings and trimmed
          .filter(enrollment => enrollment !== 'Enrolment' && enrollment !== ''); // Skip header row
        console.log('Excel Data:', jsonData);
        try {
          if (!eventName) {
            throw new Error('Please select an event name');
          }

          if (!jsonData || jsonData.length === 0) {
            throw new Error('No valid enrollment numbers found in the Excel file');
          }

          try {
            const response = await fetch('http://localhost:5001/api/Events/uploadExcell', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                eventName: eventName.trim(),
                participants: jsonData.filter(id => id && id.trim()) // Extra safety check
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to save event');
            }

            const result = await response.json();
            console.log('Form submitted successfully:', result);
            onSuccess();
          } catch (error) {
            console.error('Error saving event:', error);
          }
        } catch (error) {
          console.error('Error saving event:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    };

    await processExcelData();

    setUploading(true);
    try {
      console.log('File selected:', file);
      console.log('Event Details:', { eventName });
      onSuccess();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="excel-upload-overlay">
      <div className="excel-upload-modal">
        <div className="modal-header">
          <h3>Upload Participants Excel</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="excel-upload-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="eventName">Event Name</label>
              <div className="search-container">
                <input
                  type="text"
                  id="eventName"
                  value={eventName}
                  onChange={handleEventNameChange}
                  onFocus={() => {
                    // On focus, show all events if input is empty, or filtered events if there's text
                    if (eventName.trim()) {
                      setFilteredEvents(allEventNames.filter(name =>
                        name.toLowerCase().includes(eventName.toLowerCase())
                      ));
                    } else {
                      setFilteredEvents(allEventNames);
                    }
                    setShowSuggestions(true);
                    console.log('Focus: showing suggestions', allEventNames.length);
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow for clicks
                    setTimeout(() => {
                      setShowSuggestions(false);
                      console.log('Blur: hiding suggestions');
                    }, 200);
                  }}
                  placeholder="Search event name..."
                  required
                  autoComplete="off" // Prevent browser's default autocomplete
                />
                {showSuggestions && filteredEvents.length > 0 && (
                  <div className="suggestions-dropdown" style={{ display: 'block' }}>
                    {filteredEvents.map((name, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(name)}
                        onMouseDown={(e) => {
                          // Prevent the onBlur event from firing
                          e.preventDefault();
                        }}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="upload-container">
            <div className="upload-icon">
              <FileXls size={48} />
            </div>
            <div className="upload-text">
              <p>Drag and drop your Excel file here</p>
              <p>or</p>
              <label htmlFor="excelFile" className="browse-button">
                Browse Files
                <input
                  type="file"
                  id="excelFile"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {file && (
            <div className="selected-file">
              <p>Selected file: {file.name}</p>
            </div>
          )}

          <p className="note">
            * Please ensure the Excel file contains the enrollment numbers of all participants.
          </p>

          <div className="form-buttons">
            <button type="submit" className="upload-button" disabled={uploading || !file}>
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExcelUpload;
