import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Select from 'react-select';
import './AddStudent.css';

const AddStudent = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        enrollmentNumber: '',
        batch: null,
        semester: null
    });

    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch batches when component mounts
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:5001/api/batches/getAllBatches");
                if (!response.ok) {
                    throw new Error("Failed to fetch batches");
                }
                const data = await response.json();
                console.log('Received batches:', data);
                if (Array.isArray(data)) {
                    const mappedBatches = data.map(batch => ({
                        value: batch.id,
                        label: `${batch.program} - ${batch.name}`
                    }));
                    console.log('Mapped batches:', mappedBatches);
                    setBatches(mappedBatches);
                } else {
                    console.error('Received data is not an array:', data);
                    setError('Invalid data format received from server');
                }
            } catch (error) {
                console.error("Error fetching batches:", error);
                setError("Failed to load batches");
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

    // Fetch semesters when batch changes
    useEffect(() => {
        const fetchSemesters = async () => {
            if (!formData.batch) {
                setSemesters([]);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5001/api/semesters/getSemestersByBatch/${formData.batch.value}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch semesters");
                }
                const data = await response.json();
                const mappedSemesters = data.map(sem => ({
                    value: sem.semester_number,
                    label: `Semester ${sem.semester_number}`
                }));
                setSemesters(mappedSemesters);
            } catch (error) {
                console.error("Error fetching semesters:", error);
                setError("Failed to load semesters");
            } finally {
                setLoading(false);
            }
        };
        fetchSemesters();
    }, [formData.batch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: selectedOption,
            ...(name === "batch" ? { semester: null } : {})
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Student data submitted:', formData);
        // Add student logic here
    };

    return (
        <div className="add-student-container">
            <div className="add-student-header">
                <UserPlus size={24} />
                <h2>Add New Student</h2>
            </div>
            <form onSubmit={handleSubmit} className="add-student-form">
                <div className="form-group">
                    <label>First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Roll Number</label>
                    <input
                        type="text"
                        name="enrollmentNumber"
                        value={formData.enrollmentNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Batch</label>
                    <Select
                        name="batch"
                        value={formData.batch}
                        onChange={(option) => handleSelectChange(option, { name: 'batch' })}
                        options={batches}
                        placeholder="Select Batch"
                        isSearchable
                        isDisabled={loading}
                        isLoading={loading}
                    />
                </div>
                <div className="form-group">
                    <label>Semester</label>
                    <Select
                        name="semester"
                        value={formData.semester}
                        onChange={(option) => handleSelectChange(option, { name: 'semester' })}
                        options={semesters}
                        placeholder="Select Semester"
                        isSearchable
                        isDisabled={!formData.batch || loading}
                        isLoading={loading}
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="submit-button"> Add Student</button>
            </form>
        </div>
    );
};

export default AddStudent;