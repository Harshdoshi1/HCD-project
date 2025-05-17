const StudentCPI = require('../models/studentCPI');
const Batch = require('../models/batch');
const Semester = require('../models/semester');
const Student = require('../models/students');
const xlsx = require('xlsx');
const { Op } = require('sequelize');

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
                const batch = await Batch.findOne({
                    where: { batchName: row.Batch }
                });

                if (!batch) {
                    results.failed++;
                    results.errors.push(`Batch not found: ${row.Batch} for enrollment ${row.EnrollmentNumber}`);
                    continue;
                }

                // Find semester by number and batch
                const semester = await Semester.findOne({
                    where: {
                        batchId: batch.id,
                        semesterNumber: row.Semester
                    }
                });

                if (!semester) {
                    results.failed++;
                    results.errors.push(`Semester ${row.Semester} not found for batch ${row.Batch}`);
                    continue;
                }

                // Check if record already exists
                const existingRecord = await StudentCPI.findOne({
                    where: {
                        BatchId: batch.id,
                        SemesterId: semester.id,
                        EnrollmentNumber: row.EnrollmentNumber
                    }
                });

                if (existingRecord) {
                    // Update existing record
                    await existingRecord.update({
                        CPI: row.CPI,
                        SPI: row.SPI,
                        Rank: row.Rank
                    });
                } else {
                    // Create new record
                    await StudentCPI.create({
                        BatchId: batch.id,
                        SemesterId: semester.id,
                        EnrollmentNumber: row.EnrollmentNumber,
                        CPI: row.CPI,
                        SPI: row.SPI,
                        Rank: row.Rank
                    });
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
        const studentCPIs = await StudentCPI.findAll({
            include: [
                { model: Batch },
                { model: Semester }
            ]
        });

        return res.status(200).json(studentCPIs);
    } catch (error) {
        console.error('Error fetching student CPI data:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get student CPI/SPI data by batch
exports.getStudentCPIByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;

        const studentCPIs = await StudentCPI.findAll({
            where: { BatchId: batchId },
            include: [
                { model: Batch },
                { model: Semester }
            ]
        });

        return res.status(200).json(studentCPIs);
    } catch (error) {
        console.error('Error fetching student CPI data by batch:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get student CPI/SPI data by enrollment number
exports.getStudentCPIByEnrollment = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;
        console.log(`Searching for student CPI data with enrollment number: ${enrollmentNumber}`);

        const studentCPIs = await StudentCPI.findAll({
            where: { EnrollmentNumber: enrollmentNumber },
            include: [
                { model: Batch },
                { model: Semester }
            ],
            order: [
                [{ model: Semester }, 'semesterNumber', 'ASC']
            ]
        });

        console.log(`Found ${studentCPIs.length} records for enrollment number: ${enrollmentNumber}`);

        if (studentCPIs.length === 0) {
            // If no records found, let's check if the enrollment number exists in the database
            const allEnrollments = await StudentCPI.findAll({
                attributes: ['EnrollmentNumber'],
                group: ['EnrollmentNumber']
            });

            console.log('Available enrollment numbers in database:',
                allEnrollments.map(e => e.EnrollmentNumber));
        }
        return res.status(200).json(studentCPIs);
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
        const batch = await Batch.findOne({ where: { batchName: 'Degree 22-26' } });
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        // Get all semesters for this batch
        const semesters = await Semester.findAll({
            where: { batchId: batch.id },
            order: [['semesterNumber', 'ASC']]
        });

        if (semesters.length === 0) {
            return res.status(404).json({ message: 'No semesters found for this batch' });
        }

        // Create test data for each semester
        const createdRecords = [];

        for (let i = 0; i < semesters.length; i++) {
            const semester = semesters[i];

            // Generate random CPI and SPI values (between 6 and 9.5)
            const spi = (6 + Math.random() * 3.5).toFixed(2);

            // CPI is the average of all SPIs up to this point
            // For simplicity, we'll make it slightly different from SPI
            const cpi = (parseFloat(spi) + (Math.random() * 0.4 - 0.2)).toFixed(2);

            // Random rank between 1 and 50
            const rank = Math.floor(Math.random() * 50) + 1;

            const record = await StudentCPI.create({
                BatchId: batch.id,
                SemesterId: semester.id,
                EnrollmentNumber: enrollmentNumber,
                CPI: cpi,
                SPI: spi,
                Rank: rank
            });

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
        const student = await Student.findOne({
            where: { email }
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log('Found student:', student.dataValues);

        try {
            const enrollmentNumber = student.enrollmentNumber;

            const studentCPIs = await StudentCPI.findAll({
                where: {
                    EnrollmentNumber: enrollmentNumber
                },

            });

            if (studentCPIs.length === 0) {
                return res.status(404).json({
                    message: 'No CPI records found for this student',
                    studentInfo: {
                        name: student.name,
                        enrollmentNumber: student.enrollmentNumber,
                        email: student.email,
                        currentSemester: student.currnetsemester
                    }
                });
            }

            // Return all CPI records for this student
            return res.status(200).json(studentCPIs);

        } catch (error) {
            console.error('Error fetching student CPI data by enrollment:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    } catch (error) {
        console.error('Error fetching student CPI data by email:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
