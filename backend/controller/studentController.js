const Student = require('../models/students');
const Batch = require('../models/batch');

// Create a new student
exports.createStudent = async (req, res) => {
    try {
        const { name, email, batchID, enrollment } = req.body;

        // Input validation
        if (!name || !email || !batchID || !enrollment) {
            console.error("Missing required fields:", { name, email, batchID, enrollment });
            return res.status(400).json({
                error: "All fields are required",
                received: { name, email, batchID, enrollment }
            });
        }

        // Validate batch ID
        const batch = await Batch.findOne({
            where: { batchName: batchID },
            attributes: ['id', 'batchName']
        });

        if (!batch) {
            console.error("Batch not found:", batchID);
            return res.status(400).json({
                error: "Batch not found",
                receivedBatchName: batchID
            });
        }

        console.log("Found batch:", batch.toJSON());

        // Create student
        const student = await Student.create({
            name,
            email,
            batchId: batch.id,
            enrollmentNumber: enrollment
        });

        console.log("Created student:", student.toJSON());
        res.status(201).json(student);
    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({
            error: error.message,
            type: error.name,
            details: error.errors?.map(e => e.message) || []
        });
    }
};

// Create multiple students
exports.createStudents = async (req, res) => {
    try {
        const students = req.body.students; // Expecting an array of student objects

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ error: "Invalid or empty students array" });
        }

        // Get unique batch names from input
        const batchNames = [...new Set(students.map(s => s.batchID))];

        // Fetch batch IDs for provided batch names
        const batches = await Batch.findAll({
            where: { batchName: batchNames },
            attributes: ['id', 'batchName']
        });

        const batchMap = batches.reduce((acc, batch) => {
            acc[batch.batchName] = batch.id;
            return acc;
        }, {});

        // Check if all batch names exist
        const invalidBatches = batchNames.filter(name => !batchMap[name]);
        if (invalidBatches.length > 0) {
            return res.status(400).json({ error: "Invalid batch names", invalidBatches });
        }

        // Prepare student data with correct batch IDs
        const studentData = students.map(({ name, email, batchID, enrollment }) => ({
            name,
            email,
            batchId: batchMap[batchID], // Replace batch name with batch ID
            enrollmentNumber: enrollment
        }));

        // Bulk insert students
        const createdStudents = await Student.bulkCreate(studentData);

        res.status(201).json({ message: "Students added successfully", students: createdStudents });
    } catch (error) {
        console.error("Error creating students:", error);
        res.status(500).json({
            error: error.message,
            type: error.name,
            details: error.errors?.map(e => e.message) || []
        });
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
