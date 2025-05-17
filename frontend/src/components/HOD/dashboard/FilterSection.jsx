import React from 'react';
import './FilterSection.css';

const FilterSection = ({ selectedBatch, selectedSemester, onFilterChange }) => {
  const batches = ['all', '2020', '2021', '2022', '2023'];
  const semesters = ['all', '1', '2', '3', '4', '5', '6', '7', '8'];

  const handleBatchChange = (e) => {
    onFilterChange(e.target.value, selectedSemester);
  };

  const handleSemesterChange = (e) => {
    onFilterChange(selectedBatch, e.target.value);
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
          >
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch === 'all' ? 'All Batches' : `Batch ${batch}`}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Semester:</label>
          <select
            value={selectedSemester}
            onChange={handleSemesterChange}
            className="filter-select"
          >
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester === 'all' ? 'All Semesters' : `Semester ${semester}`}
              </option>
            ))}
          </select>
        </div>
      </div>

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