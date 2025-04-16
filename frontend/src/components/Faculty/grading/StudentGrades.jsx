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
    const [facultyAssignments, setFacultyAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [editingGrades, setEditingGrades] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [studentsData, setStudentsData] = useState([]);
    const [ratings, setRatings] = useState({});
    const [gradeUpdating, setGradeUpdating] = useState(false);
    const [batchToSemesters, setBatchToSemesters] = useState({});
    const [allSubjects, setAllSubjects] = useState([]);

    // Get current faculty's ID from localStorage
    const faculty = JSON.parse(localStorage.getItem('user'));
    const facultyId = faculty?.id;

    // Single GradeInput component implementation
    const GradeInput = ({ value, onChange, disabled }) => {
        const [localValue, setLocalValue] = useState(value || '');

        const handleChange = (e) => {
            const newValue = e.target.value;
            if (newValue === '' || /^\d{0,3}$/.test(newValue)) {
                setLocalValue(newValue);
                onChange(newValue || '0');
            }
        };

        const handleBlur = () => {
            const validatedValue = Math.min(Math.max(parseInt(localValue) || 0, 0), 100);
            setLocalValue(validatedValue.toString());
            onChange(validatedValue.toString());
        };

        useEffect(() => {
            setLocalValue(value || '');
        }, [value]);

        return (
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                className="grade-input-sgp"
            />
        );
    };

    // Fetch faculty assignments
    useEffect(() => {
        const fetchFacultyAssignments = async () => {
            if (!facultyId) return;

            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5001/api/faculties/getSubjectsByFaculty/${facultyId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch faculty assignments');
                }
                const data = await response.json();

                // Create a map of batch to semesters
                const batchSemesterMap = {};
                data.forEach(subject => {
                    if (subject.batch && subject.semester) {
                        if (!batchSemesterMap[subject.batch]) {
                            batchSemesterMap[subject.batch] = new Set();
                        }
                        batchSemesterMap[subject.batch].add(subject.semester);
                    }
                });

                // Convert Sets to sorted arrays
                Object.keys(batchSemesterMap).forEach(batchKey => {
                    const semesterArray = Array.from(batchSemesterMap[batchKey]);
                    semesterArray.sort((a, b) => parseInt(a) - parseInt(b));
                    batchSemesterMap[batchKey] = semesterArray;
                });

                // Extract unique batches
                const uniqueBatches = [...new Set(data.map(subject => subject.batch).filter(Boolean))];
                uniqueBatches.sort();

                setBatches(uniqueBatches.map(batchName => ({ batchName })));
                setBatchToSemesters(batchSemesterMap);
                setAllSubjects(data);
            } catch (error) {
                console.error('Error fetching faculty assignments:', error);
                setError('Failed to fetch faculty assignments');
            } finally {
                setLoading(false);
            }
        };

        fetchFacultyAssignments();
    }, [facultyId]);

    // Update semester options when batch changes
    useEffect(() => {
        if (selectedBatch) {
            const semesterArray = batchToSemesters[selectedBatch.batchName] || [];
            setSemesters(semesterArray.map(num => ({ semesterNumber: parseInt(num) })));
            setSelectedSemester(null);
            setSelectedSubject(null);
        } else {
            setSemesters([]);
        }
    }, [selectedBatch, batchToSemesters]);

    // Update subject options when semester changes
    useEffect(() => {
        if (selectedBatch && selectedSemester && allSubjects.length > 0) {
            const filteredSubjects = allSubjects.filter(subject => 
                subject.batch === selectedBatch.batchName && 
                subject.semester === selectedSemester.semesterNumber
            );
            setSubjects(filteredSubjects);
            setSelectedSubject(null);
        } else {
            setSubjects([]);
        }
    }, [selectedBatch, selectedSemester, allSubjects]);

    // Function to handle batch change
    const handleBatchChange = (e) => {
        const batch = batches.find(b => b.batchName === e.target.value);
        setSelectedBatch(batch);
        setSelectedSemester(null);
        setSelectedSubject(null);
    };

    // Function to handle semester change
    const handleSemesterChange = (e) => {
        const semester = semesters.find(s => s.semesterNumber === parseInt(e.target.value));
        setSelectedSemester(semester);
        setSelectedSubject(null);
    };

    // Function to handle subject change
    const handleSubjectChange = (e) => {
        const selectedSub = subjects.find(sub => sub.code === e.target.value);
        setSelectedSubject(selectedSub || null);
        fetchStudentData(selectedBatch?.id, selectedSub?.code);
    };

    // Function to handle response change
    const handleResponseChange = (studentId, response) => {
        setStudentsData(students =>
            students.map(student =>
                student.id === studentId
                    ? { ...student, response }
                    : student
            )
        );
    };

    // Function to handle rating change
    const handleRatingChange = (studentId, rating) => {
        setRatings(prev => ({
            ...prev,
            [studentId]: rating
        }));
    };

    // Function to toggle grade editing
    const toggleGradeEdit = (studentId) => {
        setEditingGrades(editingGrades === studentId ? null : studentId);
    };

    // Function to filter students
    const filteredStudents = studentsData.filter(student => {
        const searchTerm = searchQuery.toLowerCase();
        return (
            student.name.toLowerCase().includes(searchTerm) ||
            student.enrollmentNo.toLowerCase().includes(searchTerm)
        );
    });

    // Fetch students when batch and subject are selected
    useEffect(() => {
        if (!selectedBatch || !selectedSubject) return;

        const fetchStudents = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5001/api/marks/students1/${selectedBatch.batchName}`);
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

    // Function to handle grade submission
    const handleGradeSubmit = async (studentId) => {
        if (!selectedSubject?.subCode || !studentId) {
            setError("Please select a subject and student");
            return;
        }

        setGradeUpdating(true);
        try {
            const student = studentsData.find(s => s.id === studentId);
            if (!student) throw new Error("Student not found");

            // Faculty information is already available from the state
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

    // Function to render rating stars
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

    // Function to handle response submission
    const handleSubmitResponse = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:5001/api/marks/update/${studentId}/${selectedSubject.subCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    response: studentsData.find(s => s.id === studentId).response,
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
                            <option key={batch.batchName} value={batch.batchName}>
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
                            <option key={semester.semesterNumber} value={semester.semesterNumber}>
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
                            <option key={subject.code} value={subject.code}>
                                {subject.name} ({subject.code})
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