import React, { useState } from "react";
import "./AddFacultyModal.css";

const AddFacultyModal = ({ onClose, onSuccess }) => {
  const [facultyData, setFacultyData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacultyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const facultyDetails = {
      ...facultyData,
      role: "Faculty",
    };

    try {
      console.log(
        "Sending request to:",
        "http://localhost:5001/api/auth/addFaculty"
      );
      console.log("Request body:", facultyDetails);

      const response = await fetch(
        "http://localhost:5001/api/faculties/addFaculty",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(facultyDetails),
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        console.log("Faculty added:", data);
        onSuccess();
        onClose();
      } else {
        console.error("Error response:", data);
        alert(data.message || "Failed to add faculty");
      }
    } catch (error) {
      console.error("Error details:", error);
      alert("Failed to add faculty. Try again.");
    }
  };

  return (
    <div className="modal-overlay-faculty">
      <div className="modal-content-faculty">
        <h2>Add Faculty</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={facultyData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={facultyData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={facultyData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="submit-btn-add-faculty">
              Add Faculty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFacultyModal;
