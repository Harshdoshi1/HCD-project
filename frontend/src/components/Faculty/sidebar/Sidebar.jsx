import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookMarked,
  GraduationCap,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ProfileModal from "./ProfileModal";
import Logout from "./Logout";
import "./Sidebar.css";

const Sidebar = ({ activeItem, setActiveItem, isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");

    // Close the logout modal
    setIsLogoutOpen(false);

    // Redirect to login page
    navigate("/");
  };

  const menuItems = [
    { id: "subjects", label: "Subjects", icon: BookMarked },
    { id: "grades", label: "Grades", icon: GraduationCap },
  ];

  return (
    <>
      <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
        <div className="sidebar-header">
          <button
            className="toggle-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${
                activeItem === item.id ? "active" : ""
              }`}
              onClick={() => {
                setActiveItem(item.id);
                navigate(`/faculty/${item.id}`);
              }}
            >
              <item.icon size={20} className="sidebar-icon" />
              {isExpanded && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className="sidebar-item profile"
            onClick={() => setIsProfileOpen(true)}
          >
            <User size={24} className="sidebar-icon" />
            <span className={`sidebar-label ${isExpanded ? "" : "hidden"}`}>
              Profile
            </span>
          </button>
          <button
            className="sidebar-item logout"
            onClick={() => setIsLogoutOpen(true)}
          >
            <LogOut size={24} className="sidebar-icon" />
            <span className={`sidebar-label ${isExpanded ? "" : "hidden"}`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {isProfileOpen && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {isLogoutOpen && (
        <Logout
          isOpen={isLogoutOpen}
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={handleLogout}
        />
      )}
    </>
  );
};

export default Sidebar;
