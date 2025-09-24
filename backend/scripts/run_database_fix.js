/**
 * Script to run the database fix using Sequelize
 */

const { sequelize } = require('../models');

const runDatabaseFix = async () => {
    try {
        console.log('🔧 Starting database structure fix...\n');

        // Step 1: Drop the old index if it exists
        try {
            await sequelize.query('ALTER TABLE subject_component_cos DROP INDEX IF EXISTS uniq_subcomp_co');
            console.log('✅ Dropped old index (if it existed)');
        } catch (error) {
            console.log('⚠️ Could not drop old index (might not exist):', error.message);
        }

        // Step 2: Add the new correct unique constraint
        try {
            await sequelize.query(`
                ALTER TABLE subject_component_cos 
                ADD UNIQUE KEY uniq_subcomp_co_fixed (
                    subject_component_id, 
                    course_outcome_id, 
                    component, 
                    IFNULL(sub_component_id, -1)
                )
            `);
            console.log('✅ Added new correct unique constraint');
        } catch (error) {
            console.log('⚠️ Error adding new constraint:', error.message);
        }

        // Step 3: Update CA entries to CSE
        try {
            const [results] = await sequelize.query(`
                UPDATE subject_component_cos 
                SET component = 'CSE' 
                WHERE component = 'CA'
            `);
            console.log('✅ Updated CA entries to CSE');
        } catch (error) {
            console.log('⚠️ Error updating CA to CSE:', error.message);
        }

        console.log('\n🎉 Database structure fix completed!');

    } catch (error) {
        console.error('❌ Database fix failed:', error);
        throw error;
    }
};

module.exports = { runDatabaseFix };

// Run if executed directly
if (require.main === module) {
    runDatabaseFix().then(() => {
        console.log('Database fix completed successfully');
        process.exit(0);
    }).catch(error => {
        console.error('Database fix failed:', error);
        process.exit(1);
    });
}
