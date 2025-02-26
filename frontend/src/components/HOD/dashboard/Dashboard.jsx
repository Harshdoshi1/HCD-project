import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import Faculty from "../dashboard/managefaculty/Faculty";
import StudentsList from '../../HOD/displaystudents/StudentsList';
import StudentDetail from '../../HOD/displaystudents/StudentDetails';
import Subject from '../../HOD/managesubjects/Subject';
import ManageBatches from '../managebatches/ManageBatches';
import './Dashboard.css';

const DashboardHOD = () => {
    const [activeItem, setActiveItem] = useState('dashboard');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [showStudentDetails, setShowStudentDetails] = useState(false);

    const handleStudentSelect = (studentId) => {
        setSelectedStudentId(studentId);
        setShowStudentDetails(true);
    };

    const handleBackToList = () => {
        setShowStudentDetails(false);
    };
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className={`dashboard-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
            <div className={`dashboard-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="main-content">
                    <div className="dashboard-content">
                        <>
                            {activeItem === 'dashboard' && (
                                <>
                                    <div className="stats-grid">
                                        home page for HOD
                                    </div>
                                </>
                            )}

                            {activeItem === 'students' && (
                                <>
                                    {showStudentDetails ? (
                                        <div>

                                            <StudentDetail
                                                studentId={selectedStudentId}
                                                handleBackToList={handleBackToList}
                                            />
                                        </div>
                                    ) : (
                                        <StudentsList
                                            onStudentSelect={(id) => {
                                                setSelectedStudentId(id);
                                                setShowStudentDetails(true);
                                            }}
                                        />
                                    )}
                                </>
                            )}

                            {activeItem === 'faculty' && <Faculty />}
                            {activeItem === 'subjects' && <Subject />}
                            {activeItem === 'batches' && <ManageBatches />}
                        </>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHOD;
