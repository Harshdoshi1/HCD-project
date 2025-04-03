import React, { useState, useEffect } from 'react';
import Overview from './components/Overview';
import AcademicDetails from './components/AcademicDetails';
import CoCurricularActivities from './components/CoCurricularActivities';
import ExtraCurricularActivities from './components/ExtraCurricularActivities';
import './StudentDetails.css';

const StudentDetails = ({ student }) => {
    const [academicData, setAcademicData] = useState([]);
    const [coActivities, setCoActivities] = useState([]);
    const [extraActivities, setExtraActivities] = useState([]);

    useEffect(() => {
        // Fetch academic data
        if (student?.id) {
            fetchAcademicData(student.id);
            fetchActivities(student.id);
        }
    }, [student]);

    const fetchAcademicData = async (studentId) => {
        try {
            // Replace with your actual API call
            const response = await fetch(`/api/students/${studentId}/academic`);
            const data = await response.json();
            setAcademicData(data);
        } catch (error) {
            console.error('Error fetching academic data:', error);
        }
    };

    const fetchActivities = async (studentId) => {
        try {
            // Replace with your actual API calls
            const coResponse = await fetch(`/api/students/${studentId}/activities/co`);
            const extraResponse = await fetch(`/api/students/${studentId}/activities/extra`);
            
            const coData = await coResponse.json();
            const extraData = await extraResponse.json();
            
            setCoActivities(coData);
            setExtraActivities(extraData);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const handleAddActivity = async (activity) => {
        try {
            // Replace with your actual API call
            const response = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...activity, studentId: student.id })
            });
            const newActivity = await response.json();
            
            if (activity.type === 'co') {
                setCoActivities([...coActivities, newActivity]);
            } else {
                setExtraActivities([...extraActivities, newActivity]);
            }
        } catch (error) {
            console.error('Error adding activity:', error);
        }
    };

    const handleEditActivity = async (activity) => {
        try {
            // Replace with your actual API call
            await fetch(`/api/activities/${activity.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activity)
            });
            
            if (activity.type === 'co') {
                setCoActivities(coActivities.map(a => 
                    a.id === activity.id ? activity : a
                ));
            } else {
                setExtraActivities(extraActivities.map(a => 
                    a.id === activity.id ? activity : a
                ));
            }
        } catch (error) {
            console.error('Error updating activity:', error);
        }
    };

    const handleDeleteActivity = async (activityId, type) => {
        try {
            // Replace with your actual API call
            await fetch(`/api/activities/${activityId}`, {
                method: 'DELETE'
            });
            
            if (type === 'co') {
                setCoActivities(coActivities.filter(a => a.id !== activityId));
            } else {
                setExtraActivities(extraActivities.filter(a => a.id !== activityId));
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
        }
    };

    if (!student) return null;

    return (
        <div className="student-details">
            <Overview student={student} />
            
            <AcademicDetails 
                student={student}
                academicData={academicData}
            />
            
            <CoCurricularActivities
                activities={coActivities}
                onAdd={handleAddActivity}
                onEdit={handleEditActivity}
                onDelete={(id) => handleDeleteActivity(id, 'co')}
            />
            
            <ExtraCurricularActivities
                activities={extraActivities}
                onAdd={handleAddActivity}
                onEdit={handleEditActivity}
                onDelete={(id) => handleDeleteActivity(id, 'extra')}
            />
        </div>
    );
};

export default StudentDetails;