import React from 'react';
import Charts from './Charts';

const StudentDetails = ({ student, onClose, category }) => {
  // Calculate strengths based on subjects
  const getStrengthAreas = () => {
    if (!student || !student.subjects) return { writing: 0, analytical: 0, calculation: 0, memory: 0, critical: 0 };
    
    const strengths = {
      writing: student.subjects.find(sub => sub.type === 'writing')?.score || 0,
      analytical: student.subjects.find(sub => sub.type === 'analytical')?.score || 0,
      calculation: student.subjects.find(sub => sub.type === 'calculation')?.score || 0,
      memory: student.subjects.find(sub => sub.type === 'memory')?.score || 0,
      critical: student.subjects.find(sub => sub.type === 'critical')?.score || 0
    };
    
    return strengths;
  };
  
  const strengths = getStrengthAreas();
  
  // Get the highest strength area
  const getTopStrength = () => {
    if (!Object.keys(strengths).length) return 'No data available';
    
    const top = Object.entries(strengths).reduce((max, [key, value]) => 
      value > max.value ? { key, value } : max, 
      { key: '', value: 0 }
    );
    
    const mapping = {
      writing: 'Writing-based subjects',
      analytical: 'Analytical subjects',
      calculation: 'Calculation-based subjects',
      memory: 'Memory-based subjects',
      critical: 'Critical thinking subjects'
    };
    
    return mapping[top.key];
  };

  if (!student) return null;

  return (
    <div className="student-details">
      <div className="details-header">
        <h2>Student Performance Analysis</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="student-info">
        <div className="info-card">
          <h3>{student.name}</h3>
          <p><strong>Roll Number:</strong> {student.rollNumber}</p>
          <p><strong>Batch:</strong> {student.batch}</p>
          <p><strong>Semester:</strong> {student.semester}</p>
          <p><strong>Overall Ranking:</strong> {student.ranking}</p>
          <p><strong>Total Score:</strong> {student.totalScore}</p>
        </div>
        
        <div className="strength-analysis">
          <h3>Academic Strength Analysis</h3>
          <p>This student performs best in: <strong>{getTopStrength()}</strong></p>
          
          <div className="strength-bars">
            <div className="strength-item">
              <label>Writing-based:</label>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${strengths.writing}%` }}></div>
                <span>{Math.round(strengths.writing)}%</span>
              </div>
            </div>
            
            <div className="strength-item">
              <label>Analytical:</label>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${strengths.analytical}%` }}></div>
                <span>{Math.round(strengths.analytical)}%</span>
              </div>
            </div>
            
            <div className="strength-item">
              <label>Calculation:</label>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${strengths.calculation}%` }}></div>
                <span>{Math.round(strengths.calculation)}%</span>
              </div>
            </div>
            
            <div className="strength-item">
              <label>Memory-based:</label>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${strengths.memory}%` }}></div>
                <span>{Math.round(strengths.memory)}%</span>
              </div>
            </div>
            
            <div className="strength-item">
              <label>Critical Thinking:</label>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${strengths.critical}%` }}></div>
                <span>{Math.round(strengths.critical)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="performance-comparison">
        <h3>Performance Comparison with Class Average</h3>
        <div className="comparison-container">
          <div className="comparison-item">
            <span className="label">Student Score</span>
            <span className="score">{student.totalScore}%</span>
            <div className="bar student-bar" style={{ width: `${student.totalScore}%` }}></div>
          </div>
          <div className="comparison-item">
            <span className="label">Class Average</span>
            <span className="score">{student.classAverage}%</span>
            <div className="bar average-bar" style={{ width: `${student.classAverage}%` }}></div>
          </div>
        </div>
      </div>
      
      <Charts 
        student={student} 
        category={category}
      />
    </div>
  );
};

export default StudentDetails;
