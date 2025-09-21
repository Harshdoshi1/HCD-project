import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FileText,
  ChartBar,
  ChartPie,
  ChartLine,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ReportGenerator.css";

const ReportGenerator = ({
  students: initialStudents,
  selectedBatch: initialBatch,
  selectedSemester,
  onClose,
}) => {
  const [reportType, setReportType] = useState("performance");
  const [selectedCharts, setSelectedCharts] = useState({
    distribution: true,
    trends: true,
    comparison: true,
    categorical: true,
    progress: true,
  });
  const [format, setFormat] = useState("pdf");
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeTrends, setIncludeTrends] = useState(true);
  const [batches, setBatches] = useState(["all"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState(initialStudents || []);
  const [selectedBatch, setSelectedBatch] = useState(initialBatch || "all");
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [studentError, setStudentError] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Create refs for the charts to be included in PDF
  const reportRef = useRef(null);
  const distributionChartRef = useRef(null);
  const topStudentsChartRef = useRef(null);
  const pointsRangeChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const trendsChartRef = useRef(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchStudentsByBatch(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:5001/api/batches/getAllBatches"
      );
      if (response.data && Array.isArray(response.data)) {
        const batchNames = response.data.map((batch) => batch.batchName);
        const allBatches = ["all", ...batchNames];
        setBatches(allBatches);
      } else {
        setError("Invalid batch data format");
        setBatches(["all"]);
      }
    } catch (err) {
      setError("Failed to load batches");
      setBatches(["all"]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByBatch = async (batch) => {
    setFetchingStudents(true);
    setStudentError(null);
    try {
      let url = "";
      let response;

      if (batch === "all") {
        // Fetch all students
        url = "http://localhost:5001/api/students/getAllStudents";
        response = await axios.get(url);
      } else {
        // First get the batch ID from the batch name
        const batchesResponse = await axios.get(
          "http://localhost:5001/api/batches/getAllBatches"
        );
        const selectedBatchObj = batchesResponse.data.find(
          (b) => b.batchName === batch
        );

        if (selectedBatchObj && selectedBatchObj.id) {
          // Fetch students by batch ID
          url = `http://localhost:5001/api/students/getStudentsByBatch/${selectedBatchObj.id}`;
          response = await axios.get(url);
        } else {
          throw new Error(`Batch ID not found for batch name: ${batch}`);
        }
      }

      if (response && response.data) {
        const formattedStudents = await Promise.all(
          Array.isArray(response.data)
            ? response.data.map(async (student) => {
              // Initialize points object
              let points = {
                curricular: 0,
                coCurricular: 0,
                extraCurricular: 0,
              };

              // Fetch co-curricular and extra-curricular points
              try {
                const enrollmentNumber =
                  student.enrollmentNumber || student.rollNo;
                const semester =
                  student.currnetsemester || selectedSemester || "all";

                if (enrollmentNumber && semester) {
                  const pointsResponse = await axios.post(
                    "http://localhost:5001/api/events/fetchEventsbyEnrollandSemester",
                    {
                      enrollmentNumber,
                      semester,
                    }
                  );

                  if (
                    pointsResponse.data &&
                    Array.isArray(pointsResponse.data)
                  ) {
                    // Sum up all co-curricular and extra-curricular points
                    pointsResponse.data.forEach((activity) => {
                      points.coCurricular += parseInt(
                        activity.totalCocurricular || 0
                      );
                      points.extraCurricular += parseInt(
                        activity.totalExtracurricular || 0
                      );
                    });
                  } else if (
                    pointsResponse.data &&
                    pointsResponse.data.totalCocurricular
                  ) {
                    // If it's a single object with the totals
                    points.coCurricular = parseInt(
                      pointsResponse.data.totalCocurricular || 0
                    );
                    points.extraCurricular = parseInt(
                      pointsResponse.data.totalExtracurricular || 0
                    );
                  }
                }
              } catch (error) {
                console.error("Error fetching student points:", error);
                // Keep the default values if there's an error
              }

              return {
                id: student.id || Math.random().toString(36).substr(2, 9),
                name: student.name || student.studentName || "Unknown",
                rollNo: student.enrollmentNumber || student.rollNo || "N/A",
                batch:
                  student.batchName ||
                  (student.Batch ? student.Batch.batchName : batch),
                semester:
                  student.semesterNumber ||
                  student.currnetsemester ||
                  selectedSemester ||
                  "N/A",
                email: student.email || "N/A",
                parentEmail: student.parentEmail || "N/A",
                points: points,
              };
            })
            : []
        );

        setStudents(formattedStudents);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudentError(
        "Failed to load students. " +
        (err.response?.data?.message || err.message)
      );
      setStudents([]);
    } finally {
      setFetchingStudents(false);
    }
  };

  const handleChartToggle = (chartName) => {
    setSelectedCharts((prev) => ({
      ...prev,
      [chartName]: !prev[chartName],
    }));
  };

  const handleGenerateReport = async () => {
    setGeneratingPdf(true);
    console.log("Generating report with selected charts:", selectedCharts);

    try {
      // Create a new PDF document
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Title and metadata
      const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)
        } Report - ${selectedBatch !== "all" ? `Batch ${selectedBatch}` : "All Batches"
        }`;
      doc.setFontSize(18);
      doc.text(title, pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(10);
      const date = new Date().toLocaleDateString();
      doc.text(`Generated on: ${date}`, pageWidth - 40, 30);

      doc.setFontSize(12);
      let yPos = 40;

      // Capture entire report section
      if (reportRef.current) {
        const reportCanvas = await html2canvas(reportRef.current, {
          scale: 1.5,
          logging: false,
          useCORS: true,
        });

        // Calculate scaling to fit on page while maintaining aspect ratio
        const reportImgData = reportCanvas.toDataURL("image/png");
        const imgWidth = pageWidth - 30; // margins
        const imgHeight = (reportCanvas.height * imgWidth) / reportCanvas.width;

        if (imgHeight > pageHeight - 50) {
          // If image is too tall, split it across multiple pages
          const ratio = reportCanvas.width / (pageWidth - 30);
          const totalHeight = reportCanvas.height;
          const pageContentHeight = pageHeight - 50;
          const pagesNeeded = Math.ceil(
            totalHeight / (pageContentHeight * ratio)
          );

          for (let i = 0; i < pagesNeeded; i++) {
            if (i > 0) doc.addPage();

            // Calculate source and destination heights
            const srcY = i * pageContentHeight * ratio;
            const srcHeight = Math.min(
              pageContentHeight * ratio,
              totalHeight - srcY
            );
            const destHeight = srcHeight / ratio;

            doc.text(`Page ${i + 1} of ${pagesNeeded}`, 10, 10);
            doc.addImage(
              reportImgData,
              "PNG",
              15,
              20,
              imgWidth,
              destHeight,
              null,
              "FAST",
              // Set source clipping
              {
                sourceX: 0,
                sourceY: srcY,
                sourceWidth: reportCanvas.width,
                sourceHeight: srcHeight,
              }
            );
          }
        } else {
          // If it fits on a single page
          doc.addImage(reportImgData, "PNG", 15, 40, imgWidth, imgHeight);
        }
      }

      // Add analytics summary if recommendations are included
      if (includeRecommendations) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Performance Analytics Summary", pageWidth / 2, 20, {
          align: "center",
        });

        doc.setFontSize(12);
        yPos = 40;

        // Sample performance metrics
        const avgCoCurricular =
          students.reduce(
            (sum, student) => sum + student.points.coCurricular,
            0
          ) / students.length || 0;
        const avgExtraCurricular =
          students.reduce(
            (sum, student) => sum + student.points.extraCurricular,
            0
          ) / students.length || 0;

        doc.text(
          `Average Co-Curricular Points: ${avgCoCurricular.toFixed(2)}`,
          20,
          yPos
        );
        yPos += 10;
        doc.text(
          `Average Extra-Curricular Points: ${avgExtraCurricular.toFixed(2)}`,
          20,
          yPos
        );
        yPos += 10;

        // Top performers
        const topPerformers = [...students]
          .sort(
            (a, b) =>
              b.points.coCurricular +
              b.points.extraCurricular -
              (a.points.coCurricular + a.points.extraCurricular)
          )
          .slice(0, 5);

        yPos += 10;
        doc.text("Top Performers:", 20, yPos);
        yPos += 8;

        topPerformers.forEach((student, index) => {
          const totalPoints =
            student.points.coCurricular + student.points.extraCurricular;
          doc.text(
            `${index + 1}. ${student.name}: ${totalPoints} points`,
            30,
            yPos
          );
          yPos += 8;
        });

        // Add recommendations
        yPos += 10;
        doc.text("Recommendations:", 20, yPos);
        yPos += 8;

        const recommendations = [];

        if (avgCoCurricular < 50) {
          recommendations.push(
            "Implement additional workshops to improve co-curricular participation."
          );
        }

        if (avgExtraCurricular < 50) {
          recommendations.push(
            "Create more opportunities for students to engage in extra-curricular activities."
          );
        }

        if (avgCoCurricular >= 50 && avgExtraCurricular >= 50) {
          recommendations.push(
            "Maintain the current balance of activities while focusing on areas of individual improvement."
          );
        }

        recommendations.push(
          "Consider peer mentoring programs where top performers can guide other students."
        );

        recommendations.forEach((recommendation, index) => {
          doc.text(`• ${recommendation}`, 30, yPos);
          yPos += 8;
        });
      }

      // Save the PDF file
      const filename = `${reportType}_report_${selectedBatch !== "all" ? selectedBatch : "all"
        }_${date}.pdf`.replace(/[/\:*?"<>|]/g, "_");
      doc.save(filename);

      console.log("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const calculateStatistics = () => {
    if (students.length === 0) {
      return {
        averages: { curricular: 0, coCurricular: 0, extraCurricular: 0 },
        topPerformers: [],
        needsImprovement: [],
      };
    }

    const totals = students.reduce(
      (acc, student) => {
        return {
          curricular: acc.curricular + student.points.curricular,
          coCurricular: acc.coCurricular + student.points.coCurricular,
          extraCurricular: acc.extraCurricular + student.points.extraCurricular,
        };
      },
      { curricular: 0, coCurricular: 0, extraCurricular: 0 }
    );

    const count = students.length;
    const averages = {
      curricular: Math.round(totals.curricular / count),
      coCurricular: Math.round(totals.coCurricular / count),
      extraCurricular: Math.round(totals.extraCurricular / count),
    };

    const totalPoints = students.map((student) => ({
      ...student,
      totalPoints:
        student.points.curricular +
        student.points.coCurricular +
        student.points.extraCurricular,
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
  const prepareCombinedPointsData = () => {
    if (students.length === 0) return [];

    // Calculate combined points for each student
    const combinedPoints = students.map((student) => {
      const totalPoints =
        student.points.coCurricular + student.points.extraCurricular;
      return {
        name: student.name,
        coCurricular: student.points.coCurricular,
        extraCurricular: student.points.extraCurricular,
        combined: totalPoints,
      };
    });

    // Sort by combined points in descending order and limit to top 10 for readability
    return combinedPoints.sort((a, b) => b.combined - a.combined).slice(0, 10);
  };

  const prepareTotalPointsDistributionData = () => {
    if (students.length === 0) return [];

    // Define point ranges for categorization
    const ranges = [
      { name: "0-20", min: 0, max: 20, count: 0 },
      { name: "21-40", min: 21, max: 40, count: 0 },
      { name: "41-60", min: 41, max: 60, count: 0 },
      { name: "61-80", min: 61, max: 80, count: 0 },
      { name: "81-100", min: 81, max: 100, count: 0 },
      { name: "100+", min: 101, max: Infinity, count: 0 },
    ];

    // Count students in each point range based on total points (co-curricular + extra-curricular)
    students.forEach((student) => {
      const totalPoints =
        student.points.coCurricular + student.points.extraCurricular;

      // Find range for total points
      const range = ranges.find(
        (range) => totalPoints >= range.min && totalPoints <= range.max
      );
      if (range) range.count++;
    });

    return ranges;
  };

  const preparePointsRangeData = () => {
    if (students.length === 0) return [];

    // Define point ranges for categorization
    const ranges = [
      { name: "0-20", min: 0, max: 20, coCount: 0, extraCount: 0 },
      { name: "21-40", min: 21, max: 40, coCount: 0, extraCount: 0 },
      { name: "41-60", min: 41, max: 60, coCount: 0, extraCount: 0 },
      { name: "61-80", min: 61, max: 80, coCount: 0, extraCount: 0 },
      { name: "81+", min: 81, max: Infinity, coCount: 0, extraCount: 0 },
    ];

    // Count students in each point range
    students.forEach((student) => {
      const coPoints = student.points.coCurricular;
      const extraPoints = student.points.extraCurricular;

      // Find range for co-curricular points
      const coRange = ranges.find(
        (range) => coPoints >= range.min && coPoints <= range.max
      );
      if (coRange) coRange.coCount++;

      // Find range for extra-curricular points
      const extraRange = ranges.find(
        (range) => extraPoints >= range.min && extraPoints <= range.max
      );
      if (extraRange) extraRange.extraCount++;
    });

    return ranges;
  };

  const prepareDistributionData = () => {
    const pointRanges = [
      { name: "0-20", range: [0, 20], count: 0 },
      { name: "21-40", range: [21, 40], count: 0 },
      { name: "41-60", range: [41, 60], count: 0 },
      { name: "61-80", range: [61, 80], count: 0 },
      { name: "81-100", range: [81, 100], count: 0 },
    ];

    students.forEach((student) => {
      const totalPoints =
        student.points.curricular +
        student.points.coCurricular +
        student.points.extraCurricular;
      const avgPoints = Math.round(totalPoints / 3);

      const range = pointRanges.find(
        (r) => avgPoints >= r.range[0] && avgPoints <= r.range[1]
      );
      if (range) range.count++;
    });

    return pointRanges;
  };

  const prepareCategoryData = () => {
    if (students.length === 0) return [];

    return [
      { name: "Co-Curricular", value: stats.averages.coCurricular },
      { name: "Extra-Curricular", value: stats.averages.extraCurricular },
    ];
  };

  const prepareTrendsData = () => {
    // Get all semesters from students
    const allSemesters = new Set();
    students.forEach((student) => {
      if (student.history) {
        student.history.forEach((h) => allSemesters.add(h.semester));
      }
      allSemesters.add(student.semester);
    });

    // Sort semesters
    const sortedSemesters = [...allSemesters].sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    // Calculate average points per semester
    return sortedSemesters.map((semester) => {
      const semesterStudents = students.filter(
        (s) =>
          s.semester === semester ||
          (s.history && s.history.some((h) => h.semester === semester))
      );

      if (semesterStudents.length === 0)
        return { semester, curricular: 0, coCurricular: 0, extraCurricular: 0 };

      const totals = { curricular: 0, coCurricular: 0, extraCurricular: 0 };
      let count = 0;

      semesterStudents.forEach((student) => {
        if (student.semester === semester) {
          totals.curricular += student.points.curricular;
          totals.coCurricular += student.points.coCurricular;
          totals.extraCurricular += student.points.extraCurricular;
          count++;
        } else if (student.history) {
          const historyItem = student.history.find(
            (h) => h.semester === semester
          );
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
        extraCurricular: Math.round(totals.extraCurricular / count),
      };
    });
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const distributionData = prepareDistributionData();
  const categoryData = prepareCategoryData();
  const trendsData = prepareTrendsData();
  const combinedPointsData = prepareCombinedPointsData();
  const pointsRangeData = preparePointsRangeData();
  const totalPointsDistributionData = prepareTotalPointsDistributionData();

  return (
    <div className="report-generator-fullscreen">
      {loading && batches.length <= 1 && (
        <span className="loading-text">Loading batches...</span>
      )}
      {fetchingStudents && (
        <span className="loading-text">Loading students...</span>
      )}
      {error && <div className="error-message">{error}</div>}
      {studentError && <div className="error-message">{studentError}</div>}
      <div className="report-content">
        <div className="modal-container-fullscreen">
          <div className="modal-header-fullscreen" style={{ marginTop: "60px" }}>
            <div className="header-left">
              <h2>Batch Analytics</h2>
              <p className="header-subtitle">
                Comprehensive Performance Analysis & Reporting
              </p>
            </div>
            <div className="header-controls">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                disabled={loading}
                className="batch-select-fullscreen"
              >
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch === "all" ? "All Batches" : `Batch ${batch}`}
                  </option>
                ))}
              </select>
              <button className="close-btn-fullscreen" onClick={onClose}>
                &times;
              </button>
            </div>
          </div>
          <div className="modal-content-fullscreen">
            <div className="two-column-layout">
              <div className="left-column">
                <div className="config-section">
                  <h3>🔧 Report Configuration</h3>
                  <div className="form-group">
                    <label>Report Type:</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="form-control"
                      disabled={generatingPdf}
                    >
                      <option value="performance">Performance Summary</option>
                      <option value="detailed">Detailed Analysis</option>
                      <option value="comparative">Comparative Analysis</option>
                      <option value="blooms">Bloom's Taxonomy Analysis</option>
                    </select>
                  </div>
                  <div className="chart-selection">
                    <h4>📈 Select Analysis Components</h4>
                    <div className="chart-options">
                      <label className="chart-option">
                        <input
                          type="checkbox"
                          checked={selectedCharts.distribution}
                          onChange={() => handleChartToggle("distribution")}
                        />
                        <ChartBar className="chart-icon" />
                        Points Distribution
                      </label>
                      <label className="chart-option">
                        <input
                          type="checkbox"
                          checked={selectedCharts.trends}
                          onChange={() => handleChartToggle("trends")}
                        />
                        <ChartLine className="chart-icon" />
                        Performance Trends
                      </label>
                      <label className="chart-option">
                        <input
                          type="checkbox"
                          checked={selectedCharts.categorical}
                          onChange={() => handleChartToggle("categorical")}
                        />
                        <ChartPie className="chart-icon" />
                        Category Breakdown
                      </label>
                      <label className="chart-option">
                        <input
                          type="checkbox"
                          checked={selectedCharts.comparison}
                          onChange={() => handleChartToggle("comparison")}
                        />
                        <ChartBar className="chart-icon" />
                        Comparative Analysis
                      </label>
                      <label className="chart-option">
                        <input
                          type="checkbox"
                          checked={selectedCharts.progress}
                          onChange={() => handleChartToggle("progress")}
                        />
                        <ChartLine className="chart-icon" />
                        Progress Tracking
                      </label>
                    </div>
                  </div>
                  <div className="form-options">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        checked={includeRecommendations}
                        onChange={(e) =>
                          setIncludeRecommendations(e.target.checked)
                        }
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

                {/* New Advanced Analysis Sections */}
                <div className="advanced-analysis-section">
                  <h3>🎯 Class/Batch-Level Comparative Analysis</h3>
                  <div className="analysis-card">
                    <h4>Performance Distribution</h4>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-label">
                          Top Performers (&gt;80%)
                        </span>
                        <span className="stat-value">
                          {Math.round(
                            (students.filter(
                              (s) =>
                                (s.points?.coCurricular || 0) +
                                (s.points?.extraCurricular || 0) >
                                80
                            ).length /
                              students.length) *
                            100
                          )}
                          %
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">
                          Average Performers (50-80%)
                        </span>
                        <span className="stat-value">
                          {Math.round(
                            (students.filter((s) => {
                              const total =
                                (s.points?.coCurricular || 0) +
                                (s.points?.extraCurricular || 0);
                              return total >= 50 && total <= 80;
                            }).length /
                              students.length) *
                            100
                          )}
                          %
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">
                          Low Performers (&lt;50%)
                        </span>
                        <span className="stat-value">
                          {Math.round(
                            (students.filter(
                              (s) =>
                                (s.points?.coCurricular || 0) +
                                (s.points?.extraCurricular || 0) <
                                50
                            ).length /
                              students.length) *
                            100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="blooms-analysis-section">
                  <h3>🧠 Bloom's Taxonomy Distribution</h3>
                  <div className="analysis-card">
                    <div className="blooms-levels">
                      <div className="bloom-level">
                        <span className="level-name">Remember</span>
                        <div className="level-bar">
                          <div
                            className="level-fill"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                        <span className="level-percentage">85%</span>
                      </div>
                      <div className="bloom-level">
                        <span className="level-name">Understand</span>
                        <div className="level-bar">
                          <div
                            className="level-fill"
                            style={{ width: "78%" }}
                          ></div>
                        </div>
                        <span className="level-percentage">78%</span>
                      </div>
                      <div className="bloom-level">
                        <span className="level-name">Apply</span>
                        <div className="level-bar">
                          <div
                            className="level-fill"
                            style={{ width: "65%" }}
                          ></div>
                        </div>
                        <span className="level-percentage">65%</span>
                      </div>
                      <div className="bloom-level">
                        <span className="level-name">Analyze</span>
                        <div className="level-bar">
                          <div
                            className="level-fill"
                            style={{ width: "52%" }}
                          ></div>
                        </div>
                        <span className="level-percentage">52%</span>
                      </div>
                      <div className="bloom-level">
                        <span className="level-name">Evaluate</span>
                        <div className="level-bar">
                          <div
                            className="level-fill"
                            style={{ width: "48%" }}
                          ></div>
                        </div>
                        <span className="level-percentage">48%</span>
                      </div>
                      <div className="bloom-level">
                        <span className="level-name">Create</span>
                        <div className="level-bar">
                          <div
                            className="level-fill"
                            style={{ width: "35%" }}
                          ></div>
                        </div>
                        <span className="level-percentage">35%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="right-column">
                <div className="report-preview" ref={reportRef}>
                  <h3>📊 Live Analytics Preview</h3>
                  {selectedCharts.distribution && (
                    <div className="preview-chart" ref={distributionChartRef}>
                      <h4>
                        📈 Points Distribution -{" "}
                        {selectedBatch !== "all"
                          ? `Batch ${selectedBatch}`
                          : "All Batches"}
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={totalPointsDistributionData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="count"
                            fill="#3674B5"
                            name="Number of Students by Total Points (Co+Extra)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {selectedCharts.trends && (
                    <div className="preview-chart" ref={trendsChartRef}>
                      <h4>📊 Performance Trends</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                          data={trendsData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="semester" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="curricular"
                            stroke="#0088FE"
                            name="Curricular"
                          />
                          <Line
                            type="monotone"
                            dataKey="coCurricular"
                            stroke="#00C49F"
                            name="Co-Curricular"
                          />
                          <Line
                            type="monotone"
                            dataKey="extraCurricular"
                            stroke="#FFBB28"
                            name="Extra-Curricular"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {selectedCharts.categorical && (
                    <div className="preview-chart" ref={categoryChartRef}>
                      <h4>🥧 Category Breakdown</h4>
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
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={["#3674B5", "#28a745", "#ffc107"][index]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {selectedCharts.comparison && (
                    <div className="preview-chart" ref={topStudentsChartRef}>
                      <h4>🏆 Top Performers vs Average vs Low Performers</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={combinedPointsData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="coCurricular"
                            fill="#00C49F"
                            name="Co-Curricular Points"
                          />
                          <Bar
                            dataKey="extraCurricular"
                            fill="#FFBB28"
                            name="Extra-Curricular Points"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {selectedCharts.progress && (
                    <div className="preview-chart" ref={pointsRangeChartRef}>
                      <h4>📊 Participation Index & Engagement Metrics</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={pointsRangeData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="coCount"
                            fill="#00C49F"
                            name="Students (Co-Curricular)"
                          />
                          <Bar
                            dataKey="extraCount"
                            fill="#FFBB28"
                            name="Students (Extra-Curricular)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Enhanced Batch-wise Bloom's Taxonomy Analysis */}
                  {/* <div className="preview-chart">
                    <h4>🧠 Batch-wise Bloom's Taxonomy Performance Analysis</h4>
                    <p className="heatmap-description">
                      This analysis shows the total points earned by the entire batch across different Bloom's taxonomy levels. 
                      <strong>Green indicates strong performance</strong>, <strong>yellow shows developing areas</strong>, and <strong>red highlights areas needing focus</strong>.
                    </p>
                    
                    <div className="enhanced-heatmap-container">
                      <div className="heatmap-headers">
                        <div className="category-header">Activity Category</div>
                        <div className="outcome-header">
                          <span className="outcome-title">Remember</span>
                          <span className="outcome-subtitle">(Basic Knowledge)</span>
                        </div>
                        <div className="outcome-header">
                          <span className="outcome-title">Understand</span>
                          <span className="outcome-subtitle">(Comprehension)</span>
                        </div>
                        <div className="outcome-header">
                          <span className="outcome-title">Apply</span>
                          <span className="outcome-subtitle">(Practical Use)</span>
                        </div>
                        <div className="outcome-header">
                          <span className="outcome-title">Analyze</span>
                          <span className="outcome-subtitle">(Critical Thinking)</span>
                        </div>
                        <div className="outcome-header">
                          <span className="outcome-title">Total Points</span>
                          <span className="outcome-subtitle">(Category Sum)</span>
                        </div>
                      </div>

                      <div className="enhanced-heatmap-grid">
                        <div className="enhanced-heatmap-row">
                          <div className="enhanced-subject-label">
                            <span className="subject-name">Curricular Activities</span>
                            <span className="subject-code">Academic Performance</span>
                          </div>
                          <div className="enhanced-heatmap-cell strength" title="Remember: 2,450 points - Strong foundational knowledge across batch">
                            <span className="cell-value">2,450</span>
                            <span className="cell-icon">✓</span>
                          </div>
                          <div className="enhanced-heatmap-cell average" title="Understand: 1,890 points - Good conceptual understanding">
                            <span className="cell-value">1,890</span>
                            <span className="cell-icon">⚠</span>
                          </div>
                          <div className="enhanced-heatmap-cell weakness" title="Apply: 1,120 points - Needs improvement in practical application">
                            <span className="cell-value">1,120</span>
                            <span className="cell-icon">❌</span>
                          </div>
                          <div className="enhanced-heatmap-cell average" title="Analyze: 1,650 points - Moderate analytical skills">
                            <span className="cell-value">1,650</span>
                            <span className="cell-icon">⚠</span>
                          </div>
                          <div className="enhanced-heatmap-cell average overall" title="Total: 7,110 points - Good overall academic performance">
                            <span className="cell-value">7,110</span>
                            <span className="trend-indicator">→</span>
                          </div>
                        </div>

                        <div className="enhanced-heatmap-row">
                          <div className="enhanced-subject-label">
                            <span className="subject-name">Co-Curricular Activities</span>
                            <span className="subject-code">Technical & Skills</span>
                          </div>
                          <div className="enhanced-heatmap-cell average" title="Remember: 1,680 points - Adequate technical knowledge retention">
                            <span className="cell-value">1,680</span>
                            <span className="cell-icon">⚠</span>
                          </div>
                          <div className="enhanced-heatmap-cell strength" title="Understand: 2,340 points - Strong technical understanding">
                            <span className="cell-value">2,340</span>
                            <span className="cell-icon">✓</span>
                          </div>
                          <div className="enhanced-heatmap-cell strength" title="Apply: 2,890 points - Excellent hands-on technical skills">
                            <span className="cell-value">2,890</span>
                            <span className="cell-icon">✓</span>
                          </div>
                          <div className="enhanced-heatmap-cell average" title="Analyze: 1,780 points - Good problem-solving abilities">
                            <span className="cell-value">1,780</span>
                            <span className="cell-icon">⚠</span>
                          </div>
                          <div className="enhanced-heatmap-cell strength overall" title="Total: 8,690 points - Strong co-curricular engagement">
                            <span className="cell-value">8,690</span>
                            <span className="trend-indicator">↑</span>
                          </div>
                        </div>

                        <div className="enhanced-heatmap-row">
                          <div className="enhanced-subject-label">
                            <span className="subject-name">Extra-Curricular Activities</span>
                            <span className="subject-code">Leadership & Social</span>
                          </div>
                          <div className="enhanced-heatmap-cell strength" title="Remember: 2,120 points - Strong awareness of social responsibilities">
                            <span className="cell-value">2,120</span>
                            <span className="cell-icon">✓</span>
                          </div>
                          <div className="enhanced-heatmap-cell strength" title="Understand: 2,450 points - Excellent understanding of teamwork">
                            <span className="cell-value">2,450</span>
                            <span className="cell-icon">✓</span>
                          </div>
                          <div className="enhanced-heatmap-cell average" title="Apply: 1,890 points - Good leadership application">
                            <span className="cell-value">1,890</span>
                            <span className="cell-icon">⚠</span>
                          </div>
                          <div className="enhanced-heatmap-cell strength" title="Analyze: 2,180 points - Strong strategic thinking">
                            <span className="cell-value">2,180</span>
                            <span className="cell-icon">✓</span>
                          </div>
                          <div className="enhanced-heatmap-cell strength overall" title="Total: 8,640 points - Excellent extra-curricular participation">
                            <span className="cell-value">8,640</span>
                            <span className="trend-indicator">↑</span>
                          </div>
                        </div>

                        <div className="enhanced-heatmap-row batch-total">
                          <div className="enhanced-subject-label total-label">
                            <span className="subject-name">Batch Total</span>
                            <span className="subject-code">All Categories Combined</span>
                          </div>
                          <div className="enhanced-heatmap-cell average overall" title="Remember Total: 6,250 points across all categories">
                            <span className="cell-value">6,250</span>
                            <span className="cell-icon">📊</span>
                          </div>
                          <div className="enhanced-heatmap-cell strength overall" title="Understand Total: 6,680 points across all categories">
                            <span className="cell-value">6,680</span>
                            <span className="cell-icon">📊</span>
                          </div>
                          <div className="enhanced-heatmap-cell average overall" title="Apply Total: 5,900 points across all categories">
                            <span className="cell-value">5,900</span>
                            <span className="cell-icon">📊</span>
                          </div>
                          <div className="enhanced-heatmap-cell average overall" title="Analyze Total: 5,610 points across all categories">
                            <span className="cell-value">5,610</span>
                            <span className="cell-icon">📊</span>
                          </div>
                          <div className="enhanced-heatmap-cell strength overall total-cell" title="Grand Total: 24,440 points for entire batch">
                            <span className="cell-value">24,440</span>
                            <span className="trend-indicator">🏆</span>
                          </div>
                        </div>
                      </div>

                      <div className="enhanced-heatmap-legend">
                        <div className="legend-section">
                          <h5>Performance Levels</h5>
                          <div className="legend-items">
                            <div className="legend-item">
                              <div className="legend-color strength"></div>
                              <div className="legend-text">
                                <span className="legend-title">Strength (80%+)</span>
                                <span className="legend-desc">Students excel in this outcome</span>
                              </div>
                            </div>
                            <div className="legend-item">
                              <div className="legend-color average"></div>
                              <div className="legend-text">
                                <span className="legend-title">Developing (60-79%)</span>
                                <span className="legend-desc">Room for improvement</span>
                              </div>
                            </div>
                            <div className="legend-item">
                              <div className="legend-color weakness"></div>
                              <div className="legend-text">
                                <span className="legend-title">Needs Focus (&lt;60%)</span>
                                <span className="legend-desc">Requires immediate attention</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="legend-section">
                          <h5>Learning Outcomes (Bloom's Taxonomy)</h5>
                          <div className="outcome-explanations">
                            <div className="outcome-explanation">
                              <strong>Remember:</strong> Recall facts, terms, and basic concepts
                            </div>
                            <div className="outcome-explanation">
                              <strong>Understand:</strong> Explain ideas and concepts
                            </div>
                            <div className="outcome-explanation">
                              <strong>Apply:</strong> Use information in new situations
                            </div>
                            <div className="outcome-explanation">
                              <strong>Analyze:</strong> Draw connections and examine relationships
                            </div>
                          </div>
                        </div>

                        <div className="legend-section">
                          <h5>Key Insights</h5>
                          <div className="insights-summary">
                            <div className="insight-item positive">
                              <span className="insight-icon">✓</span>
                              <span>Strength: Co-curricular and Extra-curricular activities show excellent engagement</span>
                            </div>
                            <div className="insight-item critical">
                              <span className="insight-icon">⚠</span>
                              <span>Focus Area: "Apply" level needs improvement in curricular activities</span>
                            </div>
                            <div className="insight-item recommendation">
                              <span className="insight-icon">💡</span>
                              <span>Recommendation: Bridge theory-practice gap through more hands-on academic projects</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  <style jsx>{`
                    .enhanced-heatmap-container {
                      background: #f8f9fa;
                      border-radius: 12px;
                      padding: 20px;
                      margin: 20px 0;
                    }

                    .heatmap-description {
                      color: #666;
                      font-size: 14px;
                      margin-bottom: 20px;
                      line-height: 1.5;
                    }

                    .heatmap-headers {
                      display: grid;
                      grid-template-columns: 200px repeat(5, 1fr);
                      gap: 2px;
                      margin-bottom: 10px;
                      background: #e9ecef;
                      border-radius: 8px;
                      padding: 10px;
                    }

                    .category-header {
                      font-weight: bold;
                      color: #495057;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }

                    .outcome-header {
                      text-align: center;
                      padding: 8px;
                      background: #fff;
                      border-radius: 6px;
                      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }

                    .outcome-title {
                      display: block;
                      font-weight: bold;
                      color: #495057;
                      font-size: 13px;
                    }

                    .outcome-subtitle {
                      display: block;
                      font-size: 11px;
                      color: #6c757d;
                      margin-top: 2px;
                    }

                    .enhanced-heatmap-grid {
                      display: flex;
                      flex-direction: column;
                      gap: 8px;
                    }

                    .enhanced-heatmap-row {
                      display: grid;
                      grid-template-columns: 200px repeat(5, 1fr);
                      gap: 2px;
                      align-items: center;
                    }

                    .enhanced-heatmap-row.batch-total {
                      margin-top: 15px;
                      padding-top: 15px;
                      border-top: 3px solid #007bff;
                    }

                    .enhanced-subject-label.total-label {
                      background: linear-gradient(
                        135deg,
                        #e3f2fd 0%,
                        #bbdefb 100%
                      );
                      border-left: 4px solid #1976d2;
                      font-weight: bold;
                    }

                    .enhanced-heatmap-cell.total-cell {
                      background: linear-gradient(
                        135deg,
                        #fff3e0 0%,
                        #ffcc02 100%
                      );
                      border: 3px solid #ff8f00;
                      font-weight: bold;
                      font-size: 18px;
                    }

                    .enhanced-subject-label {
                      background: #fff;
                      padding: 15px;
                      border-radius: 8px;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                      border-left: 4px solid #007bff;
                    }

                    .subject-name {
                      display: block;
                      font-weight: bold;
                      color: #495057;
                      font-size: 14px;
                    }

                    .subject-code {
                      display: block;
                      font-size: 12px;
                      color: #6c757d;
                      margin-top: 2px;
                    }

                    .enhanced-heatmap-cell {
                      background: #fff;
                      padding: 12px;
                      border-radius: 8px;
                      text-align: center;
                      position: relative;
                      cursor: pointer;
                      transition: all 0.3s ease;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      gap: 4px;
                    }

                    .enhanced-heatmap-cell:hover {
                      transform: translateY(-2px);
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    }

                    .enhanced-heatmap-cell.strength {
                      background: linear-gradient(
                        135deg,
                        #d4edda 0%,
                        #c3e6cb 100%
                      );
                      border-left: 4px solid #28a745;
                    }

                    .enhanced-heatmap-cell.average {
                      background: linear-gradient(
                        135deg,
                        #fff3cd 0%,
                        #ffeaa7 100%
                      );
                      border-left: 4px solid #ffc107;
                    }

                    .enhanced-heatmap-cell.weakness {
                      background: linear-gradient(
                        135deg,
                        #f8d7da 0%,
                        #f5c6cb 100%
                      );
                      border-left: 4px solid #dc3545;
                    }

                    .enhanced-heatmap-cell.overall {
                      border: 2px solid #007bff;
                      font-weight: bold;
                    }

                    .cell-value {
                      font-size: 16px;
                      font-weight: bold;
                      color: #495057;
                    }

                    .cell-icon {
                      font-size: 14px;
                    }

                    .trend-indicator {
                      font-size: 12px;
                      color: #6c757d;
                    }

                    .enhanced-heatmap-legend {
                      display: grid;
                      grid-template-columns: repeat(
                        auto-fit,
                        minmax(300px, 1fr)
                      );
                      gap: 20px;
                      margin-top: 30px;
                      padding: 20px;
                      background: #fff;
                      border-radius: 12px;
                      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }

                    .legend-section h5 {
                      margin: 0 0 15px 0;
                      color: #495057;
                      font-size: 16px;
                      border-bottom: 2px solid #e9ecef;
                      padding-bottom: 8px;
                    }

                    .legend-items {
                      display: flex;
                      flex-direction: column;
                      gap: 10px;
                    }

                    .legend-item {
                      display: flex;
                      align-items: center;
                      gap: 12px;
                    }

                    .legend-color {
                      width: 20px;
                      height: 20px;
                      border-radius: 4px;
                      flex-shrink: 0;
                    }

                    .legend-color.strength {
                      background: linear-gradient(135deg, #28a745, #20c997);
                    }

                    .legend-color.average {
                      background: linear-gradient(135deg, #ffc107, #fd7e14);
                    }

                    .legend-color.weakness {
                      background: linear-gradient(135deg, #dc3545, #e74c3c);
                    }

                    .legend-text {
                      display: flex;
                      flex-direction: column;
                    }

                    .legend-title {
                      font-weight: bold;
                      color: #495057;
                      font-size: 14px;
                    }

                    .legend-desc {
                      font-size: 12px;
                      color: #6c757d;
                    }

                    .outcome-explanations {
                      display: flex;
                      flex-direction: column;
                      gap: 8px;
                    }

                    .outcome-explanation {
                      font-size: 13px;
                      color: #495057;
                      line-height: 1.4;
                    }

                    .insights-summary {
                      display: flex;
                      flex-direction: column;
                      gap: 10px;
                    }

                    .insight-item {
                      display: flex;
                      align-items: center;
                      gap: 10px;
                      padding: 10px;
                      border-radius: 6px;
                      font-size: 13px;
                    }

                    .insight-item.critical {
                      background: #fff5f5;
                      border-left: 4px solid #dc3545;
                    }

                    .insight-item.positive {
                      background: #f0fff4;
                      border-left: 4px solid #28a745;
                    }

                    .insight-item.recommendation {
                      background: #f8f9ff;
                      border-left: 4px solid #007bff;
                    }

                    .insight-icon {
                      font-size: 16px;
                      flex-shrink: 0;
                    }
                  `}</style>

                  {includeRecommendations && (
                    <div className="preview-recommendations">
                      <h4>💡 Strategic Recommendations</h4>
                      <ul className="recommendations-list">
                        {stats.averages.curricular < 50 && (
                          <li>
                            Implement additional academic support sessions to
                            improve curricular performance.
                          </li>
                        )}
                        {stats.averages.coCurricular < 50 && (
                          <li>
                            Organize more technical workshops and encourage
                            participation in co-curricular activities.
                          </li>
                        )}
                        {stats.averages.extraCurricular < 50 && (
                          <li>
                            Create more opportunities for students to engage in
                            extra-curricular activities.
                          </li>
                        )}
                        {Object.values(stats.averages).every(
                          (val) => val >= 50
                        ) && (
                            <li>
                              Maintain the current balance of activities while
                              focusing on areas of individual improvement.
                            </li>
                          )}
                        <li>
                          Consider peer mentoring programs where top performers
                          can guide students who need improvement.
                        </li>
                        <li>
                          Focus curriculum revision on subjects showing
                          consistent underperformance in outcome analysis.
                        </li>
                        <li>
                          Implement targeted interventions for students in the
                          "Apply" and "Analyze" Bloom's taxonomy levels.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="batch-report-modal-footer">
          <div className="format-selector">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              disabled={generatingPdf}
            >
              <option value="pdf">PDF Report</option>
              <option value="excel">Excel Report</option>
              <option value="powerpoint">PowerPoint</option>
            </select>
          </div>
          <div className="action-buttons">
            <button
              className="btn-cancel"
              onClick={onClose}
              disabled={generatingPdf}
            >
              Cancel
            </button>
            <button
              className="btn-generate"
              onClick={handleGenerateReport}
              disabled={
                !Object.values(selectedCharts).some(Boolean) || generatingPdf
              }
            >
              {generatingPdf ? (
                <span className="generating-label">
                  Generating {format.toUpperCase()}...
                </span>
              ) : (
                <>
                  <Download size={16} className="download-icon" />
                  Generate {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
