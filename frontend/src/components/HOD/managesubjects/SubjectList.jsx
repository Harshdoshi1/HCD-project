import React, { useState, useEffect } from 'react';
import "./SubjectList.css";

const SubjectList = ({ onSelectSubject }) => {
    const [filters, setFilters] = useState({
        program: 'degree',
        batch: 'Degree 22-26',
        semester: '1'
    });

    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                console.log('Fetching all batches from database...');
                const response = await fetch("http://localhost:5001/api/batches/getAllBatches");
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch batches: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Batches fetched from database:', data);
                
                if (Array.isArray(data) && data.length > 0) {
                    setBatches(data);
                    // Set the first batch as the default selected batch
                    if (data[0] && data[0].name) {
                        setFilters(prev => ({
                            ...prev,
                            batch: data[0].name
                        }));
                    }
                    console.log(`✅ Successfully loaded ${data.length} batches`);
                } else {
                    console.warn('No batches found in the database. Adding fallback data.');
                    // Fallback batches if none found in database
                    const fallbackBatches = [
                        { id: 'batch1', name: 'Degree 22-26', program: 'Degree' },
                        { id: 'batch2', name: 'Diploma 22-26', program: 'Diploma' }
                    ];
                    setBatches(fallbackBatches);
                }
            } catch (error) {
                console.error("Error fetching batches:", error);
                setError("Failed to fetch batches: " + error.message);
                
                // Add fallback batches in case of error
                const fallbackBatches = [
                    { id: 'batch1', name: 'Degree 22-26', program: 'Degree' },
                    { id: 'batch2', name: 'Diploma 22-26', program: 'Diploma' }
                ];
                setBatches(fallbackBatches);
            }
        };
        fetchBatches();
    }, []);

    // Fetch ALL semesters once when component mounts
    useEffect(() => {
        const fetchAllSemesters = async () => {
            try {
                console.log('Fetching all semesters from the database...');
                const response = await fetch('http://localhost:5001/api/semesters/getAllSemesters');
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch all semesters: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('All semesters from database:', data);
                
                if (Array.isArray(data) && data.length > 0) {
                    setSemesters(data);
                    console.log(`✅ Successfully loaded ${data.length} semesters`);
                } else {
                    console.warn('No semesters found in database, using hardcoded data');
                    // Fallback data if database returns empty
                    const fallbackSemesters = [
                        { _id: "sem1", semesterNumber: "1" },
                        { _id: "sem2", semesterNumber: "2" },
                        { _id: "sem3", semesterNumber: "3" }
                    ];
                    setSemesters(fallbackSemesters);
                }
            } catch (error) {
                console.error('Error fetching all semesters:', error);
                // Always provide fallback data
                const fallbackSemesters = [
                    { _id: "sem1", semesterNumber: "1" },
                    { _id: "sem2", semesterNumber: "2" },
                    { _id: "sem3", semesterNumber: "3" }
                ];
                setSemesters(fallbackSemesters);
            }
        };
        
        fetchAllSemesters();
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoading(true);
            setError(null);
            
            try {
                if (filters.batch === "all" || filters.semester === "all") {
                    setSubjects([]);
                    return;
                }
                
                const encodedBatchName = encodeURIComponent(filters.batch);
                console.log(`Fetching subjects for batch: ${filters.batch} and semester: ${filters.semester}`);
                
                const response = await fetch(
                    `http://localhost:5001/api/subjects/getSubjects/${encodedBatchName}/${filters.semester}`
                );
                
                if (!response.ok) {
                    if (response.status === 404) {
                        console.log(`No subjects found for batch: ${filters.batch} and semester: ${filters.semester}`);
                        setSubjects([]);
                        return;
                    }
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    throw new Error(errorData.message || "Failed to fetch subjects");
                }
                
                const data = await response.json();
                console.log('Subjects API Response:', data);
                setSubjects(data.uniqueSubjects || data.subjects || []);
            } catch (error) {
                console.error("Error fetching subjects:", error);
                setError(`Failed to fetch subjects: ${error.message}`);
                setSubjects([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSubjects();
    }, [filters.batch, filters.semester]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            ...(name === "batch" ? { semester: "all" } : {}),
        }));
        // Clear subjects immediately on filter change
        setSubjects([]);
    };

    return (
        <div className="subject-list">
            <div className="filters-container-display-subject-list">

                <select 
                    className="professional-filter-ds" 
                    name="batch" 
                    value={filters.batch} 
                    onChange={handleChange} 
                    required
                    style={{ color: 'black', backgroundColor: 'white', fontWeight: 'bold' }}
                >
                    <option value="all" style={{ color: 'black' }}>Select Batch</option>
                    {batches.map((batch, index) => (
                        <option 
                            key={batch.id || batch._id || index} 
                            value={batch.name || batch.batchName}
                            style={{ color: 'black', fontWeight: 'normal' }}
                        >
                            {batch.name || batch.batchName} ({batch.program || 'Unknown'})
                        </option>
                    ))}
                </select>
                <select 
                    className="professional-filter-ds" 
                    name="semester" 
                    value={filters.semester} 
                    onChange={handleChange} 
                    required
                    style={{ color: 'black', backgroundColor: 'white', fontWeight: 'bold' }}
                >
                    <option value="all" style={{ color: 'black', fontWeight: 'normal' }}>Select Semester</option>
                    {semesters.map((sem, index) => {
                        // Use different source properties based on what's available
                        const semesterNumber = sem.semesterNumber || sem.semester_number || sem.number || index + 1;
                        return (
                            <option 
                                key={sem._id || sem.id || `sem-${index}`} 
                                value={semesterNumber}
                                style={{ color: 'black', fontWeight: 'normal' }}
                            >
                                Semester {semesterNumber}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="subjects-grid">
                {subjects.length > 0 ? (
                    subjects.map((subject, index) => {
                        const code = subject.sub_code || subject.subjectCode || subject.code;
                        const name = subject.sub_name || subject.subjectName || subject.name;
                        return (
                            <div key={subject._id || code || index} className="subject-card" onClick={() => onSelectSubject(subject)}>
                                {code && (
                                    <div className="subject-code">{code}</div>
                                )}
                                <div className="subject-name">
                                    {name}
                                </div>
                                <div className="subject-details">
                                    <div><strong>Type:</strong> {filters.program.charAt(0).toUpperCase() + filters.program.slice(1)}</div>
                                    {(subject.sub_credit || subject.credits) &&
                                        <div><strong>Credits:</strong> {subject.sub_credit || subject.credits}</div>}
                                    {(subject.sub_type || subject.type) &&
                                        <div><strong>Category:</strong> {subject.sub_type || subject.type}</div>}
                                    <div><strong>Semester:</strong> {filters.semester}</div>
                                    <div><strong>Batch:</strong> {filters.batch}</div>
                                </div>
                            </div>
                        );
                    })
                ) : (

                    <p className="no-subjects">No subjects found for the selected filters.</p>
                )}
            </div>
        </div>
    );
};

export default SubjectList;