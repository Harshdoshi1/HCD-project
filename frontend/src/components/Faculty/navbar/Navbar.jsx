import React from 'react';
import { Bell, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    return (
        <div className="navbar">
            <div className="welcome">Welcome, Professor</div>
            <div className="nav-right">
                <button className="nav-button">
                    <Bell size={20} />
                </button>
                <button className="nav-button">
                    <User size={20} />
                </button>
            </div>
        </div>
    );
};

export default Navbar;