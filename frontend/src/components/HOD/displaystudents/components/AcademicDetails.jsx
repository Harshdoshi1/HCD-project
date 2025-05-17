import React, { useState } from 'react';
import { User, Award, Trophy, Star, ChevronDown } from 'lucide-react';
import './AcademicDetails.css';

const AcademicDetails = () => {
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());

  const toggleSubject = (id) => {
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAllSubjects = () => {
    setExpandedSubjects(new Set(dummyStudent.academics.subjects.map((subject) => subject.id)));
  };

  const collapseAllSubjects = () => {
    setExpandedSubjects(new Set());
  };

  const dummyStudent = {
    academics: {
      subjects: [
        {
          id: 1,
          name: 'Mathematics',
          code: 'MATH101',
          faculty: 'Dr. John Doe',
          grade: 'A',
          classRank: 1,
          totalStudents: 30,
          components: {
            Assignment: { marks: 18, total: 20 },
            Quiz: { marks: 9, total: 10 },
            Exam: { marks: 45, total: 50 },
          },
          totalMarks: 90,
          facultyRating: 8.5,
          facultyResponse: {
            comments: 'Excellent performance throughout the semester.',
            lastUpdated: '2023-03-01',
          },
        },
        {
          id: 2,
          name: 'Physics',
          code: 'PHYS101',
          faculty: 'Dr. Jane Smith',
          grade: 'B+',
          classRank: 5,
          totalStudents: 30,
          components: {
            Assignment: { marks: 15, total: 20 },
            Quiz: { marks: 8, total: 10 },
            Exam: { marks: 40, total: 50 },
          },
          totalMarks: 85,
          facultyRating: 7.8,
          facultyResponse: {
            comments: 'Good understanding of concepts but needs improvement in problem-solving.',
            lastUpdated: '2023-03-02',
          },
        },
      ],
    },
  };

  return (
    <div className="academic-section">
      <h3 className="section-title">Academic Performance</h3>

      <div className="subject-actions-sdp">
        <button className="expand-all-button" onClick={expandAllSubjects}>Expand All</button>
        <button className="collapse-all-button" onClick={collapseAllSubjects}>Collapse All</button>
      </div>

      <div className="subjects-list-sdp">
        {dummyStudent.academics.subjects.map((subject) => (
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
              <div className={`subject-expand-icon ${expandedSubjects.has(subject.id) ? 'expanded' : ''}`}>
                <ChevronDown size={16} />
              </div>
            </div>

            <div className={`subject-content-sdp ${expandedSubjects.has(subject.id) ? 'expanded' : ''}`}>
              <div className="performance-section-sdp">
                <h5 className="section-heading-sdp">Performance Components</h5>
                <div className="performance-grid-sdp">
                  {Object.entries(subject.components).map(([name, data]) => (
                    <div key={name} className="performance-item">
                      <div className="performance-label">{name}
                        <div className="marks-display">
                          <span className="marks-value">{data.marks}</span>
                          <span className="marks-total">/{data.total}</span>
                        </div>
                      </div>
                      <div className="marks-progress">
                        <div
                          className="marks-progress-fill"
                          style={{ width: `${(data.marks / data.total) * 100}%` }}
                        ></div>
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
        ))}
      </div>
    </div>
  );
};

export default AcademicDetails;