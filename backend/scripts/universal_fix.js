/**
 * Universal fix that works regardless of existing data
 */

const { ComponentWeightage, SubComponents, CourseOutcome, SubjectComponentCo } = require('../models');

const universalFix = async () => {
    try {
        console.log('🔧 Starting Universal Fix...\n');

        // Find any existing component weightages
        const componentWeightages = await ComponentWeightage.findAll({
            include: [{
                model: SubComponents,
                as: 'subComponents'
            }]
        });

        if (componentWeightages.length === 0) {
            console.log('⚠️ No component weightages found in database.');
            console.log('This is normal if you haven\'t created any subjects yet.');
            console.log('The system is now ready for new subject creation with the fixed structure.');
            return;
        }

        console.log(`Found ${componentWeightages.length} component weightages to process`);

        for (const componentWeightage of componentWeightages) {
            const subjectId = componentWeightage.subjectId;
            console.log(`\n--- Processing Subject: ${subjectId} (ID: ${componentWeightage.id}) ---`);

            // Get course outcomes for this subject
            const courseOutcomes = await CourseOutcome.findAll({
                where: { subject_id: subjectId }
            });

            if (courseOutcomes.length === 0) {
                console.log(`⚠️ No course outcomes found for subject ${subjectId}`);
                continue;
            }

            console.log(`Found ${courseOutcomes.length} course outcomes`);

            // Clear existing associations for this subject
            await SubjectComponentCo.destroy({
                where: { subject_component_id: componentWeightage.id }
            });
            console.log('🗑️ Cleared existing associations');

            // Create associations for each component that has weightage > 0
            const associationsToCreate = [];

            // Process each component type
            const components = [
                { name: 'CSE', field: 'cse' },
                { name: 'ESE', field: 'ese' },
                { name: 'IA', field: 'ia' },
                { name: 'TW', field: 'tw' },
                { name: 'VIVA', field: 'viva' }
            ];

            for (const comp of components) {
                const weightage = componentWeightage[comp.field];
                if (weightage && weightage > 0) {
                    console.log(`\n  Processing ${comp.name} (weightage: ${weightage}%)`);

                    // Check if this component has subcomponents
                    const subcomponents = componentWeightage.subComponents.filter(sc => 
                        sc.componentType === comp.name || 
                        (comp.name === 'CSE' && sc.componentType === 'CA')
                    );

                    if (subcomponents.length > 0) {
                        console.log(`    Found ${subcomponents.length} subcomponents`);
                        
                        // Create associations for subcomponents
                        for (const subComp of subcomponents) {
                            const selectedCOs = subComp.selectedCOs || ['CO1', 'CO2', 'CO3'];
                            console.log(`      ${subComp.subComponentName} -> [${selectedCOs.join(', ')}]`);
                            
                            for (const coCode of selectedCOs) {
                                const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                                if (coRecord) {
                                    associationsToCreate.push({
                                        subject_component_id: componentWeightage.id,
                                        course_outcome_id: coRecord.id,
                                        component: comp.name,
                                        sub_component_id: subComp.id,
                                        sub_component_name: subComp.subComponentName
                                    });
                                }
                            }
                        }
                    } else {
                        console.log(`    No subcomponents, creating main component associations`);
                        
                        // Create main component associations
                        const defaultCOs = ['CO1', 'CO2', 'CO3'];
                        for (const coCode of defaultCOs) {
                            const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                            if (coRecord) {
                                associationsToCreate.push({
                                    subject_component_id: componentWeightage.id,
                                    course_outcome_id: coRecord.id,
                                    component: comp.name,
                                    sub_component_id: null,
                                    sub_component_name: null
                                });
                            }
                        }
                    }
                }
            }

            // Create all associations
            console.log(`\n  🔨 Creating ${associationsToCreate.length} associations...`);
            
            for (const assoc of associationsToCreate) {
                try {
                    await SubjectComponentCo.create(assoc);
                    const compInfo = assoc.sub_component_id ? 
                        `${assoc.component}.${assoc.sub_component_name}` : 
                        `${assoc.component} (main)`;
                    console.log(`    ✅ ${compInfo} -> CO${assoc.course_outcome_id}`);
                } catch (error) {
                    console.error(`    ❌ Error creating association:`, error.message);
                }
            }
        }

        console.log('\n🎉 Universal fix completed successfully!');

        // Final verification
        const totalAssociations = await SubjectComponentCo.count();
        console.log(`\n📊 Total associations in database: ${totalAssociations}`);

    } catch (error) {
        console.error('❌ Universal fix failed:', error);
        throw error;
    }
};

module.exports = { universalFix };

// Run if executed directly
if (require.main === module) {
    universalFix().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Universal fix failed:', error);
        process.exit(1);
    });
}
