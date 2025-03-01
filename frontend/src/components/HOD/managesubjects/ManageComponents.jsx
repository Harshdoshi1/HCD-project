import React, { useState } from 'react';
import './ManageComponents.css';

const ManageComponents = ({ selectedSubject }) => {
    const [newSubject, setNewSubject] = useState({
        code: '',
        name: '',
        credits: '',
        type: 'central' // central or departmental
    });

    const [totalWeightage, setTotalWeightage] = useState(0);
    const [weightages, setWeightages] = useState({
        CA: { enabled: false, weightage: 0, totalMarks: 0 },
        ESE: { enabled: false, weightage: 0, totalMarks: 0 },
        IA: { enabled: false, weightage: 0, totalMarks: 0 },
        TW: { enabled: false, weightage: 0, totalMarks: 0 },
        VIVA: { enabled: false, weightage: 0, totalMarks: 0 }
    });

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
        if (totalWeightage !== 100) {
            alert('Total weightage must equal 100%');
            return;
        }

        if (!newSubject.code || !newSubject.name || !newSubject.credits) {
            alert('Please fill in all subject details');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/users/addSubject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newSubject,
                    components: weightages
                })
            });

            if (response.ok) {
                alert('Subject added successfully!');
                // Reset form
                setNewSubject({
                    code: '',
                    name: '',
                    credits: '',
                    type: 'central'
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
                alert('Failed to add subject');
            }
        } catch (error) {
            console.error('Error adding subject:', error);
            alert('Error adding subject');
        }
    };

    return (
        <div className="manage-weightage-container">
            <div className="subject-form">
                <h3>Add New Subject</h3>
                <div className="form-inputs">
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
                        <option value="departmental">Departmental</option>
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
                <button
                    className="save-weightage-btn"
                    onClick={handleSave}
                    disabled={totalWeightage !== 100}
                >
                    Add Subject
                </button>
            </div>
        </div>
    );
};

export default ManageComponents;
