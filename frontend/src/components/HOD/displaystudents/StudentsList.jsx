

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaUserGraduate } from 'react-icons/fa';
import Select from 'react-select';
import StudentModal from './StudentModal';
import './StudentsList.css';

const StudentsList = ({ onStudentSelect }) => {
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const batches = ['2022-2026', '2023-2027', '2024-2028'];
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    const students = [
        {
            id: 1,
            name: 'Ritesh Scanchla',
            enrollmentNo: '92200133001',
            batch: '2022-2026',
            email: 'ritesh.sanchala@marwadiuniversity.ac.in'
        },
        {
            id: 2,
            name: 'Harsh Doshi',
            enrollmentNo: '92200133002',
            batch: '2022-2026',
            email: 'harsh.doshi@marwadiuniversity.ac.in'
        },
        {
            id: 3,
            name: 'Prashant Sarvaiya',
            enrollmentNo: '92200133003',
            batch: '2022-2026',
            email: 'prashant.sarvaiya@marwadiuniversity.ac.in'
        },
        {
            id: 5,
            name: 'Shyama Vagashia',
            enrollmentNo: '92200133005',
            batch: '2022-2026',
            email: 'shyama.vagashia@marwadiuniversity.ac.in'
        },
        {
            id: 6,
            name: 'Rishit Rathod',
            enrollmentNo: '92100133027',
            batch: '2021-2025',
            email: 'rishit.rathod@marwadiuniversity.ac.in'
        },
    ];

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    const batchesOptions = batches.map(batch => ({ value: batch, label: batch }));
    const semestersOptions = semesters.map(sem => ({ value: sem, label: `Semester ${sem}` }));

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
        const batchMatch = !selectedBatch || student.batch === selectedBatch;
        const semesterMatch = !selectedSemester || student.semester === parseInt(selectedSemester);
        const searchMatch = !searchQuery ||
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());

        return batchMatch && semesterMatch && searchMatch;
    });

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // Custom styles for react-select
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

    return (
        <div className="students-list-container">
            <div className="students-list-header">
                <div className="header-left">
                    <div className="header-icon">
                        <FaUserGraduate />
                    </div>
                    <div className="header-text">
                        <h1>Students Directory</h1>
                        <p>Manage and view all students</p>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <button
                        className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                        onClick={toggleFilters}
                    >
                        <FaFilter />
                        <span>Filters</span>
                    </button>

                    <button className="add-student-btn" onClick={handleOpenModal}>
                        <FaPlus />
                        <span>Add Student</span>
                    </button>
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

                        <div className="filter-item">
                            <label>Semester</label>
                            <Select
                                value={selectedSemester ? { value: selectedSemester, label: `Semester ${selectedSemester}` } : null}
                                onChange={option => setSelectedSemester(option ? option.value : '')}
                                options={semestersOptions}
                                placeholder="Select Semester"
                                isClearable
                                isDisabled={!selectedBatch}
                                styles={customSelectStyles}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="students-data-container">
                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading students data...</p>
                    </div>
                ) : filteredStudents.length > 0 ? (
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
                                    <tr key={student.id} className="student-row">
                                        <td className="student-name-list">{student.name}</td>
                                        <td>{student.enrollmentNo}</td>
                                        <td className="batch-cell">
                                            <span className="batch-badge">{student.batch}</span>
                                        </td>
                                        <td className="email-cell">{student.email}</td>
                                        <td>
                                            <button
                                                className="view-details-btn"
                                                onClick={() => onStudentSelect && onStudentSelect(student.id)}
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

            <StudentModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </div>
    );
};

export default StudentsList;