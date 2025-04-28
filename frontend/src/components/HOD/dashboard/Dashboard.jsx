import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import Faculty from "../managefaculty/Faculty";
import StudentsList from '../../HOD/displaystudents/StudentsList';
import StudentDetail from '../../HOD/displaystudents/StudentDetails';
import Subject from '../../HOD/managesubjects/Subject';
import ManageBatches from '../managebatches/ManageBatches';
import Upgradegrade from '../upgradegrade/Upgradegrade';
import StudentAnalysisPage from '../StudentAnalysis/StudentAnalysis';
import StudentAnalysis from './StudentAnalysis'; 
import EventManagement from '../events/EventManagement';
import FilterSection from './FilterSection';
import PerformanceOverview from "./PerformanceOverview";
import StudentTable from './StudentTable';
import EmailNotification from './EmailNotification';
import ReportGenerator from './ReportGenerator';
import './Dashboard.css';

const DashboardHOD = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        const mockStudents = generateMockStudentData();
        setStudents(mockStudents);
        setFilteredStudents(mockStudents);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const generateMockStudentData = () => {
    const batches = ['2020', '2021', '2022', '2023'];
    const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

    return Array(50).fill().map((_, index) => ({
      id: index + 1,
      name: `Student ${index + 1}`,
      rollNo: `CS${2000 + index}`,
      batch: batches[Math.floor(Math.random() * batches.length)],
      semester: semesters[Math.floor(Math.random() * semesters.length)],
      email: `student${index + 1}@university.edu`,
      parentEmail: `parent${index + 1}@gmail.com`,
      points: {
        curricular: Math.floor(Math.random() * 100),
        coCurricular: Math.floor(Math.random() * 100),
        extraCurricular: Math.floor(Math.random() * 100)
      },
      history: Array(4).fill().map((_, i) => ({
        semester: `${parseInt(semesters[Math.floor(Math.random() * semesters.length)]) - i}`,
        points: {
          curricular: Math.floor(Math.random() * 100),
          coCurricular: Math.floor(Math.random() * 100),
          extraCurricular: Math.floor(Math.random() * 100)
        },
        events: {
          curricular: Math.random() > 0.5,
          coCurricular: Math.random() > 0.5,
          extraCurricular: Math.random() > 0.5
        }
      })).filter((item) => parseInt(item.semester) > 0)
    }));
  };

  const handleFilterChange = (batchValue, semesterValue) => {
    setSelectedBatch(batchValue);
    setSelectedSemester(semesterValue);

    let filtered = [...students];

    if (batchValue !== 'all') {
      filtered = filtered.filter(student => student.batch === batchValue);
    }

    if (semesterValue !== 'all') {
      filtered = filtered.filter(student => student.semester === semesterValue);
    }

    setFilteredStudents(filtered);
  };

  const handlePointsFilter = (category, order) => {
    let sorted = [...filteredStudents];

    if (order === 'high') {
      sorted.sort((a, b) => b.points[category] - a.points[category]);
    } else {
      sorted.sort((a, b) => a.points[category] - b.points[category]);
    }

    setFilteredStudents(sorted);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowAnalysisModal(true);
  };

  const handleEmailModalOpen = () => {
    setShowEmailModal(true);
  };

  const handleReportModalOpen = () => {
    setShowReportModal(true);
  };

  // Handler for student details view in the students section
  const handleStudentDetailsSelect = (studentId) => {
    setSelectedStudentId(studentId);
    setShowStudentDetails(true);
  };

  // Handler to go back to students list
  const handleBackToList = () => {
    setShowStudentDetails(false);
    setSelectedStudentId(null);
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard data...</div>;
  }

  return (
    <div className={`dashboard-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <Sidebar
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className={`dashboard-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="main-content">
          <div className="dashboard-content">
            {activeItem === 'dashboard' && (
              <>
                <div className="dashboard-container">
                  <header className="dashboard-header">
                    <h1>HOD Dashboard</h1>
                    <div className="dashboard-actions">
                      <button className="btn-primary" onClick={handleEmailModalOpen}>
                        Send Email Notifications
                      </button>
                      <button className="btn-secondary" onClick={handleReportModalOpen}>
                        Generate Reports
                      </button>
                    </div>
                  </header>

                  <div className="dashboard-content">
                    <div className="charts-row">
                      <PerformanceOverview students={filteredStudents} />
                    </div>

                    <div className="students-row">
                      <FilterSection
                        selectedBatch={selectedBatch}
                        selectedSemester={selectedSemester}
                        onFilterChange={handleFilterChange}
                      />
                      <StudentTable
                        students={filteredStudents}
                        onPointsFilter={handlePointsFilter}
                        onStudentSelect={handleStudentSelect}
                      />
                    </div>
                  </div>

                  {showEmailModal && (
                    <EmailNotification
                      students={filteredStudents}
                      onClose={() => setShowEmailModal(false)}
                    />
                  )}

                  {showReportModal && (
                    <ReportGenerator
                      students={filteredStudents}
                      selectedBatch={selectedBatch}
                      selectedSemester={selectedSemester}
                      onClose={() => setShowReportModal(false)}
                    />
                  )}

                  {/* Use local StudentAnalysis component for the modal */}
                  {showAnalysisModal && selectedStudent && (
                    <StudentAnalysis
                      student={selectedStudent}
                      onClose={() => {
                        setShowAnalysisModal(false);
                        setSelectedStudent(null);
                      }}
                    />
                  )}
                </div>
              </>
            )}

            {activeItem === 'students' && (
              <>
                {showStudentDetails ? (
                  <StudentDetail
                    studentId={selectedStudentId}
                    handleBackToList={handleBackToList}
                  />
                ) : (
                  <StudentsList onStudentSelect={handleStudentDetailsSelect} />
                )}
              </>
            )}
            {activeItem === 'faculty' && <Faculty />}
            {activeItem === 'batches' && <ManageBatches />}
            {activeItem === 'subjects' && <Subject />}
            {/* Use StudentAnalysisPage for the sidebar navigation */}
            {activeItem === 'studentAnalysis' && <StudentAnalysisPage />}
            {activeItem === 'events' && <EventManagement />}
            {!(activeItem === 'dashboard' || activeItem === 'students' || 
              activeItem === 'faculty' || activeItem === 'subjects' || activeItem === 'batches' ||
              activeItem === 'studentAnalysis' || activeItem === 'events') && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>No content available for this section.</h3>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHOD;