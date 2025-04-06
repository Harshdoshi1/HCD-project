import React from 'react';
import { User, Mail, Phone, Activity, Calendar, Book, Award, Trophy } from 'lucide-react';
import './StudentOverview.css';

const StudentOverview = ({ student }) => {
    return (
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
};

export default StudentOverview;