import React, { useState } from 'react';
import SubjectList from './SubjectList';
import AssignSubject from './AssignSubject';
import './Subject.css';

const Subject = () => {
    const [view, setView] = useState('list'); // list, assign, manage
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [totalWeightage, setTotalWeightage] = useState(0);

    const handleViewChange = (newView) => {
        setView(newView);
        setSelectedSubject(null);
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
                    <div className="manage-components-container">
                        <div className="total-weightage">
                            Total Weightage: {totalWeightage}%
                        </div>
                        
                        {/* Component 1 */}
                        <div className="manage-component">
                            <div className="manage-header">
                                <h3>Assignment</h3>
                                <span>30%</span>
                            </div>
                            {/* Add component specific content here */}
                        </div>

                        {/* Component 2 */}
                        <div className="manage-component">
                            <div className="manage-header">
                                <h3>Mid Semester</h3>
                                <span>30%</span>
                            </div>
                            {/* Add component specific content here */}
                        </div>

                        {/* Component 3 */}
                        <div className="manage-component">
                            <div className="manage-header">
                                <h3>End Semester</h3>
                                <span>40%</span>
                            </div>
                            {/* Add component specific content here */}
                        </div>

                        <button 
                            className="save-components-btn"
                            onClick={handleSave}
                        >
                            Save Components
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subject;
