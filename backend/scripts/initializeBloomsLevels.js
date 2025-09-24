/**
 * Utility script to initialize all Bloom's taxonomy levels for existing student data
 * This script ensures that all students have entries for all 6 Bloom's levels (1-6)
 * in the student_blooms_distribution table for each subject they are enrolled in.
 * 
 * Usage:
 * node scripts/initializeBloomsLevels.js
 * 
 * Optional parameters:
 * - studentId: Initialize for specific student
 * - subjectId: Initialize for specific subject
 * - semesterNumber: Initialize for specific semester
 */

const { initializeBloomsLevelsForExistingData } = require('../utils/marksDistributionHelper');

const main = async () => {
    try {
        console.log('Starting Bloom\'s taxonomy levels initialization...');
        console.log('This will ensure all students have entries for all 6 Bloom\'s levels (1-6)');
        console.log('in the student_blooms_distribution table.\n');

        // Get command line arguments
        const args = process.argv.slice(2);
        let studentId = null;
        let subjectId = null;
        let semesterNumber = null;

        // Parse command line arguments
        for (let i = 0; i < args.length; i += 2) {
            const key = args[i];
            const value = args[i + 1];

            switch (key) {
                case '--studentId':
                    studentId = parseInt(value);
                    break;
                case '--subjectId':
                    subjectId = value;
                    break;
                case '--semesterNumber':
                    semesterNumber = parseInt(value);
                    break;
            }
        }

        if (studentId) console.log(`Filtering by Student ID: ${studentId}`);
        if (subjectId) console.log(`Filtering by Subject ID: ${subjectId}`);
        if (semesterNumber) console.log(`Filtering by Semester: ${semesterNumber}`);
        console.log('');

        // Run the initialization
        const result = await initializeBloomsLevelsForExistingData(studentId, subjectId, semesterNumber);

        console.log('\n=== INITIALIZATION COMPLETE ===');
        console.log(`✅ Success: ${result.success}`);
        console.log(`📊 Student-Subject-Semester combinations processed: ${result.combinationsProcessed}`);
        console.log(`📝 Placeholder entries created: ${result.placeholdersCreated}`);
        
        if (result.placeholdersCreated === 0) {
            console.log('🎉 All students already have complete Bloom\'s level entries!');
        } else {
            console.log('🎉 Missing Bloom\'s level entries have been created successfully!');
        }

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR during initialization:', error);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
};

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Process interrupted by user');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n\n⚠️  Process terminated');
    process.exit(1);
});

// Run the script
main();
