import React, { useState } from 'react';
import { FileText, ChartBar, ChartPie, ChartLine } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './ReportGenerator.css';

const ReportGenerator = ({ students, selectedBatch, selectedSemester, onClose }) => {
  const [reportType, setReportType] = useState('performance');
  const [selectedCharts, setSelectedCharts] = useState({
    distribution: true,
    trends: true,
    comparison: true,
    categorical: true,
    progress: true
  });
  const [format, setFormat] = useState('pdf');
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeTrends, setIncludeTrends] = useState(true);

  const handleChartToggle = (chartName) => {
    setSelectedCharts(prev => ({
      ...prev,
      [chartName]: !prev[chartName]
    }));
  };

  const handleGenerateReport = () => {
    console.log('Generating report with selected charts:', selectedCharts);
    alert('Report generated with selected visualizations!');
    onClose();
  };

  const calculateStatistics = () => {
    if (students.length === 0) {
      return {
        averages: { curricular: 0, coCurricular: 0, extraCurricular: 0 },
        topPerformers: [],
        needsImprovement: []
      };
    }

    const totals = students.reduce((acc, student) => {
      return {
        curricular: acc.curricular + student.points.curricular,
        coCurricular: acc.coCurricular + student.points.coCurricular,
        extraCurricular: acc.extraCurricular + student.points.extraCurricular
      };
    }, { curricular: 0, coCurricular: 0, extraCurricular: 0 });

    const count = students.length;
    const averages = {
      curricular: Math.round(totals.curricular / count),
      coCurricular: Math.round(totals.coCurricular / count),
      extraCurricular: Math.round(totals.extraCurricular / count)
    };

    const totalPoints = students.map(student => ({
      ...student,
      totalPoints: student.points.curricular + student.points.coCurricular + student.points.extraCurricular
    }));

    const topPerformers = [...totalPoints]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3);

    const needsImprovement = [...totalPoints]
      .sort((a, b) => a.totalPoints - b.totalPoints)
      .slice(0, 3);

    return { averages, topPerformers, needsImprovement };
  };

  const stats = calculateStatistics();

  // Prepare data for charts
  const prepareDistributionData = () => {
    const pointRanges = [
      { name: '0-20', range: [0, 20], count: 0 },
      { name: '21-40', range: [21, 40], count: 0 },
      { name: '41-60', range: [41, 60], count: 0 },
      { name: '61-80', range: [61, 80], count: 0 },
      { name: '81-100', range: [81, 100], count: 0 }
    ];

    students.forEach(student => {
      const totalPoints = student.points.curricular + student.points.coCurricular + student.points.extraCurricular;
      const avgPoints = Math.round(totalPoints / 3);
      
      const range = pointRanges.find(r => avgPoints >= r.range[0] && avgPoints <= r.range[1]);
      if (range) range.count++;
    });

    return pointRanges;
  };

  const prepareCategoryData = () => {
    if (students.length === 0) return [];
    
    return [
      { name: 'Curricular', value: stats.averages.curricular },
      { name: 'Co-Curricular', value: stats.averages.coCurricular },
      { name: 'Extra-Curricular', value: stats.averages.extraCurricular }
    ];
  };

  const prepareTrendsData = () => {
    // Get all semesters from students
    const allSemesters = new Set();
    students.forEach(student => {
      if (student.history) {
        student.history.forEach(h => allSemesters.add(h.semester));
      }
      allSemesters.add(student.semester);
    });
    
    // Sort semesters
    const sortedSemesters = [...allSemesters].sort((a, b) => parseInt(a) - parseInt(b));
    
    // Calculate average points per semester
    return sortedSemesters.map(semester => {
      const semesterStudents = students.filter(s => 
        s.semester === semester || 
        (s.history && s.history.some(h => h.semester === semester))
      );
      
      if (semesterStudents.length === 0) return { semester, curricular: 0, coCurricular: 0, extraCurricular: 0 };
      
      const totals = { curricular: 0, coCurricular: 0, extraCurricular: 0 };
      let count = 0;
      
      semesterStudents.forEach(student => {
        if (student.semester === semester) {
          totals.curricular += student.points.curricular;
          totals.coCurricular += student.points.coCurricular;
          totals.extraCurricular += student.points.extraCurricular;
          count++;
        } else if (student.history) {
          const historyItem = student.history.find(h => h.semester === semester);
          if (historyItem) {
            totals.curricular += historyItem.points.curricular;
            totals.coCurricular += historyItem.points.coCurricular;
            totals.extraCurricular += historyItem.points.extraCurricular;
            count++;
          }
        }
      });
      
      return {
        semester,
        curricular: Math.round(totals.curricular / count),
        coCurricular: Math.round(totals.coCurricular / count),
        extraCurricular: Math.round(totals.extraCurricular / count)
      };
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const distributionData = prepareDistributionData();
  const categoryData = prepareCategoryData();
  const trendsData = prepareTrendsData();

  return (
    <div className="modal-backdrop">
      <div className="modal-container report-modal">
        <div className="modal-header">
          <h2>Generate Reports</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-content">
          <div className="report-config">
            <div className="form-group">
              <label>Report Type:</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="form-control"
              >
                <option value="performance">Performance Summary</option>
                <option value="detailed">Detailed Analysis</option>
                <option value="comparison">Batch Comparison</option>
                <option value="trend">Progress Tracking</option>
              </select>
            </div>

            <div className="chart-selection">
              <h3>Select Charts to Include</h3>
              <div className="chart-options">
                <label className="chart-option">
                  <input
                    type="checkbox"
                    checked={selectedCharts.distribution}
                    onChange={() => handleChartToggle('distribution')}
                  />
                  <ChartBar className="chart-icon" />
                  Points Distribution
                </label>

                <label className="chart-option">
                  <input
                    type="checkbox"
                    checked={selectedCharts.trends}
                    onChange={() => handleChartToggle('trends')}
                  />
                  <ChartLine className="chart-icon" />
                  Performance Trends
                </label>

                <label className="chart-option">
                  <input
                    type="checkbox"
                    checked={selectedCharts.categorical}
                    onChange={() => handleChartToggle('categorical')}
                  />
                  <ChartPie className="chart-icon" />
                  Category Breakdown
                </label>
              </div>
            </div>

            <div className="form-options">
              <div className="form-check">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                />
                <label>Include Recommendations</label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  checked={includeTrends}
                  onChange={(e) => setIncludeTrends(e.target.checked)}
                />
                <label>Include Historical Trends</label>
              </div>
            </div>
          </div>

          <div className="report-preview">
            <h3>Live Preview</h3>
            
            {selectedCharts.distribution && (
              <div className="preview-chart">
                <h4>Points Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={distributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3674B5" name="Number of Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {selectedCharts.trends && (
              <div className="preview-chart">
                <h4>Performance Trends</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="curricular" stroke="#0088FE" name="Curricular" />
                    <Line type="monotone" dataKey="coCurricular" stroke="#00C49F" name="Co-Curricular" />
                    <Line type="monotone" dataKey="extraCurricular" stroke="#FFBB28" name="Extra-Curricular" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {selectedCharts.categorical && (
              <div className="preview-chart">
                <h4>Category Breakdown</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {includeRecommendations && (
              <div className="preview-recommendations">
                <h4>Batch Recommendations</h4>
                <ul className="recommendations-list">
                  {stats.averages.curricular < 50 && (
                    <li>Implement additional academic support sessions to improve curricular performance.</li>
                  )}
                  {stats.averages.coCurricular < 50 && (
                    <li>Organize more technical workshops and encourage participation in co-curricular activities.</li>
                  )}
                  {stats.averages.extraCurricular < 50 && (
                    <li>Create more opportunities for students to engage in extra-curricular activities.</li>
                  )}
                  {Object.values(stats.averages).every(val => val >= 50) && (
                    <li>Maintain the current balance of activities while focusing on areas of individual improvement.</li>
                  )}
                  <li>Consider peer mentoring programs where top performers can guide students who need improvement.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="format-selector">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="pdf">PDF Report</option>
              <option value="excel">Excel Report</option>
              <option value="powerpoint">PowerPoint</option>
            </select>
          </div>

          <div className="action-buttons">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className="btn-generate"
              onClick={handleGenerateReport}
              disabled={!Object.values(selectedCharts).some(Boolean)}
            >
              Generate {format.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
