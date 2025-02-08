
import React, { useState } from 'react';

const FacultyAssignment = ({ selectedFaculty }) => {
    const [assignment, setAssignment] = useState({
        batch: '',
        semester: '',
        subject: '',
        faculty: selectedFaculty?.id || ''
    });

    const batches = ['2022-2026', '2023-2027', '2024-2028'];
    const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const subjects = ['Data Structures', 'Digital Electronics', 'Computer Networks', 'Database Management'];

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Assignment Data:', assignment);
        // Handle assignment submission
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAssignment(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="faculty-assignment-container">
            <form onSubmit={handleSubmit} className="assignment-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Select Batch</label>
                        <select name="batch" value={assignment.batch} onChange={handleChange} required>
                            <option value="">Select Batch</option>
                            {batches.map(batch => (
                                <option key={batch} value={batch}>{batch}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Semester</label>
                        <select name="semester" value={assignment.semester} onChange={handleChange} required>
                            <option value="">Select Semester</option>
                            {semesters.map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Subject</label>
                        <select name="subject" value={assignment.subject} onChange={handleChange} required>
                            <option value="">Select Subject</option>
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Faculty Member</label>
                        <input
                            type="text"
                            value={selectedFaculty ? selectedFaculty.name : 'Please select a faculty member'}

                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn">Assign Faculty</button>
                </div>
            </form>

            <div className="current-assignments">
                <h3>Current Assignments</h3>
                <table className="assignments-table">
                    <thead>
                        <tr>
                            <th>Batch</th>
                            <th>Semester</th>
                            <th>Subject</th>
                            <th>Faculty</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2023-2027</td>
                            <td>3</td>
                            <td>Data Structures</td>
                            <td>Dr. Sarah Johnson</td>
                            <td>
                                <button className="remove-btn">Remove</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FacultyAssignment;

