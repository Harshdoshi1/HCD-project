import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/login/Login';
import DashboardFaculty from './components/Faculty/dashboard/Dashboard';
import DashboardHOD from './components/HOD/dashboard/Dashboard';
import StudentDetail from './components/HOD/displaystudents/StudentDetails';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';
import './responsive.css'; // Global responsive styles

// Fix for Chrome extension error
if (typeof window !== 'undefined') {
  // Create a dummy object with all possible properties that extensions might try to access
  window.lsB_matchId = {};
  window.lsB = {};
  window.chrome = window.chrome || {};
  
  // Prevent extensions from breaking the app
  window.addEventListener('error', (event) => {
    if (event.message.includes('chrome-extension') || 
        event.message.includes('Cannot read properties of undefined')) {
      event.preventDefault();
      console.warn('Prevented extension error:', event.message);
    }
  }, true);
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div></div>}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboardFaculty" element={<DashboardFaculty />} />
            <Route path="/dashboardHOD" element={<DashboardHOD />} />
            <Route path="/student/:id" element={<StudentDetail />} />
          </Routes>
        </Suspense>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </Router>
    </ThemeProvider>
  );
}

export default App;