const { supabase } = require('../config/db');

// Add subject with components (weightage and marks)
const addSubjectWithComponents = async (req, res) => {
    try {
        const { subjectCode, components } = req.body;

        // Check if subject exists
        const { data: subject, error: subjectError } = await supabase
            .from('unique_sub_degrees')
            .select('sub_code')
            .eq('sub_code', subjectCode)
            .single();

        if (subjectError || !subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Add component weightages
        const weightageData = components.map(comp => ({
            subject_code: subjectCode,
            component_name: comp.name,
            weightage: comp.weightage
        }));

        const { error: weightageError } = await supabase
            .from('component_weightages')
            .insert(weightageData);

        if (weightageError) {
            throw weightageError;
        }

        // Add component marks
        const marksData = components.map(comp => ({
            subject_code: subjectCode,
            component_name: comp.name,
            max_marks: comp.maxMarks || 100,
            min_marks: comp.minMarks || 0
        }));

        const { error: marksError } = await supabase
            .from('component_marks')
            .insert(marksData);

        if (marksError) {
            throw marksError;
        }

        res.status(201).json({
            message: 'Components added successfully',
            weightages: weightageData,
            marks: marksData
        });
    } catch (error) {
        console.error('Error adding components:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addSubjectWithComponents
};
