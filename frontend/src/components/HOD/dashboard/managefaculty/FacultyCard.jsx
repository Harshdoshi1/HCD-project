import React from 'react';

const FacultyCard = ({ faculty, onClick }) => {
    return (
        <div className="faculty-card" onClick={onClick}>
            <div className="faculty-card-header">
                <div className="faculty-initials">
                    {faculty.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="faculty-main-info">
                    <h3>{faculty.name}</h3>
                    <p className="department">{faculty.department}</p>
                </div>
            </div>
            <div className="faculty-card-content">
                <p className="specialization">
                    <strong>Specialization:</strong> {faculty.specialization}
                </p>
                <p className="email">
                    <strong>Email:</strong> {faculty.email}
                </p>
                <div className="subjects">
                    <strong>Subjects:</strong>
                    <div className="subject-tags">
                        {faculty.subjects.map((subject, index) => (
                            <span key={index} className="subject-tag">
                                {subject}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyCard;
