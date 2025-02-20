import React, { useState } from 'react';
import SubjectList from './SubjectList';
import AssignSubject from './AssignSubject';
import ManageComponents from './ManageComponents';
import { Users, UserPlus, UserCog, Book, Settings, BookOpen, BookPlus, Plus } from 'lucide-react';
import './Subject.css';

const Subject = () => {
    const [view, setView] = useState('list'); // list, assign, manage
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);


    const handleViewChange = (newView) => {
        setView(newView);
        setSelectedSubject(null);
    };

    return (
        <div className="subject-container">
            <div className="header-content-subject">
                <div className="header-content-subjects-three-button-bt">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="subject-actions">
                            <button className={`subject-action-btn ${view === 'list' ? 'active' : ''}`} onClick={() => handleViewChange('list')}>
                                <Users size={20} />
                                View All Subjects
                            </button>
                            <button className={`subject-action-btn ${view === 'assign' ? 'active' : ''}`} onClick={() => handleViewChange('assign')}>
                                <UserPlus size={20} />
                                Assign Subject
                            </button>
                            <button className={`subject-action-btn ${view === 'manage' ? 'active' : ''}`} onClick={() => handleViewChange('manage')}>
                                <UserCog size={20} />
                                Manage Components
                            </button>
                        </div>

                    </div>
                </div>
                <div className='add-subject-from-sl'> {view === 'list' && (
                    <button className="subject-add-toggle" onClick={() => setShowAddForm(true)}>
                        <Plus size={20} />
                        Add New Subject
                    </button>
                )}</div>
            </div>

            <div className="subject-content">
                {view === 'list' && <SubjectList onSelectSubject={setSelectedSubject} showAddForm={showAddForm} setShowAddForm={setShowAddForm} />}
                {view === 'assign' && <AssignSubject selectedSubject={selectedSubject} />}
                {view === 'manage' && <ManageComponents selectedSubject={selectedSubject} />}
            </div>

        </div>
    );
};

export default Subject;
