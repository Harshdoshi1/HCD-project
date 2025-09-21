import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { buildUrl } from '../../../utils/apiConfig';

const Charts = ({ student, category }) => {
  const [activityPoints, setActivityPoints] = useState({
    coCurricular: 0,
    extraCurricular: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch activity points when student changes
    if (student?.enrollmentNumber) {
      fetchStudentPoints(student.enrollmentNumber);
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

  if (!student) return null;

  // Prepare data for strength distribution pie chart
  const strengthData = [
    { name: 'Writing', value: student.subjects?.find(sub => sub.type === 'writing')?.score || 0 },
    { name: 'Analytical', value: student.subjects?.find(sub => sub.type === 'analytical')?.score || 0 },
    { name: 'Calculation', value: student.subjects?.find(sub => sub.type === 'calculation')?.score || 0 },
    { name: 'Memory', value: student.subjects?.find(sub => sub.type === 'memory')?.score || 0 },
    { name: 'Critical', value: student.subjects?.find(sub => sub.type === 'critical')?.score || 0 }
  ];

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
        {/* Strength Distribution Pie Chart */}
        <div className="chart-container">
          <h4>Strength Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={strengthData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  if (percent === 0) return null;
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {strengthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
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
    </div>
  );
};

export default Charts;
