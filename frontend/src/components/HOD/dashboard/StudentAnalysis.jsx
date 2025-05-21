import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StudentAnalysis.css';
import ReportGeneratorModal from './ReportGeneratorModal';

const StudentAnalysis = ({ student, onClose }) => {
  // State for storing semester points data
  const [semesterPoints, setSemesterPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [activityList, setActivityList] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [academicDetails, setAcademicDetails] = useState(null);
  const [loadingAcademics, setLoadingAcademics] = useState(false);
  const [academicError, setAcademicError] = useState(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [performanceInsights, setPerformanceInsights] = useState({
    strengths: [],
    areasForImprovement: [],
    participationPattern: '',
    trendAnalysis: ''
  });

  // For debugging
  console.log('Student data received:', student);

  // Fetch semester points data from student_points table
  useEffect(() => {
    const fetchSemesterPoints = async () => {
      if (!student || !student.rollNo) {
        setLoading(false);
        return;
      }

      try {
        // Get the enrollment number
        const enrollmentNumber = student.rollNo;
        console.log('Fetching semester points for enrollment number:', enrollmentNumber);

        // Get the current semester
        const currentSemester = parseInt(student.semester) || 1;

        // Create an array to store all semester points
        const allSemesterPoints = [];

        // Fetch points for each semester from 1 to current semester
        for (let semester = 1; semester <= currentSemester; semester++) {
          try {
            // Use the existing fetchEventsbyEnrollandSemester endpoint
            const response = await axios.post('http://localhost:5001/api/events/fetchEventsbyEnrollandSemester', {
              enrollmentNumber,
              semester: semester.toString()
            });

            console.log(`Semester ${semester} points response:`, response.data);

            // If we got data, add it to our collection
            if (response.data && Array.isArray(response.data)) {
              // Calculate total points for this semester
              let semesterTotalCoCurricular = 0;
              let semesterTotalExtraCurricular = 0;

              response.data.forEach(item => {
                semesterTotalCoCurricular += parseInt(item.totalCocurricular || 0);
                semesterTotalExtraCurricular += parseInt(item.totalExtracurricular || 0);
              });

              // Add semester data to our collection
              allSemesterPoints.push({
                semester,
                totalCocurricular: semesterTotalCoCurricular,
                totalExtracurricular: semesterTotalExtraCurricular
              });
            } else if (response.data && !Array.isArray(response.data) && response.data.message) {
              // If no activities found, still add the semester with zero points
              allSemesterPoints.push({
                semester,
                totalCocurricular: 0,
                totalExtracurricular: 0
              });
            }
          } catch (semesterError) {
            console.warn(`Error fetching semester ${semester} points:`, semesterError);
            // Still add the semester with zero points on error
            allSemesterPoints.push({
              semester,
              totalCocurricular: 0,
              totalExtracurricular: 0
            });
          }
        }

        console.log('All semester points collected:', allSemesterPoints);
        setSemesterPoints(allSemesterPoints);

        // Set the default selected semester to the current semester
        setSelectedSemester(currentSemester);

        // Fetch activities for the current semester by default
        fetchActivitiesBySemester(enrollmentNumber, currentSemester);
        
        // Fetch academic details for the current semester by default
        fetchAcademicDetails(enrollmentNumber, currentSemester);
      } catch (err) {
        console.error('Error in semester points fetching process:', err);
        setError('Failed to load semester points data');
        setSemesterPoints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSemesterPoints();
  }, [student]);

  // Function to fetch activities for a specific semester
  const fetchActivitiesBySemester = async (enrollmentNumber, semester) => {
    if (!enrollmentNumber || !semester) return;

    setLoadingActivities(true);
    try {
      // Fetch student points for the selected semester
      const response = await axios.post('http://localhost:5001/api/events/fetchEventsbyEnrollandSemester', {
        enrollmentNumber,
        semester: semester.toString()
      });

      console.log(`Activities for semester ${semester}:`, response.data);

      if (response.data && Array.isArray(response.data)) {
        // Extract event IDs from the response
        const eventIds = [];
        response.data.forEach(item => {
          if (item.eventId) {
            // Split the comma-separated event IDs and add them to our array
            const ids = item.eventId.split(',').map(id => id.trim()).filter(id => id);
            eventIds.push(...ids);
          }
        });

        console.log('Extracted event IDs:', eventIds);

        if (eventIds.length > 0) {
          // Convert the array of event IDs to a comma-separated string as required by the API
          const eventIdsString = eventIds.join(',');
          console.log('Sending event IDs as string:', eventIdsString);

          // Fetch event details from EventMaster table
          const eventDetailsResponse = await axios.post('http://localhost:5001/api/events/fetchEventsByIds', {
            eventIds: eventIdsString
          });

          console.log('Event details response:', eventDetailsResponse.data);

          if (eventDetailsResponse.data && eventDetailsResponse.data.success && Array.isArray(eventDetailsResponse.data.data)) {
            // Process event details and create activity list
            const activities = eventDetailsResponse.data.data.map(event => ({
              id: event.id,
              name: event.eventName || 'Unknown Event',
              position: event.position || 'Participant',
              points: event.points || 0,
              type: event.eventType || 'Unknown Type',
              category: event.eventCategory || 'Unknown Category'
            }));

            setActivityList(activities);

            // Generate performance insights based on the activities
            generatePerformanceInsights(activities);
          } else {
            console.warn('Unexpected event details format:', eventDetailsResponse.data);
            setActivityList([]);
          }
        } else {
          console.log('No event IDs found for this semester');
          setActivityList([]);
        }
      } else {
        console.warn('Unexpected response format for activities:', response.data);
        setActivityList([]);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivityList([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Generate performance insights based on activities
  const generatePerformanceInsights = (activities) => {
    if (!activities || activities.length === 0) {
      setPerformanceInsights({
        strengths: [],
        areasForImprovement: [],
        participationPattern: 'No participation data available for this semester.',
        trendAnalysis: 'Insufficient data to analyze trends.'
      });
      return;
    }

    // Define all possible event categories
    const allCategories = [
      'Art and Craft', 'Dance', 'Debate', 'Expert Talk', 'Hackathon',
      'Seminar', 'Sports', 'Tech Competition', 'Workshop'
    ];

    // Count participation by category
    const categoryCounts = {};
    allCategories.forEach(category => {
      categoryCounts[category] = 0;
    });

    // Count total points by category
    const categoryPoints = {};
    allCategories.forEach(category => {
      categoryPoints[category] = 0;
    });

    // Process each activity
    activities.forEach(activity => {
      const category = activity.category;
      if (category && allCategories.includes(category)) {
        categoryCounts[category] += 1;
        categoryPoints[category] += (activity.points || 0);
      }
    });

    console.log('Category participation counts:', categoryCounts);
    console.log('Category points:', categoryPoints);

    // Find categories with highest and lowest participation
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]);

    // Get unique participation counts (sorted high to low)
    const uniqueCounts = [...new Set(sortedCategories.map(([_, count]) => count))].sort((a, b) => b - a);

    // Get top participation count
    const topCount = uniqueCounts[0] || 0;

    // Get categories with highest participation
    const strengthCategories = sortedCategories
      .filter(([_, count]) => count > 0 && count === topCount)
      .map(([category]) => category);

    // Create strengths array from top categories
    const strengths = strengthCategories.map(category => ({
      category,
      count: categoryCounts[category],
      points: categoryPoints[category]
    }));

    // Identify categories that have zero participation
    const zeroParticipationCategories = sortedCategories
      .filter(([_, count]) => count === 0)
      .map(([category]) => category);

    // Identify categories with low participation (not in strengths, but participated)
    const lowParticipationCategories = sortedCategories
      .filter(([category, count]) => count > 0 && !strengthCategories.includes(category))
      .map(([category]) => category);

    // Combine zero and low participation categories, prioritize zero
    // Make sure we don't include any categories that are already in strengths
    const improvementCategories = [...zeroParticipationCategories, ...lowParticipationCategories]
      .filter(category => !strengthCategories.includes(category));

    // Create areas for improvement array
    const areasForImprovement = improvementCategories.map(category => ({
      category,
      count: categoryCounts[category],
      points: categoryPoints[category]
    }));

    // Generate participation pattern description
    let participationPattern = '';
    if (strengths.length > 0) {
      const topCategories = strengths.map(s => s.category).join(', ');
      participationPattern = `Shows strong interest in ${topCategories} activities.`;
    } else {
      participationPattern = 'No clear participation pattern detected.';
    }

    // Generate trend analysis
    let trendAnalysis = '';
    const totalActivities = activities.length;
    if (totalActivities > 3) {
      trendAnalysis = 'Actively participates in a variety of events.';
    } else if (totalActivities > 0) {
      trendAnalysis = 'Limited participation in events this semester.';
    } else {
      trendAnalysis = 'No participation in events this semester.';
    }

    // Set the performance insights
    setPerformanceInsights({
      strengths,
      areasForImprovement,
      participationPattern,
      trendAnalysis
    });
  };

  // Handle semester selection change
  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester);
    fetchActivitiesBySemester(student.rollNo, semester);
    fetchAcademicDetails(student.rollNo, semester);
  };

  // Fetch academic details for the selected semester
  const fetchAcademicDetails = async (enrollmentNumber, semester) => {
    setLoadingAcademics(true);
    setAcademicError(null);
    
    try {
      console.log(`Fetching academic details for ${enrollmentNumber}, semester ${semester}`);
      const response = await axios.get(`http://localhost:5001/api/academic-details/student/${enrollmentNumber}/semester/${semester}`);
      
      console.log('Academic details response:', response.data);
      
      if (response.data && response.data.success) {
        setAcademicDetails(response.data.data);
      } else {
        setAcademicError(response.data?.message || 'Failed to load academic details');
        setAcademicDetails(null);
      }
    } catch (err) {
      console.error('Error fetching academic details:', err);
      setAcademicError(err.response?.data?.message || 'Failed to load academic details');
      setAcademicDetails(null);
    } finally {
      setLoadingAcademics(false);
    }
  };

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
    // If we have fetched semester points data from the API, use that
    if (semesterPoints && semesterPoints.length > 0) {
      console.log('Using fetched semester points data for chart:', semesterPoints);

      // Map the semester points data to the format expected by the chart
      const chartData = semesterPoints.map(point => ({
        semester: point.semester,
        coCurricular: point.totalCocurricular || 0,
        extraCurricular: point.totalExtracurricular || 0
      }));

      // Sort by semester
      chartData.sort((a, b) => a.semester - b.semester);

      console.log('Chart data prepared from API data:', chartData);
      return chartData;
    }

    // Fallback to using student data if API data is not available
    console.log('Falling back to student object data for chart');

    // Get current semester as a number
    const currentSemester = parseInt(student.semester) || 1;

    // Create a default data point for current semester
    const currentSemesterData = {
      semester: currentSemester,
      coCurricular: student.points?.coCurricular || 0,
      extraCurricular: student.points?.extraCurricular || 0,
    };

    // Create data points for all semesters from 1 to current
    const fallbackChartData = [];
    for (let i = 1; i <= currentSemester; i++) {
      fallbackChartData.push({
        semester: i,
        coCurricular: i === currentSemester ? currentSemesterData.coCurricular : 0,
        extraCurricular: i === currentSemester ? currentSemesterData.extraCurricular : 0,
      });
    }

    console.log('Fallback chart data:', fallbackChartData);
    return fallbackChartData;
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
    // If activities are loaded for the current semester, use that data
    if (activityList && activityList.length > 0) {
      // Initialize point counters for each category
      let coCurricularPoints = 0;
      let extraCurricularPoints = 0;

      // Calculate points from current activities
      activityList.forEach(activity => {
        if (activity.type === 'co-curricular') {
          coCurricularPoints += (activity.points || 0);
        } else if (activity.type === 'extra-curricular') {
          extraCurricularPoints += (activity.points || 0);
        }
      });

      return [
        { name: 'Curricular', value: 0 }, // As per requirements, curricular is set to 0
        { name: 'Co-Curricular', value: coCurricularPoints },
        { name: 'Extra-Curricular', value: extraCurricularPoints }
      ];
    }

    // Fallback to student overall points if no activities are loaded
    return [
      { name: 'Curricular', value: 0 }, // As per requirements, curricular is set to 0
      { name: 'Co-Curricular', value: student.points.coCurricular },
      { name: 'Extra-Curricular', value: student.points.extraCurricular }
    ];
  };

  // Initialize chart data
  const chartData = prepareChartData();
  console.log('Prepared chart data:', chartData);
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

  const toggleReportGenerator = () => {
    setShowReportGenerator(!showReportGenerator);
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
              {loading ? (
                <div className="loading-message">
                  <p>Loading semester points data...</p>
                </div>
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              ) : chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="semester"
                      label={{ value: 'Semester', position: 'insideBottomRight', offset: -10 }}
                      tickCount={10}
                      type="number"
                      domain={[1, 'dataMax']}
                      allowDecimals={false}
                    />
                    <YAxis label={{ value: 'Points', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value} points`, undefined]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="coCurricular"
                      stroke="#00C49F"
                      name="Co-Curricular"
                      strokeWidth={2}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="extraCurricular"
                      stroke="#FFBB28"
                      name="Extra-Curricular"
                      strokeWidth={2}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data-message">
                  <p>No performance history data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity List Section */}
          <div className="analysis-section">
            <h3>Activity List</h3>

            {/* Semester Filter */}
            <div className="semester-filter">
              <label>Select Semester: </label>
              <div className="semester-buttons">
                {semesterPoints.map(point => (
                  <button
                    key={point.semester}
                    className={selectedSemester === point.semester ? 'active' : ''}
                    onClick={() => handleSemesterChange(point.semester)}
                  >
                    Semester {point.semester}
                  </button>
                ))}
              </div>
            </div>
            <div className="activity-list-container">
              {loadingActivities ? (
                <div className="loading-message">
                  <p>Loading activities...</p>
                </div>
              ) : activityList && activityList.length > 0 ? (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Activity Name</th>
                      <th>Type</th>
                      <th>Position</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityList.map(activity => (
                      <tr key={activity.id}>
                        <td>{activity.name}</td>
                        <td>{activity.type}</td>
                        <td>{activity.position}</td>
                        <td>{activity.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data-message">
                  <p>No activities found for semester {selectedSemester}</p>
                </div>
              )}
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
            {loadingActivities ? (
              <div className="loading-message">
                <p>Analyzing performance data...</p>
              </div>
            ) : (
              <div className="insights-grid">
                {/* Strengths Card */}
                <div className="insight-card">
                  <h4>Strengths</h4>
                  {performanceInsights.strengths.length > 0 ? (
                    <div className="insight-list">
                      <p className="insight-header">Strong performance in:</p>
                      <ul>
                        {performanceInsights.strengths.map((strength, index) => (
                          <li key={index} className="insight-item">
                            <span className="category-name">{strength.category}</span>
                            <span className="points-badge strength">{strength.points} pts</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>No specific strengths identified in this semester.</p>
                  )}
                </div>

                {/* Areas for Improvement Card */}
                <div className="insight-card">
                  <h4>Areas for Improvement</h4>
                  {performanceInsights.areasForImprovement.length > 0 ? (
                    <div className="insight-list">
                      <p className="insight-header">Suggested areas to explore:</p>
                      <ul>
                        {performanceInsights.areasForImprovement.slice(0, 4).map((area, index) => (
                          <li key={index} className="insight-item">
                            <span className="category-name">{area.category}</span>
                            {area.count === 0 ? (
                              <span className="participation-status no-participation">Not participated</span>
                            ) : (
                              <span className="points-badge weakness">{area.points} pts</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>No specific areas for improvement identified.</p>
                  )}
                </div>

                {/* Participation Pattern Card */}
                <div className="insight-card">
                  <h4>Participation Pattern</h4>
                  <p>{performanceInsights.participationPattern}</p>
                </div>

                {/* Trend Analysis Card */}
                <div className="insight-card">
                  <h4>Trend Analysis</h4>
                  <p>{performanceInsights.trendAnalysis}</p>
                </div>
              </div>
            )}
          </div>

          <div className="analysis-section">
            <h3>Academic Details</h3>
            {loadingAcademics ? (
              <div className="loading-indicator">Loading academic details...</div>
            ) : academicError ? (
              <div className="error-message">{academicError}</div>
            ) : academicDetails ? (
              <div className="academic-details-container">
                {academicDetails.semesterInfo && (
                  <div className="semester-performance">
                    <div className="performance-metric">
                      <span className="metric-label">SPI:</span>
                      <span className="metric-value">{academicDetails.semesterInfo.spi || 'N/A'}</span>
                    </div>
                    <div className="performance-metric">
                      <span className="metric-label">CPI:</span>
                      <span className="metric-value">{academicDetails.semesterInfo.cpi || 'N/A'}</span>
                    </div>
                  </div>
                )}
                
                <div className="subjects-table-container">
                  <table className="subjects-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Code</th>
                        <th>ESE</th>
                        <th>CSE</th>
                        <th>IA</th>
                        <th>TW</th>
                        <th>Viva</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academicDetails.subjects.map((subject, index) => {
                        // Calculate total marks for each component
                        const eseTotal = subject.componentMarks.ese;
                        const cseTotal = subject.componentMarks.cse;
                        const iaTotal = subject.componentMarks.ia;
                        const twTotal = subject.componentMarks.tw;
                        const vivaTotal = subject.componentMarks.viva;
                        
                        // Calculate percentages
                        const esePercent = eseTotal > 0 ? Math.round((subject.studentMarks.ese / eseTotal) * 100) : 0;
                        const csePercent = cseTotal > 0 ? Math.round((subject.studentMarks.cse / cseTotal) * 100) : 0;
                        const iaPercent = iaTotal > 0 ? Math.round((subject.studentMarks.ia / iaTotal) * 100) : 0;
                        const twPercent = twTotal > 0 ? Math.round((subject.studentMarks.tw / twTotal) * 100) : 0;
                        const vivaPercent = vivaTotal > 0 ? Math.round((subject.studentMarks.viva / vivaTotal) * 100) : 0;
                        
                        return (
                          <tr key={index}>
                            <td>{subject.name}</td>
                            <td>{subject.code}</td>
                            <td>
                              <div className="marks-display">
                                <span className="marks-value">{subject.studentMarks.ese}</span>
                                <span className="marks-total">/ {eseTotal}</span>
                                <div className="marks-bar-container">
                                  <div 
                                    className="marks-bar" 
                                    style={{ width: `${esePercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="marks-display">
                                <span className="marks-value">{subject.studentMarks.cse}</span>
                                <span className="marks-total">/ {cseTotal}</span>
                                <div className="marks-bar-container">
                                  <div 
                                    className="marks-bar" 
                                    style={{ width: `${csePercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="marks-display">
                                <span className="marks-value">{subject.studentMarks.ia}</span>
                                <span className="marks-total">/ {iaTotal}</span>
                                <div className="marks-bar-container">
                                  <div 
                                    className="marks-bar" 
                                    style={{ width: `${iaPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="marks-display">
                                <span className="marks-value">{subject.studentMarks.tw}</span>
                                <span className="marks-total">/ {twTotal}</span>
                                <div className="marks-bar-container">
                                  <div 
                                    className="marks-bar" 
                                    style={{ width: `${twPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="marks-display">
                                <span className="marks-value">{subject.studentMarks.viva}</span>
                                <span className="marks-total">/ {vivaTotal}</span>
                                <div className="marks-bar-container">
                                  <div 
                                    className="marks-bar" 
                                    style={{ width: `${vivaPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="grade-display">{subject.studentMarks.grades || 'N/A'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="component-legend">
                  <div className="legend-item">
                    <span className="legend-label">ESE:</span>
                    <span className="legend-value">End Semester Exam</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-label">CSE:</span>
                    <span className="legend-value">Continuous Semester Evaluation</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-label">IA:</span>
                    <span className="legend-value">Internal Assessment</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-label">TW:</span>
                    <span className="legend-value">Term Work</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-label">Viva:</span>
                    <span className="legend-value">Viva Voce</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data-message">No academic data available for this semester.</div>
            )}
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
          <button className="btn-generate-report" onClick={toggleReportGenerator}>
            Generate Report
          </button>
          <button className="btn-share" onClick={handleSendAnalysis}>
            Share Analysis with Student & Parents
          </button>
          
          {showReportGenerator && (
            <ReportGeneratorModal
              student={student}
              onClose={toggleReportGenerator}
              semesterPoints={semesterPoints}
              academicDetails={academicDetails}
              activityList={activityList}
              categoryData={categoryData}
              performanceInsights={performanceInsights}
              chartData={chartData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysis;
