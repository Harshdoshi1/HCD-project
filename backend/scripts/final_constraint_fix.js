/**
 * Final fix to remove the problematic old constraint
 */

const { sequelize } = require('../models');

const finalConstraintFix = async () => {
    try {
        console.log('🔧 Final constraint fix...\n');

        // Drop the old problematic constraint
        try {
            await sequelize.query('ALTER TABLE subject_component_cos DROP INDEX uniq_subcomp_co');
            console.log('✅ Dropped old problematic constraint: uniq_subcomp_co');
        } catch (error) {
            console.log('⚠️ Could not drop old constraint:', error.message);
        }

        // Verify the constraints now
        const [indexes] = await sequelize.query('SHOW INDEX FROM subject_component_cos');
        console.log('\nRemaining indexes:');
        const uniqueIndexes = indexes.filter(index => index.Non_unique === 0 && index.Key_name !== 'PRIMARY');
        uniqueIndexes.forEach(index => {
            console.log(`- ${index.Key_name}: ${index.Column_name}`);
        });

        console.log('\n🎉 Constraint fix completed!');

    } catch (error) {
        console.error('❌ Constraint fix failed:', error);
        throw error;
    }
};

module.exports = { finalConstraintFix };

// Run if executed directly
if (require.main === module) {
    finalConstraintFix().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Constraint fix failed:', error);
        process.exit(1);
    });
}
