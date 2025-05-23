import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiUser, FiMail } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import ChangePasswordModal from "./ChangePasswordModal";
import "./ProfileModal.css";

const ProfileModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);

    // Fetch faculty data when the modal opens
    useEffect(() => {
        if (isOpen) {
            fetchFacultyData();
        }
    }, [isOpen]);

    const fetchFacultyData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get email from localStorage
            const storedEmail = localStorage.getItem('email');

            if (!storedEmail) {
                throw new Error('No email found in local storage');
            }

            // Fetch user data from the backend
            const response = await axios.get(`http://localhost:5001/api/users/byEmail/${storedEmail}`);

            if (response.data && response.data.id) {
                const userData = response.data;
                setUsername(userData.username || userData.name || "");
                setEmail(userData.email || "");
                setFacultyId(userData.id);
                console.log('Faculty data loaded successfully:', userData);
            } else {
                throw new Error('User data not found');
            }
        } catch (err) {
            console.error('Error fetching faculty data:', err);
            setError('Failed to load profile data: ' + (err.message || 'Unknown error'));
            // Set defaults to avoid undefined values
            setUsername("");
            setEmail(localStorage.getItem('email') || "");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!facultyId) {
                toast.error('Unable to update profile: User ID not found');
                return;
            }

            // Update user data in the database
            const response = await axios.put(`http://localhost:5001/api/users/${facultyId}`, {
                username,
                email
            });

            if (response.data && response.data.success) {
                toast.success('Profile updated successfully');

                // Update email in localStorage if it changed
                if (email !== localStorage.getItem('email')) {
                    localStorage.setItem('email', email);
                }

                onClose();
            } else {
                toast.error('Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error('Error updating profile: ' + (err.response?.data?.message || err.message || 'Unknown error'));
        }
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

                    {/* Location, Mobile Number, and Password fields removed as requested */}

                    {loading ? (
                        <div className="loading-indicator">Loading profile data...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : null}

                    <button className="save-button-pm" onClick={handleSave} disabled={loading}>Save</button>
                    <button className="close-button-pm" onClick={onClose}>Close</button>

                    {/* <p className="forgot-password" onClick={() => setChangePasswordOpen(true)}>
                        <RiLockPasswordLine className="forgot-icon" /> Change Password?
                    </p> */}
                </div>
            </div>

            {changePasswordOpen && <ChangePasswordModal email={email} onClose={() => setChangePasswordOpen(false)} />}
        </>
    );
};

export default ProfileModal;
