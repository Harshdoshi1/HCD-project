const { supabase } = require('../config/db');
const xlsx = require('xlsx');

// Upload student CPI/SPI data from Excel file
exports.uploadStudentCPI = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel file' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        // Validate required columns
        const requiredColumns = ['Batch', 'Semester', 'EnrollmentNumber', 'CPI', 'SPI', 'Rank'];
        const missingColumns = requiredColumns.filter(col => !data[0].hasOwnProperty(col));

        if (missingColumns.length > 0) {
            return res.status(400).json({
                message: `Missing required columns: ${missingColumns.join(', ')}`
            });
        }

        // Process and save data
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const row of data) {
            try {
                // Find batch by name
                const { data: batch, error: batchError } = await supabase
                    .from('batches')
                    .select('id')
                    .eq('name', row.Batch)
                    .single();

                if (batchError || !batch) {
                    results.failed++;
                    results.errors.push(`Batch not found: ${row.Batch} for enrollment ${row.EnrollmentNumber}`);
                    continue;
                }

                // Find semester by number and batch
                const { data: semester, error: semesterError } = await supabase
                    .from('semesters')
                    .select('id')
                    .eq('batch_id', batch.id)
                    .eq('semester_number', row.Semester)
                    .single();

                if (semesterError || !semester) {
                    results.failed++;
                    results.errors.push(`Semester ${row.Semester} not found for batch ${row.Batch}`);
                    continue;
                }

                // Check if record already exists
                const { data: existingRecord, error: existingError } = await supabase
                    .from('student_cpi')
                    .select('id')
                    .eq('batch_id', batch.id)
                    .eq('semester_id', semester.id)
                    .eq('enrollment_number', row.EnrollmentNumber)
                    .single();

                if (existingRecord) {
                    // Update existing record
                    const { error: updateError } = await supabase
                        .from('student_cpi')
                        .update({
                            cpi: row.CPI,
                            spi: row.SPI,
                            rank: row.Rank
                        })
                        .eq('id', existingRecord.id);

                    if (updateError) throw updateError;
                } else {
                    // Create new record
                    const { error: insertError } = await supabase
                        .from('student_cpi')
                        .insert({
                            batch_id: batch.id,
                            semester_id: semester.id,
                            enrollment_number: row.EnrollmentNumber,
                            cpi: row.CPI,
                            spi: row.SPI,
                            rank: row.Rank
                        });

                    if (insertError) throw insertError;
                }

                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Error processing row for ${row.EnrollmentNumber}: ${error.message}`);
            }
        }

        return res.status(200).json({
            message: 'Excel data processed',
            results
        });
    } catch (error) {
        console.error('Error uploading student CPI data:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all student CPI/SPI data
exports.getAllStudentCPI = async (req, res) => {
    try {
        const { data: studentCPIs, error } = await supabase
            .from('student_cpi')
            .select(`
                *,
                batches:batch_id (*),
                semesters:semester_id (*)
            `);

        if (error) throw error;

        res.status(200).json(studentCPIs);
    } catch (error) {
        console.error('Error fetching student CPI data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get student CPI/SPI data by batch
exports.getStudentCPIByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { data: studentCPIs, error } = await supabase
            .from('student_cpi')
            .select(`
                *,
                batches:batch_id (*),
                semesters:semester_id (*)
            `)
            .eq('batch_id', batchId);

        if (error) throw error;

        res.status(200).json(studentCPIs);
    } catch (error) {
        console.error('Error fetching student CPI data by batch:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get student CPI/SPI data by enrollment number
exports.getStudentCPIByEnrollment = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;
        console.log(`Searching for student CPI data with enrollment number: ${enrollmentNumber}`);

        const { data: studentCPIs, error } = await supabase
            .from('student_cpi')
            .select(`
                *,
                batches:batch_id (*),
                semesters:semester_id (*)
            `)
            .eq('enrollment_number', enrollmentNumber)
            .order('semester_id', { ascending: true });

        if (error) throw error;

        console.log(`Found ${studentCPIs?.length || 0} records for enrollment number: ${enrollmentNumber}`);

        if (!studentCPIs || studentCPIs.length === 0) {
            // If no records found, let's check if the enrollment number exists in the database
            const { data: allEnrollments, error: enrollmentError } = await supabase
                .from('student_cpi')
                .select('enrollment_number')
                .limit(100); // Limit to avoid too many results

            if (enrollmentError) throw enrollmentError;

            console.log('Available enrollment numbers in database:',
                allEnrollments.map(e => e.enrollment_number));
        }

        return res.status(200).json(studentCPIs || []);
    } catch (error) {
        console.error('Error fetching student CPI data by enrollment:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add test data for a specific enrollment number
exports.addTestData = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;
        console.log(`Adding test data for enrollment number: ${enrollmentNumber}`);

        // First check if the batch exists
        const { data: batch, error: batchError } = await supabase
            .from('batches')
            .select('id')
            .eq('name', 'Degree 22-26')
            .single();

        if (batchError || !batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        // Get all semesters for this batch
        const { data: semesters, error: semesterError } = await supabase
            .from('semesters')
            .select('id,semester_number')
            .eq('batch_id', batch.id)
            .order('semester_number', { ascending: true });

        if (semesterError || !semesters || semesters.length === 0) {
            return res.status(404).json({ message: 'No semesters found for this batch' });
        }

        // Create test data for each semester
        const createdRecords = [];

        for (const semester of semesters) {
            // Generate random CPI and SPI values (between 6 and 9.5)
            const spi = (6 + Math.random() * 3.5).toFixed(2);

            // CPI is the average of all SPIs up to this point
            // For simplicity, we'll make it slightly different from SPI
            const cpi = (parseFloat(spi) + (Math.random() * 0.4 - 0.2)).toFixed(2);

            // Random rank between 1 and 50
            const rank = Math.floor(Math.random() * 50) + 1;

            const { data: record, error: insertError } = await supabase
                .from('student_cpi')
                .insert({
                    batch_id: batch.id,
                    semester_id: semester.id,
                    enrollment_number: enrollmentNumber,
                    cpi: cpi,
                    spi: spi,
                    rank: rank
                })
                .select()
                .single();

            if (insertError) throw insertError;
            createdRecords.push(record);
        }

        return res.status(201).json({
            message: `Created ${createdRecords.length} test records for enrollment number ${enrollmentNumber}`,
            records: createdRecords
        });
    } catch (error) {
        console.error('Error adding test data:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStudentCPIByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        
        // Fetch student by email
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .single();

        if (studentError) {
            if (studentError.code === 'PGRST116') {
                return res.status(404).json({ message: 'Student not found' });
            }
            throw studentError;
        }

        // Fetch CPI records
        const { data: studentCPIs, error: cpiError } = await supabase
            .from('student_cpi')
            .select(`
                *,
                batches:batch_id (*),
                semesters:semester_id (*)
            `)
            .eq('enrollment_number', student.enrollment_number);

        if (cpiError) throw cpiError;

        if (!studentCPIs || studentCPIs.length === 0) {
            return res.status(404).json({
                message: 'No CPI records found for this student',
                studentInfo: {
                    name: student.name,
                    enrollmentNumber: student.enrollment_number,
                    email: student.email,
                    currentSemester: student.current_semester
                }
            });
        }

        return res.status(200).json(studentCPIs);
    } catch (error) {
        console.error('Error fetching student CPI data by email:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
