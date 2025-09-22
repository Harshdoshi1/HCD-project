import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// Import jsPDF correctly
import jsPDF from "jspdf";
// Import autotable plugin
import autoTable from "jspdf-autotable";
// Import Chart.js
import Chart from "chart.js/auto";
// Import email service
import emailService from "../../../services/emailService";
import "./ReportGeneratorModal.css";
import { buildUrl } from "../../../utils/apiConfig";

const ReportGeneratorModal = ({
  student,
  onClose,
  semesterPoints,
  academicDetails,
  activityList,
  categoryData,
  performanceInsights,
  chartData,
}) => {
  // Store cached activities by semester
  const [cachedActivities, setCachedActivities] = useState({});
  // Create refs for chart canvases
  const performanceTrendsChartRef = useRef(null);
  const performanceTrendsChartInstance = useRef(null);
  const [selectedOptions, setSelectedOptions] = useState({
    performanceTrends: true,
    activityList: true,
    performanceBreakdown: true,
    performanceInsights: true,
    academicDetails: true,
  });

  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  // Simply use student.batch directly as it's displayed in StudentAnalysis.jsx
  const [batchName, setBatchName] = useState(student.batch || "N/A");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    email: student.email || "",
    subject: "Student Performance Report",
    description: "",
  });

  // State for semesters, subjects, and marks
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [subjectsBySemester, setSubjectsBySemester] = useState({});
  const [studentMarks, setStudentMarks] = useState({});
  const [studentCPIs, setStudentCPIs] = useState([]);

  // Fixed universe of categories for Diversity (exactly 6)
  const getFixedCategories = () => [
    'Technical',
    'Non-Technical',
    'Sports',
    'Cultural',
    'Research',
    'Leadership'
  ];

  // Helper: compute diversity stats and category points for a given semester
  const computeDiversityForSemester = (semester) => {
    // Prefer fetched/processed activities for this semester
    let semActivities = [];
    if (cachedActivities && cachedActivities[semester]) {
      semActivities = cachedActivities[semester];
    } else if (activityList && activityList.length > 0) {
      semActivities = activityList.filter(a => a.semester === semester);
    }

    // Points per category
    const categoryPoints = {};
    semActivities.forEach(a => {
      const rawCat = a?.category || a?.eventCategory || 'Other';
      // Map raw categories into fixed buckets if possible
      let cat = rawCat;
      const normalized = String(rawCat).toLowerCase();
      if (normalized.includes('tech')) cat = 'Technical';
      else if (normalized.includes('non') || normalized.includes('soft') || normalized.includes('management')) cat = 'Non-Technical';
      else if (normalized.includes('sport') || normalized.includes('game')) cat = 'Sports';
      else if (normalized.includes('cult') || normalized.includes('dance') || normalized.includes('music') || normalized.includes('art')) cat = 'Cultural';
      else if (normalized.includes('research') || normalized.includes('paper') || normalized.includes('publication')) cat = 'Research';
      else if (normalized.includes('leader') || normalized.includes('organizer') || normalized.includes('captain')) cat = 'Leadership';
      const pts = typeof a?.points === 'number'
        ? a.points
        : (parseInt(a?.coCurricularPoints || 0) + parseInt(a?.extraCurricularPoints || 0));
      categoryPoints[cat] = (categoryPoints[cat] || 0) + (isNaN(pts) ? 0 : pts);
    });

    // Build labels/values for the fixed universe (ensure exactly 6 categories)
    const labels = getFixedCategories();
    const values = labels.map(l => categoryPoints[l] || 0);

    const totalCats = labels.length;
    const exploredCats = values.filter(v => v > 0).length;
    const diversityScore = totalCats > 0 ? Math.round((exploredCats / totalCats) * 100) : 0;

    // Sorted entries for textual output (desc by points, but only from fixed labels)
    const entries = labels
      .map((l) => [l, categoryPoints[l] || 0])
      .sort((a, b) => b[1] - a[1]);

    return { totalCats, exploredCats, diversityScore, entries, labels, values };
  };

  // Offscreen Chart.js doughnut renderer -> returns dataURL and intrinsic size
  const renderDiversityPie = (labels, values) => {
    if (!labels || !values || labels.length === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 500;
    canvas.style.position = 'absolute';
    canvas.style.left = '-9999px';
    canvas.style.top = '-9999px';
    document.body.appendChild(canvas);

    const palette = ['#3674B5', '#00C49F', '#FFBB28', '#FF8042', '#8E44AD', '#2ECC71'];

    const chart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map((_, i) => palette[i % palette.length]),
          borderWidth: 1,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: false,
        animation: false,
        plugins: { legend: { position: 'right' }, title: { display: false } },
        cutout: '55%'
      }
    });

    chart.update();
    const url = chart.toBase64Image();
    chart.destroy();
    document.body.removeChild(canvas);
    return { url, width: 800, height: 500 };
  };

  // Fetch available semesters for the student's batch
  useEffect(() => {
    const fetchSemestersForBatch = async () => {
      if (!student || !student.batchId) {
        console.log("Missing student batch information");
        return;
      }

      try {
        console.log(`Fetching semesters for batch: ${student.batchId}`);
        const response = await axios.get(
          buildUrl(`/semesters/batch/${student.batchId}`)
        );

        if (response.data && Array.isArray(response.data)) {
          // Sort semesters by semester number
          const sortedSemesters = response.data.sort(
            (a, b) => a.semesterNumber - b.semesterNumber
          );
          console.log("Available semesters:", sortedSemesters);
          setAvailableSemesters(sortedSemesters);
        } else {
          console.warn(
            "Unexpected response format for semesters:",
            response.data
          );
          setAvailableSemesters([]);
        }
      } catch (err) {
        console.error("Error fetching semesters for batch:", err);
        setAvailableSemesters([]);
      }
    };

    fetchSemestersForBatch();
  }, [student]);

  // Fetch student CPI/SPI data
  useEffect(() => {
    const fetchStudentCPI = async () => {
      if (!student || !student.rollNo) {
        console.log("Missing student enrollment information");
        return;
      }

      try {
        console.log(`Fetching CPI/SPI data for student: ${student.rollNo}`);
        // Use the controller endpoint we examined in studentCPIController.js
        const response = await axios.get(
          buildUrl(`/student-cpi/enrollment/${student.rollNo}`)
        );

        if (response.data && Array.isArray(response.data)) {
          console.log("Student CPI/SPI data:", response.data);
          setStudentCPIs(response.data);
        } else {
          console.warn(
            "Unexpected response format for student CPI/SPI:",
            response.data
          );
          setStudentCPIs([]);
        }
      } catch (err) {
        console.error("Error fetching student CPI/SPI data:", err);
        setStudentCPIs([]);
      }
    };

    fetchStudentCPI();
  }, [student]);

  // Function to fetch subjects for a semester
  const fetchSubjectsForSemester = async (batchId, semesterId) => {
    if (!batchId || !semesterId) return [];

    try {
      console.log(
        `Fetching subjects for batch ${batchId}, semester ${semesterId}`
      );
      const response = await axios.get(
        buildUrl(`/subjects/batch/${batchId}/semester/${semesterId}`)
      );

      if (response.data && Array.isArray(response.data)) {
        console.log(`Subjects for semester ${semesterId}:`, response.data);
        return response.data;
      } else {
        console.warn(`No subjects found for semester ${semesterId}`);
        return [];
      }
    } catch (err) {
      console.error(`Error fetching subjects for semester ${semesterId}:`, err);
      return [];
    }
  };

  // Function to fetch marks for a student and subject
  const fetchMarksForSubject = async (studentId, subjectCode) => {
    if (!studentId || !subjectCode) return null;

    try {
      console.log(
        `Fetching marks for student ${studentId}, subject ${subjectCode}`
      );
      const response = await axios.get(
        buildUrl(`/marks/student/${studentId}/subject/${subjectCode}`)
      );

      if (response.data) {
        console.log(
          `Marks for student ${studentId}, subject ${subjectCode}:`,
          response.data
        );
        return response.data;
      } else {
        console.warn(
          `No marks found for student ${studentId}, subject ${subjectCode}`
        );
        return null;
      }
    } catch (err) {
      console.error(
        `Error fetching marks for student ${studentId}, subject ${subjectCode}:`,
        err
      );
      return null;
    }
  };

  // Prepare academic data for a semester - This function will always fetch fresh data for each semester
  const prepareAcademicData = async (semester) => {
    console.log(`Preparing academic data for semester ${semester}`);

    try {
      // Directly fetch academic details from the API for this specific semester
      const response = await axios.get(
        buildUrl(
          `/academic-details/student/${student.rollNo}/semester/${semester}`
        )
      );

      if (!response.data || !response.data.success) {
        console.warn(`No academic data found for semester ${semester}`);
        return null;
      }

      console.log(
        `Successfully fetched academic details for semester ${semester}:`,
        response.data
      );
      return response.data.data;
    } catch (error) {
      console.error(
        `Error fetching academic data for semester ${semester}:`,
        error
      );
      return null;
    }
  };

  // Create the performance trends chart
  useEffect(() => {
    if (
      performanceTrendsChartRef.current &&
      chartData &&
      chartData.length > 0
    ) {
      // Destroy previous chart instance if it exists
      if (performanceTrendsChartInstance.current) {
        performanceTrendsChartInstance.current.destroy();
      }

      const ctx = performanceTrendsChartRef.current.getContext("2d");

      // Sort chart data by semester
      const sortedData = [...chartData].sort((a, b) => a.semester - b.semester);

      // Extract labels and datasets
      const labels = sortedData.map((item) => `Sem ${item.semester}`);
      const coCurricularData = sortedData.map((item) => item.coCurricular);
      const extraCurricularData = sortedData.map(
        (item) => item.extraCurricular
      );

      // Create chart
      performanceTrendsChartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Co-Curricular",
              data: coCurricularData,
              borderColor: "#00C49F",
              backgroundColor: "rgba(0, 196, 159, 0.1)",
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
            {
              label: "Extra-Curricular",
              data: extraCurricularData,
              borderColor: "#FFBB28",
              backgroundColor: "rgba(255, 187, 40, 0.1)",
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Performance Trends Across Semesters",
              font: {
                size: 16,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Points",
              },
            },
            x: {
              title: {
                display: true,
                text: "Semester",
              },
            },
          },
        },
      });
    }
  }, [chartData]);

  // Initialize selected semesters with all available semesters
  useEffect(() => {
    if (semesterPoints && semesterPoints.length > 0) {
      const semesterNumbers = semesterPoints.map((point) => point.semester);
      setSelectedSemesters(semesterNumbers);
    }
  }, [semesterPoints]);

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleSemesterChange = (semester) => {
    setSelectedSemesters((prev) => {
      if (prev.includes(semester)) {
        return prev.filter((sem) => sem !== semester);
      } else {
        return [...prev, semester];
      }
    });
  };

  const selectAllSemesters = () => {
    if (semesterPoints && semesterPoints.length > 0) {
      const allSemesters = semesterPoints.map((point) => point.semester);
      setSelectedSemesters(allSemesters);
    }
  };

  const deselectAllSemesters = () => {
    setSelectedSemesters([]);
  };

  const toggleEmailForm = () => {
    setShowEmailForm((prev) => !prev);
  };

  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendEmail = async () => {
    if (isSendingEmail) return;

    try {
      setIsSendingEmail(true);

      // Use the full PDF generation function instead of the simplified email version
      // to ensure all content is included in the email PDF
      let pdfDoc = await generatePDF(true);
      // Guard: ensure we actually received a jsPDF instance
      if (!pdfDoc || typeof pdfDoc.output !== 'function') {
        // Try a dedicated email generator if present
        if (typeof generatePDFForEmail === 'function') {
          pdfDoc = await generatePDFForEmail();
        }
      }
      if (!pdfDoc || typeof pdfDoc.output !== 'function') {
        throw new Error('Failed to generate PDF document for email.');
      }
      const pdfBlob = pdfDoc.output('blob');

      // Send the email with the PDF attachment
      const response = await emailService.sendEmailWithPdf(emailData, pdfBlob);

      // Show success message
      alert(response.message || "Email sent successfully!");
      setShowEmailForm(false);
    } catch (error) {
      console.error("Error sending email:", error);
      alert(error.message || "Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Generate PDF for email without displaying it
  // Helper function to add academic abbreviation explanations
  const addAcademicAbbreviations = (doc, yPos, pageWidth) => {
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(
      "ESE: End Semester Exam | CSE: Continuous Semester Evaluation | IA: Internal Assessment | TW: Term Work | Viva: Viva Voce",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    return yPos + 10;
  };

  // Helper function to fetch academic data for a semester
  const fetchSemesterAcademicData = async (semester) => {
    try {
      return await prepareAcademicData(semester);
    } catch (error) {
      console.error(
        `Error fetching academic data for semester ${semester}:`,
        error
      );
      return null;
    }
  };

  const generatePDFForEmail = async () => {
    if (selectedSemesters.length === 0) {
      throw new Error("Please select at least one semester");
    }

    // Create a new PDF document
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Function to add a new page
    const addNewPage = () => {
      doc.addPage();
      yPos = 20;
    };

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(10, 36, 99); // #0A2463
    doc.text("Student Performance Report", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 10;

    // Add student details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${student.name || "N/A"}`, 20, yPos);
    yPos += 7;
    doc.text(`Enrollment Number: ${student.rollNo || "N/A"}`, 20, yPos);
    yPos += 7;
    doc.text(`Batch: ${batchName}`, 20, yPos);
    yPos += 7;
    doc.text(
      `Department: ICT - Information and Communication Technology`,
      20,
      yPos
    );
    yPos += 7;
    doc.text(`Current Semester: ${student.semester || "N/A"}`, 20, yPos);
    yPos += 7;

    // Add date of generation
    const today = new Date();
    doc.text(`Report Generated: ${today.toLocaleDateString()}`, 20, yPos);
    yPos += 15;

    // Add a divider
    doc.setDrawColor(54, 116, 181); // #3674B5
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 15;

    // Add selected semesters
    doc.setFontSize(12);
    doc.text(
      `Selected Semesters: ${selectedSemesters
        .sort((a, b) => a - b)
        .join(", ")}`,
      20,
      yPos
    );
    yPos += 15;

    // For each selected semester, fetch and add the data
    for (const semester of selectedSemesters.sort((a, b) => a - b)) {
      // Add semester header
      doc.setFontSize(14);
      doc.setTextColor(54, 116, 181); // #3674B5
      doc.text(`Semester ${semester}`, 20, yPos);
      yPos += 10;

      // Check if we need to add a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // 1. Performance Trends (if selected)
      if (
        selectedOptions.performanceTrends &&
        chartData &&
        chartData.length > 0
      ) {
        // Filter chart data for this semester
        const semesterData = chartData.filter(
          (point) => point.semester <= semester
        );

        if (semesterData.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text("Performance Trends", 20, yPos);
          yPos += 7;

          // Sort data by semester
          const sortedData = [...semesterData].sort(
            (a, b) => a.semester - b.semester
          );

          // Create a visually appealing representation of the data
          doc.setFontSize(14);
          doc.setTextColor(54, 116, 181); // #3674B5
          doc.text("Performance Trends Chart", pageWidth / 2, yPos, {
            align: "center",
          });
          yPos += 15;

          // Draw chart axes
          const chartStartX = 50;
          const chartEndX = pageWidth - 50;
          const chartStartY = yPos;
          const chartEndY = yPos + 120;
          const chartWidth = chartEndX - chartStartX;
          const chartHeight = chartEndY - chartStartY;

          // Draw axes
          doc.setDrawColor(100, 100, 100);
          doc.setLineWidth(0.5);
          doc.line(chartStartX, chartStartY, chartStartX, chartEndY); // Y-axis
          doc.line(chartStartX, chartEndY, chartEndX, chartEndY); // X-axis

          // Find max value for scaling
          const allValues = sortedData.flatMap((item) => [
            item.coCurricular,
            item.extraCurricular,
          ]);
          const maxValue = Math.max(...allValues, 10); // Ensure at least 10 for scale

          // Draw Y-axis labels and grid lines
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.2);

          const ySteps = 5;
          for (let i = 0; i <= ySteps; i++) {
            const yValue = maxValue * (1 - i / ySteps);
            const y = chartStartY + (i / ySteps) * chartHeight;
            doc.text(yValue.toFixed(0), chartStartX - 10, y + 2);
            doc.line(chartStartX, y, chartEndX, y); // Grid line
          }

          // Draw X-axis labels
          const xStepWidth = chartWidth / (sortedData.length + 1);
          sortedData.forEach((item, index) => {
            const x = chartStartX + (index + 1) * xStepWidth;
            doc.text(`Sem ${item.semester}`, x, chartEndY + 10, {
              align: "center",
            });
          });

          // Plot Co-Curricular data
          doc.setDrawColor(0, 196, 159); // #00C49F
          doc.setFillColor(0, 196, 159);
          doc.setLineWidth(2);

          let prevX, prevY;
          sortedData.forEach((item, index) => {
            const x = chartStartX + (index + 1) * xStepWidth;
            const y = chartEndY - (item.coCurricular / maxValue) * chartHeight;

            // Draw point
            doc.circle(x, y, 3, "F");

            // Connect with line if not first point
            if (index > 0) {
              doc.line(prevX, prevY, x, y);
            }

            prevX = x;
            prevY = y;
          });

          // Plot Extra-Curricular data
          doc.setDrawColor(255, 187, 40); // #FFBB28
          doc.setFillColor(255, 187, 40);
          prevX = undefined;
          prevY = undefined;

          sortedData.forEach((item, index) => {
            const x = chartStartX + (index + 1) * xStepWidth;
            const y =
              chartEndY - (item.extraCurricular / maxValue) * chartHeight;

            // Draw point
            doc.circle(x, y, 3, "F");

            // Connect with line if not first point
            if (index > 0 && prevX !== undefined) {
              doc.line(prevX, prevY, x, y);
            }

            prevX = x;
            prevY = y;
          });

          // Add legend
          yPos = chartEndY + 25;

          // Co-Curricular legend
          doc.setFillColor(0, 196, 159);
          doc.rect(chartStartX, yPos, 10, 10, "F");
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          doc.text("Co-Curricular", chartStartX + 15, yPos + 7);

          // Extra-Curricular legend
          doc.setFillColor(255, 187, 40);
          doc.rect(chartStartX + 100, yPos, 10, 10, "F");
          doc.text("Extra-Curricular", chartStartX + 115, yPos + 7);

          yPos += 40;
        }
      }

      // Check if we need to add a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // 2. Activity List (if selected)
      if (
        selectedOptions.activityList &&
        activityList &&
        activityList.length > 0
      ) {
        const semActivities = activityList.filter(
          (activity) => activity.semester === semester
        );

        if (semActivities.length > 0) {
          // Add activity list section header
          doc.setFontSize(14);
          doc.setTextColor(54, 116, 181);
          doc.text("Activity List", 20, yPos);
          yPos += 10;

          // Create table header with Position and Points columns
          const headers = [["Activity Name", "Type", "Position", "Points"]];

          // Create table data with enhanced format
          const data = semActivities.map((activity) => {
            const totalPoints =
              parseInt(activity.coCurricularPoints || 0) +
              parseInt(activity.extraCurricularPoints || 0);
            const type =
              parseInt(activity.coCurricularPoints || 0) >
                parseInt(activity.extraCurricularPoints || 0)
                ? "co-curricular"
                : "extra-curricular";
            return [
              activity.name || activity.eventName || "N/A",
              type,
              activity.position || "Participant",
              totalPoints.toString(),
            ];
          });

          // Add table
          autoTable(doc, {
            head: headers,
            body: data,
            startY: yPos,
            theme: "grid",
            headStyles: {
              fillColor: [54, 116, 181],
              textColor: 255,
              fontStyle: "bold",
            },
            alternateRowStyles: {
              fillColor: [240, 240, 240],
            },
          });

          // Update yPos after table
          yPos = doc.lastAutoTable.finalY + 15;
        }
      }

      // Check if we need to add a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // 3. Performance Breakdown (if selected)
      if (
        selectedOptions.performanceBreakdown &&
        categoryData &&
        categoryData.length > 0
      ) {
        const semesterPoint = semesterPoints.find(
          (point) => point.semester === semester
        );

        if (semesterPoint) {
          // Add performance breakdown section header
          doc.setFontSize(14);
          doc.setTextColor(54, 116, 181);
          doc.text("Performance Breakdown", 20, yPos);
          yPos += 10;

          // Calculate totals and percentages
          const coPoints = parseInt(semesterPoint.coCurricular || 0);
          const extraPoints = parseInt(semesterPoint.extraCurricular || 0);
          const totalPoints = coPoints + extraPoints;
          const coPercentage =
            totalPoints > 0 ? Math.round((coPoints / totalPoints) * 100) : 0;
          const extraPercentage =
            totalPoints > 0 ? Math.round((extraPoints / totalPoints) * 100) : 0;

          // Create table header for performance breakdown
          const headers = [["Category", "Points", "Percentage"]];

          // Create table data with percentages
          const data = [
            ["Co-Curricular", coPoints.toString(), `${coPercentage}%`],
            ["Extra-Curricular", extraPoints.toString(), `${extraPercentage}%`],
            ["Total", totalPoints.toString(), "100%"],
          ];

          // Add table
          autoTable(doc, {
            head: headers,
            body: data,
            startY: yPos,
            theme: "grid",
            headStyles: {
              fillColor: [54, 116, 181],
              textColor: 255,
              fontStyle: "bold",
            },
            alternateRowStyles: {
              fillColor: [240, 240, 240],
            },
          });

          // Update yPos after table
          yPos = doc.lastAutoTable.finalY + 15;

          // Add category distribution if available
          if (categoryData.some((cat) => cat.semester === semester)) {
            const semCategories = categoryData.filter(
              (cat) => cat.semester === semester
            );

            if (semCategories.length > 0) {
              // Add category header
              doc.text("Category Distribution", 30, yPos);
              yPos += 10;

              // Create table header
              const headers = [
                ["Category", "Co-Curricular", "Extra-Curricular"],
              ];

              // Create table data
              const data = semCategories.map((cat) => [
                cat.category || "N/A",
                cat.coCurricular || "0",
                cat.extraCurricular || "0",
              ]);

              // Add table
              autoTable(doc, {
                head: headers,
                body: data,
                startY: yPos,
                theme: "grid",
                headStyles: {
                  fillColor: [54, 116, 181],
                  textColor: 255,
                  fontStyle: "bold",
                },
                alternateRowStyles: {
                  fillColor: [240, 240, 240],
                },
              });

              // Update yPos after table
              yPos = doc.lastAutoTable.finalY + 15;
            }
          }
        }
      }

      // Check if we need to add a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // 4. Performance Insights (if selected)
      // Only include insights if this semester is specifically selected in the checkbox list
      if (
        selectedOptions.performanceInsights &&
        performanceInsights &&
        performanceInsights.length > 0 &&
        selectedSemesters.includes(semester)
      ) {
        const semInsights = performanceInsights.filter(
          (insight) => insight.semester === semester
        );

        if (semInsights.length > 0) {
          // Add performance insights section header with semester number to clarify
          doc.setFontSize(14);
          doc.setTextColor(54, 116, 181);
          doc.text(`Performance Insights - Semester ${semester}`, 20, yPos);
          yPos += 10;

          // Group insights by type
          const strengthInsights = semInsights.filter(
            (insight) =>
              insight.type === "strength" || insight.category === "strength"
          );
          const improvementInsights = semInsights.filter(
            (insight) =>
              insight.type === "improvement" ||
              insight.category === "improvement"
          );
          const trendInsights = semInsights.filter(
            (insight) =>
              insight.type === "trend" || insight.category === "trend"
          );
          const patternInsights = semInsights.filter(
            (insight) =>
              insight.type === "pattern" || insight.category === "pattern"
          );

          // Add insights with proper categorization
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);

          // Strengths section - only include for selected semesters
          if (
            strengthInsights.length > 0 &&
            selectedSemesters.includes(semester)
          ) {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }

            doc.setFontSize(11);
            doc.setFont(undefined, "bold");
            doc.text(`Strengths - Semester ${semester}:`, 30, yPos);
            doc.setFont(undefined, "normal");
            yPos += 7;

            strengthInsights.forEach((insight) => {
              if (yPos > 250) {
                doc.addPage();
                yPos = 20;
              }

              doc.text(`• ${insight.text}`, 30, yPos);
              yPos += 7;
            });

            yPos += 5;
          }

          // Areas for Improvement section intentionally omitted

          // Participation Pattern section
          if (
            patternInsights.length > 0 &&
            selectedSemesters.includes(semester)
          ) {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }

            doc.setFontSize(11);
            doc.setFont(undefined, "bold");
            doc.text(`Participation Pattern - Semester ${semester}:`, 30, yPos);
            doc.setFont(undefined, "normal");
            yPos += 7;

            patternInsights.forEach((insight) => {
              if (yPos > 250) {
                doc.addPage();
                yPos = 20;
              }

              doc.text(`• ${insight.text}`, 30, yPos);
              yPos += 7;
            });

            yPos += 5;
          }

          // Trend Analysis section
          if (
            trendInsights.length > 0 &&
            selectedSemesters.includes(semester)
          ) {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }

            doc.setFontSize(11);
            doc.setFont(undefined, "bold");
            doc.text(`Trend Analysis - Semester ${semester}:`, 30, yPos);
            doc.setFont(undefined, "normal");
            yPos += 7;

            trendInsights.forEach((insight) => {
              if (yPos > 250) {
                doc.addPage();
                yPos = 20;
              }

              doc.text(`• ${insight.text}`, 30, yPos);
              yPos += 7;
            });

            yPos += 10;
          }

          yPos += 5;
        }
      }

      // Check if we need to add a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // 5. Diversity & Insights (plain text per-category points)
      {
        const { totalCats, exploredCats, diversityScore, entries, labels, values } = computeDiversityForSemester(semester);

        doc.setFontSize(14);
        doc.setTextColor(54, 116, 181);
        doc.text(`Diversity & Insights - Semester ${semester}`, 20, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const expl = 'Analyzes the breadth of student engagement across different activity categories for well-rounded development.';
        const explWrapped = doc.splitTextToSize(expl, pageWidth - 40);
        doc.text(explWrapped, 20, yPos);
        yPos += explWrapped.length * 5 + 4;

        // Pie chart for category distribution (semester-wise)
        const pie = renderDiversityPie(labels, values);
        if (pie && pie.url) {
          const maxWidth = pageWidth - 40;
          const drawW = Math.min(maxWidth, pie.width);
          const drawH = pie.height * (drawW / pie.width);
          if (yPos + drawH > pageHeight - 30) { doc.addPage(); yPos = 20; }
          doc.addImage(pie.url, 'PNG', 20, yPos, drawW, drawH, undefined, 'FAST');
          yPos += drawH + 8;
        }

        doc.text(`Diversity Score: ${diversityScore}%`, 20, yPos);
        yPos += 6;
        const denom = totalCats > 0 ? totalCats : 0;
        doc.text(`${exploredCats} of ${denom} categories explored`, 20, yPos);
        yPos += 8;

        const catLine = entries.length > 0
          ? 'Category Participation: ' + entries.map(([k, v]) => `${k}: ${v}`).join('  |  ')
          : 'Category Participation: No activities found for this semester';
        const catWrapped = doc.splitTextToSize(catLine, pageWidth - 40);
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(catWrapped, 20, yPos);
        yPos += catWrapped.length * 5 + 8;
      }

      // 6. Academic Details (if selected)
      if (selectedOptions.academicDetails) {
        // Fetch the academic details for this semester
        const academicData = await fetchSemesterAcademicData(semester);

        if (
          academicData &&
          academicData.subjects &&
          academicData.subjects.length > 0
        ) {
          // Add academic details section header
          doc.setFontSize(14);
          doc.setTextColor(54, 116, 181);
          doc.text("Academic Details", 20, yPos);
          yPos += 10;

          // Get SPI and CPI data from the academicData
          const spi = academicData.semesterInfo?.spi || "N/A";
          const cpi = academicData.semesterInfo?.cpi || "N/A";

          // Add SPI and CPI information
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.text(`SPI: ${spi}    CPI: ${cpi}`, 30, yPos);
          yPos += 10;

          // Create comprehensive table header with detailed evaluation components
          const headers = [
            [
              "Subject Code",
              "Subject Name",
              "ESE",
              "CSE",
              "IA",
              "TW",
              "Viva",
              "Grade",
            ],
          ];

          // Create table data with all evaluation components from the fetched academicData
          const data = academicData.subjects.map((subject) => [
            subject.subjectCode || "N/A",
            subject.subjectName || "N/A",
            subject.ese || "-",
            subject.cse || "-",
            subject.ia || "-",
            subject.tw || "-",
            subject.viva || "-",
            subject.grade || "-",
          ]);

          // Add table
          autoTable(doc, {
            head: headers,
            body: data,
            startY: yPos,
            theme: "grid",
            headStyles: {
              fillColor: [54, 116, 181],
              textColor: 255,
              fontStyle: "bold",
            },
            alternateRowStyles: {
              fillColor: [240, 240, 240],
            },
            // No need for didDrawPage anymore since we're including subject name directly in the table
          });

          // Update yPos after table
          yPos = doc.lastAutoTable.finalY + 15;
        }
      }

      // Add spacing between semesters
      yPos += 10;

      // Add a divider between semesters
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 20;

      // Check if we need to add a new page for the next semester
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
    }

    return doc;
  };

  const generatePDF = async (forEmail = false) => {
    if (selectedSemesters.length === 0) {
      setError("Please select at least one semester");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create a new PDF document
      const doc = new jsPDF();
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Function to add a new page
      const addNewPage = () => {
        doc.addPage();
        yPos = 20;
      };

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(10, 36, 99); // #0A2463
      doc.text("Student Performance Report", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 10;

      // Add student details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${student.name || "N/A"}`, 20, yPos);
      yPos += 7;
      doc.text(`Enrollment Number: ${student.rollNo || "N/A"}`, 20, yPos);
      yPos += 7;
      doc.text(`Batch: ${batchName}`, 20, yPos);
      yPos += 7;
      doc.text(
        `Department: ICT - Information and Communication Technology`,
        20,
        yPos
      );
      yPos += 7;
      doc.text(`Current Semester: ${student.semester || "N/A"}`, 20, yPos);
      yPos += 7;

      // Add date of generation
      const today = new Date();
      doc.text(`Report Generated: ${today.toLocaleDateString()}`, 20, yPos);
      yPos += 15;

      // Add a divider
      doc.setDrawColor(54, 116, 181); // #3674B5
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 15;

      // For each selected semester, fetch and add the data
      for (const semester of selectedSemesters.sort((a, b) => a - b)) {
        // Add semester header
        doc.setFontSize(14);
        doc.setTextColor(54, 116, 181); // #3674B5
        doc.text(`Semester ${semester}`, 20, yPos);
        yPos += 10;

        // Check if we need to add a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // 1. Performance Trends (if selected)
        if (
          selectedOptions.performanceTrends &&
          chartData &&
          chartData.length > 0
        ) {
          // Filter chart data for this semester
          const semesterData = chartData.filter(
            (point) => point.semester <= semester
          );

          if (semesterData.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Performance Trends", 20, yPos);
            yPos += 7;

            // Sort data by semester
            const sortedData = [...semesterData].sort(
              (a, b) => a.semester - b.semester
            );

            // Create a visually appealing representation of the data
            doc.setFontSize(14);
            doc.setTextColor(54, 116, 181); // #3674B5
            doc.text("Performance Trends Chart", pageWidth / 2, yPos, {
              align: "center",
            });
            yPos += 15;

            // Draw chart axes
            const chartStartX = 50;
            const chartEndX = pageWidth - 50;
            const chartStartY = yPos;
            const chartEndY = yPos + 120;
            const chartWidth = chartEndX - chartStartX;
            const chartHeight = chartEndY - chartStartY;

            // Draw axes
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(0.5);
            doc.line(chartStartX, chartStartY, chartStartX, chartEndY); // Y-axis
            doc.line(chartStartX, chartEndY, chartEndX, chartEndY); // X-axis

            // Find max value for scaling
            const allValues = sortedData.flatMap((item) => [
              item.coCurricular,
              item.extraCurricular,
            ]);
            const maxValue = Math.max(...allValues, 10); // Ensure at least 10 for scale

            // Draw Y-axis labels and grid lines
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);

            const ySteps = 5;
            for (let i = 0; i <= ySteps; i++) {
              const yValue = maxValue * (1 - i / ySteps);
              const y = chartStartY + (i / ySteps) * chartHeight;
              doc.text(yValue.toFixed(0), chartStartX - 10, y + 2);
              doc.line(chartStartX, y, chartEndX, y); // Grid line
            }

            // Draw X-axis labels
            const xStepWidth = chartWidth / (sortedData.length + 1);
            sortedData.forEach((item, index) => {
              const x = chartStartX + (index + 1) * xStepWidth;
              doc.text(`Sem ${item.semester}`, x, chartEndY + 10, {
                align: "center",
              });
            });

            // Plot Co-Curricular data
            doc.setDrawColor(0, 196, 159); // #00C49F
            doc.setFillColor(0, 196, 159);
            doc.setLineWidth(2);

            let prevX, prevY;
            sortedData.forEach((item, index) => {
              const x = chartStartX + (index + 1) * xStepWidth;
              const y =
                chartEndY - (item.coCurricular / maxValue) * chartHeight;

              // Draw point
              doc.circle(x, y, 3, "F");

              // Connect with line if not first point
              if (index > 0) {
                doc.line(prevX, prevY, x, y);
              }

              prevX = x;
              prevY = y;
            });

            // Plot Extra-Curricular data
            doc.setDrawColor(255, 187, 40); // #FFBB28
            doc.setFillColor(255, 187, 40);

            sortedData.forEach((item, index) => {
              const x = chartStartX + (index + 1) * xStepWidth;
              const y =
                chartEndY - (item.extraCurricular / maxValue) * chartHeight;

              // Draw point
              doc.circle(x, y, 3, "F");

              // Connect with line if not first point
              if (index > 0) {
                doc.line(prevX, prevY, x, y);
              }

              prevX = x;
              prevY = y;
            });

            // Add legend
            yPos = chartEndY + 25;

            // Co-Curricular legend
            doc.setFillColor(0, 196, 159);
            doc.rect(chartStartX, yPos, 10, 10, "F");
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text("Co-Curricular", chartStartX + 15, yPos + 7);

            // Extra-Curricular legend
            doc.setFillColor(255, 187, 40);
            doc.rect(chartStartX + 100, yPos, 10, 10, "F");
            doc.text("Extra-Curricular", chartStartX + 115, yPos + 7);

            yPos += 40;
          }
        }

        // Check if we need to add a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // 2. Activity List (if selected)
        if (selectedOptions.activityList) {
          // We need to fetch activities for this specific semester
          try {
            // Check if we have cached activities for this semester
            let semesterActivities = [];

            if (cachedActivities[semester]) {
              console.log(`Using cached activities for semester ${semester}`);
              semesterActivities = cachedActivities[semester];
            } else {
              // Always fetch activities for the specific semester
              // This ensures we get the correct activities for each semester, regardless of which is selected in the Student Analysis model
              console.log(`Fetching activities for semester ${semester}...`);
              // Make the API call to fetch activities - using the same approach as StudentAnalysis component
              try {
                console.log(
                  `Fetching activities for semester ${semester} - Step 1: Get event IDs`
                );

                // Step 1: Fetch events by enrollment and semester
                const response = await axios.post(
                  buildUrl("/events/fetchEventsbyEnrollandSemester"),
                  {
                    enrollmentNumber: student.rollNo,
                    semester: semester.toString(),
                  }
                );

                console.log(
                  `Response for semester ${semester}:`,
                  response.data
                );

                if (response.data && Array.isArray(response.data)) {
                  // Extract event IDs from the response - exactly like StudentAnalysis does
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

                  console.log(
                    `Extracted event IDs for semester ${semester}:`,
                    eventIds
                  );

                  if (eventIds.length > 0) {
                    // Convert the array of event IDs to a comma-separated string as required by the API
                    const eventIdsString = eventIds.join(",");
                    console.log(
                      `Fetching activities for semester ${semester} - Step 2: Get event details for IDs: ${eventIdsString}`
                    );

                    // Step 2: Fetch event details from EventMaster table
                    const eventDetailsResponse = await axios.post(
                      buildUrl("/events/fetchEventsByIds"),
                      {
                        eventIds: eventIdsString,
                      }
                    );

                    console.log(
                      `Event details response for semester ${semester}:`,
                      eventDetailsResponse.data
                    );

                    if (
                      eventDetailsResponse.data &&
                      eventDetailsResponse.data.success &&
                      Array.isArray(eventDetailsResponse.data.data)
                    ) {
                      // Process event details and create activity list - exactly like StudentAnalysis does
                      semesterActivities = eventDetailsResponse.data.data.map(
                        (event) => ({
                          id: event.id,
                          name: event.eventName || "Unknown Event",
                          position: event.position || "Participant",
                          points: event.points || 0,
                          type: event.eventType || "Unknown Type",
                          category: event.eventCategory || "Unknown Category",
                        })
                      );

                      console.log(
                        `Processed ${semesterActivities.length} activities for semester ${semester}`
                      );

                      // Cache these activities
                      setCachedActivities((prev) => ({
                        ...prev,
                        [semester]: semesterActivities,
                      }));
                    } else {
                      console.warn(
                        `Unexpected event details format for semester ${semester}:`,
                        eventDetailsResponse.data
                      );
                    }
                  } else {
                    console.log(`No event IDs found for semester ${semester}`);
                  }
                } else if (response.data && response.data.message) {
                  console.log(
                    `API message for semester ${semester}: ${response.data.message}`
                  );
                } else {
                  console.warn(
                    `Unexpected response format for semester ${semester}:`,
                    response.data
                  );
                }
              } catch (fetchError) {
                console.error(
                  `Error fetching activities for semester ${semester}:`,
                  fetchError
                );
              }
            }

            if (semesterActivities.length > 0) {
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Activity List", 20, yPos);
              yPos += 7;

              // Create a table for activities
              const activityHeaders = [
                ["Activity Name", "Type", "Position", "Points"],
              ];
              const activityData = semesterActivities.map((activity) => [
                activity.name || "N/A",
                activity.type || "N/A",
                activity.position || "N/A",
                activity.points?.toString() || "0",
              ]);

              autoTable(doc, {
                startY: yPos,
                head: activityHeaders,
                body: activityData,
                theme: "grid",
                headStyles: {
                  fillColor: [54, 116, 181],
                  textColor: [255, 255, 255],
                },
                margin: { left: 20, right: 20 },
              });

              yPos = doc.lastAutoTable.finalY + 10;
            } else {
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text(
                "Activity List: No activities found for this semester",
                20,
                yPos
              );
              yPos += 10;
            }
          } catch (err) {
            console.error(
              `Error fetching activities for semester ${semester}:`,
              err
            );
            doc.setFontSize(12);
            doc.setTextColor(255, 0, 0);
            doc.text(
              `Error fetching activities for semester ${semester}`,
              20,
              yPos
            );
            yPos += 10;
          }
        }

        // Check if we need to add a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // 3. Performance Breakdown (if selected)
        if (selectedOptions.performanceBreakdown) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text("Performance Breakdown", 20, yPos);
          yPos += 7;

          // Calculate breakdown based on total points (co-curricular + extra-curricular)
          // Get the data for the current semester
          const semesterData = chartData.find(
            (data) => data.semester === semester
          ) || { coCurricular: 0, extraCurricular: 0 };

          // Calculate total points
          const totalPoints =
            semesterData.coCurricular + semesterData.extraCurricular;
          console.log(`Total points for semester ${semester}: ${totalPoints}`);

          // Calculate percentages
          let coCurricularPercentage = 0;
          let extraCurricularPercentage = 0;

          if (totalPoints > 0) {
            coCurricularPercentage = Math.round(
              (semesterData.coCurricular / totalPoints) * 100
            );
            extraCurricularPercentage = Math.round(
              (semesterData.extraCurricular / totalPoints) * 100
            );

            // Adjust to ensure they add up to 100%
            if (coCurricularPercentage + extraCurricularPercentage !== 100) {
              // If rounding caused the sum to not be 100, adjust the larger value
              if (semesterData.coCurricular > semesterData.extraCurricular) {
                coCurricularPercentage = 100 - extraCurricularPercentage;
              } else {
                extraCurricularPercentage = 100 - coCurricularPercentage;
              }
            }
          }

          console.log(
            `Breakdown for semester ${semester}: Co-Curricular: ${coCurricularPercentage}%, Extra-Curricular: ${extraCurricularPercentage}%`
          );

          // Create a table for the category data
          const categoryHeaders = [["Category", "Points", "Percentage"]];
          const categoryTableData = [
            [
              "Co-Curricular",
              semesterData.coCurricular.toString(),
              `${coCurricularPercentage}%`,
            ],
            [
              "Extra-Curricular",
              semesterData.extraCurricular.toString(),
              `${extraCurricularPercentage}%`,
            ],
            ["Total", totalPoints.toString(), "100%"],
          ];

          autoTable(doc, {
            startY: yPos,
            head: categoryHeaders,
            body: categoryTableData,
            theme: "grid",
            headStyles: {
              fillColor: [54, 116, 181],
              textColor: [255, 255, 255],
            },
            margin: { left: 20, right: 20 },
          });

          yPos = doc.lastAutoTable.finalY + 10;
        }

        // Check if we need to add a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // 4. Performance Insights (if selected)
        if (selectedOptions.performanceInsights && performanceInsights) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text("Performance Insights", 20, yPos);
          yPos += 7;

          // Strengths
          if (
            performanceInsights.strengths &&
            performanceInsights.strengths.length > 0
          ) {
            doc.setFontSize(11);
            doc.text("Strengths:", 20, yPos);
            yPos += 5;

            performanceInsights.strengths.forEach((strength) => {
              doc.text(
                `• ${strength.category}: ${strength.points} points`,
                25,
                yPos
              );
              yPos += 5;
            });
            yPos += 5;
          }

          // Areas for Improvement section intentionally omitted

          // Participation Pattern
          if (performanceInsights.participationPattern) {
            doc.setFontSize(11);
            doc.text("Participation Pattern:", 20, yPos);
            yPos += 5;

            // Split long text into multiple lines
            const pattern = performanceInsights.participationPattern;
            const splitText = doc.splitTextToSize(pattern, pageWidth - 40);
            doc.text(splitText, 25, yPos);
            yPos += splitText.length * 5 + 5;
          }

          // Trend Analysis
          if (performanceInsights.trendAnalysis) {
            doc.setFontSize(11);
            doc.text("Trend Analysis:", 20, yPos);
            yPos += 5;

            // Split long text into multiple lines
            const trend = performanceInsights.trendAnalysis;
            const splitText = doc.splitTextToSize(trend, pageWidth - 40);
            doc.text(splitText, 25, yPos);
            yPos += splitText.length * 5 + 5;
          }
        }

        // Check if we need to add a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // 5. Diversity & Insights (plain text per-category points)
        {
          const { totalCats, exploredCats, diversityScore, entries } = computeDiversityForSemester(semester);

          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Diversity & Insights - Semester ${semester}`, 20, yPos);
          yPos += 6;

          const expl2 = 'Analyzes the breadth of student engagement across different activity categories for well-rounded development.';
          const explWrapped2 = doc.splitTextToSize(expl2, pageWidth - 40);
          doc.text(explWrapped2, 20, yPos);
          yPos += explWrapped2.length * 5 + 4;

          // Pie chart for category distribution (semester-wise)
          const pie2 = renderDiversityPie(labels, values);
          if (pie2 && pie2.url) {
            const maxWidth2 = pageWidth - 40;
            const drawW2 = Math.min(maxWidth2, pie2.width);
            const drawH2 = pie2.height * (drawW2 / pie2.width);
            if (yPos + drawH2 > pageHeight - 30) { doc.addPage(); yPos = 20; }
            doc.addImage(pie2.url, 'PNG', 20, yPos, drawW2, drawH2, undefined, 'FAST');
            yPos += drawH2 + 8;
          }

          doc.setFontSize(11);
          doc.text(`Diversity Score: ${diversityScore}%`, 20, yPos);
          yPos += 6;
          const denom2 = totalCats > 0 ? totalCats : 0;
          doc.text(`${exploredCats} of ${denom2} categories explored`, 20, yPos);
          yPos += 8;

          const catLine2 = entries.length > 0
            ? 'Category Participation: ' + entries.map(([k, v]) => `${k}: ${v}`).join('  |  ')
            : 'Category Participation: No activities found for this semester';
          const catWrapped2 = doc.splitTextToSize(catLine2, pageWidth - 40);
          doc.setFontSize(10); doc.setTextColor(60, 60, 60);
          doc.text(catWrapped2, 20, yPos);
          yPos += catWrapped2.length * 5 + 8;
        }

        // 6. Academic Details (if selected)
        if (selectedOptions.academicDetails) {
          try {
            // Fetch academic details for this specific semester
            console.log(`Fetching academic details for semester ${semester}`);
            const response = await axios.get(
              buildUrl(
                `/academic-details/student/${student.rollNo}/semester/${semester}`
              )
            );

            let semesterAcademics = null;
            if (response.data && response.data.success) {
              semesterAcademics = response.data.data;
              console.log(
                `Successfully fetched academic details for semester ${semester}`,
                semesterAcademics
              );
            }

            if (
              semesterAcademics &&
              semesterAcademics.subjects &&
              semesterAcademics.subjects.length > 0
            ) {
              // Display academic details for this semester
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text(`Academic Performance - Semester ${semester}`, 20, yPos);
              yPos += 7;

              // Add SPI/CPI if available
              if (semesterAcademics.semesterInfo) {
                doc.text(
                  `SPI: ${semesterAcademics.semesterInfo.spi || "N/A"}   CPI: ${semesterAcademics.semesterInfo.cpi || "N/A"
                  }`,
                  20,
                  yPos
                );
                yPos += 7;
              }

              // Create a table for academic details
              const academicHeaders = [
                ["Subject", "Code", "ESE", "CSE", "IA", "TW", "Viva", "Grade"],
              ];
              const academicData = semesterAcademics.subjects.map((subject) => [
                subject.name || "N/A",
                subject.code || "N/A",
                `${subject.studentMarks.ese || 0}/${subject.componentMarks.ese || 0
                }`,
                `${subject.studentMarks.cse || 0}/${subject.componentMarks.cse || 0
                }`,
                `${subject.studentMarks.ia || 0}/${subject.componentMarks.ia || 0
                }`,
                `${subject.studentMarks.tw || 0}/${subject.componentMarks.tw || 0
                }`,
                `${subject.studentMarks.viva || 0}/${subject.componentMarks.viva || 0
                }`,
                subject.studentMarks.grades || "N/A",
              ]);

              // Add the table to the PDF
              autoTable(doc, {
                startY: yPos,
                head: academicHeaders,
                body: academicData,
                theme: "grid",
                headStyles: {
                  fillColor: [54, 116, 181],
                  textColor: [255, 255, 255],
                },
                margin: { left: 20, right: 20 },
              });

              yPos = doc.lastAutoTable.finalY + 10;

              // Add component legend
              doc.setFontSize(10);
              doc.text(
                "ESE: End Semester Exam | CSE: Continuous Semester Evaluation | IA: Internal Assessment | TW: Term Work | Viva: Viva Voce",
                20,
                yPos,
                { maxWidth: pageWidth - 40 }
              );
              yPos += 10;
            } else {
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text(
                `Academic Details: No academic data available for semester ${semester}`,
                20,
                yPos
              );
              yPos += 10;
            }
          } catch (err) {
            console.error(
              `Error fetching academic details for semester ${semester}:`,
              err
            );
            doc.setFontSize(12);
            doc.setTextColor(255, 0, 0);
            doc.text(
              `Error fetching academic details for semester ${semester}`,
              20,
              yPos
            );
            yPos += 10;
          }
        }

        // Add a divider between semesters
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 15;

        // Add a new page for the next semester if needed
        if (
          yPos > 220 &&
          semester !== selectedSemesters[selectedSemesters.length - 1]
        ) {
          doc.addPage();
          yPos = 20;
        }
      }

      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const footerText =
        "This report is generated by the Student Performance Analysis System";
      doc.text(
        footerText,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );

      // If generating for email, return the document without saving
      if (forEmail) {
        console.log("PDF generated for email successfully");
        setIsGenerating(false);
        return doc;
      }

      // Otherwise save the PDF file
      const filename = `${student.name}_Performance_Report.pdf`.replace(
        /[/\:*?"<>|]/g,
        "_"
      );
      doc.save(filename);

      console.log("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="report-generator-modal" style={{ width: "100%" }}>
      <div className="modal-overlay" style={{ width: "100%" }}>
        <div className="modal-container">
          <div className="modal-header">
            <h2>Generate Student Report</h2>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modal-content">
            {/* Hidden canvas for chart rendering */}
            <canvas
              ref={performanceTrendsChartRef}
              className="hidden-chart-canvas"
              width="600"
              height="300"
            ></canvas>

            <div className="student-info-section">
              <h3>Student Information</h3>
              <div className="student-info">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{student.name || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Enrollment:</span>
                  <span className="info-value">{student.rollNo || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Batch:</span>
                  <span className="info-value">
                    {student.batchName || "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Semester:</span>
                  <span className="info-value">
                    {student.semester || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="report-options-section">
              <h3>Report Content</h3>
              <p className="section-description">
                Select the sections to include in the report:
              </p>

              <div className="options-container">
                <div className="option-item">
                  <input
                    type="checkbox"
                    id="performanceTrends"
                    checked={selectedOptions.performanceTrends}
                    onChange={() => handleOptionChange("performanceTrends")}
                  />
                  <label htmlFor="performanceTrends">
                    Performance Trends Graph
                  </label>
                </div>

                <div className="option-item">
                  <input
                    type="checkbox"
                    id="activityList"
                    checked={selectedOptions.activityList}
                    onChange={() => handleOptionChange("activityList")}
                  />
                  <label htmlFor="activityList">Activity List</label>
                </div>

                <div className="option-item">
                  <input
                    type="checkbox"
                    id="performanceBreakdown"
                    checked={selectedOptions.performanceBreakdown}
                    onChange={() => handleOptionChange("performanceBreakdown")}
                  />
                  <label htmlFor="performanceBreakdown">
                    Current Performance Breakdown
                  </label>
                </div>

                <div className="option-item">
                  <input
                    type="checkbox"
                    id="performanceInsights"
                    checked={selectedOptions.performanceInsights}
                    onChange={() => handleOptionChange("performanceInsights")}
                  />
                  <label htmlFor="performanceInsights">
                    Performance Insights
                  </label>
                </div>

                <div className="option-item">
                  <input
                    type="checkbox"
                    id="academicDetails"
                    checked={selectedOptions.academicDetails}
                    onChange={() => handleOptionChange("academicDetails")}
                  />
                  <label htmlFor="academicDetails">Academic Details</label>
                </div>
              </div>
            </div>

            <div className="semester-selection-section">
              <h3>Semester Selection</h3>
              <p className="section-description">
                Select the semesters to include in the report:
              </p>

              <div className="semester-actions-btns">
                <button className="select-all-btn" onClick={selectAllSemesters}>
                  Select All
                </button>
                <button
                  className="deselect-all-btn"
                  onClick={deselectAllSemesters}
                >
                  Deselect All
                </button>
              </div>

              <div className="semesters-container">
                {semesterPoints && semesterPoints.length > 0 ? (
                  semesterPoints.map((point) => (
                    <div className="semester-item" key={point.semester}>
                      <input
                        type="checkbox"
                        id={`semester-${point.semester}`}
                        checked={selectedSemesters.includes(point.semester)}
                        onChange={() => handleSemesterChange(point.semester)}
                      />
                      <label htmlFor={`semester-${point.semester}`}>
                        Semester {point.semester}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="no-data-message">No semester data available</p>
                )}
              </div>

              {showEmailForm && (
                <div className="email-form-section-send-email">
                  <h3>Send Report via Email</h3>
                  <div className="email-form-send-email">
                    <div className="form-group-send-email">
                      <label htmlFor="email">Email:</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={emailData.email}
                        onChange={handleEmailInputChange}
                        placeholder="Recipient email address"
                        className="input-send-email"
                      />
                    </div>
                    <div className="form-group-send-email">
                      <label htmlFor="subject">Subject:</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={emailData.subject}
                        onChange={handleEmailInputChange}
                        placeholder="Email subject"
                        className="input-send-email"
                      />
                    </div>
                    <div className="form-group-send-email">
                      <label htmlFor="description">Description:</label>
                      <textarea
                        id="description"
                        name="description"
                        value={emailData.description}
                        onChange={handleEmailInputChange}
                        placeholder="Enter email message"
                        rows="4"
                        className="textarea-send-email"
                      ></textarea>
                      <div className="email-buttons-container-send-email">
                        <button
                          className="cancel-email-btn-send-email"
                          onClick={toggleEmailForm}
                        >
                          <i className="fas fa-times"></i> Cancel Email
                        </button>
                        <button
                          className="send-email-btn-send-email"
                          onClick={handleSendEmail}
                          disabled={isSendingEmail}
                        >
                          {isSendingEmail ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>{" "}
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane"></i> Send Email
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="modal-footer">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="send-report-btn"
              onClick={toggleEmailForm}
              disabled={isGenerating || selectedSemesters.length === 0}
            >
              Send Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorModal;
