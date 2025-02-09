const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    semesterNumber: { type: Number, required: true, min: 1, max: 8 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
});

module.exports = mongoose.model("Semester", semesterSchema);
