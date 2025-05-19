const { supabase } = require('../config/db');

// ✅ Create Component Weightage
exports.createComponentWeightage = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { subject, ese, cse, ia, tw, viva } = req.body;

    // Fetch Subject ID
    const { data: subjectRecord, error: subjectError } = await supabase
      .from('unique_sub_degree')
      .select('id')
      .eq('sub_code', subject)
      .single();

    if (subjectError || !subjectRecord) {
      return res.status(400).json({ error: "Subject not found" });
    }

    // Create Component Weightage
    const { data: newWeightage, error: createError } = await supabase
      .from('component_weightage')
      .insert({
        subject_id: subjectRecord.id,
        ese,
        cse,
        ia,
        tw,
        viva
      })
      .select()
      .single();

    if (createError) throw createError;

    console.log("Created Component Weightage:", newWeightage);
    res.status(201).json(newWeightage);
  } catch (error) {
    console.error("Error in createComponentWeightage:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get All Component Weightages
exports.getAllComponentWeightages = async (req, res) => {
  try {
    const { data: weightages, error } = await supabase
      .from('component_weightage')
      .select(`
        *,
        batches:batch_id (name),
        semesters:semester_id (semester_number),
        unique_sub_degree:subject_id (sub_name)
      `);

    if (error) throw error;

    res.status(200).json(weightages);
  } catch (error) {
    console.error("Error in getAllComponentWeightages:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Component Weightage by ID
exports.getComponentWeightageById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: weightage, error } = await supabase
      .from('component_weightage')
      .select(`
        *,
        batches:batch_id (name),
        semesters:semester_id (semester_number),
        unique_sub_degree:subject_id (sub_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Component Weightage not found" });
      }
      throw error;
    }

    res.status(200).json(weightage);
  } catch (error) {
    console.error("Error in getComponentWeightageById:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Component Weightage
exports.updateComponentWeightage = async (req, res) => {
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
      return res.status(404).json({ error: "Component Weightage not found" });
    }

    // Update values
    const { data: updatedWeightage, error: updateError } = await supabase
      .from('component_weightage')
      .update({ ese, cse, ia, tw, viva })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log("Updated Component Weightage:", updatedWeightage);
    res.status(200).json(updatedWeightage);
  } catch (error) {
    console.error("Error in updateComponentWeightage:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Component Weightage
exports.deleteComponentWeightage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if weightage exists
    const { data: existingWeightage, error: checkError } = await supabase
      .from('component_weightage')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingWeightage) {
      return res.status(404).json({ error: "Component Weightage not found" });
    }

    // Delete weightage
    const { error: deleteError } = await supabase
      .from('component_weightage')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    console.log("Deleted Component Weightage:", existingWeightage);
    res.status(200).json({ message: "Component Weightage deleted successfully" });
  } catch (error) {
    console.error("Error in deleteComponentWeightage:", error);
    res.status(500).json({ error: error.message });
  }
};
