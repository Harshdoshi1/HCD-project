import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './sidebar/Sidebar';
import StudentGrades from './grading/StudentGrades';
import Assignedsubjects from './assignedSubjects/Assignedsubjects';
import './FacultyLayout.css';

const FacultyLayout = () => {
    const location = useLocation();
    
    // Initialize with 'subjects' as default, or extract from URL if available
    const [activeItem, setActiveItem] = useState(() => {
        // Check if path contains subjects or grades
        if (location.pathname.includes('/faculty/subjects')) {
            return 'subjects';
        } else if (location.pathname.includes('/faculty/grades')) {
            return 'grades';
        }
        
        // Fallback to localStorage or default
        const savedPage = localStorage.getItem('facultyActivePage');
        return savedPage || 'subjects';
    });
    const [isExpanded, setIsExpanded] = useState(true);
    
    // Save active page to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('facultyActivePage', activeItem);
    }, [activeItem]);

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
                    {activeItem === 'grades' && <StudentGrades />}
                    {activeItem === 'subjects' && <Assignedsubjects />}
                </div>
            </main>
        </div>
    );
};

export default FacultyLayout;
