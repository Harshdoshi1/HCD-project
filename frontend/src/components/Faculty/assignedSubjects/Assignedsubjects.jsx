import React, { useState, useEffect } from 'react';
import { Book, Users, CalendarDays, Filter, Grid, Award, Clock, MoreHorizontal, Download, Search, Sliders, X } from "lucide-react";
import './AssignedSubjects.css';

const SubjectCard = ({ subject }) => {
    return (
        <div className="subject-card-asff">
            <div className="card-header-asff">
                <div className="subject-info-asff">
                    <span className="subject-code-asff">{subject.code}</span>
                    <h3 className="subject-name-asff">{subject.name}</h3>
                    <p className="subject-description-asff">{subject.description}</p>
                </div>
                <Book className="book-icon-asff" size={24} />
            </div>

            <div className="card-content-asff">

                <div className="content-row-asff">
                    <span className="content-label-asff">Semester:</span>
                    <span className="content-value-asff">{subject.semester}</span>
                </div>
                <div className="content-row-asff">
                    <span className="content-label-asff">Batch:</span>
                    <span className="content-value-asff">{subject.batch}</span>
                </div>
            </div>

            <div className="card-footer-asff">
                <div className="footer-item-asff">
                    <Users className="footer-icon-asff" />
                    <span>{subject.type}</span>
                </div>
                <div className="footer-item-asff">
                    <CalendarDays className="footer-icon-asff" />
                    <span>{subject.credits} Credits</span>
                </div>
            </div>

            <div className="card-actions-asff">
                <button className="action-btn-asff">
                    <Download size={16} className="action-icon-asff" />
                    Syllabus
                </button>
                <button className="action-btn-asff primary">
                    View Details
                </button>
            </div>
        </div>
    );
};

const EmptyState = () => (
    <div className="empty-state-asff">
        <Book size={48} strokeWidth={1} className="empty-state-icon-asff" />

        <h3>No subjects found</h3>
        <p>Try adjusting your filters or search criteria to find what you're looking for.</p>
        <button className="apply-btn-asff">Reset Filters</button>
    </div>
);
// fetch data from localstorage
    const faculty = JSON.parse(localStorage.getItem('user'));

    const facultyId = faculty.id;
    console.log("sfefsew",facultyId);

const AssignedSubjects = () => {
    const [batch, setBatch] = useState("");
    const [type, setType] = useState("");
    const [semester, setSemester] = useState("");
    const [department, setDepartment] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const itemsPerPage = 6;

    
    // Sample data - replace with your actual data
    const subjects = [
        {
            id: 1,
            name: "Data Structures",
            code: "CS201",
            credits: 4,
            type: "Theory",
            description: "Fundamental data structures and algorithms",
            department: "Computer Science",
            semester: "3rd Semester",
            batch: "2022-2026"
        },
        {
            id: 2,
            name: "Database Systems",
            code: "CS301",
            credits: 3,
            type: "Theory + Lab",
            description: "Introduction to database management systems",
            department: "Computer Science",
            semester: "4th Semester",
            batch: "2021-2025"
        },
        {
            id: 3,
            name: "Computer Networks",
            code: "CS401",
            credits: 4,
            type: "Theory",
            description: "Fundamentals of computer networking",
            department: "Computer Science",
            semester: "5th Semester",
            batch: "2021-2025"
        },
        {
            id: 4,
            name: "Operating Systems",
            code: "CS302",
            credits: 4,
            type: "Theory + Lab",
            description: "Operating system concepts and design",
            department: "Computer Science",
            semester: "4th Semester",
            batch: "2022-2026"
        },
        {
            id: 5,
            name: "Software Engineering",
            code: "CS501",
            credits: 3,
            type: "Theory",
            description: "Software development lifecycle and methodologies",
            department: "Computer Science",
            semester: "6th Semester",
            batch: "2020-2024"
        },
        {
            id: 6,
            name: "Web Development",
            code: "CS601",
            credits: 4,
            type: "Theory + Lab",
            description: "Modern web development technologies",
            department: "Computer Science",
            semester: "7th Semester",
            batch: "2020-2024"
        },
        {
            id: 7,
            name: "Machine Learning",
            code: "CS602",
            credits: 4,
            type: "Theory + Lab",
            description: "Introduction to machine learning algorithms",
            department: "Computer Science",
            semester: "7th Semester",
            batch: "2020-2024"
        },
        {
            id: 8,
            name: "Artificial Intelligence",
            code: "CS502",
            credits: 3,
            type: "Theory",
            description: "Fundamentals of artificial intelligence",
            department: "Computer Science",
            semester: "6th Semester",
            batch: "2020-2024"
        }
    ];

    // Statistics for dashboard
    const stats = [
        { id: 1, icon: <Grid size={24} />, value: 8, label: "Total Subjects" },
        { id: 2, icon: <Clock size={24} />, value: 26, label: "Teaching Hours" },
        { id: 3, icon: <Users size={24} />, value: 186, label: "Students" },
        { id: 4, icon: <Award size={24} />, value: 3, label: "Departments" }
    ];

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Filter subjects based on search and filter criteria
    useEffect(() => {
        let results = [...subjects];

        if (batch) {
            results = results.filter(subject => subject.batch === batch);
        }

        if (department) {
            results = results.filter(subject => subject.department === department);
        }

        if (type) {
            results = results.filter(subject => subject.type.includes(type));
        }

        if (semester) {
            results = results.filter(subject => subject.semester.startsWith(semester));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(subject =>
                subject.name.toLowerCase().includes(query) ||
                subject.code.toLowerCase().includes(query) ||
                subject.description.toLowerCase().includes(query)
            );
        }

        setFilteredSubjects(results);
        setCurrentPage(1); // Reset to first page when filters change
    }, [batch, department, type, semester, searchQuery, subjects]);

    const resetFilters = () => {
        setBatch("");
        setType("");
        setSemester("");
        setDepartment("");
        setSearchQuery("");
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
    const currentSubjects = filteredSubjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Generate pagination buttons
    const renderPaginationButtons = () => {
        const buttons = [];

        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <button
                    key={i}
                    className={`page-btn-asff ${currentPage === i ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </button>
            );
        }

        return buttons;
    };

    return (
        <div className="assigned-subjects-container-asff">
            <div className="header-asff">
                <h1>Assigned Subjects</h1>
            </div>

            <div className="stats-bar-asff">
                {stats.map(stat => (
                    <div key={stat.id} className="stat-card-asff">
                        <div className="stat-icon-asff">
                            {stat.icon}
                        </div>
                        <div className="stat-content-asff">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="filters-section-asff">
                <div className="filters-heading-asff">
                    <Filter size={20} className="filters-icon-asff" />
                    <h2>Filters</h2>
                </div>

                <div className="filters-container-asff">
                    <div className="filter-group-asff">
                        <label htmlFor="search">Search</label>
                        <div className="search-input-asff">
                            <input
                                id="search"
                                type="text"
                                placeholder="Search subjects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group-asff">
                        <label htmlFor="batch">Batch</label>
                        <select
                            id="batch"
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                        >
                            <option value="">All Batches</option>
                            <option value="2022-2026">2022-2026</option>
                            <option value="2021-2025">2021-2025</option>
                            <option value="2020-2024">2020-2024</option>
                        </select>
                    </div>


                    <div className="filter-group-asff">
                        <label htmlFor="type">Course Type</label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="Theory">Theory</option>
                            <option value="Lab">Lab</option>
                            <option value="Theory + Lab">Theory + Lab</option>
                        </select>
                    </div>

                    <div className="filter-group-asff">
                        <label htmlFor="semester">Semester</label>
                        <select
                            id="semester"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        >
                            <option value="">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <option key={sem} value={`${sem}`}>{sem}rd/th Semester</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="filter-actions-asff">
                    <button className="reset-btn-asff" onClick={resetFilters}>
                        <X size={16} className="action-icon-asff" />
                        Reset Filters
                    </button>
                    <button className="apply-btn-asff">
                        <Filter size={16} className="action-icon-asff" />
                        Apply Filters
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="subjects-grid-asff">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="subject-card-asff skeleton-asff" style={{ height: '300px' }}></div>
                    ))}
                </div>
            ) : (
                <>
                    {currentSubjects.length > 0 ? (
                        <div className="subjects-grid-asff">
                            {currentSubjects.map((subject) => (
                                <SubjectCard key={subject.id} subject={subject} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}

                    {totalPages > 1 && (
                        <div className="pagination-asff">
                            {renderPaginationButtons()}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AssignedSubjects;