const { supabase } = require('../config/db');

// Create Component Marks
const createComponentMarks = async (req, res) => {
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

    // Create Component Marks
    const { data: newMarks, error: createError } = await supabase
      .from('component_marks')
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
    const { data: marks, error } = await supabase
      .from('component_marks')
      .select(`
        *,
        unique_sub_degree:subject_id (sub_name)
      `);

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
    const { data: marks, error } = await supabase
      .from('component_marks')
      .select(`
        *,
        unique_sub_degree:subject_id (sub_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Component Marks not found" });
      }
      throw error;
    }

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

    // Check if marks exist
    const { data: existingMarks, error: checkError } = await supabase
      .from('component_marks')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingMarks) {
      return res.status(404).json({ error: "Component Marks not found" });
    }

    // Update values
    const { data: updatedMarks, error: updateError } = await supabase
      .from('component_marks')
      .update({ ese, cse, ia, tw, viva })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log("Updated Component Marks:", updatedMarks);
    res.status(200).json(updatedMarks);
  } catch (error) {
    console.error("Error in updateComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete Component Marks
const deleteComponentMarks = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if marks exist
    const { data: existingMarks, error: checkError } = await supabase
      .from('component_marks')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingMarks) {
      return res.status(404).json({ error: "Component Marks not found" });
    }

    // Delete marks
    const { error: deleteError } = await supabase
      .from('component_marks')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    console.log("Deleted Component Marks:", existingMarks);
    res.status(200).json({ message: "Component Marks deleted successfully" });
  } catch (error) {
    console.error("Error in deleteComponentMarks:", error);
    res.status(500).json({ error: error.message });
  }
};

const addSubjectWithComponents = async (req, res) => {
  try {
    const { subject, name, credits, componentsWeightage, componentsMarks } = req.body;

    // Fetch Subject ID
    const { data: subjectRecord, error: subjectError } = await supabase
      .from('unique_sub_degree')
      .select('id')
      .eq('sub_code', subject)
      .single();

    if (subjectError || !subjectRecord) {
      return res.status(400).json({ error: "Subject not found" });
    }

    // Update credits and name in UniqueSubDegree
    const updateData = {};
    if (typeof credits === 'number') {
      updateData.credits = credits;
    }
    if (name) {
      updateData.sub_name = name;
    }
    
    const { error: updateError } = await supabase
      .from('unique_sub_degree')
      .update(updateData)
      .eq('id', subjectRecord.id);

    if (updateError) throw updateError;

    // Prepare mapping helper
    function mapComponents(components) {
      const map = { ESE: 0, CSE: 0, IA: 0, TW: 0, VIVA: 0 };
      if (Array.isArray(components)) {
        components.forEach(comp => {
          if (comp.name && typeof comp.value === 'number') {
            const key = comp.name.toUpperCase();
            if (map.hasOwnProperty(key)) {
              map[key] = comp.value;
            }
          } else if (comp.name && typeof comp.weightage === 'number') {
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
    const { data: newWeightage, error: weightageError } = await supabase
      .from('component_weightage')
      .insert({
        subject_id: subjectRecord.id,
        ese: weightageMap.ESE,
        cse: weightageMap.CSE,
        ia: weightageMap.IA,
        tw: weightageMap.TW,
        viva: weightageMap.VIVA
      })
      .select()
      .single();

    if (weightageError) throw weightageError;

    // Insert into ComponentMarks
    const { data: newMarks, error: marksError } = await supabase
      .from('component_marks')
      .insert({
        subject_id: subjectRecord.id,
        ese: marksMap.ESE,
        cse: marksMap.CSE,
        ia: marksMap.IA,
        tw: marksMap.TW,
        viva: marksMap.VIVA
      })
      .select()
      .single();

    if (marksError) throw marksError;

    res.status(201).json({
      weightage: newWeightage,
      marks: newMarks
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
    
    // First get the subject ID
    const { data: subject, error: subjectError } = await supabase
      .from('unique_sub_degree')
      .select('id')
      .eq('sub_code', subjectCode)
      .single();

    if (subjectError || !subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Get marks for the subject
    const { data: marks, error: marksError } = await supabase
      .from('component_marks')
      .select(`
        *,
        unique_sub_degree:subject_id (sub_name)
      `)
      .eq('subject_id', subject.id)
      .single();

    if (marksError) {
      if (marksError.code === 'PGRST116') {
        return res.status(404).json({ error: "Component Marks not found for this subject" });
      }
      throw marksError;
    }

    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in getComponentMarksBySubject:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  deleteComponentMarks, 
  addSubjectWithComponents, 
  updateComponentMarks, 
  getComponentMarksById, 
  getAllComponentMarks, 
  createComponentMarks,
  getComponentMarksBySubject
}
