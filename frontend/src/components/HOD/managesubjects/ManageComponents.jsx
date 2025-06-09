import React, { useState } from 'react';
import './ManageComponents.css';

const ManageComponents = ({ selectedSubject }) => {
    const [newSubject, setNewSubject] = useState({
        code: '',
        name: '',
        credits: '',
        type: 'central'
    });

    const [totalWeightage, setTotalWeightage] = useState(0);
    const [weightages, setWeightages] = useState({
        CA: { enabled: false, weightage: 0, totalMarks: 0, selectedCOs: [] },
        ESE: { enabled: false, weightage: 0, totalMarks: 0, selectedCOs: [] },
        IA: { enabled: false, weightage: 0, totalMarks: 0, selectedCOs: [] },
        TW: { enabled: false, weightage: 0, totalMarks: 0, selectedCOs: [] },
        VIVA: { enabled: false, weightage: 0, totalMarks: 0, selectedCOs: [] }
    });

    const [numCOs, setNumCOs] = useState(0);
    const [courseOutcomes, setCourseOutcomes] = useState([]);

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

    const handleNumCOsChange = (e) => {
        const countVal = parseInt(e.target.value, 10);
        
        if (isNaN(countVal) || countVal < 0) {
            setNumCOs(0); 
            setCourseOutcomes([]);
            return;
        }
        setNumCOs(countVal);

        setCourseOutcomes(prevCOs => {
            const newCOs = [];
            for (let i = 1; i <= countVal; i++) {
                newCOs.push({ 
                    id: `CO${i}`,
                    text: (prevCOs && prevCOs[i-1] && typeof prevCOs[i-1].text === 'string') ? prevCOs[i-1].text : '' 
                });
            }
            return newCOs;
        });
    };

    const handleCOTextChange = (index, value) => {
        setCourseOutcomes(prevCOs => {
            const updatedCOs = [...prevCOs];
            updatedCOs[index] = { ...updatedCOs[index], text: value };
            return updatedCOs;
        });
    };

    const handleComponentCOChange = (componentName, coId, isChecked) => {
        setWeightages(prev => {
            const updated = { ...prev };
            const component = updated[componentName];
            // Ensure selectedCOs is an array before trying to modify it
            const currentSelectedCOs = Array.isArray(component.selectedCOs) ? component.selectedCOs : [];
            if (isChecked) {
                // Add coId if not already present
                if (!currentSelectedCOs.includes(coId)) {
                    component.selectedCOs = [...currentSelectedCOs, coId];
                }
            } else {
                // Remove coId
                component.selectedCOs = currentSelectedCOs.filter(id => id !== coId);
            }
            return updated;
        });
    };

    const handleSave = async () => {
        if (!newSubject.code || !newSubject.name || !newSubject.credits) {
            alert('Please fill in all subject details');
            return;
        }

        // Prepare the data to be sent to the API
        const components = [];

        Object.entries(weightages).forEach(([componentName, data]) => {
            if (data.enabled) {
                components.push({
                    name: componentName,
                    weightage: data.weightage,
                    totalMarks: data.totalMarks,
                    selectedCOs: data.selectedCOs || []
                });
            }
        });

        const payload = {
            subject: newSubject.code,
            name: newSubject.name,
            credits: Number(newSubject.credits),
            type: newSubject.type,
            components: components,
            courseOutcomes: courseOutcomes.filter(co => co.text && co.text.trim() !== '')
        };

        try {
            console.log('Sending data:', JSON.stringify(payload, null, 2));

            // Call the API endpoint to add subject with components
            const response = await fetch('http://localhost:5001/api/subjects/addSubjectWithComponents', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (response.ok) {
                alert('Subject, components, and course outcomes added successfully!');

                // Reset form
                setNewSubject({
                    code: '',
                    name: '',
                    credits: '',
                    type: 'central'
                });
                setWeightages({
                    CA: { enabled: false, weightage: 0, totalMarks: 0, selectedCOs: [] },
                    ESE: { enabled: false, weightage: 0, totalMarks: 0, selectedCOs: [] },
                    IA: { enabled: false, weightage: 0, totalMarks: 0, selectedCOs: [] },
                    TW: { enabled: false, weightage: 0, totalMarks: 0, selectedCOs: [] },
                    VIVA: { enabled: false, weightage: 0, totalMarks: 0, selectedCOs: [] }
                });
                setTotalWeightage(0);
                setNumCOs(0);
                setCourseOutcomes([]);
            } else {
                console.error('API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });
                alert(`Failed to add subject: ${data.error || data.details?.join('\n') || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding subject:', error);
            alert(`Error adding subject: ${error.message}`);
        }
    };

    return (
        <div className="manage-weightage-container">
            <div className="subject-form">
                <div className="form-inputs form-inputs-inline">
                    <h3>Add New Subject</h3>
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
                        <option value="department">Departmental</option>
                    </select>
                </div>
            </div>
    
                <div className="course-outcomes-section">
                    <h3>Course Outcomes (COs)</h3>
                    <div className="co-input-group">
                        <label htmlFor="numCOs">Number of COs:</label>
                        <input
                            type="number"
                            id="numCOs"
                            min="0"
                            value={numCOs}
                            onChange={handleNumCOsChange}
                            className="subject-input"
                        />
                    </div>
                    {courseOutcomes.map((co, index) => (
                        <div key={co.id} className="co-item">
                            <label htmlFor={`co-${index}`}>{co.id}:</label>
                            <input
                                type="text"
                                id={`co-${index}`}
                                placeholder={`Enter description for ${co.id}`}
                                value={co.text}
                                onChange={(e) => handleCOTextChange(index, e.target.value)}
                                className="subject-input"
                            />
                        </div>
                    ))}
                </div>
    
                <div className="components-area">
                <h3>Subject Components</h3>

                    <table className="weightage-table">
                        <thead>
                            <tr>
                                <th>Enable</th>
                                <th>Component</th>
                                <th>Weightage (%)</th>
                                <th>Total Marks</th>
                                <th>COs</th>
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
                                <td>
                                    {component === 'CA' ? 'Continuous Semester Evolution (CSE)' :
                                        component === 'ESE' ? 'End Semester Exam (ESE)' :
                                            component === 'IA' ? 'Internal Assessment (IA)' :
                                                component === 'TW' ? 'Term Work (TW)' :
                                                    'Viva'}
                                </td>
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
                                <td className="co-selection-cell co-selection-cell-inline">
                                    {data.enabled && courseOutcomes.length > 0 && courseOutcomes.map(co => (
                                        <div key={`${component}-${co.id}`} className="co-checkbox-item">
                                            <input
                                                type="checkbox"
                                                id={`${component}-${co.id}`}
                                                checked={data.selectedCOs.includes(co.id)}
                                                onChange={(e) => handleComponentCOChange(component, co.id, e.target.checked)}
                                                disabled={!co.text || co.text.trim() === ''}
                                            />
                                            <label htmlFor={`${component}-${co.id}`} title={co.text || 'CO not defined'}>
                                                {co.id}
                                            </label>
                                        </div>
                                    ))}
                                    {data.enabled && courseOutcomes.length === 0 && (
                                        <small>No COs defined</small>
                                    )}
                                    {!data.enabled && (
                                        <small>Enable component to assign COs</small>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
    
                <div className="weightage-summary">
                    <p>Total Weightage: {totalWeightage}%</p>
                </div>
    
                {totalWeightage !== 100 && (
                    <div style={{ color: 'red', textAlign: 'right', marginTop: '5px' }}>
                        Total weightage must be 100%
                    </div>
                )}
    
                <div className="last-button">
                    <button
                        onClick={handleSave}
                        className="save-weightage-btn"
                        disabled={totalWeightage !== 100 || !newSubject.code || !newSubject.name || !newSubject.credits}
                    >
                        Add Subject
                    </button>
                </div>
            </div>
        </div>  
    );
    
};

export default ManageComponents;
