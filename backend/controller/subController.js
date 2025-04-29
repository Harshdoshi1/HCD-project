const express = require("express");
const router = express.Router();
const {
  User,
  Faculty,
  Batch,
  Semester,
  Subject,
  UniqueSubDegree,
  UniqueSubDiploma,
  ComponentWeightage,
  ComponentMarks,
} = require("../models");

// Add Subject
const addSubject = async (req, res) => {
  try {
    const { name, code, courseType, credits, subjectType, semester } = req.body;

    if (courseType === "degree") {
      const { data, error } = await UniqueSubDegree.create({
        sub_code: code,
        sub_name: name,
        sub_credit: credits,
        sub_level: subjectType,
        semester: semester,
        program: "Degree",
      });
      if (error) throw error;
    } else if (courseType === "diploma") {
      const { data, error } = await UniqueSubDiploma.create({
        sub_code: code,
        sub_name: name,
        sub_credit: credits,
        sub_level: subjectType,
      });
      if (error) throw error;
    } else {
      return res.status(400).json({ error: "Invalid course type" });
    }

    res.status(201).json({ message: "Subject added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error adding subject", details: error.message });
  }
};

// Get subject with components
const getSubjectWithComponents = async (req, res) => {
  try {
    const { subjectCode } = req.params;

    const { data: subject, error: subjectError } =
      await UniqueSubDegree.findOne({ sub_code: subjectCode });
    if (subjectError) throw subjectError;
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const { data: weightage, error: weightageError } =
      await ComponentWeightage.findOne({ subjectId: subjectCode });
    if (weightageError) throw weightageError;

    const { data: marks, error: marksError } = await ComponentMarks.findOne({
      subjectId: subjectCode,
    });
    if (marksError) throw marksError;

    res.status(200).json({
      ...subject,
      weightage,
      marks,
    });
  } catch (error) {
    console.error("Error getting subject with components:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Subject by Code and Course Type
const getSubjectByCode = async (req, res) => {
  try {
    const { code, courseType } = req.params;
    let subject;

    if (courseType === "degree") {
      const { data, error } = await UniqueSubDegree.findOne({ sub_code: code });
      if (error) throw error;
      subject = data;
    } else if (courseType === "diploma") {
      const { data, error } = await UniqueSubDiploma.findOne({
        sub_code: code,
      });
      if (error) throw error;
      subject = data;
    } else {
      return res.status(400).json({ error: "Invalid course type" });
    }

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching subject", details: error.message });
  }
};

// Add Subject (Check if already assigned to batch & semester)
const assignSubject = async (req, res) => {
  try {
    console.log("Received Request Body:", req.body);

    const { subjects } = req.body;
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty subjects array" });
    }

    for (const subject of subjects) {
      const { subjectName, semesterNumber, batchName } = subject;

      if (!subjectName || !semesterNumber || !batchName) {
        return res.status(400).json({
          message: "Missing subjectName, semesterNumber, or batchName",
        });
      }

      const { data: batch, error: batchError } = await Batch.findOne({
        batchName,
      });
      if (batchError || !batch) {
        return res
          .status(404)
          .json({ message: `Batch '${batchName}' not found` });
      }

      const { data: semester, error: semesterError } = await Semester.findOne({
        semesterNumber,
        batchId: batch.id,
      });
      if (semesterError || !semester) {
        return res.status(404).json({
          message: `Semester '${semesterNumber}' not found for batch '${batchName}'`,
        });
      }

      const { data: existingSubject, error: subjectError } =
        await Subject.findOne({
          subjectName,
          semesterId: semester.id,
          batchId: batch.id,
        });
      if (subjectError) throw subjectError;

      if (existingSubject) {
        return res.status(400).json({
          message: `Subject '${subjectName}' already assigned to this batch and semester`,
        });
      }

      const { error: createError } = await Subject.create({
        subjectName,
        semesterId: semester.id,
        batchId: batch.id,
      });
      if (createError) throw createError;
    }

    res.status(201).json({ message: "Subjects assigned successfully" });
  } catch (error) {
    console.error("Error assigning subjects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Subject
const deleteSubject = async (req, res) => {
  try {
    const { code, courseType } = req.params;
    let error;

    if (courseType === "degree") {
      const { error: deleteError } = await UniqueSubDegree.delete({
        sub_code: code,
      });
      error = deleteError;
    } else if (courseType === "diploma") {
      const { error: deleteError } = await UniqueSubDiploma.delete({
        sub_code: code,
      });
      error = deleteError;
    } else {
      return res.status(400).json({ error: "Invalid course type" });
    }

    if (error) throw error;

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting subject", details: error.message });
  }
};

// Function to add a unique subject for Degree
const addUniqueSubDegree = async (req, res) => {
  try {
    const { sub_code, sub_level, sub_name, sub_credit } = req.body;

    if (!sub_code || !sub_level || !sub_name || !sub_credit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { data: subject, error } = await UniqueSubDegree.create({
      sub_code,
      sub_level,
      sub_name,
      sub_credit,
    });
    if (error) throw error;

    res
      .status(201)
      .json({ message: "Degree subject added successfully", subject });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding degree subject", error: error.message });
  }
};

// Function to add a unique subject for Diploma
const addUniqueSubDiploma = async (req, res) => {
  try {
    const { sub_code, sub_level, sub_name, sub_credit } = req.body;

    if (!sub_code || !sub_level || !sub_name || !sub_credit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { data: subject, error } = await UniqueSubDiploma.create({
      sub_code,
      sub_level,
      sub_name,
      sub_credit,
    });
    if (error) throw error;

    res
      .status(201)
      .json({ message: "Diploma subject added successfully", subject });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding diploma subject", error: error.message });
  }
};

const getDropdownData = async (req, res) => {
  try {
    const { data: subjects, error } = await UniqueSubDegree.findAll();
    if (error) throw error;

    const batches = [...new Set(subjects.map((s) => s.batch))];
    const semesters = [...new Set(subjects.map((s) => s.semester))];
    const programs = [...new Set(subjects.map((s) => s.program))];

    return res.status(200).json({ subjects, batches, semesters, programs });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const { data: subjects, error } = await Subject.findAll();
    if (error) throw error;
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getSubjectsByBatchAndSemester = async (req, res) => {
  try {
    const { batchName, semesterNumber } = req.params;

    // Find batch ID from batchName
    const { data: batch, error: batchError } = await Batch.findOne({
      batchName,
    });
    if (batchError || !batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Find semester where batchId matches
    const { data: semester, error: semesterError } = await Semester.findOne({
      semesterNumber,
      batchId: batch.id,
    });
    if (semesterError || !semester) {
      return res
        .status(404)
        .json({ message: "Semester not found for this batch" });
    }

    // Fetch subjects for the given batch and semester
    const { data: subjects, error: subjectsError } = await Subject.findAll({
      semesterId: semester.id,
      batchId: batch.id,
    });
    if (subjectsError) throw subjectsError;

    if (!subjects.length) {
      return res
        .status(404)
        .json({ message: "No subjects found for this semester and batch" });
    }

    // Get subject names from subjects
    const subjectNames = subjects.map((s) => s.subjectName);

    // Fetch sub_code and sub_level from UniqueSubDegree using sub_name
    const { data: uniqueSubs, error: uniqueSubsError } =
      await UniqueSubDegree.findAll({
        sub_name: subjectNames,
      });
    if (uniqueSubsError) throw uniqueSubsError;

    res.status(200).json({
      subjects,
      uniqueSubjects: uniqueSubs,
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getSubjectsByBatchSemesterandFaculty = async (req, res) => {
  try {
    const { batchName, semesterNumber, facultyId } = req.body;
    console.log("Received:", batchName, semesterNumber, facultyId);

    if (!batchName || !semesterNumber || !facultyId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find faculty name from Users table using facultyId
    const { data: faculty, error: facultyError } = await User.findOne({
      id: facultyId,
    });
    if (facultyError || !faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    console.log("Faculty Name:", faculty.name);

    // Fetch all subject codes assigned to the faculty from AssignSubjects table
    const { data: assignedSubjects, error: assignedError } =
      await Subject.findAll({
        facultyId,
      });
    if (assignedError) throw assignedError;

    if (!assignedSubjects.length) {
      console.log("No assigned subjects found for this faculty.");
    } else {
      const subjectCodes = assignedSubjects.map((sub) => sub.subjectCode);
      console.log("Assigned Subject Codes:", subjectCodes);
    }

    // Find batch ID from batchName
    const { data: batch, error: batchError } = await Batch.findOne({
      batchName,
    });
    if (batchError || !batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Find semester where batchId matches
    const { data: semester, error: semesterError } = await Semester.findOne({
      semesterNumber,
      batchId: batch.id,
    });
    if (semesterError || !semester) {
      return res
        .status(404)
        .json({ message: "Semester not found for this batch" });
    }

    // Fetch subjects where facultyName matches the fetched faculty's name
    const { data: subjects, error: subjectsError } = await Subject.findAll({
      semesterId: semester.id,
      batchId: batch.id,
      facultyName: faculty.name,
    });
    if (subjectsError) throw subjectsError;

    if (!subjects.length) {
      return res.status(404).json({
        message: "No subjects found for this semester, batch, and faculty",
      });
    }

    // Get subject names from subjects
    const subjectNames = subjects.map((s) => s.subjectName);

    // Fetch sub_code and sub_level from UniqueSubDegree using sub_name
    const { data: uniqueSubs, error: uniqueSubsError } =
      await UniqueSubDegree.findAll({
        sub_name: subjectNames,
      });
    if (uniqueSubsError) throw uniqueSubsError;

    res.status(200).json({
      facultyName: faculty.name,
      assignedSubjects,
      subjects,
      uniqueSubjects: uniqueSubs,
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addSubjectWithComponents = async (req, res) => {
  try {
    const { code, name, credits, type, components } = req.body;

    console.log("Received data:", req.body);

    // Validate input
    if (!code || !name || !credits || !type || !components) {
      return res.status(400).json({
        error: "Missing required fields",
        received: { code, name, credits, type, components },
      });
    }

    // Map component names from frontend to database
    const componentMap = {
      CA: "cse",
      ESE: "ese",
      IA: "ia",
      TW: "tw",
      VIVA: "viva",
    };

    // Create subject
    const { data: subject, error: subjectError } = await UniqueSubDegree.create(
      {
        sub_code: code,
        sub_name: name,
        sub_credit: credits,
        sub_level: type === "central" ? "central" : "department",
      }
    );
    if (subjectError) throw subjectError;

    // Prepare weightage and marks data
    const weightageData = { subjectId: code };
    const marksData = { subjectId: code };

    // Process each component
    Object.entries(components).forEach(([component, data]) => {
      if (data.enabled) {
        const dbField = componentMap[component];
        if (dbField) {
          weightageData[dbField] = data.weightage;
          marksData[dbField] = data.totalMarks;
        }
      }
    });

    // Create weightage
    const { data: weightage, error: weightageError } =
      await ComponentWeightage.create(weightageData);
    if (weightageError) throw weightageError;

    // Create marks
    const { data: marks, error: marksError } = await ComponentMarks.create(
      marksData
    );
    if (marksError) throw marksError;

    res.status(201).json({
      subject,
      weightage,
      marks,
      message: "Subject and components added successfully",
    });
  } catch (error) {
    console.error("Error adding subject with components:", error);
    res.status(500).json({
      error: error.message,
      type: error.name,
      details: error.errors?.map((e) => e.message) || [],
    });
  }
};

const getUniqueSubDegrees = async (req, res) => {
  try {
    const { data: degrees, error } = await UniqueSubDegree.findAll();
    if (error) throw error;
    res.status(200).json(degrees);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getUniqueSubDiplomas = async (req, res) => {
  try {
    const { data: diplomas, error } = await UniqueSubDiploma.findAll();
    if (error) throw error;
    res.status(200).json(diplomas);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getSubjectsByBatchAndSemester,
  addSubject,
  getSubjectWithComponents,
  addSubjectWithComponents,
  getDropdownData,
  getSubjectsByBatchSemesterandFaculty,
  assignSubject,
  getSubjectByCode,
  deleteSubject,
  getSubjects,
  addUniqueSubDegree,
  addUniqueSubDiploma,
  getUniqueSubDegrees,
  getUniqueSubDiplomas,
};
