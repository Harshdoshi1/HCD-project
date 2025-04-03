import React from 'react';

const StudentTable = ({ 
  students, 
  onViewDetails, 
  searchQuery, 
  setSearchQuery,
  sortConfig,
  onSort
}) => {
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="student-table-section">
      <div className="table-header">
        <h2>Students List</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search students"
          />
        </div>
      </div>

      {students.length === 0 ? (
        <div className="no-results">
          <p>No students found. Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="student-table">
            <thead>
              <tr>
                <th 
                  onClick={() => onSort('name')}
                  data-sort={sortConfig.key === 'name' ? sortConfig.direction : null}
                >
                  Student Name {getSortIcon('name')}
                </th>
                <th 
                  onClick={() => onSort('rollNumber')}
                  data-sort={sortConfig.key === 'rollNumber' ? sortConfig.direction : null}
                >
                  Roll Number {getSortIcon('rollNumber')}
                </th>
                <th 
                  onClick={() => onSort('totalScore')}
                  data-sort={sortConfig.key === 'totalScore' ? sortConfig.direction : null}
                >
                  Total Score {getSortIcon('totalScore')}
                </th>
                <th 
                  onClick={() => onSort('ranking')}
                  data-sort={sortConfig.key === 'ranking' ? sortConfig.direction : null}
                >
                  Ranking {getSortIcon('ranking')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={`${student.id}-${index}`}>
                  <td>{student.name}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.totalScore}%</td>
                  <td>{student.ranking}</td>
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => onViewDetails(student)}
                      aria-label={`View details for ${student.name}`}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
