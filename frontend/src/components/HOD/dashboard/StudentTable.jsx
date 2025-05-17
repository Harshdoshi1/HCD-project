
import React, { useState } from 'react';
import './StudentTable.css';

const StudentTable = ({ students, onPointsFilter, onStudentSelect }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  const handleSort = (key) => {
    let direction = 'ascending';

    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
  };

  const getSortedStudents = () => {
    if (sortConfig.key === null) {
      return students;
    }

    return [...students].sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key.includes('.')) {
        const [parent, child] = sortConfig.key.split('.');
        aValue = a[parent][child];
        bValue = b[parent][child];
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedStudents = getSortedStudents();

  return (
    <div className="student-table-container">
      <div className="table-header">
        <h2>Student List</h2>
        <div className="table-filters">
          <div className="filter-dropdown">
            <label>Curricular Points:</label>
            <div className="dropdown-buttons">
              <button onClick={() => onPointsFilter('curricular', 'high')}>
                High to Low
              </button>
              <button onClick={() => onPointsFilter('curricular', 'low')}>
                Low to High
              </button>
            </div>
          </div>

          <div className="filter-dropdown">
            <label>Co-curricular Points:</label>
            <div className="dropdown-buttons">
              <button onClick={() => onPointsFilter('coCurricular', 'high')}>
                High to Low
              </button>
              <button onClick={() => onPointsFilter('coCurricular', 'low')}>
                Low to High
              </button>
            </div>
          </div>

          <div className="filter-dropdown">
            <label>Extra-curricular Points:</label>
            <div className="dropdown-buttons">
              <button onClick={() => onPointsFilter('extraCurricular', 'high')}>
                High to Low
              </button>
              <button onClick={() => onPointsFilter('extraCurricular', 'low')}>
                Low to High
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="student-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('rollNo')}>
                Roll No. {sortConfig.key === 'rollNo' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('batch')}>
                Batch {sortConfig.key === 'batch' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('semester')}>
                Semester {sortConfig.key === 'semester' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('points.curricular')}>
                Curricular {sortConfig.key === 'points.curricular' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('points.coCurricular')}>
                Co-Curricular {sortConfig.key === 'points.coCurricular' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('points.extraCurricular')}>
                Extra-Curricular {sortConfig.key === 'points.extraCurricular' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length > 0 ? (
              sortedStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.rollNo}</td>
                  <td>{student.batch}</td>
                  <td>{student.semester}</td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className="progress-fill curricular"
                        style={{ width: `${student.points.curricular}%` }}
                      ></div>
                      <span>{student.points.curricular}</span>
                    </div>
                  </td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className="progress-fill co-curricular"
                        style={{ width: `${student.points.coCurricular}%` }}
                      ></div>
                      <span>{student.points.coCurricular}</span>
                    </div>
                  </td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className="progress-fill extra-curricular"
                        style={{ width: `${student.points.extraCurricular}%` }}
                      ></div>
                      <span>{student.points.extraCurricular}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="dashboard-HOD-btn-view"
                      onClick={() => onStudentSelect(student)}
                    >
                      View Analysis
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">No students match the selected filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
