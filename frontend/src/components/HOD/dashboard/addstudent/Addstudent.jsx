import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import './AddStudent.css';

const AddStudent = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        rollNumber: '',
        batch: '',
        semester: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Student data submitted:', formData);
        // Add student logic here
    };

    return (
        <div className="add-student-container">
            <div className="add-student-header">
                <UserPlus size={24} />
                <h2>Add New Student</h2>
            </div>
            <form onSubmit={handleSubmit} className="add-student-form">
                <div className="form-group">
                    <label>First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Roll Number</label>
                    <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Batch</label>
                    <select
                        name="batch"
                        value={formData.batch}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Batch</option>
                        <option value="2022-2026">2022-2026</option>
                        <option value="2023-2027">2023-2027</option>
                        <option value="2024-2028">2024-2028</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Semester</label>
                    <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="submit-button"> Add Student</button>
            </form>
        </div>
    );
};

export default AddStudent;