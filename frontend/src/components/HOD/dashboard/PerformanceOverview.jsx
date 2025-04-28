
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import './PerformanceOverview.css';

const PerformanceOverview = ({ students }) => {
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
    { name: 'Curricular', value: averages.curricular },
    { name: 'Co-Curricular', value: averages.coCurricular },
    { name: 'Extra-Curricular', value: averages.extraCurricular }
  ];

  const COLORS = ['#3E92CC', '#4CAF50', '#e74c3c'];

  return (
    <div className="performance-overview">
      <div className="overview-stats">
        <div className="stat-card">
          <h3>Average Points</h3>
          <div className="stat-value">{averages.total}</div>
          <div className="stat-label">Overall Average</div>
        </div>
        <div className="stat-card">
          <h3>Students</h3>
          <div className="stat-value">{students.length}</div>
          <div className="stat-label">Total Count</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-box">
          <h3>Points Distribution</h3>
          <BarChart
            width={260}
            height={240}
            data={distribution}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="curricular" name="Curricular" fill="#9b87f5" />
            <Bar dataKey="coCurricular" name="Co-Curricular" fill="#1EAEDB" />
            <Bar dataKey="extraCurricular" name="Extra-Curricular" fill="#33C3F0" />
          </BarChart>
        </div>

        <div className="chart-box">
          <h3>Category Averages</h3>
          <PieChart width={260} height={240}>
            <Pie
              data={overallData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {overallData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#9b87f5', '#1EAEDB', '#33C3F0'][index % 3]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="chart-box">
          <h3>Performance Trends</h3>
          <LineChart
            width={260}
            height={240}
            data={getCategoryTrends()}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="curricular" stroke="#9b87f5" />
            <Line type="monotone" dataKey="coCurricular" stroke="#1EAEDB" />
            <Line type="monotone" dataKey="extraCurricular" stroke="#33C3F0" />
          </LineChart>
        </div>

      </div>
    </div>
  );
};

export default PerformanceOverview;