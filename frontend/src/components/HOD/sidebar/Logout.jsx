import React from "react";
import "./Logout.css";

const Logout = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-lm" onClick={onClose}>
            <div className="modal-content-lm" onClick={(e) => e.stopPropagation()}>
                <h2>Are you sure you want to logout?</h2>
                <div className="modal-actions">
                    <button className="confirm-button-lm" onClick={onConfirm}>Yes</button>
                    <button className="cancel-button-lm" onClick={onClose}>No</button>
                </div>
            </div>
        </div>
    );
};

export default Logout;
