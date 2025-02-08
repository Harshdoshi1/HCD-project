import React, { useState } from 'react';
import FacultyCard from './FacultyCard';

const FacultyList = ({ onSelectFaculty }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [department, setDepartment] = useState('all');

    // Mock data - replace with actual data
    const facultyMembers = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            department: "Computer Science",
            specialization: "Machine Learning",
            email: "sarah.j@university.edu",
            subjects: ["Data Structures", "Artificial Intelligence"]
        },
        {
            id: 2,
            name: "Prof. Michael Chen",
            department: "Electronics",
            specialization: "Digital Systems",
            email: "m.chen@university.edu",
            subjects: ["Digital Electronics", "Microprocessors"]
        }
    ];

    const departments = ["all", "Computer Science", "Electronics", "Mechanical", "Civil"];

    const filteredFaculty = facultyMembers.filter(faculty => {
        const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faculty.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = department === 'all' || faculty.department === department;
        return matchesSearch && matchesDepartment;
    });

    return (
        <div className="faculty-list-container">
            <div className="faculty-filters">
                <input
                    type="text"
                    placeholder="Search faculty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="faculty-search"
                />
                <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="faculty-department-filter"
                >
                    {departments.map(dept => (
                        <option key={dept} value={dept}>
                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="faculty-grid">
                {filteredFaculty.map(faculty => (
                    <FacultyCard
                        key={faculty.id}
                        faculty={faculty}
                        onClick={() => onSelectFaculty(faculty)}
                    />
                ))}
            </div>
        </div>
    );
};

export default FacultyList;