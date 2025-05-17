const { supabase } = require('../config/db');

// ✅ Create Component Weightage
const createComponentWeightage = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { batch, semester, subject, ese, cse, ia, tw, viva } = req.body;

    // Fetch Batch ID
    const { data: batchRecord, error: batchError } = await supabase
      .from('batches')
      .select('id')
      .eq('name', batch)
      .single();

    if (batchError || !batchRecord) {
      return res.status(400).json({ error: "Batch not found" });
    }

    // Fetch Semester ID
    const { data: semesterRecord, error: semesterError } = await supabase
      .from('semesters')
      .select('id')
      .eq('semester_number', semester)
      .eq('batch_id', batchRecord.id)
      .single();

    if (semesterError || !semesterRecord) {
      return res.status(400).json({ error: "Semester not found" });
    }

    // Fetch Subject ID
    const { data: subjectRecord, error: subjectError } = await supabase
      .from('unique_sub_degree')
      .select('id')
      .eq('sub_name', subject)
      .single();

    if (subjectError || !subjectRecord) {
      return res.status(400).json({ error: "Subject not found" });
    }
    // Create Component Weightage
    const { data: newWeightage, error: createError } = await supabase
      .from('component_weightage')
      .insert({
        batch_id: batchRecord.id,
        semester_id: semesterRecord.id,
        subject_id: subjectRecord.id,
        ese: ese,
        cse: cse,
        ia: ia,
        tw: tw,
        viva: viva
      })
      .select()
      .single();

    if (createError) throw createError;

    res.status(201).json(newWeightage);
  } catch (error) {
    console.error("Error creating component weightage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get All Component Weightages
const getAllComponentWeightages = async (req, res) => {
  try {
    const { data: weightages, error } = await supabase
      .from('component_weightage')
      .select(`
        *,
        batches:batch_id (*),
        semesters:semester_id (*),
        unique_sub_degree:subject_id (*)
      `);

    if (error) throw error;

    res.status(200).json(weightages);
  } catch (error) {
    console.error("Error fetching component weightages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get Component Weightage by ID
const getComponentWeightageById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: weightage, error } = await supabase
      .from('component_weightage')
      .select(`
        *,
        batches:batch_id (*),
        semesters:semester_id (*),
        unique_sub_degree:subject_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Component weightage not found" });
      }
      throw error;
    }

    res.status(200).json(weightage);
  } catch (error) {
    console.error("Error fetching component weightage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Update Component Weightage
const updateComponentWeightage = async (req, res) => {
  try {
    const { id } = req.params;
    const { ese, cse, ia, tw, viva } = req.body;

    // Check if weightage exists
    const { data: existingWeightage, error: checkError } = await supabase
      .from('component_weightage')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingWeightage) {
      return res.status(404).json({ error: "Component weightage not found" });
    }

    // Update weightage
    const { data: updatedWeightage, error: updateError } = await supabase
      .from('component_weightage')
      .update({
        ese,
        cse,
        ia,
        tw,
        viva
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json(updatedWeightage);
  } catch (error) {
    console.error("Error updating component weightage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Delete Component Weightage
const deleteComponentWeightage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if weightage exists
    const { data: existingWeightage, error: checkError } = await supabase
      .from('component_weightage')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingWeightage) {
      return res.status(404).json({ error: "Component weightage not found" });
    }

    // Delete weightage
    const { error: deleteError } = await supabase
      .from('component_weightage')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.status(200).json({ message: "Component weightage deleted successfully" });
  } catch (error) {
    console.error("Error deleting component weightage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createComponentWeightage,
  getAllComponentWeightages,
  getComponentWeightageById,
  updateComponentWeightage,
  deleteComponentWeightage
};
