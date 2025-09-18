// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
// import './StudentAnalysis.css';
// import ReportGeneratorModal from './ReportGeneratorModal.jsx';
// import AcademicAnalysis from './AcademicAnalysis.jsx';

// const StudentAnalysis = ({ student, onClose }) => {
//   // State for storing semester points data
//   const [semesterPoints, setSemesterPoints] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedSemester, setSelectedSemester] = useState(null);
//   const [activityList, setActivityList] = useState([]);
//   const [loadingActivities, setLoadingActivities] = useState(false);
//   const [academicDetails, setAcademicDetails] = useState(null);
//   const [showReportGenerator, setShowReportGenerator] = useState(false);
//   const [performanceInsights, setPerformanceInsights] = useState({
//     strengths: [],
//     areasForImprovement: [],
//     participationPattern: '',
//     trendAnalysis: ''
//   });
//   const [activeTab, setActiveTab] = useState('academic');
//   const [bloomsData, setBloomsData] = useState([]);
//   const [loadingBlooms, setLoadingBlooms] = useState(false);
//   const [academicData, setAcademicData] = useState([]);
//   const [loadingAcademic, setLoadingAcademic] = useState(false);

//   // For debugging
//   console.log('Student data received:', student);

//   // Fetch comprehensive academic data from backend
//   const fetchAcademicData = async () => {
//     if (!student || !student.rollNo) {
//       setLoadingAcademic(false);
//       return;
//     }

//     setLoadingAcademic(true);
//     try {
//       const enrollmentNumber = student.rollNo;
//       console.log('Fetching comprehensive academic data for enrollment number:', enrollmentNumber);

//       // Get the current semester
//       const currentSemester = parseInt(student.semester) || 1;

//       // Fetch comprehensive academic analysis data
//       const response = await axios.get(`http://localhost:5001/api/student-analysis/comprehensive/${enrollmentNumber}/${currentSemester}`);
      
//       console.log('Academic analysis response:', response.data);

//       if (response.data && response.data.academicData) {
//         setAcademicDetails(response.data);
        
//         // Transform academic data for charts
//         const chartData = response.data.chartData || [];
//         setAcademicData(chartData);
        
//         console.log('Academic data set successfully:', response.data.academicData);
//       } else {
//         console.log('No academic data found in response');
//         setAcademicDetails(null);
//         setAcademicData([]);
//       }
//     } catch (err) {
//       console.error('Error fetching academic data:', err);
//       setError('Failed to load academic data: ' + (err.response?.data?.error || err.message));
//       setAcademicDetails(null);
//       setAcademicData([]);
//     } finally {
//       setLoadingAcademic(false);
//     }
//   };

//   // Fetch subject-wise performance for a specific semester
//   const fetchSubjectWisePerformance = async (semester) => {
//     if (!student || !student.rollNo || !semester) {
//       console.log('Missing data for subject-wise performance fetch:', { student: !!student, rollNo: student?.rollNo, semester });
//       return;
//     }

//     try {
//       const enrollmentNumber = student.rollNo;
//       console.log(`Fetching subject-wise performance for enrollment: ${enrollmentNumber}, semester: ${semester}`);

//       const response = await axios.get(`http://localhost:5001/api/student-analysis/performance/${enrollmentNumber}/${semester}`);
      
//       console.log('Subject-wise performance response:', response.data);

//       if (response.data && response.data.subjects) {
//         // Update academic details with semester-specific data
//         setAcademicDetails(prev => ({
//           ...prev,
//           currentSemesterData: {
//             semester: response.data.semester,
//             subjects: response.data.subjects,
//             summary: response.data.summary
//           }
//         }));
//       }
//     } catch (err) {
//       console.error('Error fetching subject-wise performance:', err);
//     }
//   };

//   // Function to fetch Bloom's taxonomy data for the selected semester
//   const fetchBloomsData = async (semester) => {
//     if (!student || !student.rollNo || !semester) {
//       console.log('Missing data for Bloom\'s fetch:', { student: !!student, rollNo: student?.rollNo, semester });
//       return;
//     }

//     setLoadingBlooms(true);
//     try {
//       const enrollmentNumber = student.rollNo;
//       console.log(`Fetching Bloom's data for enrollment: ${enrollmentNumber}, semester: ${semester}`);

//       // Fetch Bloom's taxonomy distribution from the new API
//       const response = await axios.get(`http://localhost:5001/api/student-analysis/blooms/${enrollmentNumber}/${semester}`);
      
//       console.log('Bloom\'s data response:', response.data);

//       if (response.data && response.data.bloomsDistribution) {
//         setBloomsData(response.data.bloomsDistribution);
//       } else {
//         console.log('No Bloom\'s data found');
//         setBloomsData([]);
//       }
//     } catch (err) {
//       console.error('Error fetching Bloom\'s data:', err);
//       setBloomsData([]);
//     } finally {
//       setLoadingBlooms(false);
//     }
//   };

//   // Fetch semester points data from student_points table
//   useEffect(() => {
//     const fetchSemesterPoints = async () => {
//       if (!student || !student.rollNo) {
//         setLoading(false);
//         return;
//       }

//       try {
//         // Get the enrollment number
//         const enrollmentNumber = student.rollNo;
//         console.log('Fetching semester points for enrollment number:', enrollmentNumber);

//         // Get the current semester
//         const currentSemester = parseInt(student.semester) || 1;

//         // Create an array to store all semester points
//         const allSemesterPoints = [];

//         // Fetch points for each semester from 1 to current semester
//         for (let semester = 1; semester <= currentSemester; semester++) {
//           try {
//             // Use the existing fetchEventsbyEnrollandSemester endpoint
//             const response = await axios.post('http://localhost:5001/api/events/fetchEventsbyEnrollandSemester', {
//               enrollmentNumber,
//               semester: semester.toString()
//             });

//             console.log(`Semester ${semester} points response:`, response.data);

//             // If we got data, add it to our collection
//             if (response.data && Array.isArray(response.data)) {
//               // Calculate total points for this semester
//               let semesterTotalCoCurricular = 0;
//               let semesterTotalExtraCurricular = 0;

//               response.data.forEach(item => {
//                 semesterTotalCoCurricular += parseInt(item.totalCocurricular || 0);
//                 semesterTotalExtraCurricular += parseInt(item.totalExtracurricular || 0);
//               });

//               // Add semester data to our collection
//               allSemesterPoints.push({
//                 semester,
//                 totalCocurricular: semesterTotalCoCurricular,
//                 totalExtracurricular: semesterTotalExtraCurricular
//               });
//             } else if (response.data && !Array.isArray(response.data) && response.data.message) {
//               // If no activities found, still add the semester with zero points
//               allSemesterPoints.push({
//                 semester,
//                 totalCocurricular: 0,
//                 totalExtracurricular: 0
//               });
//             }
//           } catch (semesterError) {
//             console.warn(`Error fetching semester ${semester} points:`, semesterError);
//             // Still add the semester with zero points on error
//             allSemesterPoints.push({
//               semester,
//               totalCocurricular: 0,
//               totalExtracurricular: 0
//             });
//           }
//         }

//         console.log('All semester points collected:', allSemesterPoints);
//         setSemesterPoints(allSemesterPoints);

//         // Set the default selected semester to the current semester
//         setSelectedSemester(currentSemester);

//         // Fetch activities and Bloom's data for the current semester by default
//         fetchActivities(currentSemester);
//         fetchBloomsData(currentSemester);
        
//         // Fetch academic data
//         fetchAcademicData();
        
//         // Fetch subject-wise performance for current semester
//         fetchSubjectWisePerformance(currentSemester);
//       } catch (err) {
//         console.error('Error in semester points fetching process:', err);
//         setError('Failed to load semester points data');
//         setSemesterPoints([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSemesterPoints();
//   }, [student]);

//   // Function to fetch Bloom's taxonomy data for the selected semester
//   // const fetchBloomsData = async (semester) => {
//   //   if (!student || !student.rollNo || !semester) {
//   //     console.log('Missing data for Bloom\'s fetch:', { student: !!student, rollNo: student?.rollNo, semester });
//   //     return;
//   //   }

//   //   setLoadingBlooms(true);
//   //   try {
//   //     const enrollmentNumber = student.rollNo;
//   //     console.log(`Fetching Bloom's data for enrollment: ${enrollmentNumber}, semester: ${semester}`);

//   //     // Fetch Bloom's taxonomy distribution from the new API
//   //     const response = await axios.get(`http://localhost:5001/api/student-analysis/blooms/${enrollmentNumber}/${semester}`);
      
//   //     console.log('Bloom\'s data response:', response.data);

//   //     if (response.data && response.data.bloomsDistribution) {
//   //       setBloomsData(response.data.bloomsDistribution);
//   //     } else {
//   //       console.log('No Bloom\'s data found');
//   //       setBloomsData([]);
//   //     }
//   //   } catch (err) {
//   //     console.error('Error fetching Bloom\'s data:', err);
//   //     setBloomsData([]);
//   //   } finally {
//   //     setLoadingBlooms(false);
//   //   }
//   // };

//   // Fetch activities for the selected semester
//   const fetchActivities = async (semester) => {
//     if (!student || !student.rollNo || !semester) {
//       console.log('Missing data for activity fetch:', { student: !!student, rollNo: student?.rollNo, semester });
//       return;
//     }

//     setLoadingActivities(true);
//     try {
//       const enrollmentNumber = student.rollNo;
//       console.log(`Fetching activities for enrollment: ${enrollmentNumber}, semester: ${semester}`);

//       // Fetch activities for this specific semester
//       const response = await axios.post('http://localhost:5001/api/events/fetchEventsbyEnrollandSemester', {
//         enrollmentNumber,
//         semester: semester.toString()
//       });

//       console.log('Activities response:', response.data);

//       if (response.data && Array.isArray(response.data)) {
//         // Extract event IDs from the response
//         const eventIds = response.data.map(item => item.eventId).filter(id => id);
//         console.log('Event IDs found:', eventIds);

//         if (eventIds.length > 0) {
//           // Convert event IDs to comma-separated string
//           const eventIdsString = eventIds.join(',');

//           // Fetch detailed event information
//           const eventDetailsResponse = await axios.post('http://localhost:5001/api/events/fetchEventsByIds', {
//             eventIds: eventIdsString
//           });

//           console.log('Event details response:', eventDetailsResponse.data);

//           if (eventDetailsResponse.data && eventDetailsResponse.data.success && Array.isArray(eventDetailsResponse.data.data)) {
//             // Process event details and create activity list
//             const activities = eventDetailsResponse.data.data.map(event => ({
//               id: event.id,
//               name: event.eventName || 'Unknown Event',
//               position: event.position || 'Participant',
//               points: event.points || 0,
//               type: event.eventType || 'Unknown Type',
//               category: event.eventCategory || 'Unknown Category'
//             }));

//             setActivityList(activities);

//             // Generate performance insights based on the activities
//             generatePerformanceInsights(activities);
//           } else {
//             console.warn('Unexpected event details format:', eventDetailsResponse.data);
//             setActivityList([]);
//           }
//         } else {
//           console.log('No event IDs found for this semester');
//           setActivityList([]);
//         }
//       } else {
//         console.warn('Unexpected response format for activities:', response.data);
//         setActivityList([]);
//       }
//     } catch (err) {
//       console.error('Error fetching activities:', err);
//       setActivityList([]);
//     } finally {
//       setLoadingActivities(false);
//     }
//   };

//   // Generate performance insights based on activities
//   const generatePerformanceInsights = (activities) => {
//     if (!activities || activities.length === 0) {
//       setPerformanceInsights({
//         strengths: [],
//         areasForImprovement: [],
//         participationPattern: 'No participation data available for this semester.',
//         trendAnalysis: 'Insufficient data to analyze trends.'
//       });
//       return;
//     }

//     // Define all possible event categories
//     const allCategories = [
//       'Art and Craft', 'Dance', 'Debate', 'Expert Talk', 'Hackathon',
//       'Seminar', 'Sports', 'Tech Competition', 'Workshop'
//     ];

//     // Count participation by category
//     const categoryCounts = {};
//     allCategories.forEach(category => {
//       categoryCounts[category] = 0;
//     });

//     // Count total points by category
//     const categoryPoints = {};
//     allCategories.forEach(category => {
//       categoryPoints[category] = 0;
//     });

//     // Process each activity
//     activities.forEach(activity => {
//       const category = activity.category;
//       if (category && allCategories.includes(category)) {
//         categoryCounts[category] += 1;
//         categoryPoints[category] += (activity.points || 0);
//       }
//     });

//     console.log('Category participation counts:', categoryCounts);
//     console.log('Category points:', categoryPoints);

//     // Find categories with highest and lowest participation
//     const sortedCategories = Object.entries(categoryCounts)
//       .sort((a, b) => b[1] - a[1]);

//     // Get unique participation counts (sorted high to low)
//     const uniqueCounts = [...new Set(sortedCategories.map(([_, count]) => count))].sort((a, b) => b - a);

//     // Get top participation count
//     const topCount = uniqueCounts[0] || 0;

//     // Get categories with highest participation
//     const strengthCategories = sortedCategories
//       .filter(([_, count]) => count > 0 && count === topCount)
//       .map(([category]) => category);

//     // Create strengths array from top categories
//     const strengths = strengthCategories.map(category => ({
//       category,
//       count: categoryCounts[category],
//       points: categoryPoints[category]
//     }));

//     // Identify categories that have zero participation
//     const zeroParticipationCategories = sortedCategories
//       .filter(([_, count]) => count === 0)
//       .map(([category]) => category);

//     // Identify categories with low participation (not in strengths, but participated)
//     const lowParticipationCategories = sortedCategories
//       .filter(([category, count]) => count > 0 && !strengthCategories.includes(category))
//       .map(([category]) => category);

//     // Combine zero and low participation categories, prioritize zero
//     // Make sure we don't include any categories that are already in strengths
//     const improvementCategories = [...zeroParticipationCategories, ...lowParticipationCategories]
//       .filter(category => !strengthCategories.includes(category));

//     // Create areas for improvement array
//     const areasForImprovement = improvementCategories.map(category => ({
//       category,
//       count: categoryCounts[category],
//       points: categoryPoints[category]
//     }));

//     // Generate participation pattern description
//     let participationPattern = '';
//     if (strengths.length > 0) {
//       const topCategories = strengths.map(s => s.category).join(', ');
//       participationPattern = `Shows strong interest in ${topCategories} activities.`;
//     } else {
//       participationPattern = 'No clear participation pattern detected.';
//     }

//     // Generate trend analysis
//     let trendAnalysis = '';
//     const totalActivities = activities.length;
//     if (totalActivities > 3) {
//       trendAnalysis = 'Actively participates in a variety of events.';
//     } else if (totalActivities > 0) {
//       trendAnalysis = 'Limited participation in events this semester.';
//     } else {
//       trendAnalysis = 'No participation in events this semester.';
//     }

//     // Set the performance insights
//     setPerformanceInsights({
//       strengths,
//       areasForImprovement,
//       participationPattern,
//       trendAnalysis
//     });
//   };

//   // Handle semester selection change
//   const handleSemesterChange = (semester) => {
//     setSelectedSemester(semester);
//     fetchActivities(semester);
//     fetchBloomsData(semester);
//     fetchSubjectWisePerformance(semester);
//   };

//   // Prepare data for the line chart - now includes both academic and activity data
//   const prepareChartData = () => {
//     // If we have academic data from the API, use that for academic performance
//     if (academicData && academicData.length > 0) {
//       console.log('Using academic data from API for chart:', academicData);

//       // Combine academic data with activity data
//       const combinedData = academicData.map(academicPoint => {
//         // Find corresponding activity data for this semester
//         const activityPoint = semesterPoints.find(sp => sp.semester === academicPoint.semester);
        
//         return {
//           semester: academicPoint.semester,
//           academicPercentage: academicPoint.percentage || 0,
//           marksObtained: academicPoint.marksObtained || 0,
//           totalMarks: academicPoint.totalMarks || 0,
//           coCurricular: activityPoint ? activityPoint.totalCocurricular : 0,
//           extraCurricular: activityPoint ? activityPoint.totalExtracurricular : 0
//         };
//       });

//       console.log('Combined chart data:', combinedData);
//       return combinedData;
//     }

//     // Fallback to activity data only if no academic data
//     if (semesterPoints && semesterPoints.length > 0) {
//       console.log('Using activity data only for chart:', semesterPoints);

//       const chartData = semesterPoints.map(point => ({
//         semester: point.semester,
//         academicPercentage: 0, // No academic data available
//         marksObtained: 0,
//         totalMarks: 0,
//         coCurricular: point.totalCocurricular || 0,
//         extraCurricular: point.totalExtracurricular || 0
//       }));

//       chartData.sort((a, b) => a.semester - b.semester);
//       return chartData;
//     }

//     // Final fallback
//     console.log('No data available, using fallback');
//     const currentSemester = parseInt(student.semester) || 1;
//     return [{
//       semester: currentSemester,
//       academicPercentage: 0,
//       marksObtained: 0,
//       totalMarks: 0,
//       coCurricular: 0,
//       extraCurricular: 0
//     }];
//   };

//   // Generate analysis
//   const generateAnalysis = () => {
//     // Get the history data
//     const history = student.history || [];

//     // Find strengths and weaknesses
//     const strengthCategory = Object.entries(student.points)
//       .reduce((max, [category, points]) => points > max.points ? { category, points } : max,
//         { category: '', points: -1 });

//     const weaknessCategory = Object.entries(student.points)
//       .reduce((min, [category, points]) => points < min.points ? { category, points } : min,
//         { category: '', points: 101 });

//     // Find trends
//     let trends = {};

//     if (history.length > 0) {
//       ['curricular', 'coCurricular', 'extraCurricular'].forEach(category => {
//         const values = [...history.map(h => h.points[category]), student.points[category]];
//         const trend = values[values.length - 1] - values[0];
//         trends[category] = {
//           direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
//           change: Math.abs(trend)
//         };
//       });
//     }

//     // Generate participation patterns
//     const participationPatterns = {};

//     if (history.length > 0) {
//       ['curricular', 'coCurricular', 'extraCurricular'].forEach(category => {
//         const events = history.filter(h => h.events && h.events[category]);
//         participationPatterns[category] = events.length / history.length;
//       });
//     }

//     return {
//       strength: strengthCategory.category,
//       weakness: weaknessCategory.category,
//       trends,
//       participationPatterns
//     };
//   };

//   // Generate suggestions
//   const generateSuggestions = (analysis) => {
//     const suggestions = [];

//     // Add suggestion based on weakness
//     if (analysis.weakness === 'curricular') {
//       suggestions.push("Focus on improving academic performance through additional study sessions and engaging more actively in classroom discussions.");
//       suggestions.push("Consider joining study groups or seeking tutoring for challenging subjects.");
//       suggestions.push("Implement a structured study schedule with specific goals for each subject.");
//     } else if (analysis.weakness === 'coCurricular') {
//       suggestions.push("Consider joining technical clubs, participating in workshops, or attending seminars to increase co-curricular engagement.");
//       suggestions.push("Look for opportunities to participate in hackathons, coding competitions, or technical paper presentations.");
//       suggestions.push("Develop a specific technical skill through online courses or departmental workshops.");
//     } else if (analysis.weakness === 'extraCurricular') {
//       suggestions.push("Explore opportunities in sports, cultural activities, or volunteering to enhance extra-curricular participation.");
//       suggestions.push("Join at least one club or organization aligned with personal interests outside of academics.");
//       suggestions.push("Consider leadership roles in existing extra-curricular activities to develop soft skills.");
//     }

//     // Add suggestion based on trends
//     if (analysis.trends.curricular && analysis.trends.curricular.direction === 'decreasing') {
//       suggestions.push("Academic performance is declining. Schedule a meeting with subject teachers for guidance and implement structured study plan.");
//       suggestions.push("Identify specific subjects where performance has dropped and focus remedial efforts there.");
//     }

//     if (analysis.trends.coCurricular && analysis.trends.coCurricular.direction === 'decreasing') {
//       suggestions.push("Co-curricular engagement is declining. Encourage participation in upcoming technical events, hackathons, or departmental activities.");
//       suggestions.push("Reconnect with previous co-curricular interests or explore new technical areas aligned with career goals.");
//     }

//     if (analysis.trends.extraCurricular && analysis.trends.extraCurricular.direction === 'decreasing') {
//       suggestions.push("Extra-curricular participation has been decreasing. Consider exploring new interests or rejoining previous activities.");
//       suggestions.push("Balance academic pressures with regular participation in at least one extra-curricular activity for holistic development.");
//     }

//     // Add general suggestion if score is low in all areas
//     if (student.points.curricular < 40 && student.points.coCurricular < 40 && student.points.extraCurricular < 40) {
//       suggestions.push("Overall engagement is low. Consider a meeting with the academic advisor to discuss potential barriers and create an improvement plan.");
//       suggestions.push("Develop a semester-by-semester improvement plan with specific goals for each area of development.");
//     }

//     // Add specific improvement plans based on current semester
//     const currentSemester = parseInt(student.semester);
//     if (currentSemester <= 2) {
//       suggestions.push("As a junior student, focus on building foundational skills and exploring various activities to find areas of interest.");
//     } else if (currentSemester <= 4) {
//       suggestions.push("At this mid-point in the program, consider specializing in specific technical areas aligned with career goals.");
//     } else {
//       suggestions.push("As a senior student, focus on leadership roles and activities that enhance employability and career readiness.");
//     }

//     // If no specific issues found, add general improvement suggestion
//     if (suggestions.length === 0) {
//       suggestions.push("Maintain current performance and consider mentoring peers who may benefit from guidance in your areas of strength.");
//     }

//     return suggestions;
//   };

//   // Prepare category data
//   const prepareCategoryData = () => {
//     // If activities are loaded for the current semester, use that data
//     if (activityList && activityList.length > 0) {
//       // Initialize point counters for each category
//       let coCurricularPoints = 0;
//       let extraCurricularPoints = 0;

//       // Calculate points from current activities
//       activityList.forEach(activity => {
//         if (activity.type === 'co-curricular') {
//           coCurricularPoints += (activity.points || 0);
//         } else if (activity.type === 'extra-curricular') {
//           extraCurricularPoints += (activity.points || 0);
//         }
//       });

//       return [
//         { name: 'Curricular', value: 0 }, // As per requirements, curricular is set to 0
//         { name: 'Co-Curricular', value: coCurricularPoints },
//         { name: 'Extra-Curricular', value: extraCurricularPoints }
//       ];
//     }

//     // Fallback to student overall points if no activities are loaded
//     return [
//       { name: 'Curricular', value: 0 }, // As per requirements, curricular is set to 0
//       { name: 'Co-Curricular', value: student.points.coCurricular },
//       { name: 'Extra-Curricular', value: student.points.extraCurricular }
//     ];
//   };

//   // Initialize chart data
//   const chartData = prepareChartData();
//   console.log('Prepared chart data:', chartData);
//   const analysis = generateAnalysis();
//   const suggestions = generateSuggestions(analysis);
//   const categoryData = prepareCategoryData();
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

//   const formatCategoryName = (category) => {
//     switch (category) {
//       case 'curricular':
//         return 'Curricular';
//       case 'coCurricular':
//         return 'Co-Curricular';
//       case 'extraCurricular':
//         return 'Extra-Curricular';
//       default:
//         return category;
//     }
//   };

//   const handleSendAnalysis = () => {
//     // In a real app, this would make an API call to send the analysis
//     console.log('Sending analysis for student:', student.name);

//     alert(`Analysis for ${student.name} would be shared with the student and parents in a real application.`);
//     onClose();
//   };

//   const toggleReportGenerator = () => {
//     setShowReportGenerator(prev => !prev);
//   };

//   // Bloom's taxonomy helper functions
//   const getBloomsLevels = () => {
//     return ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
//   };

//   const getBloomClass = (score) => {
//     if (score >= 85) return "excellent-bloom";
//     if (score >= 70) return "good-bloom";
//     if (score >= 55) return "average-bloom";
//     return "weak-bloom";
//   };

//   const getBloomsRadarData = () => {
//     if (!bloomsData || bloomsData.length === 0) return [];
    
//     const bloomsAggregation = {};
//     const bloomLevels = getBloomsLevels();
    
//     // Initialize aggregation
//     bloomLevels.forEach(level => {
//       bloomsAggregation[level] = { totalMarks: 0, count: 0 };
//     });
    
//     // Aggregate marks from all subjects
//     bloomsData.forEach(subjectData => {
//       subjectData.bloomsLevels.forEach(levelData => {
//         if (bloomsAggregation[levelData.level]) {
//           bloomsAggregation[levelData.level].totalMarks += (levelData.percentage || levelData.marks || 0);
//           bloomsAggregation[levelData.level].count += 1;
//         }
//       });
//     });
    
//     // Calculate average scores
//     return bloomLevels.map(level => ({
//       level,
//       score: bloomsAggregation[level].count > 0 
//         ? Math.round(bloomsAggregation[level].totalMarks / bloomsAggregation[level].count)
//         : 0
//     }));
//   };

//   const getBloomsBarData = () => {
//     if (!bloomsData || bloomsData.length === 0) return [];
    
//     return bloomsData.map(subject => {
//       const barData = { subject: subject.subject.length > 10 ? subject.subject.substring(0, 10) + '...' : subject.subject };
      
//       getBloomsLevels().forEach(level => {
//         const levelData = subject.bloomsLevels.find(bl => bl.level === level);
//         barData[level] = levelData ? Math.round(levelData.percentage || levelData.marks || 0) : 0;
//       });
      
//       return barData;
//     });
//   };

//   const getStrongestBloomLevel = () => {
//     const radarData = getBloomsRadarData();
//     if (radarData.length === 0) return "No data available";
    
//     const strongest = radarData.reduce((max, current) => 
//       current.score > max.score ? current : max
//     );
    
//     return `${strongest.level} (${strongest.score}%) - Shows excellent ${strongest.level.toLowerCase()} skills`;
//   };

//   const getWeakestBloomLevel = () => {
//     const radarData = getBloomsRadarData();
//     if (radarData.length === 0) return "No data available";
    
//     const weakest = radarData.reduce((min, current) => 
//       current.score < min.score ? current : min
//     );
    
//     return `${weakest.level} (${weakest.score}%) - Needs improvement in ${weakest.level.toLowerCase()} skills`;
//   };

//   const getCognitiveBalance = () => {
//     const radarData = getBloomsRadarData();
//     if (radarData.length === 0) return "No data available";
    
//     const scores = radarData.map(item => item.score);
//     const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
//     const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
//     const standardDeviation = Math.sqrt(variance);
    
//     if (standardDeviation < 10) {
//       return `Well-balanced cognitive development (σ=${standardDeviation.toFixed(1)})`;
//     } else if (standardDeviation < 20) {
//       return `Moderately balanced with some variation (σ=${standardDeviation.toFixed(1)})`;
//     } else {
//       return `Significant variation in cognitive levels (σ=${standardDeviation.toFixed(1)}) - Focus on weaker areas`;
//     }
//   };

//   return (
//     <div className="modal-backdrop enhanced-modal">
//       <div className="modal-container enhanced-student-analysis-modal">
//         <div className="modal-header enhanced-header">
//           <div className="header-content">
//             <h2>Comprehensive Student Analysis: {student.name}</h2>
//             <div className="header-tabs">
//               <button
//                 className={`tab-btn ${activeTab === 'academic' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('academic')}
//               >
//                 📚 Academic
//               </button>
//               <button
//                 className={`tab-btn ${activeTab === 'nonacademic' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('nonacademic')}
//               >
//                 🎯 Co/Extra-Curricular
//               </button>
//             </div>
//           </div>
//           <button className="close-btn enhanced-close" onClick={onClose}>&times;</button>
//         </div>

//         <div className="modal-content-sa enhanced-content">
//           <div className="student-details enhanced-details">
//             <div className="detail-card">
//               <div className="detail-icon">🎓</div>
//               <div className="detail-content">
//                 <span className="detail-label">Roll Number</span>
//                 <span className="detail-value">{student.rollNo}</span>
//               </div>
//             </div>
//             <div className="detail-card">
//               <div className="detail-icon">👥</div>
//               <div className="detail-content">
//                 <span className="detail-label">Batch</span>
//                 <span className="detail-value">{student.batch}</span>
//               </div>
//             </div>
//             <div className="detail-card">
//               <div className="detail-icon">📅</div>
//               <div className="detail-content">
//                 <span className="detail-label">Current Semester</span>
//                 <span className="detail-value">{student.semester}</span>
//               </div>
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="tab-content">
//             {activeTab === 'academic' && (
//               <div className="academic-analysis-container">
//                 {loadingAcademic ? (
//                   <div className="loading-message">
//                     <p>Loading academic data...</p>
//                   </div>
//                 ) : academicDetails ? (
//                   <AcademicAnalysis 
//                     student={student} 
//                     academicData={academicDetails}
//                     selectedSemester={selectedSemester}
//                     onSemesterChange={handleSemesterChange}
//                   />
//                 ) : (
//                   <div className="no-academic-data">
//                     <h3>📚 Academic Performance Analysis</h3>
//                     <div className="no-data-message">
//                       <p>No academic data available for this student.</p>
//                       <p className="data-note">Academic data will be available after faculty has entered marks for subjects.</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'nonacademic' && (
//               <div className="nonacademic-analysis-container">
//                 <div className="analysis-section-nonacademic">
//                   <h3>🎯 Co-Curricular & Extra-Curricular Performance Trends</h3>

//                   <div className="chart-container-nonacademic">
//                     {loading ? (
//                       <div className="loading-message">
//                         <p>Loading performance data...</p>
//                       </div>
//                     ) : error ? (
//                       <div className="error-message">
//                         <p>{error}</p>
//                       </div>
//                     ) : (
//                       <ResponsiveContainer width="100%" height={300}>
//                         <LineChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis
//                             dataKey="semester"
//                             label={{ value: 'Semester', position: 'insideBottomRight', offset: -10 }}
//                             tickCount={10}
//                             type="number"
//                             domain={[1, 'dataMax']}
//                             allowDecimals={false}
//                           />
//                           <YAxis label={{ value: 'Points/Percentage', angle: -90, position: 'insideLeft' }} />
//                           <Tooltip formatter={(value, name) => {
//                             if (name === 'academicPercentage') return [`${value}%`, 'Academic Performance'];
//                             return [`${value} points`, name];
//                           }} />
//                           <Legend />
//                           <Line
//                             type="monotone"
//                             dataKey="academicPercentage"
//                             stroke="#FF6B6B"
//                             name="Academic Performance"
//                             strokeWidth={2}
//                             dot={{ r: 6 }}
//                             activeDot={{ r: 8 }}
//                           />
//                           <Line
//                             type="monotone"
//                             dataKey="coCurricular"
//                             stroke="#00C49F"
//                             name="Co-Curricular"
//                             strokeWidth={2}
//                             dot={{ r: 6 }}
//                             activeDot={{ r: 8 }}
//                           />
//                           <Line
//                             type="monotone"
//                             dataKey="extraCurricular"
//                             stroke="#FFBB28"
//                             name="Extra-Curricular"
//                             strokeWidth={2}
//                             dot={{ r: 6 }}
//                             activeDot={{ r: 8 }}
//                           />
//                         </LineChart>
//                       </ResponsiveContainer>
//                     )}
//                   </div>
//                 </div>

//                 {/* Activity List and Pie Chart Section */}
//                 <div className="activity-pie-container">
//                   <div className="activity-section">
//                     <h3>📋 Activity List</h3>

//                     {/* Semester Filter */}
//                     <div className="semester-filter-nonacademic">
//                       <label className="semester-label-nonacademic">Select Semester: </label>
//                       <div className="semester-buttons-nonacademic">
//                         {semesterPoints.map(point => (
//                           <button
//                             key={point.semester}
//                             className={`semester-btn-nonacademic ${selectedSemester === point.semester ? 'active-nonacademic' : ''}`}
//                             onClick={() => handleSemesterChange(point.semester)}
//                           >
//                             Semester {point.semester}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                     <div className="activity-list-container-nonacademic">
//                       {loadingActivities ? (
//                         <div className="loading-message">
//                           <p>Loading activities...</p>
//                         </div>
//                       ) : activityList && activityList.length > 0 ? (
//                         <table className="activity-table-nonacademic">
//                           <thead>
//                             <tr>
//                               <th>Activity Name</th>
//                               <th>Type</th>
//                               <th>Position</th>
//                               <th>Points</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {activityList.map(activity => (
//                               <tr key={activity.id}>
//                                 <td>{activity.name}</td>
//                                 <td>{activity.type}</td>
//                                 <td>{activity.position}</td>
//                                 <td>{activity.points}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       ) : (
//                         <div className="no-data-message">
//                           <p>No activities found for semester {selectedSemester}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="pie-chart-section">
//                     <h4>📊 Performance Breakdown</h4>
//                     <ResponsiveContainer width="100%" height={220}>
//                       <PieChart>
//                         <Pie
//                           data={categoryData}
//                           cx="50%"
//                           cy="50%"
//                           labelLine={false}
//                           outerRadius={70}
//                           fill="#8884d8"
//                           dataKey="value"
//                           nameKey="name"
//                           label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                         >
//                           {categoryData.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                           ))}
//                         </Pie>
//                         <Tooltip />
//                         <Legend />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>

//                 {/* Bloom's Taxonomy Analysis Section */}
//                 <div className="blooms-analysis-container">
//                   <h3>🧠 Bloom's Taxonomy Analysis</h3>
                  
//                   {loadingBlooms ? (
//                     <div className="loading-message">
//                       <p>Loading Bloom's taxonomy data...</p>
//                     </div>
//                   ) : bloomsData && bloomsData.length > 0 ? (
//                     <>
//                       {/* Bloom's Taxonomy Radar Chart */}
//                       <div className="blooms-charts-section">
//                         <div className="blooms-radar-chart">
//                           <h4>📊 Overall Cognitive Performance</h4>
//                           <ResponsiveContainer width="100%" height={300}>
//                             <RadarChart data={getBloomsRadarData()}>
//                               <PolarGrid />
//                               <PolarAngleAxis dataKey="level" fontSize={12} />
//                               <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
//                               <Radar
//                                 name="Performance"
//                                 dataKey="score"
//                                 stroke="#3674B5"
//                                 fill="#3674B5"
//                                 fillOpacity={0.3}
//                                 strokeWidth={2}
//                                 dot={{ fill: "#3674B5", strokeWidth: 1, r: 4 }}
//                               />
//                               <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
//                             </RadarChart>
//                           </ResponsiveContainer>
//                         </div>

//                         {/* Subject-wise Bloom's Bar Chart */}
//                         <div className="blooms-bar-chart">
//                           <h4>📈 Subject-wise Bloom's Distribution</h4>
//                           <ResponsiveContainer width="100%" height={300}>
//                             <BarChart data={getBloomsBarData()}>
//                               <CartesianGrid strokeDasharray="3 3" />
//                               <XAxis dataKey="subject" fontSize={10} />
//                               <YAxis fontSize={10} />
//                               <Tooltip />
//                               <Legend />
//                               <Bar dataKey="Remember" stackId="a" fill="#FF6B6B" />
//                               <Bar dataKey="Understand" stackId="a" fill="#4ECDC4" />
//                               <Bar dataKey="Apply" stackId="a" fill="#45B7D1" />
//                               <Bar dataKey="Analyze" stackId="a" fill="#96CEB4" />
//                               <Bar dataKey="Evaluate" stackId="a" fill="#FFEAA7" />
//                               <Bar dataKey="Create" stackId="a" fill="#DDA0DD" />
//                             </BarChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>

//                       {/* Bloom's Taxonomy Heatmap */}
//                       <div className="blooms-heatmap-section">
//                         <h4>🔥 Bloom's Taxonomy Heatmap</h4>
//                         <div className="blooms-heatmap">
//                           <div className="heatmap-grid">
//                             <div className="heatmap-header">
//                               <div className="subject-col">Subject</div>
//                               <div className="bloom-col">Remember</div>
//                               <div className="bloom-col">Understand</div>
//                               <div className="bloom-col">Apply</div>
//                               <div className="bloom-col">Analyze</div>
//                               <div className="bloom-col">Evaluate</div>
//                               <div className="bloom-col">Create</div>
//                             </div>
//                             {bloomsData.map((subject, index) => (
//                               <div key={index} className="heatmap-row">
//                                 <div className="subject-cell">{subject.subject.length > 15 ? subject.subject.substring(0, 15) + '...' : subject.subject}</div>
//                                 {getBloomsLevels().map((level) => {
//                                   const levelData = subject.bloomsLevels.find(bl => bl.level === level);
//                                   const score = levelData ? Math.round(levelData.percentage || levelData.marks) : 0;
//                                   return (
//                                     <div
//                                       key={level}
//                                       className={`bloom-cell ${getBloomClass(score)}`}
//                                       title={`${subject.subject} - ${level}: ${score}%`}
//                                     >
//                                       {score}
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             ))}
//                           </div>

//                           <div className="bloom-legend">
//                             <span className="legend-item">
//                               <span className="legend-dot excellent-bloom"></span>Excellent (85+)
//                             </span>
//                             <span className="legend-item">
//                               <span className="legend-dot good-bloom"></span>Good (70-84)
//                             </span>
//                             <span className="legend-item">
//                               <span className="legend-dot average-bloom"></span>Average (55-69)
//                             </span>
//                             <span className="legend-item">
//                               <span className="legend-dot weak-bloom"></span>Weak (&lt;55)
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Bloom's Insights */}
//                       <div className="blooms-insights">
//                         <h4>💡 Cognitive Analysis Insights</h4>
//                         <div className="insights-grid">
//                           <div className="insight-card">
//                             <h5>Strongest Cognitive Level</h5>
//                             <p>{getStrongestBloomLevel()}</p>
//                           </div>
//                           <div className="insight-card">
//                             <h5>Areas for Development</h5>
//                             <p>{getWeakestBloomLevel()}</p>
//                           </div>
//                           <div className="insight-card">
//                             <h5>Overall Cognitive Balance</h5>
//                             <p>{getCognitiveBalance()}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <div className="no-data-message">
//                       <p>No Bloom's taxonomy data available for semester {selectedSemester}</p>
//                       <p className="data-note">Data will be available after academic marks are processed and CO mappings are complete.</p>
//                     </div>
//                   )}
//                 </div>

//                 {/* Performance Insights and Suggestions Container */}
//                 <div className="insights-suggestions-container">
//                   <div className="insights-section">
//                     <h3>🎯 Performance Insights</h3>
//                     {loadingActivities ? (
//                       <div className="loading-message">
//                         <p>Analyzing performance data...</p>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="insights-grid">
//                           {/* Strengths Card */}
//                           <div className="insight-card">
//                             <h4>Strengths</h4>
//                             {performanceInsights.strengths.length > 0 ? (
//                               <div className="insight-list">
//                                 <p className="insight-header">Strong performance in:</p>
//                                 <ul>
//                                   {performanceInsights.strengths.map((strength, index) => (
//                                     <li key={index} className="insight-item">
//                                       <span className="category-name">{strength.category}</span>
//                                       <span className="points-badge strength">{strength.points} pts</span>
//                                     </li>
//                                   ))}
//                                 </ul>
//                               </div>
//                             ) : (
//                               <p>No specific strengths identified in this semester.</p>
//                             )}
//                           </div>

//                           {/* Areas for Improvement Card */}
//                           <div className="insight-card">
//                             <h4>Areas for Improvement</h4>
//                             {performanceInsights.areasForImprovement.length > 0 ? (
//                               <div className="insight-list">
//                                 <p className="insight-header">Suggested areas to explore:</p>
//                                 <ul>
//                                   {performanceInsights.areasForImprovement.slice(0, 4).map((area, index) => (
//                                     <li key={index} className="insight-item">
//                                       <span className="category-name">{area.category}</span>
//                                       {area.count === 0 ? (
//                                         <span className="participation-status no-participation">Not participated</span>
//                                       ) : (
//                                         <span className="points-badge weakness">{area.points} pts</span>
//                                       )}
//                                     </li>
//                                   ))}
//                                 </ul>
//                               </div>
//                             ) : (
//                               <p>No specific areas for improvement identified.</p>
//                             )}
//                           </div>

//                           {/* Participation Pattern Card */}
//                           <div className="insight-card">
//                             <h4>Participation Pattern</h4>
//                             <p>{performanceInsights.participationPattern}</p>
//                           </div>

//                           {/* Trend Analysis Card */}
//                           <div className="insight-card">
//                             <h4>Trend Analysis</h4>
//                             <p>{performanceInsights.trendAnalysis}</p>
//                           </div>
//                         </div>

//                         {/* Additional Analysis Feature */}
//                         <div className="additional-analysis">
//                           <h4>📈 Activity Engagement Metrics</h4>
//                           <div className="analysis-metrics">
//                             <div className="metric-item">
//                               <span className="metric-label">Total Activities</span>
//                               <span className="metric-value">{activityList.length}</span>
//                             </div>
//                             <div className="metric-item">
//                               <span className="metric-label">Avg Points/Activity</span>
//                               <span className="metric-value">
//                                 {activityList.length > 0 
//                                   ? Math.round(activityList.reduce((sum, act) => sum + (act.points || 0), 0) / activityList.length)
//                                   : 0}
//                               </span>
//                             </div>
//                             <div className="metric-item">
//                               <span className="metric-label">Categories Explored</span>
//                               <span className="metric-value">
//                                 {new Set(activityList.map(act => act.category)).size}
//                               </span>
//                             </div>
//                             <div className="metric-item">
//                               <span className="metric-label">Leadership Roles</span>
//                               <span className="metric-value">
//                                 {activityList.filter(act => 
//                                   act.position && 
//                                   (act.position.toLowerCase().includes('leader') || 
//                                    act.position.toLowerCase().includes('head') ||
//                                    act.position.toLowerCase().includes('captain'))
//                                 ).length}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </>
//                     )}
//                   </div>

//                   <div className="suggestions-section">
//                     <h3>💡 Improvement Suggestions</h3>
//                     <div className="suggestions-container">
//                       <ul className="suggestions-list">
//                         {suggestions.map((suggestion, index) => (
//                           <li key={index} className="suggestion-item">{suggestion}</li>
//                         ))}
//                       </ul>

//                       <div className="action-plan">
//                         <h4>Recommended Action Plan</h4>
//                         <div className="action-steps">
//                           <div className="action-step">
//                             <div className="step-number">1</div>
//                             <div className="step-content">
//                               <h5>Short-term (Next 1-2 months)</h5>
//                               <p>{analysis.weakness === 'curricular'
//                                 ? 'Schedule weekly study sessions focusing on weaker subjects'
//                                 : analysis.weakness === 'coCurricular'
//                                   ? 'Join at least one technical club or workshop this month'
//                                   : 'Participate in at least one extracurricular event this month'}</p>
//                             </div>
//                           </div>

//                           <div className="action-step">
//                             <div className="step-number">2</div>
//                             <div className="step-content">
//                               <h5>Mid-term (Next 3-4 months)</h5>
//                               <p>{analysis.weakness === 'curricular'
//                                 ? 'Aim for 10% improvement in academic scores by next assessment'
//                                 : analysis.weakness === 'coCurricular'
//                                   ? 'Contribute to a technical project or competition'
//                                   : 'Take on a specific role in an extracurricular activity'}</p>
//                             </div>
//                           </div>

//                           <div className="action-step">
//                             <div className="step-number">3</div>
//                             <div className="step-content">
//                               <h5>Long-term (This semester)</h5>
//                               <p>Achieve balanced growth across all three areas with at least 15% improvement in {formatCategoryName(analysis.weakness)} points</p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="modal-footer">
//           <button className="btn-cancel" onClick={onClose}>Close</button>
//           <button className="btn-generate-report" onClick={toggleReportGenerator}>
//             Generate Report
//           </button>
//           {/* <button className="btn-share" onClick={handleSendAnalysis}>
//             Share Analysis with Student & Parents
//           </button> */}

//           {showReportGenerator && (
//             <ReportGeneratorModal
//               student={student}
//               onClose={toggleReportGenerator}
//               semesterPoints={semesterPoints}
//               academicDetails={academicDetails}
//               activityList={activityList}
//               categoryData={categoryData}
//               performanceInsights={performanceInsights}
//               chartData={chartData}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentAnalysis;










































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
              "http://localhost:5001/api/events/fetchEventsbyEnrollandSemester",
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
        "http://localhost:5001/api/events/fetchEventsbyEnrollandSemester",
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
            "http://localhost:5001/api/events/fetchEventsByIds",
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
                className={`tab-btn ${
                  activeTab === "academic" ? "active" : ""
                }`}
                onClick={() => setActiveTab("academic")}
              >
                📚 Academic
              </button>
              <button
                className={`tab-btn ${
                  activeTab === "nonacademic" ? "active" : ""
                }`}
                onClick={() => setActiveTab("nonacademic")}
              >
                🎯 Co/Extra-Curricular
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
                  <h3>
                    🎯 Co-Curricular & Extra-Curricular Performance Trends
                  </h3>

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
                            className={`semester-btn-nonacademic ${
                              selectedSemester === point.semester
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
                    <h4>📊 Performance Breakdown</h4>
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
                    <h3>🎯 Performance Insights</h3>
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
                      <h3>🎯 Domain Affinity & Networking</h3>

                      {/* Domain Affinity Radar Chart */}
                      <div className="analytics-feature">
                        <h4>🎯 Domain Affinity Analysis</h4>
                        <p className="feature-description">
                          Visual representation of student's natural inclination
                          towards different technology domains based on
                          participation patterns.
                        </p>
                        <div className="radar-chart-container">
                          <ResponsiveContainer width="100%" height={350}>
                            <RadarChart data={domainAffinityData}>
                              <PolarGrid />
                              <PolarAngleAxis
                                dataKey="domain"
                                tick={{ fontSize: 11 }}
                              />
                              <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fontSize: 9 }}
                              />
                              <Radar
                                name="Domain Affinity"
                                dataKey="score"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.3}
                                strokeWidth={2}
                              />
                              <Tooltip
                                formatter={(value) => [
                                  `${value}%`,
                                  "Affinity Score",
                                ]}
                              />
                              <Legend />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="domain-insights">
                          <div className="top-domains">
                            <h5>🏆 Top Domain Affinities:</h5>
                            <div className="domain-list">
                              {domainAffinityData
                                .sort((a, b) => b.score - a.score)
                                .slice(0, 3)
                                .map((domain, index) => (
                                  <div
                                    key={domain.domain}
                                    className="domain-item"
                                  >
                                    <span className="domain-rank">
                                      #{index + 1}
                                    </span>
                                    <span className="domain-name">
                                      {domain.domain}
                                    </span>
                                    <span className="domain-score">
                                      {domain.score}%
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Networking & Collaboration Index */}
                      <div className="analytics-feature">
                        <h4>🤝 Networking & Collaboration Index</h4>
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
                        <div className="network-visualization">
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
                        </div>
                      </div>
                    </div>

                    <div className="suggestions-section">
                      <h3>🌈 Diversity & Insights</h3>

                      {/* Participation Diversity Index */}
                      <div className="analytics-feature">
                        <h4>🌈 Participation Diversity Index</h4>
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
                            <h5>📊 Category Participation:</h5>
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={diversityData.sunburstData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  nameKey="name"
                                  label={({ name, value }) =>
                                    value > 1 ? `${name}: ${value}` : name
                                  }
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
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="diversity-insights">
                          <div className="insight-grid">
                            <div className="insight-card diversity-card">
                              <h6>🎯 Profile Type</h6>
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

                      {/* Advanced Analytics Summary */}
                      <div className="analytics-feature">
                        <h4>📊 Analytics Summary</h4>
                        <div className="analytics-summary">
                          <div className="summary-grid">
                            <div className="summary-item">
                              <div className="summary-icon">🎯</div>
                              <div className="summary-content">
                                <div className="summary-label">Top Domain</div>
                                <div className="summary-value">
                                  {
                                    domainAffinityData.sort(
                                      (a, b) => b.score - a.score
                                    )[0]?.domain
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="summary-item">
                              <div className="summary-icon">🤝</div>
                              <div className="summary-content">
                                <div className="summary-label">
                                  Collaboration Level
                                </div>
                                <div className="summary-value">
                                  {networkingData.collaborationIndex >= 80
                                    ? "High"
                                    : networkingData.collaborationIndex >= 60
                                    ? "Medium"
                                    : "Low"}
                                </div>
                              </div>
                            </div>
                            {/* <div className="summary-item">
                              <div className="summary-icon">🌈</div>
                              <div className="summary-content">
                                <div className="summary-label">
                                  Diversity Level
                                </div>
                                <div className="summary-value">
                                  {diversityData.diversityIndex >= 80
                                    ? "Excellent"
                                    : diversityData.diversityIndex >= 60
                                    ? "Good"
                                    : "Needs Improvement"}
                                </div>
                              </div>
                            </div> */}
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
