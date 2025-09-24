/**
 * Simple script to fix the database constraint issue
 */

const { sequelize } = require('../models');

const simpleDatabaseFix = async () => {
    try {
        console.log('🔧 Starting simple database fix...\n');

        // Step 1: Try to drop the old index (without IF EXISTS)
        try {
            await sequelize.query('ALTER TABLE subject_component_cos DROP INDEX uniq_subcomp_co');
            console.log('✅ Dropped old index');
        } catch (error) {
            console.log('⚠️ Old index might not exist or has different name:', error.message);
        }

        // Step 2: Add new constraint with simpler syntax
        try {
            await sequelize.query(`
                ALTER TABLE subject_component_cos 
                ADD UNIQUE KEY uniq_subcomp_co_new (
                    subject_component_id, 
                    course_outcome_id, 
                    component, 
                    sub_component_id
                )
            `);
            console.log('✅ Added new unique constraint');
        } catch (error) {
            console.log('⚠️ Error adding new constraint (might already exist):', error.message);
        }

        // Step 3: Update CA entries to CSE (this worked before)
        try {
            await sequelize.query(`
                UPDATE subject_component_cos 
                SET component = 'CSE' 
                WHERE component = 'CA'
            `);
            console.log('✅ Updated CA entries to CSE');
        } catch (error) {
            console.log('⚠️ Error updating CA to CSE:', error.message);
        }

        console.log('\n🎉 Simple database fix completed!');

    } catch (error) {
        console.error('❌ Database fix failed:', error);
        throw error;
    }
};

module.exports = { simpleDatabaseFix };

// Run if executed directly
if (require.main === module) {
    simpleDatabaseFix().then(() => {
        console.log('Simple database fix completed successfully');
        process.exit(0);
    }).catch(error => {
        console.error('Simple database fix failed:', error);
        process.exit(1);
    });
}
