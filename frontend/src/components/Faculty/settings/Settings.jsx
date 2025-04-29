import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Bell, Shield, HelpCircle } from "lucide-react";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>Profile Information</h2>
        <div className="profile-info">
          <div className="info-item">
            <User size={20} />
            <span>Name: {user.name}</span>
          </div>
          <div className="info-item">
            <Shield size={20} />
            <span>Role: {user.role}</span>
          </div>
          <div className="info-item">
            <Bell size={20} />
            <span>Email: {user.email}</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Account Settings</h2>
        <div className="settings-actions">
          <button className="settings-button" onClick={() => {}}>
            <User size={20} />
            <span>Edit Profile</span>
          </button>
          <button className="settings-button" onClick={() => {}}>
            <HelpCircle size={20} />
            <span>Help & Support</span>
          </button>
          <button className="settings-button logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
