import React, { useState } from 'react';
import { LayoutDashboard, Users, GraduationCap, Settings, Menu, User, LogOut, BarChart2 } from 'lucide-react';
import ProfileModal from './ProfileModal';
import Logout from './Logout';
import './Sidebar.css';

const Sidebar = ({ activeItem, setActiveItem, isCollapsed, setIsCollapsed }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLogoutOpen(false);
            localStorage.clear();
            await new Promise(resolve => setTimeout(resolve, 100));
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    };

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "students", label: "Students", icon: Users },
        { id: "faculty", label: "Faculty", icon: Users },
        { id: "batches", label: "Batches", icon: Users },
        { id: "subjects", label: "Subjects", icon: Users },
        { id: "grades", label: "Grades", icon: GraduationCap },
        { id: "studentAnalysis", label: "Student Analysis", icon: BarChart2 },
        { id: "events", label: "Events", icon: Users }
    ];

    const handleItemClick = (item) => {
        setActiveItem(item.id);
    };

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
                            onClick={() => handleItemClick(item)}
                        >
                            <item.icon size={24} className="sidebar-icon" />
                            {!isCollapsed && <span className="sidebar-text">{item.label}</span>}
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
