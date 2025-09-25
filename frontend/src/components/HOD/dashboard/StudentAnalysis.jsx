import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import "./StudentAnalysis.css";
import ReportGeneratorModal from "./ReportGeneratorModal.jsx";
import AcademicAnalysis from "./AcademicAnalysis.jsx";
import { buildUrl } from "../../../utils/apiConfig";

const StudentAnalysis = ({ student, onClose }) => {
  // State for storing semester points data
  const [semesterPoints, setSemesterPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [activityList, setActivityList] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [academicDetails, setAcademicDetails] = useState(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [performanceInsights, setPerformanceInsights] = useState({
    strengths: [],
    areasForImprovement: [],
    participationPattern: "",
    trendAnalysis: "",
  });
  const [activeTab, setActiveTab] = useState("academic");

  // For debugging
  console.log("Student data received:", student);

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
        console.log(
          "Fetching semester points for enrollment number:",
          enrollmentNumber
        );

        // Get the current semester
        const currentSemester = parseInt(student.semester) || 1;

        // Create an array to store all semester points
        const allSemesterPoints = [];

        // Fetch points for each semester from 1 to current semester
        for (let semester = 1; semester <= currentSemester; semester++) {
          try {
            // Use the existing fetchEventsbyEnrollandSemester endpoint
            const response = await axios.post(
              buildUrl("/events/fetchEventsbyEnrollandSemester"),
              {
                enrollmentNumber,
                semester: semester.toString(),
              }
            );

            console.log(`Semester ${semester} points response:`, response.data);

            // If we got data, add it to our collection
            if (response.data && Array.isArray(response.data)) {
              // Calculate total points for this semester
              let semesterTotalCoCurricular = 0;
              let semesterTotalExtraCurricular = 0;

              response.data.forEach((item) => {
                semesterTotalCoCurricular += parseInt(
                  item.totalCocurricular || 0
                );
                semesterTotalExtraCurricular += parseInt(
                  item.totalExtracurricular || 0
                );
              });

              // Add semester data to our collection
              allSemesterPoints.push({
                semester,
                totalCocurricular: semesterTotalCoCurricular,
                totalExtracurricular: semesterTotalExtraCurricular,
              });
            } else if (
              response.data &&
              !Array.isArray(response.data) &&
              response.data.message
            ) {
              // If no activities found, still add the semester with zero points
              allSemesterPoints.push({
                semester,
                totalCocurricular: 0,
                totalExtracurricular: 0,
              });
            }
          } catch (semesterError) {
            console.warn(
              `Error fetching semester ${semester} points:`,
              semesterError
            );
            // Still add the semester with zero points on error
            allSemesterPoints.push({
              semester,
              totalCocurricular: 0,
              totalExtracurricular: 0,
            });
          }
        }

        console.log("All semester points collected:", allSemesterPoints);
        setSemesterPoints(allSemesterPoints);

        // Set the default selected semester to the current semester
        setSelectedSemester(currentSemester);

        // Fetch activities for the current semester by default
        fetchActivitiesBySemester(enrollmentNumber, currentSemester);
      } catch (err) {
        console.error("Error in semester points fetching process:", err);
        setError("Failed to load semester points data");
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
      const response = await axios.post(
        buildUrl("/events/fetchEventsbyEnrollandSemester"),
        {
          enrollmentNumber,
          semester: semester.toString(),
        }
      );

      console.log(`Activities for semester ${semester}:`, response.data);

      if (response.data && Array.isArray(response.data)) {
        // Extract event IDs from the response
        const eventIds = [];
        response.data.forEach((item) => {
          if (item.eventId) {
            // Split the comma-separated event IDs and add them to our array
            const ids = item.eventId
              .split(",")
              .map((id) => id.trim())
              .filter((id) => id);
            eventIds.push(...ids);
          }
        });

        console.log("Extracted event IDs:", eventIds);

        if (eventIds.length > 0) {
          // Convert the array of event IDs to a comma-separated string as required by the API
          const eventIdsString = eventIds.join(",");
          console.log("Sending event IDs as string:", eventIdsString);

          // Fetch event details from EventMaster table
          const eventDetailsResponse = await axios.post(
            buildUrl("/events/fetchEventsByIds"),
            {
              eventIds: eventIdsString,
            }
          );

          console.log("Event details response:", eventDetailsResponse.data);

          if (
            eventDetailsResponse.data &&
            eventDetailsResponse.data.success &&
            Array.isArray(eventDetailsResponse.data.data)
          ) {
            // Process event details and create activity list
            const activities = eventDetailsResponse.data.data.map((event) => ({
              id: event.id,
              name: event.eventName || "Unknown Event",
              position: event.position || "Participant",
              points: event.points || 0,
              type: event.eventType || "Unknown Type",
              category: event.eventCategory || "Unknown Category",
            }));

            setActivityList(activities);

            // Generate performance insights based on the activities
            generatePerformanceInsights(activities);
          } else {
            console.warn(
              "Unexpected event details format:",
              eventDetailsResponse.data
            );
            setActivityList([]);
          }
        } else {
          console.log("No event IDs found for this semester");
          setActivityList([]);
        }
      } else {
        console.warn(
          "Unexpected response format for activities:",
          response.data
        );
        setActivityList([]);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
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
        participationPattern:
          "No participation data available for this semester.",
        trendAnalysis: "Insufficient data to analyze trends.",
      });
      return;
    }

    // Define all possible event categories
    const allCategories = [
      "Art and Craft",
      "Dance",
      "Debate",
      "Expert Talk",
      "Hackathon",
      "Seminar",
      "Sports",
      "Tech Competition",
      "Workshop",
    ];

    // Count participation by category
    const categoryCounts = {};
    allCategories.forEach((category) => {
      categoryCounts[category] = 0;
    });

    // Count total points by category
    const categoryPoints = {};
    allCategories.forEach((category) => {
      categoryPoints[category] = 0;
    });

    // Process each activity
    activities.forEach((activity) => {
      const category = activity.category;
      if (category && allCategories.includes(category)) {
        categoryCounts[category] += 1;
        categoryPoints[category] += activity.points || 0;
      }
    });

    console.log("Category participation counts:", categoryCounts);
    console.log("Category points:", categoryPoints);

    // Find categories with highest and lowest participation
    const sortedCategories = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    );

    // Get unique participation counts (sorted high to low)
    const uniqueCounts = [
      ...new Set(sortedCategories.map(([_, count]) => count)),
    ].sort((a, b) => b - a);

    // Get top participation count
    const topCount = uniqueCounts[0] || 0;

    // Get categories with highest participation
    const strengthCategories = sortedCategories
      .filter(([_, count]) => count > 0 && count === topCount)
      .map(([category]) => category);

    // Create strengths array from top categories
    const strengths = strengthCategories.map((category) => ({
      category,
      count: categoryCounts[category],
      points: categoryPoints[category],
    }));

    // Identify categories that have zero participation
    const zeroParticipationCategories = sortedCategories
      .filter(([_, count]) => count === 0)
      .map(([category]) => category);

    // Identify categories with low participation (not in strengths, but participated)
    const lowParticipationCategories = sortedCategories
      .filter(
        ([category, count]) =>
          count > 0 && !strengthCategories.includes(category)
      )
      .map(([category]) => category);

    // Combine zero and low participation categories, prioritize zero
    // Make sure we don't include any categories that are already in strengths
    const improvementCategories = [
      ...zeroParticipationCategories,
      ...lowParticipationCategories,
    ].filter((category) => !strengthCategories.includes(category));

    // Create areas for improvement array
    const areasForImprovement = improvementCategories.map((category) => ({
      category,
      count: categoryCounts[category],
      points: categoryPoints[category],
    }));

    // Generate participation pattern description
    let participationPattern = "";
    if (strengths.length > 0) {
      const topCategories = strengths.map((s) => s.category).join(", ");
      participationPattern = `Shows strong interest in ${topCategories} activities.`;
    } else {
      participationPattern = "No clear participation pattern detected.";
    }

    // Generate trend analysis
    let trendAnalysis = "";
    const totalActivities = activities.length;
    if (totalActivities > 3) {
      trendAnalysis = "Actively participates in a variety of events.";
    } else if (totalActivities > 0) {
      trendAnalysis = "Limited participation in events this semester.";
    } else {
      trendAnalysis = "No participation in events this semester.";
    }

    // Set the performance insights
    setPerformanceInsights({
      strengths,
      areasForImprovement,
      participationPattern,
      trendAnalysis,
    });
  };

  // Handle semester selection change
  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester);
    fetchActivitiesBySemester(student.rollNo, semester);
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
            <div className="empty-icon"></div>
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
      console.log(
        "Using fetched semester points data for chart:",
        semesterPoints
      );

      // Map the semester points data to the format expected by the chart
      const chartData = semesterPoints.map((point) => ({
        semester: point.semester,
        coCurricular: point.totalCocurricular || 0,
        extraCurricular: point.totalExtracurricular || 0,
      }));

      // Sort by semester
      chartData.sort((a, b) => a.semester - b.semester);

      console.log("Chart data prepared from API data:", chartData);
      return chartData;
    }

    // Fallback to using student data if API data is not available
    console.log("Falling back to student object data for chart");

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
        coCurricular:
          i === currentSemester ? currentSemesterData.coCurricular : 0,
        extraCurricular:
          i === currentSemester ? currentSemesterData.extraCurricular : 0,
      });
    }

    console.log("Fallback chart data:", fallbackChartData);
    return fallbackChartData;
  };

  const generateAnalysis = () => {
    // Get the history data
    const history = student.history || [];

    // Find strengths and weaknesses
    const strengthCategory = Object.entries(student.points).reduce(
      (max, [category, points]) =>
        points > max.points ? { category, points } : max,
      { category: "", points: -1 }
    );

    const weaknessCategory = Object.entries(student.points).reduce(
      (min, [category, points]) =>
        points < min.points ? { category, points } : min,
      { category: "", points: 101 }
    );

    // Find trends
    let trends = {};

    if (history.length > 0) {
      ["curricular", "coCurricular", "extraCurricular"].forEach((category) => {
        const values = [
          ...history.map((h) => h.points[category]),
          student.points[category],
        ];
        const trend = values[values.length - 1] - values[0];
        trends[category] = {
          direction:
            trend > 0 ? "increasing" : trend < 0 ? "decreasing" : "stable",
          change: Math.abs(trend),
        };
      });
    }

    // Generate participation patterns
    const participationPatterns = {};

    if (history.length > 0) {
      ["curricular", "coCurricular", "extraCurricular"].forEach((category) => {
        const events = history.filter((h) => h.events && h.events[category]);
        participationPatterns[category] = events.length / history.length;
      });
    }

    return {
      strength: strengthCategory.category,
      weakness: weaknessCategory.category,
      trends,
      participationPatterns,
    };
  };

  const generateSuggestions = (analysis) => {
    const suggestions = [];

    // Add suggestion based on weakness
    if (analysis.weakness === "curricular") {
      suggestions.push(
        "Focus on improving academic performance through additional study sessions and engaging more actively in classroom discussions."
      );
      suggestions.push(
        "Consider joining study groups or seeking tutoring for challenging subjects."
      );
      suggestions.push(
        "Implement a structured study schedule with specific goals for each subject."
      );
    } else if (analysis.weakness === "coCurricular") {
      suggestions.push(
        "Consider joining technical clubs, participating in workshops, or attending seminars to increase co-curricular engagement."
      );
      suggestions.push(
        "Look for opportunities to participate in hackathons, coding competitions, or technical paper presentations."
      );
      suggestions.push(
        "Develop a specific technical skill through online courses or departmental workshops."
      );
    } else if (analysis.weakness === "extraCurricular") {
      suggestions.push(
        "Explore opportunities in sports, cultural activities, or volunteering to enhance extra-curricular participation."
      );
      suggestions.push(
        "Join at least one club or organization aligned with personal interests outside of academics."
      );
      suggestions.push(
        "Consider leadership roles in existing extra-curricular activities to develop soft skills."
      );
    }

    // Add suggestion based on trends
    if (
      analysis.trends.curricular &&
      analysis.trends.curricular.direction === "decreasing"
    ) {
      suggestions.push(
        "Academic performance is declining. Schedule a meeting with subject teachers for guidance and implement structured study plan."
      );
      suggestions.push(
        "Identify specific subjects where performance has dropped and focus remedial efforts there."
      );
    }

    if (
      analysis.trends.coCurricular &&
      analysis.trends.coCurricular.direction === "decreasing"
    ) {
      suggestions.push(
        "Co-curricular engagement is declining. Encourage participation in upcoming technical events, hackathons, or departmental activities."
      );
      suggestions.push(
        "Reconnect with previous co-curricular interests or explore new technical areas aligned with career goals."
      );
    }

    if (
      analysis.trends.extraCurricular &&
      analysis.trends.extraCurricular.direction === "decreasing"
    ) {
      suggestions.push(
        "Extra-curricular participation has been decreasing. Consider exploring new interests or rejoining previous activities."
      );
      suggestions.push(
        "Balance academic pressures with regular participation in at least one extra-curricular activity for holistic development."
      );
    }

    // Add general suggestion if score is low in all areas
    if (
      student.points.curricular < 40 &&
      student.points.coCurricular < 40 &&
      student.points.extraCurricular < 40
    ) {
      suggestions.push(
        "Overall engagement is low. Consider a meeting with the academic advisor to discuss potential barriers and create an improvement plan."
      );
      suggestions.push(
        "Develop a semester-by-semester improvement plan with specific goals for each area of development."
      );
    }

    // Add specific improvement plans based on current semester
    const currentSemester = parseInt(student.semester);
    if (currentSemester <= 2) {
      suggestions.push(
        "As a junior student, focus on building foundational skills and exploring various activities to find areas of interest."
      );
    } else if (currentSemester <= 4) {
      suggestions.push(
        "At this mid-point in the program, consider specializing in specific technical areas aligned with career goals."
      );
    } else {
      suggestions.push(
        "As a senior student, focus on leadership roles and activities that enhance employability and career readiness."
      );
    }

    // If no specific issues found, add general improvement suggestion
    if (suggestions.length === 0) {
      suggestions.push(
        "Maintain current performance and consider mentoring peers who may benefit from guidance in your areas of strength."
      );
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
      activityList.forEach((activity) => {
        if (activity.type === "co-curricular") {
          coCurricularPoints += activity.points || 0;
        } else if (activity.type === "extra-curricular") {
          extraCurricularPoints += activity.points || 0;
        }
      });

      return [
        { name: "Curricular", value: 0 }, // As per requirements, curricular is set to 0
        { name: "Co-Curricular", value: coCurricularPoints },
        { name: "Extra-Curricular", value: extraCurricularPoints },
      ];
    }

    // Fallback to student overall points if no activities are loaded
    return [
      { name: "Curricular", value: 0 }, // As per requirements, curricular is set to 0
      { name: "Co-Curricular", value: student.points.coCurricular },
      { name: "Extra-Curricular", value: student.points.extraCurricular },
    ];
  };

  // Generate Domain Affinity Data
  const generateDomainAffinityData = () => {
    // Base scores with some randomization based on student activities
    const baseScores = {
      "Data Science": 65,
      "Software Engineering": 75,
      "Product Management": 45,
      "UI/UX Design": 55,
      Cybersecurity: 40,
      "Machine Learning": 60,
      "Web Development": 80,
      "Mobile Development": 50,
    };

    // Adjust scores based on actual activities
    const domainData = Object.entries(baseScores).map(([domain, baseScore]) => {
      let adjustedScore = baseScore;

      // Boost scores based on activity categories
      if (activityList && activityList.length > 0) {
        activityList.forEach((activity) => {
          if (
            activity.category === "Tech Competition" ||
            activity.category === "Hackathon"
          ) {
            if (
              domain === "Software Engineering" ||
              domain === "Web Development"
            ) {
              adjustedScore += 10;
            }
          }
          if (
            activity.category === "Workshop" ||
            activity.category === "Seminar"
          ) {
            if (domain === "Data Science" || domain === "Machine Learning") {
              adjustedScore += 8;
            }
          }
          if (
            activity.category === "Art and Craft" ||
            activity.category === "Dance"
          ) {
            if (domain === "UI/UX Design") {
              adjustedScore += 12;
            }
          }
        });
      }

      // Add some student-specific variation
      const studentVariation =
        ((student.rollNo?.charCodeAt(0) || 65) % 20) - 10;
      adjustedScore = Math.max(
        20,
        Math.min(100, adjustedScore + studentVariation)
      );

      return {
        domain,
        score: Math.round(adjustedScore),
        fullMark: 100,
      };
    });

    return domainData;
  };

  // Generate Networking & Collaboration Data
  const generateNetworkingData = () => {
    const collaborationScore = activityList
      ? activityList.reduce((score, activity) => {
        // Team-based activities get higher collaboration scores
        if (
          activity.category === "Hackathon" ||
          activity.category === "Tech Competition"
        ) {
          score += 15;
        }
        if (
          activity.position &&
          (activity.position.toLowerCase().includes("leader") ||
            activity.position.toLowerCase().includes("head") ||
            activity.position.toLowerCase().includes("captain"))
        ) {
          score += 20;
        }
        if (
          activity.category === "Workshop" ||
          activity.category === "Seminar"
        ) {
          score += 8;
        }
        return score;
      }, 30)
      : 45; // Base score

    const networkStrength = Math.min(100, collaborationScore);

    // Generate dummy network nodes (representing collaboration partners)
    const networkNodes = [
      { id: student.name, group: "student", size: networkStrength },
      {
        id: "Tech Club Members",
        group: "peers",
        size: Math.max(20, networkStrength - 20),
      },
      {
        id: "Project Team",
        group: "peers",
        size: Math.max(15, networkStrength - 30),
      },
      {
        id: "Workshop Participants",
        group: "peers",
        size: Math.max(10, networkStrength - 40),
      },
      {
        id: "Faculty Mentors",
        group: "mentors",
        size: Math.max(25, networkStrength - 15),
      },
      {
        id: "Industry Experts",
        group: "external",
        size: Math.max(5, networkStrength - 50),
      },
    ];

    return {
      collaborationIndex: networkStrength,
      networkNodes,
      teamProjects: activityList
        ? activityList.filter(
          (a) =>
            a.category === "Hackathon" || a.category === "Tech Competition"
        ).length
        : 2,
      leadershipRoles: activityList
        ? activityList.filter(
          (a) =>
            a.position &&
            (a.position.toLowerCase().includes("leader") ||
              a.position.toLowerCase().includes("head"))
        ).length
        : 1,
    };
  };

  // Generate Participation Diversity Data
  const generateDiversityData = () => {
    const categories = [
      "Technical",
      "Non-Technical",
      "Sports",
      "Cultural",
      "Research",
      "Leadership",
    ];

    const categoryMapping = {
      "Tech Competition": "Technical",
      Hackathon: "Technical",
      Workshop: "Technical",
      Seminar: "Research",
      "Expert Talk": "Research",
      Sports: "Sports",
      Dance: "Cultural",
      "Art and Craft": "Cultural",
      Debate: "Non-Technical",
    };

    const diversityScores = {};
    categories.forEach((cat) => (diversityScores[cat] = 0));

    // Calculate diversity based on actual activities
    if (activityList && activityList.length > 0) {
      activityList.forEach((activity) => {
        const mappedCategory =
          categoryMapping[activity.category] || "Non-Technical";
        diversityScores[mappedCategory] += activity.points || 10;

        // Bonus for leadership positions
        if (
          activity.position &&
          activity.position.toLowerCase().includes("leader")
        ) {
          diversityScores["Leadership"] += 15;
        }
      });
    } else {
      // Default scores if no activities
      diversityScores["Technical"] = 40;
      diversityScores["Non-Technical"] = 20;
      diversityScores["Cultural"] = 15;
    }

    // Calculate overall diversity index (0-100)
    const totalScore = Object.values(diversityScores).reduce(
      (sum, score) => sum + score,
      0
    );
    const participatedCategories = Object.values(diversityScores).filter(
      (score) => score > 0
    ).length;
    const diversityIndex = Math.min(
      100,
      (participatedCategories / categories.length) * 100
    );

    // Prepare sunburst data
    const sunburstData = categories.map((category) => ({
      name: category,
      value: diversityScores[category] || 1, // Minimum 1 to show in chart
      fill: diversityScores[category] > 0 ? undefined : "#f0f0f0",
    }));

    return {
      diversityIndex: Math.round(diversityIndex),
      sunburstData,
      categoryBreakdown: diversityScores,
      participatedCategories,
      totalCategories: categories.length,
    };
  };

  // Initialize chart data
  const chartData = prepareChartData();
  console.log("Prepared chart data:", chartData);
  const analysis = generateAnalysis();
  const suggestions = generateSuggestions(analysis);
  const categoryData = prepareCategoryData();
  const domainAffinityData = generateDomainAffinityData();
  const networkingData = generateNetworkingData();
  const diversityData = generateDiversityData();
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  const formatCategoryName = (category) => {
    switch (category) {
      case "curricular":
        return "Curricular";
      case "coCurricular":
        return "Co-Curricular";
      case "extraCurricular":
        return "Extra-Curricular";
      default:
        return category;
    }
  };

  const handleSendAnalysis = () => {
    // In a real app, this would make an API call to send the analysis
    console.log("Sending analysis for student:", student.name);

    alert(
      `Analysis for ${student.name} would be shared with the student and parents in a real application.`
    );
    onClose();
  };

  const toggleReportGenerator = () => {
    setShowReportGenerator((prev) => !prev);
  };

  return (
    <div className="modal-backdrop enhanced-modal">
      <div className="modal-container enhanced-student-analysis-modal">
        <div
          className="modal-header enhanced-header"
          style={{ height: "90px" }}
        >
          <div className="header-content">
            <h2>Comprehensive Student Analysis: {student.name}</h2>
            <div className="header-tabs">
              <button
                className={`tab-btn ${activeTab === "academic" ? "active" : ""
                  }`}
                onClick={() => setActiveTab("academic")}
              >
                Academic
              </button>
              <button
                className={`tab-btn ${activeTab === "nonacademic" ? "active" : ""
                  }`}
                onClick={() => setActiveTab("nonacademic")}
              >
                Co/Extra-Curricular
              </button>
            </div>
          </div>
          <button className="close-btn enhanced-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-content-sa enhanced-content">
          <div className="student-details enhanced-details">
            <div className="detail-card">
              <div className="detail-icon">🎓</div>
              <div className="detail-content">
                <span className="detail-label">Roll Number</span>
                <span className="detail-value">{student.rollNo}</span>
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-icon">👥</div>
              <div className="detail-content">
                <span className="detail-label">Batch</span>
                <span className="detail-value">{student.batch}</span>
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-icon">📅</div>
              <div className="detail-content">
                <span className="detail-label">Current Semester</span>
                <span className="detail-value">{student.semester}</span>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "academic" && (
              <AcademicAnalysis
                student={student}
                academicData={academicDetails}
              />
            )}

            {activeTab === "nonacademic" && (
              <div className="nonacademic-analysis-container">
                <div className="analysis-section-nonacademic">
                  <h3>Co-Curricular & Extra-Curricular Performance Trends</h3>

                  <div className="chart-container-nonacademic">
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
                        <LineChart
                          data={chartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="semester"
                            label={{
                              value: "Semester",
                              position: "insideBottomRight",
                              offset: -10,
                            }}
                            tickCount={10}
                            type="number"
                            domain={[1, "dataMax"]}
                            allowDecimals={false}
                          />
                          <YAxis
                            label={{
                              value: "Points",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            formatter={(value) => [
                              `${value} points`,
                              undefined,
                            ]}
                          />
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

                {/* Activity List and Pie Chart Section */}
                <div className="activity-pie-container">
                  <div className="activity-section">
                    <h3>📋 Activity List</h3>

                    {/* Semester Filter */}
                    <div className="semester-filter-nonacademic">
                      <label className="semester-label-nonacademic">
                        Select Semester:{" "}
                      </label>
                      <div className="semester-buttons-nonacademic">
                        {semesterPoints.map((point) => (
                          <button
                            key={point.semester}
                            className={`semester-btn-nonacademic ${selectedSemester === point.semester
                              ? "active-nonacademic"
                              : ""
                              }`}
                            onClick={() => handleSemesterChange(point.semester)}
                          >
                            Semester {point.semester}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="activity-list-container-nonacademic">
                      {loadingActivities ? (
                        <div className="loading-message">
                          <p>Loading activities...</p>
                        </div>
                      ) : activityList && activityList.length > 0 ? (
                        <table className="activity-table-nonacademic">
                          <thead>
                            <tr>
                              <th>Activity Name</th>
                              <th>Type</th>
                              <th>Position</th>
                              <th>Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activityList.map((activity) => (
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
                          <p>
                            No activities found for semester {selectedSemester}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pie-chart-section">
                    <h4> Performance Breakdown</h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance Insights and Suggestions Container */}
                <div className="insights-suggestions-container">
                  <div className="insights-section">
                    <h3> Performance Insights</h3>
                    {loadingActivities ? (
                      <div className="loading-message">
                        <p>Analyzing performance data...</p>
                      </div>
                    ) : (
                      <>
                        <div className="insights-grid">
                          {/* Strengths Card */}
                          <div className="insight-card">
                            <h4>Strengths</h4>
                            {performanceInsights.strengths.length > 0 ? (
                              <div className="insight-list">
                                <p className="insight-header">
                                  Strong performance in:
                                </p>
                                <ul>
                                  {performanceInsights.strengths.map(
                                    (strength, index) => (
                                      <li key={index} className="insight-item">
                                        <span className="category-name">
                                          {strength.category}
                                        </span>
                                        <span className="points-badge strength">
                                          {strength.points} pts
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            ) : (
                              <p>
                                No specific strengths identified in this
                                semester.
                              </p>
                            )}
                          </div>

                          {/* Areas for Improvement Card */}
                          <div className="insight-card">
                            <h4>Areas for Improvement</h4>
                            {performanceInsights.areasForImprovement.length >
                              0 ? (
                              <div className="insight-list">
                                <p className="insight-header">
                                  Suggested areas to explore:
                                </p>
                                <ul>
                                  {performanceInsights.areasForImprovement
                                    .slice(0, 4)
                                    .map((area, index) => (
                                      <li key={index} className="insight-item">
                                        <span className="category-name">
                                          {area.category}
                                        </span>
                                        {area.count === 0 ? (
                                          <span className="participation-status no-participation">
                                            Not participated
                                          </span>
                                        ) : (
                                          <span className="points-badge weakness">
                                            {area.points} pts
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            ) : (
                              <p>
                                No specific areas for improvement identified.
                              </p>
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

                        {/* Additional Analysis Feature */}
                        <div className="additional-analysis">
                          <h4>📈 Activity Engagement Metrics</h4>
                          <div className="analysis-metrics">
                            <div className="metric-item">
                              <span className="metric-label">
                                Total Activities
                              </span>
                              <span className="metric-value">
                                {activityList.length}
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">
                                Avg Points/Activity
                              </span>
                              <span className="metric-value">
                                {activityList.length > 0
                                  ? Math.round(
                                    activityList.reduce(
                                      (sum, act) => sum + (act.points || 0),
                                      0
                                    ) / activityList.length
                                  )
                                  : 0}
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">
                                Categories Explored
                              </span>
                              <span className="metric-value">
                                {
                                  new Set(
                                    activityList.map((act) => act.category)
                                  ).size
                                }
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">
                                Leadership Roles
                              </span>
                              <span className="metric-value">
                                {
                                  activityList.filter(
                                    (act) =>
                                      act.position &&
                                      (act.position
                                        .toLowerCase()
                                        .includes("leader") ||
                                        act.position
                                          .toLowerCase()
                                          .includes("head") ||
                                        act.position
                                          .toLowerCase()
                                          .includes("captain"))
                                  ).length
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Advanced Analytics Features - Two Column Layout */}
                  <div className="insights-suggestions-container">
                    <div className="insights-section">
                      <h3> Domain Affinity & Networking</h3>

                      <div className="analytics-feature">
                        <p className="feature-description">
                          Measures collaborative engagement through team
                          projects, leadership roles, and network diversity.
                        </p>
                        <div className="networking-metrics">
                          <div className="collaboration-score">
                            <div className="score-circle">
                              <div className="score-value">
                                {networkingData.collaborationIndex}
                              </div>
                              <div className="score-label">
                                Collaboration Score
                              </div>
                            </div>
                          </div>
                          <div className="network-stats">
                            <div className="stat-item">
                              <div className="stat-icon">👥</div>
                              <div className="stat-content">
                                <div className="stat-value">
                                  {networkingData.teamProjects}
                                </div>
                                <div className="stat-label">Team Projects</div>
                              </div>
                            </div>
                            <div className="stat-item">
                              <div className="stat-icon">👑</div>
                              <div className="stat-content">
                                <div className="stat-value">
                                  {networkingData.leadershipRoles}
                                </div>
                                <div className="stat-label">
                                  Leadership Roles
                                </div>
                              </div>
                            </div>
                            {/* <div className="stat-item">
                              <div className="stat-icon">🌐</div>
                              <div className="stat-content">
                                <div className="stat-value">
                                  {networkingData.networkNodes.length}
                                </div>
                                <div className="stat-label">
                                  Network Connections
                                </div>
                              </div>
                            </div> */}
                          </div>
                        </div>
                        {/* <div className="network-visualization">
                          <h5>🕸️ Collaboration Network:</h5>
                          <div className="network-nodes">
                            {networkingData.networkNodes.map((node, index) => (
                              <div
                                key={node.id}
                                className={`network-node ${node.group}`}
                                style={{
                                  width: `${Math.max(35, node.size * 0.6)}px`,
                                  height: `${Math.max(35, node.size * 0.6)}px`,
                                }}
                              >
                                <span className="node-label">{node.id}</span>
                                <span className="node-strength">
                                  {node.size}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div> */}
                      </div>
                    </div>

                    <div className="suggestions-section">
                      <h3>Diversity & Insights</h3>

                      {/* Participation Diversity Index */}
                      <div className="analytics-feature">
                        <p className="feature-description">
                          Analyzes the breadth of student engagement across
                          different activity categories for well-rounded
                          development.
                        </p>
                        <div className="diversity-overview">
                          <div className="diversity-gauge">
                            <div className="gauge-container">
                              <div className="gauge-value">
                                {diversityData.diversityIndex}%
                              </div>
                              <div className="gauge-label">Diversity Score</div>
                              <div className="gauge-description">
                                {diversityData.participatedCategories} of{" "}
                                {diversityData.totalCategories} categories
                                explored
                              </div>
                            </div>
                          </div>
                          <div className="diversity-breakdown">
                            <h5>Category Participation:</h5>
                            <ResponsiveContainer width="100%" height={320}>
                              <PieChart margin={{ top: 40, right: 60, bottom: 20, left: 60 }}>
                                <Pie
                                  data={diversityData.sunburstData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={60}
                                  fill="#8884d8"
                                  dataKey="value"
                                  nameKey="name"
                                  label={({ value, name, percent, payload }) => {
                                    // Get the actual scores from diversityData.categoryBreakdown
                                    const actualScores = diversityData.categoryBreakdown;
                                    const actualValue = actualScores[name] || 0;
                                    
                                    // Calculate total from actual scores (not display values)
                                    const totalActual = Object.values(actualScores).reduce((sum, score) => sum + score, 0);
                                    
                                    // Calculate accurate percentage from actual values
                                    const accuratePercent = totalActual > 0 ? Math.round((actualValue / totalActual) * 100) : 0;
                                    
                                    // Only show percentage if there's actual participation (not just display value of 1)
                                    return actualValue > 0 ? `${accuratePercent}%` : '';
                                  }}
                                  labelLine={false}
                                >
                                  {diversityData.sunburstData.map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={
                                          entry.fill ||
                                          COLORS[index % COLORS.length]
                                        }
                                      />
                                    )
                                  )}
                                </Pie>
                                <Tooltip
                                  formatter={(value, name) => [
                                    value > 1
                                      ? `${value} points`
                                      : "Not participated",
                                    name,
                                  ]}
                                />
                              </PieChart>
                            </ResponsiveContainer>

                            {/* Custom Legend in 2x3 Grid */}
                            <div className="custom-legend-grid">
                              {diversityData.sunburstData.map((entry, index) => (
                                <div key={entry.name} className="legend-item">
                                  <div 
                                    className="legend-color-box"
                                    style={{
                                      backgroundColor: entry.fill || COLORS[index % COLORS.length]
                                    }}
                                  ></div>
                                  <span className="legend-text">{entry.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="diversity-insights">
                          <div className="insight-grid">
                            <div className="insight-card diversity-card">
                              <h6> Profile Type</h6>
                              <p>
                                {diversityData.diversityIndex >= 80
                                  ? "Well-Rounded Explorer"
                                  : diversityData.diversityIndex >= 60
                                    ? "Balanced Participant"
                                    : diversityData.diversityIndex >= 40
                                      ? "Focused Specialist"
                                      : "Emerging Participant"}
                              </p>
                            </div>
                            <div className="insight-card diversity-card">
                              <h6>📈 Recommendation</h6>
                              {/* <p>
                                {diversityData.diversityIndex >= 80
                                  ? "Maintain excellent diversity while deepening expertise in top areas."
                                  : diversityData.diversityIndex >= 60
                                  ? "Consider exploring 1-2 new categories to enhance diversity."
                                  : "Focus on expanding participation across different activity types."}
                              </p> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
          <button
            className="btn-generate-report"
            onClick={toggleReportGenerator}
          >
            Generate Report
          </button>
          {/* <button className="btn-share" onClick={handleSendAnalysis}>
            Share Analysis with Student & Parents
          </button> */}

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
