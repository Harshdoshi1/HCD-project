import React, { useState, useEffect } from "react";
import FacultyCard from "./FacultyCard";
import "./Faculty.css";

const FacultyList = ({ searchTerm, onSelectFaculty }) => {
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/auth/getAllUsers"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch faculty data");
        }
        const data = await response.json();
        setFacultyMembers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  const filteredFaculty = facultyMembers.filter((faculty) => {
    return (
      faculty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading)
    return <div className="loading-state">Loading faculty data...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="faculty-list-container">
      <div className="faculty-grid">
        {filteredFaculty.length > 0 ? (
          filteredFaculty.map((faculty) => (
            <FacultyCard
              key={faculty.id}
              faculty={faculty}
              onClick={() => onSelectFaculty(faculty)}
            />
          ))
        ) : (
          <div className="no-results">
            <p>No faculty members found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyList;
