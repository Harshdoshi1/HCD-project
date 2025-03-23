import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Edit2, MessageCircle, ChevronDown, ChevronUp, Save, Search, Star, BookCopy, Loader2 } from "lucide-react";
import './StudentGrades.css';

const StudentGrades = () => {
    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [editingGrades, setEditingGrades] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [studentsData, setStudentsData] = useState([]);
    const [ratings, setRatings] = useState({});
    const [error, setError] = useState(null);

    // Fetch batches on component mount
    useEffect(() => {
        const fetchBatches = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:5001/api/users/getAllBatches");
                if (!response.ok) throw new Error("Failed to fetch batches");
                const data = await response.json();
                setBatches(data.map(batch => ({
                    id: batch.id,
                    batchName: batch.batchName
                })));
            } catch (error) {
                console.error("Error fetching batches:", error);
                setError("Failed to fetch batches");
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

    // Fetch semesters when batch changes
    useEffect(() => {
        if (!selectedBatch) return;
        const fetchSemesters = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5001/api/users/getSemestersByBatch/${selectedBatch.batchName}`);
                if (!response.ok) throw new Error("Failed to fetch semesters");
                const data = await response.json();
                setSemesters(data.map(semester => ({
                    id: semester.id,
                    semesterNumber: semester.semesterNumber
                })));
            } catch (error) {
                console.error("Error fetching semesters:", error);
                setError("Failed to fetch semesters");
                setSemesters([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSemesters();
    }, [selectedBatch]);

    // Fetch subjects when semester changes
    useEffect(() => {
        if (!selectedBatch || !selectedSemester) return;
        const fetchSubjects = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5001/api/users/getSubjects/${selectedBatch.batchName}/${selectedSemester.semesterNumber}`);
                if (!response.ok) throw new Error("Failed to fetch subjects");
                const data = await response.json();
                console.log('Subject API Response:', data);
                
                // Extract subjects from the response
                const subjectList = data.subjects || [];
                const uniqueSubjects = data.uniqueSubjects || [];
                
                // Map subjects with additional info from uniqueSubjects if available
                const mappedSubjects = subjectList.map(subject => {
                    const uniqueInfo = uniqueSubjects.find(u => u.sub_name === subject.subjectName);
                    return {
                        id: subject.id,
                        subjectName: subject.subjectName,
                        subCode: uniqueInfo?.sub_code,
                        subLevel: uniqueInfo?.sub_level
                    };
                });

                setSubjects(mappedSubjects);
            } catch (error) {
                console.error("Error fetching subjects:", error);
                setError("Failed to fetch subjects");
                setSubjects([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, [selectedBatch, selectedSemester]);

    // Fetch students when subject changes
    useEffect(() => {
        if (!selectedBatch || !selectedSubject) return;
        
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5001/api/marks/students/${selectedBatch.batchName}`);
                if (!response.ok) throw new Error("Failed to fetch students");
                const data = await response.json();
                console.log('Students API Response:', data);
                const studentsWithGrades = data.map(student => ({
                    id: student.id,
                    name: student.name,
                    enrollmentNo: student.enrollmentNo,
                    // image: student.profileImage || `https://i.pravatar.cc/150?img=${student.id}`,
                    grades: student.Gettedmarks?.[0] || {
                        ESE: 0,
                        TW: 0,
                        CSE: 0,
                        IA: 0,
                        Viva: 0
                    },
                    response: ""
                }));

                setStudentsData(studentsWithGrades);
                
                // Initialize ratings
                const initialRatings = {};
                studentsWithGrades.forEach(student => {
                    initialRatings[student.id] = 0;
                });
                setRatings(initialRatings);
            } catch (error) {
                console.error("Error fetching students:", error);
                setError("Failed to fetch students");
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [selectedBatch, selectedSubject]);

    const handleSubmitResponse = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:5001/api/marks/update/${2}/${selectedSubject.subjectName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    response: studentsData.find(student => student.id === studentId).response,
                    facultyId: 1 //localStorage.getItem('userId')
                })
            });
    
            if (!response.ok) throw new Error("Failed to submit response");
    
            alert("Response submitted successfully!");
        } catch (error) {
            console.error("Error submitting response:", error);
            setError("Failed to submit response");
        }
    };
    
    const handleGradeChange = async (studentId, component, value) => {
        try {
            const response = await fetch(`http://localhost:5001/api/marks/update/${studentId}/${selectedSubject.subjectName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    [component.toLowerCase()]: value,
                    facultyId: localStorage.getItem('userId')
                })
            });

            if (!response.ok) throw new Error("Failed to update grades");

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
        } catch (error) {
            console.error("Error updating grades:", error);
            setError("Failed to update grades");
        }
    };

    const handleBatchChange = (e) => {
        const batch = batches.find(b => b.batchName === e.target.value);
        setSelectedBatch(batch);
        setSelectedSemester(null);
        setSelectedSubject(null);
    };

    const handleSemesterChange = (e) => {
        const semester = semesters.find(s => s.semesterNumber === parseInt(e.target.value));
        setSelectedSemester(semester);
        setSelectedSubject(null);
    };

    const handleSubjectChange = (e) => {
        console.log('Selected subject value:', e.target.value); // Debug log
        console.log('Available subjects:', subjects); // Debug log
        const subject = subjects.find(s => s.subjectName === e.target.value);
        console.log('Found subject:', subject); // Debug log
        setSelectedSubject(subject);
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

            {error && (
                <div className="error-message">
                    <span>{error}</span>
                </div>
            )}

            <div className="filter-section-sgp">
                <div className="filter-group-sgp">
                    <label>Batch</label>
                    <select 
                        value={selectedBatch?.batchName || ''} 
                        onChange={handleBatchChange}
                    >
                        <option value="">Select Batch</option>
                        {batches.map(batch => (
                            <option key={batch.id} value={batch.batchName}>
                                {batch.batchName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group-sgp">
                    <label>Semester</label>
                    <select 
                        value={selectedSemester?.semesterNumber || ''} 
                        onChange={handleSemesterChange}
                        disabled={!selectedBatch}
                    >
                        <option value="">Select Semester</option>
                        {semesters.map(semester => (
                            <option key={semester.id} value={semester.semesterNumber}>
                                Semester {semester.semesterNumber}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group-sgp">
                    <label>Subject</label>
                    <select 
                        value={selectedSubject?.subjectName || ''} 
                        onChange={(e) => {
                            const subject = subjects.find(s => s.subjectName === e.target.value);
                            setSelectedSubject(subject);
                        }}
                        disabled={!selectedSemester}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.subjectName}>
                                {subject.subjectName} ({subject.subCode})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="search-container-sgp">
                    <Search className="search-sgp" size={20} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-overlay">
                    <Loader2 className="loading-spinner" size={40} />
                    <span className="loading-text">Loading...</span>
                </div>
            ) : (
                <>
                    {filteredStudents.length > 0 ? (
                        <div className="student-count-sgp">
                            {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''} Found
                        </div>
                    ) : (
                        <div className="no-results">
                            <BookCopy size={40} />
                            <p>No students found</p>
                        </div>
                    )}

                    <div className="students-list">
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

                                {(expandedStudent === student.id || editingGrades === student.id) && (
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
                                            <h3>Faculty Response</h3>
                                            <textarea
                                                placeholder="Add your response..."
                                                value={student.response}
                                                onChange={(e) => handleResponseChange(student.id, e.target.value)}
                                            />
                                            {renderRatingStars(student.id)}
                                            <button 
                                                className="submit-button"
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