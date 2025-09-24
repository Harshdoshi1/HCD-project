import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { buildUrl } from '../../../utils/apiConfig';

const Charts = ({ student, category }) => {
  const [activityPoints, setActivityPoints] = useState({
    coCurricular: 0,
    extraCurricular: 0
  });
  const [bloomsData, setBloomsData] = useState([]);
  const [subjectBloomsData, setSubjectBloomsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bloomsLoading, setBloomsLoading] = useState(false);

  useEffect(() => {
    // Fetch activity points and blooms data when student changes
    if (student?.enrollmentNumber) {
      fetchStudentPoints(student.enrollmentNumber);
      fetchBloomsDistribution(student.enrollmentNumber, student.semester);
    }
  }, [student]);

  const fetchStudentPoints = async (enrollmentNumber) => {
    setIsLoading(true);
    try {
      // First, fetch event IDs for the student
      const idsResponse = await fetch(buildUrl('/events/fetchEventsIDsbyEnroll'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentNumber: enrollmentNumber
        }),
      });

      if (!idsResponse.ok) {
        console.error('Failed to fetch event IDs:', await idsResponse.text());
        return;
      }

      const idsData = await idsResponse.json();
      console.log('Event IDs data:', idsData);

      // If we have event IDs, fetch the details for both types
      if (idsData && idsData.length > 0) {
        // Get all event IDs
        const allEventIds = idsData
          .filter(item => item.eventId)
          .map(item => item.eventId)
          .join(',');

        if (allEventIds) {
          // Fetch co-curricular events
          const coResponse = await fetch(buildUrl('/events/fetchEventsByEventIds'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventIds: allEventIds,
              eventType: 'co-curricular'
            }),
          });

          // Fetch extra-curricular events
          const extraResponse = await fetch(buildUrl('/events/fetchEventsByEventIds'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventIds: allEventIds,
              eventType: 'extra-curricular'
            }),
          });

          if (coResponse.ok && extraResponse.ok) {
            const coData = await coResponse.json();
            const extraData = await extraResponse.json();
            
            console.log('Co-curricular data:', coData);
            console.log('Extra-curricular data:', extraData);
            
            // Calculate total points for each category
            const coPoints = coData && coData.data && Array.isArray(coData.data) 
              ? coData.data.reduce((total, item) => total + (parseInt(item.points) || 0), 0) 
              : 0;
              
            const extraPoints = extraData && extraData.data && Array.isArray(extraData.data) 
              ? extraData.data.reduce((total, item) => total + (parseInt(item.points) || 0), 0) 
              : 0;
            
            setActivityPoints({
              coCurricular: coPoints,
              extraCurricular: extraPoints
            });
          } else {
            console.error('Failed to fetch event details');
          }
        }
      } else {
        // No events found, set points to 0
        setActivityPoints({
          coCurricular: 0,
          extraCurricular: 0
        });
      }
    } catch (error) {
      console.error('Error fetching student points:', error);
      // Set points to 0 on error
      setActivityPoints({
        coCurricular: 0,
        extraCurricular: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBloomsDistribution = async (enrollmentNumber, semester) => {
    setBloomsLoading(true);
    try {
      const semesterNumber = parseInt(semester.replace('Semester ', ''));
      
      const response = await fetch(buildUrl(`/bloomsDistribution/stored/${enrollmentNumber}/${semesterNumber}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch blooms distribution:', await response.text());
        return;
      }

      const data = await response.json();
      console.log('Blooms distribution data:', data);
      
      if (data.bloomsDistribution && data.bloomsDistribution.length > 0) {
        // Process data for overall blooms analysis
        const bloomsLevels = {};
        const subjectWiseData = [];
        
        data.bloomsDistribution.forEach(subject => {
          const subjectData = {
            subject: subject.subject,
            code: subject.code,
            blooms: {}
          };
          
          subject.bloomsLevels.forEach(level => {
            // Aggregate for overall analysis
            if (!bloomsLevels[level.level]) {
              bloomsLevels[level.level] = {
                name: level.level,
                value: 0,
                totalMarks: 0
              };
            }
            bloomsLevels[level.level].value += parseFloat(level.marks);
            bloomsLevels[level.level].totalMarks += parseFloat(level.totalMarks);
            
            // Store for subject-wise heatmap
            subjectData.blooms[level.level] = {
              marks: parseFloat(level.marks),
              percentage: parseFloat(level.percentage)
            };
          });
          
          subjectWiseData.push(subjectData);
        });
        
        // Convert blooms levels to array and calculate percentages
        const bloomsArray = Object.values(bloomsLevels).map(level => ({
          ...level,
          percentage: level.totalMarks > 0 ? ((level.value / level.totalMarks) * 100).toFixed(2) : 0
        }));
        
        setBloomsData(bloomsArray);
        setSubjectBloomsData(subjectWiseData);
      } else {
        setBloomsData([]);
        setSubjectBloomsData([]);
      }
    } catch (error) {
      console.error('Error fetching blooms distribution:', error);
      setBloomsData([]);
      setSubjectBloomsData([]);
    } finally {
      setBloomsLoading(false);
    }
  };

  if (!student) return null;

  // Prepare data for heatmap visualization
  const prepareHeatmapData = () => {
    const bloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    const heatmapData = [];
    
    subjectBloomsData.forEach((subject, subjectIndex) => {
      bloomsLevels.forEach((level, levelIndex) => {
        const bloomData = subject.blooms[level];
        heatmapData.push({
          subject: subject.subject,
          subjectIndex,
          level,
          levelIndex,
          value: bloomData ? bloomData.percentage : 0,
          marks: bloomData ? bloomData.marks : 0
        });
      });
    });
    
    return heatmapData;
  };
  
  const heatmapData = prepareHeatmapData();

  // Prepare data for activity distribution
  const activityData = [
    { name: 'Curricular', value: student.curricular || 0 },
    { name: 'Co-Curricular', value: activityPoints.coCurricular },
    { name: 'Extra-Curricular', value: activityPoints.extraCurricular },
    { name: 'Total', value: activityPoints.coCurricular + activityPoints.extraCurricular }
  ];

  // Colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="charts-section">
      <h3>Performance Analytics</h3>

      <div className="chart-row">
        {/* Bloom's Taxonomy Analysis Pie Chart */}
        <div className="chart-container">
          <h4>Bloom's Taxonomy Analysis</h4>
          {bloomsLoading ? (
            <div className="loading-indicator">Loading Bloom's data...</div>
          ) : bloomsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bloomsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => {
                    if (parseFloat(percentage) === 0) return null;
                    return `${name}: ${percentage}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bloomsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} marks`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No Bloom's taxonomy data available</div>
          )}
        </div>

        {/* Activity Distribution Bar Chart */}
        <div className="chart-container">
          <h4>Activity Points Distribution</h4>
          {isLoading ? (
            <div className="loading-indicator">Loading activity data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} points`, 'Points']} />
                <Legend />
                <Bar dataKey="value" fill="#4361ee" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Subject-wise Bloom's Heatmap */}
      {subjectBloomsData.length > 0 && (
        <div className="chart-row">
          <div className="chart-container full-width">
            <h4>Subject-wise Bloom's Taxonomy Heatmap</h4>
            <div className="heatmap-container">
              <div className="heatmap-grid">
                <div className="heatmap-header">
                  <div className="heatmap-cell header-cell">Subject</div>
                  {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map(level => (
                    <div key={level} className="heatmap-cell header-cell">{level}</div>
                  ))}
                </div>
                {subjectBloomsData.map((subject, subjectIndex) => (
                  <div key={subjectIndex} className="heatmap-row">
                    <div className="heatmap-cell subject-cell">
                      <div className="subject-name">{subject.subject}</div>
                      <div className="subject-code">({subject.code})</div>
                    </div>
                    {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map(level => {
                      const bloomData = subject.blooms[level];
                      const percentage = bloomData ? bloomData.percentage : 0;
                      const intensity = Math.min(percentage / 100, 1);
                      
                      return (
                        <div 
                          key={level} 
                          className="heatmap-cell data-cell"
                          style={{
                            backgroundColor: `rgba(67, 97, 238, ${intensity})`,
                            color: intensity > 0.5 ? 'white' : '#1e293b'
                          }}
                          title={`${level}: ${percentage}% (${bloomData ? bloomData.marks : 0} marks)`}
                        >
                          <div className="cell-percentage">{percentage.toFixed(1)}%</div>
                          <div className="cell-marks">{bloomData ? bloomData.marks.toFixed(1) : 0}m</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;

// Add CSS styles for the heatmap
const heatmapStyles = `
.full-width {
  width: 100%;
}

.heatmap-container {
  margin-top: 20px;
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.heatmap-grid {
  display: inline-block;
  min-width: 100%;
}

.heatmap-header,
.heatmap-row {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}

.heatmap-header {
  background: #f8fafc;
  font-weight: 600;
}

.heatmap-cell {
  padding: 12px;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60px;
  text-align: center;
}

.header-cell {
  background: #4361ee;
  color: white;
  font-weight: 600;
  min-width: 100px;
}

.subject-cell {
  background: #f8fafc;
  min-width: 150px;
  align-items: flex-start;
  text-align: left;
}

.subject-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.subject-code {
  font-size: 0.875rem;
  color: #64748b;
}

.data-cell {
  min-width: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.data-cell:hover {
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.cell-percentage {
  font-weight: 600;
  font-size: 0.875rem;
}

.cell-marks {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 2px;
}

.no-data-message {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-style: italic;
}
`;

// Inject heatmap styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = heatmapStyles;
  document.head.appendChild(styleSheet);
}
