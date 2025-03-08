const Student = require('../models/students');
const Batch = require('../models/batch');

// Create a new student
exports.createStudent = async (req, res) => {
    try {
        const { name, email, batchId, enrollmentNumber } = req.body;
        const student = await Student.create({ name, email, batchId, enrollmentNumber });
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll({ include: Batch });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id, { include: Batch });
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update student details
exports.updateStudent = async (req, res) => {
    try {
        const { name, email, batchId, enrollmentNumber } = req.body;
        const student = await Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await student.update({ name, email, batchId, enrollmentNumber });
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await student.destroy();
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
