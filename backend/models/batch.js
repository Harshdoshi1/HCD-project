const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchName: { type: String, unique: true, required: true }  // Example: "2022-2026"
});

module.exports = mongoose.model("Batch", batchSchema);
