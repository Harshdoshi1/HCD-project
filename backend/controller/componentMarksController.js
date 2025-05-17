<<<<<<< HEAD
const {
  ComponentMarks,
  ComponentWeightage,
  UniqueSubDegree,
} = require("../models");
=======
const ComponentMarks = require("../models/componentMarks");
const ComponentWeightage = require("../models/componentWeightage");
const UniqueSubDegree = require("../models/uniqueSubDegree");
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4

// Create Component Marks
const createComponentMarks = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { subject, ese, cse, ia, tw, viva } = req.body;

    // Fetch Subject ID
<<<<<<< HEAD
    const { data: subjectRecord, error: subjectError } =
      await UniqueSubDegree.findOne({ sub_code: subject });
    if (subjectError || !subjectRecord)
      return res.status(400).json({ error: "Subject not found" });

    // Create Component Marks
    const { data: newMarks, error: marksError } = await ComponentMarks.create({
=======
    const subjectRecord = await UniqueSubDegree.findOne({ where: { sub_code: subject } });
    if (!subjectRecord) return res.status(400).json({ error: "Subject not found" });

    // Create Component Marks
    const newMarks = await ComponentMarks.create({

>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
      subjectId: subjectRecord.sub_code,
      ese,
      cse,
      ia,
      tw,
      viva,
    });

<<<<<<< HEAD
    if (marksError) throw marksError;

=======
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
    console.log("Created Component Marks:", newMarks);
    res.status(201).json(newMarks);
  } catch (error) {
    console.error("Error in createComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get All Component Marks
const getAllComponentMarks = async (req, res) => {
  try {
<<<<<<< HEAD
    const { data: marks, error } = await ComponentMarks.findAll();
    if (error) throw error;
=======
    const marks = await ComponentMarks.findAll({
      include: [
        { model: UniqueSubDegree, attributes: ["sub_name"] },
      ],
    });

>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in getAllComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Component Marks by ID
const getComponentMarksById = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const { data: marks, error } = await ComponentMarks.findOne({ id });
    if (error) throw error;
    if (!marks)
      return res.status(404).json({ error: "Component Marks not found" });
=======
    const marks = await ComponentMarks.findByPk(id, {
      include: [
        { model: UniqueSubDegree, attributes: ["sub_name"] },
      ],
    });

    if (!marks) return res.status(404).json({ error: "Component Marks not found" });

>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in getComponentMarksById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update Component Marks
const updateComponentMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { ese, cse, ia, tw, viva } = req.body;

<<<<<<< HEAD
    const { data: marks, error } = await ComponentMarks.update(
      { id },
      { ese, cse, ia, tw, viva }
    );
    if (error) throw error;
    if (!marks)
      return res.status(404).json({ error: "Component Marks not found" });
=======
    const marks = await ComponentMarks.findByPk(id);
    if (!marks) return res.status(404).json({ error: "Component Marks not found" });

    // Update values
    await marks.update({ ese, cse, ia, tw, viva });
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4

    console.log("Updated Component Marks:", marks);
    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in updateComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete Component Marks
const deleteComponentMarks = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const { error } = await ComponentMarks.delete({ id });
    if (error) throw error;
    console.log("Deleted Component Marks with ID:", id);
=======

    const marks = await ComponentMarks.findByPk(id);
    if (!marks) return res.status(404).json({ error: "Component Marks not found" });

    await marks.destroy();

    console.log("Deleted Component Marks:", marks);
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
    res.status(200).json({ message: "Component Marks deleted successfully" });
  } catch (error) {
    console.error("Error in deleteComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};

const addSubjectWithComponents = async (req, res) => {
  try {
<<<<<<< HEAD
    const { subject, name, credits, componentsWeightage, componentsMarks } =
      req.body;

    // Fetch Subject ID
    const { data: subjectRecord, error: subjectError } =
      await UniqueSubDegree.findOne({ sub_code: subject });
    if (subjectError || !subjectRecord)
      return res.status(400).json({ error: "Subject not found" });

    // Update credits and name in UniqueSubDegree
    const updateData = {};
    if (typeof credits === "number") {
=======
    const { subject, name, credits, componentsWeightage, componentsMarks } = req.body;

    // Fetch Subject ID
    const subjectRecord = await UniqueSubDegree.findOne({ where: { sub_code: subject } });
    if (!subjectRecord) return res.status(400).json({ error: "Subject not found" });

    // Update credits and name in UniqueSubDegree
    const updateData = {};
    if (typeof credits === 'number') {
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
      updateData.credits = credits;
    }
    if (name) {
      updateData.sub_name = name;
    }
<<<<<<< HEAD

    const { error: updateError } = await UniqueSubDegree.update(
      { sub_code: subject },
      updateData
    );
    if (updateError) throw updateError;
=======
    
    await subjectRecord.update(updateData);
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4

    // Prepare mapping helper
    function mapComponents(components) {
      const map = { ESE: 0, CSE: 0, IA: 0, TW: 0, VIVA: 0 };
      if (Array.isArray(components)) {
<<<<<<< HEAD
        components.forEach((comp) => {
          if (comp.name && typeof comp.value === "number") {
=======
        components.forEach(comp => {
          if (comp.name && typeof comp.value === 'number') {
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
            const key = comp.name.toUpperCase();
            if (map.hasOwnProperty(key)) {
              map[key] = comp.value;
            }
<<<<<<< HEAD
          } else if (comp.name && typeof comp.weightage === "number") {
=======
          } else if (comp.name && typeof comp.weightage === 'number') {
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
            // fallback for weightage
            const key = comp.name.toUpperCase();
            if (map.hasOwnProperty(key)) {
              map[key] = comp.weightage;
            }
          }
        });
      }
      return map;
    }

    // Map weightages
    const weightageMap = mapComponents(componentsWeightage);
    // Map marks
    const marksMap = mapComponents(componentsMarks);

    // Insert into ComponentWeightage
<<<<<<< HEAD
    const { data: newWeightage, error: weightageError } =
      await ComponentWeightage.create({
        subjectId: subjectRecord.sub_code,
        ese: weightageMap.ESE,
        cse: weightageMap.CSE,
        ia: weightageMap.IA,
        tw: weightageMap.TW,
        viva: weightageMap.VIVA,
      });
    if (weightageError) throw weightageError;

    // Insert into ComponentMarks
    const { data: newMarks, error: marksError } = await ComponentMarks.create({
=======
    const newWeightage = await ComponentWeightage.create({
      subjectId: subjectRecord.sub_code,
      ese: weightageMap.ESE,
      cse: weightageMap.CSE,
      ia: weightageMap.IA,
      tw: weightageMap.TW,
      viva: weightageMap.VIVA
    });

    // Insert into ComponentMarks
    const newMarks = await ComponentMarks.create({
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
      subjectId: subjectRecord.sub_code,
      ese: marksMap.ESE,
      cse: marksMap.CSE,
      ia: marksMap.IA,
      tw: marksMap.TW,
<<<<<<< HEAD
      viva: marksMap.VIVA,
    });
    if (marksError) throw marksError;

    res.status(201).json({
      weightage: newWeightage,
      marks: newMarks,
=======
      viva: marksMap.VIVA
    });

    res.status(201).json({
      weightage: newWeightage,
      marks: newMarks
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
    });
  } catch (error) {
    console.error("Error in addSubjectWithComponents:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Component Marks by Subject Code
const getComponentMarksBySubject = async (req, res) => {
  try {
    const { subjectCode } = req.params;
<<<<<<< HEAD

    const { data: marks, error } = await ComponentMarks.findOne({
      subjectId: subjectCode,
    });
    if (error) throw error;
    if (!marks)
      return res
        .status(404)
        .json({ error: "Component Marks not found for this subject" });
=======
    
    const marks = await ComponentMarks.findOne({
      where: { subjectId: subjectCode },
      include: [
        { model: UniqueSubDegree, attributes: ["sub_name"] },
      ],
    });

    if (!marks) return res.status(404).json({ error: "Component Marks not found for this subject" });
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4

    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in getComponentMarksBySubject:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
<<<<<<< HEAD
  createComponentMarks,
  getAllComponentMarks,
  getComponentMarksById,
  updateComponentMarks,
  deleteComponentMarks,
  addSubjectWithComponents,
  getComponentMarksBySubject,
};
=======
  deleteComponentMarks, 
  addSubjectWithComponents, 
  updateComponentMarks, 
  getComponentMarksById, 
  getAllComponentMarks, 
  createComponentMarks,
  getComponentMarksBySubject
}
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4
