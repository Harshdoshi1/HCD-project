import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login/Login';
import DashboardFaculty from './components/Faculty/dashboard/Dashboard';
import DashboardHOD from './components/HOD/dashboard/Dashboard';
<<<<<<< Updated upstream
import StudentDetail from '../src/components/HOD/displaystudents/StudentDetails'
import './App.css';
=======
import StudentDetail from './components/HOD/displaystudents/StudentDetails';
import { ThemeProvider } from './context/ThemeContext';
import './App.css'; // Keep this if you have this file
import TestSupabase from './components/TestSupabase'
>>>>>>> Stashed changes



const App = () => {
  return (
<<<<<<< Updated upstream
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboardFaculty" element={<DashboardFaculty />} />
=======
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboardFaculty" element={<DashboardFaculty />} />
          <Route path="/dashboardHOD" element={<DashboardHOD />} />
          <Route path="/student/:id" element={<StudentDetail />} />
        </Routes>
        <ToastContainer />
      </Router>
      <TestSupabase />
    </ThemeProvider>
  );
}
>>>>>>> Stashed changes

        <Route path="/dashboardHOD" element={<DashboardHOD />} />
        <Route path="/student/:id" element={<StudentDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
