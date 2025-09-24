import React, { useState, useEffect } from 'react';
import { buildUrl } from '../../../utils/apiConfig';

const StudentPerformance = ({ student }) => {
  const [studentMarks, setStudentMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (student?.enrollmentNumber && student?.batch && student?.semester) {
      fetchStudentMarks();
    }
  }, [student]);

  const fetchStudentMarks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Extract batch ID and semester number from student data
      const batchId = student.batch === '2022-26' ? 1 : 2; // Adjust based on your batch mapping
      const semesterNumber = parseInt(student.semester.replace('Semester ', ''));
      
      const response = await fetch(buildUrl(`/studentMarks/grading/${batchId}/${semesterNumber}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student marks');
      }

      const data = await response.json();
      
      // Find the current student's marks
      const currentStudentData = data.find(s => s.enrollmentNumber === student.enrollmentNumber);
      
      if (currentStudentData && currentStudentData.studentMarks) {
        // Group marks by subject
        const marksBySubject = {};
        currentStudentData.studentMarks.forEach(mark => {
          const subjectId = mark.subjectId;
          if (!marksBySubject[subjectId]) {
            marksBySubject[subjectId] = {
              subjectId,
              subjectName: mark.subject?.sub_name || subjectId,
              totalMarksObtained: 0,
              totalPossibleMarks: 0,
              components: []
            };
          }
          
          marksBySubject[subjectId].totalMarksObtained += parseFloat(mark.marksObtained || 0);
          marksBySubject[subjectId].totalPossibleMarks += parseFloat(mark.totalMarks || 0);
          marksBySubject[subjectId].components.push({
            componentType: mark.componentType,
            componentName: mark.componentName,
            marksObtained: parseFloat(mark.marksObtained || 0),
            totalMarks: parseFloat(mark.totalMarks || 0),
            percentage: mark.totalMarks > 0 ? ((parseFloat(mark.marksObtained || 0) / parseFloat(mark.totalMarks)) * 100).toFixed(2) : 0
          });
        });
        
        // Convert to array and calculate overall percentage
        const marksArray = Object.values(marksBySubject).map(subject => ({
          ...subject,
          percentage: subject.totalPossibleMarks > 0 ? ((subject.totalMarksObtained / subject.totalPossibleMarks) * 100).toFixed(2) : 0
        }));
        
        setStudentMarks(marksArray);
      } else {
        setStudentMarks([]);
      }
    } catch (error) {
      console.error('Error fetching student marks:', error);
      setError(error.message);
      setStudentMarks([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="student-performance-container">
        <h3>Current Grades</h3>
        <div className="loading-indicator">Loading student marks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-performance-container">
        <h3>Current Grades</h3>
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="student-performance-container">
      <h3>Current Grades</h3>
      
      {studentMarks.length === 0 ? (
        <div className="no-data-message">
          No marks data available for this student.
        </div>
      ) : (
        <div className="grades-table-container">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Component</th>
                <th>Marks Obtained</th>
                <th>Total Marks</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {studentMarks.map((subject, subjectIndex) => (
                subject.components.map((component, componentIndex) => (
                  <tr key={`${subjectIndex}-${componentIndex}`}>
                    {componentIndex === 0 && (
                      <td rowSpan={subject.components.length} className="subject-cell">
                        <div className="subject-info">
                          <div className="subject-name">{subject.subjectName}</div>
                          <div className="subject-code">({subject.subjectId})</div>
                          <div className="subject-total">
                            Total: {subject.totalMarksObtained}/{subject.totalPossibleMarks} ({subject.percentage}%)
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="component-cell">
                      <div className="component-type">{component.componentType}</div>
                      {component.componentName && (
                        <div className="component-name">({component.componentName})</div>
                      )}
                    </td>
                    <td className="marks-obtained">{component.marksObtained}</td>
                    <td className="total-marks">{component.totalMarks}</td>
                    <td className="percentage">
                      <div className="percentage-bar">
                        <div 
                          className="percentage-fill" 
                          style={{ width: `${Math.min(component.percentage, 100)}%` }}
                        ></div>
                        <span className="percentage-text">{component.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentPerformance;

// Add CSS styles for the new table layout
const styles = `
.grades-table-container {
  margin-top: 20px;
  overflow-x: auto;
}

.grades-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.grades-table th {
  background: #4361ee;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
}

.grades-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.subject-cell {
  background: #f8fafc;
  border-right: 2px solid #e2e8f0;
  min-width: 200px;
}

.subject-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subject-name {
  font-weight: 600;
  color: #1e293b;
}

.subject-code {
  font-size: 0.875rem;
  color: #64748b;
}

.subject-total {
  font-size: 0.875rem;
  color: #4361ee;
  font-weight: 500;
  margin-top: 8px;
  padding: 4px 8px;
  background: #e0e7ff;
  border-radius: 4px;
}

.component-cell {
  min-width: 120px;
}

.component-type {
  font-weight: 500;
  color: #1e293b;
}

.component-name {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 2px;
}

.marks-obtained, .total-marks {
  text-align: center;
  font-weight: 500;
  min-width: 80px;
}

.percentage {
  min-width: 150px;
}

.percentage-bar {
  position: relative;
  background: #e2e8f0;
  border-radius: 10px;
  height: 24px;
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  background: linear-gradient(90deg, #4361ee, #6d8eff);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.percentage-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.loading-indicator, .error-message, .no-data-message {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-style: italic;
}

.error-message {
  color: #dc2626;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
