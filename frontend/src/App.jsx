import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/login/Login';
import DashboardFaculty from './components/Faculty/dashboard/Dashboard';
import DashboardHOD from './components/HOD/dashboard/Dashboard';
import StudentDetail from './components/HOD/displaystudents/StudentDetails';
import { ThemeProvider } from './context/ThemeContext';
import './App.css'; // Keep this if you have this file

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboardFaculty" element={<DashboardFaculty />} />
          <Route path="/faculty/subjects" element={<DashboardFaculty />} />
          <Route path="/faculty/grades" element={<DashboardFaculty />} />
          {/* Backward compatibility: redirect old HOD route to new admin base */}
          <Route path="/dashboardHOD" element={<Navigate to="/admin" replace />} />
          {/* New Admin routes (handled internally by DashboardHOD based on path) */}
          <Route path="/admin/*" element={<DashboardHOD />} />
          <Route path="/student/:id" element={<StudentDetail />} />
        </Routes>
        <ToastContainer />
      </Router>
    </ThemeProvider>
  );
}

export default App;