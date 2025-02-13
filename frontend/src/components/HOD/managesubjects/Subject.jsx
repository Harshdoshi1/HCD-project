import React, { useState } from 'react';
import SubjectList from './SubjectList';
import AssignSubject from './AssignSubject';
import './Subject.css';

const Subject = () => {
    const [view, setView] = useState('list'); // list, assign, manage
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [totalWeightage, setTotalWeightage] = useState(0);
    const [weightages, setWeightages] = useState({
        CA: 0,
        ESE: 0,
        IA: 0,
        TW: 0,
        VIVA: 0,
    });

    const handleViewChange = (newView) => {
        setView(newView);
        setSelectedSubject(null);
    };

    const handleWeightageChange = (component, value) => {
        setWeightages((prevWeightages) => ({ ...prevWeightages, [component]: parseInt(value) }));
        setTotalWeightage(Object.values(weightages).reduce((a, b) => a + b, 0));
    };

    const handleSave = () => {
        // Add save logic here
        console.log('Saving components...');
    };

    return (
        <div className="subject-container">
            <div className="subject-header-subjects-sb">
                <div className="subject-actions">
                    <button
                        className={`subject-action-btn ${view === 'list' ? 'active' : ''}`}
                        onClick={() => handleViewChange('list')}
                    >
                        View All Subjects
                    </button>
                    <button
                        className={`subject-action-btn ${view === 'assign' ? 'active' : ''}`}
                        onClick={() => handleViewChange('assign')}
                    >
                        Assign Subject
                    </button>
                    <button
                        className={`subject-action-btn ${view === 'manage' ? 'active' : ''}`}
                        onClick={() => handleViewChange('manage')}
                    >
                        Manage Components
                    </button>
                </div>
            </div>

            <div className="subject-content">
                {view === 'list' && <SubjectList onSelectSubject={setSelectedSubject} />}
                {view === 'assign' && <AssignSubject selectedSubject={selectedSubject} />}
                {view === 'manage' && (
                    <div className="manage-weightage-container">
                        <div className="weightage-header">
                            <h3>Manage Component Weightage</h3>
                            <span className="total-weightage">Total: {totalWeightage}%</span>
                        </div>
                        <table className="weightage-table">
                            <thead>
                                <tr>
                                    <th>Component</th>
                                    <th>Weightage (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Continuous Assessment (CA)</td>
                                    <td>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            className="weightage-input"
                                            value={weightages.CA}
                                            onChange={(e) => handleWeightageChange('CA', e.target.value)}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>End Semester Exam (ESE)</td>
                                    <td>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            className="weightage-input"
                                            value={weightages.ESE}
                                            onChange={(e) => handleWeightageChange('ESE', e.target.value)}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Internal Assessment (IA)</td>
                                    <td>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            className="weightage-input"
                                            value={weightages.IA}
                                            onChange={(e) => handleWeightageChange('IA', e.target.value)}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Term Work (TW)</td>
                                    <td>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            className="weightage-input"
                                            value={weightages.TW}
                                            onChange={(e) => handleWeightageChange('TW', e.target.value)}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Viva</td>
                                    <td>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            className="weightage-input"
                                            value={weightages.VIVA}
                                            onChange={(e) => handleWeightageChange('VIVA', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button 
                            className="save-weightage-btn"
                            onClick={handleSave}
                        >
                            Save Weightage
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subject;
