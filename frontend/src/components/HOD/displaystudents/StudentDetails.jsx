import React, { useState } from 'react';
import './StudentDetail.css';

const StudentDetail = ({ studentId }) => {
    const [selectedSemester, setSelectedSemester] = useState(1);

    // Mock data - replace with actual data
    const student = {
        id: 1,
        name: 'John Doe',
        enrollmentNo: 'EN2022001',
        batch: '2022-2026',
        image: 'https://via.placeholder.com/150',
        semesters: [
            {
                semester: 1,
                subjects: [
                    {
                        id: 1,
                        name: 'Mathematics',
                        marks: 85,
                        maxMarks: 100
                    },
                    {
                        id: 2,
                        name: 'Physics',
                        marks: 78,
                        maxMarks: 100
                    },
                    // Add more subjects
                ]
            },
            // Add more semesters
        ]
    };

    const handleSemesterChange = (e) => {
        setSelectedSemester(parseInt(e.target.value));
    };

    const handleMarksUpdate = (subjectId, newMarks) => {
        // Implement marks update logic here
        console.log(`Updating marks for subject ${subjectId} to ${newMarks}`);
    };

    const currentSemesterData = student.semesters.find(
        sem => sem.semester === selectedSemester
    );

    return (
        <div className="student-detail-container">
            <div className="student-header">
                <div className="student-profile">
                    <img
                        src={student.image}
                        alt={student.name}
                        className="student-detail-image"
                    />
                    <div className="student-info">
                        <h2>{student.name}</h2>
                        <p>Enrollment No: {student.enrollmentNo}</p>
                        <p>Batch: {student.batch}</p>
                    </div>
                </div>

                <div className="semester-selector">
                    <label>Select Semester:</label>
                    <select
                        value={selectedSemester}
                        onChange={handleSemesterChange}
                        className="semester-select"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>
                                Semester {sem}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grades-section">
                <h3>Semester {selectedSemester} Grades</h3>
                <table className="grades-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Marks</th>
                            <th>Max Marks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSemesterData?.subjects.map(subject => (
                            <tr key={subject.id}>
                                <td>{subject.name}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={subject.marks}
                                        onChange={(e) => handleMarksUpdate(subject.id, e.target.value)}
                                        className="marks-input"
                                        min="0"
                                        max={subject.maxMarks}
                                    />
                                </td>
                                <td>{subject.maxMarks}</td>
                                <td>
                                    <button
                                        className="save-marks-btn"
                                        onClick={() => handleMarksUpdate(subject.id, subject.marks)}
                                    >
                                        Save
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentDetail;
