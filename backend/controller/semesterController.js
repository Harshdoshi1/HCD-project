const { supabase } = require('../config/db');

const addSemester = async (req, res) => {
    try {
        const { batchName, semesterNumber, startDate, endDate } = req.body;

        if (!batchName || !semesterNumber || !startDate || !endDate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find batch
        const { data: batch, error: batchError } = await supabase
            .from('batches')
            .select('id')
            .eq('name', batchName)
            .single();

        if (batchError || !batch) {
            return res.status(404).json({ message: "Batch not found." });
        }

        // Format dates
        const formattedStartDate = new Date(startDate).toISOString();
        const formattedEndDate = new Date(endDate).toISOString();

        // Create semester
        const { data: newSemester, error: semesterError } = await supabase
            .from('semesters')
            .insert({
                batch_id: batch.id,
                semester_number: semesterNumber,
                start_date: formattedStartDate,
                end_date: formattedEndDate
            })
            .select()
            .single();

        if (semesterError) {
            console.error('Error creating semester:', semesterError);
            return res.status(500).json({ 
                message: 'Failed to create semester', 
                error: semesterError.message 
            });
        }

        res.status(201).json({ 
            message: "Semester added successfully", 
            semester: newSemester 
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getSemestersByBatch = async (req, res) => {
    try {
        console.log("Received request with params:", req.params);

        const { batchName } = req.params;
        if (!batchName) {
            console.log("❌ Missing batchName in request.");
            return res.status(400).json({ message: "Batch name is required." });
        }

        console.log(`🔍 Searching for batch: ${batchName}`);
        
        // First get the batch
        const { data: batch, error: batchError } = await supabase
            .from('batches')
            .select('id')
            .eq('name', batchName)
            .single();

        if (batchError || !batch) {
            console.log(`❌ Batch '${batchName}' not found in DB.`);
            return res.status(404).json({ message: "Batch not found." });
        }

        console.log(`✅ Found batch with ID: ${batch.id}, fetching semesters...`);
        
        // Then get all semesters for this batch
        const { data: semesters, error: semesterError } = await supabase
            .from('semesters')
            .select('*')
            .eq('batch_id', batch.id)
            .order('semester_number', { ascending: true });

        if (semesterError) {
            console.error('Error fetching semesters:', semesterError);
            return res.status(500).json({ 
                message: 'Failed to fetch semesters', 
                error: semesterError.message 
            });
        }

        if (!semesters || semesters.length === 0) {
            console.log(`⚠️ No semesters found for batch ID: ${batch.id}`);
            return res.status(404).json({ message: "No semesters found for this batch." });
        }

        console.log(`✅ Found ${semesters.length} semesters. Sending response.`);
        res.status(200).json(semesters);
    } catch (error) {
        console.error("❌ Server Error:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    getSemestersByBatch,
    addSemester
};
