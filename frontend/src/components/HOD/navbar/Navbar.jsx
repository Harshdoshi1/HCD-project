import React from 'react';
import { Bell, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    return (
        <div className="navbar">
            <div className="nav-right">
                <button className="nav-button">
                    <Bell size={20} />
                </button>
                <img className="profile-img" src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png" alt="profile-img" />
            </div>
        </div>
    );
};

export default Navbar;