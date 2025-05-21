
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import './PerformanceOverview.css';

const PerformanceOverview = ({ selectedBatch, selectedSemester }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch students based on selected batch and semester
  useEffect(() => {
    fetchStudents();
  }, [selectedBatch, selectedSemester]);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('PerformanceOverview: Fetching students with filters:', { batch: selectedBatch, semester: selectedSemester });
      let response;
      let url = '';

      // Different API calls based on filter selections
      if (selectedBatch === 'all' && selectedSemester === 'all') {
        // Fetch all students
        url = 'http://localhost:5001/api/students/getAllStudents';
        response = await axios.get(url);
      } else if (selectedBatch !== 'all' && selectedSemester === 'all') {
        // First get the batch ID from the batch name
        try {
          // Get all batches
          const batchesResponse = await axios.get('http://localhost:5001/api/batches/getAllBatches');
          console.log('Batches response:', batchesResponse.data);

          // Find the batch ID for the selected batch name
          const selectedBatchObj = batchesResponse.data.find(batch => batch.batchName === selectedBatch);

          if (selectedBatchObj && selectedBatchObj.id) {
            // Fetch students by batch ID
            url = `http://localhost:5001/api/students/getStudentsByBatch/${selectedBatchObj.id}`;
            console.log('Fetching from URL:', url);
            response = await axios.get(url);
          } else {
            throw new Error(`Batch ID not found for batch name: ${selectedBatch}`);
          }
        } catch (batchError) {
          console.error('Error fetching batch ID:', batchError);
          setError(`Failed to get batch ID for ${selectedBatch}. Please try again.`);
          setStudents([]);
          setLoading(false);
          return;
        }
      } else if (selectedBatch !== 'all' && selectedSemester !== 'all') {
        // Fetch students by both batch and semester
        url = `http://localhost:5001/api/marks/students/${selectedBatch}/${selectedSemester}`;
        response = await axios.get(url);
      } else {
        // Invalid filter combination (all batches but specific semester)
        setError('Please select a specific batch when filtering by semester');
        setStudents([]);
        setLoading(false);
        return;
      }

      if (response && response.data) {
        let dataToProcess = response.data;

        // If the data is not an array, try to extract it from common response structures
        if (!Array.isArray(dataToProcess)) {
          if (dataToProcess.students) {
            dataToProcess = dataToProcess.students;
          } else if (dataToProcess.data && Array.isArray(dataToProcess.data)) {
            dataToProcess = dataToProcess.data;
          }
        }

        // Process student data to match the expected format
        const formattedStudents = Array.isArray(dataToProcess) ? await Promise.all(dataToProcess.map(async student => {
          // Initialize points object with curricular as 0
          let points = {
            curricular: 0, // Keep curricular points as zero as requested
            coCurricular: 0,
            extraCurricular: 0
          };

          // Fetch co-curricular and extra-curricular points from student_points table
          try {
            const enrollmentNumber = student.enrollmentNumber || student.rollNo;
            const semester = student.currnetsemester || selectedSemester;

            if (enrollmentNumber && semester) {
              const pointsResponse = await axios.post('http://localhost:5001/api/events/fetchEventsbyEnrollandSemester', {
                enrollmentNumber,
                semester
              });

              console.log('Student points response in PerformanceOverview:', pointsResponse.data);

              if (pointsResponse.data && Array.isArray(pointsResponse.data)) {
                // Sum up all co-curricular and extra-curricular points
                pointsResponse.data.forEach(activity => {
                  points.coCurricular += parseInt(activity.totalCocurricular || 0);
                  points.extraCurricular += parseInt(activity.totalExtracurricular || 0);
                });
              } else if (pointsResponse.data && pointsResponse.data.totalCocurricular) {
                // If it's a single object with the totals
                points.coCurricular = parseInt(pointsResponse.data.totalCocurricular || 0);
                points.extraCurricular = parseInt(pointsResponse.data.totalExtracurricular || 0);
              }
            }
          } catch (error) {
            console.error('Error fetching student points in PerformanceOverview:', error);
            // Keep the default values if there's an error
          }

          return {
            id: student.id || Math.random().toString(36).substr(2, 9),
            name: student.name || student.studentName || 'Unknown',
            rollNo: student.enrollmentNumber || student.rollNo || 'N/A',
            batch: student.batchName || (student.Batch ? student.Batch.batchName : selectedBatch),
            semester: student.semesterNumber || student.currnetsemester || selectedSemester,
            points: points,
            // Add empty history array for new API data that might not have history
            history: student.history || []
          };
        })) : [];

        setStudents(formattedStudents);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching students for performance overview:', err);
      setError('Failed to load students for charts');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };
  const calculateAverages = () => {
    if (!students || students.length === 0) return { curricular: 0, coCurricular: 0, extraCurricular: 0, total: 0 };

    const totals = students.reduce((acc, student) => {
      return {
        curricular: acc.curricular + student.points.curricular,
        coCurricular: acc.coCurricular + student.points.coCurricular,
        extraCurricular: acc.extraCurricular + student.points.extraCurricular
      };
    }, { curricular: 0, coCurricular: 0, extraCurricular: 0 });

    const count = students.length;
    return {
      curricular: Math.round(totals.curricular / count),
      coCurricular: Math.round(totals.coCurricular / count),
      extraCurricular: Math.round(totals.extraCurricular / count),
      total: Math.round((totals.curricular + totals.coCurricular + totals.extraCurricular) / (count * 3))
    };
  };

  const getPerformanceDistribution = () => {
    const ranges = [
      { name: '0-25', curricular: 0, coCurricular: 0, extraCurricular: 0 },
      { name: '26-50', curricular: 0, coCurricular: 0, extraCurricular: 0 },
      { name: '51-75', curricular: 0, coCurricular: 0, extraCurricular: 0 },
      { name: '76-100', curricular: 0, coCurricular: 0, extraCurricular: 0 }
    ];

    if (!students || students.length === 0) return ranges;

    students.forEach(student => {
      const categorizePoints = (points, category) => {
        if (points <= 25) ranges[0][category]++;
        else if (points <= 50) ranges[1][category]++;
        else if (points <= 75) ranges[2][category]++;
        else ranges[3][category]++;
      };

      categorizePoints(student.points.curricular, 'curricular');
      categorizePoints(student.points.coCurricular, 'coCurricular');
      categorizePoints(student.points.extraCurricular, 'extraCurricular');
    });

    return ranges;
  };

  const getCategoryTrends = () => {
    if (!students || students.length === 0) return [];

    const semesters = [...new Set(students.flatMap(s => s.history?.map(h => h.semester) || []))].sort();
    if (semesters.length === 0) return [];
    return semesters.map(sem => ({
      semester: sem,
      curricular: students.reduce((acc, s) => {
        const hist = s.history?.find(h => h.semester === sem);
        return hist ? acc + hist.points.curricular : acc;
      }, 0) / students.length,
      coCurricular: students.reduce((acc, s) => {
        const hist = s.history?.find(h => h.semester === sem);
        return hist ? acc + hist.points.coCurricular : acc;
      }, 0) / students.length,
      extraCurricular: students.reduce((acc, s) => {
        const hist = s.history?.find(h => h.semester === sem);
        return hist ? acc + hist.points.extraCurricular : acc;
      }, 0) / students.length,
    }));
  };

  const getParticipationRate = () => {
    if (!students || students.length === 0) return [];

    return students.map(student => {
      const total = student.history?.reduce((acc, h) => {
        return acc + (h.events.curricular ? 1 : 0) +
          (h.events.coCurricular ? 1 : 0) +
          (h.events.extraCurricular ? 1 : 0);
      }, 0) || 0;
      return {
        name: student.name,
        participation: (total / (student.history?.length * 3 || 1)) * 100
      };
    });
  };

  const averages = calculateAverages();
  const distribution = getPerformanceDistribution();

  const overallData = [
    { name: 'Curricular', value: averages.curricular },
    { name: 'Co-Curricular', value: averages.coCurricular },
    { name: 'Extra-Curricular', value: averages.extraCurricular }
  ];

  const COLORS = ['#3E92CC', '#4CAF50', '#e74c3c'];

  return (
    <div className="performance-overview">
      {loading && <div className="loading-overlay">Loading charts...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Overview stats section removed as requested */}

      <div className="charts-container">
        <div className="chart-box">
          <h3>Points Distribution</h3>
          <BarChart
            width={260}
            height={240}
            data={distribution}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="curricular" name="Curricular" fill="#9b87f5" />
            <Bar dataKey="coCurricular" name="Co-Curricular" fill="#1EAEDB" />
            <Bar dataKey="extraCurricular" name="Extra-Curricular" fill="#33C3F0" />
          </BarChart>
        </div>

        <div className="chart-box">
          <h3>Category Averages</h3>
          <PieChart width={260} height={240}>
            <Pie
              data={overallData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {overallData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#9b87f5', '#1EAEDB', '#33C3F0'][index % 3]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="chart-box">
          <h3>Performance Trends</h3>
          <LineChart
            width={260}
            height={240}
            data={getCategoryTrends()}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="curricular" stroke="#9b87f5" />
            <Line type="monotone" dataKey="coCurricular" stroke="#1EAEDB" />
            <Line type="monotone" dataKey="extraCurricular" stroke="#33C3F0" />
          </LineChart>
        </div>

      </div>
    </div>
  );
};

export default PerformanceOverview;