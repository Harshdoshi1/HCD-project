const express = require("express");
const router = express.Router();
const { Student, Batch } = require("../models");

// Create a new student
const createStudent = async (req, res) => {
  try {
    const { name, email, batchID, enrollment, currentSemester } = req.body;

    // Input validation
    if (!name || !email || !batchID || !enrollment || !currentSemester) {
      console.error("Missing required fields:", {
        name,
        email,
        batchID,
        enrollment,
        currentSemester,
      });
      return res.status(400).json({
        error: "All fields are required",
        received: { name, email, batchID, enrollment, currentSemester },
      });
    }

    // Validate batch ID
    const { data: batch, error: batchError } = await Batch.findOne({
      batchName: batchID,
    });
    if (batchError || !batch) {
      console.error("Batch not found:", batchID);
      return res.status(400).json({
        error: "Batch not found",
        receivedBatchName: batchID,
      });
    }

    console.log("Found batch:", batch);

    // Create student
    const { data: student, error: studentError } = await Student.create({
      name,
      email,
      batchId: batch.id,
      enrollmentNumber: enrollment,
      currnetsemester: currentSemester,
    });

    if (studentError) throw studentError;

    console.log("Created student:", student);
    res.status(201).json(student);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({
      error: error.message,
      type: error.name,
      details: error.errors?.map((e) => e.message) || [],
    });
  }
};

// Create multiple students
const createStudents = async (req, res) => {
  try {
    const students = req.body.students;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: "Invalid or empty students array" });
    }

    // Get unique batch names from input
    const batchNames = [...new Set(students.map((s) => s.batchID))];

    // Fetch batch IDs for provided batch names
    const { data: batches, error: batchError } = await Batch.findAll();
    if (batchError) throw batchError;

    const batchMap = batches.reduce((acc, batch) => {
      acc[batch.batchName] = batch.id;
      return acc;
    }, {});

    // Check if all batch names exist
    const invalidBatches = batchNames.filter((name) => !batchMap[name]);
    if (invalidBatches.length > 0) {
      return res
        .status(400)
        .json({ error: "Invalid batch names", invalidBatches });
    }

    // Prepare student data with correct batch IDs
    const studentData = students.map(
      ({ name, email, batchID, enrollment, currentSemester }) => ({
        name,
        email,
        batchId: batchMap[batchID],
        enrollmentNumber: enrollment,
        currnetsemester: currentSemester,
      })
    );

    // Insert students one by one
    const createdStudents = [];
    for (const student of studentData) {
      const { data, error } = await Student.create(student);
      if (error) throw error;
      createdStudents.push(data);
    }

    res
      .status(201)
      .json({
        message: "Students added successfully",
        students: createdStudents,
      });
  } catch (error) {
    console.error("Error creating students:", error);
    res.status(500).json({
      error: error.message,
      type: error.name,
      details: error.errors?.map((e) => e.message) || [],
    });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const { data: students, error } = await Student.findAll();
    if (error) throw error;
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single student by ID
const getStudentById = async (req, res) => {
  try {
    const { data: student, error } = await Student.findOne({
      id: req.params.id,
    });
    if (error) throw error;
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update student details
const updateStudent = async (req, res) => {
  try {
    const { name, email, batchId, enrollmentNumber, currentSemester } =
      req.body;
    const { data: student, error } = await Student.update(
      { id: req.params.id },
      {
        name,
        email,
        batchId,
        enrollmentNumber,
        currnetsemester: currentSemester,
      }
    );
    if (error) throw error;
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a student
const deleteStudent = async (req, res) => {
  try {
    const { error } = await Student.delete({ id: req.params.id });
    if (error) throw error;
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update multiple students' semesters
const updateStudentSemesters = async (req, res) => {
  try {
    const { studentIds, newSemester } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "No student IDs provided" });
    }

    if (newSemester === undefined || isNaN(parseInt(newSemester))) {
      return res.status(400).json({ message: "Invalid semester value" });
    }

    // Update all selected students
    for (const id of studentIds) {
      const { error } = await Student.update(
        { id },
        { currnetsemester: parseInt(newSemester) }
      );
      if (error) throw error;
    }

    res.status(200).json({ message: "Student semesters updated successfully" });
  } catch (error) {
    console.error("Error updating student semesters:", error);
    res
      .status(500)
      .json({
        message: "Failed to update student semesters",
        error: error.message,
      });
  }
};

// Get students by batch ID
const getStudentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({ message: "Batch ID is required" });
    }

    const { data: students, error } = await Student.findAll({ batchId });
    if (error) throw error;

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStudent,
  createStudents,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateStudentSemesters,
  getStudentsByBatch,
};
