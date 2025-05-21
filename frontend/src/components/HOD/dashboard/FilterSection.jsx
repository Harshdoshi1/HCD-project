import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FilterSection.css';

const FilterSection = ({ selectedBatch, onFilterChange }) => {
  const [batches, setBatches] = useState(['all']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBatchChange = (e) => {
    const newBatch = e.target.value;
    onFilterChange(newBatch, 'all');
  };



  // Fetch all batches when component mounts
  useEffect(() => {
    fetchBatches();
  }, []);



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



  return (
    <div className="filter-section">
      <div className="filter-container">
        <div className="filter-group">
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
          <button className="filter-button" onClick={() => onFilterChange(selectedBatch, 'all')}>
            Filter
          </button>
          {loading && batches.length <= 1 && <span className="loading-text">Loading...</span>}
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default FilterSection;