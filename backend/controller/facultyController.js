<<<<<<< HEAD
const bcrypt = require("bcrypt");
const {
  AssignSubject,
  Batch,
  Semester,
  Faculty,
  UniqueSubDegree,
  UniqueSubDiploma,
  User,
} = require("../models");

const createAssignSubject = async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const batch = req.body.batch.value;
    const semester = req.body.semester.value;
    const subject = req.body.subject.value;
    const faculty = req.body.faculty.label;
    console.log(
      "assigned received: ",
      batch,
      "--",
      semester,
      "--",
      subject,
      "--",
      faculty
    );

    // Find Batch ID & Course Type (Degree/Diploma)
    const { data: batchRecord, error: batchError } = await Batch.findOne({
      batchName: batch,
    });
    if (batchError || !batchRecord)
      return res.status(400).json({ error: "Batch not found" });
    console.log("Batch Found:", batchRecord);

    const courseType = batchRecord.courseType;
=======
const bcrypt = require('bcrypt');
const AssignSubject = require("../models/assignSubject");
const Batch = require("../models/batch");
const Semester = require("../models/semester");
const Faculty = require("../models/faculty");
const UniqueSubDegree = require("../models/uniqueSubDegree");
const UniqueSubDiploma = require("../models/uniqueSubDiploma");
const User = require("../models/users");

const createAssignSubject = async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const batch = req.body.batch.value;
        const semester = req.body.semester.value;
        const subject = req.body.subject.value;
        const faculty = req.body.faculty.label;
        console.log("assigned received: ",batch,"--",semester,"--",subject,"--",faculty)
        // Find Batch ID & Course Type (Degree/Diploma)
        const batchRecord = await Batch.findOne({ where: { batchName: batch } });
        if (!batchRecord) return res.status(400).json({ error: "Batch not found" });
        console.log("Batch Found:", batchRecord);

        const courseType = batchRecord.courseType;
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4

    // Find Semester ID
    const { data: semesterRecord, error: semesterError } =
      await Semester.findOne({
        semesterNumber: semester,
        batchId: batchRecord.id,
      });
    if (semesterError || !semesterRecord)
      return res.status(400).json({ error: "Semester not found" });
    console.log("Semester Found:", semesterRecord);

<<<<<<< HEAD
    // Find Subject Code based on Course Type
    let subjectRecord;
    if (courseType === "Degree") {
      const { data: degreeSubject, error: degreeError } =
        await UniqueSubDegree.findOne({ sub_name: subject });
      if (!degreeError) subjectRecord = degreeSubject;
    } else if (courseType === "Diploma") {
      const { data: diplomaSubject, error: diplomaError } =
        await UniqueSubDiploma.findOne({ sub_name: subject });
      if (!diplomaError) subjectRecord = diplomaSubject;
=======
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
            // semesterId: semesterRecord.id,
            semesterId:semester,
            facultyName: faculty,
            subjectCode: subjectRecord.sub_code,
        });

        console.log("Assigned Subject:", assignSubject);
        res.status(201).json(assignSubject);
    } catch (error) {
        console.error("Error in createAssignSubject:", error);
        res.status(500).json({ error: error.message });
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
    }

    if (!subjectRecord)
      return res.status(400).json({ error: "Subject not found" });
    console.log("Subject Found:", subjectRecord);

    // Assign Subject
    const { data: assignSubject, error: assignError } =
      await AssignSubject.create({
        batchId: batchRecord.id,
        semesterId: semester,
        facultyName: faculty,
        subjectCode: subjectRecord.sub_code,
      });

    if (assignError) throw assignError;

    console.log("Assigned Subject:", assignSubject);
    res.status(201).json(assignSubject);
  } catch (error) {
    console.error("Error in createAssignSubject:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all AssignSubject entries
const getAllAssignSubjects = async (req, res) => {
<<<<<<< HEAD
  try {
    const { data: assignSubjects, error } = await AssignSubject.findAll();
    if (error) throw error;
    res.status(200).json(assignSubjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
=======
    try {
        const assignSubjects = await AssignSubject.findAll({
            include: [Batch, Semester, Faculty, UniqueSubDegree, UniqueSubDiploma]
        });
        res.status(200).json(assignSubjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
};

// Get a single AssignSubject entry by ID
const getAssignSubjectById = async (req, res) => {
<<<<<<< HEAD
  try {
    const { data: assignSubject, error } = await AssignSubject.findOne({
      id: req.params.id,
    });
    if (error) throw error;
    if (!assignSubject) {
      return res.status(404).json({ message: "AssignSubject not found" });
=======
    try {
        const assignSubject = await AssignSubject.findByPk(req.params.id, {
            include: [Batch, Semester, Faculty, UniqueSubDegree, UniqueSubDiploma]
        });
        if (!assignSubject) {
            return res.status(404).json({ message: 'AssignSubject not found' });
        }
        res.status(200).json(assignSubject);
    } catch (error) {
        res.status(500).json({ error: error.message });
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
    }
    res.status(200).json(assignSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an AssignSubject entry
const updateAssignSubject = async (req, res) => {
<<<<<<< HEAD
  try {
    const { batchId, semesterId, facultyId, subjectId } = req.body;
    const { data: assignSubject, error } = await AssignSubject.update(
      { batchId, semesterId, facultyId, subjectId },
      { id: req.params.id }
    );
    if (error) throw error;
    if (!assignSubject) {
      return res.status(404).json({ message: "AssignSubject not found" });
=======
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
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
    }
    res.status(200).json(assignSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an AssignSubject entry
const deleteAssignSubject = async (req, res) => {
<<<<<<< HEAD
  try {
    const { error } = await AssignSubject.delete({ id: req.params.id });
    if (error) throw error;
    res.status(200).json({ message: "AssignSubject deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subjects assigned to a faculty
const getSubjectsByFaculty = async (req, res) => {
  try {
    const { facultyName } = req.params;
    const { data: subjects, error } = await AssignSubject.findAll({
      facultyName,
    });
    if (error) throw error;
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAssignSubject,
  getAllAssignSubjects,
  getAssignSubjectById,
  updateAssignSubject,
  deleteAssignSubject,
  getSubjectsByFaculty,
=======
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
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
};

// Get subjects assigned to a specific faculty
// const getSubjectsByFaculty = async (req, res) => {
//     try {
//         const { facultyId } = req.params;
//         console.log("getted facultyId", facultyId);

//         const facultyName = await User.findOne({ where: { id: facultyId } });
//         console.log("getted facultyName", facultyName.name);
//         const assignSubjects = await AssignSubject.findAll({
            
//             where: { facultyName: facultyName.name },
//             include: [
//                 {
//                     model: Batch,
//                     attributes: ['batchName', 'courseType']
//                 }
//                 ,
//                 // {
//                 //     model: Semester,
//                 //     attributes: ['semesterNumber']
//                 // },
//                 {
//                     model: UniqueSubDegree,
//                     attributes: ['sub_code', 'sub_name', 'sub_credit', 'sub_level'],
//                     required: false
//                 }
//                 ,
//                 {
//                     model: UniqueSubDiploma,
//                     attributes: ['sub_code', 'sub_name', 'sub_credit', 'sub_level'],
//                     required: false
//                 }
//             ]
//         });
//         console.log("getted assignSubjects", assignSubjects);
//         // Transform the data to match the frontend's expected format
//         const formattedSubjects = assignSubjects.map(assignSubject => {
//             const subject = assignSubject.UniqueSubDegree || assignSubject.UniqueSubDiploma;
//             return {
//                 id: assignSubject.id,
//                 name: subject.sub_name,
//                 code: subject.sub_code,
//                 credits: subject.sub_credit,
//                 type: subject.sub_level,
//                 description: subject.sub_name,
//                 department: assignSubject.Batch.courseType,
//                 semester: `${assignSubject.Semester.semesterNumber} Semester`,
//                 batch: assignSubject.Batch.batchName
//             };
//         });

//         res.status(200).json(formattedSubjects);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
// Get subjects assigned to a specific faculty
const getSubjectsByFaculty = async (req, res) => {
    try {
        const { facultyId } = req.params;
        console.log("Requested facultyId:", facultyId);

        // Find faculty name using ID
        const faculty = await User.findOne({ where: { id: facultyId } });
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        const assignSubjects = await AssignSubject.findAll({
            where: { facultyName: faculty.name },  // Match faculty name in AssignSubject
            include: [
                {
                    model: Batch,
                    attributes: ['batchName', 'courseType']
                },
                {
                    model: UniqueSubDegree,
                    attributes: ['sub_code', 'sub_name', 'sub_credit', 'sub_level'],
                    required: false
                },
                {
                    model: UniqueSubDiploma,
                    attributes: ['sub_code', 'sub_name', 'sub_credit', 'sub_level'],
                    required: false
                }
            ]
        });

        console.log("Fetched assignSubjects:", assignSubjects.length);

        // Format results
        const formattedSubjects = assignSubjects.map(assignSubject => {
            const subject = assignSubject.UniqueSubDegree || assignSubject.UniqueSubDiploma;
            return {
                id: assignSubject.id,
                name: subject?.sub_name || 'N/A',
                code: subject?.sub_code || 'N/A',
                credits: subject?.sub_credit || 'N/A',
                type: subject?.sub_level || 'N/A',
                description: subject?.sub_name || 'N/A',
                department: assignSubject.Batch.courseType,
                batch: assignSubject.Batch.batchName,
                semesterId: assignSubject.semesterId  // added here
            };
        });

        res.status(200).json(formattedSubjects);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ error: error.message });
    }
};

const addFaculty = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

console.log("dsfsd",req.body);
        if (role !== 'Faculty') {
            return res.status(400).json({ message: 'Invalid role. Only faculty can be added.' });
        }

        // Check if faculty already exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'Faculty already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create faculty user
        const newUser = await User.create({ name, email, password: hashedPassword, role });

        // Create faculty record
        const newFaculty = await Faculty.create({ userId: newUser.id });

        res.status(201).json({
            message: 'Faculty registered successfully',
            user: newUser,
            facultyId: newFaculty.id
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
module.exports = {  updateAssignSubject,
                    getAssignSubjectById, 
                    createAssignSubject, 
                    addFaculty, 
                    deleteAssignSubject, 
                    getAllAssignSubjects, 
                    getSubjectsByFaculty 
                };
