import React, { useState } from "react";
import { FiMail } from "react-icons/fi";
import "./ProfileModal.css";

const ChangePasswordModal = ({ onClose }) => {
    const [email, setEmail] = useState("");

    return (
        <div className="modal-overlay-pm" onClick={onClose}>
            <div className="modal-content-pm" onClick={(e) => e.stopPropagation()}>
                <h2>Change Password</h2>
                <p>Enter your email to receive a password reset link.</p>

                <div className="input-group">
                    <FiMail className="icon" />
                    <input type="email" className="fpm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <button className="save-button-pm">Send Reset Link</button>
                <button className="close-button-pm" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
