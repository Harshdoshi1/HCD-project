import React, { useState } from 'react';
import './DisplaySubjects.css';

function DisplaySubjects() {
    // Dummy data for initial subjects
    const initialSubjects = [
        { id: 1, name: 'Mathematics', code: 'MATH101' },
        { id: 2, name: 'Physics', code: 'PHY101' },
        { id: 3, name: 'Computer Science', code: 'CS101' },
        { id: 4, name: 'Chemistry', code: 'CHEM101' },
        { id: 5, name: 'Biology', code: 'BIO101' },
    ];

    const [subjects, setSubjects] = useState(initialSubjects);
    const [showForm, setShowForm] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: '', code: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSubject(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newSubject.name && newSubject.code) {
            setSubjects(prev => [...prev, {
                id: subjects.length + 1,
                name: newSubject.name,
                code: newSubject.code
            }]);
            setNewSubject({ name: '', code: '' });
            setShowForm(false);
        }
    };

    return (
        <div className="subjects-container">
            <div className="subjects-header">
                <h1 className="subjects-title">Subjects</h1>
                <button
                    className="add-subject-btn"
                    onClick={() => setShowForm(true)}
                >
                    Add New Subject
                </button>
            </div>

            {showForm && (
                <form className="add-subject-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Subject Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={newSubject.name}
                            onChange={handleInputChange}
                            placeholder="Enter subject name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="code">Subject Code</label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={newSubject.code}
                            onChange={handleInputChange}
                            placeholder="Enter subject code"
                            required
                        />
                    </div>
                    <div className="form-buttons">
                        <button type="submit" className="submit-btn">
                            Add Subject
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="subject-subjects-grid">
                {subjects.map(subject => (
                    <div key={subject.id} className="subject-card">
                        <h2 className="subject-name">{subject.name}</h2>
                        <p className="subject-code">{subject.code}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DisplaySubjects;