import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ActivityForm from './ActivityForm';
import './Activities.css';

const ExtraCurricularActivities = ({ activities, onAdd, onEdit, onDelete }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);

    const handleAdd = (newActivity) => {
        onAdd({ ...newActivity, type: 'extra' });
        setShowAddForm(false);
    };

    const handleEdit = (activity) => {
        onEdit(activity);
        setShowEditForm(false);
        setCurrentActivity(null);
    };

    const startEdit = (activity) => {
        setCurrentActivity(activity);
        setShowEditForm(true);
    };

    return (
        <div className="activities-section">
            <div className="section-header">
                <h2 className="section-title">Extra-Curricular Activities</h2>
                <button className="add-button" onClick={() => setShowAddForm(true)}>
                    <FiPlus /> Add Activity
                </button>
            </div>

            <div className="activities-grid">
                {activities.map((activity, index) => (
                    <div key={index} className="activity-card">
                        <h3>{activity.title}</h3>
                        <p>{activity.description}</p>
                        <div className="activity-meta">
                            <span>{activity.date}</span>
                            <span>{activity.achievement}</span>
                        </div>
                        <div className="activity-actions">
                            <button onClick={() => startEdit(activity)} className="edit-btn">
                                <FiEdit2 />
                            </button>
                            <button onClick={() => onDelete(activity.id)} className="delete-btn">
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {(showAddForm || showEditForm) && (
                <ActivityForm
                    activity={currentActivity}
                    onSubmit={showEditForm ? handleEdit : handleAdd}
                    onClose={() => {
                        setShowAddForm(false);
                        setShowEditForm(false);
                        setCurrentActivity(null);
                    }}
                    isEdit={showEditForm}
                />
            )}
        </div>
    );
};

export default ExtraCurricularActivities;
