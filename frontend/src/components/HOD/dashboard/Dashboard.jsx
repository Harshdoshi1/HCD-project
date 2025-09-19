import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import PerformanceOverview from "./PerformanceOverview";
import StudentTable from './StudentTable';
import EmailNotification from './EmailNotification';
import ReportGenerator from './ReportGenerator';
import './Dashboard.css';
import { useLocation, useNavigate } from 'react-router-dom';

const DashboardHOD = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([
    // Dummy student data for modals
    {
      id: 1,
      name: 'John Doe',
      rollNo: 'CS001',
      batch: '2022',
      semester: '3',
      points: { curricular: 75, coCurricular: 60, extraCurricular: 85 },
      history: [
        { semester: '1', points: { curricular: 70, coCurricular: 55, extraCurricular: 80 } },
        { semester: '2', points: { curricular: 72, coCurricular: 58, extraCurricular: 82 } }
      ]
    },
    {

      id: 2,

      name: 'Jane Smith',
      rollNo: 'CS002',
      batch: '2022',
      semester: '3',
      points: { curricular: 85, coCurricular: 70, extraCurricular: 65 },
      history: [
        { semester: '1', points: { curricular: 80, coCurricular: 65, extraCurricular: 60 } },
        { semester: '2', points: { curricular: 82, coCurricular: 68, extraCurricular: 62 } }
      ]
    },
    {
      id: 3,
      name: 'Alex Johnson',
      rollNo: 'CS003',
      batch: '2023',
      semester: '1',
      points: { curricular: 65, coCurricular: 80, extraCurricular: 75 },
      history: []
    }
  ]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [batches, setBatches] = useState(['all']);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState(null);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Map between URL segment and internal activeItem
  const sectionToItem = {
    '': 'dashboard',
    dashboard: 'dashboard',
    students: 'students',
    faculty: 'faculty',
    batches: 'batches',
    subjects: 'subjects',
    events: 'events',
    'student-analysis': 'studentAnalysis',
    studentAnalysis: 'studentAnalysis',
  };

  const itemToPath = {
    dashboard: '',
    students: 'students',
    faculty: 'faculty',
    batches: 'batches',
    subjects: 'subjects',
    events: 'events',
    studentAnalysis: 'student-analysis',
  };

  // Sync state from URL on location change (supports direct URL + reload)
  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) return;
    const parts = location.pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
    const section = parts[0] || '';
    const item = sectionToItem[section] || 'dashboard';
    if (activeItem !== item) {
      setActiveItem(item);
    }

    // Students detail route: /admin/students/:id
    if (item === 'students' && parts[1]) {
      setSelectedStudentId(parts[1]);
      setShowStudentDetails(true);
    } else if (item === 'students') {
      setShowStudentDetails(false);
      setSelectedStudentId(null);
    } else {
      // Leaving students section resets detail view
      setShowStudentDetails(false);
      setSelectedStudentId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Wrapper to update both state and URL when switching sections (via sidebar)
  const handleSetActiveItem = (item) => {
    setActiveItem(item);
    const path = itemToPath[item] ?? '';
    navigate(path ? `/admin/${path}` : '/admin', { replace: false });
  };

  useEffect(() => {
    // Set initial loading state to false since we're not pre-loading data anymore
    setLoading(false);
    // Fetch batches when component mounts
    fetchBatches();
  }, []);

  // Fetch all batches
  const fetchBatches = async () => {
    setBatchLoading(true);
    setBatchError(null);
    try {
      console.log('Fetching batches...');
      const response = await axios.get('http://localhost:5001/api/batches/getAllBatches');
      console.log('Batch API response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        // The API returns an array of batch objects directly
        const batchNames = response.data.map(batch => {
          console.log('Batch object:', batch);
          return batch.batchName;
        });
        console.log('Extracted batch names:', batchNames);

        // Add 'all' option to the beginning of the array
        const allBatches = ['all', ...batchNames];
        console.log('Setting batches state to:', allBatches);
        setBatches(allBatches);
      } else {
        console.error('Invalid batch data format:', response.data);
        setBatchError('Invalid batch data format');
        setBatches(['all']);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
      setBatchError('Failed to load batches');
      setBatches(['all']);
    } finally {
      setBatchLoading(false);
    }
  };

  // Toggle batch dropdown visibility
  const toggleBatchDropdown = () => {
    setShowBatchDropdown(!showBatchDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBatchDropdown && !event.target.closest('.batch-filter-container')) {
        setShowBatchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBatchDropdown]);


  const handleFilterChange = (batchValue) => {
    console.log('Dashboard: Filter changed to batch:', batchValue);

    // Update state with the new filter values
    setSelectedBatch(batchValue);
    // Always use 'all' for semester since we removed the semester filter
    setSelectedSemester('all');

    // Close the dropdown after selection
    setShowBatchDropdown(false);

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
    console.log('Opening email modal');
    setShowEmailModal(true);
  };

  const handleReportModalOpen = () => {
    console.log('Opening report modal');
    setShowReportModal(true);
  };

  // Handler for student details view in the students section
  const handleStudentDetailsSelect = (studentId) => {
    setSelectedStudentId(studentId);
    setShowStudentDetails(true);
    // Reflect in URL so reload/direct link works
    navigate(`/admin/students/${studentId}`, { replace: false });
  };

  // Handler to go back to students list
  const handleBackToList = () => {
    setShowStudentDetails(false);
    setSelectedStudentId(null);
    navigate('/admin/students', { replace: false });
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard data...</div>;
  }

  return (
    <div className={`dashboard-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <Sidebar
        activeItem={activeItem}
        setActiveItem={handleSetActiveItem}
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
                    <div className="dashboard-controls">
                      <div className="batch-filter-container">
                        <div className="batch-filter-selected" onClick={toggleBatchDropdown}>
                          <span>{selectedBatch === 'all' ? 'All Batches' : `Batch ${selectedBatch}`}</span>
                          <i className={`batch-dropdown-icon ${showBatchDropdown ? 'open' : ''}`}>▼</i>
                        </div>
                        {showBatchDropdown && (
                          <div className="batch-filter-dropdown">
                            {batchLoading ? (
                              <div className="batch-loading">Loading batches...</div>
                            ) : (
                              <ul>
                                {batches.map((batch) => (
                                  <li
                                    key={batch}
                                    className={batch === selectedBatch ? 'active' : ''}
                                    onClick={() => handleFilterChange(batch)}
                                  >
                                    {batch === 'all' ? 'All Batches' : `Batch ${batch}`}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {batchError && <div className="batch-error">{batchError}</div>}
                          </div>
                        )}
                      </div>
                      <div className="dashboard-actions">
                        {/* <button className="btn-primary" onClick={handleEmailModalOpen}>
                          Acedemic Reports
                        </button> */}
                        <button className="btn-secondary" onClick={handleReportModalOpen}>
                          Generate Reports
                        </button>
                      </div>
                    </div>
                  </header>

                  <div className="dashboard-content">
                    <div className="students-row">
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
                    <div className="modal-overlay">
                      <EmailNotification
                        students={students}
                        selectedBatch={selectedBatch}
                        selectedSemester={selectedSemester}
                        onClose={() => setShowEmailModal(false)}
                      />
                    </div>
                  )}

                  {showReportModal && (
                    <div className="modal-overlay">
                      <ReportGenerator
                        students={students}
                        selectedBatch={selectedBatch}
                        selectedSemester={selectedSemester}
                        onClose={() => setShowReportModal(false)}
                      />
                    </div>
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