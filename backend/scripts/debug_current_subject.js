/**
 * Debug script to check the current subject data
 */

const { ComponentWeightage, SubComponents, CourseOutcome, SubjectComponentCo } = require('../models');

const debugCurrentSubject = async () => {
    try {
        console.log('🔍 Debugging current subject data...\n');

        // Get the latest component weightage (should be the one you just created)
        const latestWeightage = await ComponentWeightage.findOne({
            order: [['id', 'DESC']],
            include: [{
                model: SubComponents,
                as: 'subComponents'
            }]
        });

        if (!latestWeightage) {
            console.log('❌ No component weightage found');
            return;
        }

        console.log(`📋 Latest Subject: ${latestWeightage.subjectId} (ID: ${latestWeightage.id})`);
        console.log(`Components: ESE=${latestWeightage.ese}%, IA=${latestWeightage.ia}%, VIVA=${latestWeightage.viva}%`);

        // Check subcomponents
        console.log(`\n📦 Subcomponents (${latestWeightage.subComponents.length} found):`);
        latestWeightage.subComponents.forEach(sc => {
            console.log(`  - ID: ${sc.id}, Name: "${sc.subComponentName}", Type: ${sc.componentType}`);
            console.log(`    Weightage: ${sc.weightage}%, Marks: ${sc.totalMarks}`);
            console.log(`    Selected COs: ${JSON.stringify(sc.selectedCOs)}`);
            console.log(`    Enabled: ${sc.isEnabled}`);
        });

        // Check course outcomes
        const courseOutcomes = await CourseOutcome.findAll({
            where: { subject_id: latestWeightage.subjectId }
        });
        console.log(`\n🎯 Course Outcomes (${courseOutcomes.length} found):`);
        courseOutcomes.forEach(co => {
            console.log(`  - ID: ${co.id}, Code: ${co.co_code}, Description: ${co.description}`);
        });

        // Check existing associations
        const associations = await SubjectComponentCo.findAll({
            where: { subject_component_id: latestWeightage.id },
            include: [{
                model: CourseOutcome,
                as: 'courseOutcome'
            }]
        });
        console.log(`\n🔗 Existing Associations (${associations.length} found):`);
        associations.forEach(assoc => {
            const compInfo = assoc.sub_component_id ? 
                `${assoc.component}.${assoc.sub_component_name}` : 
                `${assoc.component} (main)`;
            console.log(`  - ${compInfo} -> ${assoc.courseOutcome.co_code}`);
        });

        // Analyze what should be created
        console.log(`\n🔍 Analysis of what should exist:`);
        
        // ESE subcomponents
        const eseSubcomponents = latestWeightage.subComponents.filter(sc => sc.componentType === 'ESE');
        console.log(`ESE subcomponents: ${eseSubcomponents.length}`);
        eseSubcomponents.forEach(sc => {
            console.log(`  - ${sc.subComponentName}: COs = ${JSON.stringify(sc.selectedCOs)}`);
        });

        // IA subcomponents  
        const iaSubcomponents = latestWeightage.subComponents.filter(sc => sc.componentType === 'IA');
        console.log(`IA subcomponents: ${iaSubcomponents.length}`);
        iaSubcomponents.forEach(sc => {
            console.log(`  - ${sc.subComponentName}: COs = ${JSON.stringify(sc.selectedCOs)}`);
        });

        // VIVA (should be main component)
        if (latestWeightage.viva > 0) {
            console.log(`VIVA: Should have main component associations (weightage: ${latestWeightage.viva}%)`);
        }

    } catch (error) {
        console.error('❌ Error debugging:', error);
    }
};

// Run if executed directly
if (require.main === module) {
    debugCurrentSubject().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Debug failed:', error);
        process.exit(1);
    });
}

module.exports = { debugCurrentSubject };
