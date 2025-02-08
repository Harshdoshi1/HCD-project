import React, { useState } from 'react';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import Faculty from "../dashboard/managefaculty/Faculty";
import './Dashboard.css';

// const Dashboard = () => {
//     const [activeItem, setActiveItem] = useState('dashboard');
//     const [selectedBatch, setSelectedBatch] = useState('');
//     const [selectedSemester, setSelectedSemester] = useState('');
//     const [selectedSubject, setSelectedSubject] = useState('');

//     // Generate batch options (current year - 3 to current year + 1)
//     const currentYear = new Date().getFullYear();
//     const batchOptions = [];
//     for (let i = -3; i <= 1; i++) {
//         const startYear = currentYear + i;
//         batchOptions.push(`${startYear}-${startYear + 4}`);
//     }

//     const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];
//     const subjectOptions = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science'];

//     const recentActivities = [
//         'Updated grades for CS101 - Batch 2023',
//         'Added new student in Physics class',
//         'Generated semester report',
//         'Modified attendance records'
//     ];

//     return (
//         <div className="dashboard-container">
//             <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
//             <div className="main-content">
//                 <Navbar />
//                 <div className="dashboard-content">
//                     <div className="filters-section">
//                         <select
//                             value={selectedBatch}
//                             onChange={(e) => setSelectedBatch(e.target.value)}
//                             className="filter-select"
//                         >
//                             <option value="">Select Batch</option>
//                             {batchOptions.map(batch => (
//                                 <option key={batch} value={batch}>{batch}</option>
//                             ))}
//                         </select>

//                         <select
//                             value={selectedSemester}
//                             onChange={(e) => setSelectedSemester(e.target.value)}
//                             className="filter-select"
//                         >
//                             <option value="">Select Semester</option>
//                             {semesterOptions.map(sem => (
//                                 <option key={sem} value={sem}>Semester {sem}</option>
//                             ))}
//                         </select>

//                         <select
//                             value={selectedSubject}
//                             onChange={(e) => setSelectedSubject(e.target.value)}
//                             className="filter-select"
//                         >
//                             <option value="">Select Subject</option>
//                             {subjectOptions.map(subject => (
//                                 <option key={subject} value={subject}>{subject}</option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="stats-grid">
//                         <div className="stat-card">
//                             <h3>Total Students</h3>
//                             <p>45</p>
//                         </div>
//                         <div className="stat-card">
//                             <h3>Average Grade</h3>
//                             <p>B+</p>
//                         </div>
//                         <div className="stat-card">
//                             <h3>Attendance Rate</h3>
//                             <p>85%</p>
//                         </div>
//                     </div>

//                     <div className="dashboard-sections">
//                         <div className="section">
//                             <h2>Recent Activity</h2>
//                             <div className="activity-list">
//                                 {recentActivities.map((activity, index) => (
//                                     <div key={index} className="activity-item">
//                                         {activity}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="section">
//                             <h2>Quick Actions</h2>
//                             <div className="quick-actions">
//                                 <button className="action-button">Add Students</button>
//                                 <button className="action-button">Update Grades</button>
//                                 <button className="action-button">View Reports</button>
//                                 <button className="action-button">Settings</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;


// import React, { useState } from 'react';
// import Navbar from '../navbar/Navbar';
// import Sidebar from '../sidebar/Sidebar';
// import Faculty from '../faculty/Faculty'; // Import Faculty component
// import './Dashboard.css';

const Dashboard = () => {
    const [activeItem, setActiveItem] = useState('dashboard');

    return (
        <div className="dashboard-container">
            <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
            <div className="main-content">
                <Navbar />
                <div className="dashboard-content">
                    {activeItem === 'dashboard' && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h3>Total Students</h3>
                                    <p>45</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Average Grade</h3>
                                    <p>B+</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Attendance Rate</h3>
                                    <p>85%</p>
                                </div>
                            </div>

                            <div className="dashboard-sections">
                                <div className="section">
                                    <h2>Recent Activity</h2>
                                    <div className="activity-list">
                                        <div className="activity-item">Updated grades for CS101 - Batch 2023</div>
                                        <div className="activity-item">Added new student in Physics class</div>
                                        <div className="activity-item">Generated semester report</div>
                                        <div className="activity-item">Modified attendance records</div>
                                    </div>
                                </div>

                                <div className="section">
                                    <h2>Quick Actions</h2>
                                    <div className="quick-actions">
                                        <button className="action-button">Add Students</button>
                                        <button className="action-button">Update Grades</button>
                                        <button className="action-button">View Reports</button>
                                        <button className="action-button">Settings</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeItem === 'faculty' && <Faculty />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
