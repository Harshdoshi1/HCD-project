import React from 'react';
import { LayoutDashboard, Users, GraduationCap, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeItem, setActiveItem }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'faculty', label: 'Faculty', icon: Users },
        { id: 'grades', label: 'Grades', icon: GraduationCap },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img className="logo-img" src="https://ictmu.in/frontpage/page/images/ict_logo2.png" alt="ict-logo" />
                <h3>Some Text</h3>
            </div>
            {menuItems.map((item) => (

                <button
                    key={item.id}
                    className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => setActiveItem(item.id)}
                >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default Sidebar;