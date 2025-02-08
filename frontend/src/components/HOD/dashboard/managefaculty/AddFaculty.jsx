import React, { useState } from 'react';

const AddFaculty = ({ onSuccess }) => {
    const [facultyData, setFacultyData] = useState({
        name: '',
        email: '',
        // department: '',
        specialization: '',
        phone: '',
        qualifications: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Faculty Data:', facultyData);
        onSuccess();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFacultyData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="add-faculty-container">
            {/* <h2>Add New Faculty Member</h2> */}
            <form onSubmit={handleSubmit} className="add-faculty-form">
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={facultyData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={facultyData.email}
                        onChange={handleChange}
                        required
                    />
                </div>


                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="password"
                        name="password"
                        value={facultyData.password}
                        onChange={handleChange}
                        required
                    />
                </div>


                <div className="form-actions">
                    <button type="submit" className="submit-btn">Add Faculty</button>
                    <button type="button" onClick={onSuccess} className="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AddFaculty;