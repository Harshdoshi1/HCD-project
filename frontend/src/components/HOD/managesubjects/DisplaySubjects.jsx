
import React, { useState } from 'react';
import { Plus, Edit2, Settings } from 'lucide-react';
import './DisplaySubjects.css';

function DisplaySubjects() {
    const initialSubjects = [
        { id: 1, name: 'Mathematics', code: 'MATH101', type: 'Departmental', components: [], weightage: {} },
        { id: 2, name: 'Physics', code: 'PHY101', type: 'Central', components: [], weightage: {} },
    ];

    const [subjects, setSubjects] = useState(initialSubjects);
    const [showForm, setShowForm] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [showComponentForm, setShowComponentForm] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [newSubject, setNewSubject] = useState({
        name: '',
        code: '',
        type: 'Departmental',
        components: [],
        weightage: {}
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSubject(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSubject) {
            setSubjects(prev => prev.map(sub =>
                sub.id === editingSubject.id ? { ...newSubject, id: sub.id } : sub
            ));
            setEditingSubject(null);
        } else {
            setSubjects(prev => [...prev, {
                ...newSubject,
                id: subjects.length + 1,
            }]);
        }
        setNewSubject({ name: '', code: '', type: 'Departmental', components: [], weightage: {} });
        setShowForm(false);
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setNewSubject(subject);
        setShowForm(true);
    };

    const handleManageComponents = (subject) => {
        setSelectedSubject(subject);
        setShowComponentForm(true);
    };

    const handleComponentSubmit = (e) => {
        e.preventDefault();
        const componentName = e.target.componentName.value;
        const weightage = parseInt(e.target.weightage.value);

        if (componentName && weightage) {
            const updatedSubjects = subjects.map(sub => {
                if (sub.id === selectedSubject.id) {
                    const updatedComponents = [...sub.components, componentName];
                    const updatedWeightage = { ...sub.weightage, [componentName]: weightage };
                    return { ...sub, components: updatedComponents, weightage: updatedWeightage };
                }
                return sub;
            });

            setSubjects(updatedSubjects);
            e.target.reset();
        }
    };

    return (
        <div className="subjects-container">
            <div className="subjects-header">
                <h1 className="subjects-title">Subject Management</h1>
                <button
                    className="add-subject-btn"
                    onClick={() => {
                        setEditingSubject(null);
                        setNewSubject({ name: '', code: '', type: 'Departmental', components: [], weightage: {} });
                        setShowForm(true);
                    }}
                >
                    <Plus size={20} /> Add New Subject
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <form className="add-subject-form" onSubmit={handleSubmit}>
                        <h2>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
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
                        <div className="form-group">
                            <label htmlFor="type">Subject Type</label>
                            <select
                                id="type"
                                name="type"
                                value={newSubject.type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="Departmental">Departmental</option>
                                <option value="Central">Central</option>
                            </select>
                        </div>
                        <div className="form-buttons">
                            <button type="submit" className="submit-btn">
                                {editingSubject ? 'Update Subject' : 'Add Subject'}
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingSubject(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showComponentForm && selectedSubject && (
                <div className="modal-overlay">
                    <div className="component-form">
                        <h2>Manage Components - {selectedSubject.name}</h2>
                        <div className="current-components">
                            <h3>Current Components</h3>
                            {selectedSubject.components.map((comp, index) => (
                                <div key={index} className="component-item">
                                    <span>{comp}</span>
                                    <span>Weightage: {selectedSubject.weightage[comp]}%</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleComponentSubmit}>
                            <div className="form-group">
                                <label htmlFor="componentName">Component Name</label>
                                <input
                                    type="text"
                                    id="componentName"
                                    name="componentName"
                                    placeholder="Enter component name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="weightage">Weightage (%)</label>
                                <input
                                    type="number"
                                    id="weightage"
                                    name="weightage"
                                    min="0"
                                    max="100"
                                    placeholder="Enter weightage"
                                    required
                                />
                            </div>
                            <div className="form-buttons">
                                <button type="submit" className="submit-btn">
                                    Add Component
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowComponentForm(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="subjects-grid">
                {subjects.map(subject => (
                    <div key={subject.id} className="subject-card">
                        <div className="subject-card-header">
                            <span className={`subject-type ${subject.type.toLowerCase()}`}>
                                {subject.type}
                            </span>
                        </div>
                        <h2 className="subject-name">{subject.name}</h2>
                        <p className="subject-code">{subject.code}</p>
                        <div className="subject-components">
                            {subject.components.length > 0 && (
                                <div className="components-list">
                                    {subject.components.map((comp, index) => (
                                        <span key={index} className="component-tag">
                                            {comp}: {subject.weightage[comp]}%
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="subject-actions">
                            <button
                                className="action-btn edit"
                                onClick={() => handleEdit(subject)}
                            >
                                <Edit2 size={16} /> Edit
                            </button>
                            <button
                                className="action-btn manage"
                                onClick={() => handleManageComponents(subject)}
                            >
                                <Settings size={16} /> Manage
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DisplaySubjects;