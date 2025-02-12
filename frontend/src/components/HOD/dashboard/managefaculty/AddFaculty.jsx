import React, { useState } from 'react';

const AddFaculty = ({ onSuccess }) => {
    const [facultyData, setFacultyData] = useState({
        name: '',
        email: '',
        password: '', // Added password field
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
            name: facultyData.name,
            email: facultyData.email,
            password: facultyData.password,
            role: 'Faculty', // Ensure faculty role
        };

        try {
            const response = await fetch('http://localhost:5000/api/users/addFaculty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(facultyDetails),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Faculty added:', data);
                onSuccess(); // Call success callback
            } else {
                console.error('Error:', data.message);
                alert(data.message); // Show error message
            }
        } catch (error) {
            console.error('Request failed:', error);
            alert('Failed to add faculty. Try again.');
        }
    };

    return (
        <div className="add-faculty-container">
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
                    <label>Password</label>
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
