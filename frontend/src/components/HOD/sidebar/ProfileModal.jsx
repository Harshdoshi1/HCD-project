import React from "react";
import "./ProfileModal.css";

const ProfileModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-pm" onClick={onClose}>
            <div className="modal-content-pm" onClick={(e) => e.stopPropagation()}>
                <h2>Profile</h2>
                <p>User details will be displayed here.</p>
                <button className="close-button-pm" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default ProfileModal;
