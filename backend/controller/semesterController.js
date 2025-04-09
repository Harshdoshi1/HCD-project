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

