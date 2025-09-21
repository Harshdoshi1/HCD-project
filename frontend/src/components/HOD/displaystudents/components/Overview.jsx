import React, { useState, useEffect } from 'react';
import { Book, Award, Trophy } from 'lucide-react';
import './Overview.css';
import { buildUrl } from '../../../../utils/apiConfig';

const Overview = ({ student }) => {
  const [academicData, setAcademicData] = useState({
    cpiData: [],
    spiData: [],
    rankData: [],
    currentCPI: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Only fetch if we have a valid enrollment number
    if (student && student.enrollmentNumber) {
      fetchStudentAcademicData(student.enrollmentNumber);
      console.log('Fetching student academic data for enrollment number:', student.enrollmentNumber);
    }
  }, [student]);

  const fetchStudentAcademicData = async (enrollmentNumber) => {
    try {
      setAcademicData(prev => ({ ...prev, loading: true, error: null }));
      console.log('Fetching student academic data for enrollment number:', enrollmentNumber);
      
      const response = await fetch(buildUrl(`/studentCPI/enrollment/${enrollmentNumber}`));
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student academic data');
      }

      const data = await response.json();
      console.log('Student CPI data:', data);

      if (data && data.length > 0) {
        // Sort by semester number
        const sortedData = [...data].sort((a, b) =>
          a.Semester?.semesterNumber - b.Semester?.semesterNumber
        );

        // Extract CPI, SPI, and Rank data for charts
        const cpiData = sortedData.map(item => ({
          semester: item.Semester?.semesterNumber,
          value: item.CPI
        }));

        const spiData = sortedData.map(item => ({
          semester: item.Semester?.semesterNumber,
          value: item.SPI
        }));

        const rankData = sortedData.map(item => ({
          semester: item.Semester?.semesterNumber,
          rank: item.Rank,
          // Assuming a default class size if not available
          totalStudents: 120
        }));

        // Get the most recent CPI (from the highest semester)
        const currentCPI = sortedData[sortedData.length - 1]?.CPI || 0;

        setAcademicData({
          cpiData,
          spiData,
          rankData,
          currentCPI,
          loading: false,
          error: null
        });
      } else {
        setAcademicData(prev => ({
          ...prev,
          loading: false,
          error: 'No academic data available for this student'
        }));
      }
    } catch (error) {
      console.error('Error fetching student academic data:', error);
      setAcademicData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load academic data'
      }));
    }
  };

  // If loading, show loading state
  if (academicData.loading) {
    return <div className="loading">Loading academic data...</div>;
  }

  return (
    <div className="student-overview-sdp">
      <div className="overview-card-sdp">
        <div className="overview-card-sdp-header">
          <h3><Book size={18} /> Academic Information</h3>
        </div>
        <div className="overview-card-sdp-content">
          <div className="detail-grid">
            <div className="detail-item-sdp">
              <span className="detail-label-sdp">Program</span>
              <span className="detail-value-sdp">{student?.Department?.departmentName || 'Not Available'}</span>
            </div>
            <div className="detail-item-sdp">
              <span className="detail-label-sdp">Batch</span>
              <span className="detail-value-sdp">{student?.Batch?.batchName || 'Not Available'}</span>
            </div>
            <div className="detail-item-sdp">
              <span className="detail-label-sdp">Enrollment Number</span>
              <span className="detail-value-sdp">{student?.enrollmentNumber || 'Not Available'}</span>
            </div>
            <div className="detail-item-sdp">
              <span className="detail-label-sdp">Current Semester</span>
              <span className="detail-value-sdp">{student?.semester || 'Not Available'}</span>
            </div>
            <div className="detail-item-sdp">
              <span className="detail-label-sdp">Student Name</span>
              <span className="detail-value-sdp">{student?.name || 'Not Available'}</span>
            </div>
          </div>
        </div>
      </div>

      {academicData.error ? (
        <div className="error-message">{academicData.error}</div>
      ) : (
        <>
          <div className="overview-card-sdp">
            <div className="overview-card-sdp-header">
              <h3><Award size={18} /> Academic Performance</h3>
            </div>
            <div className="overview-card-sdp-content">
              <div className="gpa-chart">
                <h4 className="gpa-chart-title">GPA Progression</h4>
                <div className="gpa-bar-container">
                  {academicData.spiData.map((semGpa) => (
                    <div key={semGpa.semester} className="gpa-bar-item">
                      <div className="gpa-bar" style={{ height: `${(semGpa.value / 10) * 100}%` }}>
                        <span className="gpa-value">{semGpa.value.toFixed(2)}</span>
                      </div>
                      <div className="semester-label">Sem {semGpa.semester}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rank-display">
                <h4 className="rank-title">Semester Ranks</h4>
                <div className="rank-grid">
                  {academicData.rankData.map((rankData) => (
                    <div key={rankData.semester} className="rank-item">
                      <div className="rank-semester">Sem {rankData.semester}</div>
                      <div className="rank-value">
                        <Trophy size={14} />
                        <span>{rankData.rank}</span>
                        <span className="rank-total">/{rankData.totalStudents}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cumulative-gpa">
                <div className="cumulative-value">
                  <span className="cumulative-label">Current CGPA</span>
                  <span className="cumulative-number">{academicData.currentCPI ? academicData.currentCPI.toFixed(2) : 'N/A'}</span>
                  {academicData.currentCPI && (
                    <div className="cgpa-progress">
                      <div className="cgpa-fill" style={{ width: `${(academicData.currentCPI / 10) * 100}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overview-card-sdp">
            <div className="overview-card-sdp-header">
              <h3><Trophy size={18} /> Recent Achievements</h3>
            </div>
            <div className="overview-card-sdp-content">
              {student?.achievements && student.achievements.length > 0 ? (
                <ul className="achievements-list">
                  {student.achievements.map((achievement) => (
                    <li key={achievement.id} className="achievement-item">
                      <div className="achievement-icon">
                        <Trophy size={16} />
                      </div>
                      <div className="achievement-details">
                        <h4>{achievement.title}</h4>
                        <p>{achievement.description}</p>
                        <span className="achievement-date">{achievement.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No achievements recorded for this student.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
