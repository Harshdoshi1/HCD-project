import React, { useState, useEffect } from 'react';
import './PassStudents.css';
import { Search } from 'lucide-react';

const PassStudents = ({ isOpen, onClose }) => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [targetSemester, setTargetSemester] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudents, setSelectedStudents] = useState({});
    const [allSelected, setAllSelected] = useState(true);

    // Fetch all batches on component mount
    useEffect(() => {
        if (isOpen) {
            fetchBatches();
        }
    }, [isOpen]);

    // Fetch batches
    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5001/api/batches/getAllBatches");
            if (!response.ok) throw new Error("Failed to fetch batches");
            const data = await response.json();
            setBatches(data);
        } catch (error) {
            console.error("Error fetching batches:", error);
            setError("Failed to fetch batches");
        } finally {
            setLoading(false);
        }
    };

    // Fetch semesters when batch changes
    useEffect(() => {
        if (selectedBatch) {
            fetchSemesters();
        } else {
            setSemesters([]);
        }
    }, [selectedBatch]);

    // Fetch semesters for selected batch
    const fetchSemesters = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/semesters/getSemestersByBatch/${selectedBatch.batchName}`);
            if (!response.ok) throw new Error("Failed to fetch semesters");
            const data = await response.json();
            setSemesters(data);
        } catch (error) {
            console.error("Error fetching semesters:", error);
            setError("Failed to fetch semesters");
            setSemesters([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch students when batch changes
    useEffect(() => {
        if (selectedBatch) {
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [selectedBatch]);

    // Fetch students for selected batch
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/students/getStudentsByBatch/${selectedBatch.id}`);
            if (!response.ok) throw new Error("Failed to fetch students");
            const data = await response.json();
            setStudents(data);

            // Initialize all students as selected
            const initialSelection = {};
            data.forEach(student => {
                initialSelection[student.id] = true;
            });
            setSelectedStudents(initialSelection);
            setAllSelected(true);
        } catch (error) {
            console.error("Error fetching students:", error);
            setError("Failed to fetch students");
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle batch selection
    const handleBatchChange = (e) => {
        const batchId = e.target.value;
        const batch = batches.find(b => b.id === parseInt(batchId));
        setSelectedBatch(batch || null);
        setTargetSemester('');
    };

    // Handle target semester selection
    const handleTargetSemesterChange = (e) => {
        setTargetSemester(e.target.value);
    };

    // Handle search query change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Toggle selection for a single student
    const toggleStudentSelection = (studentId) => {
        setSelectedStudents(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));

        // Update allSelected state based on current selections
        const updatedSelections = {
            ...selectedStudents,
            [studentId]: !selectedStudents[studentId]
        };

        const allChecked = Object.values(updatedSelections).every(value => value);
        setAllSelected(allChecked);
    };

    // Toggle selection for all students
    const toggleAllStudents = () => {
        const newAllSelected = !allSelected;
        const newSelections = {};

        filteredStudents.forEach(student => {
            newSelections[student.id] = newAllSelected;
        });

        setSelectedStudents(prev => ({
            ...prev,
            ...newSelections
        }));

        setAllSelected(newAllSelected);
    };

    // Filter students based on search query
    const filteredStudents = students.filter(student => {
        const searchTerm = searchQuery.toLowerCase();
        return (
            student.name.toLowerCase().includes(searchTerm) ||
            student.enrollmentNumber.toLowerCase().includes(searchTerm)
        );
    });

    // Update selected students' semester
    const updateStudentSemesters = async () => {
        if (!targetSemester) {
            alert("Please select a target semester");
            return;
        }

        const studentsToUpdate = Object.entries(selectedStudents)
            .filter(([_, isSelected]) => isSelected)
            .map(([studentId]) => parseInt(studentId));

        if (studentsToUpdate.length === 0) {
            alert("Please select at least one student");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/students/updateStudentSemesters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentIds: studentsToUpdate,
                    newSemester: parseInt(targetSemester)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update student semesters");
            }

            alert("Students' semesters updated successfully!");
            fetchStudents(); // Refresh the student list
        } catch (error) {
            console.error("Error updating student semesters:", error);
            setError(`Failed to update student semesters: ${error.message}`);
            alert(`Failed to update student semesters: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="pass-students-modal-overlay">
            <div className="pass-students-modal">
                <h2>Update Student Semesters</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="batch-selection">
                    <label>Select Batch:</label>
                    <select
                        value={selectedBatch?.id || ''}
                        onChange={handleBatchChange}
                    >
                        <option value="">Select a batch</option>
                        {batches.map(batch => (
                            <option key={batch.id} value={batch.id}>
                                {batch.batchName}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedBatch && (
                    <>
                        <div className="search-container">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or enrollment number..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                        {console.log(filteredStudents)}
                        <div className="students-table-container">
                            {loading ? (
                                <div className="loading">Loading students...</div>
                            ) : filteredStudents.length > 0 ? (
                                <>
                                    <table className="students-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        onChange={toggleAllStudents}
                                                    />
                                                </th>
                                                <th>Name</th>
                                                <th>Enrollment</th>
                                                <th>Current Semester</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {filteredStudents.map(student => (
                                                <tr key={student.id}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudents[student.id] || false}
                                                            onChange={() => toggleStudentSelection(student.id)}
                                                        />
                                                    </td>
                                                    <td>{student.name}</td>
                                                    <td>{student.enrollmentNumber}</td>
                                                    <td>{student.currnetsemester}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="semester-update-controls">
                                        <div className="target-semester-selection">
                                            <label>Transfer selected students to semester:</label>
                                            <select
                                                value={targetSemester}
                                                onChange={handleTargetSemesterChange}
                                            >
                                                <option value="">Select target semester</option>
                                                {semesters.map(semester => (
                                                    <option key={semester.id} value={semester.semesterNumber}>
                                                        Semester {semester.semesterNumber}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            className="update-button"
                                            onClick={updateStudentSemesters}
                                            disabled={loading || !targetSemester}
                                        >
                                            {loading ? "Updating..." : "Update Semesters"}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="no-students">No students found for this batch</div>
                            )}
                        </div>
                    </>
                )}

                <div className="modal-actions">
                    <button
                        className="close-button"
                        onClick={onClose}
                        style={{ backgroundColor: '#f44336', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
                    >
                        Close
                    </button>

                    {/* <button className="close-button" onClick={onClose}>Close</button> */}
                </div>
            </div>
        </div>
    );
};

export default PassStudents;