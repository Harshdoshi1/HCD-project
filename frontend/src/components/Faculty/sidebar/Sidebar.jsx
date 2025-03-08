import React, { useState } from 'react';
import { LayoutDashboard, Users, GraduationCap, BookMarked, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeItem, setActiveItem, isExpanded, setIsExpanded }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'subjects', label: 'Subjects', icon: BookMarked },
        { id: 'grades', label: 'Grades', icon: GraduationCap },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="sidebar-header">

                <button
                    className="toggle-button"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => setActiveItem(item.id)}
                >
                    <item.icon size={20} />
                    {isExpanded && <span>{item.label}</span>}
                </button>
            ))}
        </div>
    );
};

export default Sidebar;