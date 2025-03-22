import React, { useState } from "react";
import { FiUser, FiMail, FiMapPin, FiPhone, FiLock } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import ChangePasswordModal from "./ChangePasswordModal";
import "./ProfileModal.css";

const ProfileModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    const handleSave = () => {
        console.log("Profile Updated:", { username, email, location, mobile, password });
        onClose();
    };

    return (
        <>
            <div className="modal-overlay-pm" onClick={onClose}>
                <div className="modal-content-pm" onClick={(e) => e.stopPropagation()}>
                    <h2>Profile</h2>

                    <div className="input-group-hod">
                        <FiUser className="icon" />
                        <input type="text" className="fpm" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <div className="input-group-hod">
                        <FiMail className="icon" />
                        <input type="email" className="fpm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="input-group-hod">
                        <FiMapPin className="icon" />
                        <input type="text" className="fpm" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>

                    <div className="input-group-hod">
                        <FiPhone className="icon" />
                        <input type="tel" className="fpm" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                    </div>

                    <div className="input-group-hod">
                        <FiLock className="icon" />
                        <input type="password" className="fpm" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button className="save-button-pm" onClick={handleSave}>Save</button>
                    <button className="close-button-pm" onClick={onClose}>Close</button>

                    <p className="forgot-password" onClick={() => setForgotPasswordOpen(true)}>
                        <RiLockPasswordLine className="forgot-icon" /> Change Password?
                    </p>
                </div>
            </div>

            {forgotPasswordOpen && <ChangePasswordModal onClose={() => setForgotPasswordOpen(false)} />}
        </>
    );
};

export default ProfileModal;
