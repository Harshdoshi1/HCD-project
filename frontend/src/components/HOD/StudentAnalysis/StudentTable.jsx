import React, { useState, useEffect, useMemo } from 'react';

const StudentTable = ({
  onViewDetails,
  searchQuery,
  setSearchQuery,
  sortConfig,
  onSort
}) => {
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/students/getAllStudents');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStudentData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Always declare the useMemo hook, regardless of conditions
  const filteredStudents = useMemo(() => {
    return studentData.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentData, searchQuery]);

  // Always declare sortedStudents with useMemo, regardless of conditions
  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) {
      return filteredStudents;
    }
    
    return [...filteredStudents].sort((a, b) => {
      let aValue, bValue;
      if (sortConfig.key === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortConfig.key === 'enrollmentNumber') {
        aValue = a.enrollmentNumber;
        bValue = b.enrollmentNumber;
      } else if (sortConfig.key === 'totalScore') {
        aValue = a.Batch?.currentSemester || 0;
        bValue = b.Batch?.currentSemester || 0;
      } else if (sortConfig.key === 'ranking') {
        aValue = parseInt(a.id, 10);
        bValue = parseInt(b.id, 10);
      } else {
        return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredStudents, sortConfig]);

  if (loading) {
    return <div className="student-table-section">Loading...</div>;
  }

  if (error) {
    return <div className="student-table-section">Error: {error}</div>;
  }

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

      {sortedStudents.length === 0 ? (
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
                  onClick={() => onSort('enrollmentNumber')}
                  data-sort={sortConfig.key === 'enrollmentNumber' ? sortConfig.direction : null}
                >
                  Roll Number {getSortIcon('enrollmentNumber')}
                </th>
                <th
                  onClick={() => onSort('totalScore')}
                  data-sort={sortConfig.key === 'totalScore' ? sortConfig.direction : null}
                >
                  Current Semester {getSortIcon('totalScore')}
                </th>
                <th
                  onClick={() => onSort('ranking')}
                  data-sort={sortConfig.key === 'ranking' ? sortConfig.direction : null}
                >
                  ID {getSortIcon('ranking')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student, index) => (
                <tr key={`${student.id}-${index}`}>
                  <td>{student.name}</td>
                  <td>{student.enrollmentNumber}</td>
                  <td>{student.Batch?.currentSemester || 'N/A'}</td>
                  <td>{student.id}</td>
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
