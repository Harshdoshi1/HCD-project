import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileText, ChartBar, ChartPie, BarChart as BarChartIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './EmailNotification.css';

const AcademicReports = ({ students: initialStudents, selectedBatch: initialBatch, selectedSemester: initialSemester, onClose }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [includeParents, setIncludeParents] = useState(false);
  const [reportFormat, setReportFormat] = useState('pdf');
  // Basic state variables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(initialBatch || 'all');
  const [selectedSemester, setSelectedSemester] = useState(initialSemester || 'all');
  const [students, setStudents] = useState(initialStudents || []);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [academicData, setAcademicData] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [error, setError] = useState(null);
  const [studentError, setStudentError] = useState(null);

  // Filter and sorting states
  const [batches, setBatches] = useState(['all']);
  const [semesters, setSemesters] = useState(['all']);
  const [subjects, setSubjects] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [topBottomCount, setTopBottomCount] = useState(5);
  const [showTopStudents, setShowTopStudents] = useState(true);

  // Report generation states
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Refs for report generation
  const reportRef = useRef(null);
  const gradesTableRef = useRef(null);
  const topStudentsChartRef = useRef(null);
  const gradeDistributionChartRef = useRef(null);

  // Fetch batches, subjects, and students on component mount
  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch && selectedBatch !== 'all') {
      fetchSemesters(selectedBatch);
      // When changing batch, reset semester to 'all'
      if (selectedSemester !== 'all') {
        setSelectedSemester('all');
        // No need to call fetchStudentsByBatchAndSemester here as it will be triggered by the selectedSemester change
      } else {
        // If semester is already 'all', we need to fetch students manually
        fetchStudentsByBatchAndSemester(selectedBatch, 'all');
      }
    } else if (selectedBatch === 'all') {
      // When 'all' batches selected, reset semesters and fetch all students
      setSemesters(['all']);
      fetchStudentsByBatchAndSemester('all', 'all');
    }
  }, [selectedBatch]);

  useEffect(() => {
    // Only trigger this when selectedSemester changes, but not on initial render
    if (selectedSemester && selectedBatch) {
      console.log(`Fetching students for batch: ${selectedBatch}, semester: ${selectedSemester}`);
      fetchStudentsByBatchAndSemester(selectedBatch, selectedSemester);
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (students.length > 0) {
      applyFiltersAndSort();
    }
  }, [students, searchTerm, sortField, sortDirection, topBottomCount, showTopStudents]);

  // Fetch all available batches
  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5001/api/batches/getAllBatches');
      if (response.data && Array.isArray(response.data)) {
        const batchNames = response.data.map(batch => batch.batchName);
        const allBatches = ['all', ...batchNames];
        setBatches(allBatches);
      } else {
        setError('Invalid batch data format');
        setBatches(['all']);
      }
    } catch (err) {
      setError('Failed to load batches');
      setBatches(['all']);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
  };

  const handleSemesterChange = (e) => {
    const newSemester = e.target.value;
    console.log(`Semester selection changed to: ${newSemester}`);
    setSelectedSemester(newSemester);
    // We don't need to call fetchStudentsByBatchAndSemester here because it's handled by the useEffect
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (e, studentId) => {
    if (e.target.checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const generateIndividualReport = (student) => {
    const totalPoints = student.points.curricular +
      student.points.coCurricular +
      student.points.extraCurricular;
    const avgPoints = totalPoints / 3;

    return `
Performance Report for ${student.name} (${student.rollNo})
Semester: ${student.semester}

Overall Performance Summary:
- Total Points: ${totalPoints}
- Average Points: ${avgPoints.toFixed(2)}

Category Breakdown:
1. Curricular Activities: ${student.points.curricular} points
2. Co-Curricular Activities: ${student.points.coCurricular} points
3. Extra-Curricular Activities: ${student.points.extraCurricular} points

Strengths:
${Object.entries(student.points)
        .sort(([, a], [, b]) => b - a)[0][0] === 'curricular' ? '- Strong academic performance' :
        Object.entries(student.points)
          .sort(([, a], [, b]) => b - a)[0][0] === 'coCurricular' ? '- Excellence in technical activities' :
          '- Active participation in extra-curricular activities'}

Areas for Improvement:
${Object.entries(student.points)
        .sort(([, a], [, b]) => a - b)[0][0] === 'curricular' ? '- Focus on academic performance' :
        Object.entries(student.points)
          .sort(([, a], [, b]) => a - b)[0][0] === 'coCurricular' ? '- Increase participation in technical activities' :
          '- Consider joining more extra-curricular activities'}

Historical Progress:
${student.history ?
        student.history.map(h => `Semester ${h.semester}: 
  - Curricular: ${h.points.curricular}
  - Co-Curricular: ${h.points.coCurricular}
  - Extra-Curricular: ${h.points.extraCurricular}`).join('\n\n') :
        'No historical data available'}
    `;
  };

  const handleSendEmails = () => {
    const emailPromises = selectedStudents.map(studentId => {
      const student = students.find(s => s.id === studentId);
      const individualReport = generateIndividualReport(student);

      console.log('Sending email for:', student.name);
      console.log('Report:', individualReport);
      console.log('Include Parents:', includeParents);
      console.log('Report Format:', reportFormat);
    });

    alert(`Reports would be sent to ${selectedStudents.length} students ${includeParents ? 'and their parents' : ''} in ${reportFormat.toUpperCase()} format.`);
    onClose();
  };

  // Fetch semesters for a selected batch
  const fetchSemesters = async (batchName) => {
    console.log(`Starting to fetch semesters for batch: ${batchName}`);
    setSemesters(['all']); // Reset semesters immediately to avoid stale data
    try {
      console.log(`Fetching semesters for batch: ${batchName}`);

      // Properly encode the batch name for the URL
      const encodedBatchName = encodeURIComponent(batchName);

      // The correct endpoint according to the server routes
      const response = await axios.get(`http://localhost:5001/api/semesters/getSemestersByBatch/${encodedBatchName}`);
      console.log('Semester API response:', response);

      if (response.data && Array.isArray(response.data)) {
        // Extract semester numbers and sort them
        const fetchedSemesters = response.data
          .map(sem => sem.semesterNumber.toString())
          .sort((a, b) => parseInt(a) - parseInt(b));

        setSemesters(['all', ...fetchedSemesters]);
        console.log('Fetched semesters:', fetchedSemesters);
      } else {
        console.warn('Unexpected response format for semesters:', response.data);
        setSemesters(['all']);
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setSemesters(['all']);
    }
  };

  // Fetch students by batch and semester
  const fetchStudentsByBatchAndSemester = async (batch, semester) => {
    setFetchingStudents(true);
    setStudentError(null);
    setFilteredStudents([]);
    try {
      let url = '';
      let response;

      console.log(`Attempting to fetch students for batch: ${batch}, semester: ${semester}`);

      if (batch === 'all') {
        // Fetch all students
        url = 'http://localhost:5001/api/students/getAllStudents';
        console.log(`Using URL: ${url}`);
        response = await axios.get(url);
      } else {
        // First get the batch ID from the batch name
        const batchesResponse = await axios.get('http://localhost:5001/api/batches/getAllBatches');
        const selectedBatchObj = batchesResponse.data.find(b => b.batchName === batch);

        if (selectedBatchObj && selectedBatchObj.id) {
          if (semester === 'all') {
            // Fetch students by batch ID
            url = `http://localhost:5001/api/students/getStudentsByBatch/${selectedBatchObj.id}`;
            console.log(`Using URL: ${url}`);
          } else {
            // Fetch students by batch ID and semester - properly encode parameters
            const encodedBatch = encodeURIComponent(batch);
            const encodedSemester = encodeURIComponent(semester);
            // Use the correct API endpoint to filter by both batch and semester
            url = `http://localhost:5001/api/facultyside/marks/students/${encodedBatch}/${encodedSemester}`;
            console.log(`Using semester-specific URL: ${url} for semester ${semester}`);
            console.log(`Using URL: ${url}`);
          }
          response = await axios.get(url);
        } else {
          throw new Error(`Batch ID not found for batch name: ${batch}`);
        }
      }

      if (response && response.data) {
        // Process student data
        const formattedStudents = await processStudentData(response.data, batch, semester);
        setStudents(formattedStudents);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudentError('Failed to load students. ' + (err.response?.data?.message || err.message));
      setStudents([]);
    } finally {
      setFetchingStudents(false);
    }
  };

  // Process student data and fetch academic information
  const processStudentData = async (studentsData, batch, semester) => {
    console.log(`Processing ${studentsData.length} students for batch: ${batch}, semester: ${semester}`);
    try {
      // Map to store SPI data by enrollment number
      const spiDataMap = {};
      
      // Fetch subjects for this batch and semester
      let subjectsList = [];
      try {
        // Only make the API call if batch and semester are not 'all'
        if (batch !== 'all' && semester !== 'all') {
          // First get the batch ID from the batch name
          const batchesResponse = await axios.get('http://localhost:5001/api/batches/getAllBatches');
          const selectedBatchObj = batchesResponse.data.find(b => b.batchName === batch);

          if (selectedBatchObj && selectedBatchObj.id) {
            // Get semester ID for this semester number
            const semesterResponse = await axios.get(`http://localhost:5001/api/semesters/batch/${selectedBatchObj.id}`);
            const selectedSemObj = semesterResponse.data.find(s => s.semesterNumber.toString() === semester.toString());

            if (selectedSemObj && selectedSemObj.id) {
              // Now we have both batch ID and semester ID, we can fetch subjects
              const subjectsResponse = await axios.get(`http://localhost:5001/api/subjects/batch/${selectedBatchObj.id}/semester/${selectedSemObj.id}`);
              subjectsList = subjectsResponse.data || [];
              console.log(`Fetched ${subjectsList.length} subjects for batch ${batch}, semester ${semester}:`, subjectsList);
            } else {
              throw new Error(`Semester ID not found for semester number: ${semester}`);
            }
          } else {
            throw new Error(`Batch ID not found for batch name: ${batch}`);
          }
        } else {
          // For 'all' cases, we need to fetch all subjects across semesters
          // This could be expensive, so we'll limit to a specific batch if possible
          if (batch !== 'all') {
            const batchesResponse = await axios.get('http://localhost:5001/api/batches/getAllBatches');
            const selectedBatchObj = batchesResponse.data.find(b => b.batchName === batch);

            if (selectedBatchObj && selectedBatchObj.id) {
              // Fetch all subjects for this batch
              const subjectsResponse = await axios.get(`http://localhost:5001/api/subjects/getAllByBatchId/${selectedBatchObj.id}`);
              subjectsList = subjectsResponse.data || [];
              console.log(`Fetched ${subjectsList.length} subjects for batch ${batch}:`, subjectsList);
            }
          } else {
            // This is a fallback - fetching all subjects would be inefficient, so we'll limit
            console.warn('Fetching all subjects across all batches is not supported. Using a limited set.');
            subjectsList = [];
          }
        }
      } catch (error) {
        console.warn('Error fetching subjects, using sample data instead:', error);
        // If we couldn't fetch subjects, use an empty array
        console.error('Error fetching subjects:', error);
        subjectsList = [];
      }
      setSubjects(subjectsList);

      // Format student data with academic details
      return Promise.all(Array.isArray(studentsData) ? studentsData.map(async student => {
        // If a specific semester is selected but the student's semester doesn't match,
        // and the API didn't already filter it out, we'll skip this student
        if (semester !== 'all' && 
            student.semesterNumber && 
            student.semesterNumber.toString() !== semester.toString() &&
            student.currnetsemester && 
            student.currnetsemester.toString() !== semester.toString()) {
          console.log(`Skipping student ${student.name || student.studentName || 'Unknown'} - semester mismatch`);
          return null; // Will be filtered out later
        }
        
        // Fetch SPI data directly from student_points table
        const enrollmentNumber = student.enrollmentNumber || student.rollNo;
        let spiData = 0;
        
        try {
          if (enrollmentNumber) {
            // First try the studentCPI endpoint which provides both CPI and semester-wise SPI
            const spiResponse = await axios.get(`http://localhost:5001/api/studentCPI/enrollment/${enrollmentNumber}`);
            if (spiResponse.data) {
              // If we have data and specific semester is selected, find that semester's SPI
              if (semester !== 'all' && spiResponse.data.semesterData) {
                const semData = spiResponse.data.semesterData.find(sd => 
                  sd.semesterNumber && sd.semesterNumber.toString() === semester.toString());
                if (semData) {
                  spiData = parseFloat(semData.spi || 0).toFixed(2);
                  console.log(`Fetched semester-specific SPI for student ${enrollmentNumber}, semester ${semester}: ${spiData}`);
                }
              } else {
                // If all semesters or semesterData not found, use overall CPI
                spiData = parseFloat(spiResponse.data.cpi || 0).toFixed(2);
                console.log(`Fetched overall CPI for student ${enrollmentNumber}: ${spiData}`);
              }
            }
            
            // If no SPI data yet, try the student_points table directly
            if (!spiData && semester !== 'all') {
              try {
                const pointsResponse = await axios.get(`http://localhost:5001/api/student_points/student/${enrollmentNumber}/semester/${semester}`);
                if (pointsResponse.data && pointsResponse.data.spi) {
                  spiData = parseFloat(pointsResponse.data.spi || 0).toFixed(2);
                  console.log(`Fetched SPI from student_points for ${enrollmentNumber}, semester ${semester}: ${spiData}`);
                }
              } catch (pointsError) {
                console.warn(`No data in student_points for student ${enrollmentNumber}, semester ${semester}`);
              }
            }
          }
        } catch (spiError) {
          console.warn(`Error fetching SPI for student ${enrollmentNumber}:`, spiError);
        }
        // Fetch academic data for this student
        let academicMarks = {};
        try {
          if (student.id && subjectsList.length > 0) {
            // We'll fetch marks for each subject for this student
            for (const subject of subjectsList) {
              const subjectCode = subject.sub_code || (subject.UniqueSubDegree && subject.UniqueSubDegree.sub_code);
              if (!subjectCode) continue;

              try {
                const marksResponse = await axios.get(`http://localhost:5001/api/marks/student/${student.id}/subject/${subjectCode}`);

                if (marksResponse.data && marksResponse.data.id) {
                  const marks = marksResponse.data;
                  const subjectName = subject.sub_name || (subject.UniqueSubDegree && subject.UniqueSubDegree.sub_name) || 'Unknown';
                  const credits = subject.sub_credit || 4;

                  // Calculate total marks
                  const ese = marks.ese || 0;
                  const cse = marks.cse || 0;
                  const ia = marks.ia || 0;
                  const tw = marks.tw || 0;
                  const total = ese + cse + ia + tw;

                  // Determine grade based on total marks
                  let grade;
                  if (total >= 90) grade = 'AA';
                  else if (total >= 80) grade = 'AB';
                  else if (total >= 70) grade = 'BB';
                  else if (total >= 60) grade = 'BC';
                  else if (total >= 50) grade = 'CC';
                  else if (total >= 40) grade = 'CD';
                  else if (total >= 35) grade = 'DD';
                  else grade = 'FF';

                  // Calculate grade points
                  let gradePoints;
                  switch (grade) {
                    case 'AA': gradePoints = 10; break;
                    case 'AB': gradePoints = 9; break;
                    case 'BB': gradePoints = 8; break;
                    case 'BC': gradePoints = 7; break;
                    case 'CC': gradePoints = 6; break;
                    case 'CD': gradePoints = 5; break;
                    case 'DD': gradePoints = 4; break;
                    default: gradePoints = 0;
                  }

                  // Add to academic marks
                  academicMarks[subjectCode] = {
                    name: subjectName,
                    credits,
                    ese,
                    cse,
                    ia,
                    tw,
                    total,
                    grade,
                    gradePoints
                  };
                }
              } catch (subjectError) {
                console.warn(`No marks found for student ${student.id}, subject ${subjectCode}`);
              }
            }

            console.log(`Fetched marks for student ${student.id} for ${Object.keys(academicMarks).length} subjects`);
          } else {
            console.warn(`Cannot fetch marks: student.id=${student.id}, subjectsList.length=${subjectsList.length}`);
          }
        } catch (error) {
          console.error('Error fetching academic marks for student:', error);
        }

        return {
          id: student.id || Math.random().toString(36).substr(2, 9),
          name: student.name || student.studentName || 'Unknown',
          rollNo: student.enrollmentNumber || student.rollNo || 'N/A',
          batch: student.batchName || (student.Batch ? student.Batch.batchName : batch),
          semester: student.semesterNumber || student.currnetsemester || semester || 'N/A',
          email: student.email || 'N/A',
          academicData: academicMarks,
          spi: spiData || calculateSPI(academicMarks) // Use fetched SPI or calculate as fallback
        };
      }).filter(student => student !== null) : []);
    } catch (error) {
      console.error('Error processing student data:', error);
      return [];
    }
  };

  // Function to get grade from total marks
  const getGradeFromTotal = (total) => {
    if (total >= 90) return 'AA';
    else if (total >= 80) return 'AB';
    else if (total >= 70) return 'BB';
    else if (total >= 60) return 'BC';
    else if (total >= 50) return 'CC';
    else if (total >= 40) return 'CD';
    else if (total >= 35) return 'DD';
    else return 'FF';
  };

  // Function to get grade points from grade
  const getGradePoints = (grade) => {
    switch (grade) {
      case 'AA': return 10;
      case 'AB': return 9;
      case 'BB': return 8;
      case 'BC': return 7;
      case 'CC': return 6;
      case 'CD': return 5;
      case 'DD': return 4;
      default: return 0;
    }
  };

  // Calculate SPI (Semester Performance Index) for a student
  const calculateSPI = (academicData) => {
    if (!academicData || Object.keys(academicData).length === 0) return 0;

    let totalCredits = 0;
    let totalGradePoints = 0;

    Object.values(academicData).forEach(subject => {
      totalCredits += subject.credits;
      totalGradePoints += subject.credits * subject.gradePoints;
    });

    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
  };

  // Safe way to get academicData values with null checks
  const safeGetAcademicValues = (academicData) => {
    if (!academicData || typeof academicData !== 'object') return [];
    return Object.values(academicData);
  };

  // State for student detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Function to open student detail modal
  const openStudentDetailModal = (student) => {
    setSelectedStudentDetail(student);
    setShowDetailModal(true);
  };

  // Function to close student detail modal
  const closeStudentDetailModal = () => {
    setShowDetailModal(false);
    setSelectedStudentDetail(null);
  };

  // Apply filters and sorting to student data
  const applyFiltersAndSort = () => {
    console.log(`Applying filters and sorting. Current semester: ${selectedSemester}`);
    console.log(`Total students before filtering: ${students.length}`);
    
    // First filter by semester if a specific semester is selected
    // This is a double-check in case the API didn't filter properly
    let filtered = students.filter((student) => {
      if (!student || !student.name || !student.rollNo) return false;
      
      // If a specific semester is selected, filter by it
      if (selectedSemester !== 'all') {
        // Check against all possible semester field names in the student object
        const studentSem = student.semester || student.semesterNumber || student.currnetsemester;
        
        if (studentSem && studentSem.toString() !== selectedSemester.toString()) {
          console.log(`Filtering out student ${student.name} - semester mismatch: ${studentSem} !== ${selectedSemester}`);
          return false;
        }
      }
      
      // Then filter by search term
      return student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    console.log(`Total students after filtering: ${filtered.length}`);

    // Sort students based on selected field and direction
    filtered.sort((a, b) => {
      let valueA, valueB;

      if (sortField === 'name') {
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
      } else if (sortField === 'rollNo') {
        valueA = a.rollNo.toLowerCase();
        valueB = b.rollNo.toLowerCase();
      } else if (sortField === 'spi') {
        valueA = parseFloat(a.spi);
        valueB = parseFloat(b.spi);
      } else if (sortField.startsWith('subject_')) {
        // Sort by specific subject grade
        const subjectCode = sortField.replace('subject_', '');
        valueA = a.academicData[subjectCode]?.total || 0;
        valueB = b.academicData[subjectCode]?.total || 0;
      } else {
        valueA = a[sortField];
        valueB = b[sortField];
      }

      // Apply sort direction
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    // Limit to top/bottom X students if requested
    if (topBottomCount > 0 && topBottomCount < filtered.length) {
      if (showTopStudents) {
        filtered = filtered.slice(-topBottomCount).reverse();
      } else {
        filtered = filtered.slice(0, topBottomCount);
      }
    }

    setFilteredStudents(filtered);
  };

  // Generate a PDF report of academic data
  const handleGenerateReport = async () => {
    setGeneratingPdf(true);
    try {
      // Capture the report element using html2canvas
      const reportElement = reportRef.current;

      // Create a new PDF document
      const pdfDoc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdfDoc.internal.pageSize.getWidth();
      const pageHeight = pdfDoc.internal.pageSize.getHeight();

      // Add title and header with styling
      pdfDoc.setFillColor(10, 36, 99); // #0A2463 dark blue
      pdfDoc.rect(0, 0, pageWidth, 25, 'F');

      pdfDoc.setFontSize(18);
      pdfDoc.setTextColor(255, 255, 255); // White text
      pdfDoc.text('Academic Performance Report', pageWidth / 2, 15, { align: 'center' });

      // Add batch and semester info
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(51, 51, 51);
      const batchText = `Batch: ${selectedBatch === 'all' ? 'All Batches' : selectedBatch}`;
      const semesterText = `Semester: ${selectedSemester === 'all' ? 'All Semesters' : selectedSemester}`;
      pdfDoc.text(batchText, 20, 35);
      pdfDoc.text(semesterText, pageWidth - 20, 35, { align: 'right' });

      // Add date
      const dateText = `Generated on: ${new Date().toLocaleDateString()}`;
      pdfDoc.text(dateText, pageWidth / 2, 42, { align: 'center' });

      // Add a line
      pdfDoc.setDrawColor(220, 220, 220);
      pdfDoc.line(20, 45, pageWidth - 20, 45);

      // Executive summary section
      pdfDoc.setFontSize(14);
      pdfDoc.setTextColor(54, 116, 181); // #3674B5 color
      pdfDoc.text('Executive Summary', 20, 55);

      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(80, 80, 80);
      const summaryText = `This report provides a comprehensive analysis of student academic performance for ${selectedBatch === 'all' ? 'all batches' : 'batch ' + selectedBatch} in ${selectedSemester === 'all' ? 'all semesters' : 'semester ' + selectedSemester}. It includes detailed grade distributions, student rankings, and subject-wise performance metrics to help identify trends and areas for improvement.`;

      // Add multiline text with word wrapping
      const splitSummary = pdfDoc.splitTextToSize(summaryText, pageWidth - 40);
      pdfDoc.text(splitSummary, 20, 62);

      // Calculate summary height based on number of lines
      const summaryHeight = splitSummary.length * 5;

      // Capture and add student performance table
      const gradesTable = gradesTableRef.current;
      const gradeCanvas = await html2canvas(gradesTable);
      const gradeImgData = gradeCanvas.toDataURL('image/png');

      // Section title for table
      pdfDoc.setFontSize(14);
      pdfDoc.setTextColor(54, 116, 181);
      pdfDoc.text('Student Grade Performance Table', 20, 70 + summaryHeight);

      // Table description
      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(80, 80, 80);
      const tableDesc = "The following table shows individual student performance across all subjects. Each cell displays the grade earned and the total marks in parentheses. Use this data to identify students who may need additional support or recognition.";
      const splitTableDesc = pdfDoc.splitTextToSize(tableDesc, pageWidth - 40);
      pdfDoc.text(splitTableDesc, 20, 77 + summaryHeight);

      // Calculate image dimensions to fit in PDF
      const imgWidth = pageWidth - 40; // 20mm margin on each side
      const imgHeight = (gradeCanvas.height * imgWidth) / gradeCanvas.width;

      // Add the image to PDF
      pdfDoc.addImage(gradeImgData, 'PNG', 20, 90 + summaryHeight, imgWidth, imgHeight);

      // Start a new page for charts
      pdfDoc.addPage();

      // Add title for the charts page
      pdfDoc.setFillColor(10, 36, 99); // #0A2463 dark blue
      pdfDoc.rect(0, 0, pageWidth, 25, 'F');

      pdfDoc.setFontSize(18);
      pdfDoc.setTextColor(255, 255, 255);
      pdfDoc.text('Performance Analytics', pageWidth / 2, 15, { align: 'center' });

      let yPosition = 35; // Starting y position for charts

      // Add charts if they exist
      // Grade distribution chart
      if (gradeDistributionChartRef.current) {
        const gradeDistCanvas = await html2canvas(gradeDistributionChartRef.current);
        const gradeDistImgData = gradeDistCanvas.toDataURL('image/png');
        const chartWidth = pageWidth - 40;
        const chartHeight = (gradeDistCanvas.height * chartWidth) / gradeDistCanvas.width;

        pdfDoc.setFontSize(14);
        pdfDoc.setTextColor(54, 116, 181);
        pdfDoc.text('Grade Distribution Analysis', 20, yPosition);

        // Add description for grade distribution chart
        pdfDoc.setFontSize(10);
        pdfDoc.setTextColor(80, 80, 80);
        const gradeDistDesc = "This chart illustrates the distribution of grades across all subjects. The x-axis represents grade categories (AA to FF), while the y-axis shows the frequency of each grade. This visualization helps identify overall performance patterns and potential grading anomalies.";
        const splitGradeDesc = pdfDoc.splitTextToSize(gradeDistDesc, pageWidth - 40);
        pdfDoc.text(splitGradeDesc, 20, yPosition + 7);

        yPosition += 22; // Adjust position based on description height
        pdfDoc.addImage(gradeDistImgData, 'PNG', 20, yPosition, chartWidth, chartHeight);

        yPosition += chartHeight + 15; // Move position for next chart
      }

      // Top performers chart
      if (topStudentsChartRef.current) {
        const topStudentsCanvas = await html2canvas(topStudentsChartRef.current);
        const topStudentsImgData = topStudentsCanvas.toDataURL('image/png');
        const chartWidth = pageWidth - 40;
        const chartHeight = (topStudentsCanvas.height * chartWidth) / topStudentsCanvas.width;

        // Check if we need a new page for the top performers chart
        if (yPosition + chartHeight + 30 > pageHeight) {
          pdfDoc.addPage();
          yPosition = 30;
        }

        pdfDoc.setFontSize(14);
        pdfDoc.setTextColor(54, 116, 181);
        pdfDoc.text('Top Performing Students', 20, yPosition);

        // Add description for top performers
        pdfDoc.setFontSize(10);
        pdfDoc.setTextColor(80, 80, 80);
        const topStudentsDesc = "This section highlights the highest achieving students based on Semester Performance Index (SPI). These students demonstrate exceptional academic capability and may serve as peer mentors or be considered for academic recognition programs.";
        const splitTopDesc = pdfDoc.splitTextToSize(topStudentsDesc, pageWidth - 40);
        pdfDoc.text(splitTopDesc, 20, yPosition + 7);

        yPosition += 22; // Adjust position based on description height
        pdfDoc.addImage(topStudentsImgData, 'PNG', 20, yPosition, chartWidth, chartHeight);

        yPosition += chartHeight + 15;
      }

      // Add a conclusions page
      pdfDoc.addPage();

      // Add title for the conclusion page
      pdfDoc.setFillColor(10, 36, 99);
      pdfDoc.rect(0, 0, pageWidth, 25, 'F');

      pdfDoc.setFontSize(18);
      pdfDoc.setTextColor(255, 255, 255);
      pdfDoc.text('Conclusions and Recommendations', pageWidth / 2, 15, { align: 'center' });

      // Add conclusions based on data
      pdfDoc.setFontSize(14);
      pdfDoc.setTextColor(54, 116, 181);
      pdfDoc.text('Summary Insights', 20, 35);

      // Calculate grade distribution here to avoid reference error
      const calculateGradeDistribution = () => {
        const distribution = {
          'AA': 0, 'AB': 0, 'BB': 0, 'BC': 0, 'CC': 0, 'CD': 0, 'DD': 0, 'FF': 0
        };

        // Count grades from all students and subjects
        filteredStudents.forEach(student => {
          if (student && student.academicData) {
            Object.values(student.academicData).forEach(subjectData => {
              if (subjectData && subjectData.grade) {
                distribution[subjectData.grade] = (distribution[subjectData.grade] || 0) + 1;
              }
            });
          }
        });

        return distribution;
      };

      const gradeDistribution = calculateGradeDistribution();

      // Find most common grade
      let mostCommonGrade = 'AA';
      let maxCount = 0;
      Object.entries(gradeDistribution).forEach(([grade, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonGrade = grade;
        }
      });

      // Calculate total grades and FF count for pass rate
      const totalGrades = Object.values(gradeDistribution).reduce((sum, count) => sum + count, 0);
      const failCount = gradeDistribution['FF'] || 0;
      const passRate = totalGrades > 0 ? ((totalGrades - failCount) / totalGrades * 100).toFixed(2) : '100.00';

      // Calculate average SPI
      const averageSPI = filteredStudents.length > 0
        ? (filteredStudents.reduce((sum, student) => sum + parseFloat(student.spi || 0), 0) / filteredStudents.length).toFixed(2)
        : 0;

      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(80, 80, 80);

      let insights = [
        `Average SPI: ${averageSPI}`,
        `Total Students: ${filteredStudents.length}`,
        `Most Common Grade: ${mostCommonGrade}`,
        `Pass Rate: ${passRate}%`
      ];

      let yPos = 45;
      insights.forEach(insight => {
        pdfDoc.text(`• ${insight}`, 25, yPos);
        yPos += 7;
      });

      // Add recommendations
      pdfDoc.setFontSize(14);
      pdfDoc.setTextColor(54, 116, 181);
      pdfDoc.text('Recommendations', 20, yPos + 10);

      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(80, 80, 80);

      const recommendations = [
        "Consider providing additional support resources for students scoring below the class average.",
        "Recognize and publicly acknowledge top-performing students to motivate the entire class.",
        "Review subjects with high failure rates to identify potential teaching methodology adjustments.",
        "Compare results with previous semesters to track progress and identify long-term trends.",
        "Consider conducting a student feedback survey to understand challenges faced by underperforming students."
      ];

      yPos += 20;
      recommendations.forEach(rec => {
        pdfDoc.text(`• ${rec}`, 25, yPos);
        yPos += 7;
      });

      // Add footer with page numbers
      const totalPages = pdfDoc.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdfDoc.setPage(i);
        pdfDoc.setFontSize(8);
        pdfDoc.setTextColor(150, 150, 150);
        pdfDoc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdfDoc.text('Department of Computer Engineering - Academic Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }

      // Save the PDF
      pdfDoc.save(`Academic_Report_${selectedBatch}_${selectedSemester}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error generating PDF report. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Handle change in sort field or direction
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Toggle direction if same field is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort indicator based on current sort field and direction
  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown size={16} />;
    return sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };

  return (
    <div className="modal-backdrop">
      {loading && batches.length <= 1 && <span className="loading-text">Loading batches...</span>}
      {fetchingStudents && <span className="loading-text">Loading students...</span>}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {studentError && (
        <div className="error-message">
          {studentError}
        </div>
      )}
      <div className="report-content-academic-report">
        <div className="modal-container-academic-report report-modal-academic-report">
          <div className="modal-header-academic-report">
            <h2>Academic Reports</h2>
            <div className="header-controls-academic-report">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                disabled={loading}
                className="batch-select-academic-report"
              >
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch === 'all' ? 'All Batches' : `Batch ${batch}`}
                  </option>
                ))}
              </select>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={loading || selectedBatch === 'all'}
                className="semester-select-academic-report"
              >
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester === 'all' ? 'All Semesters' : `Semester ${semester}`}
                  </option>
                ))}
              </select>
              <button className="close-btn-academic-report" onClick={onClose}>&times;</button>
            </div>
          </div>

          <div className="top-filters-section-academic-report">
            <div className="academic-filters-academic-report">
              <div className="search-filters-academic-report">
                <div className="search-control-academic-report">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-academic-report"
                  />
                </div>

                <div className="top-bottom-filter-academic-report">
                  <label>Show:</label>
                  <div className="filter-options-academic-report">
                    <select
                      value={topBottomCount}
                      onChange={(e) => setTopBottomCount(parseInt(e.target.value))}
                      className="count-select-academic-report"
                    >
                      <option value="0">All Students</option>
                      <option value="5">Top/Bottom 5</option>
                      <option value="10">Top/Bottom 10</option>
                      <option value="15">Top/Bottom 15</option>
                      <option value="20">Top/Bottom 20</option>
                    </select>

                    {topBottomCount > 0 && (
                      <div className="toggle-buttons-academic-report">
                        <button
                          className={`toggle-btn-academic-report ${showTopStudents ? 'active-academic-report' : ''}`}
                          onClick={() => setShowTopStudents(true)}
                        >
                          Top
                        </button>
                        <button
                          className={`toggle-btn-academic-report ${!showTopStudents ? 'active-academic-report' : ''}`}
                          onClick={() => setShowTopStudents(false)}
                        >
                          Bottom
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="report-actions-academic-report">
                <button
                  className="btn-generate-academic-report"
                  onClick={handleGenerateReport}
                  disabled={generatingPdf || students.length === 0}
                >
                  {generatingPdf ? 'Generating...' : 'Generate PDF Report'}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-content-academic-report">
            {loading ? (
              <div className="loading-indicator-academic-report">
                <div className="spinner-academic-report"></div>
                <p>Loading batches and semesters...</p>
              </div>
            ) : fetchingStudents ? (
              <div className="loading-indicator-academic-report">
                <div className="spinner-academic-report"></div>
                <p>Loading students for {selectedBatch === 'all' ? 'all batches' : `batch ${selectedBatch}`} and {selectedSemester === 'all' ? 'all semesters' : `semester ${selectedSemester}`}...</p>
              </div>
            ) : (
              <div className="academic-content-academic-report" ref={reportRef}>
              <div className="academic-table-container-academic-report" ref={gradesTableRef}>
                <div className="table-header-academic-report">
                  <h3>Student Academic Performance</h3>
                  <p>{filteredStudents.length} Students • {selectedBatch === 'all' ? 'All Batches' : `Batch ${selectedBatch}`} • {selectedSemester === 'all' ? 'All Semesters' : `Semester ${selectedSemester}`}</p>
                </div>
                {filteredStudents.length === 0 && (
                  <div className="no-data-message-academic-report">
                    <p>No student data available for {selectedBatch === 'all' ? 'all batches' : `batch ${selectedBatch}`} and {selectedSemester === 'all' ? 'all semesters' : `semester ${selectedSemester}`}.</p>
                    <p>Try selecting different filters or check if students have been added to this batch and semester.</p>
                  </div>
                )}
                {filteredStudents.length > 0 ? (
                  <table className="academic-table-academic-report">
                    <thead>
                      <tr>
                        <th className="sortable-academic-report" onClick={() => handleSortChange('name')}>
                          Student Name {renderSortIndicator('name')}
                        </th>
                        <th className="sortable-academic-report" onClick={() => handleSortChange('rollNo')}>
                          Enrollment No. {renderSortIndicator('rollNo')}
                        </th>
                        <th className="sortable-academic-report" onClick={() => handleSortChange('semester')}>
                          Semester {renderSortIndicator('semester')}
                        </th>
                        {subjects.map(subject => (
                          <th
                            key={subject.sub_code}
                            className="subject-header-academic-report sortable-academic-report"
                            onClick={() => handleSortChange(`subject_${subject.sub_code}`)}
                            title={subject.sub_name}
                          >
                            {subject.sub_name.length > 10 ? `${subject.sub_name.substring(0, 10)}...` : subject.sub_name}
                            {renderSortIndicator(`subject_${subject.sub_code}`)}
                          </th>
                        ))}
                        <th className="sortable-academic-report" onClick={() => handleSortChange('spi')}>
                          SPI {renderSortIndicator('spi')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(student => (
                        <tr key={student.id || Math.random().toString(36).substr(2, 9)}>
                          <td>{student.name || 'N/A'}</td>
                          <td>{student.rollNo || 'N/A'}</td>
                          <td>{student.semester || 'N/A'}</td>
                          {subjects.map(subject => {
                            // Safe access to academicData
                            if (!student || !student.academicData) {
                              return <td key={`${student?.id || 'unknown'}_${subject.sub_code}`} className="grade-cell-academic-report">-</td>;
                            }

                            const subjectData = student.academicData[subject.sub_code];
                            return (
                              <td
                                key={`${student.id}_${subject.sub_code}`}
                                className={`grade-cell-academic-report ${subjectData?.grade === 'FF' ? 'failing-grade-academic-report' : ''}`}
                                title={`ESE: ${subjectData?.ese || 0}, CSE: ${subjectData?.cse || 0}, IA: ${subjectData?.ia || 0}, TW: ${subjectData?.tw || 0}, Total: ${subjectData?.total || 0}`}
                              >
                                {subjectData ? (
                                  <div className="grade-info-academic-report">
                                    <span className="grade-academic-report">{subjectData.grade}</span>
                                    <span className="points-academic-report">{subjectData.total}</span>
                                  </div>
                                ) : '-'}
                              </td>
                            );
                          })}
                          <td className="spi-cell-academic-report">{student.spi || '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-data-message-academic-report">
                    {fetchingStudents ? 'Loading student data...' : 'No students found matching the selected criteria'}
                  </div>
                )}
              </div>

              {filteredStudents.length > 0 && (
                <div className="statistics-section-academic-report">
                  <div className="stat-cards-academic-report">
                    <div className="stat-card-academic-report" ref={topStudentsChartRef}>
                      <h4>Top Performers (by SPI)</h4>
                      <div className="top-students-list-academic-report">
                        {[...filteredStudents]
                          .sort((a, b) => parseFloat(b.spi) - parseFloat(a.spi))
                          .slice(0, 5)
                          .map((student, index) => (
                            <div key={student.id} className="top-student-item-academic-report">
                              <span className="rank-academic-report">{index + 1}</span>
                              <span className="student-name-academic-report">{student.name}</span>
                              <span className="student-rollno-academic-report">{student.rollNo}</span>
                              <span className="student-spi-academic-report">{student.spi}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    <div className="stat-card-academic-report" ref={gradeDistributionChartRef}>
                      <h4>Grade Distribution</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          {
                            grade: 'AA', count: filteredStudents.reduce((count, student) =>
                              count + safeGetAcademicValues(student.academicData).filter(s => s && s.grade === 'AA').length, 0)
                          },
                          {
                            grade: 'AB', count: filteredStudents.reduce((count, student) =>
                              count + safeGetAcademicValues(student.academicData).filter(s => s && s.grade === 'AB').length, 0)
                          },
                          {
                            grade: 'BB', count: filteredStudents.reduce((count, student) =>
                              count + safeGetAcademicValues(student.academicData).filter(s => s && s.grade === 'BB').length, 0)
                          },
                          {
                            grade: 'BC', count: filteredStudents.reduce((count, student) =>
                              count + safeGetAcademicValues(student.academicData).filter(s => s && s.grade === 'BC').length, 0)
                          },
                          {
                            grade: 'CC', count: filteredStudents.reduce((count, student) =>
                              count + safeGetAcademicValues(student.academicData).filter(s => s && s.grade === 'CC').length, 0)
                          },
                          {
                            grade: 'CD', count: filteredStudents.reduce((count, student) =>
                              count + safeGetAcademicValues(student.academicData).filter(s => s && s.grade === 'CD').length, 0)
                          },
                          {
                            grade: 'DD', count: filteredStudents.reduce((count, student) =>
                              count + safeGetAcademicValues(student.academicData).filter(s => s && s.grade === 'DD').length, 0)
                          },
                          {
                            grade: 'FF', count: filteredStudents.reduce((count, student) =>
                              count + safeGetAcademicValues(student.academicData).filter(s => s && s.grade === 'FF').length, 0)
                          },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="grade" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#0A2463" name="Number of Grades" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="subject-statistics-academic-report">
                    <h4>Subject-wise Performance</h4>
                    <table className="subject-stats-table-academic-report">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Average</th>
                          <th>Highest</th>
                          <th>Lowest</th>
                          <th>Pass %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map(subject => {
                          // Calculate statistics for this subject with safe access
                          const subjectMarks = filteredStudents
                            .map(student => {
                              if (!student || !student.academicData) return 0;
                              const subjectData = student.academicData[subject.sub_code];
                              return subjectData?.total || 0;
                            })
                            .filter(mark => mark > 0);

                          const average = subjectMarks.length > 0 ?
                            (subjectMarks.reduce((a, b) => a + b, 0) / subjectMarks.length).toFixed(2) : 0;

                          const highest = subjectMarks.length > 0 ? Math.max(...subjectMarks) : 0;
                          const lowest = subjectMarks.length > 0 ? Math.min(...subjectMarks) : 0;

                          const passCount = filteredStudents.filter(student => {
                            if (!student || !student.academicData) return false;
                            const subjectData = student.academicData[subject.sub_code];
                            return subjectData && subjectData.grade !== 'FF';
                          }).length;

                          const passPercentage = filteredStudents.length > 0 ?
                            ((passCount / filteredStudents.length) * 100).toFixed(2) : 0;

                          return (
                            <tr key={subject.sub_code}>
                              <td title={subject.sub_name}>
                                {subject.sub_name.length > 25 ? `${subject.sub_name.substring(0, 25)}...` : subject.sub_name}
                              </td>
                              <td>{average}</td>
                              <td>{highest}</td>
                              <td>{lowest}</td>
                              <td className={passPercentage < 70 ? 'low-pass-rate' : ''}>
                                {passPercentage}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicReports;
