import React, { useState } from 'react';
import './StudentsList.css';
import Select from 'react-select';

const StudentsList = ({ onStudentSelect }) => {
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const batches = ['2022-2026', '2023-2027', '2024-2028'];
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    const students = [
        {
            id: 1,
            name: 'ritesh',
            enrollmentNo: '92200133001',
            batch: '2022-2026',
            semester: 1,
            image: 'https://via.placeholder.com/50'
        },
        {
            id: 2,
            name: 'harsh',
            enrollmentNo: '92200133002',
            batch: '2022-2026',
            semester: 1,
            image: 'https://via.placeholder.com/50'
        },
        {
            id: 3,
            name: 'prashant',
            enrollmentNo: '92200133003',
            batch: '2022-2026',
            semester: 1,
            image: 'https://via.placeholder.com/50'
        },
        {
            id: 5,
            name: 'shyama',
            enrollmentNo: '92200133005',
            batch: '2022-2026',
            semester: 1,
            image: 'https://via.placeholder.com/50'
        },
        {
            id: 6,
            name: 'rishit',
            enrollmentNo: '92100133027',
            batch: '2021-2025',
            semester: 1,
            image: 'https://avatars.githubusercontent.com/u/29489915?v=4'
        },

    ];

    const handleBatchChange = (e) => {
        setSelectedBatch(e.target.value);
    };

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const batchesOptions = batches.map(batch => ({ value: batch, label: batch }));
    const semestersOptions = semesters.map(sem => ({ value: sem, label: `Semester ${sem}` }));

    const filteredStudents = students.filter(student => {
        const batchMatch = !selectedBatch || student.batch === selectedBatch;
        const semesterMatch = !selectedSemester || student.semester === parseInt(selectedSemester);
        const searchMatch = !searchQuery ||
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase());

        return batchMatch && semesterMatch && searchMatch;
    });

    return (
        <div className="students-container">
            <div className="filters-section-std">
                <div className="filter-group">
                    <Select
                        value={selectedBatch ? { value: selectedBatch, label: selectedBatch } : null}
                        onChange={option => setSelectedBatch(option ? option.value : '')}
                        options={batchesOptions}
                        placeholder="Select Batch"
                        isSearchable
                    />

                    <Select
                        value={selectedSemester ? { value: selectedSemester, label: `Semester ${selectedSemester}` } : null}
                        onChange={option => setSelectedSemester(option ? option.value : '')}
                        options={semestersOptions}
                        placeholder="Select Semester"
                        isSearchable
                        isDisabled={!selectedBatch}
                    />

                    <input
                        type="text"
                        placeholder="Search by name or enrollment..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="students-table">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Enrollment No.</th>

                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => (
                            <tr key={student.id}>
                                <td>
                                    <img
                                        src={student.image}
                                        alt={student.name}
                                        className="student-image"
                                    />
                                </td>
                                <td>{student.name}</td>
                                <td>{student.enrollmentNo}</td>

                                <td>
                                    <button
                                        className="view-details-btn"
                                        onClick={() => onStudentSelect(student.id)}
                                    >
                                        View Details
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

export default StudentsList;