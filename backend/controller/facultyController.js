<<<<<<< Updated upstream
const AssignSubject = require("../models/assignSubject");
const Batch = require("../models/batch");
const Semester = require("../models/semester");
const Faculty = require("../models/faculty");
const UniqueSubDegree = require("../models/uniqueSubDegree");
const UniqueSubDiploma = require("../models/uniqueSubDiploma");

exports.createAssignSubject = async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const { batch, semester, subject, faculty } = req.body;

        // Find Batch ID & Course Type (Degree/Diploma)
        const batchRecord = await Batch.findOne({ where: { batchName: batch } });
        if (!batchRecord) return res.status(400).json({ error: "Batch not found" });
        console.log("Batch Found:", batchRecord);

        const courseType = batchRecord.courseType; // Assumes Batch model has 'courseType' field
=======
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
>>>>>>> Stashed changes

    const courseType = batchRecord.courseType;

    // Find Semester ID
    const { data: semesterRecord, error: semesterError } =
      await Semester.findOne({
        semesterNumber: semester,
        batchId: batchRecord.id,
      });
    if (semesterError || !semesterRecord)
      return res.status(400).json({ error: "Semester not found" });
    console.log("Semester Found:", semesterRecord);

<<<<<<< Updated upstream
        if (!subjectRecord) return res.status(400).json({ error: "Subject not found" });
        console.log("Subject Found:", subjectRecord);

        // Assign Subject
        const assignSubject = await AssignSubject.create({
            batchId: batchRecord.id,
            semesterId: semesterRecord.id,
            facultyName: faculty,
            subjectCode: subjectRecord.sub_code, // Ensure correct column name
        });

        console.log("Assigned Subject:", assignSubject);
        res.status(201).json(assignSubject);
    } catch (error) {
        console.error("Error in createAssignSubject:", error);
        res.status(500).json({ error: error.message });
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
const getAllAssignSubjects = async (req, res) => {
  try {
    const { data: assignSubjects, error } = await AssignSubject.findAll();
    if (error) throw error;
    res.status(200).json(assignSubjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single AssignSubject entry by ID
const getAssignSubjectById = async (req, res) => {
  try {
    const { data: assignSubject, error } = await AssignSubject.findOne({
      id: req.params.id,
    });
    if (error) throw error;
    if (!assignSubject) {
      return res.status(404).json({ message: "AssignSubject not found" });
>>>>>>> Stashed changes
    }
    res.status(200).json(assignSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an AssignSubject entry
<<<<<<< Updated upstream
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
=======
const updateAssignSubject = async (req, res) => {
  try {
    const { batchId, semesterId, facultyId, subjectId } = req.body;
    const { data: assignSubject, error } = await AssignSubject.update(
      { id: req.params.id },
      { batchId, semesterId, facultyId, subjectId }
    );
    if (error) throw error;
    if (!assignSubject) {
      return res.status(404).json({ message: "AssignSubject not found" });
>>>>>>> Stashed changes
    }
    res.status(200).json(assignSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an AssignSubject entry
<<<<<<< Updated upstream
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
=======
const deleteAssignSubject = async (req, res) => {
  try {
    const { error } = await AssignSubject.delete({ id: req.params.id });
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subjects assigned to a specific faculty
const getSubjectsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    console.log("Requested facultyId:", facultyId);

    // Find faculty name using ID
    const { data: faculty, error: facultyError } = await User.findOne({
      id: facultyId,
    });
    if (facultyError || !faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Get assigned subjects
    const { data: assignSubjects, error: assignError } =
      await AssignSubject.findAll({
        facultyName: faculty.name,
      });
    if (assignError) throw assignError;

    // Transform the data to match the frontend's expected format
    const formattedSubjects = await Promise.all(
      assignSubjects.map(async (assignSubject) => {
        // Get batch details
        const { data: batch } = await Batch.findOne({
          id: assignSubject.batchId,
        });

        // Get subject details based on course type
        let subject;
        if (batch.courseType === "Degree") {
          const { data: degreeSubject } = await UniqueSubDegree.findOne({
            sub_code: assignSubject.subjectCode,
          });
          subject = degreeSubject;
        } else {
          const { data: diplomaSubject } = await UniqueSubDiploma.findOne({
            sub_code: assignSubject.subjectCode,
          });
          subject = diplomaSubject;
        }

        return {
          id: assignSubject.id,
          name: subject.sub_name,
          code: subject.sub_code,
          credits: subject.sub_credit,
          type: subject.sub_level,
          description: subject.sub_name,
          department: batch.courseType,
          semester: `${assignSubject.semesterId} Semester`,
          batch: batch.batchName,
        };
      })
    );

    res.status(200).json(formattedSubjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addFaculty = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("dsfsd", req.body);
    if (role !== "Faculty") {
      return res
        .status(400)
        .json({ message: "Invalid role. Only faculty can be added." });
    }

    // Check if faculty already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Faculty already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create faculty user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Create faculty record
    const newFaculty = await Faculty.create({ userId: newUser.id });

    res.status(201).json({
      message: "Faculty registered successfully",
      user: newUser,
      facultyId: newFaculty.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  updateAssignSubject,
  getAssignSubjectById,
  createAssignSubject,
  addFaculty,
  deleteAssignSubject,
  getAllAssignSubjects,
  getSubjectsByFaculty,
};
>>>>>>> Stashed changes
