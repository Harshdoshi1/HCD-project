import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FilterSection.css';

const FilterSection = ({ selectedBatch, selectedSemester, onFilterChange }) => {
  const [batches, setBatches] = useState(['all']);
  const [semesters, setSemesters] = useState(['all']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBatchChange = (e) => {
    const newBatch = e.target.value;
    onFilterChange(newBatch, 'all');
    
    // When batch changes, reset semester to 'all' and fetch new semesters
    if (newBatch !== 'all') {
      fetchSemestersByBatch(newBatch);
    } else {
      setSemesters(['all']);
    }
  };

  const handleSemesterChange = (e) => {
    onFilterChange(selectedBatch, e.target.value);
  };

  // Fetch all batches when component mounts
  useEffect(() => {
    fetchBatches();
  }, []);

  // Fetch semesters when selected batch changes (only if not 'all')
  useEffect(() => {
    if (selectedBatch !== 'all') {
      fetchSemestersByBatch(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching batches...');
      const response = await axios.get('http://localhost:5001/api/batches/getAllBatches');
      console.log('Batch API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // The API returns an array of batch objects directly
        const batchNames = response.data.map(batch => {
          console.log('Batch object:', batch);
          return batch.batchName;
        });
        console.log('Extracted batch names:', batchNames);
        
        // Add 'all' option to the beginning of the array
        const allBatches = ['all', ...batchNames];
        console.log('Setting batches state to:', allBatches);
        setBatches(allBatches);
      } else {
        console.error('Invalid batch data format:', response.data);
        setError('Invalid batch data format');
        setBatches(['all']);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Failed to load batches');
      setBatches(['all']);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemestersByBatch = async (batchName) => {
    if (!batchName || batchName === 'all') return;
    
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching semesters for batch: ${batchName}`);
      const response = await axios.get(`http://localhost:5001/api/semesters/getSemestersByBatch/${batchName}`);
      console.log('Semester API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // The API returns an array of semester objects directly
        const semesterNumbers = response.data.map(semester => {
          console.log('Semester object:', semester);
          return semester.semesterNumber.toString();
        });
        console.log('Extracted semester numbers:', semesterNumbers);
        
        // Add 'all' option to the beginning of the array
        const allSemesters = ['all', ...semesterNumbers];
        console.log('Setting semesters state to:', allSemesters);
        setSemesters(allSemesters);
      } else {
        console.error('Invalid semester data format:', response.data);
        setError('Invalid semester data format');
        setSemesters(['all']);
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setError('Failed to load semesters');
      setSemesters(['all']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="filter-section">
      <div className="filter-container">
        <div className="filter-group">
          <label>Batch:</label>
          <select
            value={selectedBatch}
            onChange={handleBatchChange}
            className="filter-select"
            disabled={loading}
          >
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch === 'all' ? 'All Batches' : `Batch ${batch}`}
              </option>
            ))}
          </select>
          {loading && batches.length <= 1 && <span className="loading-text">Loading...</span>}
        </div>

        <div className="filter-group">
          <label>Semester:</label>
          <select
            value={selectedSemester}
            onChange={handleSemesterChange}
            className="filter-select"
            disabled={loading || selectedBatch === 'all'}
          >
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester === 'all' ? 'All Semesters' : `Semester ${semester}`}
              </option>
            ))}
          </select>
          {loading && selectedBatch !== 'all' && semesters.length <= 1 && <span className="loading-text">Loading...</span>}
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      

      <div className="filter-summary">
        <p>
          Showing results for:
          <span className="filter-value">
            {selectedBatch === 'all' ? 'All Batches' : `Batch ${selectedBatch}`}
          </span> and
          <span className="filter-value">
            {selectedSemester === 'all' ? 'All Semesters' : `Semester ${selectedSemester}`}
          </span>
        </p>
      </div>
    </div>
  );
};

export default FilterSection;