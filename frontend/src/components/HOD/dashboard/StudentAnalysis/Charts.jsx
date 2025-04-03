import React from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const Charts = ({ student, category }) => {
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
    { name: 'Co-Curricular', value: student.coCurricular || 0 },
    { name: 'Extra-Curricular', value: student.extraCurricular || 0 }
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
          <h4>Activity Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4361ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
