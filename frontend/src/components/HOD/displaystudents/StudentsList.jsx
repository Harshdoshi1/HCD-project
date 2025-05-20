import React, { useState, useEffect } from 'react';
import { UserRoundPlus } from "lucide-react";
import { FaPlus, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaUserGraduate } from 'react-icons/fa';
import Select from 'react-select';
import StudentModal from './StudentModal';
import StudentGradesExcell from './StudentGradesExcell';
import './StudentsList.css';

const StudentsList = ({ onStudentSelect }) => {
    const [selectedBatch, setSelectedBatch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCPIModalOpen, setIsCPIModalOpen] = useState(false);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/students/getAllStudents');
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }
            const data = await response.json();
            // Add a unique ID to each student record
            const studentsWithIds = data.map((student, index) => ({
                ...student,
                uniqueId: `${student.enrollmentNumber}-${index}`
            }));
            setStudents(studentsWithIds);

            // Extract unique batches from students data
            const uniqueBatches = [...new Set(studentsWithIds.filter(student => student.Batch).map(student => student.Batch.batchName))];
            setBatches(uniqueBatches);
            setSelectedBatch(uniqueBatches.length > 0 ? uniqueBatches[0] : ''); // Set the first batch as default
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setIsLoading(false);
        }
    };

    const batchesOptions = batches.map(batch => ({ value: batch, label: batch }));

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedStudents = [...students].sort((a, b) => {
        let comparison = 0;
        if (a[sortField] < b[sortField]) {
            comparison = -1;
        } else if (a[sortField] > b[sortField]) {
            comparison = 1;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const filteredStudents = sortedStudents.filter(student => {
        const batchMatch = selectedBatch ? student.Batch?.batchName === selectedBatch : true;
        const searchMatch = !searchQuery ||
            student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.enrollmentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchQuery.toLowerCase());

        return batchMatch && searchMatch;
    });

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        fetchStudents(); // Refresh the list after adding a new student
    };

    const handleOpenCPIModal = () => {
        setIsCPIModalOpen(true);
    };

    const handleCloseCPIModal = () => {
        setIsCPIModalOpen(false);
        fetchStudents(); // Refresh the list after potentially updating CPI/SPI data
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: '8px',
            borderColor: '#e0e0e0',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#9b87f5',
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#9b87f5' : state.isFocused ? '#f0ebff' : null,
            color: state.isSelected ? 'white' : '#333',
        }),
    };

    const SortIcon = ({ field }) => (
        <button
            className="sort-button"
            onClick={() => toggleSort(field)}
            title={`Sort by ${field}`}
        >
            {sortField === field ? (
                sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
            ) : (
                <FaSortAmountDown className="sort-icon-inactive" />
            )}
        </button>
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="students-list-container">
            <div className="students-list-header">
                <div className="header-left">
                    <button className="add-student-btn" onClick={handleOpenModal}>
                        <UserRoundPlus />
                        <span>Add Student</span>
                    </button>
                    <button className="cpi-btn" onClick={handleOpenCPIModal}>
                        <FaUserGraduate />
                        <span>CPI</span>
                    </button>
                </div>

                <div className="header-actions">
                    <button
                        className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                        onClick={toggleFilters}
                    >
                        <FaFilter />
                        <span>Filters</span>
                    </button>
                    <div className="search-container">
                        <FaSearch className="search-icon" style={{ marginLeft: "5px" }} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-grid">
                        <div className="filter-item">
                            <label>Batch</label>
                            <Select
                                value={selectedBatch ? { value: selectedBatch, label: selectedBatch } : null}
                                onChange={option => setSelectedBatch(option ? option.value : '')}
                                options={batchesOptions}
                                placeholder="Select Batch"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>
                    </div>
                </div>
            )}
            <div className="students-data-container">
                {

                    filteredStudents.length > 0 ? (
                        <div className="students-table-wrapper">
                            <table className="students-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <div className="th-content">
                                                <span>Name</span>
                                                <SortIcon field="name" />
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-content">
                                                <span>Enrollment No.</span>
                                                <SortIcon field="enrollmentNo" />
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-content">
                                                <span>Batch</span>
                                                <SortIcon field="batch" />
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-content">
                                                <span>Email ID</span>
                                            </div>
                                        </th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => (
                                        <tr key={student.uniqueId}>
                                            <td>{student.name}</td>
                                            <td>{student.enrollmentNumber}</td>
                                            <td>{student.Batch?.batchName || 'N/A'}</td>
                                            <td>{student.email}</td>
                                            <td>
                                                <button
                                                    className="view-details-btn"
                                                    onClick={() => onStudentSelect && onStudentSelect(student.enrollmentNumber)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-results">
                            <div className="no-results-icon">
                                <FaSearch />
                            </div>
                            <h3>No students found</h3>
                            <p>Try adjusting your search or filter criteria</p>
                        </div>
                    )}
            </div>

            <div className="students-list-footer">
                <p>Showing {filteredStudents.length} of {students.length} students</p>
            </div>

            {isModalOpen && (
                <StudentModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}

            {isCPIModalOpen && (
                <StudentGradesExcell
                    isOpen={isCPIModalOpen}
                    onClose={handleCloseCPIModal}
                />
            )}
        </div>
    );
};

export default StudentsList;