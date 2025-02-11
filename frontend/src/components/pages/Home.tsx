import React from 'react';
import '../../components/pages/css/Home.css';

interface RecentActivity {
  id: string;
  studentId: string;
  time: string;
  action: string;
}

interface QuickAction {
  id: string;
  text: string;
}

const Home: React.FC = () => {
  const recentActivities: RecentActivity[] = [
    { id: '1', studentId: 'STU2023101', time: '2h ago', action: 'Grade Updated' },
    { id: '2', studentId: 'STU2023102', time: '2h ago', action: 'Grade Updated' },
    { id: '3', studentId: 'STU2023103', time: '2h ago', action: 'Grade Updated' },
  ];

  const quickActions: QuickAction[] = [
    { id: '1', text: 'Register new student' },
    { id: '2', text: 'Modify student grades' },
    { id: '3', text: 'Generate reports' },
    { id: '4', text: 'Configure dashboard' },
  ];

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo">Faculty Portal</div>
        <ul className="menu">
          <li>Dashboard</li>
          <li>Batch 2023-2027</li>
          <li>Semester 1</li>
          <li>Students</li>
          <li>Grades</li>
          <li>Settings</li>
        </ul>
      </div>

      <div className="main-content">
        <header className="header">
          <h1>Welcome, Professor</h1>
        </header>

        <div className="stats-section">
          <div className="stats-box">
            <h2>120</h2>
            <p>Current Semester</p>
          </div>
          <div className="stats-box">
            <h2>5</h2>
            <p>Active Subjects</p>
          </div>
        </div>

        <div className="content-grid">
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            {quickActions.map((action) => (
              <button key={action.id} className="action-button">
                {action.text}
              </button>
            ))}
          </div>

          <div className="recent-activity">
            <h3>Recent Activity</h3>
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-header">
                  <span className="student-id">{activity.studentId}</span>
                  <span className="time">{activity.time}</span>
                </div>
                <p className="action">{activity.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;