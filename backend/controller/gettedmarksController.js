const {
  User,
  Faculty,
  Batch,
  Semester,
  Subject,
  UniqueSubDegree,
  UniqueSubDiploma,
  ComponentWeightage,
  ComponentMarks,
} = require("../models");

exports.getStudentMarksByBatchAndSubject = async (req, res) => {
  try {
    const { batchId } = req.params;
    console.log("Received check:", batchId);

    const { data: students, error } = await User.findAll({
      batchId: batchId,
      role: "student",
    });

    if (error) throw error;
    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found for this batch" });
    }

    console.log("Students:", students);
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching student marks:", error);
    res
      .status(500)
      .json({ message: "Error fetching student marks", error: error.message });
  }
};

exports.getStudentsByBatchAndSemester = async (req, res) => {
  try {
    const { batchId, semesterId } = req.params;
    console.log("Received check:", batchId, semesterId);

    const { data: students, error } = await User.findAll({
      batchId: batchId,
      semesterId: semesterId,
      role: "student",
    });

    if (error) throw error;
    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found for this batch and semester" });
    }

    console.log("Students:", students);
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ message: "Error fetching students", error: error.message });
  }
};

exports.getStudentMarksByBatchAndSubject1 = async (req, res) => {
  try {
    const { batchId } = req.params;
    console.log("Received check:", batchId);

    const { data: batch, error: batchError } = await Batch.findOne({
      batchName: batchId,
    });
    if (batchError) throw batchError;
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const { data: students, error: studentsError } = await User.findAll({
      batchId: batch.id,
      role: "student",
    });
    if (studentsError) throw studentsError;

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found for this batch" });
    }

    console.log("Students:", students);
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching student marks:", error);
    res
      .status(500)
      .json({ message: "Error fetching student marks", error: error.message });
  }
};

exports.updateStudentMarks = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    const { ese, cse, ia, tw, viva, facultyId, response } = req.body;

    console.log(
      "Updating marks for student:",
      studentId,
      "and subject:",
      subjectId
    );

    // Ensure subject exists
    const { data: subject, error: subjectError } =
      await UniqueSubDegree.findOne({
        sub_code: subjectId,
      });
    if (subjectError) throw subjectError;
    if (!subject) {
      return res
        .status(400)
        .json({ error: `Subject ID ${subjectId} does not exist.` });
    }

    // Update or create marks
    const { data: marks, error: marksError } = await ComponentMarks.upsert({
      studentId,
      subjectId,
      facultyId,
      ese: ese || 0,
      cse: cse || 0,
      ia: ia || 0,
      tw: tw || 0,
      viva: viva || 0,
      facultyResponse: response || "",
    });
    if (marksError) throw marksError;

    res
      .status(200)
      .json({ message: "Marks updated successfully", data: marks });
  } catch (error) {
    console.error("Error updating student marks:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

exports.getSubjectNamefromCode = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    const { data: subject, error } = await UniqueSubDegree.findOne({
      sub_code: subjectCode,
    });
    if (error) throw error;
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json({ subjectName: subject.sub_name });
  } catch (error) {
    console.error("Error fetching subject name:", error);
    res
      .status(500)
      .json({ message: "Error fetching subject name", error: error.message });
  }
};

exports.getBatchIdfromName = async (req, res) => {
  try {
    const { batchName } = req.params;
    const { data: batch, error } = await Batch.findOne({
      batchName,
    });
    if (error) throw error;
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.status(200).json({ batchId: batch.id });
  } catch (error) {
    console.error("Error fetching batch ID:", error);
    res
      .status(500)
      .json({ message: "Error fetching batch ID", error: error.message });
  }
};

exports.getSubjectByBatchAndSemester = async (req, res) => {
  try {
    const { batchId, semesterId, facultyName } = req.params;

    if (!facultyName) {
      return res.status(400).json({ error: "Faculty name is required" });
    }

    const { data: subjects, error } = await Subject.findAll({
      batchId,
      semesterId,
      facultyName,
    });
    if (error) throw error;

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching assigned subjects:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};
