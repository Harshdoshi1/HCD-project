import React, { useState } from 'react';
import './AddFacultyModal.css';

const AddFacultyModal = ({ onClose, onSuccess }) => {
    const [facultyData, setFacultyData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFacultyData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const facultyDetails = {
            ...facultyData,
            role: 'Faculty',
        };

        try {
            const response = await fetch('http://localhost:5001/api/users/addFaculty', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(facultyDetails),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Faculty added:', data);
                onSuccess();
                onClose();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to add faculty. Try again.');
        }
    };

    return (
        <div className="modal-overlay-faculty">
            <div className="modal-content-faculty">
                <h2>Add Faculty</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input type="text" name="name" placeholder='Full Name' value={facultyData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <input type="email" name="email" placeholder='Email' value={facultyData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <input type="password" name="password" placeholder='Password' value={facultyData.password} onChange={handleChange} required />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>

                        <button type="submit" className="submit-btn-add-faculty">Add Faculty</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddFacultyModal;