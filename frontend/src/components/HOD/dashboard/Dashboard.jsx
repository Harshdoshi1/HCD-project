

import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import Faculty from "../dashboard/managefaculty/Faculty";
import StudentsList from '../../HOD/displaystudents/StudentsList';
import StudentDetail from '../../HOD/displaystudents/StudentDetails';
import Subject from '../../HOD/managesubjects/Subject';
import './Dashboard.css';


const DashboardHOD = () => {
    const [activeItem, setActiveItem] = useState('dashboard');

    const [selectedStudentId, setSelectedStudentId] = useState(null);

    const handleStudentSelect = (studentId) => {
        setSelectedStudentId(studentId);
    };

    const handleBackToList = () => {
        setSelectedStudentId(null);
    };
    // const [activeItem, setActiveItem] = useState('dashboard');
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
                                    {selectedStudentId ? (
                                        <div>
                                            <button
                                                onClick={handleBackToList}
                                                className="back-button"
                                            >
                                                Back to Students List
                                            </button>
                                            <StudentDetail studentId={selectedStudentId} />
                                        </div>
                                    ) : (
                                        <StudentsList onStudentSelect={handleStudentSelect} />
                                    )}
                                </>
                            )}

                            {activeItem === 'faculty' && <Faculty />}
                            {activeItem === 'subjects' && <Subject />}</>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default DashboardHOD;
