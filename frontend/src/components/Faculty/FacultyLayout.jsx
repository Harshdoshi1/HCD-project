import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar/Sidebar";
import StudentGrades from "./grading/StudentGrades";
import Assignedsubjects from "./assignedSubjects/Assignedsubjects";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import "./FacultyLayout.css";

const FacultyLayout = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        studentsGraded: 42,
        pendingGrades: 18,
        averageScore: 78,
        submissionRate: 85,
        courseProgress: 65,
        attendance: 92,
      });

      setRecentActivity([
        { date: "2023-05-15", activity: "Graded CS101 assignments", count: 24 },
        { date: "2023-05-14", activity: "Updated course materials", count: 3 },
        { date: "2023-05-12", activity: "Attendance recorded", count: 35 },
        { date: "2023-05-10", activity: "Quiz results published", count: 28 },
        { date: "2023-05-08", activity: "Feedback provided", count: 15 },
      ]);

      setLoading(false);

      // Trigger animations after a small delay
      setTimeout(() => setAnimate(true), 300);
    }, 1000);
  }, []);

  const courseData = [
    { name: "Week 1", completion: 100 },
    { name: "Week 2", completion: 95 },
    { name: "Week 3", completion: 88 },
    { name: "Week 4", completion: 75 },
    { name: "Week 5", completion: 65 },
    { name: "Week 6", completion: 45 },
    { name: "Week 7", completion: 30 },
    { name: "Week 8", completion: 10 },
  ];

  const gradeDistribution = [
    { name: "A", value: 35, color: "#4CAF50" },
    { name: "B", value: 28, color: "#2196F3" },
    { name: "C", value: 22, color: "#FFC107" },
    { name: "D", value: 10, color: "#FF9800" },
    { name: "F", value: 5, color: "#F44336" },
  ];

  const attendanceData = [
    { name: "Week 1", present: 92, absent: 8 },
    { name: "Week 2", present: 88, absent: 12 },
    { name: "Week 3", present: 95, absent: 5 },
    { name: "Week 4", present: 90, absent: 10 },
    { name: "Week 5", present: 86, absent: 14 },
  ];

  return (
    <div className="faculty-layout">
      <Sidebar
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      <main
        className={`faculty-main ${
          isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
      >
        <div className="dashboard-content">
          {activeItem === "dashboard" && (
            <>
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading dashboard data...</p>
                </div>
              ) : (
                <div className="dashboard-sections">
                  <header className="faculty-dashboard-header">
                    <h1>Faculty Dashboard</h1>
                    <div className="dashboard-actions">
                      <button className="btn-primary">
                        <Calendar size={16} style={{ marginRight: "6px" }} />{" "}
                        Record Attendance
                      </button>
                      <button className="btn-secondary">
                        <BookOpen size={16} style={{ marginRight: "6px" }} />{" "}
                        Generate Reports
                      </button>
                    </div>
                  </header>

                  <div className="stats-cards">
                    <div className="stat-card">
                      <div className="stat-icon students-icon">
                        <Users size={24} color="#3674B5" />
                      </div>
                      <div className="stat-content">
                        <h3>Students Graded</h3>
                        <div className="stat-value">{stats.studentsGraded}</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon pending-icon">
                        <Clock size={24} color="#3674B5" />
                      </div>
                      <div className="stat-content">
                        <h3>Pending Grades</h3>
                        <div className="stat-value">{stats.pendingGrades}</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon score-icon">
                        <Award size={24} color="#3674B5" />
                      </div>
                      <div className="stat-content">
                        <h3>Average Score</h3>
                        <div className="stat-value">{stats.averageScore}%</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon attendance-icon">
                        <CheckCircle size={24} color="#3674B5" />
                      </div>
                      <div className="stat-content">
                        <h3>Attendance Rate</h3>
                        <div className="stat-value">{stats.attendance}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="charts-row">
                    <div className="chart-box">
                      <h3>Course Completion Progress</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={courseData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                          animationBegin={300}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#666", fontSize: 12 }}
                          />
                          <YAxis tick={{ fill: "#666", fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              border: "none",
                            }}
                            formatter={(value) => [`${value}%`, "Completion"]}
                          />
                          <Bar
                            dataKey="completion"
                            fill="#3674B5"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-box">
                      <h3>Grade Distribution</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={gradeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                            animationBegin={300}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          >
                            {gradeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              border: "none",
                            }}
                            formatter={(value, name) => [
                              `${value}%`,
                              `Grade ${name}`,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="charts-row">
                    <div className="chart-box">
                      <h3>Attendance Tracking</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                          data={attendanceData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                          animationBegin={300}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#666", fontSize: 12 }}
                          />
                          <YAxis tick={{ fill: "#666", fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              border: "none",
                            }}
                            formatter={(value) => [`${value}%`, ""]}
                          />
                          <Legend wrapperStyle={{ paddingTop: 10 }} />
                          <Line
                            type="monotone"
                            dataKey="present"
                            name="Present"
                            stroke="#4CAF50"
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                            activeDot={{
                              r: 6,
                              strokeWidth: 0,
                              fill: "#4CAF50",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="absent"
                            name="Absent"
                            stroke="#F44336"
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                            activeDot={{
                              r: 6,
                              strokeWidth: 0,
                              fill: "#F44336",
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-box recent-activity">
                      <h3>Recent Activity</h3>
                      <div className="activity-list">
                        {recentActivity.map((activity, index) => (
                          <div
                            className="activity-item"
                            key={index}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="activity-date">{activity.date}</div>
                            <div className="activity-content">
                              <div className="activity-title">
                                {activity.activity}
                              </div>
                              <div className="activity-count">
                                {activity.count} items
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {activeItem === "grades" && <StudentGrades />}
          {activeItem === "subjects" && <Assignedsubjects />}
        </div>
      </main>
    </div>
  );
};

export default FacultyLayout;
