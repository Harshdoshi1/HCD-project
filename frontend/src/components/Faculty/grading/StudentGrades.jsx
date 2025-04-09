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
    const [gradeUpdating, setGradeUpdating] = useState(false);

    // Function to validate grade value
    const validateGrade = (value) => {
        const numValue = parseInt(value);
        if (isNaN(numValue)) return 0;
        if (numValue < 0) return 0;
        if (numValue > 100) return 100;
        return numValue;
    };

    // Handle grade input change
    const handleGradeChange = async (studentId, component, value) => {
        const validatedValue = validateGrade(value);

        setStudentsData(prevData =>
            prevData.map(student =>
                student.id === studentId
                    ? {
                        ...student,
                        grades: {
                            ...student.grades,
                            [component.toLowerCase()]: validatedValue
                        }
                    }
                    : student
            )
        );
    };

    // Handle grade submission
    const handleGradeSubmit = async (studentId) => {
        if (!selectedSubject?.subCode || !studentId) {
            setError("Please select a subject and student");
            return;
        }

        setGradeUpdating(true);
        try {
            const student = studentsData.find(s => s.id === studentId);
            if (!student) throw new Error("Student not found");

            const faculty = JSON.parse(localStorage.getItem('user'));
            if (!faculty) throw new Error("Faculty information not found");

            console.log('Submitting grades:', {
                studentId,
                subjectId: selectedSubject.subCode,
                grades: student.grades
            });

            const response = await fetch(`http://localhost:5001/api/marks/update/${studentId}/${selectedSubject.subCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    facultyId: faculty.id,
                    ese: parseInt(student.grades?.ese) || 0,
                    cse: parseInt(student.grades?.cse) || 0,
                    ia: parseInt(student.grades?.ia) || 0,
                    tw: parseInt(student.grades?.tw) || 0,
                    viva: parseInt(student.grades?.viva) || 0,
                    response: student.response || ''
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || "Failed to update grades");
            }

            const data = await response.json();
            console.log("Grades updated successfully:", data);

            // Refresh the student data after successful update
            await fetchStudentData(selectedBatch?.id, selectedSubject?.subCode);

            // Update the UI to show success
            setEditingGrades(null);
            setError(null);
        } catch (error) {
            console.error("Error updating grades:", error);
            setError("Failed to update grades: " + error.message);
        } finally {
            setGradeUpdating(false);
        }
    };

    // Function to fetch student data
    const fetchStudentData = async (batchId, subjectCode) => {
        if (!batchId || !subjectCode) return;

        setLoading(true);
        try {
            console.log('vvvvv Fetching student data for batch:', batchId, 'and subject:', subjectCode);
            const response = await fetch(`http://localhost:5001/api/marks/students/${batchId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => console.log("Student Data:", data))
                .catch(error => console.error("Fetch error:", error));

            const data = await response.json();
            console.log('Fetched student data:', data);
            setStudentsData(data.map(student => ({
                ...student,
                grades: {
                    ese: student.ese || 0,
                    cse: student.cse || 0,
                    ia: student.ia || 0,
                    tw: student.tw || 0,
                    viva: student.viva || 0
                }
            })));
        } catch (error) {
            console.error('Error fetching student data:', error);
            // setError('Failed to fetch student data');
        } finally {
            setLoading(false);
        }
    };

    // Custom grade input component
    const GradeInput = ({ value, onChange, disabled }) => {
        const [localValue, setLocalValue] = useState(value || '');

        const handleChange = (e) => {
            const newValue = e.target.value;
            // Allow empty string or numbers only
            if (newValue === '' || /^\d{0,3}$/.test(newValue)) {
                setLocalValue(newValue);
                if (newValue === '') {
                    onChange('0');
                } else {
                    onChange(newValue);
                }
            }
        };

        const handleBlur = () => {
            const validatedValue = validateGrade(localValue);
            setLocalValue(validatedValue.toString());
            onChange(validatedValue.toString());
        };

        // Update local value when prop value changes
        useEffect(() => {
            setLocalValue(value || '');
        }, [value]);

        return (
            <input
                type="text"
                pattern="\\d*"
                min="0"
                max="100"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                className="grade-input-sgp"
            />
        );
    };

    // Fetch batches on component mount
    useEffect(() => {
        const fetchBatches = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:5001/api/batches/getAllBatches");
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
                const response = await fetch(`http://localhost:5001/api/semesters/getSemestersByBatch/${selectedBatch.batchName}`);
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
                const response = await fetch(`http://localhost:5001/api/subjects/getSubjects/${selectedBatch.batchName}/${selectedSemester.semesterNumber}`);
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
                const response = await fetch(`http://localhost:5001/api/facultySide/marks/students/${selectedBatch.batchName}`);
                if (!response.ok) throw new Error("Failed to fetch students");
                const data = await response.json();
                console.log('Students API Response:', data);
                const studentsWithGrades = data.map(student => ({
                    id: student.id,
                    name: student.name,
                    enrollmentNo: student.enrollmentNo,
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
        if (!selectedSubject) {
            setError("Please select a subject first");
            return;
        }

        try {
            const student = studentsData.find(s => s.id === studentId);
            if (!student) throw new Error("Student not found");

            const response = await fetch(`http://localhost:5001/api/marks/update/${studentId}/${selectedSubject.subCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    response: student.response,
                    facultyId: JSON.parse(localStorage.getItem('user')).id
                })
            });

            if (!response.ok) throw new Error("Failed to submit response");

            const data = await response.json();
            console.log("Response submitted successfully:", data);

            // Update local state
            setStudentsData(students =>
                students.map(s =>
                    s.id === studentId
                        ? { ...s, response: data.data.facultyResponse }
                        : s
                )
            );

            alert("Response submitted successfully!");
        } catch (error) {
            console.error("Error submitting response:", error);
            setError("Failed to submit response: " + error.message);
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
        const subject = subjects.find(s => s.subCode === e.target.value);
        console.log('Found subject:', subject); // Debug log
        setSelectedSubject(subject);
        fetchStudentData(selectedBatch?.id, subject?.subCode);
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
                        value={selectedSubject?.subCode || ''}
                        onChange={handleSubjectChange}
                        disabled={!selectedSemester}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.subCode}>
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
                                        <div className="student-details-student-grades">
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
                                            <div className="grade-inputs-container">
                                                {['ESE', 'CSE', 'IA', 'TW', 'Viva'].map((component) => (
                                                    <div key={component} className="grade-input-group">
                                                        <label>{component}:</label>
                                                        <GradeInput
                                                            value={student.grades?.[component.toLowerCase()]}
                                                            onChange={(value) => handleGradeChange(student.id, component, value)}
                                                            disabled={editingGrades !== student.id}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grade-actions">
                                                {editingGrades === student.id ? (
                                                    <>
                                                        <button
                                                            className="save-grades-button"
                                                            onClick={() => handleGradeSubmit(student.id)}
                                                            disabled={gradeUpdating}
                                                        >
                                                            {gradeUpdating ? (
                                                                <Loader2 className="animate-spin" size={16} />
                                                            ) : (
                                                                <Save size={16} />
                                                            )}
                                                            Save Grades
                                                        </button>
                                                        <button
                                                            className="cancel-edit-button"
                                                            onClick={() => setEditingGrades(null)}
                                                            disabled={gradeUpdating}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="edit-grades-button"
                                                        onClick={() => setEditingGrades(student.id)}
                                                    >
                                                        <Edit2 size={16} />
                                                        Edit Grades
                                                    </button>
                                                )}
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