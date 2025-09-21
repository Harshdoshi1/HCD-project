import React, { useState, useEffect } from "react";
import "./ManageBatches.css";
import PassStudents from "./PassStudents";
import BatchOverviewModal from "./BatchOverviewModal";
import { buildUrl } from '../../../utils/apiConfig';

const ManageBatches = () => {
  const [batches, setBatches] = useState([]);
  const [newBatch, setNewBatch] = useState({
    batchName: "",
    batchStart: "",
    batchEnd: "",
    courseType: "",
  });
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [semesterToAdd, setSemesterToAdd] = useState({
    semesterNumber: "",
    startDate: "",
    endDate: "",
    numberOfClasses: "",
    classes: [],
    excelFile: null,
  });
  const [activeTab, setActiveTab] = useState("batch");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPassStudentsModalOpen, setIsPassStudentsModalOpen] = useState(false);
  const [isBatchOverviewModalOpen, setIsBatchOverviewModalOpen] =
    useState(false);
  const [selectedBatchForOverview, setSelectedBatchForOverview] =
    useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  // Generate class sections when numberOfClasses changes
  useEffect(() => {
    const numClasses = parseInt(semesterToAdd.numberOfClasses) || 0;
    if (numClasses > 0) {
      const classSections = [];
      for (let i = 0; i < numClasses; i++) {
        const sectionLetter = String.fromCharCode(65 + i); // A, B, C, etc.
        classSections.push({
          id: i,
          name: `Class ${sectionLetter}`,
          excelFile: null,
        });
      }
      setSemesterToAdd((prev) => ({
        ...prev,
        classes: classSections,
      }));
    } else {
      setSemesterToAdd((prev) => ({
        ...prev,
        classes: [],
      }));
    }
  }, [semesterToAdd.numberOfClasses]);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(buildUrl('/batches/getAllBatches'));
      if (!response.ok) throw new Error("Failed to fetch batches");
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      setError(error.message);
      alert("Error fetching batches: " + error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBatch = async () => {
    // Validation
    if (
      !newBatch.batchName ||
      !newBatch.batchStart ||
      !newBatch.batchEnd ||
      !newBatch.courseType
    ) {
      setError("Please fill all the required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(buildUrl('/batches/addBatch'), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBatch),
        });
      if (!response.ok) throw new Error("Failed to add batch");

      await fetchBatches();
      setNewBatch({
        batchName: "",
        batchStart: "",
        batchEnd: "",
        courseType: "",
      });
      alert("Batch added successfully!");
    } catch (error) {
      setError(error.message);
      alert("Error adding batch: " + error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSemester = async () => {
    if (!selectedBatch) {
      setError("Please select a batch first");
      return;
    }

    if (
      !semesterToAdd.semesterNumber ||
      !semesterToAdd.startDate ||
      !semesterToAdd.endDate
    ) {
      setError("Please fill all the required fields");
      return;
    }

    // Validate class names
    if (semesterToAdd.numberOfClasses > 0) {
      const emptyClassNames = semesterToAdd.classes.some(
        (cls) => !cls.name.trim()
      );
      if (emptyClassNames) {
        setError("Please provide names for all classes");
        return;
      }
    }

    const semesterData = {
      batchName: selectedBatch.batchName,
      semesterNumber: semesterToAdd.semesterNumber,
      startDate: semesterToAdd.startDate,
      endDate: semesterToAdd.endDate,
      numberOfClasses: semesterToAdd.numberOfClasses,
      classes: semesterToAdd.classes,
    };

    setIsLoading(true);
    try {
      const response = await fetch(buildUrl('/semesters/addSemester'), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(semesterData),
        });
      if (!response.ok) throw new Error("Failed to add semester");

      await fetchBatches();
      setSelectedBatch(null);
      setSemesterToAdd({
        semesterNumber: "",
        startDate: "",
        endDate: "",
        numberOfClasses: "",
        classes: [],
      });
      alert("Semester added successfully!");
    } catch (error) {
      setError(error.message);
      alert("Error adding semester: " + error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassNameChange = (classId, newName) => {
    setSemesterToAdd((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) =>
        cls.id === classId ? { ...cls, name: newName } : cls
      ),
    }));
  };

  const handleExcelFileChange = (file) => {
    setSemesterToAdd((prev) => ({
      ...prev,
      excelFile: file,
    }));
  };

  const handleExcelUpload = async () => {
    if (!semesterToAdd.excelFile) {
      setError("Please select an Excel file first");
      return;
    }

    if (!selectedBatch) {
      setError("Please select a batch first");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("excelFile", semesterToAdd.excelFile);
      formData.append("semesterId", semesterToAdd.semesterNumber);
      formData.append("batchId", selectedBatch.id);
      formData.append("numberOfClasses", semesterToAdd.numberOfClasses);

      const response = await fetch(buildUrl('/excel-upload/upload-all-classes'), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload Excel file");
      }

      const result = await response.json();
      alert(
        `Excel uploaded successfully! ${result.data.totalUpdated} students updated across all classes.`
      );

      // Clear the file input
      setSemesterToAdd((prev) => ({
        ...prev,
        excelFile: null,
      }));
    } catch (error) {
      setError(error.message);
      console.error("Error uploading Excel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const previewExcelData = async () => {
    if (!semesterToAdd.excelFile) {
      setError("Please select an Excel file first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("excelFile", semesterToAdd.excelFile);

      const response = await fetch(buildUrl('/excel-upload/preview-all-classes'), {
          method: "POST",
          body: formData,
        });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to preview Excel file");
      }

      const result = await response.json();

      // Show preview in a more user-friendly way
      let previewMessage = `Excel preview: ${result.data.totalStudents} students found.\n\n`;
      previewMessage += `Class distribution:\n`;
      Object.entries(result.data.classDistribution).forEach(
        ([className, count]) => {
          previewMessage += `${className}: ${count} students\n`;
        }
      );

      if (result.data.preview.length > 0) {
        previewMessage += `\nSample students:\n`;
        result.data.preview.slice(0, 5).forEach((student) => {
          previewMessage += `• ${student.name} (${student.enrollmentNumber}) → ${student.className}\n`;
        });
      }

      alert(previewMessage);
    } catch (error) {
      setError(error.message);
      console.error("Error previewing Excel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleOpenPassStudentsModal = () => {
    setIsPassStudentsModalOpen(true);
  };

  const handleClosePassStudentsModal = () => {
    setIsPassStudentsModalOpen(false);
  };

  const handleBatchCardClick = (batch) => {
    setSelectedBatchForOverview(batch);
    setIsBatchOverviewModalOpen(true);
  };

  const handleCloseBatchOverviewModal = () => {
    setIsBatchOverviewModalOpen(false);
    setSelectedBatchForOverview(null);
  };

  return (
    <div className="manage-batches-container">
      <div className="manage-batch-header">
        <button
          className={`tab-button ${activeTab === "batch" ? "active" : ""}`}
          onClick={() => setActiveTab("batch")}
        >
          Add New Batch
        </button>
        <button
          className={`tab-button ${activeTab === "semester" ? "active" : ""}`}
          onClick={() => setActiveTab("semester")}
        >
          Add Semester
        </button>
        <button
          className={`tab-button ${activeTab === "update" ? "active" : ""}`}
          onClick={handleOpenPassStudentsModal}
        >
          Update Semester
        </button>
      </div>

      <div className="tab-container">
        <div className="tab-content">
          {activeTab === "batch" && (
            <div className="card">
              <div className="card-header">
                {/* <h2 className="card-title">Create New Batch</h2> */}
                {/* <p className="card-description">
                  Add a new batch for your academic program
                </p> */}
              </div>
              <div className="card-content form-container">
                <h2 className="card-title" style={{ textAlign: "left" }}>
                  Create New Batch
                </h2>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <div className="form-group" style={{ flex: "1" }}>
                    <label htmlFor="batchName">Batch Name</label>
                    <input
                      id="batchName"
                      className="input"
                      placeholder="e.g., BTech 2023-27"
                      value={newBatch.batchName}
                      onChange={(e) =>
                        setNewBatch({ ...newBatch, batchName: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group" style={{ flex: "1" }}>
                    <label htmlFor="batchStart">Start Date</label>
                    <div className="date-input-wrapper">
                      <input
                        id="batchStart"
                        className="input date-input"
                        type="date"
                        value={newBatch.batchStart}
                        onChange={(e) =>
                          setNewBatch({
                            ...newBatch,
                            batchStart: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ flex: "1" }}>
                    <label htmlFor="batchEnd">End Date</label>
                    <div className="date-input-wrapper">
                      <input
                        id="batchEnd"
                        className="input date-input"
                        type="date"
                        value={newBatch.batchEnd}
                        onChange={(e) =>
                          setNewBatch({ ...newBatch, batchEnd: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ flex: "1" }}>
                    <label htmlFor="courseType">Course Type</label>
                    <input
                      id="courseType"
                      className="input"
                      placeholder="e.g., BTech, MTech, PhD"
                      value={newBatch.courseType}
                      onChange={(e) =>
                        setNewBatch({ ...newBatch, courseType: e.target.value })
                      }
                    />
                  </div>
                  <div className="card-footer">
                    <button
                      onClick={handleAddBatch}
                      disabled={isLoading}
                      className="button primary-button"
                    >
                      Add Batch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "semester" && (
            <div className="card">
              <div className="card-header">
                {/* <h2 className="card-title">Add Semester to Batch</h2>
                <p className="card-description">
                  Create a new semester for an existing batch with optional
                  class divisions
                </p> */}
              </div>
              <div className="card-content form-container">
                <h2 className="card-title" style={{ textAlign: "start" }}>
                  Add Semester to Batch
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <div className="form-group" style={{ flex: "1" }}>
                    <label htmlFor="semesterNumber">Semester Number</label>
                    <input
                      id="semesterNumber"
                      className="input"
                      type="number"
                      placeholder="e.g., 1, 2, 3"
                      value={semesterToAdd.semesterNumber}
                      onChange={(e) =>
                        setSemesterToAdd({
                          ...semesterToAdd,
                          semesterNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group" style={{ flex: "1" }}>
                    <label htmlFor="semesterStart">Start Date</label>
                    <div className="date-input-wrapper">
                      <input
                        id="semesterStart"
                        className="input date-input"
                        type="date"
                        value={semesterToAdd.startDate}
                        onChange={(e) =>
                          setSemesterToAdd({
                            ...semesterToAdd,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ flex: "1" }}>
                    <label htmlFor="semesterEnd">End Date</label>
                    <div className="date-input-wrapper">
                      <input
                        id="semesterEnd"
                        className="input date-input"
                        type="date"
                        value={semesterToAdd.endDate}
                        onChange={(e) =>
                          setSemesterToAdd({
                            ...semesterToAdd,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ flex: "1" }}>
                    <label htmlFor="batchSelect">Select Batch</label>
                    <select
                      id="batchSelect"
                      className="select"
                      onChange={(e) =>
                        setSelectedBatch(
                          batches.find(
                            (batch) => batch.batchName === e.target.value
                          ) || null
                        )
                      }
                    >
                      <option value="">Select a batch</option>
                      {batches.map((batch) => (
                        <option key={batch.batchName} value={batch.batchName}>
                          {batch.batchName} ({batch.courseType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: "1" }}>
                    <label htmlFor="numberOfClasses">Number of Classes</label>
                    <input
                      id="numberOfClasses"
                      className="input"
                      type="number"
                      min="0"
                      max="10"
                      placeholder="e.g., 3 (creates A, B, C)"
                      value={semesterToAdd.numberOfClasses}
                      onChange={(e) =>
                        setSemesterToAdd({
                          ...semesterToAdd,
                          numberOfClasses: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Excel Upload Section */}
                {semesterToAdd.classes.length > 0 && (
                  <div className="excel-upload-section">
                    <div className="excel-upload-header">
                      <h3 className="excel-upload-title">
                        Student Data Upload
                      </h3>
                      <div className="template-actions">
                        <button
                          type="button"
                          className="button secondary-button"
                          onClick={() =>
                            window.open(buildUrl('/excel-upload/template'), "_blank")
                          }
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                        >
                          📥 Download Template
                        </button>
                        <button
                          type="button"
                          className="button info-button"
                          onClick={() =>
                            window.open(buildUrl('/excel-upload/instructions'), "_blank")
                          }
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                        >
                          ℹ️ Format Guide
                        </button>
                      </div>
                    </div>

                    <div className="excel-upload-content">
                      <div className="form-group">
                        <label htmlFor="excelFile">
                          Upload Student List (Excel)
                        </label>
                        <div className="file-upload-wrapper">
                          <input
                            id="excelFile"
                            className="file-input"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) =>
                              handleExcelFileChange(e.target.files[0])
                            }
                          />
                          <div
                            className={`file-upload-placeholder ${
                              semesterToAdd.excelFile ? "has-file" : ""
                            }`}
                            onClick={() =>
                              document.getElementById("excelFile").click()
                            }
                          >
                            <span className="file-upload-icon">📄</span>
                            <span className="file-upload-text">
                              {semesterToAdd.excelFile
                                ? semesterToAdd.excelFile.name
                                : "Choose Excel file for all classes"}
                            </span>
                          </div>
                        </div>

                        {semesterToAdd.excelFile && (
                          <div
                            className="excel-actions"
                            style={{
                              marginTop: "10px",
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <button
                              type="button"
                              className="button secondary-button"
                              onClick={previewExcelData}
                              disabled={isLoading}
                              style={{ fontSize: "12px", padding: "6px 12px" }}
                            >
                              {isLoading ? "Loading..." : "Preview Data"}
                            </button>
                            <button
                              type="button"
                              className="button primary-button"
                              onClick={handleExcelUpload}
                              disabled={isLoading}
                              style={{ fontSize: "12px", padding: "6px 12px" }}
                            >
                              {isLoading
                                ? "Uploading..."
                                : "Upload All Classes"}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="upload-info">
                        <p>
                          <strong>Note:</strong> Upload one Excel file
                          containing all students. The system will automatically
                          distribute students to their respective classes based
                          on the "Class" column in your Excel file.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Class Configuration Section */}
                {semesterToAdd.classes.length > 0 && (
                  <div className="classes-section">
                    <h3 className="classes-section-title">
                      Class Configuration
                    </h3>
                    <div className="classes-grid">
                      {semesterToAdd.classes.map((cls) => (
                        <div key={cls.id} className="class-config-card">
                          <div className="class-config-header">
                            <h4 className="class-config-title">
                              Class {String.fromCharCode(65 + cls.id)}
                            </h4>
                          </div>
                          <div className="class-config-content">
                            <div className="form-group">
                              <label htmlFor={`className-${cls.id}`}>
                                Class Name
                              </label>
                              <input
                                id={`className-${cls.id}`}
                                className="input"
                                placeholder="e.g., Computer Science A"
                                value={cls.name}
                                onChange={(e) =>
                                  handleClassNameChange(cls.id, e.target.value)
                                }
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card-footer">
                  <button
                    onClick={handleAddSemester}
                    disabled={isLoading}
                    style={{ flex: "0 0 auto" }}
                    className="button primary-button"
                  >
                    Add Semester
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {batches.length > 0 && (
        <div className="batches-list-container">
          <h2 className="section-title" style={{ textAlign: "left" }}>
            Current Batches
          </h2>
          <div className="batches-grid">
            {batches.map((batch) => (
              <div
                key={batch.batchName}
                className="batch-card"
                onClick={() => handleBatchCardClick(batch)}
                style={{ cursor: "pointer" }}
              >
                <div className="batch-card-header">
                  <h3 className="batch-title">{batch.batchName}</h3>
                </div>
                <div className="batch-card-content">
                  <p>
                    <strong>Duration:</strong> {formatDate(batch.batchStart)} -{" "}
                    {formatDate(batch.batchEnd)}
                  </p>

                  {batch.semesters && batch.semesters.length > 0 ? (
                    <div className="semester-list">
                      <h4>Semesters:</h4>
                      <ul>
                        {batch.semesters.map((semester) => (
                          <li
                            key={semester.semesterNumber}
                            className="semester-item"
                          >
                            <span className="semester-number">
                              Semester {semester.semesterNumber}
                            </span>
                            <span className="semester-dates">
                              {formatDate(semester.startDate)} -{" "}
                              {formatDate(semester.endDate)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="no-semesters">No semesters added yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PassStudents Modal */}
      <PassStudents
        isOpen={isPassStudentsModalOpen}
        onClose={handleClosePassStudentsModal}
      />

      {/* Batch Overview Modal */}
      <BatchOverviewModal
        isOpen={isBatchOverviewModalOpen}
        onClose={handleCloseBatchOverviewModal}
        batch={selectedBatchForOverview}
      />
    </div>
  );
};

export default ManageBatches;
