const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Faculty, Batch, Semester, Subject, UniqueSubDegree, UniqueSubDiploma } = require('../models'); // Import models

// Add Subject
const addSubject = async (req, res) => {
    try {
        const { name, code, courseType, credits, subjectType, semester } = req.body;

        if (courseType === 'degree') {
            await UniqueSubDegree.create({
                sub_code: code,
                sub_name: name,
                sub_credit: credits,
                sub_level: subjectType,
                semester: semester,
                program: 'Degree'
            });
        } else if (courseType === 'diploma') {
            await UniqueSubDiploma.create({
                sub_code: code,
                sub_name: name,
                sub_credit: credits,
                sub_level: subjectType
            });
        } else {
            return res.status(400).json({ error: 'Invalid course type' });
        }

        res.status(201).json({ message: 'Subject added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding subject', details: error.message });
    }
};

// Get subject with components
const getSubjectWithComponents = async (req, res) => {
    try {
        const { subjectCode } = req.params;

        const subject = await UniqueSubDegree.findOne({
            where: { sub_code: subjectCode },
            include: [
                { model: ComponentWeightage, as: 'weightage' },
                { model: ComponentMarks, as: 'marks' }
            ]
        });

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json(subject);
    } catch (error) {
        console.error('Error getting subject with components:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get Subject by Code and Course Type
const getSubjectByCode = async (req, res) => {
    try {
        const { code, courseType } = req.params;
        let subject;

        if (courseType === 'degree') {
            subject = await UniqueSubDegree.findOne({ where: { sub_code: code } });
        } else if (courseType === 'diploma') {
            subject = await UniqueSubDiploma.findOne({ where: { sub_code: code } });
        } else {
            return res.status(400).json({ error: 'Invalid course type' });
        }

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching subject', details: error.message });
    }
};
// ✅ Add Subject (Check if already assigned to batch & semester)
const assignSubject = async (req, res) => {
    try {
        console.log("Received Request Body:", req.body); // Debugging

        const { subjects } = req.body;
        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ message: "Invalid or empty subjects array" });
        }

        for (const subject of subjects) {
            const { subjectName, semesterNumber, batchName } = subject;

            if (!subjectName || !semesterNumber || !batchName) {
                return res.status(400).json({ message: "Missing subjectName, semesterNumber, or batchName" });
            }

            const batch = await Batch.findOne({ where: { batchName } });
            if (!batch) {
                return res.status(404).json({ message: `Batch '${batchName}' not found` });
            }

            const semester = await Semester.findOne({ where: { semesterNumber, batchId: batch.id } });
            if (!semester) {
                return res.status(404).json({ message: `Semester '${semesterNumber}' not found for batch '${batchName}'` });
            }

            const existingSubject = await Subject.findOne({
                where: { subjectName, semesterId: semester.id, batchId: batch.id }
            });

            if (existingSubject) {
                return res.status(400).json({ message: `Subject '${subjectName}' already assigned to this batch and semester` });
            }

            await Subject.create({ subjectName, semesterId: semester.id, batchId: batch.id });
        }

        res.status(201).json({ message: "Subjects assigned successfully" });
    } catch (error) {
        console.error("Error assigning subjects:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete Subject
const deleteSubject = async (req, res) => {
    try {
        const { code, courseType } = req.params;
        let deleted;

        if (courseType === 'degree') {
            deleted = await UniqueSubDegree.destroy({ where: { sub_code: code } });
        } else if (courseType === 'diploma') {
            deleted = await UniqueSubDiploma.destroy({ where: { sub_code: code } });
        } else {
            return res.status(400).json({ error: 'Invalid course type' });
        }

        if (!deleted) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting subject', details: error.message });
    }
};

// Function to add a unique subject for Degree
const addUniqueSubDegree = async (req, res) => {
    try {
        const { sub_code, sub_level, sub_name, sub_credit } = req.body;

        if (!sub_code || !sub_level || !sub_name || !sub_credit) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const subject = await UniqueSubDegree.create({ sub_code, sub_level, sub_name, sub_credit });
        return res.status(201).json({ message: 'Degree subject added successfully', subject });
    } catch (error) {
        return res.status(500).json({ message: 'Error adding degree subject', error: error.message });
    }
};

// Function to add a unique subject for Diploma
const addUniqueSubDiploma = async (req, res) => {
    try {
        const { sub_code, sub_level, sub_name, sub_credit } = req.body;

        if (!sub_code || !sub_level || !sub_name || !sub_credit) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const subject = await UniqueSubDiploma.create({ sub_code, sub_level, sub_name, sub_credit });
        return res.status(201).json({ message: 'Diploma subject added successfully', subject });
    } catch (error) {
        return res.status(500).json({ message: 'Error adding diploma subject', error: error.message });
    }
};

const getDropdownData = async (req, res) => {
    try {
        const subjects = await UniqueSubDegree.findAll();

        const batches = [...new Set(subjects.map((s) => s.batch))];
        const semesters = [...new Set(subjects.map((s) => s.semester))];
        const programs = [...new Set(subjects.map((s) => s.program))];

        return res.status(200).json({ subjects, batches, semesters, programs });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};

const getSubjects = async (req, res) => {
    try {
        const subjects = await UniqueSubDegree.findAll();


        return res.status(200).json({ subjects });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};

const getSubjectsByBatchAndSemester = async (req, res) => {
    try {
        const { batchName, semesterNumber } = req.params;

        // Find batch ID from batchName
        const batch = await Batch.findOne({ where: { batchName } });
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // Find semester where batchId matches
        const semester = await Semester.findOne({ where: { semesterNumber, batchId: batch.id } });
        if (!semester) {
            return res.status(404).json({ message: "Semester not found for this batch" });
        }

        // Fetch subjects for the given batch and semester
        const subjects = await Subject.findAll({ where: { semesterId: semester.id, batchId: batch.id } });

        if (subjects.length === 0) {
            return res.status(404).json({ message: "No subjects found for this semester and batch" });
        }

        // Get subject names from subjects
        const subjectNames = subjects.map(s => s.subjectName);

        // Fetch sub_code and sub_level from UniqueSubDegree using sub_name
        const uniqueSubs = await UniqueSubDegree.findAll({
            where: { sub_name: { [Op.in]: subjectNames } },
            attributes: ["sub_name", "sub_code", "sub_level"], // Fetch only required attributes
        });

        // Send the response properly formatted
        res.status(200).json({
            subjects,
            uniqueSubjects: uniqueSubs
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



const getSubjectsByBatchSemesterandFaculty = async (req, res) => {
    try {
        const { batchName, semesterNumber, facultyId } = req.body; // Read from request body
        console.log("Received:", batchName, semesterNumber, facultyId);

        if (!batchName || !semesterNumber || !facultyId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find faculty name from Users table using facultyId
        const faculty = await User.findOne({ where: { id: facultyId }, attributes: ["name"] });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }
        console.log("Faculty Name:", faculty.name);

        // Fetch all subject codes assigned to the faculty from AssignSubjects table
        const assignedSubjects = await AssignSubjects.findAll({
            where: { facultyId },
            attributes: ["subjectCode"], // Fetch only subject codes
        });

        if (!assignedSubjects.length) {
            console.log("No assigned subjects found for this faculty.");
        } else {
            const subjectCodes = assignedSubjects.map(sub => sub.subjectCode);
            console.log("Assigned Subject Codes:", subjectCodes);
        }

        // Find batch ID from batchName
        const batch = await Batch.findOne({ where: { batchName } });
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // Find semester where batchId matches
        const semester = await Semester.findOne({ where: { semesterNumber, batchId: batch.id } });
        if (!semester) {
            return res.status(404).json({ message: "Semester not found for this batch" });
        }

        // Fetch subjects where facultyName matches the fetched faculty's name
        const subjects = await Subject.findAll({
            where: { semesterId: semester.id, batchId: batch.id, facultyName: faculty.name }
        });

        if (!subjects.length) {
            return res.status(404).json({ message: "No subjects found for this semester, batch, and faculty" });
        }

        // Get subject names from subjects
        const subjectNames = subjects.map(s => s.subjectName);

        // Fetch sub_code and sub_level from UniqueSubDegree using sub_name
        const uniqueSubs = await UniqueSubDegree.findAll({
            where: { sub_name: { [Op.in]: subjectNames } },
            attributes: ["sub_name", "sub_code", "sub_level"], // Fetch only required attributes
        });

        // Send the response properly formatted
        res.status(200).json({
            facultyName: faculty.name,
            assignedSubjects,
            subjects,
            uniqueSubjects: uniqueSubs
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const addSubjectWithComponents = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            code, // subject code
            name, // subject name
            credits, // subject credits
            type, // subject type (central or departmental)
            components // object containing component data
        } = req.body;

        console.log('Received data:', req.body);

        // Validate input
        if (!code || !name || !credits || !type || !components) {
            return res.status(400).json({
                error: 'Missing required fields',
                received: { code, name, credits, type, components }
            });
        }

        // Map component names from frontend to database
        const componentMap = {
            'CA': 'cse', // Continuous Assessment maps to CSE in DB
            'ESE': 'ese', // End Semester Exam
            'IA': 'ia',   // Internal Assessment
            'TW': 'tw',   // Term Work
            'VIVA': 'viva' // Viva
        };

        // Create subject
        const subject = await UniqueSubDegree.create({
            sub_code: code,
            sub_name: name,
            sub_credit: credits,
            sub_level: type === 'central' ? 'central' : 'department'
        }, { transaction: t });

        // Prepare weightage and marks data
        const weightageData = { subjectId: code };
        const marksData = { subjectId: code };

        // Process each component
        Object.entries(components).forEach(([component, data]) => {
            if (data.enabled) {
                const dbField = componentMap[component];
                if (dbField) {
                    weightageData[dbField] = data.weightage;
                    marksData[dbField] = data.totalMarks;
                }
            }
        });

        // Create weightage
        const weightage = await ComponentWeightage.create(weightageData, { transaction: t });

        // Create marks
        const marks = await ComponentMarks.create(marksData, { transaction: t });

        await t.commit();

        res.status(201).json({
            subject,
            weightage,
            marks,
            message: 'Subject and components added successfully'
        });

    } catch (error) {
        await t.rollback();
        console.error('Error adding subject with components:', error);
        res.status(500).json({
            error: error.message,
            type: error.name,
            details: error.errors?.map(e => e.message) || []
        });
    }
};

module.exports = { getSubjectsByBatchAndSemester, addSubject, getSubjectWithComponents, addSubjectWithComponents, getDropdownData, getSubjectsByBatchSemesterandFaculty, assignSubject, getSubjectByCode, deleteSubject, getSubjects, addUniqueSubDegree, addUniqueSubDiploma };
