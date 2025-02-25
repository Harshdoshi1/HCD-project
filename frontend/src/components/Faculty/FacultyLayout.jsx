import React, { useState } from 'react';
import Sidebar from './sidebar/Sidebar';
import StudentGrades from './grading/StudentGrades';
import Assignedsubjects from './assignedSubjects/Assignedsubjects';
import './FacultyLayout.css';

const FacultyLayout = () => {
    const [activeItem, setActiveItem] = useState('dashboard');
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="faculty-layout">
            <Sidebar
                activeItem={activeItem}
                setActiveItem={setActiveItem}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
            />
            <main className={`faculty-main ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                <div className="dashboard-content">
                    {activeItem === 'dashboard' && (
                        <>
                            <div className="dashboard-sections">



                            </div>
                        </>
                    )}
                    {activeItem === 'grades' && <StudentGrades />}
                    {activeItem === 'subjects' && <Assignedsubjects />}
                </div>
            </main>
        </div>
    );
};

export default FacultyLayout;
