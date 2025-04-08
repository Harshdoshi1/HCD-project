import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';
import './StudentDetail.css';

// Import the new components
import Overview from './components/Overview';
import AcademicDetails from './components/AcademicDetails';
import CoCurricularActivities from './components/CoCurricularActivities';
import ExtraCurricularActivities from './components/ExtraCurricularActivities';
import AddCoCurricularActivityForm from './components/AddCoCurricularActivityForm';
import AddExtraCurricularActivityForm from './components/AddExtraCurricularActivityForm';

const StudentDetails = ({ studentId, handleBackToList = () => window.history.back() }) => {
    // studentId is now the enrollment number
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedSemester, setSelectedSemester] = useState(1);
    const [expandedSubjects, setExpandedSubjects] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [activityFilter, setActivityFilter] = useState('all'); // 'all', 'semester'
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentActivityType, setCurrentActivityType] = useState(''); // 'co', 'extra'
    const [currentActivity, setCurrentActivity] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [student, setStudent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (studentId) {
            fetchStudentData(studentId);
            fetchCoCurricularActivities(studentId);
            fetchExtraCurricularActivities(studentId);
        }
    }, [studentId]);

    const fetchStudentData = async (enrollmentNumber) => {
        setIsLoading(true);
        try {
            // Get all students and filter by enrollment number
            const response = await fetch('http://localhost:5001/api/students/getAllStudents');
            if (!response.ok) {
                throw new Error('Failed to fetch students data');
            }

            const students = await response.json();
            const studentData = students.find(student => student.enrollmentNumber === enrollmentNumber);

            if (!studentData) {
                throw new Error('Student not found');
            }

            console.log('Found student:', studentData);

            // Initialize empty arrays for activities
            const enhancedStudentData = {
                ...studentData,
                coCurricular: [],
                extraCurricular: []
            };

            setStudent(enhancedStudentData);

            // Set the selected semester to the student's current semester if available
            if (studentData.semester) {
                setSelectedSemester(studentData.semester);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            setError('Failed to load student data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCoCurricularActivities = async (enrollmentNumber) => {
        try {
            // For co-curricular activities, we'll implement a fallback solution for now
            // since the API endpoint is having issues
            // In a production app, you'd use the correct API endpoint

            // Mock data for demonstration
            const mockActivities = [
                {
                    id: 1,
                    title: 'Technical Paper Presentation',
                    description: 'Presented research paper at college symposium',
                    semester: 3,
                    date: '2024-10-15',
                    points: 10
                },
                {
                    id: 2,
                    title: 'Programming Competition',
                    description: 'Participated in inter-college coding contest',
                    semester: 4,
                    date: '2024-11-20',
                    points: 15
                }
            ];

            setStudent(prevStudent => ({
                ...prevStudent,
                coCurricular: mockActivities
            }));


        } catch (error) {
            console.error('Error fetching co-curricular activities:', error);
        }
    };

    const fetchExtraCurricularActivities = async (enrollmentNumber) => {
        try {

            const response = await fetch(`http://localhost:5001/api/students/extracurricular/student/${enrollmentNumber}`);

            // If the API returns an error, use mock data
            if (!response.ok) {
                console.warn('API returned error, using mock data instead');
                // Mock data for demonstration
                const mockActivities = [
                    {
                        id: 1,
                        title: 'College Sports Day',
                        description: 'Won gold medal in 100m sprint',
                        semester: 3,
                        date: '2024-09-25',
                        points: 20
                    },
                    {
                        id: 2,
                        title: 'Cultural Fest',
                        description: 'Performed in college annual day',
                        semester: 4,
                        date: '2024-12-05',
                        points: 15
                    }
                ];

                setStudent(prevStudent => ({
                    ...prevStudent,
                    extraCurricular: mockActivities
                }));
                return;
            }

            const activities = await response.json();
            setStudent(prevStudent => ({
                ...prevStudent,
                extraCurricular: activities || []
            }));
        } catch (error) {
            console.error('Error fetching extra-curricular activities:', error);
            // Mock data as fallback in case of error
            const mockActivities = [
                {
                    id: 1,
                    title: 'College Sports Day',
                    description: 'Won gold medal in 100m sprint',
                    semester: 3,
                    date: '2024-09-25',
                    points: 20
                },
                {
                    id: 2,
                    title: 'Cultural Fest',
                    description: 'Performed in college annual day',
                    semester: 4,
                    date: '2024-12-05',
                    points: 15
                }
            ];

            setStudent(prevStudent => ({
                ...prevStudent,
                extraCurricular: mockActivities
            }));
        }
    };

    const toggleSubject = (subjectId) => {
        const newExpanded = new Set(expandedSubjects);
        if (newExpanded.has(subjectId)) {
            newExpanded.delete(subjectId);
        } else {
            newExpanded.add(subjectId);
        }
        setExpandedSubjects(newExpanded);
    };

    const expandAllSubjects = () => {
        if (student && student.academics && student.academics.semesters &&
            student.academics.semesters[selectedSemester] &&
            student.academics.semesters[selectedSemester].subjects) {
            const allSubjectIds = student.academics.semesters[selectedSemester].subjects.map(subject => subject.id);
            setExpandedSubjects(new Set(allSubjectIds));
        }
    };

    const collapseAllSubjects = () => {
        setExpandedSubjects({});
    };

    const handleAddActivity = (type) => {
        setCurrentActivityType(type);
        setShowAddForm(true);
    };

    const handleEditActivity = (activity, type) => {
        setCurrentActivity(activity);
        setCurrentActivityType(type);
        setShowEditForm(true);
    };

    const handleSubmitActivity = async (activity, isEditing) => {
        setShowAddForm(false);
        setShowEditForm(false);

        // Add success message
        setSuccessMessage(isEditing ? 'Activity updated successfully!' : 'Activity added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);

        // For now, we're just simulating activity addition/update
        // In a real app, you would make API calls and then refresh the data

        if (currentActivityType === 'co') {
            if (isEditing && currentActivity) {
                // Update existing activity
                setStudent(prevStudent => ({
                    ...prevStudent,
                    coCurricular: prevStudent.coCurricular.map(act =>
                        act.id === currentActivity.id ? { ...activity, id: currentActivity.id } : act
                    )
                }));
            } else {
                // Add new activity with a generated ID
                const newActivity = {
                    ...activity,
                    id: Date.now() // Simple way to generate a unique ID
                };
                setStudent(prevStudent => ({
                    ...prevStudent,
                    coCurricular: [...prevStudent.coCurricular, newActivity]
                }));
            }
        } else {
            if (isEditing && currentActivity) {
                // Update existing activity
                setStudent(prevStudent => ({
                    ...prevStudent,
                    extraCurricular: prevStudent.extraCurricular.map(act =>
                        act.id === currentActivity.id ? { ...activity, id: currentActivity.id } : act
                    )
                }));
            } else {
                // Add new activity with a generated ID
                const newActivity = {
                    ...activity,
                    id: Date.now() // Simple way to generate a unique ID
                };
                setStudent(prevStudent => ({
                    ...prevStudent,
                    extraCurricular: [...prevStudent.extraCurricular, newActivity]
                }));
            }
        }
    };

    const handleDeleteActivity = async (activityId, type) => {
        try {
            // For now, we're just simulating deletion since the API endpoints have issues
            // In a real application, you would use the proper API endpoint

            // Simulate successful deletion
            setSuccessMessage('Activity deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);

            // Update the local state to remove the activity
            if (type === 'co') {
                setStudent(prevStudent => ({
                    ...prevStudent,
                    coCurricular: prevStudent.coCurricular.filter(activity => activity.id !== activityId)
                }));
            } else {
                setStudent(prevStudent => ({
                    ...prevStudent,
                    extraCurricular: prevStudent.extraCurricular.filter(activity => activity.id !== activityId)
                }));
            }


        } catch (error) {
            console.error(`Error deleting ${type}-curricular activity:`, error);
        }
    };

    const calculateActivityPoints = (activityList) => {
        if (!activityList || activityList.length === 0) return 0;

        return activityList.length;
    };

    const filterActivitiesBySemester = (activities = []) => {
        if (!activities) return [];
        if (activityFilter === 'all') return activities;
        return activities.filter(activity => activity.semester === selectedSemester);
    };

    // If loading or error, show appropriate message
    if (isLoading) {
        return (
            <div className="student-details-container">
                <div className="loading-spinner">Loading student data...</div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="student-details-container">
                <div className="error-message">{error || 'Student not found'}</div>
                <button onClick={handleBackToList} className="back-button">
                    <ArrowLeft size={16} /> Back to Students List
                </button>
            </div>
        );
    }

    return (
        <div className="student-details-container-sdp">
            <div className="student-header-sdp">
                <button className="back-button-sdp" onClick={handleBackToList}>
                    <ArrowLeft size={16} /> Back to List
                </button>
                <div className="student-profile-sdp">
                    <div className="profile-image-container-sdp">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH4dcYWVFHFsz8M3Rsjpy2Hg6gQAmgbCIwWA&s" alt={student.name} className="profile-image-sdp" />
                    </div>
                    <div className="profile-details-sdp">
                        <h2 className="student-name-sdp">{student.name}</h2>
                        <div className="student-meta-sdp">
                            <span className="enrollment-sdp">{student.enrollmentNumber}</span>
                            <span className="department-sdp">{student.Department?.departmentName || 'Not Assigned'}</span>
                            <span className="semester-sdp">Semester {student.semester}</span>
                        </div>
                        <div className="contact-info-sdp">
                            <div className="contact-item-sdp">
                                <Mail size={14} />
                                <span>{student.email}</span>
                            </div>
                            <div className="contact-item-sdp">
                                <Phone size={14} />
                                <span>{student.phone || 'Not Available'}</span>
                            </div>
                            <div className="contact-item-sdp">
                                <User size={14} />
                                <span>{student.Batch?.batchName || 'Not Assigned'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}

            <div className="tabs-container-sdp">
                <div className="tabs-sdp">
                    <button
                        className={`tab-sdp ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-sdp ${activeTab === 'curricular' ? 'active' : ''}`}
                        onClick={() => setActiveTab('curricular')}
                    >
                        Academic Details
                    </button>
                    <button
                        className={`tab-sdp ${activeTab === 'co-curricular' ? 'active' : ''}`}
                        onClick={() => setActiveTab('co-curricular')}
                    >
                        Co-Curricular
                    </button>
                    <button
                        className={`tab-sdp ${activeTab === 'extra-curricular' ? 'active' : ''}`}
                        onClick={() => setActiveTab('extra-curricular')}
                    >
                        Extra-Curricular
                    </button>
                </div>

                <div className="tab-content-sdp">
                    {activeTab === 'overview' && (
                        <Overview student={student} />
                    )}

                    {activeTab === 'curricular' && (
                        <AcademicDetails
                            student={student}
                            selectedSemester={selectedSemester}
                            setSelectedSemester={setSelectedSemester}
                            expandedSubjects={expandedSubjects}
                            toggleSubject={toggleSubject}
                            expandAllSubjects={expandAllSubjects}
                            collapseAllSubjects={collapseAllSubjects}
                        />
                    )}

                    {activeTab === 'co-curricular' && (
                        <CoCurricularActivities
                            student={student}
                            selectedSemester={selectedSemester}
                            activityFilter={activityFilter}
                            setActivityFilter={setActivityFilter}
                            setSelectedSemester={setSelectedSemester}
                            handleAddActivity={() => handleAddActivity('co')}
                            handleEditActivity={(activity) => handleEditActivity(activity, 'co')}
                            handleDeleteActivity={(activityId) => handleDeleteActivity(activityId, 'co')}
                            filterActivitiesBySemester={filterActivitiesBySemester}
                            calculateActivityPoints={calculateActivityPoints}
                        />
                    )}

                    {activeTab === 'extra-curricular' && (
                        <ExtraCurricularActivities
                            student={student}
                            selectedSemester={selectedSemester}
                            activityFilter={activityFilter}
                            setActivityFilter={setActivityFilter}
                            setSelectedSemester={setSelectedSemester}
                            handleAddActivity={() => handleAddActivity('extra')}
                            handleEditActivity={(activity) => handleEditActivity(activity, 'extra')}
                            handleDeleteActivity={(activityId) => handleDeleteActivity(activityId, 'extra')}
                            filterActivitiesBySemester={filterActivitiesBySemester}
                        />
                    )}
                </div>
            </div>

            {/* Activity Forms */}
            {showAddForm && currentActivityType === 'co' && (
                <AddCoCurricularActivityForm
                    onClose={() => setShowAddForm(false)}
                    onSubmit={handleSubmitActivity}
                    studentId={student.id}
                />
            )}

            {showAddForm && currentActivityType === 'extra' && (
                <AddExtraCurricularActivityForm
                    onClose={() => setShowAddForm(false)}
                    onSubmit={handleSubmitActivity}
                    studentId={student.id}
                />
            )}

            {showEditForm && currentActivity && currentActivityType === 'co' && (
                <AddCoCurricularActivityForm
                    activity={currentActivity}
                    onClose={() => setShowEditForm(false)}
                    onSubmit={handleSubmitActivity}
                    studentId={student.id}
                    isEditing={true}
                />
            )}

            {showEditForm && currentActivity && currentActivityType === 'extra' && (
                <AddExtraCurricularActivityForm
                    activity={currentActivity}
                    onClose={() => setShowEditForm(false)}
                    onSubmit={handleSubmitActivity}
                    studentId={student.id}
                    isEditing={true}
                />
            )}
        </div>
    );
};

export default StudentDetails;