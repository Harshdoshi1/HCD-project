import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Edit2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Search,
  Star,
  BookCopy,
  Loader2,
} from "lucide-react";
import "./StudentGrades.css";

const StudentGrades = () => {
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [editingGrades, setEditingGrades] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentsData, setStudentsData] = useState([]);
  const [ratings, setRatings] = useState({});
  const [error, setError] = useState(null);
  const [gradeUpdating, setGradeUpdating] = useState(false);
  const [componentMarks, setComponentMarks] = useState(null);
  const [activeComponents, setActiveComponents] = useState([]);
  const [subComponents, setSubComponents] = useState([]);
  const [componentStructure, setComponentStructure] = useState({});

  // Function to validate grade value
  const validateGrade = (value, component) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return 0;
    if (numValue < 0) return 0;

    // Check if we have component marks and limit the value to the maximum allowed
    if (componentMarks && component) {
      const maxValue = componentMarks[component.toLowerCase()] || 100;
      if (numValue > maxValue) return maxValue;
    } else if (numValue > 100) {
      return 100;
    }

    return numValue;
  };

  // Handle grade input change
  const handleGradeChange = async (studentId, component, value) => {
    const validatedValue = validateGrade(value, component);

    setStudentsData((prevData) =>
      prevData.map((student) =>
        student.id === studentId
          ? {
              ...student,
              grades: {
                ...student.grades,
                [component.toLowerCase()]: validatedValue,
              },
            }
          : student
      )
    );
  };

  // Function to fetch component marks and sub-components by subject code
  const fetchComponentMarks = async (subjectCode) => {
    if (!subjectCode) return;

    try {
      console.log("Fetching components for subject:", subjectCode);

      const response = await fetch(
        `http://localhost:5001/api/subjects/getSubjectComponentsWithSubjectCode/${subjectCode}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch subject components"
        );
      }

      const data = await response.json();
      console.log("Subject components data:", data);

      // Extract component marks from the response
      const componentMarksData = data.marks || {};
      setComponentMarks({
        ese: componentMarksData.ese || 0,
        cse: componentMarksData.cse || 0,
        ia: componentMarksData.ia || 0,
        tw: componentMarksData.tw || 0,
        viva: componentMarksData.viva || 0,
      });

      // Set sub-components data
      const subComponentsData = data.subComponents || [];
      setSubComponents(subComponentsData);
      console.log("Sub-components:", subComponentsData);

      // Extract component weightage data to determine enabled components
      const componentWeightageData = data.weightage || {};
      console.log("Component weightage data:", componentWeightageData);

      // Build component structure with sub-components based on weightage (not marks)
      const structure = {
        CA: { 
          enabled: (componentWeightageData.ca || componentWeightageData.cse || 0) > 0, 
          totalMarks: componentMarksData.cse || 100, 
          weightage: componentWeightageData.ca || componentWeightageData.cse || 0,
          subComponents: [] 
        },
        ESE: { 
          enabled: (componentWeightageData.ese || 0) > 0, 
          totalMarks: componentMarksData.ese || 100, 
          weightage: componentWeightageData.ese || 0,
          subComponents: [] 
        },
        IA: { 
          enabled: (componentWeightageData.ia || 0) > 0, 
          totalMarks: componentMarksData.ia || 100, 
          weightage: componentWeightageData.ia || 0,
          subComponents: [] 
        },
        TW: { 
          enabled: (componentWeightageData.tw || 0) > 0, 
          totalMarks: componentMarksData.tw || 100, 
          weightage: componentWeightageData.tw || 0,
          subComponents: [] 
        },
        VIVA: { 
          enabled: (componentWeightageData.viva || 0) > 0, 
          totalMarks: componentMarksData.viva || 100, 
          weightage: componentWeightageData.viva || 0,
          subComponents: [] 
        }
      };

      console.log("Built component structure:", structure);

      // Group sub-components by component type
      subComponentsData.forEach(subComp => {
        console.log("Processing sub-component:", subComp);
        const componentType = subComp.componentType?.toUpperCase();
        
        // Map component types correctly
        let mappedType = componentType;
        if (componentType === 'CSE' || componentType === 'CA') {
          mappedType = 'CA';
        }
        
        if (structure[mappedType]) {
          structure[mappedType].subComponents.push({
            id: subComp.id,
            name: subComp.subComponentName,
            totalMarks: subComp.totalMarks,
            weightage: subComp.weightage
          });
          console.log(`Added sub-component ${subComp.subComponentName} to ${mappedType}`);
        } else {
          console.warn(`Component type ${mappedType} not found in structure for sub-component:`, subComp);
        }
      });

      // Apply fallback logic: if a component has sub-components, enable it regardless of weightage
      Object.keys(structure).forEach(compType => {
        if (!structure[compType].enabled && structure[compType].subComponents.length > 0) {
          console.log(`Enabling ${compType} due to existing sub-components`);
          structure[compType].enabled = true;
          // Set a default total marks if not set
          if (structure[compType].totalMarks === 0 || structure[compType].totalMarks === 100) {
            structure[compType].totalMarks = structure[compType].subComponents.reduce((sum, sub) => sum + (sub.totalMarks || 0), 0);
          }
        }
      });

      setComponentStructure(structure);

      // Determine which components are active
      const components = [];
      Object.keys(structure).forEach(compType => {
        if (structure[compType].enabled) {
          components.push(compType === 'CA' ? 'CSE' : compType);
        }
      });

      console.log("Final component structure after fallback:", structure);

      setActiveComponents(components);
      console.log("Active components:", components);
      console.log("Component structure:", structure);
    } catch (error) {
      console.error("Error fetching subject components:", error);
      setError("Failed to fetch subject components: " + error.message);
    }
  };

  // Handle sub-component grade change
  const handleSubComponentGradeChange = (studentId, componentType, subComponentId, value) => {
    setStudentsData((prevData) =>
      prevData.map((student) => {
        if (student.id === studentId) {
          const updatedGrades = { ...student.grades };
          if (!updatedGrades.subComponents) {
            updatedGrades.subComponents = {};
          }
          if (!updatedGrades.subComponents[componentType]) {
            updatedGrades.subComponents[componentType] = {};
          }
          updatedGrades.subComponents[componentType][subComponentId] = parseFloat(value) || 0;
          return { ...student, grades: updatedGrades };
        }
        return student;
      })
    );
  };

  // Handle grade submission with sub-components
  const handleGradeSubmit = async (studentId) => {
    if (!selectedSubject?.subCode || !studentId) {
      setError("Please select a subject and student");
      return;
    }

    setGradeUpdating(true);
    try {
      const student = studentsData.find((s) => s.id === studentId);
      if (!student) throw new Error("Student not found");

      const faculty = JSON.parse(localStorage.getItem("user"));
      if (!faculty) throw new Error("Faculty information not found");

      // Prepare marks data with sub-components
      const marksData = {};
      
      // Process each component type
      Object.keys(componentStructure).forEach(componentType => {
        const component = componentStructure[componentType];
        if (component.enabled) {
          if (component.subComponents && component.subComponents.length > 0) {
            // Has sub-components
            marksData[componentType] = {
              subComponents: component.subComponents.map(subComp => ({
                subComponentId: subComp.id,
                name: subComp.name,
                marksObtained: student.grades?.subComponents?.[componentType]?.[subComp.id] || 0,
                totalMarks: subComp.totalMarks
              }))
            };
          } else {
            // No sub-components, use main component marks
            const componentKey = componentType === 'CA' ? 'cse' : componentType.toLowerCase();
            marksData[componentType] = {
              marksObtained: parseFloat(student.grades?.[componentKey]) || 0,
              totalMarks: component.totalMarks
            };
          }
        }
      });

      console.log("Submitting grades with sub-components:", {
        studentId,
        subjectId: selectedSubject.subCode,
        marksData,
      });

      const response = await fetch(
        `http://localhost:5001/api/student-marks/update/${studentId}/${selectedSubject.subCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            facultyId: faculty.id,
            marks: marksData,
            semesterId: selectedSemester.id,
            batchId: selectedBatch.id,
            enrollmentSemester: selectedSemester.semesterNumber,
            facultyResponse: student.response || "",
            facultyRating: ratings[studentId] || 0,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Failed to update grades"
        );
      }

      const data = await response.json();
      console.log("Grades updated successfully:", data);

      // Instead of refreshing all student data, just update the current student in the state
      setStudentsData((prevData) =>
        prevData.map((s) => {
          if (s.id === studentId) {
            // Mark this student as graded
            return {
              ...s,
              isGraded: true,
            };
          }
          return s;
        })
      );

      // Update the UI to show succes     setEditingGrades(null);
      setError(null);
    } catch (error) {
      console.error("Error updating grades:", error);
      setError("Failed to update grades: " + error.message);
    } finally {
      setGradeUpdating(false);
    }
  };

  // Function to fetch student data
  const fetchStudentData = async (batchId, subjectCode) => {
    if (!batchId || !subjectCode || !selectedSemester) return;

    setLoading(true);
    try {
      console.log(
        "Fetching student data for batch:",
        batchId,
        "subject:",
        subjectCode,
        "and semester:",
        selectedSemester.semesterNumber
      );
      // Use the API endpoint that includes semester filtering
      //fetch semesterID from semesterNumber
      const semesterID = selectedSemester.id;
      const response = await fetch(
        `http://localhost:5001/api/marks/students/${batchId}/${selectedSemester.semesterNumber}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Fetched student data:", data);

      // Transform the data to ensure proper structure
      const transformedData = data.map((student) => {
        // Find existing grades for this student and subject
        const existingGrades = student.Gettedmarks?.find(
          (mark) => mark.subjectId === subjectCode
        );

        console.log(
          `Student ${student.id} existing grades for ${subjectCode}:`,
          existingGrades
        );

        return {
          ...student,
          grades: {
            ese: existingGrades?.ese ?? 0,
            cse: existingGrades?.cse ?? 0,
            ia: existingGrades?.ia ?? 0,
            tw: existingGrades?.tw ?? 0,
            viva: existingGrades?.viva ?? 0,
          },
          response: existingGrades?.facultyResponse || "",
          isGraded: !!existingGrades, // Flag to indicate if student has been graded
        };
      });

      setStudentsData(transformedData);

      // Initialize ratings from fetched data
      const initialRatings = {};
      data.forEach((student) => {
        const existingGrades = student.Gettedmarks?.find(
          (mark) => mark.subjectId === subjectCode
        );
        initialRatings[student.id] = existingGrades?.facultyRating || 0;
      });
      setRatings(initialRatings);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to fetch student data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Custom grade input component
  const GradeInput = ({ value, onChange, disabled, component }) => {
    const [localValue, setLocalValue] = useState(value || "");
    const maxValue = componentMarks
      ? componentMarks[component.toLowerCase()] || 100
      : 100;

    const handleChange = (e) => {
      const newValue = e.target.value;
      // Allow empty string or numbers only
      if (newValue === "" || /^\d{0,3}$/.test(newValue)) {
        setLocalValue(newValue);
        if (newValue === "") {
          onChange("0");
        } else {
          onChange(newValue);
        }
      }
    };

    const handleBlur = () => {
      const validatedValue = validateGrade(localValue, component);
      setLocalValue(validatedValue.toString());
      onChange(validatedValue.toString());
    };

    // Update local value when prop value changes
    useEffect(() => {
      setLocalValue(value || "");
    }, [value]);

    return (
      <input
        type="text"
        pattern="\\d*"
        min="0"
        max={maxValue}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className="grade-input-sgp"
      />
    );
  };

  // Fetch batches on component mount
  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      try {
        console.log("Fetching all batches...");
        const response = await fetch(
          "http://localhost:5001/api/batches/getAllBatches"
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Error: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        console.log("Fetched batches:", data);

        setBatches(
          data.map((batch) => ({
            id: batch.id,
            batchName: batch.batchName,
          }))
        );
      } catch (error) {
        console.error("Error fetching batches:", error);
        setError("Failed to fetch batches: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  // Fetch semesters when batch changes
  useEffect(() => {
    if (!selectedBatch) return;
    const fetchSemesters = async () => {
      setLoading(true);
      try {
        console.log("Fetching semesters for batch:", selectedBatch.batchName);
        const response = await fetch(
          `http://localhost:5001/api/semesters/getSemestersByBatch/${selectedBatch.batchName}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Error: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        console.log("Fetched semesters:", data);

        setSemesters(
          data.map((semester) => ({
            id: semester.id,
            semesterNumber: semester.semesterNumber,
          }))
        );
      } catch (error) {
        console.error("Error fetching semesters:", error);
        setError("Failed to fetch semesters: " + error.message);
        setSemesters([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSemesters();
  }, [selectedBatch]);

  // Fetch subjects when semester changes
  useEffect(() => {
    if (!selectedBatch || !selectedSemester) return;
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        // Get faculty information from localStorage
        const faculty = JSON.parse(localStorage.getItem("user"));
        if (!faculty || !faculty.name) {
          throw new Error("Faculty information not found");
        }

        // First, get the batch ID from batch name
        const batchIdResponse = await fetch(
          `http://localhost:5001/api/facultyside/marks/getBatchId/${selectedBatch.batchName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!batchIdResponse.ok) throw new Error("Failed to fetch batch ID");
        const batchIdData = await batchIdResponse.json();
        const batchId = batchIdData.batchId;

        console.log("Fetching subjects with params:", {
          batchId: batchId,
          semesterId: selectedSemester.semesterNumber,
          facultyName: faculty.name,
        });

        // Use the new API endpoint that filters by faculty name with the batch ID
        const response = await fetch(
          `http://localhost:5001/api/facultyside/marks/getsubjectByBatchAndSemester/${batchId}/${selectedSemester.semesterNumber}/${faculty.name}`
        );

        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data = await response.json();
        console.log("Faculty Subject API Response:", data);

        // Process each subject to get its name
        const subjectsWithNames = await Promise.all(
          data.map(async (subject) => {
            try {
              // Get subject name from subject code
              const subjectNameResponse = await fetch(
                `http://localhost:5001/api/facultyside/marks/getSubjectName/${subject.subjectCode}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              if (subjectNameResponse.ok) {
                const subjectNameData = await subjectNameResponse.json();
                return {
                  id: subject.id || subject.subjectCode,
                  subjectName: subjectNameData.subjectName,
                  subCode: subject.subjectCode,
                };
              } else {
                // If we can't get the name, just use the code as the name
                return {
                  id: subject.id || subject.subjectCode,
                  subjectName: subject.subjectCode,
                  subCode: subject.subjectCode,
                };
              }
            } catch (error) {
              console.error(
                `Error fetching name for subject ${subject.subjectCode}:`,
                error
              );
              return {
                id: subject.id || subject.subjectCode,
                subjectName: subject.subjectCode, // Fallback to code if name fetch fails
                subCode: subject.subjectCode,
              };
            }
          })
        );

        console.log("Subjects with names:", subjectsWithNames);
        setSubjects(subjectsWithNames);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setError("Failed to fetch subjects: " + error.message);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [selectedBatch, selectedSemester]);

  // Function to fetch existing student marks
  const fetchExistingMarks = async (batchId, subjectCode, semesterId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/student-marks/grading/${batchId}/${selectedSemester.semesterNumber}/${subjectCode}`
      );
      
      if (response.ok) {
        const marksData = await response.json();
        console.log("Existing marks data:", marksData);
        
        // Update students data with existing marks
        setStudentsData(prevStudents => 
          prevStudents.map(student => {
            const existingMarks = marksData.students?.find(s => s.id === student.id);
            if (existingMarks && existingMarks.studentMarks) {
              const grades = { subComponents: {} };
              
              existingMarks.studentMarks.forEach(mark => {
                if (mark.isSubComponent && mark.subComponentId) {
                  if (!grades.subComponents[mark.componentType]) {
                    grades.subComponents[mark.componentType] = {};
                  }
                  grades.subComponents[mark.componentType][mark.subComponentId] = mark.marksObtained;
                } else {
                  grades[mark.componentType.toLowerCase()] = mark.marksObtained;
                }
              });
              
              return {
                ...student,
                grades,
                response: existingMarks.studentMarks[0]?.facultyResponse || "",
                isGraded: existingMarks.studentMarks.length > 0
              };
            }
            return student;
          })
        );
      }
    } catch (error) {
      console.error("Error fetching existing marks:", error);
    }
  };

  // Fetch students when subject changes
  useEffect(() => {
    if (!selectedBatch || !selectedSubject || !selectedSemester) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Get batch ID first
        const batchIdResponse = await fetch(
          `http://localhost:5001/api/facultyside/marks/getBatchId/${selectedBatch.batchName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!batchIdResponse.ok) throw new Error("Failed to fetch batch ID");
        const batchIdData = await batchIdResponse.json();
        const batchId = batchIdData.batchId;

        console.log(
          "Fetching students for batch ID:",
          batchId,
          "and semester:",
          selectedSemester.semesterNumber
        );
        // const semesterID = selectedSemester.id;
        // console.log(
        //   "Fetching students for batch ID:",
        //   batchId,
        //   "and semester:",
        //   semesterID
        // );
        // Use the new API endpoint that filters by both batch and semester
        const response = await fetch(
          `http://localhost:5001/api/marks/students/${batchId}/${selectedSemester.semesterNumber}`
        );
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        console.log("Fetched students:", data);

        const studentsWithGrades = data.map((student) => ({
          id: student.id,
          name: student.name,
          enrollmentNo: student.enrollmentNumber,
          grades: student.Gettedmarks?.[0] || {
            ESE: 0,
            TW: 0,
            CSE: 0,
            IA: 0,
            Viva: 0,
          },
          response: "",
        }));

        console.log("Students with grades:", studentsWithGrades);
        setStudentsData(studentsWithGrades);

        // Initialize ratings
        const initialRatings = {};
        studentsWithGrades.forEach((student) => {
          initialRatings[student.id] = 0;
        });
        setRatings(initialRatings);

        // Fetch component marks after setting students data
        if (selectedSubject?.subCode) {
          await fetchComponentMarks(selectedSubject.subCode);
          // Fetch existing marks after component structure is loaded
          await fetchExistingMarks(batchId, selectedSubject.subCode, selectedSemester.id);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to fetch students: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedBatch, selectedSubject, selectedSemester]);

  // Handle response submission
  const handleSubmitResponse = async (studentId) => {
    try {
      const student = studentsData.find((s) => s.id === studentId);
      if (!student) throw new Error("Student not found");

      const response = await fetch(
        `http://localhost:5001/api/marks/update/${studentId}/${selectedSubject.subCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            response: student.response,
            facultyId: JSON.parse(localStorage.getItem("user")).id,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit response");

      const data = await response.json();
      console.log("Response submitted successfully:", data);

      // Update local state
      setStudentsData((students) =>
        students.map((s) =>
          s.id === studentId ? { ...s, response: data.data.facultyResponse } : s
        )
      );

      alert("Response submitted successfully!");
    } catch (error) {
      console.error("Error submitting response:", error);
      setError("Failed to submit response: " + error.message);
    }
  };

  const handleBatchChange = (e) => {
    const batchName = e.target.value;
    if (!batchName) {
      setSelectedBatch(null);
      return;
    }
    const batch = batches.find((b) => b.batchName === batchName);
    console.log("Selected batch:", batch);
    setSelectedBatch(batch);
    setSelectedSemester(null);
    setSelectedSubject(null);
  };

  const handleSemesterChange = (e) => {
    const semesterNumber = parseInt(e.target.value);
    if (isNaN(semesterNumber)) {
      setSelectedSemester(null);
      return;
    }
    const semester = semesters.find((s) => s.semesterNumber === semesterNumber);
    console.log("Selected semester:", semester);
    setSelectedSemester(semester);
    setSelectedSubject(null);
  };

  const handleSubjectChange = (e) => {
    console.log("Selected subject value:", e.target.value); // Debug log
    console.log("Available subjects:", subjects); // Debug log

    // Find the subject by subCode
    const subject = subjects.find((s) => s.subCode === e.target.value);
    console.log("Found subject:", subject); // Debug log

    if (subject) {
      setSelectedSubject(subject);

      // Get batch ID and then fetch student data
      const getBatchIdAndFetchStudents = async () => {
        try {
          // Get batch ID from batch name
          const batchIdResponse = await fetch(
            `http://localhost:5001/api/facultyside/marks/getBatchId/${selectedBatch.batchName}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!batchIdResponse.ok) throw new Error("Failed to fetch batch ID");
          const batchIdData = await batchIdResponse.json();
          const batchId = batchIdData.batchId;

          console.log("fetcifngjsfuar : batch id", batchId);

          const getCurrentSemester = async (batchId) => {
            try {
              const response = await fetch(
                `http://localhost:5001/api/semesters/getSemesterNumberById/${batchId}`
              );

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              const currentSemester = data.currentSemester;
              console.log("Current Semester:", currentSemester);
              return currentSemester;
            } catch (error) {
              console.error("Error fetching current semester:", error);
            }
          };

          const currentSemester = await getCurrentSemester(batchId);

          fetchStudentData(
            batchIdData.batchId,
            subject.subCode,
            currentSemester
          );
        } catch (error) {
          console.error("Error getting batch ID:", error);
          setError("Failed to get batch ID: " + error.message);
        }
      };

      getBatchIdAndFetchStudents();
    } else {
      console.error("Subject not found for code:", e.target.value);
    }
  };

  const handleResponseChange = (studentId, response) => {
    setStudentsData((students) =>
      students.map((student) =>
        student.id === studentId ? { ...student, response } : student
      )
    );
  };

  const handleRatingChange = (studentId, rating) => {
    setRatings((prev) => ({
      ...prev,
      [studentId]: rating,
    }));
  };

  const toggleGradeEdit = (studentId) => {
    setEditingGrades(editingGrades === studentId ? null : studentId);
  };

  const filteredStudents = studentsData.filter((student) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchTerm) ||
      student.enrollmentNo.toLowerCase().includes(searchTerm)
    );
  });

  const renderRatingStars = (studentId) => {
    const currentRating = ratings[studentId] || 0;
    return (
      <div className="rating-stars">
        {[...Array(10)].map((_, index) => (
          <button
            key={index}
            type="button"
            className={index < currentRating ? "filled" : ""}
            onClick={() => handleRatingChange(studentId, index + 1)}
          >
            <Star size={20} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="grades-container-sgp">
      <div className="grades-header-sgp">
        <h1>Faculty Grade Management</h1>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <div className="filter-section-sgp">
        <div className="filter-group-sgp">
          <label>Batch</label>
          <select
            value={selectedBatch?.batchName || ""}
            onChange={handleBatchChange}
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.batchName}>
                {batch.batchName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group-sgp">
          <label>Semester</label>
          <select
            value={selectedSemester?.semesterNumber || ""}
            onChange={handleSemesterChange}
            disabled={!selectedBatch}
          >
            <option value="">Select Semester</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.semesterNumber}>
                Semester {semester.semesterNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group-sgp">
          <label>Subject</label>
          <select
            value={selectedSubject?.subCode || ""}
            onChange={handleSubjectChange}
            disabled={!selectedSemester}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option
                key={subject.id || subject.subCode}
                value={subject.subCode}
              >
                {subject.subjectName} ({subject.subCode})
              </option>
            ))}
          </select>
        </div>

        <div className="search-container-sgp">
          <Search className="search-sgp" size={20} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <Loader2 className="loading-spinner" size={40} />
          <span className="loading-text">Loading...</span>
        </div>
      ) : (
        <>
          {filteredStudents.length > 0 ? (
            <div className="student-count-sgp">
              {filteredStudents.length} Student
              {filteredStudents.length !== 1 ? "s" : ""} Found
              <span className="graded-count">
                {filteredStudents.filter((s) => s.isGraded).length} Graded /{" "}
                {filteredStudents.length} Total
              </span>
            </div>
          ) : (
            <div className="no-results">
              <BookCopy size={40} />
              <p>No students found</p>
            </div>
          )}

          <div className="students-list">
            {filteredStudents.map((student) => (
              <div key={student.id} className="student-card">
                <div className="student-basic-info-sgp">
                  <div className="student-left-section">
                    <img
                      src={
                        student.image ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                      }
                      alt={student.name}
                      className="student-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
                      }}
                    />
                    <div className="student-info-container-sgp">
                      <div className="student-details-student-grades">
                        <span className="student-name">{student.name}</span>
                        <span className="enrollment-number">
                          {student.enrollmentNo}
                        </span>
                        {student.isGraded && (
                          <span className="graded-badge">Graded</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="student-grade-components">
                    {Object.keys(componentStructure).length > 0 ? (
                      <div className="grade-components-mini">
                        {Object.entries(componentStructure).map(([componentType, component]) => {
                          if (!component.enabled) return null;
                          
                          return (
                            <div key={componentType} className="component-section">
                              <div className="component-header">
                                <strong>{componentType === 'CA' ? 'CSE' : componentType}</strong>
                                <span className="total-marks">/{component.totalMarks}</span>
                              </div>
                              
                              {component.subComponents && component.subComponents.length > 0 ? (
                                <div className="sub-components">
                                  {component.subComponents.map((subComp) => (
                                    <div key={subComp.id} className="sub-component-input">
                                      <label>{subComp.name}:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max={subComp.totalMarks}
                                        value={
                                          student.grades?.subComponents?.[componentType]?.[subComp.id] || 0
                                        }
                                        onChange={(e) =>
                                          editingGrades === student.id &&
                                          handleSubComponentGradeChange(
                                            student.id,
                                            componentType,
                                            subComp.id,
                                            e.target.value
                                          )
                                        }
                                        disabled={editingGrades !== student.id}
                                        className={`sub-input ${
                                          student.isGraded ? "graded" : ""
                                        }`}
                                      />
                                      <span className="sub-max">/{subComp.totalMarks}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="main-component-input">
                                  <input
                                    type="number"
                                    min="0"
                                    max={component.totalMarks}
                                    value={
                                      student.grades?.[componentType === 'CA' ? 'cse' : componentType.toLowerCase()] || 0
                                    }
                                    onChange={(e) =>
                                      editingGrades === student.id &&
                                      handleGradeChange(
                                        student.id,
                                        componentType === 'CA' ? 'CSE' : componentType,
                                        e.target.value
                                      )
                                    }
                                    disabled={editingGrades !== student.id}
                                    className={`main-input ${
                                      student.isGraded ? "graded" : ""
                                    }`}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="no-components-mini">
                        No grade components defined
                      </div>
                    )}
                  </div>

                  <div className="student-actions-sgp">
                    <button
                      className={`edit-grades-button ${
                        editingGrades === student.id ? "active" : ""
                      }`}
                      onClick={() =>
                        editingGrades === student.id
                          ? setEditingGrades(null)
                          : setEditingGrades(student.id)
                      }
                    >
                      <Edit2 size={16} />
                      {editingGrades === student.id
                        ? "Cancel Edit"
                        : "Edit Marks"}
                    </button>
                    <button
                      className={`response-button ${
                        expandedStudent === student.id ? "active" : ""
                      }`}
                      onClick={() =>
                        setExpandedStudent(
                          expandedStudent === student.id ? null : student.id
                        )
                      }
                    >
                      <MessageCircle size={16} />
                      Response
                      {expandedStudent === student.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {editingGrades === student.id && (
                  <div className="save-grades-container">
                    <button
                      className="save-grades-button"
                      onClick={() => handleGradeSubmit(student.id)}
                      disabled={gradeUpdating}
                    >
                      {gradeUpdating ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Grades
                    </button>
                  </div>
                )}

                {expandedStudent === student.id && (
                  <div className="grade-details-sgp">
                    <div className="faculty-response">
                      <h3>Faculty Response</h3>
                      <textarea
                        placeholder="Add your response..."
                        value={student.response || ""}
                        onChange={(e) =>
                          handleResponseChange(student.id, e.target.value)
                        }
                        className={
                          editingGrades !== student.id ? "readonly" : ""
                        }
                        disabled={editingGrades !== student.id}
                      />
                      <div className="rating-container">
                        <h4>Student Rating</h4>
                        {renderRatingStars(student.id)}
                      </div>
                      <button
                        className="submit-button"
                        onClick={() => handleSubmitResponse(student.id)}
                        disabled={editingGrades !== student.id}
                      >
                        Submit Response
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentGrades;
