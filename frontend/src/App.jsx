import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login/Login';
import Dashboard from './components/HOD/dashboard/Dashboard';
import StudentDetail from '../src/components/HOD/displaystudents/StudentDetails'
import './App.css';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboardHOD" element={<Dashboard />} />
        <Route path="/student/:id" element={<StudentDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
