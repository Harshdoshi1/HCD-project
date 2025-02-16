import React, { useState, useEffect } from 'react';
import FacultyCard from './FacultyCard';

const FacultyList = ({ onSelectFaculty }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [department, setDepartment] = useState('all');
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const departments = ["all", "Computer Science", "Electronics", "Mechanical", "Civil"];

    useEffect(() => {
        const fetchFacultyData = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/users/getAllUsers"); // Replace with your API URL
                if (!response.ok) {
                    throw new Error('Failed to fetch faculty data');
                }
                const data = await response.json();
                setFacultyMembers(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFacultyData();
    }, []);

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


            </div>

            <div className="faculty-grid">
                {filteredFaculty.length > 0 ? (
                    filteredFaculty.map(faculty => (
                        <FacultyCard
                            key={faculty.id}
                            faculty={faculty}
                            onClick={() => onSelectFaculty(faculty)}
                        />
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500">No faculty members found.</p>
                )}
            </div>
        </div>
    );
};

export default FacultyList;