import React, { useState } from 'react';
import SubjectList from './SubjectList';
import AssignSubject from './AssignSubject';
import ManageComponents from './ManageComponents';
import './Subject.css';

const Subject = () => {
    const [view, setView] = useState('list'); // list, assign, manage
    const [selectedSubject, setSelectedSubject] = useState(null);

    const handleViewChange = (newView) => {
        setView(newView);
        setSelectedSubject(null);
    };

    return (
        <div className="subject-container">
            <div className="subject-header">
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
                {view === 'manage' && <ManageComponents selectedSubject={selectedSubject} />}
            </div>
        </div>
    );
};

export default Subject;
