const express = require("express");
const router = express.Router();
const { Student } = require("../models");

// Get all students
router.get("/", async (req, res) => {
  try {
    const { data: students, error } = await Student.findAll();
    if (error) throw error;
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student by ID
router.get("/:id", async (req, res) => {
  try {
    const { data: student, error } = await Student.findOne({
      id: req.params.id,
    });
    if (error) throw error;
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new student
router.post("/", async (req, res) => {
  try {
    const { data: student, error } = await Student.create(req.body);
    if (error) throw error;
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student
router.put("/:id", async (req, res) => {
  try {
    const { data: student, error } = await Student.update(req.body, {
      id: req.params.id,
    });
    if (error) throw error;
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete student
router.delete("/:id", async (req, res) => {
  try {
    const { error } = await Student.delete({ id: req.params.id });
    if (error) throw error;
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
