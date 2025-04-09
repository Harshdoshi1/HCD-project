import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import './UpdateGrades.css';

const UpdateGrades = () => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [grade, setGrade] = useState('');

    const mockStudents = [
        { id: '1', name: 'Ritech sanchla' },
        { id: '2', name: 'Harsh Doshi' },
        { id: '3', name: 'Prashant Sarvaiya' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Grade updated:', { studentId: selectedStudent, grade });
        // Update grade logic here
    };

    return (
        <div className="update-grades-container">
            <div className="update-grades-header">
                <Edit size={24} />
                <h2>Update Grades</h2>
            </div>
            <form onSubmit={handleSubmit} className="update-grades-form">
                <div className="form-group">
                    <label>Select Student</label>
                    <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        required
                    >
                        <option value="">Choose a student</option>
                        {mockStudents.map(student => (
                            <option key={student.id} value={student.id}>
                                {student.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Grade</label>
                    <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        required
                    >
                        <option value="">Select grade</option>
                        {['A', 'B', 'C', 'D', 'E', 'F'].map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="submit-button">Update Grade</button>
            </form>
        </div>
    );
};

export default UpdateGrades;