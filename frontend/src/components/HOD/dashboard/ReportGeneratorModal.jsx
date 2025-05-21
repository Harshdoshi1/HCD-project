import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// Import jsPDF correctly
import jsPDF from 'jspdf';
// Import autotable plugin
import autoTable from 'jspdf-autotable';
// Import Chart.js
import Chart from 'chart.js/auto';
import './ReportGeneratorModal.css';

const ReportGeneratorModal = ({ student, onClose, semesterPoints, academicDetails, activityList, categoryData, performanceInsights, chartData }) => {
  // Create refs for chart canvases
  const performanceTrendsChartRef = useRef(null);
  const performanceTrendsChartInstance = useRef(null);
  const [selectedOptions, setSelectedOptions] = useState({
    performanceTrends: true,
    activityList: true,
    performanceBreakdown: true,
    performanceInsights: true,
    academicDetails: true
  });
  
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Create the performance trends chart
  useEffect(() => {
    if (performanceTrendsChartRef.current && chartData && chartData.length > 0) {
      // Destroy previous chart instance if it exists
      if (performanceTrendsChartInstance.current) {
        performanceTrendsChartInstance.current.destroy();
      }
      
      const ctx = performanceTrendsChartRef.current.getContext('2d');
      
      // Sort chart data by semester
      const sortedData = [...chartData].sort((a, b) => a.semester - b.semester);
      
      // Extract labels and datasets
      const labels = sortedData.map(item => `Sem ${item.semester}`);
      const coCurricularData = sortedData.map(item => item.coCurricular);
      const extraCurricularData = sortedData.map(item => item.extraCurricular);
      
      // Create chart
      performanceTrendsChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Co-Curricular',
              data: coCurricularData,
              borderColor: '#00C49F',
              backgroundColor: 'rgba(0, 196, 159, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 7
            },
            {
              label: 'Extra-Curricular',
              data: extraCurricularData,
              borderColor: '#FFBB28',
              backgroundColor: 'rgba(255, 187, 40, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 7
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Performance Trends Across Semesters',
              font: {
                size: 16
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Points'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Semester'
              }
            }
          }
        }
      });
    }
  }, [chartData]);
  
  // Initialize selected semesters with all available semesters
  useEffect(() => {
    if (semesterPoints && semesterPoints.length > 0) {
      const semesterNumbers = semesterPoints.map(point => point.semester);
      setSelectedSemesters(semesterNumbers);
    }
  }, [semesterPoints]);

  const handleOptionChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleSemesterChange = (semester) => {
    setSelectedSemesters(prev => {
      if (prev.includes(semester)) {
        return prev.filter(sem => sem !== semester);
      } else {
        return [...prev, semester];
      }
    });
  };

  const selectAllSemesters = () => {
    if (semesterPoints && semesterPoints.length > 0) {
      const allSemesters = semesterPoints.map(point => point.semester);
      setSelectedSemesters(allSemesters);
    }
  };

  const deselectAllSemesters = () => {
    setSelectedSemesters([]);
  };

  const generatePDF = async () => {
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
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(10, 36, 99); // #0A2463
      doc.text("Student Performance Report", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      // Add student details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${student.name || 'N/A'}`, 20, yPos);
      yPos += 7;
      doc.text(`Enrollment Number: ${student.rollNo || 'N/A'}`, 20, yPos);
      yPos += 7;
      doc.text(`Batch: ${student.batchName || 'N/A'}`, 20, yPos);
      yPos += 7;
      doc.text(`Current Semester: ${student.semester || 'N/A'}`, 20, yPos);
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
        if (selectedOptions.performanceTrends && chartData && chartData.length > 0) {
          // Filter chart data for this semester
          const semesterData = chartData.filter(point => point.semester <= semester);
          
          if (semesterData.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Performance Trends", 20, yPos);
            yPos += 7;
            
            // Sort data by semester
            const sortedData = [...semesterData].sort((a, b) => a.semester - b.semester);
            
            // Create a visually appealing representation of the data
            doc.setFontSize(14);
            doc.setTextColor(54, 116, 181); // #3674B5
            doc.text("Performance Trends Chart", pageWidth / 2, yPos, { align: "center" });
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
            const allValues = sortedData.flatMap(item => [item.coCurricular, item.extraCurricular]);
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
              doc.text(`Sem ${item.semester}`, x, chartEndY + 10, { align: "center" });
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
              doc.circle(x, y, 3, 'F');
              
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
              const y = chartEndY - (item.extraCurricular / maxValue) * chartHeight;
              
              // Draw point
              doc.circle(x, y, 3, 'F');
              
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
            doc.rect(chartStartX, yPos, 10, 10, 'F');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text('Co-Curricular', chartStartX + 15, yPos + 7);
            
            // Extra-Curricular legend
            doc.setFillColor(255, 187, 40);
            doc.rect(chartStartX + 100, yPos, 10, 10, 'F');
            doc.text('Extra-Curricular', chartStartX + 115, yPos + 7);
            
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
            // Use the existing data if it's for the current semester
            let semesterActivities = [];
            if (activityList && selectedSemesters.includes(semester)) {
              semesterActivities = activityList;
            } else {
              // Otherwise fetch it
              const response = await axios.post('http://localhost:5001/api/events/fetchEventsbyEnrollandSemester', {
                enrollmentNumber: student.rollNo,
                semester: semester.toString()
              });
              
              if (response.data && Array.isArray(response.data)) {
                // Format activities data
                semesterActivities = response.data.flatMap(item => {
                  return (item.activities || []).map(activity => ({
                    name: activity.name,
                    type: activity.type,
                    position: activity.position,
                    points: activity.points
                  }));
                });
              }
            }
            
            if (semesterActivities.length > 0) {
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Activity List", 20, yPos);
              yPos += 7;
              
              // Create a table for activities
              const activityHeaders = [["Activity Name", "Type", "Position", "Points"]];
              const activityData = semesterActivities.map(activity => [
                activity.name || 'N/A',
                activity.type || 'N/A',
                activity.position || 'N/A',
                activity.points?.toString() || '0'
              ]);
              
              autoTable(doc, {
                startY: yPos,
                head: activityHeaders,
                body: activityData,
                theme: 'grid',
                headStyles: { fillColor: [54, 116, 181], textColor: [255, 255, 255] },
                margin: { left: 20, right: 20 }
              });
              
              yPos = doc.lastAutoTable.finalY + 10;
            } else {
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Activity List: No activities found for this semester", 20, yPos);
              yPos += 10;
            }
          } catch (err) {
            console.error(`Error fetching activities for semester ${semester}:`, err);
            doc.setFontSize(12);
            doc.setTextColor(255, 0, 0);
            doc.text(`Error fetching activities for semester ${semester}`, 20, yPos);
            yPos += 10;
          }
        }

        // Check if we need to add a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // 3. Performance Breakdown (if selected)
        if (selectedOptions.performanceBreakdown && categoryData && categoryData.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text("Performance Breakdown", 20, yPos);
          yPos += 7;
          
          // Create a table for the category data
          const categoryHeaders = [["Category", "Percentage"]];
          const categoryTableData = categoryData.map(category => [
            category.name,
            `${Math.round(category.value * 100)}%`
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: categoryHeaders,
            body: categoryTableData,
            theme: 'grid',
            headStyles: { fillColor: [54, 116, 181], textColor: [255, 255, 255] },
            margin: { left: 20, right: 20 }
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
          if (performanceInsights.strengths && performanceInsights.strengths.length > 0) {
            doc.setFontSize(11);
            doc.text("Strengths:", 20, yPos);
            yPos += 5;
            
            performanceInsights.strengths.forEach(strength => {
              doc.text(`• ${strength.category}: ${strength.points} points`, 25, yPos);
              yPos += 5;
            });
            yPos += 5;
          }
          
          // Areas for Improvement
          if (performanceInsights.areasForImprovement && performanceInsights.areasForImprovement.length > 0) {
            doc.setFontSize(11);
            doc.text("Areas for Improvement:", 20, yPos);
            yPos += 5;
            
            performanceInsights.areasForImprovement.forEach(area => {
              doc.text(`• ${area.category}: ${area.points} points`, 25, yPos);
              yPos += 5;
            });
            yPos += 5;
          }
          
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

        // 5. Academic Details (if selected)
        if (selectedOptions.academicDetails) {
          // We need to fetch academic details for this specific semester
          try {
            // Use the existing data if it's for the current semester
            let semesterAcademics = null;
            if (academicDetails && selectedSemesters.includes(semester)) {
              semesterAcademics = academicDetails;
            } else {
              // Otherwise fetch it
              const response = await axios.get(`http://localhost:5001/api/academic-details/student/${student.rollNo}/semester/${semester}`);
              
              if (response.data && response.data.success) {
                semesterAcademics = response.data.data;
              }
            }
            
            if (semesterAcademics && semesterAcademics.subjects && semesterAcademics.subjects.length > 0) {
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Academic Details", 20, yPos);
              yPos += 7;
              
              // Add SPI/CPI if available
              if (semesterAcademics.semesterInfo) {
                doc.text(`SPI: ${semesterAcademics.semesterInfo.spi || 'N/A'}   CPI: ${semesterAcademics.semesterInfo.cpi || 'N/A'}`, 20, yPos);
                yPos += 7;
              }
              
              // Create a table for academic details
              const academicHeaders = [["Subject", "Code", "ESE", "CSE", "IA", "TW", "Viva", "Grade"]];
              const academicData = semesterAcademics.subjects.map(subject => [
                subject.name || 'N/A',
                subject.code || 'N/A',
                `${subject.studentMarks.ese || 0}/${subject.componentMarks.ese || 0}`,
                `${subject.studentMarks.cse || 0}/${subject.componentMarks.cse || 0}`,
                `${subject.studentMarks.ia || 0}/${subject.componentMarks.ia || 0}`,
                `${subject.studentMarks.tw || 0}/${subject.componentMarks.tw || 0}`,
                `${subject.studentMarks.viva || 0}/${subject.componentMarks.viva || 0}`,
                subject.studentMarks.grades || 'N/A'
              ]);
              
              autoTable(doc, {
                startY: yPos,
                head: academicHeaders,
                body: academicData,
                theme: 'grid',
                headStyles: { fillColor: [54, 116, 181], textColor: [255, 255, 255] },
                margin: { left: 20, right: 20 }
              });
              
              yPos = doc.lastAutoTable.finalY + 10;
              
              // Add component legend
              doc.setFontSize(10);
              doc.text("ESE: End Semester Exam | CSE: Continuous Semester Evaluation | IA: Internal Assessment | TW: Term Work | Viva: Viva Voce", 20, yPos, { maxWidth: pageWidth - 40 });
              yPos += 10;
            } else {
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Academic Details: No academic data available for this semester", 20, yPos);
              yPos += 10;
            }
          } catch (err) {
            console.error(`Error fetching academic details for semester ${semester}:`, err);
            doc.setFontSize(12);
            doc.setTextColor(255, 0, 0);
            doc.text(`Error fetching academic details for semester ${semester}`, 20, yPos);
            yPos += 10;
          }
        }

        // Add a divider between semesters
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 15;

        // Add a new page for the next semester if needed
        if (yPos > 220 && semester !== selectedSemesters[selectedSemesters.length - 1]) {
          doc.addPage();
          yPos = 20;
        }
      }

      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const footerText = "This report is generated by the Student Performance Analysis System";
      doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

      // Save the PDF
      doc.save(`${student.name || 'Student'}_Performance_Report.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="report-generator-modal">
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>Generate Student Report</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-content">
            {/* Hidden canvas for chart rendering */}
            <canvas ref={performanceTrendsChartRef} className="hidden-chart-canvas" width="600" height="300"></canvas>
            
            <div className="student-info-section">
              <h3>Student Information</h3>
              <div className="student-info">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{student.name || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Enrollment:</span>
                  <span className="info-value">{student.rollNo || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Batch:</span>
                  <span className="info-value">{student.batchName || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Semester:</span>
                  <span className="info-value">{student.semester || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="report-options-section">
              <h3>Report Content</h3>
              <p className="section-description">Select the sections to include in the report:</p>
              
              <div className="options-container">
                <div className="option-item">
                  <input 
                    type="checkbox" 
                    id="performanceTrends" 
                    checked={selectedOptions.performanceTrends} 
                    onChange={() => handleOptionChange('performanceTrends')}
                  />
                  <label htmlFor="performanceTrends">Performance Trends Graph</label>
                </div>
                
                <div className="option-item">
                  <input 
                    type="checkbox" 
                    id="activityList" 
                    checked={selectedOptions.activityList} 
                    onChange={() => handleOptionChange('activityList')}
                  />
                  <label htmlFor="activityList">Activity List</label>
                </div>
                
                <div className="option-item">
                  <input 
                    type="checkbox" 
                    id="performanceBreakdown" 
                    checked={selectedOptions.performanceBreakdown} 
                    onChange={() => handleOptionChange('performanceBreakdown')}
                  />
                  <label htmlFor="performanceBreakdown">Current Performance Breakdown</label>
                </div>
                
                <div className="option-item">
                  <input 
                    type="checkbox" 
                    id="performanceInsights" 
                    checked={selectedOptions.performanceInsights} 
                    onChange={() => handleOptionChange('performanceInsights')}
                  />
                  <label htmlFor="performanceInsights">Performance Insights</label>
                </div>
                
                <div className="option-item">
                  <input 
                    type="checkbox" 
                    id="academicDetails" 
                    checked={selectedOptions.academicDetails} 
                    onChange={() => handleOptionChange('academicDetails')}
                  />
                  <label htmlFor="academicDetails">Academic Details</label>
                </div>
              </div>
            </div>
            
            <div className="semester-selection-section">
              <h3>Semester Selection</h3>
              <p className="section-description">Select the semesters to include in the report:</p>
              
              <div className="semester-actions">
                <button className="select-all-btn" onClick={selectAllSemesters}>Select All</button>
                <button className="deselect-all-btn" onClick={deselectAllSemesters}>Deselect All</button>
              </div>
              
              <div className="semesters-container">
                {semesterPoints && semesterPoints.length > 0 ? (
                  semesterPoints.map(point => (
                    <div className="semester-item" key={point.semester}>
                      <input 
                        type="checkbox" 
                        id={`semester-${point.semester}`} 
                        checked={selectedSemesters.includes(point.semester)} 
                        onChange={() => handleSemesterChange(point.semester)}
                      />
                      <label htmlFor={`semester-${point.semester}`}>Semester {point.semester}</label>
                    </div>
                  ))
                ) : (
                  <p className="no-data-message">No semester data available</p>
                )}
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <div className="modal-footer">
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
            <button 
              className="generate-btn" 
              onClick={generatePDF} 
              disabled={isGenerating || selectedSemesters.length === 0}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorModal;
