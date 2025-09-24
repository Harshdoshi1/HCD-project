/**
 * Script to check existing data in the database
 */

const { ComponentWeightage, SubComponents, CourseOutcome, SubjectComponentCo } = require('../models');

const checkData = async () => {
    try {
        console.log('🔍 Checking existing data...\n');

        // Check component weightages
        const componentWeightages = await ComponentWeightage.findAll();
        console.log(`Found ${componentWeightages.length} component weightages:`);
        componentWeightages.forEach(cw => {
            console.log(`  ID: ${cw.id}, Subject: ${cw.subjectId}`);
        });

        // Check subcomponents
        const subComponents = await SubComponents.findAll();
        console.log(`\nFound ${subComponents.length} subcomponents:`);
        subComponents.forEach(sc => {
            console.log(`  ID: ${sc.id}, Name: ${sc.subComponentName}, Type: ${sc.componentType}, WeightageId: ${sc.componentWeightageId}`);
        });

        // Check course outcomes
        const courseOutcomes = await CourseOutcome.findAll();
        console.log(`\nFound ${courseOutcomes.length} course outcomes:`);
        courseOutcomes.forEach(co => {
            console.log(`  ID: ${co.id}, Code: ${co.co_code}, Subject: ${co.subject_id}`);
        });

        // Check existing associations
        const associations = await SubjectComponentCo.findAll();
        console.log(`\nFound ${associations.length} existing associations:`);
        associations.forEach(assoc => {
            console.log(`  ID: ${assoc.id}, Component: ${assoc.component}, SubCompId: ${assoc.sub_component_id}, COId: ${assoc.course_outcome_id}`);
        });

    } catch (error) {
        console.error('❌ Error checking data:', error);
    }
};

// Run if executed directly
if (require.main === module) {
    checkData().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Check data failed:', error);
        process.exit(1);
    });
}

module.exports = { checkData };
