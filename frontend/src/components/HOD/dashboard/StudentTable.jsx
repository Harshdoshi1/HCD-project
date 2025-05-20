
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentTable.css';

const StudentTable = ({ selectedBatch, selectedSemester, onPointsFilter, onStudentSelect }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  
  // Fetch students based on selected batch and semester
  useEffect(() => {
    console.log('Filter values changed, fetching students with:', { selectedBatch, selectedSemester });
    fetchStudents();
  }, [selectedBatch, selectedSemester]); // This will re-run whenever selectedBatch or selectedSemester changes
  
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching students with filters:', { batch: selectedBatch, semester: selectedSemester });
      let response;
      let url = '';
      
      // Different API calls based on filter selections
      if (selectedBatch === 'all' && selectedSemester === 'all') {
        // Fetch all students
        url = 'http://localhost:5001/api/students/getAllStudents';
        console.log('Fetching from URL:', url);
        response = await axios.get(url);
        console.log('All students response:', response.data);
      } else if (selectedBatch !== 'all' && selectedSemester === 'all') {
        // Fetch students by batch only
        url = `http://localhost:5001/api/students/getStudentsByBatch/${selectedBatch}`;
        console.log('Fetching from URL:', url);
        response = await axios.get(url);
        console.log('Students by batch response:', response.data);
      } else if (selectedBatch !== 'all' && selectedSemester !== 'all') {
        // Fetch students by both batch and semester
        url = `http://localhost:5001/api/marks/students/${selectedBatch}/${selectedSemester}`;
        console.log('Fetching from URL:', url);
        response = await axios.get(url);
        console.log('Students by batch and semester response:', response.data);
      } else {
        // Invalid filter combination (all batches but specific semester)
        setError('Please select a specific batch when filtering by semester');
        setStudents([]);
        setLoading(false);
        return;
      }
      
      if (response && response.data) {
        // Check if response.data is an array or has a specific structure
        console.log('Response data type:', typeof response.data);
        console.log('Is array?', Array.isArray(response.data));
        
        let dataToProcess = response.data;
        
        // If the data is not an array, try to extract it from common response structures
        if (!Array.isArray(dataToProcess)) {
          if (dataToProcess.students) {
            dataToProcess = dataToProcess.students;
            console.log('Extracted students from response:', dataToProcess);
          } else if (dataToProcess.data && Array.isArray(dataToProcess.data)) {
            dataToProcess = dataToProcess.data;
            console.log('Extracted data from response:', dataToProcess);
          }
        }
        
        // Process student data to match the expected format
        const formattedStudents = Array.isArray(dataToProcess) ? dataToProcess.map(student => {
          console.log('Processing student:', student);
          // Fetch student points data or use default values
          return {
            id: student.id || Math.random().toString(36).substr(2, 9),
            name: student.name || student.studentName || 'Unknown',
            rollNo: student.enrollmentNumber || student.rollNo || 'N/A',
            batch: student.batchName || (student.Batch ? student.Batch.batchName : selectedBatch),
            semester: student.semesterNumber || student.currnetsemester || selectedSemester,
            email: student.email || 'N/A',
            parentEmail: student.parentEmail || 'N/A',
            points: {
              // Use actual points if available, otherwise use defaults
              curricular: parseInt(student.curricular || student.totalCurricular || 0),
              coCurricular: parseInt(student.coCurricular || student.totalCocurricular || 0),
              extraCurricular: parseInt(student.extraCurricular || student.totalExtracurricular || 0)
            }
          };
        }) : [];
        
        console.log('Formatted students:', formattedStudents);
        setStudents(formattedStudents);
      } else {
        console.log('No data in response');
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. ' + (err.response?.data?.message || err.message));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';

    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
  };

  // Handle points filtering internally
  const handlePointsFilterInternal = (category, order) => {
    console.log('Filtering points by:', category, order);
    setSortConfig({
      key: `points.${category}`,
      direction: order === 'high' ? 'descending' : 'ascending'
    });
    
    // Still call the parent handler for any additional logic
    onPointsFilter(category, order);
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
        <h2>Student List {loading && <span className="loading-indicator">Loading...</span>}</h2>
        <div className="table-filters">
          <div className="filter-dropdown">
            <label>Curricular Points:</label>
            <div className="dropdown-buttons">
              <button onClick={() => handlePointsFilterInternal('curricular', 'high')}>
                High to Low
              </button>
              <button onClick={() => handlePointsFilterInternal('curricular', 'low')}>
                Low to High
              </button>
            </div>
          </div>

          <div className="filter-dropdown">
            <label>Co-curricular Points:</label>
            <div className="dropdown-buttons">
              <button onClick={() => handlePointsFilterInternal('coCurricular', 'high')}>
                High to Low
              </button>
              <button onClick={() => handlePointsFilterInternal('coCurricular', 'low')}>
                Low to High
              </button>
            </div>
          </div>

          <div className="filter-dropdown">
            <label>Extra-curricular Points:</label>
            <div className="dropdown-buttons">
              <button onClick={() => handlePointsFilterInternal('extraCurricular', 'high')}>
                High to Low
              </button>
              <button onClick={() => handlePointsFilterInternal('extraCurricular', 'low')}>
                Low to High
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-responsive">
        <table className="student-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('rollNo')}>
                Enrollment {sortConfig.key === 'rollNo' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
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
            {loading ? (
              <tr>
                <td colSpan="8" className="loading-data">Loading students...</td>
              </tr>
            ) : sortedStudents.length > 0 ? (
              sortedStudents.map((student) => (
                <tr key={student.id || student.rollNo}>
                  <td>{student.name}</td>
                  <td>{student.rollNo}</td>
                  <td>{student.batch}</td>
                  <td>{student.semester}</td>
                  <td>
                    <div className="points-container">
                      <div className="points-value">{student.points.curricular}</div>
                      <div className="points-bar-container">
                        <div 
                          className="points-bar curricular"
                          style={{ width: `${Math.min(student.points.curricular, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="points-container">
                      <div className="points-value">{student.points.coCurricular}</div>
                      <div className="points-bar-container">
                        <div 
                          className="points-bar co-curricular"
                          style={{ width: `${Math.min(student.points.coCurricular, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="points-container">
                      <div className="points-value">{student.points.extraCurricular}</div>
                      <div className="points-bar-container">
                        <div 
                          className="points-bar extra-curricular"
                          style={{ width: `${Math.min(student.points.extraCurricular, 100)}%` }}
                        ></div>
                      </div>
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
