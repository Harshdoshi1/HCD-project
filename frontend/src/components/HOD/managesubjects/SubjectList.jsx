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
