import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, User } from 'lucide-react';
import './StudentDetail.css';

// Import the new components
import Overview from './components/Overview';
import AcademicDetails from './components/AcademicDetails';
import CoCurricularActivities from './components/CoCurricularActivities';
import ExtraCurricularActivities from './components/ExtraCurricularActivities';
import ActivityForm from './components/ActivityForm';

const StudentDetails = ({ studentId = "S001", handleBackToList = () => window.history.back() }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedSemester, setSelectedSemester] = useState(1);
    const [expandedSubjects, setExpandedSubjects] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [activityFilter, setActivityFilter] = useState('all'); // 'all', 'semester'
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentActivityType, setCurrentActivityType] = useState(''); // 'co', 'extra'
    const [currentActivity, setCurrentActivity] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, []);

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
        const allSubjectIds = student.academics.semesters[selectedSemester].subjects.map(subject => subject.id);
        setExpandedSubjects(new Set(allSubjectIds));
    };

    const collapseAllSubjects = () => {
        setExpandedSubjects(new Set());
    };

    const handleAddActivity = (type) => {
        setCurrentActivityType(type);
        setShowAddForm(true);
        setShowEditForm(false);
        setCurrentActivity(null);
    };

    const handleEditActivity = (activity, type) => {
        setCurrentActivityType(type);
        setCurrentActivity(activity);
        setShowAddForm(false);
        setShowEditForm(true);
    };
    
    const handleDeleteActivity = (activityId, type) => {
        // In a real app, you would delete from a backend
        // For now, we'll just show an alert
        alert(`Activity ${activityId} would be deleted from ${type} activities`);
    };

    const handleSubmitActivity = (activityData) => {
        // In a real app, you would save to a backend
        console.log("New activity data:", activityData);
        
        // Close the form
        setShowAddForm(false);
        setShowEditForm(false);
        setCurrentActivity(null);

        // Show success message
        alert(showAddForm ? 'Activity added successfully!' : 'Activity updated successfully!');
    };

    const calculateActivityPoints = (activityList) => {
        return activityList.reduce((total, activity) => {
            // Points based on achievement
            let points = 0;
            if (activity.achievement && activity.achievement.toLowerCase().includes('first')) {
                points = 10;
            } else if (activity.achievement && activity.achievement.toLowerCase().includes('second')) {
                points = 8;
            } else if (activity.achievement && activity.achievement.toLowerCase().includes('third')) {
                points = 6;
            } else if (activity.achievement) {
                points = 5;
            } else {
                points = 3; // Base points for participation
            }
            return total + points;
        }, 0);
    };

    const filterActivitiesBySemester = (activities, semester) => {
        if (activityFilter === 'all') return activities;
        return activities.filter(activity => activity.semester === semester);
    };

    // Mock student data (in a real app, this would come from an API)
    const student = {
        id: studentId,
        name: "Krish Mamtora",
        enrollmentNo: "92200133022",
        department: "ICT",
        semester: 6,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH4dcYWVFHFsz8M3Rsjpy2Hg6gQAmgbCIwWA&s",
        batch: "2022-2026",
        cgpa: 9.2,
        personalInfo: {
            email: "krish@marwadiuniversity.ac.in",
            phone: "+91 1234567890",
            dateOfBirth: "15 March 1993",
        },
        academics: {
            department: "Computer Science & Engineering",
            program: "B.Tech",
            advisor: "Dr. Jennifer Lawrence",
            totalCredits: 135,
            creditsCompleted: 98,
            gpa: [
                { semester: 1, value: 9.0 },
                { semester: 2, value: 9.1 },
                { semester: 3, value: 9.3 },
                { semester: 4, value: 9.2 },
                { semester: 5, value: 9.4 }
            ],
            semesterRanks: [
                { semester: 1, rank: 3, totalStudents: 120 },
                { semester: 2, rank: 2, totalStudents: 118 },
                { semester: 3, rank: 2, totalStudents: 115 },
                { semester: 4, rank: 3, totalStudents: 115 },
                { semester: 5, rank: 1, totalStudents: 112 }
            ],
            semesters: {
                1: {
                    gpa: 9.0,
                    credits: 21,
                    subjects: [
                        {
                            id: "CS101",
                            name: "Introduction to Programming",
                            code: "CS101",
                            credits: 4,
                            faculty: "Dr. Jonathan Smith",
                            grade: "A+",
                            totalMarks: 92,
                            attendance: 95,
                            classRank: 3,
                            totalStudents: 120,
                            facultyRating: 9.2,
                            components: {
                                "Mid-Term": { marks: 47, total: 50 },
                                "End-Term": { marks: 75, total: 80 },
                                "Lab Work": { marks: 28, total: 30 },
                                "Assignments": { marks: 24, total: 25 },
                                "Presentation": { marks: 18, total: 20 }
                            },
                            facultyResponse: {
                                comments: "Alexandra shows remarkable aptitude for programming. Her solutions are elegant and well-structured. With her analytical mind, she has great potential in the field of computer science.",
                                lastUpdated: "February 12, 2024"
                            }
                        }
                    ]
                }
            }
        },
        achievements: [
            {
                id: "ACH001",
                title: "Dean's List",
                date: "December 2023",
                description: "Recognized for academic excellence with placement on the Dean's List for Fall 2023",
                category: "academic",
                semester: 5
            }
        ],
        coCurricular: [
            {
                id: "CC001",
                title: "Technical Paper Presentation",
                date: "January 2024",
                description: "Presented research paper on 'AI in Healthcare' at IEEE International Conference",
                achievement: "First Prize",
                semester: 5
            }
        ],
        extraCurricular: [
            {
                id: "EC001",
                title: "University Basketball Team",
                date: "2023-2024",
                description: "Member of the university basketball team, participated in inter-university tournament",
                achievement: "Runner-up in Regional Championship",
                semester: 5
            }
        ]
    };

    if (isLoading) {
        return (
            <div className="student-details-container-sdp loading">
                <div className="loading-spinner"></div>
                <p>Loading student details...</p>
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
                        <img src={student.image} alt={student.name} className="profile-image-sdp" />
                    </div>
                    <div className="profile-details-sdp">
                        <h2 className="student-name-sdp">{student.name}</h2>
                        <div className="student-meta-sdp">
                            <span className="enrollment-sdp">{student.enrollmentNo}</span>
                            <span className="department-sdp">{student.department}</span>
                            <span className="semester-sdp">Semester {student.semester}</span>
                        </div>
                        <div className="contact-info-sdp">
                            <div className="contact-item-sdp">
                                <Mail size={14} />
                                <span>{student.personalInfo.email}</span>
                            </div>
                            <div className="contact-item-sdp">
                                <Phone size={14} />
                                <span>{student.personalInfo.phone}</span>
                            </div>
                            <div className="contact-item-sdp">
                                <Calendar size={14} />
                                <span>{student.personalInfo.dateOfBirth}</span>
                            </div>
                            <div className="contact-item-sdp">
                                <User size={14} />
                                <span>{student.batch}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                            expandedSubjects={expandedSubjects}
                            toggleSubject={toggleSubject}
                            expandAllSubjects={expandAllSubjects}
                            collapseAllSubjects={collapseAllSubjects}
                            onSemesterChange={setSelectedSemester}
                        />
                    )}
                    
                    {activeTab === 'co-curricular' && (
                        <CoCurricularActivities 
                            student={student}
                            selectedSemester={selectedSemester}
                            activityFilter={activityFilter}
                            setActivityFilter={setActivityFilter}
                            setSelectedSemester={setSelectedSemester}
                            handleAddActivity={handleAddActivity}
                            handleEditActivity={handleEditActivity}
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
                            handleAddActivity={handleAddActivity}
                            handleEditActivity={handleEditActivity}
                            handleDeleteActivity={handleDeleteActivity}
                            filterActivitiesBySemester={filterActivitiesBySemester}
                            calculateActivityPoints={calculateActivityPoints}
                        />
                    )}
                </div>
            </div>

            {/* Activity Form Modal */}
            {(showAddForm || showEditForm) && (
                <ActivityForm
                    activity={currentActivity}
                    onSubmit={handleSubmitActivity}
                    onClose={() => {
                        setShowAddForm(false);
                        setShowEditForm(false);
                        setCurrentActivity(null);
                    }}
                    isEdit={showEditForm}
                    currentSemester={selectedSemester}
                    activityType={currentActivityType}
                />
            )}
        </div>
    );
};

export default StudentDetails;
