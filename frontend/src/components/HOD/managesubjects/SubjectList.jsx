import React, { useState, useEffect } from "react";
import "./SubjectList.css";
import SubjectDetailsModal from "./SubjectDetailsModal"; // Import the modal component
import { buildUrl } from "../../../utils/apiConfig";

const SubjectList = ({ onSelectSubject }) => {
  const [filters, setFilters] = useState({
    program: "degree",
    batch: "Degree 22-26",
    semester: "1",
  });

  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch(buildUrl("/batches/getAllBatches"));
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
        console.log(
          `Fetching semesters for batch: ${filters.batch} (encoded: ${encodedBatchName})`
        );

        const response = await fetch(
          buildUrl(`/semesters/getSemestersByBatch/${encodedBatchName}`)
        );
        if (!response.ok) {
          if (response.status === 404) {
            console.log(`No semesters found for batch: ${filters.batch}`);
            setSemesters([]);
            return;
          }
          throw new Error(
            `Failed to fetch semesters: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log(
          `Fetched ${data.length} semesters for batch: ${filters.batch}`,
          data
        );
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
        console.log(
          `Fetching subjects for batch: ${filters.batch} and semester: ${filters.semester}`
        );

        const response = await fetch(
          buildUrl(
            `/subjects/getSubjects/${encodedBatchName}/${filters.semester}`
          )
        );

        if (!response.ok) {
          if (response.status === 404) {
            console.log(
              `No subjects found for batch: ${filters.batch} and semester: ${filters.semester}`
            );
            setSubjects([]);
            return;
          }
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(errorData.message || "Failed to fetch subjects");
        }

        const data = await response.json();
        console.log("Subjects API Response:", data);
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
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "batch" ? { semester: "all" } : {}),
    }));
    // Clear subjects immediately on filter change
    setSubjects([]);
  };

  // Modal handlers
  const handleOpenModal = (subject) => {
    setSelectedSubjectForModal(subject);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubjectForModal(null);
  };

  return (
    <div className="subject-list">
      <div className="subject-header">
        <h2 className="subject-title">Subjects</h2>
        <div className="filters-container-display-subject-list">
          <select
            className="professional-filter-ds"
            name="batch"
            value={filters.batch}
            onChange={handleChange}
            required
          >
            <option value="all">Batch</option>
            {batches.map((batch, index) => (
              <option key={batch._id || index} value={batch.batchName}>
                {batch.batchName}
              </option>
            ))}
          </select>
          <select
            className="professional-filter-ds"
            name="semester"
            value={filters.semester}
            onChange={handleChange}
            required
          >
            <option value="all">Semester</option>
            {semesters.map((sem, index) => (
              <option key={sem._id || index} value={sem.semesterNumber}>
                Semester {sem.semesterNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="subjects-grid">
        {subjects.length > 0 ? (
          subjects.map((subject, index) => {
            const code =
              subject.sub_code || subject.subjectCode || subject.code;
            const name =
              subject.sub_name || subject.subjectName || subject.name;
            return (
              <div
                key={subject._id || code || index}
                className="subject-card"
                onClick={() => handleOpenModal(subject)}
              >
                <div className="card-header">
                  <h3 className="subject-card-title" style={{ color: "white" }}>
                    {name}
                  </h3>
                  {code && <span className="subject-card-code">{code}</span>}
                </div>
                <div className="subject-details">
                  <div>
                    <strong>Type:</strong>{" "}
                    {filters.program.charAt(0).toUpperCase() +
                      filters.program.slice(1)}
                  </div>
                  {(subject.sub_credit || subject.credits) && (
                    <div>
                      <strong>Credits:</strong>{" "}
                      {subject.sub_credit || subject.credits}
                    </div>
                  )}
                  {(subject.sub_type || subject.type) && (
                    <div>
                      <strong>Category:</strong>{" "}
                      {subject.sub_type || subject.type}
                    </div>
                  )}
                  <div>
                    <strong>Semester:</strong> {filters.semester}
                  </div>
                </div>
                <div className="card-actions">
                  <button
                    className="card-action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="card-action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <i className="fas fa-file-alt"></i>
                  </button>
                  <button
                    className="card-action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <i className="fas fa-folder"></i>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-subjects">
            No subjects found for the selected filters.
          </p>
        )}
      </div>

      {isModalOpen && selectedSubjectForModal && (
        <SubjectDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          subject={selectedSubjectForModal}
        />
      )}
    </div>
  );
};

export default SubjectList;
