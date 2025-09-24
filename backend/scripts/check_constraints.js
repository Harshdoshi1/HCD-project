/**
 * Check what constraints exist on the subject_component_cos table
 */

const { sequelize } = require('../models');

const checkConstraints = async () => {
    try {
        console.log('🔍 Checking constraints on subject_component_cos table...\n');

        // Show table structure
        const [results] = await sequelize.query('SHOW CREATE TABLE subject_component_cos');
        console.log('Table structure:');
        console.log(results[0]['Create Table']);

        console.log('\n' + '='.repeat(80) + '\n');

        // Show indexes
        const [indexes] = await sequelize.query('SHOW INDEX FROM subject_component_cos');
        console.log('Indexes:');
        indexes.forEach(index => {
            console.log(`- ${index.Key_name}: ${index.Column_name} (Unique: ${index.Non_unique === 0})`);
        });

    } catch (error) {
        console.error('❌ Error checking constraints:', error);
    }
};

// Run if executed directly
if (require.main === module) {
    checkConstraints().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Check failed:', error);
        process.exit(1);
    });
}

module.exports = { checkConstraints };
