<<<<<<< HEAD
const { Batch } = require("../models");

// Create a new batch
const createBatch = async (req, res) => {
  try {
    const { batchName, courseType } = req.body;

    // Input validation
    if (!batchName || !courseType) {
      return res.status(400).json({
        error: "Batch name and course type are required",
        received: { batchName, courseType },
      });
    }

    // Create batch
    const { data: batch, error } = await Batch.create({
      batchName,
      courseType,
    });

    if (error) throw error;

    res.status(201).json(batch);
  } catch (error) {
    console.error("Error creating batch:", error);
    res.status(500).json({
      error: error.message,
      type: error.name,
      details: error.errors?.map((e) => e.message) || [],
    });
  }
};

// Get all batches
const getAllBatches = async (req, res) => {
  try {
    const { data: batches, error } = await Batch.findAll();
    if (error) throw error;
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single batch by ID
const getBatchById = async (req, res) => {
  try {
    const { data: batch, error } = await Batch.findOne({ id: req.params.id });
    if (error) throw error;
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update batch details
const updateBatch = async (req, res) => {
  try {
    const { batchName, courseType } = req.body;
    const { data: batch, error } = await Batch.update(
      { id: req.params.id },
      { batchName, courseType }
    );
    if (error) throw error;
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a batch
const deleteBatch = async (req, res) => {
  try {
    const { error } = await Batch.delete({ id: req.params.id });
    if (error) throw error;
    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
};
=======
const Batch = require("../models/batch");

const addBatch = async (req, res) => {
    try {
        const { batchName, batchStart, batchEnd, courseType } = req.body;

        // Check for existing batch with same name
        const existingBatch = await Batch.findOne({ where: { batchName } });
        if (existingBatch) {
            return res.status(400).json({ message: 'A batch with this name already exists' });
        }

        // Validate that batchStart and batchEnd are dates
        if (isNaN(new Date(batchStart).getTime()) || isNaN(new Date(batchEnd).getTime())) {
            return res.status(400).json({ message: "Invalid date format for batchStart or batchEnd" });
        }

        // Validate that courseType is either "Degree" or "Diploma"
        if (!['Degree', 'Diploma'].includes(courseType)) {
            return res.status(400).json({ message: "Invalid courseType. It must be 'Degree' or 'Diploma'" });
        }

        // Create the new batch
        const batch = await Batch.create({
            batchName,
            batchStart: new Date(batchStart),  // Convert to Date object
            batchEnd: new Date(batchEnd),      // Convert to Date object
            courseType,
        });

        res.status(201).json({ message: "Batch created successfully", batch });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.findAll(); // Sequelize equivalent of find()
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};




module.exports = {
    getAllBatches, addBatch
}
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
