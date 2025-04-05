
const Batch = require("../models/batch");

const addBatch = async (req, res) => {
    try {
        const { batchName, batchStart, batchEnd, courseType } = req.body;

        // Validate that batchStart and batchEnd are dates
        if (isNaN(new Date(batchStart).getTime()) || isNaN(new Date(batchEnd).getTime())) {
            return res.status(400).json({ message: "Invalid date format for batchStart or batchEnd" });
        }

        // Validate that courseType is either "Degree" or "Diploma"
        if (!['Degree', 'Diploma'].includes(courseType)) {
            return res.status(400).json({ message: "Invalid courseType. It must be 'Degree' or 'Diploma'" });
        }

        // Check if batch already exists
        const existingBatch = await Batch.findOne({ where: { batchName } });
        if (existingBatch) {
            return res.status(400).json({ message: "Batch already exists" });
        }

        // Create the new batch
        const batch = await Batch.create({
            batchName,
            batchStart: new Date(batchStart),  // Convert to Date object
            batchEnd: new Date(batchEnd),      // Convert to Date object
            courseType
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
