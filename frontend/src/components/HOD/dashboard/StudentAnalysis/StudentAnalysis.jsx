
import React, { useState, useEffect } from 'react';
import Filters from './Filters';
import StudentTable from './StudentTable';
import StudentDetails from './StudentDetails';
import { dummyStudents } from './dummyData';
import './studentAnalysis.css';

const StudentAnalysis = () => {
  const [selectedBatch, setSelectedBatch] = useState('2022-26');
  const [selectedSemester, setSelectedSemester] = useState('Semester 1');
  const [selectedCategory, setSelectedCategory] = useState('Curricular Activity');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalScore', direction: 'desc' });

  // Fetch students data based on filters
  useEffect(() => {
    // In a real app, this would be an API call
    const filteredStudents = dummyStudents.filter(
      student => 
        student.batch === selectedBatch && 
        student.semester === selectedSemester
    );
    
    setStudents(filteredStudents);
    setSelectedStudent(null); // Reset selected student when filters change
  }, [selectedBatch, selectedSemester, selectedCategory]);

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort students
  const sortedStudents = React.useMemo(() => {
    let sortableStudents = [...students];
    if (sortConfig.key) {
      sortableStudents.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStudents;
  }, [students, sortConfig]);

  // Filter students by search query
  const filteredStudents = React.useMemo(() => {
    return sortedStudents.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedStudents, searchQuery]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    // Scroll to the student details section
    setTimeout(() => {
      document.getElementById('student-details-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
  };

  return (
    <div className="student-analysis-container">
      <h1 className="page-title">Student Analysis Dashboard</h1>
      
      <Filters
        selectedBatch={selectedBatch}
        setSelectedBatch={setSelectedBatch}
        selectedSemester={selectedSemester}
        setSelectedSemester={setSelectedSemester}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      
      <StudentTable
        students={filteredStudents}
        onViewDetails={handleViewDetails}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      
      {selectedStudent && (
        <div id="student-details-section">
          <StudentDetails 
            student={selectedStudent} 
            onClose={handleCloseDetails}
            category={selectedCategory}
          />
        </div>
      )}
    </div>
  );
};

export default StudentAnalysis;