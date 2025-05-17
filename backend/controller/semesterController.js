<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const { Semester, Batch } = require("../models");

// Create a new semester
const createSemester = async (req, res) => {
  try {
    const { semesterNumber, batchId } = req.body;

    // Input validation
    if (!semesterNumber || !batchId) {
      return res.status(400).json({
        error: "Semester number and batch ID are required",
        received: { semesterNumber, batchId },
      });
    }

    // Validate batch exists
    const { data: batch, error: batchError } = await Batch.findOne({
      id: batchId,
    });
    if (batchError || !batch) {
      return res.status(400).json({ error: "Batch not found" });
    }

    // Create semester
    const { data: semester, error } = await Semester.create({
      semesterNumber,
      batchId,
    });

    if (error) throw error;

    res.status(201).json(semester);
  } catch (error) {
    console.error("Error creating semester:", error);
    res.status(500).json({
      error: error.message,
      type: error.name,
      details: error.errors?.map((e) => e.message) || [],
    });
  }
};

// Get all semesters
const getAllSemesters = async (req, res) => {
  try {
    const { data: semesters, error } = await Semester.findAll();
    if (error) throw error;
    res.status(200).json(semesters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single semester by ID
const getSemesterById = async (req, res) => {
  try {
    const { data: semester, error } = await Semester.findOne({
      id: req.params.id,
    });
    if (error) throw error;
    if (!semester)
      return res.status(404).json({ message: "Semester not found" });
    res.status(200).json(semester);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update semester details
const updateSemester = async (req, res) => {
  try {
    const { semesterNumber, batchId } = req.body;
    const { data: semester, error } = await Semester.update(
      { id: req.params.id },
      { semesterNumber, batchId }
    );
    if (error) throw error;
    if (!semester)
      return res.status(404).json({ message: "Semester not found" });
    res.status(200).json(semester);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a semester
const deleteSemester = async (req, res) => {
  try {
    const { error } = await Semester.delete({ id: req.params.id });
    if (error) throw error;
    res.status(200).json({ message: "Semester deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get semesters by batch ID
const getSemestersByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({ message: "Batch ID is required" });
    }

    const { data: semesters, error } = await Semester.findAll({ batchId });
    if (error) throw error;

    res.status(200).json(semesters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSemester,
  getAllSemesters,
  getSemesterById,
  updateSemester,
  deleteSemester,
  getSemestersByBatch,
};
=======
const express = require('express');
const router = express.Router();
const Semester = require("../models/semester.js");
const Batch = require('../models/batch.js');

const addSemester = async (req, res) => {
    try {
        const { batchName, semesterNumber, startDate, endDate } = req.body;

        if (!batchName || !semesterNumber || !startDate || !endDate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find batch
        const batch = await Batch.findOne({ where: { batchName } });
        if (!batch) {
            return res.status(404).json({ message: "Batch not found." });
        }

        // Create semester
        const newSemester = await Semester.create({
            batchId: batch.id,
            semesterNumber,
            startDate,
            endDate
        });

        res.status(201).json({ message: "Semester added successfully", semester: newSemester });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


const getSemestersByBatch = async (req, res) => {
    try {
        console.log("Received request with params:", req.params); // Debugging log

        const { batchName } = req.params; // Use params instead of query
        if (!batchName) {
            console.log("❌ Missing batchName in request.");
            return res.status(400).json({ message: "Batch name is required." });
        }

        console.log(`🔍 Searching for batch: ${batchName}`);
        const batch = await Batch.findOne({ where: { batchName } });

        if (!batch) {
            console.log(`❌ Batch '${batchName}' not found in DB.`);
            return res.status(404).json({ message: "Batch not found." });
        }

        console.log(`✅ Found batch with ID: ${batch.id}, fetching semesters...`);
        const semesters = await Semester.findAll({ where: { batchId: batch.id } });

        if (!semesters.length) {
            console.log(`⚠️ No semesters found for batch ID: ${batch.id}`);
            return res.status(404).json({ message: "No semesters found for this batch." });
        }

        console.log(`✅ Found ${semesters.length} semesters. Sending response.`);
        res.status(200).json(semesters);
    } catch (error) {
        console.error("❌ Server Error:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};



module.exports = {
    getSemestersByBatch,
    addSemester
};

>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
