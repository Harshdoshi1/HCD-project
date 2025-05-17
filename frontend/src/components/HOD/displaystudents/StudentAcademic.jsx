import React, { useState } from 'react';
import { User, Award, Star, ChevronDown } from 'lucide-react';
import './StudentAcademic.css';

const StudentAcademic = ({ student }) => {
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
        const allSubjectIds = student.academics.semesters[selectedSemester].subjects.map(subject => subject.id);
        setExpandedSubjects(new Set(allSubjectIds));
    };

    const collapseAllSubjects = () => {
        setExpandedSubjects(new Set());
    };

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
                                <Award size={14} />
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

    return (
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
    );
};

export default StudentAcademic;