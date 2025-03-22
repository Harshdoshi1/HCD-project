

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, GraduationCap, BookMarked, Settings, Menu, User, LogOut } from "lucide-react";
import ProfileModal from "./ProfileModal";
import Logout from "./Logout";
import "./Sidebar.css";

const Sidebar = ({ activeItem, setActiveItem, isCollapsed, setIsCollapsed }) => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const handleLogout = () => {
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('email');
        
        // Close the logout modal
        setIsLogoutOpen(false);
        
        // Redirect to login page
        navigate('/');
    };

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "students", label: "Students", icon: Users },
        { id: "faculty", label: "Faculty", icon: Users },
        { id: "batches", label: "Batches", icon: Users },
        { id: "subjects", label: "Subjects", icon: BookMarked },
        { id: "grades", label: "Grades", icon: GraduationCap },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <>
            <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
                <div className="sidebar-header">
                    <button className="toggle-button" onClick={() => setIsCollapsed(!isCollapsed)}>
                        <Menu size={24} />
                    </button>
                </div>
                <div className="sidebar-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-item ${activeItem === item.id ? "active" : ""}`}
                            onClick={() => setActiveItem(item.id)}
                        >
                            <item.icon size={24} className="sidebar-icon" />
                            <span className={`sidebar-label ${isCollapsed ? "hidden" : ""}`}>{item.label}</span>
                        </button>
                    ))}
                </div>
                <div className="sidebar-footer">
                    <button className="sidebar-item profile" onClick={() => setIsProfileOpen(true)}>
                        <User size={24} className="sidebar-icon" />
                        <span className={`sidebar-label ${isCollapsed ? "hidden" : ""}`}>Profile</span>
                    </button>
                    <button className="sidebar-item logout" onClick={() => setIsLogoutOpen(true)}>
                        <LogOut size={24} className="sidebar-icon" />
                        <span className={`sidebar-label ${isCollapsed ? "hidden" : ""}`}>Logout</span>
                    </button>
                </div>
            </div>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

            <Logout isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={handleLogout} />
        </>
    );
};

export default Sidebar;
