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
    const [componentMarks, setComponentMarks] = useState(null);
    const [activeComponents, setActiveComponents] = useState([]);

    // Function to validate grade value
    const validateGrade = (value, component) => {
        const numValue = parseInt(value);
        if (isNaN(numValue)) return 0;
        if (numValue < 0) return 0;

        // Check if we have component marks and limit the value to the maximum allowed
        if (componentMarks && component) {
            const maxValue = componentMarks[component.toLowerCase()] || 100;
            if (numValue > maxValue) return maxValue;
        } else if (numValue > 100) {
            return 100;
        }

        return numValue;
    };

    // Handle grade input change
    const handleGradeChange = async (studentId, component, value) => {
        const validatedValue = validateGrade(value, component);

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

    // Function to fetch component marks by subject code
    const fetchComponentMarks = async (subjectCode) => {
        if (!subjectCode) return;

        try {
            console.log('Fetching components for subject:', subjectCode);
            // Use the getSubjectComponentsWithSubjectCode endpoint
            const response = await fetch(`http://localhost:5001/api/subjects/getSubjectComponentsWithSubjectCode/${subjectCode}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch subject components");
            }

            const data = await response.json();
            console.log("Subject components data:", data);

            // Extract component marks from the response
            const componentMarksData = data.marks || {};
            setComponentMarks({
                ese: componentMarksData.ese || 0,
                cse: componentMarksData.cse || 0,
                ia: componentMarksData.ia || 0,
                tw: componentMarksData.tw || 0,
                viva: componentMarksData.viva || 0
            });

            // Determine which components are active (non-zero) based on the component marks
            const components = [];
            if (componentMarksData.ese > 0) components.push('ESE');
            if (componentMarksData.cse > 0) components.push('CSE');
            if (componentMarksData.ia > 0) components.push('IA');
            if (componentMarksData.tw > 0) components.push('TW');
            if (componentMarksData.viva > 0) components.push('Viva');

            setActiveComponents(components);
            console.log("Active components:", components);
        } catch (error) {
            console.error("Error fetching subject components:", error);
            setError("Failed to fetch subject components: " + error.message);
        }
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
                    response: student.response || '',
                    rating: ratings[studentId] || 0
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || "Failed to update grades");
            }

            const data = await response.json();
            console.log("Grades updated successfully:", data);

            // Instead of refreshing all student data, just update the current student in the state
            setStudentsData(prevData =>
                prevData.map(s => {
                    if (s.id === studentId) {
                        // Mark this student as graded
                        return {
                            ...s,
                            isGraded: true
                        };
                    }
                    return s;
                })
            );

            // Update the UI to show succes     setEditingGrades(null);
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
        if (!batchId || !subjectCode || !selectedSemester) return;

        setLoading(true);
        try {
            console.log('Fetching student data for batch:', batchId, 'subject:', subjectCode, 'and semester:', selectedSemester.semesterNumber);
            // Use the API endpoint that includes semester filtering
            const response = await fetch(`http://localhost:5001/api/marks/students/${batchId}/${selectedSemester.semesterNumber}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Fetched student data:', data);

            // Transform the data to ensure proper structure
            const transformedData = data.map(student => {
                // Find existing grades for this student and subject
                const existingGrades = student.Gettedmarks?.find(mark =>
                    mark.subjectId === subjectCode
                );

                console.log(`Student ${student.id} existing grades for ${subjectCode}:`, existingGrades);

                return {
                    ...student,
                    grades: {
                        ese: existingGrades?.ese ?? 0,
                        cse: existingGrades?.cse ?? 0,
                        ia: existingGrades?.ia ?? 0,
                        tw: existingGrades?.tw ?? 0,
                        viva: existingGrades?.viva ?? 0
                    },
                    response: existingGrades?.facultyResponse || '',
                    isGraded: !!existingGrades // Flag to indicate if student has been graded
                };
            });

            setStudentsData(transformedData);

            // Initialize ratings from fetched data
            const initialRatings = {};
            data.forEach(student => {
                const existingGrades = student.Gettedmarks?.find(mark =>
                    mark.subjectId === subjectCode
                );
                initialRatings[student.id] = existingGrades?.facultyRating || 0;
            });
            setRatings(initialRatings);
        } catch (error) {
            console.error('Error fetching student data:', error);
            setError('Failed to fetch student data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Custom grade input component
    const GradeInput = ({ value, onChange, disabled, component }) => {
        const [localValue, setLocalValue] = useState(value || '');
        const maxValue = componentMarks ? componentMarks[component.toLowerCase()] || 100 : 100;

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
            const validatedValue = validateGrade(localValue, component);
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
                max={maxValue}
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
                console.log('Fetching all batches...');
                const response = await fetch("http://localhost:5001/api/batches/getAllBatches");
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                console.log('Fetched batches:', data);

                setBatches(data.map(batch => ({
                    id: batch.id,
                    batchName: batch.batchName
                })));
            } catch (error) {
                console.error("Error fetching batches:", error);
                setError("Failed to fetch batches: " + error.message);
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
                console.log('Fetching semesters for batch:', selectedBatch.batchName);
                const response = await fetch(`http://localhost:5001/api/semesters/getSemestersByBatch/${selectedBatch.batchName}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                console.log('Fetched semesters:', data);

                setSemesters(data.map(semester => ({
                    id: semester.id,
                    semesterNumber: semester.semesterNumber
                })));
            } catch (error) {
                console.error("Error fetching semesters:", error);
                setError("Failed to fetch semesters: " + error.message);
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
                // Get faculty information from localStorage
                const faculty = JSON.parse(localStorage.getItem('user'));
                if (!faculty || !faculty.name) {
                    throw new Error("Faculty information not found");
                }

                // First, get the batch ID from batch name
                const batchIdResponse = await fetch(
                    `http://localhost:5001/api/facultyside/marks/getBatchId/${selectedBatch.batchName}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!batchIdResponse.ok) throw new Error("Failed to fetch batch ID");
                const batchIdData = await batchIdResponse.json();
                const batchId = batchIdData.batchId;

                console.log('Fetching subjects with params:', {
                    batchId: batchId,
                    semesterId: selectedSemester.semesterNumber,
                    facultyName: faculty.name
                });

                // Use the new API endpoint that filters by faculty name with the batch ID
                const response = await fetch(
                    `http://localhost:5001/api/facultyside/marks/getsubjectByBatchAndSemester/${batchId}/${selectedSemester.semesterNumber}/${faculty.name}`
                );

                if (!response.ok) throw new Error("Failed to fetch subjects");
                const data = await response.json();
                console.log('Faculty Subject API Response:', data);

                // Process each subject to get its name
                const subjectsWithNames = await Promise.all(data.map(async (subject) => {
                    try {
                        // Get subject name from subject code
                        const subjectNameResponse = await fetch(
                            `http://localhost:5001/api/facultyside/marks/getSubjectName/${subject.subjectCode}`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (subjectNameResponse.ok) {
                            const subjectNameData = await subjectNameResponse.json();
                            return {
                                id: subject.id || subject.subjectCode,
                                subjectName: subjectNameData.subjectName,
                                subCode: subject.subjectCode
                            };
                        } else {
                            // If we can't get the name, just use the code as the name
                            return {
                                id: subject.id || subject.subjectCode,
                                subjectName: subject.subjectCode,
                                subCode: subject.subjectCode
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching name for subject ${subject.subjectCode}:`, error);
                        return {
                            id: subject.id || subject.subjectCode,
                            subjectName: subject.subjectCode, // Fallback to code if name fetch fails
                            subCode: subject.subjectCode
                        };
                    }
                }));

                console.log('Subjects with names:', subjectsWithNames);
                setSubjects(subjectsWithNames);
            } catch (error) {
                console.error("Error fetching subjects:", error);
                setError("Failed to fetch subjects: " + error.message);
                setSubjects([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, [selectedBatch, selectedSemester]);

    // Fetch students when subject changes
    useEffect(() => {
        if (!selectedBatch || !selectedSubject || !selectedSemester) return;

        const fetchStudents = async () => {
            setLoading(true);
            try {
                // Get batch ID first
                const batchIdResponse = await fetch(
                    `http://localhost:5001/api/facultyside/marks/getBatchId/${selectedBatch.batchName}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!batchIdResponse.ok) throw new Error("Failed to fetch batch ID");
                const batchIdData = await batchIdResponse.json();
                const batchId = batchIdData.batchId;

                console.log('Fetching students for batch ID:', batchId, 'and semester:', selectedSemester.semesterNumber);

                // Use the new API endpoint that filters by both batch and semester
                const response = await fetch(`http://localhost:5001/api/marks/students/${batchId}/${selectedSemester.semesterNumber}`);
                if (!response.ok) throw new Error("Failed to fetch students");
                const data = await response.json();
                console.log('Students API Response:', data);

                const studentsWithGrades = data.map(student => ({
                    id: student.id,
                    name: student.name,
                    enrollmentNo: student.enrollmentNumber,
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
                setError("Failed to fetch students: " + error.message);
                setStudentsData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [selectedBatch, selectedSemester, selectedSubject]);

    // Fetch component marks when subject changes
    useEffect(() => {
        if (!selectedSubject) return;
        fetchComponentMarks(selectedSubject.subCode);
    }, [selectedSubject]);

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
        const batchName = e.target.value;
        if (!batchName) {
            setSelectedBatch(null);
            return;
        }
        const batch = batches.find(b => b.batchName === batchName);
        console.log('Selected batch:', batch);
        setSelectedBatch(batch);
        setSelectedSemester(null);
        setSelectedSubject(null);
    };

    const handleSemesterChange = (e) => {
        const semesterNumber = parseInt(e.target.value);
        if (isNaN(semesterNumber)) {
            setSelectedSemester(null);
            return;
        }
        const semester = semesters.find(s => s.semesterNumber === semesterNumber);
        console.log('Selected semester:', semester);
        setSelectedSemester(semester);
        setSelectedSubject(null);
    };

    const handleSubjectChange = (e) => {
        console.log('Selected subject value:', e.target.value); // Debug log
        console.log('Available subjects:', subjects); // Debug log

        // Find the subject by subCode
        const subject = subjects.find(s => s.subCode === e.target.value);
        console.log('Found subject:', subject); // Debug log

        if (subject) {
            setSelectedSubject(subject);

            // Get batch ID and then fetch student data
            const getBatchIdAndFetchStudents = async () => {
                try {
                    // Get batch ID from batch name
                    const batchIdResponse = await fetch(
                        `http://localhost:5001/api/facultyside/marks/getBatchId/${selectedBatch.batchName}`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (!batchIdResponse.ok) throw new Error("Failed to fetch batch ID");
                    const batchIdData = await batchIdResponse.json();
                    const batchId = batchIdData.batchId;

                    // Fetch student data with batch ID
                    fetchStudentData(batchId, subject.subCode);
                } catch (error) {
                    console.error("Error getting batch ID:", error);
                    setError("Failed to get batch ID: " + error.message);
                }
            };

            getBatchIdAndFetchStudents();
        } else {
            console.error('Subject not found for code:', e.target.value);
        }
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
                            <option key={subject.id || subject.subCode} value={subject.subCode}>
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
                            <span className="graded-count">
                                {filteredStudents.filter(s => s.isGraded).length} Graded / {filteredStudents.length} Total
                            </span>
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
                                    <div className="student-left-section">
                                        <img
                                            src={student.image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                                            alt={student.name}
                                            className="student-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
                                            }}
                                        />
                                        <div className="student-info-container-sgp">
                                            <div className="student-details-student-grades">
                                                <span className="student-name">{student.name}</span>
                                                <span className="enrollment-number">{student.enrollmentNo}</span>
                                                {student.isGraded && (
                                                    <span className="graded-badge">Graded</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="student-grade-components">
                                        {activeComponents.length > 0 ? (
                                            <div className="grade-components-mini">
                                                {activeComponents.map((component) => (
                                                    <div key={component} className="grade-input-mini">
                                                        <label>{component}:</label>
                                                        <input
                                                            type="text"
                                                            value={student.grades?.[component.toLowerCase()] || '0'}
                                                            onChange={(e) => editingGrades === student.id && handleGradeChange(student.id, component, e.target.value)}
                                                            disabled={editingGrades !== student.id}
                                                            className={`mini-input ${student.isGraded ? 'graded' : ''}`}
                                                        />
                                                        <span className="mini-max">/{componentMarks?.[component.toLowerCase()] || '100'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-components-mini">No grade components defined</div>
                                        )}
                                    </div>

                                    <div className="student-actions-sgp">
                                        <button
                                            className={`edit-grades-button ${editingGrades === student.id ? 'active' : ''}`}
                                            onClick={() => editingGrades === student.id ? setEditingGrades(null) : setEditingGrades(student.id)}
                                        >
                                            <Edit2 size={16} />
                                            {editingGrades === student.id ? 'Cancel Edit' : 'Edit Marks'}
                                        </button>
                                        <button
                                            className={`response-button ${expandedStudent === student.id ? 'active' : ''}`}
                                            onClick={() => setExpandedStudent(
                                                expandedStudent === student.id ? null : student.id
                                            )}
                                        >
                                            <MessageCircle size={16} />
                                            Response
                                            {expandedStudent === student.id ? (
                                                <ChevronUp size={16} />
                                            ) : (
                                                <ChevronDown size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {editingGrades === student.id && (
                                    <div className="save-grades-container">
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
                                    </div>
                                )}

                                {expandedStudent === student.id && (
                                    <div className="grade-details-sgp">
                                        <div className="faculty-response">
                                            <h3>Faculty Response</h3>
                                            <textarea
                                                placeholder="Add your response..."
                                                value={student.response || ''}
                                                onChange={(e) => handleResponseChange(student.id, e.target.value)}
                                                className={editingGrades !== student.id ? 'readonly' : ''}
                                                disabled={editingGrades !== student.id}
                                            />
                                            <div className="rating-container">
                                                <h4>Student Rating</h4>
                                                {renderRatingStars(student.id)}
                                            </div>
                                            <button
                                                className="submit-button"
                                                onClick={() => handleSubmitResponse(student.id)}
                                                disabled={editingGrades !== student.id}
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