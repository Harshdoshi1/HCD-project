import React from 'react';
import { LayoutDashboard, Users, GraduationCap, BookMarked, Settings, Menu, User, LogOut, Moon, Sun } from 'lucide-react';
import './Sidebar.css';
import { useTheme } from '../../../context/ThemeContext';

const Sidebar = ({ activeItem, setActiveItem, isCollapsed, setIsCollapsed }) => {
    const { darkMode, toggleDarkMode } = useTheme();
    
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'faculty', label: 'Faculty', icon: Users },
        { id: 'batches', label: 'Batches', icon: Users },
        { id: 'subjects', label: 'Subjects', icon: BookMarked },
        { id: 'grades', label: 'Grades', icon: GraduationCap },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${darkMode ? 'dark-sidebar' : ''}`}>
            <div className="sidebar-header">
                <button className="toggle-button" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <Menu size={24} />
                </button>
                
                {/* Dark theme toggle button */}
                <div className="theme-toggle">
                    <button 
                        onClick={toggleDarkMode} 
                        className="theme-toggle-btn"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>
            <div className="sidebar-menu">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                        onClick={() => setActiveItem(item.id)}
                    >
                        <item.icon size={24} className="sidebar-icon" />
                        <span className={`sidebar-label ${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
                    </button>
                ))}
            </div>
            <div className="sidebar-footer">
                <button className="sidebar-item profile">
                    <User size={24} className="sidebar-icon" />
                    <span className={`sidebar-label ${isCollapsed ? 'hidden' : ''}`}>Profile</span>
                </button>
                <button className="sidebar-item logout">
                    <LogOut size={24} className="sidebar-icon" />
                    <span className={`sidebar-label ${isCollapsed ? 'hidden' : ''}`}>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;