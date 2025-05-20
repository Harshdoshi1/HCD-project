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
    // Set initial loading state to false since we're not pre-loading data anymore
    setLoading(false);
  }, []);
  

  const handleFilterChange = (batchValue, semesterValue) => {
    console.log('Dashboard: Filter changed to:', { batchValue, semesterValue });
    
    // Update state with the new filter values
    setSelectedBatch(batchValue);
    setSelectedSemester(semesterValue);
    
    // Clear filtered students since we're now fetching directly in the StudentTable
    setFilteredStudents([]);
    
    // The StudentTable component will fetch filtered data directly from the API
    // based on these values because we pass selectedBatch and selectedSemester as props
  };

  // This function is now handled directly in the StudentTable component
  const handlePointsFilter = (category, order) => {
    console.log('Points filter:', { category, order });
    // The sorting is now handled in the StudentTable component
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
                    

                    <div className="students-row">
                      <FilterSection
                        selectedBatch={selectedBatch}
                        selectedSemester={selectedSemester}
                        onFilterChange={handleFilterChange}
                      />
                      <div className="charts-row">
                        <PerformanceOverview 
                          selectedBatch={selectedBatch}
                          selectedSemester={selectedSemester}
                        />
                      </div>
                      <StudentTable
                        selectedBatch={selectedBatch}
                        selectedSemester={selectedSemester}
                        onPointsFilter={handlePointsFilter}
                        onStudentSelect={handleStudentSelect}
                      />
                    </div>
                  </div>

                  {showEmailModal && (
                    <EmailNotification
                      selectedBatch={selectedBatch}
                      selectedSemester={selectedSemester}
                      onClose={() => setShowEmailModal(false)}
                    />
                  )}

                  {showReportModal && (
                    <ReportGenerator
                      selectedBatch={selectedBatch}
                      selectedSemester={selectedSemester}
                      onClose={() => setShowReportModal(false)}
                    />
                  )}

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