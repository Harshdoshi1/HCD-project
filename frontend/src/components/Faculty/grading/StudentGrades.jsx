import React, { useState } from 'react';
import { Users, BookOpen, Edit2, MessageCircle, ChevronDown, ChevronUp, Save, Search } from "lucide-react";
import './StudentGrades.css';

const StudentGrades = () => {
    const [batch, setBatch] = useState("");
    const [type, setType] = useState("");
    const [semester, setSemester] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [editingGrades, setEditingGrades] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Sample data - replace with your actual data
    const subjects = [
        { id: "CS201", name: "Data Structures" },
        { id: "CS301", name: "Database Systems" },
        { id: "CS401", name: "Computer Networks" }
    ];

    const students = [
        {
            id: 1,
            name: "John Doe",
            enrollmentNo: "2023CS001",
            image: "https://placekitten.com/50/50",
            grades: {
                ESE: 75,
                TW: 85,
                CSE: 80,
                IA: 78,
                viva: 82
            },
            response: ""
        },
        {
            id: 2,
            name: "Jane Smith",
            enrollmentNo: "2023CS002",
            image: "https://placekitten.com/51/51",
            grades: {
                ESE: 82,
                TW: 88,
                CSE: 85,
                IA: 90,
                viva: 86
            },
            response: ""
        },
        {
            id: 3,
            name: "Krish",
            enrollmentNo: "2023CS003",
            image: "https://placekitten.com/52/52",
            grades: {
                ESE: 80,
                TW: 84,
                CSE: 88,
                IA: 76,
                viva: 70
            },
            response: ""
        },
        {
            id: 4,
            name: "Rishit",
            enrollmentNo: "2023CS004",
            image: "https://placekitten.com/53/53",
            grades: {
                ESE: 70,
                TW: 75,
                CSE: 80,
                IA: 60,
                viva: 72
            },
            response: ""
        },
    ];

    const handleGradeChange = (studentId, component, value) => {
        console.log(studentId, component, value);
    };

    const handleResponseSubmit = (studentId, response) => {
        console.log(studentId, response);
    };

    const toggleGradeEdit = (studentId) => {
        setEditingGrades(editingGrades === studentId ? null : studentId);
    };

    const filteredStudents = students.filter(student => {
        const searchTerm = searchQuery.toLowerCase();
        return (
            student.name.toLowerCase().includes(searchTerm) ||
            student.enrollmentNo.toLowerCase().includes(searchTerm)
        );
    });

    return (
        <div className="grades-container">
            <div className="grades-header">
                <h1>Grade Management</h1>
            </div>

            <div className="student-filter-top">
                <div className="filters-section">
                    <div className="filter-group">
                        <select value={batch} onChange={(e) => setBatch(e.target.value)}>
                            <option value="">Batch</option>
                            <option value="2022-2026">2022-2026</option>
                            <option value="2021-2025">2021-2025</option>
                            <option value="2020-2024">2020-2024</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="">Type</option>
                            <option value="degree">Degree</option>
                            <option value="diploma">Diploma</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                            <option value="">Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                            <option value="">Subject</option>
                            {subjects.map(subject => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by name or enrollment number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            </div>

            {selectedSubject && (
                <>
                    <div className="student-count">
                        Total Students: {filteredStudents.length}
                    </div>

                    <div className="students-list">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="student-card">
                                <div className="student-basic-info">
                                    <img
                                        src={student.image}
                                        alt={student.name}
                                        className="student-image"
                                    />
                                    <div className="student-info-container">
                                        <div className="student-details">
                                            <span className="student-name">{student.name}</span>
                                            <span className="enrollment-number">{student.enrollmentNo}</span>
                                        </div>
                                        <div className="student-actions">
                                            <button
                                                className="grade-button"
                                                onClick={() => setExpandedStudent(
                                                    expandedStudent === student.id ? null : student.id
                                                )}
                                            >
                                                <Edit2 size={16} />
                                                Grades
                                                {expandedStudent === student.id ? (
                                                    <ChevronUp size={16} />
                                                ) : (
                                                    <ChevronDown size={16} />
                                                )}
                                            </button>
                                            <button className="response-button">
                                                <MessageCircle size={16} />
                                                Response
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {expandedStudent === student.id && (
                                    <div className="grade-details">
                                        <div className="grade-components">
                                            <h4>Grade Components</h4>
                                            <table className="grade-table">
                                                <thead>
                                                    <tr>
                                                        <th>Component</th>
                                                        <th>Marks</th>
                                                        <th>Out of</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(student.grades).map(([component, grade]) => (
                                                        <tr key={component}>
                                                            <td>{component}</td>
                                                            <td>
                                                                {editingGrades === student.id ? (
                                                                    <input
                                                                        type="number"
                                                                        value={grade}
                                                                        onChange={(e) => handleGradeChange(
                                                                            student.id,
                                                                            component,
                                                                            e.target.value
                                                                        )}
                                                                        min="0"
                                                                        max="100"
                                                                    />
                                                                ) : (
                                                                    grade
                                                                )}
                                                            </td>
                                                            <td>100</td>
                                                            <td className={grade >= 40 ? 'pass' : 'fail'}>
                                                                {grade >= 40 ? 'Pass' : 'Fail'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="grade-actions">
                                                <button
                                                    className="edit-grades-button"
                                                    onClick={() => toggleGradeEdit(student.id)}
                                                >
                                                    {editingGrades === student.id ? (
                                                        <>
                                                            <Save size={16} />
                                                            Save Grades
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Edit2 size={16} />
                                                            Edit Grades
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="faculty-response">
                                            <h4>Faculty Response</h4>
                                            <textarea
                                                placeholder="Add your comments or feedback here..."
                                                value={student.response}
                                                onChange={(e) => handleResponseSubmit(student.id, e.target.value)}
                                            />
                                            <button className="submit-response-button">
                                                Submit Response
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentGrades;
