import React from 'react';

const FacultyCard = ({ faculty, onClick }) => {
    if (!faculty || !faculty.name) {
        return <p>Error: Faculty data is missing or invalid.</p>;
    }

    return (
        <div className="faculty-card" onClick={onClick}>
            <div className="faculty-card-header">
                <div className="faculty-initials">
                    {faculty.name?.split(' ')?.map(n => n[0]).join('') || "NA"}
                </div>
                <div className="faculty-main-info">
                    <h3>{faculty.name || "Unknown"}</h3>
                    <p className="department">{faculty.department || "No Department"}</p>
                </div>
            </div>
            <div className="faculty-card-content">
                <p className="specialization">
                    <strong>Specialization:</strong> {faculty.specialization || "N/A"}
                </p>
                <p className="email">
                    <strong>Email:</strong> {faculty.email || "N/A"}
                </p>
                <div className="subjects">
                    <strong>Subjects:</strong>
                    <div className="subject-tags">
                        {faculty.subjects?.length > 0 ? (
                            faculty.subjects.map((subject, index) => (
                                <span key={index} className="subject-tag">
                                    {subject}
                                </span>
                            ))
                        ) : (
                            <span className="subject-tag">No subjects</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyCard;