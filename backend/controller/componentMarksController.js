const {
  ComponentMarks,
  ComponentWeightage,
  UniqueSubDegree,
} = require("../models");

// Create Component Marks
const createComponentMarks = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { subject, ese, cse, ia, tw, viva } = req.body;

    // Fetch Subject ID
    const { data: subjectRecord, error: subjectError } =
      await UniqueSubDegree.findOne({ sub_code: subject });
    if (subjectError || !subjectRecord)
      return res.status(400).json({ error: "Subject not found" });

    // Create Component Marks
    const { data: newMarks, error: marksError } = await ComponentMarks.create({
      subjectId: subjectRecord.sub_code,
      ese,
      cse,
      ia,
      tw,
      viva,
    });

    if (marksError) throw marksError;

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
    const { data: marks, error } = await ComponentMarks.findAll();
    if (error) throw error;
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
    const { data: marks, error } = await ComponentMarks.findOne({ id });
    if (error) throw error;
    if (!marks)
      return res.status(404).json({ error: "Component Marks not found" });
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

    const { data: marks, error } = await ComponentMarks.update(
      { id },
      { ese, cse, ia, tw, viva }
    );
    if (error) throw error;
    if (!marks)
      return res.status(404).json({ error: "Component Marks not found" });

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
    const { error } = await ComponentMarks.delete({ id });
    if (error) throw error;
    console.log("Deleted Component Marks with ID:", id);
    res.status(200).json({ message: "Component Marks deleted successfully" });
  } catch (error) {
    console.error("Error in deleteComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};

const addSubjectWithComponents = async (req, res) => {
  try {
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
      updateData.credits = credits;
    }
    if (name) {
      updateData.sub_name = name;
    }

    const { error: updateError } = await UniqueSubDegree.update(
      { sub_code: subject },
      updateData
    );
    if (updateError) throw updateError;

    // Prepare mapping helper
    function mapComponents(components) {
      const map = { ESE: 0, CSE: 0, IA: 0, TW: 0, VIVA: 0 };
      if (Array.isArray(components)) {
        components.forEach((comp) => {
          if (comp.name && typeof comp.value === "number") {
            const key = comp.name.toUpperCase();
            if (map.hasOwnProperty(key)) {
              map[key] = comp.value;
            }
          } else if (comp.name && typeof comp.weightage === "number") {
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
      subjectId: subjectRecord.sub_code,
      ese: marksMap.ESE,
      cse: marksMap.CSE,
      ia: marksMap.IA,
      tw: marksMap.TW,
      viva: marksMap.VIVA,
    });
    if (marksError) throw marksError;

    res.status(201).json({
      weightage: newWeightage,
      marks: newMarks,
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

    const { data: marks, error } = await ComponentMarks.findOne({
      subjectId: subjectCode,
    });
    if (error) throw error;
    if (!marks)
      return res
        .status(404)
        .json({ error: "Component Marks not found for this subject" });

    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in getComponentMarksBySubject:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createComponentMarks,
  getAllComponentMarks,
  getComponentMarksById,
  updateComponentMarks,
  deleteComponentMarks,
  addSubjectWithComponents,
  getComponentMarksBySubject,
};
