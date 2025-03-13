

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Edit2, MessageCircle, ChevronDown, ChevronUp, Save, Search, Star, BookCopy, Loader2 } from "lucide-react";
import './StudentGrades.css';

const StudentGrades = () => {
    const [batch, setBatch] = useState("");
    const [type, setType] = useState("");
    const [semester, setSemester] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [editingGrades, setEditingGrades] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [studentsData, setStudentsData] = useState([]);
    const [ratings, setRatings] = useState({});

    // Mock subjects data
    const subjects = [
        { id: "CS201", name: "Data Structures" },
        { id: "CS301", name: "Database Systems" },
        { id: "CS401", name: "Computer Networks" },
        { id: "CS501", name: "Operating Systems" },
        { id: "CS601", name: "Machine Learning" }
    ];

    // Initialize with empty grades
    const emptyGrades = {
        ESE: "",
        TW: "",
        CSE: "",
        IA: "",
        Viva: ""
    };

    // Simulating API call to fetch students
    useEffect(() => {
        if (selectedSubject) {
            setLoading(true);

            // Simulate API delay
            setTimeout(() => {
                // Mock students data
                const mockStudents = [
                    {
                        id: 1,
                        name: "John Doe",
                        enrollmentNo: "2023CS001",
                        image: "https://i.pravatar.cc/150?img=1",
                        grades: JSON.parse(JSON.stringify(emptyGrades)),
                        response: ""
                    },
                    {
                        id: 2,
                        name: "Jane Smith",
                        enrollmentNo: "2023CS002",
                        image: "https://i.pravatar.cc/150?img=2",
                        grades: JSON.parse(JSON.stringify(emptyGrades)),
                        response: ""
                    },
                    {
                        id: 3,
                        name: "Krish Patel",
                        enrollmentNo: "2023CS003",
                        image: "https://i.pravatar.cc/150?img=3",
                        grades: JSON.parse(JSON.stringify(emptyGrades)),
                        response: ""
                    },
                    {
                        id: 4,
                        name: "Emily Johnson",
                        enrollmentNo: "2023CS004",
                        image: "https://i.pravatar.cc/150?img=4",
                        grades: JSON.parse(JSON.stringify(emptyGrades)),
                        response: ""
                    },
                    {
                        id: 5,
                        name: "Michael Wilson",
                        enrollmentNo: "2023CS005",
                        image: "https://i.pravatar.cc/150?img=5",
                        grades: JSON.parse(JSON.stringify(emptyGrades)),
                        response: ""
                    },
                    {
                        id: 6,
                        name: "Sophia Chen",
                        enrollmentNo: "2023CS006",
                        image: "https://i.pravatar.cc/150?img=6",
                        grades: JSON.parse(JSON.stringify(emptyGrades)),
                        response: ""
                    }
                ];

                setStudentsData(mockStudents);

                // Initialize empty ratings for each student
                const initialRatings = {};
                mockStudents.forEach(student => {
                    initialRatings[student.id] = 0;
                });
                setRatings(initialRatings);

                setLoading(false);
            }, 800);
        }
    }, [selectedSubject]);

    const handleGradeChange = (studentId, component, value) => {
        setStudentsData(students =>
            students.map(student =>
                student.id === studentId
                    ? {
                        ...student,
                        grades: {
                            ...student.grades,
                            [component]: value
                        }
                    }
                    : student
            )
        );
    };

    const handleResponseChange = (studentId, response) => {
        setStudentsData(students =>
            students.map(student =>
                student.id === studentId
                    ? { ...student, response }
                    : student
            )
        );
    };

    const handleRatingChange = (studentId, rating) => {
        setRatings(prev => ({
            ...prev,
            [studentId]: rating
        }));
    };

    const handleSubmitResponse = (studentId) => {
        console.log("Submitted response for student", studentId, {
            response: studentsData.find(s => s.id === studentId)?.response,
            rating: ratings[studentId]
        });
        // Here you would typically send the data to your backend
    };

    const toggleGradeEdit = (studentId) => {
        setEditingGrades(editingGrades === studentId ? null : studentId);
    };

    const filteredStudents = studentsData.filter(student => {
        const searchTerm = searchQuery.toLowerCase();
        return (
            student.name.toLowerCase().includes(searchTerm) ||
            student.enrollmentNo.toLowerCase().includes(searchTerm)
        );
    });

    const renderRatingStars = (studentId) => {
        const currentRating = ratings[studentId] || 0;

        return (
            <div className="rating-stars">
                {[...Array(10)].map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        className={index < currentRating ? "filled" : ""}
                        onClick={() => handleRatingChange(studentId, index + 1)}
                    >
                        <Star size={20} />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="grades-container-sgp">
            <div className="grades-header-sgp">
                <h1>Faculty Grade Management</h1>
            </div>

            <div className="filter-section-sgp">
                <div className="filter-group-sgp">
                    <label>Batch</label>
                    <select value={batch} onChange={(e) => setBatch(e.target.value)}>
                        <option value="">Select Batch</option>
                        <option value="2022-2026">2022-2026</option>
                        <option value="2021-2025">2021-2025</option>
                        <option value="2020-2024">2020-2024</option>
                    </select>
                </div>

                <div className="filter-group-sgp">
                    <label>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">Select Type</option>
                        <option value="degree">Degree</option>
                        <option value="diploma">Diploma</option>
                    </select>
                </div>

                <div className="filter-group-sgp">
                    <label>Semester</label>
                    <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group-sgp">
                    <label>Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="search-container-sgp">
                    <Search className="search-icon" size={16} />
                    <input
                        id="search-sgp"
                        type="text"
                        placeholder="Search by name or enrollment number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {!selectedSubject && (
                <div className="empty-state">
                    <BookCopy size={48} />
                    <h3>Select a subject to begin grading</h3>
                    <p>Choose a subject from the dropdown menu above to view and grade students</p>
                </div>
            )}

            {selectedSubject && loading && (
                <div className="empty-state">
                    <Loader2 size={48} className="animate-spin" />
                    <h3>Loading students...</h3>
                    <p>Please wait while we fetch the student data</p>
                </div>
            )}

            {selectedSubject && !loading && (
                <>
                    <div className="student-count-sgp-sgp">
                        <div className="chip">Total Students: {filteredStudents.length}</div>
                    </div>

                    <div className="student-count-sgp">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="student-card">
                                <div className="student-basic-info-sgp">
                                    <img
                                        src={student.image}
                                        alt={student.name}
                                        className="student-image"
                                    />
                                    <div className="student-info-container-sgp">
                                        <div className="student-details">
                                            <span className="student-name">{student.name}</span>
                                            <span className="enrollment-number">{student.enrollmentNo}</span>
                                        </div>
                                        <div className="student-actions-sgp">
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
                                            <button
                                                className="response-button"
                                                onClick={() => setExpandedStudent(
                                                    expandedStudent === student.id ? null : student.id
                                                )}
                                            >
                                                <MessageCircle size={16} />
                                                Response
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {expandedStudent === student.id && (
                                    <div className="grade-details-sgp">
                                        <div className="grade-components">
                                            <h4>Grade Components</h4>
                                            <table className="grade-table-sgp">
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
                                                                    grade || "-"
                                                                )}
                                                            </td>
                                                            <td>100</td>
                                                            <td className={
                                                                grade
                                                                    ? (parseInt(grade) >= 40 ? 'pass' : 'fail')
                                                                    : ''
                                                            }>
                                                                {grade
                                                                    ? (parseInt(grade) >= 40 ? 'Pass' : 'Fail')
                                                                    : '-'}
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
                                            <div className="rating-container">
                                                <label>Performance Rating (1-10)</label>
                                                {renderRatingStars(student.id)}
                                            </div>
                                            <textarea
                                                placeholder="Add your comments or feedback here..."
                                                value={student.response}
                                                onChange={(e) => handleResponseChange(student.id, e.target.value)}
                                            />
                                            <button
                                                className="submit-response-button"
                                                onClick={() => handleSubmitResponse(student.id)}
                                            >
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