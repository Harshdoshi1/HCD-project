import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./AssignFaculty.css";
import { buildUrl } from "../../../utils/apiConfig";

const FacultyAssignment = ({ selectedFaculty }) => {
  const [assignment, setAssignment] = useState({
    batch: null,
    semester: null,
    subject: null,
    faculty: selectedFaculty
      ? { value: selectedFaculty.id, label: selectedFaculty.name }
      : null,
  });

  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch(buildUrl("/batches/getAllBatches"));
        if (!response.ok) throw new Error("Failed to fetch batches");
        const data = await response.json();
        setBatches(
          data.map((batch) => ({
            value: batch.batchName,
            label: batch.batchName,
          }))
        );
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch(buildUrl("/users/getAllUsers"));
        if (!response.ok) throw new Error("Failed to fetch faculty members");
        const data = await response.json();
        console.log("Fetched Users:", data);

        // Remove role-based filtering
        setFaculties(
          data.map((user) => ({ value: user.id, label: user.name }))
        );
      } catch (error) {
        console.error("Error fetching faculty members:", error);
      }
    };
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (!assignment.batch) return;
    const fetchSemesters = async () => {
      try {
        const response = await fetch(
          buildUrl(`/semesters/getSemestersByBatch/${assignment.batch.value}`)
        );
        if (!response.ok) throw new Error("Failed to fetch semesters");
        const data = await response.json();
        setSemesters(
          data.map((sem) => ({
            value: sem.semesterNumber,
            label: `Semester ${sem.semesterNumber}`,
          }))
        );
      } catch (error) {
        console.error("Error fetching semesters:", error);
      }
    };
    fetchSemesters();
  }, [assignment.batch]);

  useEffect(() => {
    if (!assignment.batch || !assignment.semester) return;
    const fetchSubjects = async () => {
      try {
        console.log("Fetching subjects with:", {
          batch: assignment.batch.value,
          semester: assignment.semester.value,
        });
        const response = await fetch(
          buildUrl(
            `/subjects/getSubjects/${assignment.batch.value}/${assignment.semester.value}`
          )
        );
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data = await response.json();
        console.log("Subject API Response:", data);

        // Extract subjects from the response
        const subjectList = data.subjects || [];
        const uniqueSubjects = data.uniqueSubjects || [];

        // Map subjects with additional info from uniqueSubjects
        const mappedSubjects = subjectList.map((subject) => {
          const uniqueInfo = uniqueSubjects.find(
            (u) => u.sub_name === subject.subjectName
          );
          return {
            value: subject.subjectName,
            label: uniqueInfo
              ? `${subject.subjectName} (${uniqueInfo.sub_code})`
              : subject.subjectName,
          };
        });

        console.log("Mapped subjects:", mappedSubjects);
        setSubjects(mappedSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [assignment.batch, assignment.semester]);

  const handleChange = (selectedOption, { name }) => {
    setAssignment((prev) => ({
      ...prev,
      [name]: selectedOption,
      ...(name === "batch" ? { semester: null, subject: null } : {}),
      ...(name === "semester" ? { subject: null } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(buildUrl("/faculties/createAssignSubject"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignment),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign faculty");
      }

      alert("Faculty assigned successfully!");
      console.log("Assignment Successful:", data);

      // Reset form after successful submission
      setAssignment({
        batch: "",
        semester: "",
        subject: "",
        faculty: selectedFaculty?.id || "",
      });
    } catch (error) {
      console.error("Error assigning faculty:", error);
      alert(error.message);
    }
  };

  return (
    <div className="faculty-assignment-container">
      <header style={{ textAlign: "left" }}>
        <h2
          style={{ textAlign: "left", marginTop: "10px", marginBottom: "10px" }}
        >
          Assign Faculty for Subject
        </h2>
        <p style={{ textAlign: "left" }}>
          Please select the faculty member and the subject they will be assigned
          to.
        </p>
        <br />
      </header>
      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Select Batch</label>
            <Select
              name="batch"
              value={assignment.batch}
              onChange={handleChange}
              options={batches}
              placeholder="Select Batch"
              isSearchable
            />
          </div>

          <div className="form-group">
            <label>Select Semester</label>
            <Select
              name="semester"
              value={assignment.semester}
              onChange={handleChange}
              options={semesters}
              placeholder="Select Semester"
              isSearchable
              isDisabled={!assignment.batch}
            />
          </div>

          <div className="form-group">
            <label>Select Subject</label>
            <Select
              name="subject"
              value={assignment.subject}
              onChange={handleChange}
              options={subjects}
              placeholder="Select Subject"
              isSearchable
              isDisabled={!assignment.batch || !assignment.semester}
            />
          </div>

          <div className="form-group">
            <label>Select Faculty</label>
            <Select
              name="faculty"
              value={assignment.faculty}
              onChange={handleChange}
              options={faculties}
              placeholder="Select Faculty"
              isSearchable
            />
          </div>
        </div>

        <button type="submit" className="submit-btn-assign-faculty">
          Assign Faculty
        </button>
      </form>
    </div>
  );
};

export default FacultyAssignment;
