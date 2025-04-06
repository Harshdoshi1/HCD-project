
import './ExcelUpload.css';
import { useState, useContextse } from 'react';
import { FileXls, Upload } from 'phosphor-react';

const ExcelUpload = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [eventCategory, setEventCategory] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventName, setEventName] = useState('');
  const [points, setPoints] = useState('');
  const [eventDate, setEventDate] = useState('');


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
      const processExcelData = async () => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('Excel Data:', jsonData);
        };
        reader.readAsArrayBuffer(file);
      };

      await processExcelData();
    }

    setUploading(true);
    try {
      console.log('File selected:', file);
      console.log('Event Details:', { eventCategory, eventType, eventName, points, eventDate });
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
            <Upload size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="excel-upload-form">
          <div className="form-grid three-columns">
            <div className="form-group">
              <label htmlFor="eventCategory">Event Category</label>
              <select
                id="eventCategory"
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                <option value="Category 1">Category 1</option>
                <option value="Category 2">Category 2</option>
                <option value="Category 3">Category 3</option>
                <option value="Category 4">Category 4</option>
                <option value="Category 5">Category 5</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="eventType">Event Type</label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
              >
                <option value="">Select Type</option>
                <option value="Co-Curricular">Co-Curricular</option>
                <option value="Extra-Curricular">Extra-Curricular</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="eventName">Event Name</label>
              <input
                type="text"
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="points">Points</label>
              <input
                type="number"
                id="points"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventDate">Event Date</label>
              <input
                type="date"
                id="eventDate"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
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
