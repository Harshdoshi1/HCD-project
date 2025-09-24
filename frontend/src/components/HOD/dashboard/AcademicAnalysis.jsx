import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import ReportGenerator from "./ReportGenerator";
import "./AcademicAnalysis.css";
import { buildUrl } from "../../../utils/apiConfig";
const AcademicAnalysis = ({ student, academicData }) => {
  const [selectedSemester, setSelectedSemester] = useState(4);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState(null);
  const [subjectGrades, setSubjectGrades] = useState([]);
  const [facultyFeedback, setFacultyFeedback] = useState([]);
  const [spiCpiData, setSpiCpiData] = useState([]);
  const [showTooltip, setShowTooltip] = useState(null);
  const [semesterPoints, setSemesterPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bloomsData, setBloomsData] = useState([]);

  // New state for enhanced features
  const [sortBy, setSortBy] = useState("subject");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterBy, setFilterBy] = useState("all");
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    if (student && student.semester) {
      const currentSemester = parseInt(student.semester);
      setSelectedSemester(currentSemester);
      fetchSemesterData();
    }
  }, [student]);

  useEffect(() => {
    if (student && selectedSemester) {
      fetchRealAcademicData();
    }
  }, [student, selectedSemester]);

  // Fetch semester data similar to StudentAnalysis
  const fetchSemesterData = async () => {
    if (!student || !student.rollNo) {
      setLoading(false);
      return;
    }

    try {
      const currentSemester = parseInt(student.semester) || 1;
      const allSemesterPoints = [];

      // Create semester points for each semester from 1 to current semester
      for (let semester = 1; semester <= currentSemester; semester++) {
        allSemesterPoints.push({
          semester,
          totalCocurricular: 0,
          totalExtracurricular: 0,
        });
      }

      setSemesterPoints(allSemesterPoints);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching semester data:", err);
      setError("Failed to load semester data");
      setSemesterPoints([]);
      setLoading(false);
    }
  };

  // Handle semester selection change
  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester);
    // Fetch real academic data for the selected semester
    fetchRealAcademicData();
  };

  const fetchRealAcademicData = async () => {
    if (!student || !student.rollNo) {
      console.log("No student data available for academic fetch");
      return;
    }

    try {
      setLoading(true);
      const enrollmentNumber = student.rollNo;

      console.log(
        `Fetching real academic data for enrollment: ${enrollmentNumber}, semester: ${selectedSemester}`
      );

      // Fetch real academic performance data from backend
      const [performanceResponse, bloomsResponse] = await Promise.all([
        fetch(
          buildUrl(
            `/student-analysis/performance/${enrollmentNumber}/${selectedSemester}`
          )
        ),
        fetch(
          buildUrl(
            `/student-analysis/blooms/${enrollmentNumber}/${selectedSemester}`
          )
        ),
      ]);

      if (!performanceResponse.ok) {
        throw new Error(`HTTP error! status: ${performanceResponse.status}`);
      }

      const performanceData = await performanceResponse.json();
      console.log("Real academic data received:", performanceData);

      // Handle Bloom's taxonomy data
      let bloomsDistribution = [];
      if (bloomsResponse.ok) {
        const bloomsData = await bloomsResponse.json();
        console.log("Bloom's taxonomy data received:", bloomsData);
        bloomsDistribution = bloomsData.bloomsDistribution || [];
      } else {
        console.log("Bloom's taxonomy data not available, using fallback");
      }
      setBloomsData(bloomsDistribution);

      if (performanceData.subjects && performanceData.subjects.length > 0) {
        // Map the real data to match the expected format
        const realSubjectGrades = performanceData.subjects.map(
          (subject, index) => ({
            id: index + 1,
            subject: subject.subject,
            shortName: subject.shortName,
            code: subject.code,
            credits: subject.credits,
            ese: subject.ese,
            ia: subject.ia,
            tw: subject.tw,
            viva: subject.viva,
            cse: subject.cse,
            total: subject.total,
            percentage: parseFloat(subject.percentage),
            grade: subject.grade,
            marks: subject.total, // Use total for compatibility
            attendance: Math.floor(75 + Math.random() * 25), // Keep mock attendance for now
          })
        );

        setSubjectGrades(realSubjectGrades);
        console.log("Real subject grades set:", realSubjectGrades);
      } else {
        console.log("No real academic data found, using fallback");
        // If no real data, set empty array or minimal data
        setSubjectGrades([]);
      }

      // Generate mock SPI/CPI data for now (can be replaced with real data later)
      const currentSemester = parseInt(student?.semester) || selectedSemester;
      const mockSpiCpi = [];
      for (let i = 1; i <= currentSemester; i++) {
        mockSpiCpi.push({
          semester: i,
          spi: (7.5 + Math.random() * 2).toFixed(2),
          cpi: (7.0 + Math.random() * 2).toFixed(2),
          credits: 20 + Math.floor(Math.random() * 5),
        });
      }
      setSpiCpiData(mockSpiCpi);

      // Mock faculty feedback (can be replaced with real data later)
      const mockFeedback = [
        {
          faculty: "Dr. S. Johnson",
          subject: "Data Structures",
          feedback:
            "Excellent problem-solving skills. Shows great understanding.",
          rating: 4.5,
          strengths: ["Problem Solving", "Algorithms"],
          improvements: ["Time Complexity"],
        },
        {
          faculty: "Prof. S. Wilson",
          subject: "Database Mgmt",
          feedback: "Good SQL concepts. Needs query optimization focus.",
          rating: 4.0,
          strengths: ["SQL Basics", "Design"],
          improvements: ["Optimization", "Performance"],
        },
        {
          faculty: "Dr. M. Brown",
          subject: "Networks",
          feedback: "Active participation. Strong theoretical knowledge.",
          rating: 4.2,
          strengths: ["Theory", "Participation"],
          improvements: ["Practical Implementation"],
        },
      ];
      setFacultyFeedback(mockFeedback);
    } catch (error) {
      console.error("Error fetching real academic data:", error);
      setError("Failed to load academic data");
      // Fallback to empty data on error
      setSubjectGrades([]);
      setSpiCpiData([]);
      setFacultyFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  // Preserved original functions
  const getGradePoints = (grade) => {
    const gradePoints = {
      "A+": 10,
      A: 9,
      "B+": 8,
      B: 7,
      "C+": 6,
      C: 5,
      D: 4,
      F: 0,
    };
    return gradePoints[grade] || 0;
  };

  const getBloomScore = (subjectCode, level) => {
    // Get real Bloom's data for the subject if available
    const subjectBloomsData = bloomsData.find(
      (data) => data.code === subjectCode
    );
    if (subjectBloomsData && subjectBloomsData.bloomsLevels) {
      const levelData = subjectBloomsData.bloomsLevels.find(
        (bl) => bl.level === level
      );
      if (levelData) {
        // Use the actual marks for heatmap visualization
        return Math.round(levelData.marks * 100) / 100; // Round to 2 decimal places
      }
    }

    // Return 0 if no real data available (instead of random fallback)
    return 0;
  };

  const getBloomClass = (marks) => {
    // Calculate max marks across all subjects and levels for relative comparison
    let maxMarks = 0;
    if (bloomsData && bloomsData.length > 0) {
      bloomsData.forEach(subject => {
        subject.bloomsLevels.forEach(level => {
          if (level.marks > maxMarks) {
            maxMarks = level.marks;
          }
        });
      });
    }
    
    if (maxMarks === 0) return "weak-bloom";
    
    // Calculate relative percentage for color coding
    const relativePercentage = (marks / maxMarks) * 100;
    
    if (relativePercentage >= 85) return "excellent-bloom";
    if (relativePercentage >= 70) return "good-bloom";
    if (relativePercentage >= 55) return "average-bloom";
    return "weak-bloom";
  };

  const calculateCurrentSPI = () => {
    if (subjectGrades.length === 0) return 0;
    let totalPoints = 0;
    let totalCredits = 0;
    subjectGrades.forEach((subject) => {
      const gradePoints = getGradePoints(subject.grade);
      totalPoints += gradePoints * subject.credits;
      totalCredits += subject.credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const getGradeColor = (grade) => {
    const colorMap = {
      "A+": "#28a745",
      A: "#20c997",
      "B+": "#17a2b8",
      B: "#ffc107",
      "C+": "#fd7e14",
      C: "#dc3545",
      D: "#6c757d",
      F: "#343a40",
    };
    return colorMap[grade] || "#9E9E9E";
  };

  const getPerformanceTrend = () => {
    if (spiCpiData.length < 2) return "stable";
    const current = parseFloat(spiCpiData[spiCpiData.length - 1].spi);
    const previous = parseFloat(spiCpiData[spiCpiData.length - 2].spi);
    if (current > previous + 0.2) return "improving";
    if (current < previous - 0.2) return "declining";
    return "stable";
  };

  const getSubjectPerformanceData = () => {
    return subjectGrades.map((subject) => ({
      name: subject.shortName,
      marks: subject.marks,
      attendance: subject.attendance,
      gradePoints: getGradePoints(subject.grade),
    }));
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Bloom's Taxonomy data with real data integration
  const getBloomsTaxonomyData = () => {
    if (bloomsData && bloomsData.length > 0) {
      // Aggregate Bloom's data across all subjects for the spider chart
      const bloomsAggregation = {};
      const bloomLevels = [
        "Remember",
        "Understand",
        "Apply",
        "Analyze",
        "Evaluate",
        "Create",
      ];

      // Initialize aggregation
      bloomLevels.forEach((level) => {
        bloomsAggregation[level] = { totalMarks: 0 };
      });

      // Sum actual marks from all subjects
      bloomsData.forEach((subjectData) => {
        subjectData.bloomsLevels.forEach((levelData) => {
          if (bloomsAggregation[levelData.level]) {
            bloomsAggregation[levelData.level].totalMarks += levelData.marks || 0;
          }
        });
      });

      // Return total marks for each level
      return bloomLevels.map((level) => ({
        level,
        marks: Math.round(bloomsAggregation[level].totalMarks * 100) / 100, // Round to 2 decimal places
      }));
    }

    // Fallback to mock data if no real data available
    const levels = [
      { level: "Remember", marks: 85 },
      { level: "Understand", marks: 78 },
      { level: "Apply", marks: 72 },
      { level: "Analyze", marks: 65 },
      { level: "Evaluate", marks: 58 },
      { level: "Create", marks: 52 },
    ];
    return levels;
  };

  // Get Bloom's Taxonomy data for pie chart (percentages)
  const getBloomsPieChartData = () => {
    if (bloomsData && bloomsData.length > 0) {
      // Aggregate Bloom's data across all subjects for the pie chart
      const bloomsAggregation = {};
      const bloomLevels = [
        "Remember",
        "Understand", 
        "Apply",
        "Analyze",
        "Evaluate",
        "Create",
      ];

      // Initialize aggregation
      bloomLevels.forEach((level) => {
        bloomsAggregation[level] = { totalMarks: 0 };
      });

      // Sum actual marks from all subjects
      bloomsData.forEach((subjectData) => {
        subjectData.bloomsLevels.forEach((levelData) => {
          if (bloomsAggregation[levelData.level]) {
            bloomsAggregation[levelData.level].totalMarks += levelData.marks || 0;
          }
        });
      });

      // Calculate total marks across all levels
      const totalMarks = Object.values(bloomsAggregation).reduce((sum, level) => sum + level.totalMarks, 0);

      // Return percentage data for pie chart with colors
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];
      
      return bloomLevels.map((level, index) => ({
        level,
        marks: Math.round(bloomsAggregation[level].totalMarks * 100) / 100,
        percentage: totalMarks > 0 ? Math.round((bloomsAggregation[level].totalMarks / totalMarks) * 100) : 0,
        fill: colors[index]
      }));
    }

    // Fallback data
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];
    return [
      { level: "Remember", marks: 85, percentage: 25, fill: colors[0] },
      { level: "Understand", marks: 78, percentage: 23, fill: colors[1] },
      { level: "Apply", marks: 72, percentage: 21, fill: colors[2] },
      { level: "Analyze", marks: 65, percentage: 19, fill: colors[3] },
      { level: "Evaluate", marks: 58, percentage: 17, fill: colors[4] },
      { level: "Create", marks: 52, percentage: 15, fill: colors[5] },
    ];
  };

  // New sorting and filtering functions
  const sortSubjects = (subjects) => {
    return [...subjects].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "subject":
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        case "percentage":
          aValue = a.percentage;
          bValue = b.percentage;
          break;
        case "grade":
          aValue = getGradePoints(a.grade);
          bValue = getGradePoints(b.grade);
          break;
        case "credits":
          aValue = a.credits;
          bValue = b.credits;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filterSubjects = (subjects) => {
    if (filterBy === "all") return subjects;
    if (filterBy === "high") return subjects.filter((s) => s.percentage >= 75);
    if (filterBy === "medium")
      return subjects.filter((s) => s.percentage >= 50 && s.percentage < 75);
    if (filterBy === "low") return subjects.filter((s) => s.percentage < 50);
    return subjects;
  };

  // Get subjects from bloomsData for heatmap
  const getHeatmapSubjects = () => {
    if (bloomsData && bloomsData.length > 0) {
      return bloomsData.map(subject => ({
        id: subject.code,
        code: subject.code,
        subject: subject.subject,
        shortName: subject.subject.length > 15 ? subject.subject.substring(0, 15) + '...' : subject.subject
      }));
    }
    return [];
  };

  const heatmapSubjects = getHeatmapSubjects();
  
  const filteredSubjects =
    selectedSubject === "all"
      ? heatmapSubjects
      : heatmapSubjects.filter((s) => s.subject === selectedSubject);

  const filteredAndSortedSubjects = sortSubjects(filterSubjects(subjectGrades));

  const calculateSummaryStats = () => {
    const totalCredits = subjectGrades.reduce(
      (sum, subject) => sum + subject.credits,
      0
    );
    const averagePercentage =
      subjectGrades.length > 0
        ? (
          subjectGrades.reduce(
            (sum, subject) => sum + subject.percentage,
            0
          ) / subjectGrades.length
        ).toFixed(1)
        : 0;
    const passedSubjects = subjectGrades.filter((s) => s.grade !== "F").length;

    return { totalCredits, averagePercentage, passedSubjects };
  };

  const summaryStats = calculateSummaryStats();

  const handleCellHover = (subject, component, value, maxValue) => {
    setHoveredCell({ subject, component, value, maxValue });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  const bloomLevels = [
    "Remember",
    "Understand",
    "Apply",
    "Analyze",
    "Evaluate",
    "Create",
  ];

  return (
    <div className="enhanced-academic-container">
      {/* Semester Filter Section */}
      <div className="semester-filter-nonacademic">
        <label className="semester-label-nonacademic">Select Semester: </label>
        <div className="semester-buttons-nonacademic">
          {semesterPoints.map((point) => (
            <button
              key={point.semester}
              className={`semester-btn-nonacademic ${selectedSemester === point.semester ? "active-nonacademic" : ""
                }`}
              onClick={() => handleSemesterChange(point.semester)}
            >
              Semester {point.semester}
            </button>
          ))}
        </div>
      </div>

      <div className="summary-panel">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-label">Total Credits</span>
            <span className="stat-value">{summaryStats.totalCredits}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Average Marks</span>
            <span className="stat-value">
              {summaryStats.averagePercentage}%
            </span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Passed Subjects</span>
            <span className="stat-value">
              {summaryStats.passedSubjects}/{subjectGrades.length}
            </span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Class Rank</span>
            <span className="stat-value">12/45</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Two Column Layout */}
      <div className="main-content-grid">
        {/* Left Column - 70% Width */}
        <div className="left-column">
          {/* Enhanced Grades Table */}
          <div className="grades-section-enhanced">
            <div className="section-header">
              <h3> Current Grades</h3>
              <div className="table-controls">
                <div className="control-group">
                  <label htmlFor="sort-by">Sort by:</label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="control-select"
                  >
                    <option value="subject">Subject</option>
                    <option value="percentage">Percentage</option>
                    <option value="grade">Grade</option>
                    <option value="credits">Credits</option>
                  </select>
                </div>
                <div className="control-group">
                  <label htmlFor="sort-order">Order:</label>
                  <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="control-select"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                <div className="control-group">
                  <label htmlFor="filter-by">Filter:</label>
                  <select
                    id="filter-by"
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="control-select"
                  >
                    <option value="all">All Subjects</option>
                    <option value="high">High Performance (75%+)</option>
                    <option value="medium">Medium Performance (50-75%)</option>
                    <option value="low">Low Performance (&lt;50%)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grades-table-wrapper">
              <table className="grades-table-enhanced">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Code</th>
                    <th>Credits</th>
                    <th>
                      ESE<span className="marks-info">/100</span>
                    </th>
                    <th>
                      IA<span className="marks-info">/25</span>
                    </th>
                    <th>
                      TW<span className="marks-info">/25</span>
                    </th>
                    <th>
                      Viva<span className="marks-info">/15</span>
                    </th>
                    <th>
                      CSE<span className="marks-info">/15</span>
                    </th>
                    <th>
                      Total<span className="marks-info">/180</span>
                    </th>
                    <th>Percentage</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedSubjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="subject-name-cell">{subject.shortName}</td>
                      <td className="subject-code">{subject.code}</td>
                      <td className="credits-cell">{subject.credits}</td>
                      <td
                        className="marks-cell"
                        onMouseEnter={() =>
                          handleCellHover(
                            subject.shortName,
                            "ESE (End Semester Exam)",
                            subject.ese,
                            100
                          )
                        }
                        onMouseLeave={handleCellLeave}
                      >
                        {subject.ese}
                      </td>
                      <td
                        className="marks-cell"
                        onMouseEnter={() =>
                          handleCellHover(
                            subject.shortName,
                            "IA (Internal Assessment)",
                            subject.ia,
                            25
                          )
                        }
                        onMouseLeave={handleCellLeave}
                      >
                        {subject.ia}
                      </td>
                      <td
                        className="marks-cell"
                        onMouseEnter={() =>
                          handleCellHover(
                            subject.shortName,
                            "TW (Term Work)",
                            subject.tw,
                            25
                          )
                        }
                        onMouseLeave={handleCellLeave}
                      >
                        {subject.tw}
                      </td>
                      <td
                        className="marks-cell"
                        onMouseEnter={() =>
                          handleCellHover(
                            subject.shortName,
                            "Viva (Oral Examination)",
                            subject.viva,
                            15
                          )
                        }
                        onMouseLeave={handleCellLeave}
                      >
                        {subject.viva}
                      </td>
                      <td
                        className="marks-cell"
                        onMouseEnter={() =>
                          handleCellHover(
                            subject.shortName,
                            "CSE (Continuous Semester Evaluation)",
                            subject.cse,
                            15
                          )
                        }
                        onMouseLeave={handleCellLeave}
                      >
                        {subject.cse}
                      </td>
                      <td className="total-cell">{subject.total}</td>
                      <td className="percentage-cell">{subject.percentage}%</td>
                      <td className="grade-cell">
                        <span
                          className="grade-badge-enhanced"
                          style={{
                            backgroundColor: getGradeColor(subject.grade),
                          }}
                        >
                          {subject.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloom's Charts Section - Below the table in left column */}
          <div className="bloom-charts-section">
            {/* Bloom's Taxonomy Analysis Charts Container */}
            <div className="bloom-charts-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              
              {/* Spider Chart - Absolute Marks */}
              <div className="chart-container-enhanced bloom-spider-chart" style={{ flex: 1 }}>
                <div className="card-header">
                  <h3>Bloom's Taxonomy - Marks Distribution</h3>
                </div>
                <div className="spider-chart-wrapper">
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={getBloomsTaxonomyData()}>
                      <PolarGrid gridType="polygon" />
                      <PolarAngleAxis
                        dataKey="level"
                        fontSize={11}
                        fontWeight={600}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 'dataMax']}
                        fontSize={10}
                        tickCount={5}
                      />
                      <Radar
                        name="Cognitive Level Marks"
                        dataKey="marks"
                        stroke="#3674B5"
                        fill="#3674B5"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        dot={{ fill: "#3674B5", strokeWidth: 1, r: 4 }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} marks`, "Marks"]}
                        labelStyle={{ color: "#333" }}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #3674B5",
                          borderRadius: "4px",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart - Relative Percentages */}
              <div className="chart-container-enhanced bloom-pie-chart" style={{ flex: 1 }}>
                <div className="card-header">
                  <h3>Bloom's Taxonomy - Percentage Distribution</h3>
                </div>
                <div className="pie-chart-wrapper">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={getBloomsPieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ level, percentage }) => `${level}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {getBloomsPieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value}% (${props.payload.marks} marks)`,
                          "Distribution"
                        ]}
                        labelStyle={{ color: "#333" }}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Subject-wise Bloom's Heatmap */}
            <div className="bloom-card">
              <div className="card-header">
                <h3> Subject-wise Bloom's Heatmap</h3>
                <div className="subject-filter">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="subject-dropdown"
                  >
                    <option value="all">All Subjects</option>
                    {heatmapSubjects.map((subject) => (
                      <option key={subject.id} value={subject.subject}>
                        {subject.shortName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bloom-heatmap-container">
                <div className="bloom-heatmap-grid">
                  <div className="bloom-heatmap-header">
                    <div className="bloom-subject-header">Subject</div>
                    {bloomLevels.map((level) => (
                      <div key={level} className="bloom-level-header">
                        {level.slice(0, 3)}
                      </div>
                    ))}
                  </div>
                  {filteredSubjects.map((subject) => (
                    <div key={subject.id} className="bloom-heatmap-row">
                      <div className="bloom-subject-name">{subject.shortName}</div>
                      {bloomLevels.map((level) => {
                        const marks = getBloomScore(subject.code, level);
                        // Get percentage for tooltip
                        const subjectBloomsData = bloomsData.find(data => data.code === subject.code);
                        const levelData = subjectBloomsData?.bloomsLevels?.find(bl => bl.level === level);
                        const percentage = levelData?.score || 0;
                        
                        return (
                          <div
                            key={level}
                            className={`bloom-marks-cell ${getBloomClass(marks)}`}
                            onMouseEnter={() =>
                              setShowTooltip({
                                subject: subject.subject,
                                level,
                                score: percentage,
                                marks: marks
                              })
                            }
                            onMouseLeave={() => setShowTooltip(null)}
                          >
                            {marks}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="bloom-legend">
                  <span className="legend-item">
                    <span className="legend-dot excellent-bloom"></span>
                    Excellent (Top 15%)
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot good-bloom"></span>Good (70-85%)
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot average-bloom"></span>Average (55-70%)
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot weak-bloom"></span>Weak (Below 55%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - 30% Width */}
        <div className="right-column">
          {/* SPI/CPI Performance Trend Chart */}
          <div className="chart-card">
            <div className="card-header">
              <h3>📈 Performance Trend</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={spiCpiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="semester" fontSize={12} />
                  <YAxis domain={[0, 10]} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="spi"
                    stroke="#3674B5"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="SPI"
                  />
                  <Line
                    type="monotone"
                    dataKey="cpi"
                    stroke="#578FCA"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="CPI"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Overview Radar Chart */}
          <div className="chart-card">
            <div className="card-header">
              <h3> Subject Overview</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={getSubjectPerformanceData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" fontSize={11} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                  <Radar
                    name="Marks"
                    dataKey="marks"
                    stroke="#3674B5"
                    fill="#3674B5"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Faculty Feedback Section */}
          <div className="feedback-card">
            <div className="card-header">
              <h3> Faculty Insights</h3>
              <button
                className="expand-btn"
                onClick={() => toggleSection("feedback")}
              >
                {expandedSection === "feedback" ? "−" : "+"}
              </button>
            </div>

            <div className="feedback-compact">
              {facultyFeedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  <div className="feedback-header-compact">
                    <span className="faculty-name">{feedback.faculty}</span>
                    <span className="rating">★ {feedback.rating}</span>
                  </div>
                  <div className="subject-badge">{feedback.subject}</div>

                  {expandedSection === "feedback" && (
                    <div className="feedback-expanded">
                      <p className="feedback-text">{feedback.feedback}</p>
                      <div className="feedback-tags">
                        <div className="strengths">
                          <strong>Strengths:</strong>
                          {feedback.strengths.map((strength) => (
                            <span key={strength} className="tag positive">
                              {strength}
                            </span>
                          ))}
                        </div>
                        <div className="improvements">
                          <strong>Improve:</strong>
                          {feedback.improvements.map((improvement) => (
                            <span key={improvement} className="tag negative">
                              {improvement}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Latest Achievements and Suggestions */}
      <div className="bottom-sections">
        {/* Latest Achievements Section */}
        <div className="achievements-section">
          <div className="section-header">
            <h3>🏆 Latest Achievements</h3>
          </div>
          <div className="achievements-content">
            <div className="achievement-item">
              <div className="achievement-icon">🥇</div>
              <div className="achievement-details">
                <h4>Top Performer in Data Structures</h4>
                <p>Scored 95% in mid-semester examination</p>
                <span className="achievement-date">2 weeks ago</span>
              </div>
            </div>
            <div className="achievement-item">
              <div className="achievement-icon"></div>
              <div className="achievement-details">
                <h4>Best Project Award</h4>
                <p>Database Management System project recognized</p>
                <span className="achievement-date">1 month ago</span>
              </div>
            </div>
            <div className="achievement-item">
              <div className="achievement-icon"></div>
              <div className="achievement-details">
                <h4>Consistent Performance</h4>
                <p>Maintained above 80% in all subjects</p>
                <span className="achievement-date">This semester</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions Section */}
        <div className="suggestions-section">
          <div className="section-header">
            <h3> Suggestions & Recommendations</h3>
          </div>
          <div className="suggestions-content">
            <div className="suggestion-category">
              <h4>Academic Improvements</h4>
              <ul>
                <li>Focus on improving problem-solving speed in algorithms</li>
                <li>Practice more complex database queries and optimization</li>
                <li>Strengthen understanding of network protocols</li>
              </ul>
            </div>
            <div className="suggestion-category">
              <h4> Skill Development</h4>
              <ul>
                <li>Consider learning advanced JavaScript frameworks</li>
                <li>Participate in coding competitions to enhance skills</li>
                <li>Explore cloud computing and DevOps practices</li>
              </ul>
            </div>
            <div className="suggestion-category">
              <h4>🚀 Career Preparation</h4>
              <ul>
                <li>Build a strong portfolio with diverse projects</li>
                <li>Seek internship opportunities in software development</li>
                <li>
                  Develop soft skills through team projects and presentations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preserved Original Tooltips */}
      {showTooltip && (
        <div className="custom-tooltip">
          <strong>{showTooltip.subject}</strong>
          <br />
          {showTooltip.level}: {showTooltip.marks} marks
          <br />
          <small>({showTooltip.score}% of subject total)</small>
        </div>
      )}

      {/* New Tooltip for hover details */}
      {hoveredCell && (
        <div className="hover-tooltip">
          <strong>{hoveredCell.subject}</strong>
          <br />
          {hoveredCell.component}: {hoveredCell.value}/{hoveredCell.maxValue}
          <br />
          Percentage:{" "}
          {((hoveredCell.value / hoveredCell.maxValue) * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

export default AcademicAnalysis;
