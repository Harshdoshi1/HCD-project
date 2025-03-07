import React from 'react';
import { Mail, BookOpen, GraduationCap, Building, UserPen } from 'lucide-react';

const FacultyCard = ({ faculty, onClick }) => {
    if (!faculty || !faculty.name) {
        return <div className="error-card">Error: Faculty data is missing or invalid.</div>;
    }

    return (
        <div className="faculty-card" onClick={onClick}>
            <div className="faculty-card-header">
                <div className="faculty-initials">
                    {faculty.name?.split(' ')?.map(n => n[0]).join('') || "NA"}
                </div>
                <div className="faculty-main-info">
                    <h3>{faculty.name || "Unknown"}</h3>
                    {/* <p className="department">
                        <Building size={16} className="info-icon" />
                        {faculty.department || "No Department"}
                    </p> */}
                </div>
            </div>
            <div className="faculty-card-content">
                <p className="designation">
                    <UserPen size={16} className="info-icon" />
                    <span>{faculty.designation || "N/A"}</span>
                </p>
                <p className="email">
                    <Mail size={16} className="info-icon" />
                    <span>{faculty.email || "N/A"}</span>
                </p>
                <div className="subjects">
                    <div className="subjects-header">
                        <BookOpen size={16} className="info-icon" />
                        <strong>Subjects:</strong>
                    </div>
                    <div className="subject-tags">
                        {faculty.subjects?.length > 0 ? (
                            faculty.subjects.map((subject, index) => (
                                <span key={index} className="subject-tag">
                                    {subject}
                                </span>
                            ))
                        ) : (
                            <span className="subject-tag">No subjects assigned</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyCard;