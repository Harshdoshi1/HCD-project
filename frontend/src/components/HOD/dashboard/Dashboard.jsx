import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import Faculty from "../managefaculty/Faculty";
import StudentsList from '../../HOD/displaystudents/StudentsList';
import StudentDetail from '../../HOD/displaystudents/StudentDetails';
import Subject from '../../HOD/managesubjects/Subject';
import ManageBatches from '../managebatches/ManageBatches';
import Upgradegrade from '../upgradegrade/Upgradegrade';
import StudentAnalysis from '../StudentAnalysis/StudentAnalysis';
import EventManagement from '../events/EventManagement';
import './Dashboard.css';

const DashboardHOD = () => {
    const [activeItem, setActiveItem] = useState('dashboard');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [showStudentDetails, setShowStudentDetails] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleStudentSelect = (studentId) => {
        setSelectedStudentId(studentId);
        setShowStudentDetails(true);
    };

    const handleBackToList = () => {
        setShowStudentDetails(false);
    };

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
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <h3>Welcome to the HOD Dashboard</h3>
                                        {/* <p>Manage your faculty, students, and subjects here.</p> */}
                                    </div>
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
                                    <StudentsList onStudentSelect={handleStudentSelect} />
                                )}
                            </>
                        )}
                        {activeItem === 'grades' && <Upgradegrade />}
                        {activeItem === 'faculty' && <Faculty />}
                        {activeItem === 'batches' && <ManageBatches />}
                        {activeItem === 'subjects' && <Subject />}
                        {activeItem === 'studentAnalysis' && <StudentAnalysis />}
                        {activeItem === 'events' && <EventManagement />}
                        {!(activeItem === 'dashboard' || activeItem === 'students' || activeItem === 'grades' ||
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
