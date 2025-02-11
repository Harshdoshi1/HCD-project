import React, { useState } from 'react';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import Faculty from "../dashboard/managefaculty/Faculty";
import './Dashboard.css';


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
