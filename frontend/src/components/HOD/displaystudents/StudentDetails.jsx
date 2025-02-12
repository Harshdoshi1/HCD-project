

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { ChevronDown, ChevronUp, Edit2, Save } from 'lucide-react';
import './StudentDetail.css';

const StudentDetail = ({ studentId }) => {
    const [selectedSemester, setSelectedSemester] = useState(1);
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('curricular');
    const [editingMarks, setEditingMarks] = useState(null);

    const student = {
        id: 1,
        name: 'John Doe',
        enrollmentNo: 'EN2022001',
        batch: '2022-2026',
        image: 'https://via.placeholder.com/150',
        semesters: [
            {
                semester: 1,
                subjects: [
                    {
                        id: 1,
                        name: 'Mathematics',
                        grade: 'O',
                        credits: 4,
                        components: {
                            termWork: { obtained: 23, total: 25 },
                            endSemester: { obtained: 72, total: 75 },
                            continuous: { obtained: 18, total: 20 },
                            internal: { obtained: 27, total: 30 },
                            viva: { obtained: 19, total: 20 }
                        }
                    },
                    {
                        id: 2,
                        name: 'Physics',
                        grade: 'A+',
                        credits: 4,
                        components: {
                            termWork: { obtained: 22, total: 25 },
                            endSemester: { obtained: 68, total: 75 },
                            continuous: { obtained: 17, total: 20 },
                            internal: { obtained: 25, total: 30 },
                            viva: { obtained: 18, total: 20 }
                        }
                    },
                ]
            }
        ],
        coActivities: [
            {
                id: 1,
                type: 'Hackathon',
                name: 'Code Warriors 2024',
                date: '2024-02-15',
                points: 50,
                position: 'Winner'
            },
            {
                id: 2,
                type: 'Seminar',
                name: 'AI & Future of Tech',
                date: '2024-01-20',
                points: 20,
                certificate: true
            },
            {
                id: 3,
                type: 'Workshop',
                name: 'Cloud Computing Basics',
                date: '2024-03-05',
                points: 15,
                certificate: true
            }
        ],
        extraActivities: [
            {
                id: 1,
                type: 'Sports',
                name: 'Inter-College Cricket',
                date: '2024-02-10',
                achievement: 'Runner-up',
                points: 30
            },
            {
                id: 2,
                type: 'Cultural',
                name: 'Annual Dance Competition',
                date: '2024-03-15',
                achievement: 'First Place',
                points: 40
            }
        ]
    };

    const handleSemesterChange = (e) => {
        setSelectedSemester(parseInt(e.target.value));
        setExpandedSubject(null);
    };

    const toggleSubjectExpansion = (subjectId) => {
        setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
    };

    const handleMarksUpdate = (subjectId, component, value) => {
        console.log(`Updating ${component} marks for subject ${subjectId} to ${value}`);
        // Implement actual marks update logic here
    };

    const currentSemesterData = student.semesters.find(
        sem => sem.semester === selectedSemester
    );

    const renderSubjectDetails = (subject) => {
        const isExpanded = expandedSubject === subject.id;
        const isEditing = editingMarks === subject.id;

        return (
            <div key={subject.id} className="subject-card">
                <div
                    className="subject-header"
                    onClick={() => toggleSubjectExpansion(subject.id)}
                >
                    <div className="subject-main-info">
                        <h4>{subject.name}</h4>
                        <span className={`grade grade-${subject.grade.toLowerCase()}`}>
                            {subject.grade}
                        </span>
                        <span className="credits">Credits: {subject.credits}</span>

                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {isExpanded && (
                    <div className="subject-details">
                        <div className="marks-type">
                            <span className="component-type">Component type</span>
                            <span className="component-weightage">Component Weightage</span>
                            <span className="obtained-marks">Obtained Marks</span>
                        </div>
                        <br />
                        <div className="marks-components">

                            {Object.entries(subject.components).map(([component, marks]) => (
                                <div key={component} className="component-row">
                                    <span className="component-name">
                                        {component.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <span className="marks">
                                        {marks.obtained / 100}
                                    </span>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={marks.obtained}
                                            onChange={(e) => handleMarksUpdate(subject.id, component, e.target.value)}
                                            max={marks.total}
                                            className="marks-input"
                                        />
                                    ) : (
                                        <span className="marks">
                                            {marks.obtained}/{marks.total}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            className={`edit-btn ${isEditing ? 'save' : ''}`}
                            onClick={() => setEditingMarks(isEditing ? null : subject.id)}
                        >
                            {isEditing ? (
                                <>
                                    <Save size={16} />
                                    Save
                                </>
                            ) : (
                                <>
                                    <Edit2 size={16} />
                                    Edit
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderCoActivities = () => (
        <div className="activities-section">
            <h3>Co-Curricular Activities</h3>
            <div className="activities-grid">
                {student.coActivities.map(activity => (
                    <div key={activity.id} className="activity-card">
                        <div className="activity-type">{activity.type}</div>
                        <h4>{activity.name}</h4>
                        <p className="activity-date">{activity.date}</p>
                        {activity.position && (
                            <p className="activity-achievement">{activity.position}</p>
                        )}
                        <div className="activity-points">
                            Points: {activity.points}
                        </div>
                        {activity.certificate && (
                            <span className="certificate-badge">Certificate Earned</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderExtraActivities = () => (
        <div className="activities-section">
            <h3>Extra-Curricular Activities</h3>
            <div className="activities-grid">
                {student.extraActivities.map(activity => (
                    <div key={activity.id} className="activity-card">
                        <div className="activity-type">{activity.type}</div>
                        <h4>{activity.name}</h4>
                        <p className="activity-date">{activity.date}</p>
                        <p className="activity-achievement">{activity.achievement}</p>
                        <div className="activity-points">
                            Points: {activity.points}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="student-detail-container">
            <div className="student-header">
                <div className="student-profile">
                    <img
                        src={student.image}
                        alt={student.name}
                        className="student-detail-image"
                    />
                    <div className="student-info">
                        <h2>{student.name}</h2>
                        <p>Enrollment No: {student.enrollmentNo}</p>
                        <p>Batch: {student.batch}</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="curricular" className="activities-tabs">
                <TabsList>
                    <TabsTrigger value="curricular">Curricular</TabsTrigger>
                    <TabsTrigger value="co-curricular">Co-Curricular</TabsTrigger>
                    <TabsTrigger value="extra-curricular">Extra-Curricular</TabsTrigger>
                </TabsList>

                <TabsContent value="curricular">
                    <div className="semester-selector">
                        <label>Select Semester:</label>
                        <select
                            value={selectedSemester}
                            onChange={handleSemesterChange}
                            className="semester-select"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem}>
                                    Semester {sem}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="subjects-grid-std">
                        {currentSemesterData?.subjects.map(subject =>
                            renderSubjectDetails(subject)
                        )}

                    </div>
                </TabsContent>

                <TabsContent value="co-curricular">
                    {renderCoActivities()}
                </TabsContent>

                <TabsContent value="extra-curricular">
                    {renderExtraActivities()}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentDetail;
