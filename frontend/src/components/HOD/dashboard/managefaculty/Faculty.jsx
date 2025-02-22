import React, { useState } from 'react';
import { Search, Users, UserPlus, UserCog } from 'lucide-react';
import FacultyList from './FacultyList';
import FacultyAssignment from './Assignment';
import AddFacultyModal from './AddFacultyModal';
import './Faculty.css';

const Faculty = () => {
    const [view, setView] = useState('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleViewChange = (newView) => {
        setView(newView);
    };

    return (
        <div className="faculty-container">
            <div className="faculty-header">
                <div className="header-content">
                    <div className="faculty-actions">
                        <button className={`faculty-action-btn ${view === 'list' ? 'active' : ''}`} onClick={() => handleViewChange('list')}>
                            <Users size={20} />
                            <span>View All Faculty</span>
                        </button>
                        <button className="faculty-action-btn" onClick={() => setIsModalOpen(true)}>
                            <UserPlus size={20} />
                            <span>Add New Faculty</span>
                        </button>
                        <button className={`faculty-action-btn ${view === 'assign' ? 'active' : ''}`} onClick={() => handleViewChange('assign')}>
                            <UserCog size={20} />
                            <span>Assign Faculty</span>
                        </button>
                    </div>
                    {view !== 'assign' && (
                        <div className="search-wrapper">
                            <Search className="search-icon" size={20} />
                            <input type="text" placeholder="Search faculty..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="faculty-search" />
                        </div>
                    )}
                </div>
            </div>

            <div className="faculty-content">
                {view === 'list' && <FacultyList searchTerm={searchTerm} />}
                {view === 'assign' && <FacultyAssignment />}
            </div>

            {isModalOpen && <AddFacultyModal onClose={() => setIsModalOpen(false)} onSuccess={() => setView('list')} />}
        </div>
    );
};

export default Faculty;
