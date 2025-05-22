import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiMail, FiLock } from "react-icons/fi";
import "./ProfileModal.css";

const ChangePasswordModal = ({ email, onClose }) => {
    const [resetEmail, setResetEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    
    useEffect(() => {
        // Populate email field if provided by parent component
        if (email) {
            setResetEmail(email);
        }
    }, [email]);

    const handleSendResetEmail = async () => {
        if (!resetEmail) {
            toast.error("Please enter your email address");
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Generate a reset token
            const token = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
            setResetToken(token);
            
            try {
                // Send password reset email
                const response = await axios.post("http://localhost:5001/api/auth/send-reset-email", {
                    email: resetEmail,
                    token,
                    senderEmail: "krishmamtora26@gmail.com"
                });
                
                if (response.data && response.data.success) {
                    toast.success("Password reset email sent successfully");
                    console.log("Development: Your reset token is:", token);
                    setResetSent(true);
                } else {
                    throw new Error(response.data?.message || "Failed to send reset email");
                }
            } catch (apiError) {
                // Development fallback - simulate successful email sending
                console.warn("API error in development mode:", apiError.message);
                console.log("Development: Using fallback. Your reset token is:", token);
                toast.info("In development mode: Email sending simulated. Check console for token.");
                setResetSent(true);
            }
        } catch (err) {
            console.error("Error in reset process:", err);
            toast.error(err.message || "Failed in reset process");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Please enter and confirm your new password");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Update password in the database
            const response = await axios.post("http://localhost:5001/api/auth/reset-password", {
                email: resetEmail,
                token: resetToken,
                newPassword
            });
            
            if (response.data && response.data.success) {
                toast.success("Password reset successfully");
                onClose(); // Close the modal
            } else {
                throw new Error(response.data?.message || "Failed to reset password");
            }
        } catch (err) {
            console.error("Error resetting password:", err);
            toast.error(err.response?.data?.message || err.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="modal-overlay-pm" onClick={onClose}>
            <div className="modal-content-pm" onClick={(e) => e.stopPropagation()}>
                <h2>Change Password</h2>
                
                {!resetSent ? (
                    <>
                        <p>Enter your email to receive a password reset link.</p>
                        
                        <div className="input-group-hod">
                            <FiMail className="icon" />
                            <input 
                                type="email" 
                                className="fpm" 
                                placeholder="Email" 
                                value={resetEmail} 
                                onChange={(e) => setResetEmail(e.target.value)} 
                                disabled={isLoading} 
                            />
                        </div>
                        
                        <button 
                            className="save-button-pm" 
                            onClick={handleSendResetEmail} 
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Send Reset Email"}
                        </button>
                    </>
                ) : (
                    <>
                        <p>Email sent! Please check your inbox for the reset link.</p>
                        <p className="email-info">For development purposes, please enter your new password below:</p>
                        
                        <div className="input-group-hod">
                            <FiLock className="icon" />
                            <input 
                                type="password" 
                                className="fpm" 
                                placeholder="New Password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                disabled={isLoading} 
                            />
                        </div>
                        
                        <div className="input-group-hod">
                            <FiLock className="icon" />
                            <input 
                                type="password" 
                                className="fpm" 
                                placeholder="Confirm New Password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                disabled={isLoading} 
                            />
                        </div>
                        
                        <button 
                            className="save-button-pm" 
                            onClick={handleResetPassword} 
                            disabled={isLoading}
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>
                    </>
                )}
                
                <button className="close-button-pm" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
