import React, { useState } from 'react';
import { Book, Users, CalendarDays } from "lucide-react";
import './AssignedSubjects.css';


const SubjectCard = ({ subject }) => {
    return (
        <div className="subject-card">
            <div className="card-header">
                <div className="subject-info">
                    <span className="subject-code">{subject.code}</span>
                    <h3 className="subject-name">{subject.name}</h3>
                    <p className="subject-description">{subject.description}</p>
                </div>
                <Book className="book-icon" />
            </div>

            <div className="card-footer">
                <div className="footer-item">
                    <Users className="footer-icon" />
                    <span>{subject.type}</span>
                </div>
                <div className="footer-item">
                    <CalendarDays className="footer-icon" />
                    <span>{subject.credits} Credits</span>
                </div>
            </div>
        </div>
    );
};

const Assignedsubjects = () => {
    const [batch, setBatch] = useState("");
    const [type, setType] = useState("");
    const [semester, setSemester] = useState("");

    // Sample data - replace with your actual data
    const subjects = [
        {
            id: 1,
            name: "Data Structures",
            code: "CS201",
            credits: 4,
            type: "Theory",
            description: "Fundamental data structures and algorithms"
        },
        {
            id: 2,
            name: "Database Systems",
            code: "CS301",
            credits: 3,
            type: "Theory + Lab",
            description: "Introduction to database management systems"
        },
        {
            id: 3,
            name: "Computer Networks",
            code: "CS401",
            credits: 4,
            type: "Theory",
            description: "Fundamentals of computer networking"
        },
        {
            id: 4,
            name: "Operating Systems",
            code: "CS302",
            credits: 4,
            type: "Theory + Lab",
            description: "Operating system concepts and design"
        },
        {
            id: 5,
            name: "Software Engineering",
            code: "CS501",
            credits: 3,
            type: "Theory",
            description: "Software development lifecycle and methodologies"
        },
        {
            id: 6,
            name: "Web Development",
            code: "CS601",
            credits: 4,
            type: "Theory + Lab",
            description: "Modern web development technologies"
        },
    ];

    return (
        <div className="assigned-subjects-container">
            <div className="header">
                <h1>Current Subjects</h1>
            </div>

            <div className="filters-top-assigned-subjects">
                <div className="filters-container-assigned-subjects">
                    <div className="filter-group">
                        <select value={batch} onChange={(e) => setBatch(e.target.value)}>
                            <option value="">Select batch</option>
                            <option value="2022-2026">2022-2026</option>
                            <option value="2021-2025">2021-2025</option>
                            <option value="2020-2024">2020-2024</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="">Select type</option>
                            <option value="degree">Degree</option>
                            <option value="diploma">Diploma</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                            <option value="">Select semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="subjects-grid">
                {subjects.map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} />
                ))}
            </div>
        </div>
    );
};

export default Assignedsubjects;