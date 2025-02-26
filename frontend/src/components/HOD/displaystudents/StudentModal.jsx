import React, { useState } from 'react';
import './StudentModal.css';

const StudentModal = ({ isOpen, onClose }) => {
    const [studentName, setStudentName] = useState('');
    const [studentAge, setStudentAge] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentAddress, setStudentAddress] = useState('');
    const [studentPhone, setStudentPhone] = useState('');
    const [file, setFile] = useState(null);
    const [studentUsername, setStudentUsername] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [studentDepartment, setStudentDepartment] = useState('');
    const [studentSemester, setStudentSemester] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Student Name:', studentName);
        console.log('Student Age:', studentAge);
        console.log('Student Email:', studentEmail);
        console.log('Student Address:', studentAddress);
        console.log('Student Phone:', studentPhone);
        console.log('Student Username:', studentUsername);
        console.log('Student Password:', studentPassword);
        console.log('Student Department:', studentDepartment);
        console.log('Student Semester:', studentSemester);
        console.log('File:', file);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add Student</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
                    <input type="number" placeholder="Student Age" value={studentAge} onChange={(e) => setStudentAge(e.target.value)} required />
                    <input type="email" placeholder="Student Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required />
                    <input type="text" placeholder="Student Address" value={studentAddress} onChange={(e) => setStudentAddress(e.target.value)} required />
                    <input type="tel" placeholder="Student Phone" value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} required />
                    <input type="text" placeholder="Student Username" value={studentUsername} onChange={(e) => setStudentUsername(e.target.value)} required />
                    <input type="password" placeholder="Student Password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} required />
                    <input type="text" placeholder="Student Department" value={studentDepartment} onChange={(e) => setStudentDepartment(e.target.value)} required />
                    <input type="number" placeholder="Student Semester" value={studentSemester} onChange={(e) => setStudentSemester(e.target.value)} required />
                    <input type="file" onChange={handleFileChange} />
                    <button type="submit">Add Student</button>
                    <button type="button" onClick={onClose}>Close</button>
                </form>
            </div>
        </div>
    );
};

export default StudentModal;
