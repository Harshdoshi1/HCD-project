import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../FacultyLayout';

const DashboardFaculty = () => {
    const navigate = useNavigate();
    
    // Set subjects as the default page when the faculty dashboard is first loaded
    useEffect(() => {
        // Store that the subjects page should be active
        localStorage.setItem('facultyActivePage', 'subjects');
    }, []);
    
    return <FacultyLayout />;
};

export default DashboardFaculty;
