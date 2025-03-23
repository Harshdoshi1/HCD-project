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
// const faculty = JSON.parse(localStorage.getItem('user'));

// const facultyId = faculty.id;
// console.log("sfefsew", facultyId);
const faculty = JSON.parse(localStorage.getItem('user'));

if (faculty && faculty.id) {
    const facultyId = faculty.id;
    console.log("Faculty ID:", facultyId);
} else {
    console.log("No faculty data found in localStorage.");
}


const AssignedSubjects = () => {
    const [batch, setBatch] = useState("");
    const [type, setType] = useState("");
    const [semester, setSemester] = useState("");
    const [department, setDepartment] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [subjects, setSubjects] = useState([]); // Store original subjects
    const [filteredSubjects, setFilteredSubjects] = useState([]); // Filtered subjects
    const itemsPerPage = 6;

    // Apply filters function
    const applyFilters = () => {
        let filtered = [...subjects];

        if (searchQuery) {
            filtered = filtered.filter(subject =>
                subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                subject.code.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (batch) {
            filtered = filtered.filter(subject => subject.batch === batch);
        }

        if (semester) {
            filtered = filtered.filter(subject => subject.semester.includes(semester));
        }

        setFilteredSubjects(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const resetFilters = () => {
        setBatch("");
        setType("");
        setSemester("");
        setDepartment("");
        setSearchQuery("");
        setFilteredSubjects(subjects); // Reset to original subjects
        setCurrentPage(1);
    };

    // Fetch subjects for the current faculty
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/faculties/getSubjectsByFaculty/${facultyId}`);
                const data = await response.json();
                console.log("API Response:", data);

                if (Array.isArray(data)) {
                    setSubjects(data);
                    setFilteredSubjects(data); // Ensure it has the data
                } else {
                    console.error("Unexpected API response format", data);
                }
            } catch (error) {
                console.error("Error fetching subjects:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubjects();
    }, [faculty]);

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

            <div className="filters-section-asff">
                <div className="filters-heading-asff">
                    <Filter size={20} className="filters-icon-asff" />
                    <h2>Filters</h2>
                </div>

                <div className="filters-container-asff">
                    <div className="search-and-filters-asff">
                        <div className="filter-action-left">
                            <div className="filter-group-asff">
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Search subjects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="filter-group-asff">
                                <select id="batch" value={batch} onChange={(e) => setBatch(e.target.value)}>
                                    <option value="">All Batches</option>
                                    <option value="Degree 22-26">Degree 22-26</option>
                                </select>
                            </div>

                            <div className="filter-group-asff">
                                <select id="semester" value={semester} onChange={(e) => setSemester(e.target.value)}>
                                    <option value="">All Semesters</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                        <option key={sem} value={sem}>{sem} Semester</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="filter-actions-asff">
                            <button className="reset-btn-asff" onClick={resetFilters}>
                                <X size={16} className="action-icon-asff" />
                                Reset Filters
                            </button>
                            <button className="apply-btn-asff" onClick={applyFilters}>
                                <Filter size={16} className="action-icon-asff" />
                                Apply Filters
                            </button>
                        </div>
                    </div>
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
                    {filteredSubjects.length > 0 ? (
                        <div className="subjects-grid-asff">
                            {filteredSubjects.map((subject) => (
                                <SubjectCard key={subject.id} subject={subject} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </>
            )}
        </div>
    );
};

export default AssignedSubjects;