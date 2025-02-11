const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Faculty ID (PK)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Foreign Key
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
