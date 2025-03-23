const AssignSubject = require("../models/assignSubject");
const Batch = require("../models/batch");
const Semester = require("../models/semester");
const Faculty = require("../models/faculty");
const UniqueSubDegree = require("../models/uniqueSubDegree");
const UniqueSubDiploma = require("../models/uniqueSubDiploma");
exports.createAssignSubject = async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const batch = req.body.batch.value;  
        const semester = req.body.semester.value;  
        const subject = req.body.subject.value;  
        const faculty = req.body.faculty.label;  

        // Find Batch ID & Course Type (Degree/Diploma)
        const batchRecord = await Batch.findOne({ where: { batchName: batch } });
        if (!batchRecord) return res.status(400).json({ error: "Batch not found" });
        console.log("Batch Found:", batchRecord);

        const courseType = batchRecord.courseType; 

        // Find Semester ID
        const semesterRecord = await Semester.findOne({ where: { semesterNumber: semester, batchId: batchRecord.id } });
        if (!semesterRecord) return res.status(400).json({ error: "Semester not found" });
        console.log("Semester Found:", semesterRecord);

        // Find Subject Code based on Course Type
        let subjectRecord;
        if (courseType === "Degree") {
            subjectRecord = await UniqueSubDegree.findOne({ where: { sub_name: subject } });
        } else if (courseType === "Diploma") {
            subjectRecord = await UniqueSubDiploma.findOne({ where: { sub_name: subject } });
        }

        if (!subjectRecord) return res.status(400).json({ error: "Subject not found" });
        console.log("Subject Found:", subjectRecord);

        // Assign Subject
        const assignSubject = await AssignSubject.create({
            batchId: batchRecord.id,
            semesterId: semesterRecord.id,
            facultyName: faculty,
            subjectCode: subjectRecord.sub_code, 
        });

        console.log("Assigned Subject:", assignSubject);
        res.status(201).json(assignSubject);
    } catch (error) {
        console.error("Error in createAssignSubject:", error);
        res.status(500).json({ error: error.message });
    }
};


// Get all AssignSubject entries
exports.getAllAssignSubjects = async (req, res) => {
    try {
        const assignSubjects = await AssignSubject.findAll({
            include: [Batch, Semester, Faculty, Subject]
        });
        res.status(200).json(assignSubjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single AssignSubject entry by ID
exports.getAssignSubjectById = async (req, res) => {
    try {
        const assignSubject = await AssignSubject.findByPk(req.params.id, {
            include: [Batch, Semester, Faculty, Subject]
        });
        if (!assignSubject) {
            return res.status(404).json({ message: 'AssignSubject not found' });
        }
        res.status(200).json(assignSubject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an AssignSubject entry
exports.updateAssignSubject = async (req, res) => {
    try {
        const { batchId, semesterId, facultyId, subjectId } = req.body;
        const assignSubject = await AssignSubject.findByPk(req.params.id);
        if (!assignSubject) {
            return res.status(404).json({ message: 'AssignSubject not found' });
        }
        await assignSubject.update({ batchId, semesterId, facultyId, subjectId });
        res.status(200).json(assignSubject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an AssignSubject entry
exports.deleteAssignSubject = async (req, res) => {
    try {
        const assignSubject = await AssignSubject.findByPk(req.params.id);
        if (!assignSubject) {
            return res.status(404).json({ message: 'AssignSubject not found' });
        }
        await assignSubject.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
