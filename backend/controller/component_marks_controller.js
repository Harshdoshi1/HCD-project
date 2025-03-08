const ComponentMarks = require("../models/component_marks");

const UniqueSubDegree = require("../models/uniqueSubDegree");

// ✅ Create Component Marks
exports.createComponentMarks = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { subject, ese, cse, ia, tw, viva } = req.body;

    // Fetch Subject ID
    const subjectRecord = await UniqueSubDegree.findOne({ where: { sub_code: subject } });
    if (!subjectRecord) return res.status(400).json({ error: "Subject not found" });

    // Create Component Marks
    const newMarks = await ComponentMarks.create({

      subjectId: subjectRecord.sub_code,
      ese,
      cse,
      ia,
      tw,
      viva,
    });

    console.log("Created Component Marks:", newMarks);
    res.status(201).json(newMarks);
  } catch (error) {
    console.error("Error in createComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get All Component Marks
exports.getAllComponentMarks = async (req, res) => {
  try {
    const marks = await ComponentMarks.findAll({
      include: [
        { model: UniqueSubDegree, attributes: ["sub_name"] },
      ],
    });

    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in getAllComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Component Marks by ID
exports.getComponentMarksById = async (req, res) => {
  try {
    const { id } = req.params;
    const marks = await ComponentMarks.findByPk(id, {
      include: [
        { model: UniqueSubDegree, attributes: ["sub_name"] },
      ],
    });

    if (!marks) return res.status(404).json({ error: "Component Marks not found" });

    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in getComponentMarksById:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Component Marks
exports.updateComponentMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { ese, cse, ia, tw, viva } = req.body;

    const marks = await ComponentMarks.findByPk(id);
    if (!marks) return res.status(404).json({ error: "Component Marks not found" });

    // Update values
    await marks.update({ ese, cse, ia, tw, viva });

    console.log("Updated Component Marks:", marks);
    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in updateComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Component Marks
exports.deleteComponentMarks = async (req, res) => {
  try {
    const { id } = req.params;

    const marks = await ComponentMarks.findByPk(id);
    if (!marks) return res.status(404).json({ error: "Component Marks not found" });

    await marks.destroy();

    console.log("Deleted Component Marks:", marks);
    res.status(200).json({ message: "Component Marks deleted successfully" });
  } catch (error) {
    console.error("Error in deleteComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};
