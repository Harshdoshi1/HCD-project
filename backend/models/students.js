const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    student_id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }
}, { timestamps: true });

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;
