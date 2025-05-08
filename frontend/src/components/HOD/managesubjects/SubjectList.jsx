import React, { useState, useEffect } from "react";

const SubjectList = ({ onSelectSubject, showAddForm, setShowAddForm }) => {
  const [filters, setFilters] = useState({
    batchId: "",
    semesterId: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({
    id: "",
    subjectName: "",
    semesterId: "",
    batchId: "",
  });

  const batches = [
    { id: 1, name: "2022-2026" },
    { id: 2, name: "2021-2025" },
    { id: 3, name: "2020-2024" },
    { id: 4, name: "2019-2023" },
  ];

  const semesters = [
    { id: 1, name: "Semester 1" },
    { id: 2, name: "Semester 2" },
    { id: 3, name: "Semester 3" },
    { id: 4, name: "Semester 4" },
    { id: 5, name: "Semester 5" },
    { id: 6, name: "Semester 6" },
    { id: 7, name: "Semester 7" },
    { id: 8, name: "Semester 8" },
  ];

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
          headers: { "Content-Type": "application/json"},
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
              {batch.name}
            </option>
          ))}
        </select>
        <select
          value={filters.semesterId}
          onChange={(e) => handleFilterChange("semesterId", e.target.value)}
        >
          <option value="">All Semesters</option>
          {semesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              {sem.name}
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
              onChange={(e) =>
                setNewSubject({ ...newSubject, batchId: e.target.value })
              }
              required
            >
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
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
            >
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name}
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
            <p>Batch: {batches.find((b) => b.id === subject.batchId)?.name}</p>
            <p>
              Semester:{" "}
              {semesters.find((s) => s.id === subject.semesterId)?.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectList;
