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
          // Extract event names from the event objects
          const eventNames = result.data.map(event => event.eventName);
          setAllEventNames(eventNames);
          // Initialize filtered events with all event names
          setFilteredEvents(eventNames);
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Log the entire Excel file data
        console.log('Excel File Data:', jsonData);

        // Check if the file has any data
        if (!jsonData.length) {
          alert('Excel file is empty');
          return;
        }

        // Get the column headers from the first row
        const headers = Object.keys(jsonData[0]);
        console.log('Excel headers:', headers);

        // Find enrollment and type columns (case-insensitive)
        const enrollmentColumn = headers.find(h => 
          h.toLowerCase().includes('enrol') || h.toLowerCase() === 'enrollment number' || h.toLowerCase() === 'enrollmentnumber'
        );
        const typeColumn = headers.find(h => 
          h.toLowerCase().includes('type') || h.toLowerCase() === 'participation type' || h.toLowerCase() === 'participationtype'
        );

        if (!enrollmentColumn || !typeColumn) {
          alert('Excel file must contain columns for Enrollment Number and Participation Type. Please check your column headers.');
          return;
        }

        // Format data for API
        const participants = jsonData.map(row => ({
          enrollmentNumber: row[enrollmentColumn].toString(),
          participationType: row[typeColumn]
        }));

        // Validate data
        const invalidRows = participants.filter(p => 
          !p.enrollmentNumber || !p.participationType || 
          p.enrollmentNumber.trim() === '' || 
          p.participationType.trim() === ''
        );

        if (invalidRows.length > 0) {
          alert(`Found ${invalidRows.length} invalid rows. Please ensure all cells have valid data.`);
          console.log('Invalid rows:', invalidRows);
          return;
        }

        try {
          setUploading(true);
          const response = await fetch('http://localhost:5001/api/Events/uploadExcell', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              eventName,
              participants
            })
          });

          if (!response.ok) {
            throw new Error('Failed to upload data');
          }

          const result = await response.json();
          console.log('Upload result:', result);

          if (result.success) {
            // Show detailed success message
            const summary = result.data.summary;
            alert(`Excel upload successful!\n\nTotal students: ${summary.total}\nSuccessfully processed: ${summary.successful}\nErrors: ${summary.failed}`);
            onSuccess && onSuccess();
            onClose && onClose();
          } else {
            alert('Error uploading data: ' + result.message);
          }
        } catch (error) {
          console.error('Error uploading data:', error);
          alert('Error uploading data: ' + error.message);
        } finally {
          setUploading(false);
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
