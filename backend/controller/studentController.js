const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');

// Create a new student
const createStudent = async (req, res) => {
    try {
        const { name, email, batchID, enrollment, currentSemester } = req.body;

        // Input validation
        if (!name || !email || !batchID || !enrollment || !currentSemester) {
            console.error("Missing required fields:", { name, email, batchID, enrollment, currentSemester });
            return res.status(400).json({
                error: "All fields are required",
                received: { name, email, batchID, enrollment, currentSemester }
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
            enrollmentNumber: enrollment,
            currnetsemester: currentSemester // Note: using the field name as defined in the model
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
const createStudents = async (req, res) => {
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
        const studentData = students.map(({ name, email, batchID, enrollment, currentSemester }) => ({
            name,
            email,
            batchId: batchMap[batchID], // Replace batch name with batch ID
            enrollmentNumber: enrollment,
            currnetsemester: currentSemester // Note: using the field name as defined in the model
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
const getAllStudents = async (req, res) => {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select(`
                *,
                batches:batch_id (*)
            `);

        if (error) throw error;
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Failed to fetch students', error: error.message });
    }
};

// Get a single student by ID
const getStudentById = async (req, res) => {
    try {
        const { data: student, error } = await supabase
            .from('students')
            .select(`
                *,
                batches:batch_id (*)
            `)
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ message: 'Student not found' });
            }
            throw error;
        }

        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Failed to fetch student', error: error.message });
    }
};

// Update student details
const updateStudent = async (req, res) => {
    try {
        const { name, email, batchId, enrollmentNumber, currentSemester } = req.body;
        const student = await Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await student.update({ 
            name, 
            email, 
            batchId, 
            enrollmentNumber, 
            currnetsemester: currentSemester 
        });
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a student
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await student.destroy();
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update multiple students' semesters
const updateStudentSemesters = async (req, res) => {
    try {
        const { studentIds, newSemester } = req.body;
        
        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'No student IDs provided' });
        }
        
        if (newSemester === undefined || isNaN(parseInt(newSemester))) {
            return res.status(400).json({ message: 'Invalid semester value' });
        }
        
        // Update all selected students
        const updatePromises = studentIds.map(id => 
            Student.update(
                { currnetsemester: parseInt(newSemester) },
                { where: { id } }
            )
        );
        
        await Promise.all(updatePromises);
        
        res.status(200).json({ message: 'Student semesters updated successfully' });
    } catch (error) {
        console.error('Error updating student semesters:', error);
        res.status(500).json({ message: 'Failed to update student semesters', error: error.message });
    }
};

// Get students by batch ID
const getStudentsByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        
        if (!batchId) {
            return res.status(400).json({ message: 'Batch ID is required' });
        }
        
        const students = await Student.findAll({
            where: { batchId: parseInt(batchId) },
            attributes: ['id', 'name', 'enrollmentNumber', 'currnetsemester'],
            order: [['name', 'ASC']]
        });
        
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students by batch:', error);
        res.status(500).json({ message: 'Failed to fetch students', error: error.message });
    }
};

module.exports = { 
    deleteStudent, 
    updateStudent, 
    getStudentById, 
    getAllStudents, 
    createStudents, 
    createStudent,
    updateStudentSemesters,
    getStudentsByBatch
};
