const { supabase } = require('../config/db');

const addBatch = async (req, res) => {
    try {
        const { batchName, batchStart, batchEnd, courseType } = req.body;

        // Input validation
        if (!batchName || !batchStart || !batchEnd || !courseType) {
            return res.status(400).json({ 
                message: 'Missing required fields', 
                error: 'All fields (batchName, batchStart, batchEnd, courseType) are required' 
            });
        }

        // Validate program type
        if (!['Degree', 'Diploma'].includes(courseType)) {
            return res.status(400).json({ 
                message: 'Invalid program type', 
                error: "Course type must be either 'Degree' or 'Diploma'" 
            });
        }

        // Parse start and end dates
        const startDate = new Date(batchStart);
        const endDate = new Date(batchEnd);

        // Format dates as ISO strings
        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = endDate.toISOString();

        // Check for existing batch with same name
        const { data: existingBatch, error: searchError } = await supabase
            .from('batches')
            .select('id')
            .eq('name', batchName)
            .single();

        if (searchError && searchError.code !== 'PGRST116') { // PGRST116 means no rows returned
            console.error('Error checking for existing batch:', searchError);
            return res.status(500).json({ 
                message: 'Server error', 
                error: searchError.message 
            });
        }

        if (existingBatch) {
            return res.status(400).json({ 
                message: 'Batch already exists', 
                error: 'A batch with this name already exists' 
            });
        }

        // Create new batch
        const { data: newBatch, error: insertError } = await supabase
            .from('batches')
            .insert({
                name: batchName,
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                program: courseType,
                current_semester: 1 // Default value for new batch
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating batch:', insertError);
            return res.status(500).json({ 
                message: 'Failed to create batch', 
                error: insertError.message 
            });
        }

        res.status(201).json({
            message: 'Batch created successfully',
            batch: newBatch
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Get all batches
const getAllBatches = async (req, res) => {
    try {
        console.log('Fetching all batches...');
        const { data: batches, error } = await supabase
            .from('batches')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching batches:', error);
            return res.status(500).json({ 
                message: 'Failed to fetch batches', 
                error: error.message 
            });
        }

        console.log('Batches fetched:', batches);
        res.status(200).json(batches);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Get batch by ID
const getBatchById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: batch, error } = await supabase
            .from('batches')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching batch:', error);
            return res.status(404).json({ 
                message: 'Batch not found', 
                error: error.message 
            });
        }

        res.status(200).json(batch);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Update batch
const updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, batchStart, batchEnd, program, current_semester } = req.body;

        // Check if batch exists
        const { data: existingBatch, error: searchError } = await supabase
            .from('batches')
            .select('id')
            .eq('id', id)
            .single();

        if (searchError) {
            return res.status(404).json({ 
                message: 'Batch not found', 
                error: 'The specified batch does not exist' 
            });
        }

        // Parse and format dates
        const startDate = new Date(batchStart);
        const endDate = new Date(batchEnd);
        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = endDate.toISOString();

        // Update batch
        const { data: updatedBatch, error: updateError } = await supabase
            .from('batches')
            .update({
                name,
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                program,
                current_semester
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating batch:', updateError);
            return res.status(500).json({ 
                message: 'Failed to update batch', 
                error: updateError.message 
            });
        }

        res.status(200).json({
            message: 'Batch updated successfully',
            batch: updatedBatch
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Delete batch
const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('batches')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting batch:', error);
            return res.status(500).json({ 
                message: 'Failed to delete batch', 
                error: error.message 
            });
        }

        res.status(200).json({
            message: 'Batch deleted successfully'
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

module.exports = {
    addBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch
};
