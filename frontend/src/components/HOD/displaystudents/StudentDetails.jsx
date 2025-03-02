

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Book, Clock, Mail, Phone, MapPin, ChevronDown, User, Award, ChevronRight, Calendar, Trophy, FileText, MessageSquare, Activity, Home, Plus, Edit, Trash, Filter } from 'lucide-react';
import './StudentDetail.css';

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
    const [newActivity, setNewActivity] = useState({
        title: '',
        date: '',
        description: '',
        achievement: '',
        attachments: 0,
        semester: 1
    });

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
        setNewActivity({
            title: '',
            date: '',
            description: '',
            achievement: '',
            attachments: 0,
            semester: selectedSemester
        });
    };

    const handleEditActivity = (activity, type) => {
        setCurrentActivityType(type);
        setCurrentActivity(activity);
        setShowAddForm(false);
        setShowEditForm(true);
        setNewActivity({
            ...activity,
            semester: activity.semester || selectedSemester
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewActivity(prev => ({
            ...prev,
            [name]: name === 'attachments' ? parseInt(value) || 0 : value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // In a real app, you would save to a backend
        // For now, we'll just close the form
        setShowAddForm(false);
        setShowEditForm(false);

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

    const student = {
        id: studentId,
        name: "Alexandra Richardson",
        enrollmentNo: "EN2023085",
        department: "Computer Science & Engineering",
        semester: 6,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoguHACZpXrj5llOZZySnZ4OAxMg4z64julw&s",
        batch: "2021-2025",
        cgpa: 9.2,
        personalInfo: {
            email: "alex.richardson@college.edu",
            phone: "+91 9876543210",
            address: "425 University Ave, Westwood Campus",
            bloodGroup: "O+",
            dateOfBirth: "15 March 2003",
            parentName: "Robert Richardson",
            parentContact: "+91 9876543211"
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
                        },
                        {
                            id: "MA101",
                            name: "Calculus and Linear Algebra",
                            code: "MA101",
                            credits: 4,
                            faculty: "Dr. Emily Johnson",
                            grade: "A",
                            totalMarks: 88,
                            attendance: 92,
                            classRank: 5,
                            totalStudents: 120,
                            facultyRating: 8.7,
                            components: {
                                "Mid-Term": { marks: 43, total: 50 },
                                "End-Term": { marks: 70, total: 80 },
                                "Quizzes": { marks: 18, total: 20 },
                                "Assignments": { marks: 23, total: 25 },
                                "Class Participation": { marks: 24, total: 25 }
                            },
                            facultyResponse: {
                                comments: "Alexandra demonstrates a solid understanding of mathematical concepts. Her approach to problem-solving is methodical and precise. She could benefit from challenging herself with more advanced problems.",
                                lastUpdated: "February 15, 2024"
                            }
                        },
                        {
                            id: "PH101",
                            name: "Physics for Engineers",
                            code: "PH101",
                            credits: 4,
                            faculty: "Dr. Richard Feynman",
                            grade: "A+",
                            totalMarks: 90,
                            attendance: 94,
                            classRank: 4,
                            totalStudents: 120,
                            facultyRating: 9.5,
                            components: {
                                "Mid-Term": { marks: 45, total: 50 },
                                "End-Term": { marks: 72, total: 80 },
                                "Lab Work": { marks: 28, total: 30 },
                                "Assignments": { marks: 22, total: 25 },
                                "Quizzes": { marks: 18, total: 20 }
                            },
                            facultyResponse: {
                                comments: "Alexandra has a natural talent for understanding physical concepts and applying them to real-world problems. Her lab work is exemplary, showing careful observation and analysis.",
                                lastUpdated: "February 18, 2024"
                            }
                        }
                    ]
                },
                2: {
                    gpa: 9.1,
                    credits: 22,
                    subjects: [
                        {
                            id: "CS102",
                            name: "Data Structures",
                            code: "CS102",
                            credits: 4,
                            faculty: "Dr. Linus Torres",
                            grade: "A+",
                            totalMarks: 94,
                            attendance: 96,
                            classRank: 2,
                            totalStudents: 118,
                            facultyRating: 9.0,
                            components: {
                                "Mid-Term": { marks: 48, total: 50 },
                                "End-Term": { marks: 77, total: 80 },
                                "Lab Work": { marks: 29, total: 30 },
                                "Assignments": { marks: 24, total: 25 },
                                "Project": { marks: 19, total: 20 }
                            },
                            facultyResponse: {
                                comments: "Alexandra shows exceptional talent in implementing efficient data structures. Her project on optimized graph algorithms was particularly impressive and demonstrated deep understanding of the subject matter.",
                                lastUpdated: "June 10, 2024"
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
            },
            {
                id: "ACH002",
                title: "Hackathon Winner",
                date: "March 2024",
                description: "First place in the University Annual Hackathon for developing an AI-powered educational platform",
                category: "co-curricular",
                semester: 6
            },
            {
                id: "ACH003",
                title: "Research Publication",
                date: "May 2024",
                description: "Co-authored research paper 'Machine Learning Applications in Healthcare' published in IEEE journal",
                category: "co-curricular",
                semester: 6
            }
        ],
        coCurricular: [
            {
                id: "CC001",
                title: "Technical Paper Presentation",
                date: "January 2024",
                description: "Presented research paper on 'AI in Healthcare' at IEEE International Conference",
                achievement: "First Prize",
                attachments: 2,
                semester: 5
            },
            {
                id: "CC002",
                title: "Cybersecurity Workshop",
                date: "March 2024",
                description: "Conducted a workshop on ethical hacking and network security for junior students",
                achievement: "Outstanding Facilitator Award",
                attachments: 1,
                semester: 6
            },
            {
                id: "CC003",
                title: "Code for Change Hackathon",
                date: "April 2024",
                description: "Developed a sustainable energy monitoring solution using IoT devices",
                achievement: "Second Place",
                attachments: 3,
                semester: 6
            },
            {
                id: "CC004",
                title: "AI Research Internship",
                date: "Summer 2023",
                description: "Worked with Dr. Alan Turing on neural network optimization techniques",
                achievement: "Excellent Performance Certificate",
                attachments: 2,
                semester: 4
            }
        ],
        extraCurricular: [
            {
                id: "EC001",
                title: "University Dance Troupe",
                date: "2021 - Present",
                description: "Lead performer in the contemporary dance group representing the university at cultural events",
                achievement: "Best Choreography Award (2023)",
                attachments: 4,
                semester: 3
            },
            {
                id: "EC002",
                title: "Environmental Club",
                date: "2022 - Present",
                description: "Organized campus-wide sustainability initiatives including a plastic-free campus campaign",
                achievement: "Green Ambassador Recognition",
                attachments: 2,
                semester: 4
            },
            {
                id: "EC003",
                title: "Volunteer - Teach For Tomorrow",
                date: "Weekends, 2023",
                description: "Taught computer skills to underprivileged children at local community centers",
                achievement: "Outstanding Volunteer Award",
                attachments: 3,
                semester: 5
            }
        ]
    };

    if (isLoading) {
        return (
            <div className="student-loading">
                <div className="loading-spinner"></div>
                <p>Loading student profile...</p>
            </div>
        );
    }
    const renderStudentOverview = () => (
        <div className="student-overview-sdp">
            <div className="overview-card-sdp">
                <div className="overview-card-sdp-header">
                    <h3><User size={18} /> Personal Information</h3>
                </div>
                <div className="overview-card-sdp-content">
                    <div className="detail-grid">
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp"><Mail size={14} /> Email</span>
                            <span className="detail-value-sdp">{student.personalInfo.email}</span>
                        </div>
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp"><Phone size={14} /> Contact</span>
                            <span className="detail-value-sdp">{student.personalInfo.phone}</span>
                        </div>
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp"><MapPin size={14} /> Address</span>
                            <span className="detail-value-sdp">{student.personalInfo.address}</span>
                        </div>
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp"><Activity size={14} /> Blood Group</span>
                            <span className="detail-value-sdp">{student.personalInfo.bloodGroup}</span>
                        </div>
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp"><Calendar size={14} /> Date of Birth</span>
                            <span className="detail-value-sdp">{student.personalInfo.dateOfBirth}</span>
                        </div>
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp"><User size={14} /> Parent Details</span>
                            <span className="detail-value-sdp">
                                {student.personalInfo.parentName} ({student.personalInfo.parentContact})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overview-card-sdp">
                <div className="overview-card-sdp-header">
                    <h3><Book size={18} /> Academic Information</h3>
                </div>
                <div className="overview-card-sdp-content">
                    <div className="detail-grid">
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp">Department</span>
                            <span className="detail-value-sdp">{student.academics.department}</span>
                        </div>
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp">Program</span>
                            <span className="detail-value-sdp">{student.academics.program}</span>
                        </div>
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp">Batch</span>
                            <span className="detail-value-sdp">{student.batch}</span>
                        </div>
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp">Academic Advisor</span>
                            <span className="detail-value-sdp">{student.academics.advisor}</span>
                        </div>
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp">Current Semester</span>
                            <span className="detail-value-sdp">{student.semester}</span>
                        </div>
                        <div className="detail-item-sdp">
                            <span className="detail-label-sdp">Credits Completed</span>
                            <span className="detail-value-sdp">
                                {student.academics.creditsCompleted}/{student.academics.totalCredits}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overview-card-sdp">
                <div className="overview-card-sdp-header">
                    <h3><Award size={18} /> Academic Performance</h3>
                </div>
                <div className="overview-card-sdp-content">
                    <div className="gpa-chart">
                        <h4 className="gpa-chart-title">GPA Progression</h4>
                        <div className="gpa-bar-container">
                            {student.academics.gpa.map((semGpa) => (
                                <div key={semGpa.semester} className="gpa-bar-item">
                                    <div className="gpa-bar" style={{ height: `${(semGpa.value / 10) * 100}%` }}>
                                        <span className="gpa-value">{semGpa.value}</span>
                                    </div>
                                    <div className="semester-label">Sem {semGpa.semester}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rank-display">
                        <h4 className="rank-title">Semester Ranks</h4>
                        <div className="rank-grid">
                            {student.academics.semesterRanks.map((rankData) => (
                                <div key={rankData.semester} className="rank-item">
                                    <div className="rank-semester">Sem {rankData.semester}</div>
                                    <div className="rank-value">
                                        <Trophy size={14} />
                                        <span>{rankData.rank}</span>
                                        <span className="rank-total">/{rankData.totalStudents}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="cumulative-gpa">
                        <div className="cumulative-value">
                            <span className="cumulative-label">Current CGPA</span>
                            <span className="cumulative-number">{student.cgpa}</span>
                            <div className="cgpa-progress">
                                <div className="cgpa-fill" style={{ width: `${(student.cgpa / 10) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overview-card-sdp">
                <div className="overview-card-sdp-header">
                    <h3><Trophy size={18} /> Recent Achievements</h3>
                </div>
                <div className="overview-card-sdp-content">
                    <ul className="achievements-list">
                        {student.achievements.map((achievement) => (
                            <li key={achievement.id} className="achievement-item">
                                <div className="achievement-icon">
                                    <Trophy size={16} />
                                </div>
                                <div className="achievement-details">
                                    <h4>{achievement.title}</h4>
                                    <p>{achievement.description}</p>
                                    <span className="achievement-date">{achievement.date}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderSubjectCard = (subject) => {
        const isExpanded = expandedSubjects.has(subject.id);

        return (
            <div key={subject.id} className="subject-card-sdp">
                <div className="subject-header-sdp" onClick={() => toggleSubject(subject.id)}>
                    <div className="subject-main-info">
                        <h4>{subject.name} <span className="subject-code">{subject.code}</span></h4>
                        <div className="subject-quick-info">
                            <span className="quick-info-item">
                                <User size={14} />
                                {subject.faculty}
                            </span>
                            <span className="quick-info-item">
                                <Award size={14} />
                                Grade: {subject.grade}
                            </span>
                            <span className="quick-info-item">
                                <Trophy size={14} />
                                Rank: {subject.classRank}/{subject.totalStudents}
                            </span>
                        </div>
                    </div>
                    <div className={`subject-expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>

                <div className={`subject-content-sdp ${isExpanded ? 'expanded' : ''}`}>
                    <div className="performance-section-sdp">
                        <h5 className="section-heading-sdp">Performance Components</h5>
                        <div className="performance-grid-sdp">
                            {Object.entries(subject.components).map(([name, data]) => (
                                <div key={name} className="performance-item">
                                    <div className="performance-label">{name}</div>
                                    <div className="performance-value">
                                        <div className="marks-display">
                                            <span className="marks-value">{data.marks}/{data.total}</span>
                                            <div className="marks-percentage">
                                                {Math.round((data.marks / data.total) * 100)}%
                                            </div>
                                        </div>
                                        <div className="marks-progress">
                                            <div
                                                className="marks-progress-fill"
                                                style={{ width: `${(data.marks / data.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="additional-metrics">
                            <div className="metrics-item">
                                <div className="metrics-label">Total Marks</div>
                                <div className="metrics-value">
                                    <div className="total-marks">{subject.totalMarks}%</div>
                                    <div className="marks-progress total-progress">
                                        <div
                                            className="marks-progress-fill"
                                            style={{ width: `${subject.totalMarks}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="faculty-feedback-sdp">
                        <h5 className="section-heading-sdp">Faculty Feedback</h5>
                        <div className="feedback-content-sdp">
                            <div className="feedback-box">
                                <div className="faculty-rating">
                                    <div className="rating-stars">
                                        {[...Array(10)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                className={i < Math.floor(subject.facultyRating) ? 'star-filled' : 'star-empty'}
                                            />
                                        ))}
                                        <span className="rating-value">({subject.facultyRating}/10)</span>
                                    </div>
                                </div>
                                <div className="faculty-comments">
                                    <p>{subject.facultyResponse.comments}</p>
                                    <div className="comments-date">
                                        Last Updated: {subject.facultyResponse.lastUpdated}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    const renderActivityCard = (activity, type) => (
        <div key={activity.id} className="activity-card">
            <div className="activity-icon">
                {type === 'co' ? <FileText size={18} /> : <Activity size={18} />}
            </div>
            <div className="activity-details">
                <h4 className="activity-title">{activity.title}</h4>
                <p className="activity-description">{activity.description}</p>
                <div className="activity-footer">
                    <span className="activity-date"><Calendar size={14} /> {activity.date}</span>
                    {activity.achievement && (
                        <span className="activity-achievement"><Trophy size={14} /> {activity.achievement}</span>
                    )}
                    <span className="activity-semester">Semester: {activity.semester || 'N/A'}</span>
                </div>
                {activity.attachments && (
                    <div className="activity-attachments">
                        <span className="attachments-label">{activity.attachments} document{activity.attachments !== 1 ? 's' : ''} attached</span>
                    </div>
                )}
            </div>
            <div className="activity-actions">
                <button className="action-button edit-button" onClick={() => handleEditActivity(activity, type)}>
                    +
                </button>
                <button className="action-button delete-button">
                    -
                </button>
            </div>
        </div>
    );

    const renderActivityForm = () => {
        const isEditMode = showEditForm;
        const formTitle = isEditMode
            ? `Edit ${currentActivityType === 'co' ? 'Co-Curricular' : 'Extra-Curricular'} Activity`
            : `Add New ${currentActivityType === 'co' ? 'Co-Curricular' : 'Extra-Curricular'} Activity`;

        return (
            <div className="activity-form-overlay">
                <div className="activity-form-container">
                    <div className="form-header">
                        <h3>{formTitle}</h3>
                        <button className="close-form-button" onClick={() => {
                            setShowAddForm(false);
                            setShowEditForm(false);
                        }}>×</button>
                    </div>

                    <form onSubmit={handleFormSubmit} className="activity-form">
                        <div className="form-group">
                            <label htmlFor="title">Activity Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newActivity.title}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date">Date/Duration</label>
                            <input
                                type="text"
                                id="date"
                                name="date"
                                value={newActivity.date}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newActivity.description}
                                onChange={handleFormChange}
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="achievement">Achievement/Recognition (if any)</label>
                            <input
                                type="text"
                                id="achievement"
                                name="achievement"
                                value={newActivity.achievement}
                                onChange={handleFormChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="semester">Related Semester</label>
                            <select
                                id="semester"
                                name="semester"
                                value={newActivity.semester}
                                onChange={handleFormChange}
                            >
                                {[...Array(student.semester)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="attachments">Number of Attachments</label>
                            <input
                                type="number"
                                id="attachments"
                                name="attachments"
                                min="0"
                                value={newActivity.attachments}
                                onChange={handleFormChange}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={() => {
                                setShowAddForm(false);
                                setShowEditForm(false);
                            }}>Cancel</button>
                            <button type="submit" className="submit-button">
                                {isEditMode ? 'Update Activity' : 'Add Activity'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="student-details-container">
            <header className="student-header-sdp">
                <div className="header-back">
                    <button className="back-button" onClick={handleBackToList}>
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                </div>
                <div className="student-profile-sdp">
                    <div className="profile-image-container">
                        <img
                            src={student.image}
                            alt={student.name}
                            className="profile-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/150";
                            }}
                        />
                        <div className="profile-status"></div>
                    </div>
                    <div className="profile-info-sdp">
                        <h2 className="student-name-detials-sdp">{student.name}</h2>
                        <div className="student-meta">
                            <span className="enrollment-no">{student.enrollmentNo}</span>
                            <span className="separator">•</span>
                            <span className="department">{student.department}</span>
                            <span className="separator">•</span>
                            <span className="semester">Semester {student.semester}</span>
                        </div>
                        <div className="student-highlight">
                            <div className="highlight-item">
                                <span className="highlight-label">CGPA</span>
                                <span className="highlight-value">{student.cgpa}</span>
                            </div>
                            <div className="highlight-item">
                                <span className="highlight-label">Batch</span>
                                <span className="highlight-value">{student.batch}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <nav className="student-tabs">
                <button
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <Home size={16} />
                    <span>Overview</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'curricular' ? 'active' : ''}`}
                    onClick={() => setActiveTab('curricular')}
                >
                    <Book size={16} />
                    <span>Academic</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'co-curricular' ? 'active' : ''}`}
                    onClick={() => setActiveTab('co-curricular')}
                >
                    <FileText size={16} />
                    <span>Co-Curricular</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'extra-curricular' ? 'active' : ''}`}
                    onClick={() => setActiveTab('extra-curricular')}
                >
                    <Activity size={16} />
                    <span>Extra-Curricular</span>
                </button>
            </nav>

            <main className="student-content-sdp">
                {activeTab === 'overview' && renderStudentOverview()}

                {activeTab === 'curricular' && (
                    <div className="academic-section">
                        <div className="semester-navigation-sdp">
                            <h3 className="section-title">Academic Performance</h3>
                            <div className="semester-selectors">
                                {Object.keys(student.academics.semesters).map(sem => (
                                    <button
                                        key={sem}
                                        className={`semester-button ${selectedSemester === parseInt(sem) ? 'active' : ''}`}
                                        onClick={() => setSelectedSemester(parseInt(sem))}
                                    >
                                        Semester {sem}
                                    </button>
                                ))}
                            </div>
                            <div className="semester-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Semester GPA</span>
                                    <span className="summary-value">{student.academics.semesters[selectedSemester].gpa}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Credits</span>
                                    <span className="summary-value">{student.academics.semesters[selectedSemester].credits}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Subjects</span>
                                    <span className="summary-value">{student.academics.semesters[selectedSemester].subjects.length}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Rank</span>
                                    <span className="summary-value">
                                        {student.academics.semesterRanks.find(r => r.semester === selectedSemester)?.rank || 'N/A'}/
                                        {student.academics.semesterRanks.find(r => r.semester === selectedSemester)?.totalStudents || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="subject-actions-sdp">
                            <button className="expand-all-button" onClick={expandAllSubjects}>Expand All</button>
                            <button className="collapse-all-button" onClick={collapseAllSubjects}>Collapse All</button>
                        </div>

                        <div className="subjects-list-sdp">
                            {student.academics.semesters[selectedSemester]?.subjects.map(subject =>
                                renderSubjectCard(subject)
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'co-curricular' && (
                    <div className="activities-section">
                        <div className="activities-header">
                            <h3 className="section-title">Co-Curricular Activities</h3>
                            <div className="activities-actions">
                                <div className="filter-container">
                                    <button
                                        className={`filter-button ${activityFilter === 'all' ? 'active' : ''}`}
                                        onClick={() => setActivityFilter('all')}
                                    >
                                        <Filter size={14} /> All Semesters
                                    </button>
                                    <button
                                        className={`filter-button ${activityFilter === 'semester' ? 'active' : ''}`}
                                        onClick={() => setActivityFilter('semester')}
                                    >
                                        <Filter size={14} /> Current Semester ({selectedSemester})
                                    </button>
                                </div>
                                <button className="add-activity-button" onClick={() => handleAddActivity('co')}>
                                    <Plus size={14} /> Add Activity
                                </button>
                            </div>
                        </div>

                        <div className="activities-summary">
                            <div className="summary-card">
                                <h4>Total Activities</h4>
                                <div className="summary-value">{student.coCurricular.length}</div>
                            </div>
                            <div className="summary-card">
                                <h4>Current Semester</h4>
                                <div className="summary-value">
                                    {student.coCurricular.filter(a => a.semester === selectedSemester).length}
                                </div>
                            </div>
                            <div className="summary-card">
                                <h4>Total Points</h4>
                                <div className="summary-value">{calculateActivityPoints(student.coCurricular)}</div>
                            </div>
                            <div className="summary-card">
                                <h4>Semester Points</h4>
                                <div className="summary-value">
                                    {calculateActivityPoints(student.coCurricular.filter(a => a.semester === selectedSemester))}
                                </div>
                            </div>
                        </div>

                        <div className="activities-list">
                            {filterActivitiesBySemester(student.coCurricular, selectedSemester).map(activity =>
                                renderActivityCard(activity, 'co')
                            )}

                            {filterActivitiesBySemester(student.coCurricular, selectedSemester).length === 0 && (
                                <div className="no-activities-message">
                                    <p>No co-curricular activities found for {activityFilter === 'all' ? 'any semester' : `semester ${selectedSemester}`}.</p>
                                    <button className="add-activity-button small" onClick={() => handleAddActivity('co')}>
                                        <Plus size={14} /> Add Activity
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'extra-curricular' && (
                    <div className="activities-section">
                        <div className="activities-header">
                            <h3 className="section-title">Extra-Curricular Activities</h3>
                            <div className="activities-actions">
                                <div className="filter-container">
                                    <button
                                        className={`filter-button ${activityFilter === 'all' ? 'active' : ''}`}
                                        onClick={() => setActivityFilter('all')}
                                    >
                                        <Filter size={14} /> All Semesters
                                    </button>
                                    <button
                                        className={`filter-button ${activityFilter === 'semester' ? 'active' : ''}`}
                                        onClick={() => setActivityFilter('semester')}
                                    >
                                        <Filter size={14} /> Current Semester ({selectedSemester})
                                    </button>
                                </div>
                                <button className="add-activity-button" onClick={() => handleAddActivity('extra')}>
                                    <Plus size={14} /> Add Activity
                                </button>
                            </div>
                        </div>

                        <div className="activities-summary">
                            <div className="summary-card">
                                <h4>Total Activities</h4>
                                <div className="summary-value">{student.extraCurricular.length}</div>
                            </div>
                            <div className="summary-card">
                                <h4>Current Semester</h4>
                                <div className="summary-value">
                                    {student.extraCurricular.filter(a => a.semester === selectedSemester).length}
                                </div>
                            </div>
                            <div className="summary-card">
                                <h4>Total Points</h4>
                                <div className="summary-value">{calculateActivityPoints(student.extraCurricular)}</div>
                            </div>
                            <div className="summary-card">
                                <h4>Semester Points</h4>
                                <div className="summary-value">
                                    {calculateActivityPoints(student.extraCurricular.filter(a => a.semester === selectedSemester))}
                                </div>
                            </div>
                        </div>

                        <div className="activities-list">
                            {filterActivitiesBySemester(student.extraCurricular, selectedSemester).map(activity =>
                                renderActivityCard(activity, 'extra')
                            )}

                            {filterActivitiesBySemester(student.extraCurricular, selectedSemester).length === 0 && (
                                <div className="no-activities-message">
                                    <p>No extra-curricular activities found for {activityFilter === 'all' ? 'any semester' : `semester ${selectedSemester}`}.</p>
                                    <button className="add-activity-button small" onClick={() => handleAddActivity('extra')}>
                                        <Plus size={14} /> Add Activity
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {(showAddForm || showEditForm) && renderActivityForm()}
        </div>
    );
};

export default StudentDetails;