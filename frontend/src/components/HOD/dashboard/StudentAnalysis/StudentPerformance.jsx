import React from 'react';

const StudentPerformance = ({ student }) => {
  const hardwareSubjects = [
    { name: 'Digital Logic Design', score: student.hdlScore || 0 },
    { name: 'Microcontrollers', score: student.microcontrollerScore || 0 },
    { name: 'Computer Organization', score: student.computerOrgScore || 0 }
  ];

  const softwareSubjects = [
    { name: 'Data Structures', score: student.dsScore || 0 },
    { name: 'Algorithms', score: student.algoScore || 0 },
    { name: 'Operating Systems', score: student.osScore || 0 }
  ];

  return (
    <div className="student-performance-container">
      <h3>Subject Performance Analysis</h3>
      
      <div className="performance-cards">
        <div className="performance-card">
          <h4>Hardware Subjects</h4>
          <div className="subject-list">
            {hardwareSubjects.map((subject, index) => (
              <div key={index} className="subject-item">
                <span className="subject-name">{subject.name}</span>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${subject.score}%` }}
                  >
                    <span className="progress-text">{subject.score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="performance-card">
          <h4>Software Subjects</h4>
          <div className="subject-list">
            {softwareSubjects.map((subject, index) => (
              <div key={index} className="subject-item">
                <span className="subject-name">{subject.name}</span>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${subject.score}%` }}
                  >
                    <span className="progress-text">{subject.score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
