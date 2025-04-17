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
                    <span className="content-value-asff">{subject.semesterId || 'Not assigned'}</span>
                </div>
                <div className="content-row-asff">
                    <span className="content-label-asff">Batch:</span>
                    <span className="content-value-asff">{subject.batch || 'Not assigned'}</span>
                </div>
                <div className="content-row-asff">
                    <span className="content-label-asff">Department:</span>
                    <span className="content-value-asff">{subject.department || 'Not specified'}</span>
                </div>
            </div>

            <div className="card-footer-asff">
                <div className="footer-item-asff">
                    <Users className="footer-icon-asff" />
                    <span>{subject.type || 'Not specified'}</span>
                </div>
                <div className="footer-item-asff">
                    <CalendarDays className="footer-icon-asff" />
                    <span>{subject.credits || 0} Credits</span>
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
    const [batchOptions, setBatchOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const itemsPerPage = 6;

    useEffect(() => {
        const faculty = JSON.parse(localStorage.getItem('user'));
        const facultyId = faculty?.id;

        if (!facultyId) {
            // Redirect to login if faculty data is not found
            window.location.href = '/';
            return;
        }

        const fetchSubjects = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:5001/api/faculties/getSubjectsByFaculty/${facultyId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch subjects');
                }
                const data = await response.json();
                console.log("API Response:", data);

                if (Array.isArray(data)) {
                    // Extract unique filter options from the data
                    const uniqueBatches = [...new Set(data.map(subject => subject.batch).filter(Boolean))];
                    const uniqueTypes = [...new Set(data.map(subject => subject.type).filter(Boolean))];
                    const uniqueDepartments = [...new Set(data.map(subject => subject.department).filter(Boolean))];
                    const uniqueSemesters = [...new Set(data.map(subject => subject.semesterId).filter(Boolean))];

                    // Sort options
                    uniqueBatches.sort();
                    uniqueTypes.sort();
                    uniqueDepartments.sort();
                    uniqueSemesters.sort((a, b) => Number(a) - Number(b));

                    // Set filter options
                    setBatchOptions(uniqueBatches);
                    setTypeOptions(uniqueTypes);
                    setDepartmentOptions(uniqueDepartments);
                    setSemesterOptions(uniqueSemesters);

                    setSubjects(data);
                    setFilteredSubjects(data);
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
    }, []);

    // Apply filters function
    const applyFilters = () => {
        let filtered = [...subjects];

        if (searchQuery) {
            filtered = filtered.filter(subject =>
                (subject.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (subject.code?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (subject.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
            );
        }

        if (batch) {
            filtered = filtered.filter(subject => subject.batch === batch);
        }

        if (type) {
            filtered = filtered.filter(subject => subject.type === type);
        }

        if (department) {
            filtered = filtered.filter(subject => subject.department === department);
        }

        if (semester) {
            filtered = filtered.filter(subject => String(subject.semesterId) === semester);
        }

        setFilteredSubjects(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Apply filters whenever any filter value changes
    useEffect(() => {
        applyFilters();
    }, [searchQuery, batch, type, department, semester]);

    const resetFilters = () => {
        setBatch("");
        setType("");
        setSemester("");
        setDepartment("");
        setSearchQuery("");
        setFilteredSubjects(subjects); // Reset to original subjects
        setCurrentPage(1);
    };

    // Statistics for dashboard
    const stats = [
        { id: 1, icon: <Grid size={24} />, value: subjects.length, label: "Total Subjects" },
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
                        <div className="filter-group-asff">
                            <label htmlFor="search">Search</label>
                            <input
                                id="search"
                                type="text"
                                placeholder="Search subjects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="filter-group-asff">
                            <label htmlFor="batch">Batch</label>
                            <select id="batch" value={batch} onChange={(e) => setBatch(e.target.value)}>
                                <option value="">All Batches</option>
                                {batchOptions.map((batchOption) => (
                                    <option key={batchOption} value={batchOption}>
                                        {batchOption}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group-asff">
                            <label htmlFor="semester">Semester</label>
                            <select id="semester" value={semester} onChange={(e) => setSemester(e.target.value)}>
                                <option value="">All Semesters</option>
                                {semesterOptions.map((semesterOption) => (
                                    <option key={semesterOption} value={semesterOption}>
                                        {semesterOption}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group-asff">
                            <label htmlFor="type">Type</label>
                            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="">All Types</option>
                                {typeOptions.map((typeOption) => (
                                    <option key={typeOption} value={typeOption}>
                                        {typeOption}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group-asff">
                            <label htmlFor="department">Department</label>
                            <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)}>
                                <option value="">All Departments</option>
                                {departmentOptions.map((deptOption) => (
                                    <option key={deptOption} value={deptOption}>
                                        {deptOption}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-actions-asff">
                            <button className="reset-btn-asff" onClick={resetFilters}>
                                <X size={16} className="action-icon-asff" />
                                Reset Filters
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
                    {currentSubjects.length > 0 ? (
                        <>
                            <div className="subjects-grid-asff">
                                {currentSubjects.map((subject) => (
                                    <SubjectCard key={subject.id} subject={subject} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination-asff">
                                    <button
                                        className="page-btn-asff nav-btn-asff"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    {renderPaginationButtons()}
                                    <button
                                        className="page-btn-asff nav-btn-asff"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState />
                    )}
                </>
            )}
        </div>
    );
};

export default AssignedSubjects;