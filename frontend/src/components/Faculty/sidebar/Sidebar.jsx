import React from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookMarked,
  Settings,
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ activeItem, setActiveItem, isExpanded, setIsExpanded }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "subjects", label: "Subjects", icon: BookMarked },
    { id: "grades", label: "Grades", icon: GraduationCap },
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
            <User size={24} className="sidebar-icon" />
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