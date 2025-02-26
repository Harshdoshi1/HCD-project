import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import './StudentsList.css';
import Select from 'react-select';
import StudentModal from './StudentModal';

const StudentsList = ({ onStudentSelect }) => {
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="display-students-top-filter-add-btn">
                <div className='student-header-content'>
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
                    <div className='addstudent-btn-div-display-student'>
                        <button className='addstudent-btn' onClick={handleOpenModal}>
                            <FaPlus className='plus-icon' />
                            Add Student
                        </button>
                    </div>
                </div>
            </div>

            <div className="students-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Enrollment No.</th>
                            <th>Batch</th>
                            <th>Email ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.enrollmentNo}</td>
                                <td>{student.batch}</td>
                                <td>{student.email}</td>
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
            <StudentModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </div>
    );
};

export default StudentsList;