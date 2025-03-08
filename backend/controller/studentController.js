const Student = require('../models/students');
const Batch = require('../models/batch');

// Create a new student
// exports.createStudent = async (req, res) => {
//     try {
//         const { name, email, batchID, enrollmentNumber } = req.body;
//         //fetch batch id from batch name 
//         const originalbatchId = await Batch.findOne({ where: { batchName: batchID } });
//         const student = await Student.create({ name, email, originalbatchId, enrollmentNumber });
//         res.status(201).json(student);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
exports.createStudent = async (req, res) => {
    try {
        const { name, email, batchID, enrollmentNumber } = req.body;

        console.log("Received batchID:", batchID);
        console.log("Received name:", name);


        // Validate batch ID
        const batch = await Batch.findOne({ where: { batchName: batchID } });
        if (!batch) {
            return res.status(400).json({ error: "Batch not found" });
        }
        const batchId = batch.id; // ✅ Extract batch ID
        console.log("Extracted batch ID:", batchId);
        // Create student
        const student = await Student.create({
            name,
            email,
            batchId, // Store the correct batch ID
            enrollmentNumber
        });

        res.status(201).json(student);
    } catch (error) {
        console.error("Error creating student:", error);
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
