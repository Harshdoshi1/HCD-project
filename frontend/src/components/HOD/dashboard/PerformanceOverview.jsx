import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, LabelList } from 'recharts';
import './PerformanceOverview.css';

const PerformanceOverview = ({ students }) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const calculateAverages = () => {
    if (students.length === 0) return { curricular: 0, coCurricular: 0, extraCurricular: 0, total: 0 };

    const totals = students.reduce((acc, student) => {
      return {
        curricular: acc.curricular + student.points.curricular,
        coCurricular: acc.coCurricular + student.points.coCurricular,
        extraCurricular: acc.extraCurricular + student.points.extraCurricular
      };
    }, { curricular: 0, coCurricular: 0, extraCurricular: 0 });

    const count = students.length;
    return {
      curricular: Math.round(totals.curricular / count),
      coCurricular: Math.round(totals.coCurricular / count),
      extraCurricular: Math.round(totals.extraCurricular / count),
      total: Math.round((totals.curricular + totals.coCurricular + totals.extraCurricular) / (count * 3))
    };
  };

  const getPerformanceDistribution = () => {
    const ranges = [
      { name: '0-25', curricular: 0, coCurricular: 0, extraCurricular: 0 },
      { name: '26-50', curricular: 0, coCurricular: 0, extraCurricular: 0 },
      { name: '51-75', curricular: 0, coCurricular: 0, extraCurricular: 0 },
      { name: '76-100', curricular: 0, coCurricular: 0, extraCurricular: 0 }
    ];

    students.forEach(student => {
      const categorizePoints = (points, category) => {
        if (points <= 25) ranges[0][category]++;
        else if (points <= 50) ranges[1][category]++;
        else if (points <= 75) ranges[2][category]++;
        else ranges[3][category]++;
      };

      categorizePoints(student.points.curricular, 'curricular');
      categorizePoints(student.points.coCurricular, 'coCurricular');
      categorizePoints(student.points.extraCurricular, 'extraCurricular');
    });

    return ranges;
  };

  const getCategoryTrends = () => {
    const semesters = [...new Set(students.flatMap(s => s.history?.map(h => h.semester) || []))].sort();
    return semesters.map(sem => ({
      semester: sem,
      curricular: students.reduce((acc, s) => {
        const hist = s.history?.find(h => h.semester === sem);
        return hist ? acc + hist.points.curricular : acc;
      }, 0) / students.length,
      coCurricular: students.reduce((acc, s) => {
        const hist = s.history?.find(h => h.semester === sem);
        return hist ? acc + hist.points.coCurricular : acc;
      }, 0) / students.length,
      extraCurricular: students.reduce((acc, s) => {
        const hist = s.history?.find(h => h.semester === sem);
        return hist ? acc + hist.points.extraCurricular : acc;
      }, 0) / students.length,
    }));
  };

  const getParticipationRate = () => {
    return students.map(student => {
      const total = student.history?.reduce((acc, h) => {
        return acc + (h.events.curricular ? 1 : 0) +
          (h.events.coCurricular ? 1 : 0) +
          (h.events.extraCurricular ? 1 : 0);
      }, 0) || 0;
      return {
        name: student.name,
        participation: (total / (student.history?.length * 3 || 1)) * 100
      };
    });
  };

  const averages = calculateAverages();
  const distribution = getPerformanceDistribution();

  const overallData = [
    { name: 'Curricular', value: averages.curricular, color: '#9b87f5' },
    { name: 'Co-Curricular', value: averages.coCurricular, color: '#1EAEDB' },
    { name: 'Extra-Curricular', value: averages.extraCurricular, color: '#33C3F0' }
  ];

  const COLORS = ['#9b87f5', '#1EAEDB', '#33C3F0'];

  return (
    <div className="performance-overview">
      <div className="charts-container">
        <div className="chart-box">
          <h3>Points Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={distribution}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              animationBegin={300}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} />
              <YAxis tick={{ fill: '#666', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                  border: 'none'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="curricular" name="Curricular" fill="#9b87f5" radius={[4, 4, 0, 0]} animationDuration={1800} animationEasing="ease">
                {animate && <LabelList dataKey="curricular" position="top" style={{ fontSize: '11px', fill: '#666' }} />}
              </Bar>
              <Bar dataKey="coCurricular" name="Co-Curricular" fill="#1EAEDB" radius={[4, 4, 0, 0]} animationDuration={1800} animationBegin={300} animationEasing="ease">
                {animate && <LabelList dataKey="coCurricular" position="top" style={{ fontSize: '11px', fill: '#666' }} />}
              </Bar>
              <Bar dataKey="extraCurricular" name="Extra-Curricular" fill="#33C3F0" radius={[4, 4, 0, 0]} animationDuration={1800} animationBegin={600} animationEasing="ease">
                {animate && <LabelList dataKey="extraCurricular" position="top" style={{ fontSize: '11px', fill: '#666' }} />}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Category Averages</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={overallData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${value}`}
                animationBegin={300}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {overallData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                  border: 'none'
                }}
                formatter={(value, name) => [`${value} points`, name]}
              />
              <Legend 
                formatter={(value, entry) => (
                  <span style={{ color: '#666', fontWeight: 500 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Performance Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={getCategoryTrends()}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              animationBegin={300}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="semester" tick={{ fill: '#666', fontSize: 12 }} />
              <YAxis tick={{ fill: '#666', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                  border: 'none'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Line 
                type="monotone" 
                dataKey="curricular" 
                stroke="#9b87f5" 
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#9b87f5' }}
              />
              <Line 
                type="monotone" 
                dataKey="coCurricular" 
                stroke="#1EAEDB" 
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#1EAEDB' }}
              />
              <Line 
                type="monotone" 
                dataKey="extraCurricular" 
                stroke="#33C3F0" 
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#33C3F0' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default PerformanceOverview;