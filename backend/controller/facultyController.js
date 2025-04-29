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

    // Find Semester ID
    const { data: semesterRecord, error: semesterError } =
      await Semester.findOne({
        semesterNumber: semester,
        batchId: batchRecord.id,
      });
    if (semesterError || !semesterRecord)
      return res.status(400).json({ error: "Semester not found" });
    console.log("Semester Found:", semesterRecord);

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
    }
    res.status(200).json(assignSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an AssignSubject entry
const updateAssignSubject = async (req, res) => {
  try {
    const { batchId, semesterId, facultyId, subjectId } = req.body;
    const { data: assignSubject, error } = await AssignSubject.update(
      { batchId, semesterId, facultyId, subjectId },
      { id: req.params.id }
    );
    if (error) throw error;
    if (!assignSubject) {
      return res.status(404).json({ message: "AssignSubject not found" });
    }
    res.status(200).json(assignSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an AssignSubject entry
const deleteAssignSubject = async (req, res) => {
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
};
