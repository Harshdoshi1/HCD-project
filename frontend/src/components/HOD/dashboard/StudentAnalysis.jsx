import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StudentAnalysis.css';

const StudentAnalysis = ({ student, onClose }) => {
  // If no student is provided, show a default view for the StudentAnalysis page
  if (!student) {
    return (
      <div className="student-analysis-container">
        <div className="analysis-header">
          <h2>Student Analysis Dashboard</h2>
        </div>
        <div className="analysis-content">
          <p>Select a student from the list to view their detailed analysis.</p>
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>No student selected</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for the line chart
  const prepareChartData = () => {
    if (!student.history || student.history.length === 0) {
      return [
        {
          semester: student.semester,
          curricular: student.points.curricular,
          coCurricular: student.points.coCurricular,
          extraCurricular: student.points.extraCurricular,
        }
      ];
    }

    // Sort history by semester (ascending)
    const sortedHistory = [...student.history].sort((a, b) => parseInt(a.semester) - parseInt(b.semester));

    // Add current semester data
    return [
      ...sortedHistory.map(item => ({
        semester: item.semester,
        curricular: item.points.curricular,
        coCurricular: item.points.coCurricular,
        extraCurricular: item.points.extraCurricular,
      })),
      {
        semester: student.semester,
        curricular: student.points.curricular,
        coCurricular: student.points.coCurricular,
        extraCurricular: student.points.extraCurricular,
      }
    ];
  };

  const generateAnalysis = () => {
    // Get the history data
    const history = student.history || [];

    // Find strengths and weaknesses
    const strengthCategory = Object.entries(student.points)
      .reduce((max, [category, points]) => points > max.points ? { category, points } : max,
        { category: '', points: -1 });

    const weaknessCategory = Object.entries(student.points)
      .reduce((min, [category, points]) => points < min.points ? { category, points } : min,
        { category: '', points: 101 });

    // Find trends
    let trends = {};

    if (history.length > 0) {
      ['curricular', 'coCurricular', 'extraCurricular'].forEach(category => {
        const values = [...history.map(h => h.points[category]), student.points[category]];
        const trend = values[values.length - 1] - values[0];
        trends[category] = {
          direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
          change: Math.abs(trend)
        };
      });
    }

    // Generate participation patterns
    const participationPatterns = {};

    if (history.length > 0) {
      ['curricular', 'coCurricular', 'extraCurricular'].forEach(category => {
        const events = history.filter(h => h.events && h.events[category]);
        participationPatterns[category] = events.length / history.length;
      });
    }

    return {
      strength: strengthCategory.category,
      weakness: weaknessCategory.category,
      trends,
      participationPatterns
    };
  };

  const generateSuggestions = (analysis) => {
    const suggestions = [];

    // Add suggestion based on weakness
    if (analysis.weakness === 'curricular') {
      suggestions.push("Focus on improving academic performance through additional study sessions and engaging more actively in classroom discussions.");
      suggestions.push("Consider joining study groups or seeking tutoring for challenging subjects.");
      suggestions.push("Implement a structured study schedule with specific goals for each subject.");
    } else if (analysis.weakness === 'coCurricular') {
      suggestions.push("Consider joining technical clubs, participating in workshops, or attending seminars to increase co-curricular engagement.");
      suggestions.push("Look for opportunities to participate in hackathons, coding competitions, or technical paper presentations.");
      suggestions.push("Develop a specific technical skill through online courses or departmental workshops.");
    } else if (analysis.weakness === 'extraCurricular') {
      suggestions.push("Explore opportunities in sports, cultural activities, or volunteering to enhance extra-curricular participation.");
      suggestions.push("Join at least one club or organization aligned with personal interests outside of academics.");
      suggestions.push("Consider leadership roles in existing extra-curricular activities to develop soft skills.");
    }

    // Add suggestion based on trends
    if (analysis.trends.curricular && analysis.trends.curricular.direction === 'decreasing') {
      suggestions.push("Academic performance is declining. Schedule a meeting with subject teachers for guidance and implement structured study plan.");
      suggestions.push("Identify specific subjects where performance has dropped and focus remedial efforts there.");
    }

    if (analysis.trends.coCurricular && analysis.trends.coCurricular.direction === 'decreasing') {
      suggestions.push("Co-curricular engagement is declining. Encourage participation in upcoming technical events, hackathons, or departmental activities.");
      suggestions.push("Reconnect with previous co-curricular interests or explore new technical areas aligned with career goals.");
    }

    if (analysis.trends.extraCurricular && analysis.trends.extraCurricular.direction === 'decreasing') {
      suggestions.push("Extra-curricular participation has been decreasing. Consider exploring new interests or rejoining previous activities.");
      suggestions.push("Balance academic pressures with regular participation in at least one extra-curricular activity for holistic development.");
    }

    // Add general suggestion if score is low in all areas
    if (student.points.curricular < 40 && student.points.coCurricular < 40 && student.points.extraCurricular < 40) {
      suggestions.push("Overall engagement is low. Consider a meeting with the academic advisor to discuss potential barriers and create an improvement plan.");
      suggestions.push("Develop a semester-by-semester improvement plan with specific goals for each area of development.");
    }

    // Add specific improvement plans based on current semester
    const currentSemester = parseInt(student.semester);
    if (currentSemester <= 2) {
      suggestions.push("As a junior student, focus on building foundational skills and exploring various activities to find areas of interest.");
    } else if (currentSemester <= 4) {
      suggestions.push("At this mid-point in the program, consider specializing in specific technical areas aligned with career goals.");
    } else {
      suggestions.push("As a senior student, focus on leadership roles and activities that enhance employability and career readiness.");
    }

    // If no specific issues found, add general improvement suggestion
    if (suggestions.length === 0) {
      suggestions.push("Maintain current performance and consider mentoring peers who may benefit from guidance in your areas of strength.");
    }

    return suggestions;
  };

  const prepareCategoryData = () => {
    return [
      { name: 'Curricular', value: student.points.curricular },
      { name: 'Co-Curricular', value: student.points.coCurricular },
      { name: 'Extra-Curricular', value: student.points.extraCurricular }
    ];
  };

  const chartData = prepareChartData();
  const analysis = generateAnalysis();
  const suggestions = generateSuggestions(analysis);
  const categoryData = prepareCategoryData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const formatCategoryName = (category) => {
    switch (category) {
      case 'curricular':
        return 'Curricular';
      case 'coCurricular':
        return 'Co-Curricular';
      case 'extraCurricular':
        return 'Extra-Curricular';
      default:
        return category;
    }
  };

  const handleSendAnalysis = () => {
    // In a real app, this would make an API call to send the analysis
    console.log('Sending analysis for student:', student.name);

    alert(`Analysis for ${student.name} would be shared with the student and parents in a real application.`);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container analysis-modal">
        <div className="modal-header">
          <h2>Student Analysis: {student.name}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-content">
          <div className="student-details">
            <div className="detail-item">
              <span className="detail-label">Roll Number:</span>
              <span className="detail-value">{student.rollNo}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Batch:</span>
              <span className="detail-value">{student.batch}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Current Semester:</span>
              <span className="detail-value">{student.semester}</span>
            </div>
          </div>

          <div className="analysis-section">
            <h3>Performance Trends</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semester" label={{ value: 'Semester', position: 'insideBottomRight', offset: -10 }} />
                  <YAxis label={{ value: 'Points', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="curricular" stroke="#0088FE" name="Curricular" />
                  <Line type="monotone" dataKey="coCurricular" stroke="#00C49F" name="Co-Curricular" />
                  <Line type="monotone" dataKey="extraCurricular" stroke="#FFBB28" name="Extra-Curricular" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="analysis-section">
            <h3>Current Performance Breakdown</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
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
          </div>

          <div className="analysis-section">
            <h3>Performance Insights</h3>

            <div className="insights-grid">
              <div className="insight-card">
                <h4>Strengths</h4>
                <p>
                  {analysis.strength ?
                    `Strong performance in ${formatCategoryName(analysis.strength)} activities.` :
                    'No significant strengths identified yet.'}
                </p>
                <div className="points-badge strength">
                  {analysis.strength && student.points[analysis.strength]} pts
                </div>
              </div>

              <div className="insight-card">
                <h4>Areas for Improvement</h4>
                <p>
                  {analysis.weakness ?
                    `Could improve participation in ${formatCategoryName(analysis.weakness)} activities.` :
                    'No specific areas for improvement identified.'}
                </p>
                <div className="points-badge weakness">
                  {analysis.weakness && student.points[analysis.weakness]} pts
                </div>
              </div>

              <div className="insight-card">
                <h4>Participation Pattern</h4>
                <ul className="pattern-list">
                  {Object.entries(analysis.participationPatterns).map(([category, rate]) => (
                    <li key={category}>
                      <span className="pattern-category">{formatCategoryName(category)}:</span>
                      <span className="pattern-value">
                        {Math.round(rate * 100)}% participation rate
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="insight-card">
                <h4>Trend Analysis</h4>
                <ul className="trend-list">
                  {Object.entries(analysis.trends).map(([category, trend]) => (
                    <li key={category}>
                      <span className="trend-category">{formatCategoryName(category)}:</span>
                      <span className={`trend-value ${trend.direction}`}>
                        {trend.direction === 'increasing' ? '↑' :
                          trend.direction === 'decreasing' ? '↓' : '→'}
                        {trend.change} points ({trend.direction})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="analysis-section">
            <h3>Improvement Suggestions</h3>
            <div className="suggestions-container">
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="suggestion-item">{suggestion}</li>
                ))}
              </ul>
              
              <div className="action-plan">
                <h4>Recommended Action Plan</h4>
                <div className="action-steps">
                  <div className="action-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Short-term (Next 1-2 months)</h5>
                      <p>{analysis.weakness === 'curricular' 
                        ? 'Schedule weekly study sessions focusing on weaker subjects' 
                        : analysis.weakness === 'coCurricular' 
                        ? 'Join at least one technical club or workshop this month' 
                        : 'Participate in at least one extracurricular event this month'}</p>
                    </div>
                  </div>
                  
                  <div className="action-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>Mid-term (Next 3-4 months)</h5>
                      <p>{analysis.weakness === 'curricular' 
                        ? 'Aim for 10% improvement in academic scores by next assessment' 
                        : analysis.weakness === 'coCurricular' 
                        ? 'Contribute to a technical project or competition' 
                        : 'Take on a specific role in an extracurricular activity'}</p>
                    </div>
                  </div>
                  
                  <div className="action-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>Long-term (This semester)</h5>
                      <p>Achieve balanced growth across all three areas with at least 15% improvement in {formatCategoryName(analysis.weakness)} points</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
          <button className="btn-share" onClick={handleSendAnalysis}>
            Share Analysis with Student & Parents
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysis;
