import React, { useState } from "react";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import ChangePasswordModal from "./ChangePasswordModal";
import "./ProfileModal.css";

const ProfileModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const email = localStorage.getItem('email') || '';

    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    return (
        <>
            <div className="modal-overlay-pm" onClick={onClose}>
                <div className="modal-content-pm" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header-pm">
                        <h2>Profile</h2>
                        <button className="close-btn-pm" onClick={onClose}>&times;</button>
                    </div>

                    <div className="profile-content">
                        <div className="profile-section">
                            <div className="profile-section-header">
                                <FiUser className="section-icon" />
                                <h3>Personal Information</h3>
                            </div>
                            <div className="profile-info">
                                <div className="info-item">
                                    <FiUser className="icon" />
                                    <div className="info-content">
                                        <span className="info-label">Name</span>
                                        <p>{userData.name || 'Not available'}</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <FiMail className="icon" />
                                    <div className="info-content">
                                        <span className="info-label">Email</span>
                                        <p>{email || 'Not available'}</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <FiUser className="icon" />
                                    <div className="info-content">
                                        <span className="info-label">Role</span>
                                        <p>{userData.role || 'Not available'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button 
                            className="change-password-btn" 
                            onClick={() => setForgotPasswordOpen(true)}
                        >
                            <RiLockPasswordLine className="action-icon" /> Change Password
                        </button>
                    </div>
                </div>
            </div>

            {forgotPasswordOpen && <ChangePasswordModal onClose={() => setForgotPasswordOpen(false)} />}
        </>
    );
};

export default ProfileModal;
