import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import DashboardFaculty from "./components/Faculty/dashboard/Dashboard";
import DashboardHOD from "./components/HOD/dashboard/Dashboard";
import StudentDetail from "./components/HOD/displaystudents/StudentDetails";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";
import TestSupabase from "./components/TestSupabase";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
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
};

export default App;
