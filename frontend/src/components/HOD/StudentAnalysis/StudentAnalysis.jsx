import React, { useState, useEffect } from 'react';
import Filters from './Filters';
import StudentTable from './StudentTable';
import StudentDetails from './StudentDetails';
import StudentPerformance from './StudentPerformance';
import { dummyStudents } from './dummyData';
import './studentAnalysis.css';
import './StudentPerformance.css';

const StudentAnalysis = () => {
  const [selectedBatch, setSelectedBatch] = useState('2022-26');
  const [selectedSemester, setSelectedSemester] = useState('Semester 1');
  const [selectedCategory, setSelectedCategory] = useState('Curricular Activity');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalScore', direction: 'desc' });
  const [showDetails, setShowDetails] = useState(false);

  // Fetch students data based on filters
  useEffect(() => {
    const filteredStudents = dummyStudents.filter(
      student =>
        student.batch === selectedBatch &&
        student.semester === selectedSemester
    );
    setStudents(filteredStudents);
    setSelectedStudent(null);
  }, [selectedBatch, selectedSemester, selectedCategory]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
    setShowDetails(false);
  };

  return (
    <div className="student-analysis-container">
      <div className="main-content">
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-item">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                Performance Analytics style={{ width: '100px' }}
              >
                <option value="2022-26">2022-26</option>
                <option value="2023-27">2023-27</option>
              </select>
            </div>
            <div className="filter-item">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                style={{ width: '100px' }}
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>
            <div className="filter-item">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="Curricular Activity">Curricular Activity</option>
                <option value="Co-Curricular Activity">Co-Curricular Activity</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          {showDetails ? (
            <div className="student-details-wrapper">
              <div className="back-button" onClick={handleCloseDetails}>
                <i className="fas fa-arrow-left"></i> Back to Student List
              </div>
              <StudentDetails
                key={selectedStudent?.id}
                student={selectedStudent}
                onClose={handleCloseDetails}
                category={selectedCategory}
              />
              <StudentPerformance key={selectedStudent?.id} student={selectedStudent} />
            </div>
          ) : (
            <StudentTable
              key={selectedBatch + selectedSemester + searchQuery}
              students={students}
              onViewDetails={handleViewDetails}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortConfig={sortConfig}
              onSort={() => { }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysis;