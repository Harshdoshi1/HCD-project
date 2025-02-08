import React, { useState } from 'react';
import FacultyList from './FacultyList';
import AddFaculty from './AddFaculty';
import FacultyAssignment from './Assignment';
import './Faculty.css';

const Faculty = () => {
    const [view, setView] = useState('list'); // list, add, assign
    const [selectedFaculty, setSelectedFaculty] = useState(null);

    const handleViewChange = (newView) => {
        setView(newView);
        setSelectedFaculty(null);
    };

    return (
        <div className="faculty-container">
            {/* <h1>Faculty Management</h1> */}
            <div className="faculty-header">

                <div className="faculty-actions">
                    <button
                        className={`faculty-action-btn ${view === 'list' ? 'active' : ''}`}
                        onClick={() => handleViewChange('list')}
                    >
                        View All Faculty
                    </button>
                    <button
                        className={`faculty-action-btn ${view === 'add' ? 'active' : ''}`}
                        onClick={() => handleViewChange('add')}
                    >
                        Add New Faculty
                    </button>
                    <button
                        className={`faculty-action-btn ${view === 'assign' ? 'active' : ''}`}
                        onClick={() => handleViewChange('assign')}
                    >
                        Assign Faculty
                    </button>
                </div>
            </div>

            <div className="faculty-content">
                {view === 'list' && <FacultyList onSelectFaculty={setSelectedFaculty} />}
                {view === 'add' && <AddFaculty onSuccess={() => handleViewChange('list')} />}
                {view === 'assign' && <FacultyAssignment selectedFaculty={selectedFaculty} />}
            </div>
        </div>
    );
};

export default Faculty;
