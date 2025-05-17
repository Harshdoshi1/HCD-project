import React, { useState, useEffect } from "react";

const SubjectList = ({ onSelectSubject, showAddForm, setShowAddForm }) => {
  const [filters, setFilters] = useState({
    batchId: "",
    semesterId: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [newSubject, setNewSubject] = useState({
    id: "",
    subjectName: "",
    semesterId: "",
    batchId: "",
  });
  const [error, setError] = useState("");

  const fetchBatches = async () => {
    try {
      console.log("Fetching batches...");
      const response = await fetch(
        "http://localhost:5001/api/auth/getAllBatches"
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch batches");
      }

      const data = await response.json();
      console.log("Received batches:", data);

      if (!Array.isArray(data)) {
        console.error("Expected array of batches but got:", typeof data);
        throw new Error("Invalid data format received from server");
      }

      setBatches(data);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setError(error.message);
    }
  };

  const fetchSemesters = async (batchName) => {
    if (!batchName) {
      setSemesters([]);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5001/api/auth/getSemestersByBatch/${batchName}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch semesters");
      }
      const data = await response.json();
      setSemesters(data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.batchId) queryParams.append("batchId", filters.batchId);
      if (filters.semesterId)
        queryParams.append("semesterId", filters.semesterId);

      const response = await fetch(
        `http://localhost:5001/api/subjects?${queryParams.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subjects: " + (await response.text()));
      }

      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error.message);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (filters.batchId) {
      const selectedBatch = batches.find(
        (b) => b.id === parseInt(filters.batchId)
      );
      if (selectedBatch) {
        fetchSemesters(selectedBatch.batchName);
      }
    }
  }, [filters.batchId, batches]);

  useEffect(() => {
    fetchSubjects();
  }, [filters.batchId, filters.semesterId]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleAddSubject = async () => {
    try {
      if (
        !newSubject.id ||
        !newSubject.subjectName ||
        !newSubject.semesterId ||
        !newSubject.batchId
      ) {
        alert("Please fill in all required fields");
        return;
      }

      const response = await fetch(
        "http://localhost:5001/api/subjects/addSubject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: newSubject.id.toUpperCase(),
            subjectName: newSubject.subjectName,
            semesterId: parseInt(newSubject.semesterId),
            batchId: parseInt(newSubject.batchId),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add subject");
      }

      setNewSubject({
        id: "",
        subjectName: "",
        semesterId: "",
        batchId: "",
      });
      setShowAddForm(false);
      fetchSubjects();
    } catch (error) {
      console.error("Error adding subject:", error);
      alert(error.message);
    }
  };

  return (
    <div className="subject-list">
      <div className="filters">
        <select
          value={filters.batchId}
          onChange={(e) => handleFilterChange("batchId", e.target.value)}
        >
          <option value="">All Batches</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.batchName}
            </option>
          ))}
        </select>
        <select
          value={filters.semesterId}
          onChange={(e) => handleFilterChange("semesterId", e.target.value)}
          disabled={!filters.batchId}
        >
          <option value="">All Semesters</option>
          {semesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              Semester {sem.semesterNumber}
            </option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <div className="add-subject-form">
          <h2>Add New Subject</h2>
          <div className="form-group">
            <label>Subject Code:</label>
            <input
              type="text"
              value={newSubject.id}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  id: e.target.value.toUpperCase(),
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Subject Name:</label>
            <input
              type="text"
              value={newSubject.subjectName}
              onChange={(e) =>
                setNewSubject({ ...newSubject, subjectName: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Batch:</label>
            <select
              value={newSubject.batchId}
              onChange={(e) => {
                setNewSubject({
                  ...newSubject,
                  batchId: e.target.value,
                  semesterId: "",
                });
                const selectedBatch = batches.find(
                  (b) => b.id === parseInt(e.target.value)
                );
                if (selectedBatch) {
                  fetchSemesters(selectedBatch.batchName);
                }
              }}
              required
            >
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batchName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Semester:</label>
            <select
              value={newSubject.semesterId}
              onChange={(e) =>
                setNewSubject({ ...newSubject, semesterId: e.target.value })
              }
              required
              disabled={!newSubject.batchId}
            >
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  Semester {sem.semesterNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button onClick={handleAddSubject}>Add Subject</button>
            <button onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
=======
import React, { useState, useEffect } from 'react';
import "./SubjectList.css";

const SubjectList = ({ onSelectSubject }) => {
    const [filters, setFilters] = useState({
        program: 'degree',
        batch: 'Degree 22-26',
        semester: '1'
    });

    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/batches/getAllBatches");
                if (!response.ok) throw new Error("Failed to fetch batches");
                const data = await response.json();
                setBatches(data);
            } catch (error) {
                console.error("Error fetching batches:", error);
                setError("Failed to fetch batches");
            }
        };
        fetchBatches();
    }, []);

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                if (!filters.batch || filters.batch === "all") {
                    setSemesters([]);
                    return;
                }
                
                const encodedBatchName = encodeURIComponent(filters.batch);
                console.log(`Fetching semesters for batch: ${filters.batch} (encoded: ${encodedBatchName})`);
                
                const response = await fetch(`http://localhost:5001/api/semesters/getSemestersByBatch/${encodedBatchName}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        console.log(`No semesters found for batch: ${filters.batch}`);
                        setSemesters([]);
                        return;
                    }
                    throw new Error(`Failed to fetch semesters: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log(`Fetched ${data.length} semesters for batch: ${filters.batch}`, data);
                setSemesters(data);
            } catch (error) {
                console.error("Error fetching semesters:", error);
                setSemesters([]);
                setError(`Failed to fetch semesters: ${error.message}`);
            }
        };
        fetchSemesters();
    }, [filters.batch]);

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoading(true);
            setError(null);
            
            try {
                if (filters.batch === "all" || filters.semester === "all") {
                    setSubjects([]);
                    return;
                }
                
                const encodedBatchName = encodeURIComponent(filters.batch);
                console.log(`Fetching subjects for batch: ${filters.batch} and semester: ${filters.semester}`);
                
                const response = await fetch(
                    `http://localhost:5001/api/subjects/getSubjects/${encodedBatchName}/${filters.semester}`
                );
                
                if (!response.ok) {
                    if (response.status === 404) {
                        console.log(`No subjects found for batch: ${filters.batch} and semester: ${filters.semester}`);
                        setSubjects([]);
                        return;
                    }
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    throw new Error(errorData.message || "Failed to fetch subjects");
                }
                
                const data = await response.json();
                console.log('Subjects API Response:', data);
                setSubjects(data.uniqueSubjects || data.subjects || []);
            } catch (error) {
                console.error("Error fetching subjects:", error);
                setError(`Failed to fetch subjects: ${error.message}`);
                setSubjects([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSubjects();
    }, [filters.batch, filters.semester]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            ...(name === "batch" ? { semester: "all" } : {}),
        }));
        // Clear subjects immediately on filter change
        setSubjects([]);
    };

    return (
        <div className="subject-list">
            <div className="filters-container-display-subject-list">

                <select className="professional-filter-ds" name="batch" value={filters.batch} onChange={handleChange} required>
                    <option value="all">Batch</option>
                    {batches.map((batch, index) => (
                        <option key={batch._id || index} value={batch.batchName}>
                            {batch.batchName}
                        </option>
                    ))}
                </select>
                <select className="professional-filter-ds" name="semester" value={filters.semester} onChange={handleChange} required>
                    <option value="all">Semester</option>
                    {semesters.map((sem, index) => (
                        <option key={sem._id || index} value={sem.semesterNumber}>
                            Semester {sem.semesterNumber}
                        </option>
                    ))}
                </select>
            </div>

            <div className="subjects-grid">
                {subjects.length > 0 ? (
                    subjects.map((subject, index) => {
                        const code = subject.sub_code || subject.subjectCode || subject.code;
                        const name = subject.sub_name || subject.subjectName || subject.name;
                        return (
                            <div key={subject._id || code || index} className="subject-card" onClick={() => onSelectSubject(subject)}>
                                {code && (
                                    <div className="subject-code">{code}</div>
                                )}
                                <div className="subject-name">
                                    {name}
                                </div>
                                <div className="subject-details">
                                    <div><strong>Type:</strong> {filters.program.charAt(0).toUpperCase() + filters.program.slice(1)}</div>
                                    {(subject.sub_credit || subject.credits) &&
                                        <div><strong>Credits:</strong> {subject.sub_credit || subject.credits}</div>}
                                    {(subject.sub_type || subject.type) &&
                                        <div><strong>Category:</strong> {subject.sub_type || subject.type}</div>}
                                    <div><strong>Semester:</strong> {filters.semester}</div>
                                    <div><strong>Batch:</strong> {filters.batch}</div>
                                </div>
                            </div>
                        );
                    })
                ) : (

                    <p className="no-subjects">No subjects found for the selected filters.</p>
                )}
            </div>
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
        </div>
      )}

      <div className="subjects-grid">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="subject-card"
            onClick={() => onSelectSubject(subject)}
          >
            <h3>{subject.subjectName}</h3>
            <p>Code: {subject.id}</p>
            <p>
              Batch: {batches.find((b) => b.id === subject.batchId)?.batchName}
            </p>
            <p>
              Semester:{" "}
              {
                semesters.find((s) => s.id === subject.semesterId)
                  ?.semesterNumber
              }
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectList;
