
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentTable.css';

const StudentTable = ({ selectedBatch, selectedSemester, onPointsFilter, onStudentSelect }) => {
  const [students, setStudents] = useState([]);
  const [batchStats, setBatchStats] = useState({
    totalStudents: 0,
    averageCurricular: 0,
    averageCoCurricular: 0,
    averageExtraCurricular: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  // State for student details modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [studentAcademicData, setStudentAcademicData] = useState(null);

  // State for points filters
  const [pointsFilters, setPointsFilters] = useState({
    curricular: null,
    coCurricular: null,
    extraCurricular: null
  });

  // Fetch students based on selected batch and semester
  useEffect(() => {
    console.log('Filter values changed, fetching students with:', { selectedBatch, selectedSemester });
    fetchStudents();
  }, [selectedBatch, selectedSemester]); // This will re-run whenever selectedBatch or selectedSemester changes

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    // Reset batch stats
    setBatchStats({
      totalStudents: 0,
      averageCurricular: 0,
      averageCoCurricular: 0,
      averageExtraCurricular: 0
    });

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
        // First get the batch ID from the batch name
        try {
          // Get all batches
          const batchesResponse = await axios.get('http://localhost:5001/api/batches/getAllBatches');
          console.log('Batches response:', batchesResponse.data);

          // Find the batch ID for the selected batch name
          const selectedBatchObj = batchesResponse.data.find(batch => batch.batchName === selectedBatch);

          if (selectedBatchObj && selectedBatchObj.id) {
            // Fetch students by batch ID
            url = `http://localhost:5001/api/students/getStudentsByBatch/${selectedBatchObj.id}`;
            console.log('Fetching from URL:', url);
            response = await axios.get(url);
            console.log('Students by batch response:', response.data);
          } else {
            throw new Error(`Batch ID not found for batch name: ${selectedBatch}`);
          }
        } catch (batchError) {
          console.error('Error fetching batch ID:', batchError);
          setError(`Failed to get batch ID for ${selectedBatch}. Please try again.`);
          setStudents([]);
          setLoading(false);
          return;
        }
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
        const formattedStudents = Array.isArray(dataToProcess) ? await Promise.all(dataToProcess.map(async student => {
          console.log('Processing student:', student);

          // Initialize points object with curricular as 0
          let points = {
            curricular: 0, // Keep curricular points as zero as requested
            coCurricular: 0,
            extraCurricular: 0
          };

          // Fetch co-curricular and extra-curricular points from student_points table
          try {
            let enrollmentNumber = student.enrollmentNumber || student.rollNo;
            let semester = student.semesterNumber || student.currnetsemester || selectedSemester;

            if (enrollmentNumber && semester) {
              console.log('Fetching points for student:', enrollmentNumber, 'semester:', semester);

              const pointsResponse = await axios.post('http://localhost:5001/api/events/fetchEventsbyEnrollandSemester', {
                enrollmentNumber,
                semester
              });

              console.log('Student points response:', pointsResponse.data);

              if (pointsResponse.data && Array.isArray(pointsResponse.data) && pointsResponse.data.length > 0) {
                // Reset points before summing (in case of multiple entries)
                points.coCurricular = 0;
                points.extraCurricular = 0;

                // Sum up all co-curricular and extra-curricular points
                pointsResponse.data.forEach(activity => {
                  // Make sure we're working with numbers by using parseInt with base 10
                  const coPoints = parseInt(activity.totalCocurricular || 0, 10);
                  const extraPoints = parseInt(activity.totalExtracurricular || 0, 10);

                  console.log(`Adding points for ${enrollmentNumber}: Co-curricular: ${coPoints}, Extra-curricular: ${extraPoints}`);

                  points.coCurricular += coPoints;
                  points.extraCurricular += extraPoints;
                });

                console.log(`Total points for ${enrollmentNumber}: Co-curricular: ${points.coCurricular}, Extra-curricular: ${points.extraCurricular}`);
              } else if (pointsResponse.data && typeof pointsResponse.data === 'object') {
                // If it's a single object (either in array[0] or direct object)
                let pointsData = pointsResponse.data;

                // Handle both array with one object and direct object
                if (Array.isArray(pointsResponse.data) && pointsResponse.data.length === 1) {
                  pointsData = pointsResponse.data[0];
                }

                // Now safely extract the points
                if (pointsData.totalCocurricular !== undefined || pointsData.totalExtracurricular !== undefined) {
                  points.coCurricular = parseInt(pointsData.totalCocurricular || 0, 10);
                  points.extraCurricular = parseInt(pointsData.totalExtracurricular || 0, 10);

                  console.log(`Direct points for ${enrollmentNumber}: Co-curricular: ${points.coCurricular}, Extra-curricular: ${points.extraCurricular}`);
                }
              }
            }
          } catch (error) {
            console.error('Error fetching student points:', error);
            // Keep the default values if there's an error
          }

          return {
            id: student.id || Math.random().toString(36).substr(2, 9),
            name: student.name || student.studentName || 'Unknown',
            rollNo: student.enrollmentNumber || student.rollNo || 'N/A',
            batch: student.batchName || (student.Batch ? student.Batch.batchName : selectedBatch),
            semester: student.semesterNumber || student.currnetsemester || selectedSemester,
            email: student.email || 'N/A',
            parentEmail: student.parentEmail || 'N/A',
            points: points
          };
        })) : [];

        console.log('Formatted students:', formattedStudents);
        const processedStudents = formattedStudents;

        // Process and set the students data
        console.log('Setting students state with:', processedStudents);
        setStudents(processedStudents);

        // Calculate batch statistics
        if (processedStudents.length > 0) {
          const totalCurricular = processedStudents.reduce((sum, student) => sum + (student.points?.curricular || 0), 0);
          const totalCoCurricular = processedStudents.reduce((sum, student) => sum + (student.points?.coCurricular || 0), 0);
          const totalExtraCurricular = processedStudents.reduce((sum, student) => sum + (student.points?.extraCurricular || 0), 0);

          setBatchStats({
            totalStudents: processedStudents.length,
            averageCurricular: Math.round(totalCurricular / processedStudents.length),
            averageCoCurricular: Math.round(totalCoCurricular / processedStudents.length),
            averageExtraCurricular: Math.round(totalExtraCurricular / processedStudents.length)
          });
        } else {
          setBatchStats({
            totalStudents: 0,
            averageCurricular: 0,
            averageCoCurricular: 0,
            averageExtraCurricular: 0
          });
        }
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
    // Check if the button is already selected (toggle functionality)
    const isAlreadySelected = pointsFilters[category] === order;

    // Update the points filters state - if already selected, set to null (unselected)
    setPointsFilters(prev => ({
      ...prev,
      [category]: isAlreadySelected ? null : order
    }));

    // Call the parent component's filter handler if provided
    if (onPointsFilter) {
      // Pass null as order if toggling off, otherwise pass the order
      onPointsFilter(category, isAlreadySelected ? null : order);
    }

    // Update local sort config - if already selected, clear the sort
    if (isAlreadySelected) {
      setSortConfig({
        key: null,
        direction: 'ascending'
      });
    } else {
      setSortConfig({
        key: `points.${category}`,
        direction: order === 'high' ? 'descending' : 'ascending'
      });
    }
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

  // Function to open student detail modal
  const openStudentDetailModal = async (student) => {
    setSelectedStudentDetail(student);
    setShowDetailModal(true);

    // Fetch detailed academic data for the student if we have enrollment number
    if (student && student.rollNo) {
      try {
        const response = await axios.get(`http://localhost:5001/api/studentCPI/enrollment/${student.rollNo}`);
        if (response.data) {
          // Backend returns an array of records ordered by Semester.semesterNumber ASC
          const records = Array.isArray(response.data) ? response.data : [];

          // Map to a normalized semester list for the table
          const semesterData = records.map((rec, idx) => ({
            semester: rec?.Semester?.semesterNumber ?? rec?.semesterNumber ?? (idx + 1),
            SPI: rec?.SPI ?? rec?.spi ?? 'N/A',
            CPI: rec?.CPI ?? rec?.cpi ?? 'N/A',
            creditsEarned: rec?.creditsEarned ?? 'N/A',
            creditsTaken: rec?.creditsTaken ?? 'N/A',
          }));

          // Determine current semester metrics from last record
          const last = records.length > 0 ? records[records.length - 1] : null;
          const transformed = {
            CPI: last?.CPI ?? last?.cpi ?? null,
            currentSPI: last?.SPI ?? last?.spi ?? null,
            semesterData,
          };

          setStudentAcademicData(transformed);
          console.log('Fetched academic data (transformed):', transformed);
        }
      } catch (error) {
        console.error('Error fetching student academic data:', error);
        setStudentAcademicData(null);
      }
    }
  };

  // Function to close student detail modal
  const closeStudentDetailModal = () => {
    setShowDetailModal(false);
    setSelectedStudentDetail(null);
    setStudentAcademicData(null);
  };

  // Function to handle select all students checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // If checked, select all filtered students
      if (onStudentSelect && typeof onStudentSelect === 'function') {
        sortedStudents.forEach(student => onStudentSelect(student));
      }
    }
  };

  // Render the component with a separate modal outside the main return
  const renderStudentDetailModal = () => {
    if (!showDetailModal || !selectedStudentDetail) {
      return null;
    }

    return (
      <div className="student-detail-modal">
        <div className="student-detail-content">
          <div className="student-detail-header">
            <h3>Student Details</h3>
            <button onClick={closeStudentDetailModal} className="modal-close-btn">&times;</button>
          </div>
          <div className="student-detail-body">
            <div className="student-info-section">
              <h4>Personal Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Name</div>
                  <div className="info-value">{selectedStudentDetail.name}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Enrollment Number</div>
                  <div className="info-value">{selectedStudentDetail.rollNo}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Batch</div>
                  <div className="info-value">{selectedStudentDetail.batch}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Semester</div>
                  <div className="info-value">{selectedStudentDetail.semester}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Email</div>
                  <div className="info-value">{selectedStudentDetail.email}</div>
                </div>
                {selectedStudentDetail.parentEmail && (
                  <div className="info-item">
                    <div className="info-label">Parent Email</div>
                    <div className="info-value">{selectedStudentDetail.parentEmail}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="student-info-section">
              <h4>Performance Summary</h4>
              <div className="performance-grid">
                <div className="performance-item">
                  <div className="performance-label">Curricular Points</div>
                  <div className="performance-value">{selectedStudentDetail.points.curricular}</div>
                  <div className="performance-bar-container">
                    <div
                      className="performance-bar curricular"
                      style={{ width: `${Math.min(selectedStudentDetail.points.curricular, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="performance-item">
                  <div className="performance-label">Co-Curricular Points</div>
                  <div className="performance-value">{selectedStudentDetail.points.coCurricular}</div>
                  <div className="performance-bar-container">
                    <div
                      className="performance-bar co-curricular"
                      style={{ width: `${Math.min(selectedStudentDetail.points.coCurricular, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="performance-item">
                  <div className="performance-label">Extra-Curricular Points</div>
                  <div className="performance-value">{selectedStudentDetail.points.extraCurricular}</div>
                  <div className="performance-bar-container">
                    <div
                      className="performance-bar extra-curricular"
                      style={{ width: `${Math.min(selectedStudentDetail.points.extraCurricular, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Performance Section */}
            <div className="student-info-section">
              <h4>Academic Performance</h4>
              {studentAcademicData ? (
                <div className="academic-data-container">
                  <div className="academic-summary">
                    <div className="academic-item">
                      <div className="academic-label">Current CPI</div>
                      <div className="academic-value highlight">
                        {studentAcademicData.CPI || 'N/A'}
                      </div>
                    </div>
                    <div className="academic-item">
                      <div className="academic-label">Current SPI</div>
                      <div className="academic-value highlight">
                        {studentAcademicData.currentSPI || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {studentAcademicData.semesterData && studentAcademicData.semesterData.length > 0 ? (
                    <table className="academic-table">
                      <thead>
                        <tr>
                          <th>Semester</th>
                          <th>SPI</th>
                          <th>CPI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentAcademicData.semesterData.map((sem, index) => (
                          <tr key={index}>
                            <td>{sem.semesterName || sem.semester || index + 1}</td>
                            <td>{sem.SPI || 'N/A'}</td>
                            <td>{sem.CPI || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No semester data available.</p>
                  )}
                </div>
              ) : (
                <p>No academic data available for this student.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="student-table-container">
        {error && <div className="error-message">{error}</div>}
        <div className="table-header">
          <h3 className="table-title">Student Performance {loading && <span className="loading-indicator">Loading...</span>}</h3>

          <div className="batch-stats">
            <span className="stat-item">Total Students: <span className="stat-value">{batchStats.totalStudents}</span></span>
          </div>

          <div className="table-filters">
            {/* Curricular Points Filter */}
            <div className="filter-dropdown">
              <label>Curricular Points:</label>
              <div className="dropdown-buttons">
                <button
                  className={pointsFilters.curricular === 'high' ? 'active' : ''}
                  onClick={() => handlePointsFilterInternal('curricular', 'high')}
                >
                  High to Low
                </button>
                <button
                  className={pointsFilters.curricular === 'low' ? 'active' : ''}
                  onClick={() => handlePointsFilterInternal('curricular', 'low')}
                >
                  Low to High
                </button>
              </div>
            </div>

            {/* Co-curricular Points Filter */}
            <div className="filter-dropdown">
              <label>Co-curricular Points:</label>
              <div className="dropdown-buttons">
                <button
                  className={pointsFilters.coCurricular === 'high' ? 'active' : ''}
                  onClick={() => handlePointsFilterInternal('coCurricular', 'high')}
                >
                  High to Low
                </button>
                <button
                  className={pointsFilters.coCurricular === 'low' ? 'active' : ''}
                  onClick={() => handlePointsFilterInternal('coCurricular', 'low')}
                >
                  Low to High
                </button>
              </div>
            </div>

            {/* Extra-curricular Points Filter */}
            <div className="filter-dropdown">
              <label>Extra-curricular Points:</label>
              <div className="dropdown-buttons">
                <button
                  className={pointsFilters.extraCurricular === 'high' ? 'active' : ''}
                  onClick={() => handlePointsFilterInternal('extraCurricular', 'high')}
                >
                  High to Low
                </button>
                <button
                  className={pointsFilters.extraCurricular === 'low' ? 'active' : ''}
                  onClick={() => handlePointsFilterInternal('extraCurricular', 'low')}
                >
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
                      <div className="action-buttons">
                        <button
                          className="dashboard-HOD-btn-view"
                          onClick={() => onStudentSelect(student)}
                        >
                          Analysis
                        </button>
                        <button
                          className="dashboard-HOD-btn-details"
                          onClick={() => openStudentDetailModal(student)}
                        >
                          Details
                        </button>
                      </div>
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
      {renderStudentDetailModal()}
    </>
  );
};

export default StudentTable;