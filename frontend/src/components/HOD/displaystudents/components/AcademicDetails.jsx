import React from 'react';
import { User, Award, Trophy, Star, ChevronDown } from 'lucide-react';
import './AcademicDetails.css';

const AcademicDetails = ({ 
  student, 
  selectedSemester, 
  expandedSubjects, 
  toggleSubject, 
  expandAllSubjects, 
  collapseAllSubjects, 
  onSemesterChange 
}) => {
  return (
    <div className="academic-section">
      <div className="semester-navigation-sdp">
        <h3 className="section-title">Academic Performance</h3>
        <div className="semester-selectors">
          {Object.keys(student.academics.semesters).map(sem => (
            <button
              key={sem}
              className={`semester-button ${selectedSemester === parseInt(sem) ? 'active' : ''}`}
              onClick={() => onSemesterChange(parseInt(sem))}
            >
              Semester {sem}
            </button>
          ))}
        </div>
        <div className="semester-summary">
          <div className="summary-item">
            <span className="summary-label">Semester GPA</span>
            <span className="summary-value">{student.academics.semesters[selectedSemester]?.gpa || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Credits</span>
            <span className="summary-value">{student.academics.semesters[selectedSemester]?.credits || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Subjects</span>
            <span className="summary-value">{student.academics.semesters[selectedSemester]?.subjects?.length || 0}</span>
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
        {student.academics.semesters[selectedSemester]?.subjects.map(subject => (
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