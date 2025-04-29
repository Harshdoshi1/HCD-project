import React, { useState } from "react";
import Navbar from "../navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";
import StudentGrades from "../grading/StudentGrades";
import Settings from "../settings/Settings";
import "./Dashboard.css";
import Assignedsubjects from "../assignedSubjects/Assignedsubjects";

const DashboardHOD = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const handleStudentSelect = (studentId) => {
    setSelectedStudentId(studentId);
  };

  const handleBackToList = () => {
    setSelectedStudentId(null);
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="main-content">
        <div className="dashboard-content">
          {activeItem === "dashboard" && (
            <>
              <div className="dashboard-sections">
                <div className="section">
                  <h2>Recent Activity</h2>
                  <div className="activity-list">
                    <div className="activity-item">
                      Updated grades for CS101 - Batch 2023
                    </div>
                    <div className="activity-item">
                      Added new student in Physics class
                    </div>
                    <div className="activity-item">
                      Generated semester report
                    </div>
                    <div className="activity-item">
                      Modified attendance records
                    </div>
                  </div>
                </div>

                <div className="section">
                  <h2>Quick Actions</h2>
                  <div className="quick-actions">
                    <button className="action-button">Add Students</button>
                    <button className="action-button">Update Grades</button>
                    <button className="action-button">View Reports</button>
                    <button
                      className="action-button"
                      onClick={() => setActiveItem("settings")}
                    >
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeItem === "students" && (
            <>
              {selectedStudentId ? (
                <div>
                  <button onClick={handleBackToList} className="back-button">
                    Back to Students List
                  </button>
                  <StudentDetail studentId={selectedStudentId} />
                </div>
              ) : (
                <StudentsList onStudentSelect={handleStudentSelect} />
              )}
            </>
          )}

          {activeItem === "grades" && <StudentGrades />}
          {activeItem === "subjects" && <Assignedsubjects />}
          {activeItem === "settings" && <Settings />}
        </div>
      </div>
    </div>
  );
};

export default DashboardHOD;
