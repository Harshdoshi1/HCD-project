const StudentCPI = require('../models/studentCPI');
const Batch = require('../models/batch');
const Semester = require('../models/semester');
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
        
        return res.status(200).json(studentCPIs);
    } catch (error) {
        console.error('Error fetching student CPI data by enrollment:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};