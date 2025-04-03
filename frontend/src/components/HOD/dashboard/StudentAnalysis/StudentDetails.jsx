import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
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

  const radarData = [
    { subject: 'Writing-based', value: strengths.writing },
    { subject: 'Analytical', value: strengths.analytical },
    { subject: 'Calculation', value: strengths.calculation },
    { subject: 'Memory-based', value: strengths.memory },
    { subject: 'Critical Thinking', value: strengths.critical }
  ];

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
      calculation: 'Calculation subjects',
      memory: 'Memory-based subjects',
      critical: 'Critical thinking subjects'
    };
    
    return mapping[top.key] || 'No data available';
  };

  return (
    <div className="student-details">
      <div className="details-header">
        <h2>Student Performance Analysis</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="student-info-vertical">
        <div className="info-card">
          <h3>{student?.name || 'N/A'}</h3>
          <p><strong>Roll Number:</strong> {student?.rollNumber || 'N/A'}</p>
          <p><strong>Batch:</strong> {student?.batch || 'N/A'}</p>
          <p><strong>Semester:</strong> {student?.semester || 'N/A'}</p>
          <p><strong>Overall Ranking:</strong> {student?.ranking || 'N/A'}</p>
          <p><strong>Total Score:</strong> {student?.totalScore || 'N/A'}</p>
        </div>

        <div className="strength-analysis">
          <h3>Academic Strength Analysis</h3>
          <p>This student performs best in: <strong>{getTopStrength()}</strong></p>

          <div className="radar-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid gridType="polygon" stroke="#e2e8f0" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#4b5563"
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#4b5563' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="#4b5563"
                  tick={{ fontSize: 12, fill: '#4b5563' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  labelStyle={{
                    fontWeight: 'bold',
                    color: '#1e3a8a'
                  }}
                  itemStyle={{
                    color: '#4b5563'
                  }}
                />
                <Radar
                  name="Academic Strengths"
                  dataKey="value"
                  stroke="#4361ee"
                  fill="#6d8eff"
                  fillOpacity={0.6}
                  strokeWidth={2}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease"
                  dot={{
                    fill: '#4361ee',
                    stroke: '#fff',
                    strokeWidth: 2,
                    r: 4
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="performance-details">
          <h3>Performance Details</h3>
          <div className="performance-metrics">
            <div className="metric-item">
              <span className="metric-label">Attendance</span>
              <span className="metric-value">{student?.attendance || 'N/A'}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Curricular</span>
              <span className="metric-value">{student?.curricular || 'N/A'}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Co-Curricular</span>
              <span className="metric-value">{student?.coCurricular || 'N/A'}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Extra-Curricular</span>
              <span className="metric-value">{student?.extraCurricular || 'N/A'}%</span>
            </div>
          </div>
        </div>
      </div>

      {student && (
        <Charts
          student={student}
          category={category}
        />
      )}
    </div>
  );
};

export default StudentDetails;