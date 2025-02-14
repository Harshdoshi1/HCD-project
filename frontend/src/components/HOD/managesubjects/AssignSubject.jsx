import React, { useState, useEffect } from "react";

const AssignSubject = () => {
  const [filters, setFilters] = useState({
    program: "all",
    batch: "all",
    semester: "all",
  });

  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const batches = ["2022-2026", "2021-2025", "2020-2024", "2019-2023"];
  const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

  // Fetch subjects based on selected program
  const fetchSubjects = async () => {
    if (filters.program === "all") {
      setAvailableSubjects([]);
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:5000/api/users/getSubjects",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ program: filters.program }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setAvailableSubjects(data.subjects);
      } else {
        console.error("Failed to fetch subjects:", data.message);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [filters.program]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setSelectedSubjects((prev) => {
      const isAlreadySelected = prev.some(
        (s) => s.sub_code === subject.sub_code
      );
      if (!isAlreadySelected) {
        return [...prev, subject]; // Append new selection
      }
      return prev;
    });
  };

  // Remove subject from selected list
  const handleSubjectRemove = (subject) => {
    setSelectedSubjects((prev) =>
      prev.filter((s) => s.sub_code !== subject.sub_code)
    );
  };

  // Save selected subjects
  const handleSaveSubjects = async () => {
    if (filters.batch === "all" || filters.semester === "all") {
      alert("Please select a valid Batch and Semester.");
      return;
    }

    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject.");
      return;
    }

    try {
      const subjects = selectedSubjects.map((subject) => ({
        subjectName: subject.sub_name,
        semesterNumber: filters.semester,
        batchName: filters.batch,
      }));

      const response = await fetch(
        "http://localhost:5000/api/users/assignSubject",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjects }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Subjects assigned successfully!");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error saving subjects:", error);
      alert("Failed to assign subjects.");
    }
  };

  // Calculate total credits
  const totalCredits = selectedSubjects.reduce(
    (sum, subject) => sum + (subject.sub_credit || 0),
    0
  );

  return (
    <div className="assign-subject-container">
      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <select
            className="professional-filter"
            value={filters.program}
            onChange={(e) => handleFilterChange("program", e.target.value)}
          >
            <option value="all">All Programs</option>
            <option value="degree">Degree</option>
            <option value="diploma">Diploma</option>
          </select>

          <select
            className="professional-filter"
            value={filters.batch}
            onChange={(e) => handleFilterChange("batch", e.target.value)}
          >
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>

          <select
            className="professional-filter"
            value={filters.semester}
            onChange={(e) => handleFilterChange("semester", e.target.value)}
          >
            <option value="all">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Subjects */}
      <div className="selected-subjects-section">
        <div className="selected-subjects-header">
        <h3 className='heading1-as' style={{ textAlign: 'left' }}>Selected Subjects</h3>          <div className="selected-subjects-stats">
            <span className="subject-count">
              Selected: {selectedSubjects.length}
            </span>
            <span className="total-credits">Total Credits: {totalCredits}</span>
          </div>
        </div>
        <div className="selected-subjects-container">
          {selectedSubjects.map((subject, index) => (
            <div key={subject.sub_code || index} className="subject-item">
              <div className="subject-info">
                <span>
                  {subject.sub_code} - {subject.sub_name} ({subject.sub_credit}{" "}
                  credits)
                </span>
              </div>
              <button
                className="remove-subject-btn"
                onClick={() => handleSubjectRemove(subject)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
   
      {/* Available Subjects */}
      <div className="all-subjects-section">
      <h3 className='heading2-as' style={{ textAlign: 'left' }}>Available Subjects</h3>        <div className="all-subjects-container">
          {availableSubjects.length > 0 ? (
            availableSubjects.map((subject, index) => (
              <div
                key={subject.sub_code || index}
                className="subject-item"
                onClick={() => handleSubjectSelect(subject)}
              >
                <span>
                  {subject.sub_code} - {subject.sub_name}
                </span>
                <span className="subject-credits">
                  {subject.sub_credit} credits
                </span>
              </div>
            ))
          ) : (
            <p>No subjects available for the selected program.</p>
          )}
        </div>
      </div>
      {/* <div className="all-subjects-section">
                <h3 className='heading2-as' style={{ textAlign: 'left' }}>Available Subjects</h3>

                <div className="all-subjects-container">
                    {allSubjects.map(subject => (
                        <div
                            key={subject.id}
                            className="subject-item"
                            onClick={() => handleSubjectSelect(subject)}
                        >
                            <span>{subject.code} - {subject.name}</span>
                            <span className="subject-credits">{subject.credits} credits</span>
                        </div>
                    ))}
                </div>
            </div> */}

      {/* Save Button */}
      {/* <div className="save-subjects-section">
        <button className="save-subjects-btn" onClick={handleSaveSubjects}>
          Save Selected Subjects
        </button>
      </div> */}

<div className="save-subjects-section">
                <button
                    className="save-subjects-btn"
                    onClick={handleSaveSubjects}
                >
                    Save Selected Subjects
                </button>
            </div>
            
    </div>
  );
};

export default AssignSubject;
