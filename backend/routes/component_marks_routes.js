const express = require("express");
const router = express.Router();
const { ComponentMarks } = require("../models");

// Get all component marks
router.get("/", async (req, res) => {
  try {
    const { data: marks, error } = await ComponentMarks.findAll();
    if (error) throw error;
    res.status(200).json(marks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get component marks by ID
router.get("/:id", async (req, res) => {
  try {
    const { data: mark, error } = await ComponentMarks.findOne({
      id: req.params.id,
    });
    if (error) throw error;
    if (!mark) {
      return res.status(404).json({ message: "Component mark not found" });
    }
    res.status(200).json(mark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new component mark
router.post("/", async (req, res) => {
  try {
    const { data: mark, error } = await ComponentMarks.create(req.body);
    if (error) throw error;
    res.status(201).json(mark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update component mark
router.put("/:id", async (req, res) => {
  try {
    const { data: mark, error } = await ComponentMarks.update(req.body, {
      id: req.params.id,
    });
    if (error) throw error;
    if (!mark) {
      return res.status(404).json({ message: "Component mark not found" });
    }
    res.status(200).json(mark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete component mark
router.delete("/:id", async (req, res) => {
  try {
    const { error } = await ComponentMarks.delete({ id: req.params.id });
    if (error) throw error;
    res.status(200).json({ message: "Component mark deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
