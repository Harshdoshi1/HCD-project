// import React, { useState } from 'react';
// import { LayoutDashboard, Users, GraduationCap, BookMarked, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
// import './Sidebar.css';

// const Sidebar = ({ activeItem, setActiveItem, isExpanded, setIsExpanded }) => {
//     const menuItems = [
//         { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//         { id: 'subjects', label: 'Subjects', icon: BookMarked },
//         { id: 'grades', label: 'Grades', icon: GraduationCap },
//         { id: 'settings', label: 'Settings', icon: Settings },
//     ];

//     return (
//         <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
//             <div className="sidebar-header">

//                 <button
//                     className="toggle-button"
//                     onClick={() => setIsExpanded(!isExpanded)}
//                 >
//                     {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
//                 </button>
//             </div>
//             {menuItems.map((item) => (
//                 <button
//                     key={item.id}
//                     className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
//                     onClick={() => setActiveItem(item.id)}
//                 >
//                     <item.icon size={20} />
//                     {isExpanded && <span>{item.label}</span>}
//                 </button>
//             ))}
//         </div>
//     );
// };

// export default Sidebar;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, BookOpen, Award, UserCircle, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import ProfileModal from "./ProfileModal";
import Logout from "./Logout";
import "./Sidebar.css";

const Sidebar = ({ activeItem, setActiveItem, isExpanded, setIsExpanded }) => {
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
        { id: "dashboard", label: "Dashboard", icon: BarChart2 },
        { id: "subjects", label: "Subjects", icon: BookOpen },
        { id: "grades", label: "Grades", icon: Award },
        // { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <>
            <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
                <div className="sidebar-header">
                    <button className="toggle-button" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <div className="sidebar-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-item ${activeItem === item.id ? "active" : ""}`}
                            onClick={() => setActiveItem(item.id)}
                        >
                            <item.icon size={20} className="sidebar-icon" />
                            {isExpanded && <span>{item.label}</span>}
                        </button>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <button className="sidebar-item profile" onClick={() => setIsProfileOpen(true)}>
                        <UserCircle size={24} className="sidebar-icon" />
                        <span className={`sidebar-label ${isExpanded ? "" : "hidden"}`}>Profile</span>
                    </button>
                    <button className="sidebar-item logout" onClick={() => setIsLogoutOpen(true)}>
                        <LogOut size={24} className="sidebar-icon" />
                        <span className={`sidebar-label ${isExpanded ? "" : "hidden"}`}>Logout</span>
                    </button>
                </div>
            </div>

            {isProfileOpen && <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}

            {isLogoutOpen && <Logout isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={handleLogout} />}
        </>
    );
};

export default Sidebar;
