import React, { useState, useEffect } from 'react';
import './ManageComponents.css';

const ManageComponents = ({ selectedSubject }) => {
    const [newSubject, setNewSubject] = useState({
        code: '',
        name: '',
        credits: '',
        type: 'central',
        courseType: 'degree',
        semester: '1',
        batch: ''
    });
    
    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);

    const [totalWeightage, setTotalWeightage] = useState(0);
    const [weightages, setWeightages] = useState({
        CA: { enabled: false, weightage: 0, totalMarks: 0 },
        ESE: { enabled: false, weightage: 0, totalMarks: 0 },
        IA: { enabled: false, weightage: 0, totalMarks: 0 },
        TW: { enabled: false, weightage: 0, totalMarks: 0 },
        VIVA: { enabled: false, weightage: 0, totalMarks: 0 }
    });
    
    // Fetch batches when component mounts
    useEffect(() => {
        const fetchBatches = async () => {
            setLoading(true);
            try {
                console.log('Fetching batches for subject form...');
                const response = await fetch('http://localhost:5001/api/batches/getAllBatches');
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch batches: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Batches fetched:', data);
                
                if (Array.isArray(data) && data.length > 0) {
                    setBatches(data);
                    // Set the first batch as default
                    if (data[0] && data[0].name) {
                        setNewSubject(prev => ({
                            ...prev,
                            batch: data[0].name
                        }));
                    }
                } else {
                    console.log('No batches found, setting fallback data');
                    const fallbackBatches = [
                        { id: 'batch1', name: 'Degree 22-26', program: 'Degree' },
                        { id: 'batch2', name: 'Diploma 22-26', program: 'Diploma' }
                    ];
                    setBatches(fallbackBatches);
                    setNewSubject(prev => ({
                        ...prev,
                        batch: fallbackBatches[0].name
                    }));
                }
            } catch (error) {
                console.error('Error fetching batches:', error);
            } finally {
                setLoading(false);
            }
        };
        
        // Fetch semesters
        const fetchSemesters = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/semesters/getAllSemesters');
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch semesters`);
                }
                
                const data = await response.json();
                console.log('Semesters fetched:', data);
                
                if (Array.isArray(data) && data.length > 0) {
                    setSemesters(data);
                } else {
                    const fallbackSemesters = [
                        { id: 'sem1', semester_number: 1 },
                        { id: 'sem2', semester_number: 2 },
                        { id: 'sem3', semester_number: 3 }
                    ];
                    setSemesters(fallbackSemesters);
                }
            } catch (error) {
                console.error('Error fetching semesters:', error);
                const fallbackSemesters = [
                    { id: 'sem1', semester_number: 1 },
                    { id: 'sem2', semester_number: 2 },
                    { id: 'sem3', semester_number: 3 }
                ];
                setSemesters(fallbackSemesters);
            }
        };
        
        fetchBatches();
        fetchSemesters();
    }, []);

    const handleSubjectChange = (field, value) => {
        setNewSubject(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleWeightageChange = (component, field, value) => {
        setWeightages(prev => {
            const updated = { ...prev };
            if (field === 'enabled') {
                updated[component] = { ...updated[component], enabled: value };
            } else if (field === 'weightage') {
                const newValue = parseInt(value) || 0;
                updated[component] = { ...updated[component], weightage: newValue };
            } else if (field === 'totalMarks') {
                const newValue = parseInt(value) || 0;
                updated[component] = { ...updated[component], totalMarks: newValue };
            }

            const total = Object.values(updated)
                .filter(comp => comp.enabled)
                .reduce((a, b) => a + b.weightage, 0);
            setTotalWeightage(total);
            return updated;
        });
    };

    const handleSave = async () => {
        if (!newSubject.code || !newSubject.name || !newSubject.credits) {
            alert('Please fill in all subject details');
            return;
        }

        // Prepare the data to be sent to the API
        const componentsWeightage = [];
        const componentsMarks = [];

        Object.entries(weightages).forEach(([component, data]) => {
            if (data.enabled) {
                componentsWeightage.push({
                    name: component,
                    weightage: data.weightage
                });
                componentsMarks.push({
                    name: component,
                    value: data.totalMarks
                });
            }
        });

        try {
            console.log('Sending data:', {
                subject: newSubject.code,
                name: newSubject.name,
                credits: Number(newSubject.credits),
                type: newSubject.type,
                componentsWeightage,
                componentsMarks
            });

            // First add the subject to the appropriate table
            const addSubjectResponse = await fetch('http://localhost:5001/api/subjects/addSubject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newSubject.name,
                    code: newSubject.code,
                    courseType: newSubject.courseType,
                    credits: Number(newSubject.credits),
                    subjectType: newSubject.type,
                    semester: newSubject.semester,
                    batchName: newSubject.batch
                })
            });
            
            if (!addSubjectResponse.ok) {
                const errorData = await addSubjectResponse.json();
                console.error('Failed to add subject:', errorData);
                throw new Error(`Failed to add subject: ${errorData.error || 'Unknown error'}`);
            }
            
            console.log('Subject added successfully, now adding components...');
            
            // Then add the components
            const response = await fetch('http://localhost:5001/api/subjects/addSubjectWithComponents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: newSubject.code,
                    name: newSubject.name,
                    credits: Number(newSubject.credits),
                    type: newSubject.type,
                    componentsWeightage,
                    componentsMarks
                })
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (response.ok) {
                alert('Subject and components added successfully!');

                // Reset form
                setNewSubject({
                    code: '',
                    name: '',
                    credits: '',
                    type: 'central',
                    courseType: 'degree',
                    semester: '1',
                    batch: newSubject.batch // Keep the same batch for convenience
                });
                setWeightages({
                    CA: { enabled: false, weightage: 0, totalMarks: 0 },
                    ESE: { enabled: false, weightage: 0, totalMarks: 0 },
                    IA: { enabled: false, weightage: 0, totalMarks: 0 },
                    TW: { enabled: false, weightage: 0, totalMarks: 0 },
                    VIVA: { enabled: false, weightage: 0, totalMarks: 0 }
                });
                setTotalWeightage(0);
            } else {
                alert(`Failed to add subject: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding subject:', error);
            alert(`Error adding subject: ${error.message}`);
        }
    };

    return (
        <div className="manage-weightage-container">
            <div className="subject-form">
                <h3>Add New Subject</h3>
                <div className="subject-form-top">
                    <input
                        type="text"
                        placeholder="Subject Code"
                        value={newSubject.code}
                        onChange={(e) => handleSubjectChange('code', e.target.value)}
                        className="subject-input"
                    />
                    <input
                        type="text"
                        placeholder="Subject Name"
                        value={newSubject.name}
                        onChange={(e) => handleSubjectChange('name', e.target.value)}
                        className="subject-input"
                    />
                    <input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Credits"
                        value={newSubject.credits}
                        onChange={(e) => handleSubjectChange('credits', e.target.value)}
                        className="subject-input"
                    />
                    <select
                        value={newSubject.type}
                        onChange={(e) => handleSubjectChange('type', e.target.value)}
                        className="subject-input"
                    >
                        <option value="central">Central</option>
                        <option value="departmental">Departmental</option>
                    </select>
                    
                    <select
                        value={newSubject.courseType}
                        onChange={(e) => handleSubjectChange('courseType', e.target.value)}
                        className="subject-input"
                    >
                        <option value="degree">Degree</option>
                        <option value="diploma">Diploma</option>
                    </select>
                    
                    <select
                        value={newSubject.batch}
                        onChange={(e) => handleSubjectChange('batch', e.target.value)}
                        className="subject-input"
                        style={{ color: 'black' }}
                    >
                        <option value="">Select Batch</option>
                        {batches.map((batch, index) => (
                            <option 
                                key={batch.id || `batch-${index}`} 
                                value={batch.name || batch.batchName}
                            >
                                {batch.name || batch.batchName} ({batch.program || 'Unknown'})
                            </option>
                        ))}
                    </select>
                    
                    <select
                        value={newSubject.semester}
                        onChange={(e) => handleSubjectChange('semester', e.target.value)}
                        className="subject-input"
                        style={{ color: 'black' }}
                    >
                        <option value="">Select Semester</option>
                        {semesters.map((sem, index) => {
                            const semNumber = sem.semester_number || sem.semesterNumber || index + 1;
                            return (
                                <option 
                                    key={sem.id || `sem-${index}`} 
                                    value={semNumber}
                                >
                                    Semester {semNumber}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            <div className='manage-subjct-container-bottom'>
                <h3>Subject Components</h3>
                <table className="weightage-table">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Component</th>
                            <th>Weightage (%)</th>
                            <th>Total Marks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(weightages).map(([component, data]) => (
                            <tr key={component}>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="component-checkbox"
                                        checked={data.enabled}
                                        onChange={(e) => handleWeightageChange(component, 'enabled', e.target.checked)}
                                    />
                                </td>
                                <td>{component === 'CA' ? 'Continuous Assessment (CA)' :
                                    component === 'ESE' ? 'End Semester Exam (ESE)' :
                                        component === 'IA' ? 'Internal Assessment (IA)' :
                                            component === 'TW' ? 'Term Work (TW)' :
                                                'Viva'}</td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="weightage-input"
                                        value={data.weightage}
                                        disabled={!data.enabled}
                                        onChange={(e) => handleWeightageChange(component, 'weightage', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        className="marks-input"
                                        value={data.totalMarks}
                                        disabled={!data.enabled}
                                        onChange={(e) => handleWeightageChange(component, 'totalMarks', e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="weightage-summary">
                    <p>
                        Total Weightage: {totalWeightage}%
                    </p>
                </div>
                <div className="last-button">
                    <button
                        className="save-weightage-btn"
                        onClick={handleSave}
                    >
                        Add Subject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageComponents;
