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
  StudentCPI,
} = require("../models");
const xlsx = require("xlsx");

// Upload student CPI/SPI data from Excel file
exports.uploadStudentCPI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an Excel file" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // Validate required columns
    const requiredColumns = [
      "Batch",
      "Semester",
      "EnrollmentNumber",
      "CPI",
      "SPI",
      "Rank",
    ];
    const missingColumns = requiredColumns.filter(
      (col) => !data[0].hasOwnProperty(col)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        message: `Missing required columns: ${missingColumns.join(", ")}`,
      });
    }

    // Process and save data
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const row of data) {
      try {
        // Find batch by name
        const { data: batch, error: batchError } = await Batch.findOne({
          batchName: row.Batch,
        });
        if (batchError) throw batchError;

        if (!batch) {
          results.failed++;
          results.errors.push(
            `Batch not found: ${row.Batch} for enrollment ${row.EnrollmentNumber}`
          );
          continue;
        }

        // Find semester by number and batch
        const { data: semester, error: semesterError } = await Semester.findOne(
          {
            batchId: batch.id,
            semesterNumber: row.Semester,
          }
        );
        if (semesterError) throw semesterError;

        if (!semester) {
          results.failed++;
          results.errors.push(
            `Semester ${row.Semester} not found for batch ${row.Batch}`
          );
          continue;
        }

        // Upsert student CPI record
        const { error: cpiError } = await StudentCPI.upsert({
          batchId: batch.id,
          semesterId: semester.id,
          enrollmentNumber: row.EnrollmentNumber,
          cpi: row.CPI,
          spi: row.SPI,
          rank: row.Rank,
        });
        if (cpiError) throw cpiError;

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Error processing row for ${row.EnrollmentNumber}: ${error.message}`
        );
      }
    }

    return res.status(200).json({
      message: "Excel data processed",
      results,
    });
  } catch (error) {
    console.error("Error uploading student CPI data:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get all student CPI/SPI data
exports.getAllStudentCPI = async (req, res) => {
  try {
    const { data: studentCPIs, error } = await StudentCPI.findAll();
    if (error) throw error;

    return res.status(200).json(studentCPIs);
  } catch (error) {
    console.error("Error fetching student CPI data:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get student CPI/SPI data by batch
exports.getStudentCPIByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const { data: studentCPIs, error } = await StudentCPI.findAll({
      batchId,
    });
    if (error) throw error;

    return res.status(200).json(studentCPIs);
  } catch (error) {
    console.error("Error fetching student CPI data by batch:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get student CPI/SPI data by enrollment number
exports.getStudentCPIByEnrollment = async (req, res) => {
  try {
    const { enrollmentNumber } = req.params;

    const { data: studentCPIs, error } = await StudentCPI.findAll({
      enrollmentNumber,
      orderBy: { semesterNumber: "asc" },
    });
    if (error) throw error;

    return res.status(200).json(studentCPIs);
  } catch (error) {
    console.error("Error fetching student CPI data by enrollment:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get student CPI
const getStudentCPI = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student details
    const { data: student, error: studentError } = await User.findOne({
      id: studentId,
    });
    if (studentError) throw studentError;
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Get all subjects for the student's batch and semester
    const { data: subjects, error: subjectsError } = await Subject.findAll({
      batchId: student.batchId,
      semesterId: student.semesterId,
    });
    if (subjectsError) throw subjectsError;

    // Get component marks for each subject
    const subjectMarks = await Promise.all(
      subjects.map(async (subject) => {
        const { data: marks, error: marksError } = await ComponentMarks.findOne(
          {
            subjectId: subject.id,
          }
        );
        if (marksError) throw marksError;
        return { ...subject, marks };
      })
    );

    // Calculate CPI
    let totalCredits = 0;
    let totalGradePoints = 0;

    subjectMarks.forEach((subject) => {
      const credits = subject.credits || 0;
      const gradePoints = calculateGradePoints(subject.marks);
      totalCredits += credits;
      totalGradePoints += credits * gradePoints;
    });

    const cpi = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    res.status(200).json({
      student,
      cpi,
      subjects: subjectMarks,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error calculating CPI", details: error.message });
  }
};

// Helper function to calculate grade points
const calculateGradePoints = (marks) => {
  if (!marks) return 0;

  const totalMarks = Object.values(marks).reduce(
    (sum, mark) => sum + (mark || 0),
    0
  );

  if (totalMarks >= 90) return 10;
  if (totalMarks >= 80) return 9;
  if (totalMarks >= 70) return 8;
  if (totalMarks >= 60) return 7;
  if (totalMarks >= 50) return 6;
  if (totalMarks >= 40) return 5;
  return 0;
};

module.exports = {
  uploadStudentCPI: exports.uploadStudentCPI,
  getAllStudentCPI: exports.getAllStudentCPI,
  getStudentCPIByBatch: exports.getStudentCPIByBatch,
  getStudentCPIByEnrollment: exports.getStudentCPIByEnrollment,
  getStudentCPI,
};
