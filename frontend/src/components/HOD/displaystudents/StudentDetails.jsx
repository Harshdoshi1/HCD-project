import React, { useState } from 'react';
import './StudentDetail.css';
import { ArrowLeft, Star, Book, Clock, Mail, Phone, MapPin, ChevronDown, User, Award, ChevronRight } from 'lucide-react';

const StudentDetails = ({ studentId, handleBackToList }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedSemester, setSelectedSemester] = useState(1);
    const [expandedSubjects, setExpandedSubjects] = useState(new Set());

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
        const allSubjectIds = student.semesters[selectedSemester].map(subject => subject.id);
        setExpandedSubjects(new Set(allSubjectIds));
    };

    const collapseAllSubjects = () => {
        setExpandedSubjects(new Set());
    };

    // Mock data for student with enhanced details
    const student = {
        id: studentId,
        name: 'John Doe',
        enrollmentNo: 'EN2023001',
        department: 'Computer Engineering',
        semester: 6,
        image: 'default-profile.jpg',
        batch: '2023-2027',
        cgpa: 8.9,
        attendance: '92%',
        email: 'john.doe@college.edu',
        phone: '+91 9876543210',
        address: '123 College Road, City',
        bloodGroup: 'O+',
        parentName: 'Robert Doe',
        parentContact: '+91 9876543211',
        semesters: {
            1: [
                {
                    id: 1,
                    name: 'Mathematics I',
                    faculty: 'Dr. Smith',
                    attendance: '95%',
                    totalMarks: 87,
                    classRank: 5,
                    totalStudents: 120,
                    facultyRating: 8.5,
                    components: {
                        midSem1: { marks: 45, total: 50 },
                        midSem2: { marks: 42, total: 50 },
                        ESE: { marks: 72, total: 80 },
                        CES: { marks: 18, total: 20 },
                        TW: { marks: 23, total: 25 },
                        IA: { marks: 27, total: 30 },
                        VIVA: { marks: 19, total: 20 }
                    },
                    facultyResponse: {
                        strengths: ['Excellent problem solving', 'Regular participation', 'Good grasp of concepts'],
                        improvements: ['Time management in exams', 'Practice more complex problems'],
                        comments: 'Shows great potential in mathematics, needs to work on exam strategy.',
                        lastUpdated: '2024-02-20'
                    }
                },
                {
                    id: 2,
                    name: 'Physics',
                    faculty: 'Dr. Johnson',
                    attendance: '92%',
                    totalMarks: 82,
                    classRank: 8,
                    totalStudents: 120,
                    facultyRating: 7.5,
                    components: {
                        midSem1: { marks: 43, total: 50 },
                        midSem2: { marks: 40, total: 50 },
                        ESE: { marks: 65, total: 80 },
                        CES: { marks: 17, total: 20 },
                        TW: { marks: 22, total: 25 },
                        IA: { marks: 25, total: 30 },
                        VIVA: { marks: 18, total: 20 }
                    },
                    facultyResponse: {
                        strengths: ['Good practical skills', 'Active in laboratory sessions'],
                        improvements: ['Theory concepts need more focus', 'Written presentation'],
                        comments: 'Good practical understanding but needs to improve theoretical concepts.',
                        lastUpdated: '2024-02-18'
                    }
                },
                {
                    id: 3,
                    name: 'Basic Electronics',
                    faculty: 'Prof. Wilson',
                    attendance: '88%',
                    totalMarks: 79,
                    classRank: 12,
                    totalStudents: 120,
                    facultyRating: 8.0,
                    components: {
                        midSem1: { marks: 41, total: 50 },
                        midSem2: { marks: 39, total: 50 },
                        ESE: { marks: 63, total: 80 },
                        CES: { marks: 16, total: 20 },
                        TW: { marks: 21, total: 25 },
                        IA: { marks: 24, total: 30 },
                        VIVA: { marks: 17, total: 20 }
                    },
                    facultyResponse: {
                        strengths: ['Circuit design skills', 'Lab work dedication'],
                        improvements: ['Theoretical understanding', 'Circuit analysis speed'],
                        comments: 'Good hands-on skills but needs to strengthen theoretical foundation.',
                        lastUpdated: '2024-02-19'
                    }
                },
                {
                    id: 4,
                    name: 'Engineering Graphics',
                    faculty: 'Prof. Anderson',
                    attendance: '94%',
                    totalMarks: 85,
                    classRank: 6,
                    totalStudents: 120,
                    facultyRating: 8.2,
                    components: {
                        midSem1: { marks: 44, total: 50 },
                        midSem2: { marks: 43, total: 50 },
                        ESE: { marks: 68, total: 80 },
                        CES: { marks: 17, total: 20 },
                        TW: { marks: 22, total: 25 },
                        IA: { marks: 26, total: 30 },
                        VIVA: { marks: 18, total: 20 }
                    },
                    facultyResponse: {
                        strengths: ['Drawing accuracy', 'Understanding of projections'],
                        improvements: ['Speed in completion', 'Complex assembly drawings'],
                        comments: 'Shows good precision in drawings but needs to improve speed.',
                        lastUpdated: '2024-02-21'
                    }
                },
                {
                    id: 5,
                    name: 'Programming Fundamentals',
                    faculty: 'Dr. Roberts',
                    attendance: '96%',
                    totalMarks: 90,
                    classRank: 3,
                    totalStudents: 120,
                    facultyRating: 9.0,
                    components: {
                        midSem1: { marks: 47, total: 50 },
                        midSem2: { marks: 46, total: 50 },
                        ESE: { marks: 73, total: 80 },
                        CES: { marks: 18, total: 20 },
                        TW: { marks: 24, total: 25 },
                        IA: { marks: 28, total: 30 },
                        VIVA: { marks: 19, total: 20 }
                    },
                    facultyResponse: {
                        strengths: ['Coding logic', 'Problem-solving ability', 'Quick learning'],
                        improvements: ['Code documentation', 'Error handling'],
                        comments: 'Excellent programming skills with strong logical thinking.',
                        lastUpdated: '2024-02-22'
                    }
                }
            ]
        }
    };

    const coCurricularActivities = [
        {
            id: 1,
            title: 'Technical Paper Presentation',
            date: '2024-01-15',
            description: 'Presented research paper on AI in Healthcare at IEEE conference',
            achievement: 'First Prize'
        },
        {
            id: 2,
            title: 'Coding Competition',
            date: '2024-02-10',
            description: 'Participated in national level coding competition',
            achievement: 'Runner-up'
        }
    ];

    const extraCurricularActivities = [
        {
            id: 1,
            title: 'Cultural Fest Performance',
            date: '2024-03-01',
            description: 'Lead dancer in annual cultural fest',
            achievement: 'Best Performance Award'
        },
        {
            id: 2,
            title: 'Sports Tournament',
            date: '2024-02-20',
            description: 'College cricket team captain',
            achievement: 'Tournament Winners'
        }
    ];

    const renderStudentOverview = () => (
        <div className="student-overview">
            <div className="overview-stats">
                <div className="stat-card">
                    <Star className="stat-icon" />
                    <span className="stat-value">{student.cgpa}</span>
                    <span className="stat-label">CGPA</span>
                </div>
                <div className="stat-card">
                    <Clock className="stat-icon" />
                    <span className="stat-value">{student.attendance}</span>
                    <span className="stat-label">Attendance</span>
                </div>
                <div className="stat-card">
                    <Book className="stat-icon" />
                    <span className="stat-value">{student.semester}</span>
                    <span className="stat-label">Current Semester</span>
                </div>
            </div>

            <div className="student-details-grid">
                <div className="detail-item">
                    <span className="detail-label">Department</span>
                    <span className="detail-value">{student.department}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Batch</span>
                    <span className="detail-value">{student.batch}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Enrollment No</span>
                    <span className="detail-value">{student.enrollmentNo}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">
                        <Mail size={16} className="detail-icon" />
                        Email
                    </span>
                    <span className="detail-value">{student.email}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">
                        <Phone size={16} className="detail-icon" />
                        Contact
                    </span>
                    <span className="detail-value">{student.phone}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">
                        <MapPin size={16} className="detail-icon" />
                        Address
                    </span>
                    <span className="detail-value">{student.address}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Blood Group</span>
                    <span className="detail-value">{student.bloodGroup}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Parent Details</span>
                    <span className="detail-value">
                        {student.parentName} ({student.parentContact})
                    </span>
                </div>
            </div>
        </div>
    );

    const renderSubjectCard = (subject) => {
        const isExpanded = expandedSubjects.has(subject.id);

        return (
            <div key={subject.id} className="subject-card">
                <div className="subject-header" onClick={() => toggleSubject(subject.id)}>
                    <div className="subject-main-info">
                        <div className="subject-title-section">
                            <h4>{subject.name}</h4>
                            <div className="subject-quick-info">
                                <span className="quick-info-item">
                                    <User size={12} />
                                    {subject.faculty}
                                </span>
                                <span className="quick-info-item">
                                    <Clock size={12} />
                                    {subject.attendance}
                                </span>
                                <span className="quick-info-item">
                                    <Award size={12} />
                                    {subject.totalMarks}%
                                </span>
                                <span className="quick-info-item">
                                    <ChevronRight size={12} />
                                    Rank {subject.classRank}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={`subject-expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>

                <div className={`subject-content ${isExpanded ? 'expanded' : ''}`}>
                    <div className="subject-details">
                        <div className="performance-section">
                            <h5>Performance Components</h5>
                            <div className="performance-grid">
                                {Object.entries(subject.components).map(([name, data]) => (
                                    <div key={name} className="performance-item">
                                        <div className="performance-label">{name}</div>
                                        <div className="performance-value">
                                            {data.marks}/{data.total}
                                            <div className="marks-percentage">
                                                {Math.round((data.marks / data.total) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="class-standing">
                                <div className="standing-label">Class Standing</div>
                                <div className="standing-value">
                                    Rank {subject.classRank} of {subject.totalStudents}
                                </div>
                            </div>
                        </div>

                        <div className="faculty-feedback">
                            <div className="faculty-rating">
                                <h6>Faculty Rating</h6>
                                <div className="rating-stars">
                                    {[...Array(10)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            className={i < Math.floor(subject.facultyRating) ? 'star-filled' : 'star-empty'}
                                        />
                                    ))}
                                    <span>({subject.facultyRating}/10)</span>
                                </div>
                            </div>

                            <div className="response-details">
                                <div className='strength-aoi'>
                                    <div className="strengths">
                                        <h6>Strengths</h6>
                                        <ul>
                                            {subject.facultyResponse.strengths.map((strength, idx) => (
                                                <li key={idx}>{strength}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="improvements">
                                        <h6>Areas for Improvement</h6>
                                        <ul>
                                            {subject.facultyResponse.improvements.map((improvement, idx) => (
                                                <li key={idx}>{improvement}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="faculty-comments">
                                    <h6>Comments</h6>
                                    <p>{subject.facultyResponse.comments}</p>
                                    <small>Last Updated: {subject.facultyResponse.lastUpdated}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="student-detail-container">
            <div className="student-header">
                <ArrowLeft
                    className="back-arrow"
                    onClick={handleBackToList}
                    size={24}
                />
                <div className="student-profile">
                    <img
                        src={student.image || 'default-profile.jpg'}
                        alt={student.name}
                        className="student-detail-image"
                    />
                    <div className="student-info">
                        <h2>{student.name}</h2>
                        <p>{student.enrollmentNo}</p>
                        <p>{student.department} - {student.semester}th Semester</p>
                    </div>
                </div>
            </div>

            <div className="activities-tabs">
                <button
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={activeTab === 'curricular' ? 'active' : ''}
                    onClick={() => setActiveTab('curricular')}
                >
                    Curricular
                </button>
                <button
                    className={activeTab === 'co-curricular' ? 'active' : ''}
                    onClick={() => setActiveTab('co-curricular')}
                >
                    Co-Curricular
                </button>
                <button
                    className={activeTab === 'extra-curricular' ? 'active' : ''}
                    onClick={() => setActiveTab('extra-curricular')}
                >
                    Extra-Curricular
                </button>
            </div>

            <div className="content-section">
                {activeTab === 'overview' && renderStudentOverview()}

                {activeTab === 'curricular' && (
                    <div className="curricular-section">
                        <div className="semester-selector">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <button
                                    key={sem}
                                    className={`semester-select ${selectedSemester === sem ? 'active' : ''}`}
                                    onClick={() => setSelectedSemester(sem)}
                                >
                                    Sem {sem}
                                </button>
                            ))}
                        </div>

                        {/* <div className="expand-collapse-controls">
                            <button className="control-btn" onClick={expandAllSubjects}>
                                Expand All
                            </button>
                            <button className="control-btn" onClick={collapseAllSubjects}>
                                Collapse All
                            </button>
                        </div> */}

                        <div className="subjects-list-for-sem">
                            {student.semesters[selectedSemester]?.map(subject =>
                                renderSubjectCard(subject)
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'co-curricular' && (
                    <div className="activity-section">
                        <h3>Co-Curricular Activities</h3>
                        <div className="activity-grid">
                            {coCurricularActivities.map(activity => (
                                <div key={activity.id} className="activity-card co-curricular">
                                    <div className="activity-date">{activity.date}</div>
                                    <div className="activity-title">{activity.title}</div>
                                    <div className="activity-description">{activity.description}</div>
                                    <div className="activity-achievement">Achievement: {activity.achievement}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'extra-curricular' && (
                    <div className="activity-section">
                        <h3>Extra-Curricular Activities</h3>
                        <div className="activity-grid">
                            {extraCurricularActivities.map(activity => (
                                <div key={activity.id} className="activity-card extra-curricular">
                                    <div className="activity-date">{activity.date}</div>
                                    <div className="activity-title">{activity.title}</div>
                                    <div className="activity-description">{activity.description}</div>
                                    <div className="activity-achievement">Achievement: {activity.achievement}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetails;
