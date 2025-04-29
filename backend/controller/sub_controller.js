const { supabase } = require("../config/supabaseClient");

// Add Subject
const addSubject = async (req, res) => {
  try {
    const { name, code, courseType, credits, subjectType } = req.body;
    const tableName =
      courseType === "degree" ? "unique_sub_degree" : "unique_sub_diploma";

    if (!["degree", "diploma"].includes(courseType)) {
      return res.status(400).json({ error: "Invalid course type" });
    }

    const { data, error } = await supabase.from(tableName).insert([
      {
        sub_code: code,
        sub_name: name,
        sub_credit: credits,
        sub_level: subjectType,
      },
    ]);

    if (error) throw error;

    res.status(201).json({ message: "Subject added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error adding subject", details: error.message });
  }
};

// Get Subject by Code and Course Type
const getSubjectByCode = async (req, res) => {
  try {
    const { code, courseType } = req.params;

    if (!["degree", "diploma"].includes(courseType)) {
      return res.status(400).json({ error: "Invalid course type" });
    }

    const tableName =
      courseType === "degree" ? "unique_sub_degree" : "unique_sub_diploma";

    const { data: subject, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("sub_code", code)
      .single();

    if (error) throw error;
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching subject", details: error.message });
  }
};

// Delete Subject
const deleteSubject = async (req, res) => {
  try {
    const { code, courseType } = req.params;

    if (!["degree", "diploma"].includes(courseType)) {
      return res.status(400).json({ error: "Invalid course type" });
    }

    const tableName =
      courseType === "degree" ? "unique_sub_degree" : "unique_sub_diploma";

    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq("sub_code", code);

    if (error) throw error;

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting subject", details: error.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const { program } = req.params;

    if (!["degree", "diploma"].includes(program)) {
      return res.status(400).json({ error: "Invalid program type" });
    }

    const tableName =
      program === "degree" ? "unique_sub_degree" : "unique_sub_diploma";

    const { data: subjects, error } = await supabase
      .from(tableName)
      .select("*");

    if (error) throw error;

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

module.exports = { addSubject, getSubjectByCode, deleteSubject, getSubjects };
