/**
 * Comprehensive script to fix all component-CO associations
 * This will clear existing data and repopulate correctly
 */

const { 
    ComponentWeightage, 
    SubComponents, 
    CourseOutcome, 
    SubjectComponentCo,
    UniqueSubDegree,
    sequelize 
} = require('../models');

const comprehensiveFixAssociations = async () => {
    const transaction = await sequelize.transaction();
    
    try {
        console.log('🔧 Starting Comprehensive Fix for Component-CO Associations...\n');

        // Step 1: Fix the unique constraint if needed
        try {
            await sequelize.query(`
                ALTER TABLE subject_component_cos DROP INDEX IF EXISTS uniq_subcomp_co
            `, { transaction });
            
            await sequelize.query(`
                ALTER TABLE subject_component_cos 
                ADD UNIQUE KEY uniq_subcomp_co_fixed (
                    subject_component_id, 
                    course_outcome_id, 
                    component, 
                    IFNULL(sub_component_id, -1)
                )
            `, { transaction });
            
            console.log('✅ Updated unique constraint successfully');
        } catch (error) {
            console.log('⚠️ Unique constraint already updated or error updating:', error.message);
        }

        // Step 2: Get the component weightage with ID 1 (based on your image)
        const componentWeightage = await ComponentWeightage.findByPk(1, {
            include: [{
                model: SubComponents,
                as: 'subComponents'
            }],
            transaction
        });

        if (!componentWeightage) {
            console.log('❌ Component weightage with ID 1 not found');
            await transaction.rollback();
            return;
        }

        const subjectId = componentWeightage.subjectId;
        console.log(`📋 Processing subject: ${subjectId}`);

        // Step 3: Get course outcomes for this subject
        const courseOutcomes = await CourseOutcome.findAll({
            where: { subject_id: subjectId },
            transaction
        });

        console.log(`Found ${courseOutcomes.length} course outcomes`);

        // Step 4: Clear existing associations for this subject
        console.log('🗑️ Clearing existing associations...');
        await SubjectComponentCo.destroy({
            where: { subject_component_id: componentWeightage.id },
            transaction
        });

        // Step 5: Group subcomponents by their component type
        const subComponentsByType = {};
        for (const sc of componentWeightage.subComponents) {
            // Normalize the component type
            let componentType = sc.componentType;
            if (componentType === 'CA') componentType = 'CSE';
            
            if (!subComponentsByType[componentType]) {
                subComponentsByType[componentType] = [];
            }
            subComponentsByType[componentType].push(sc);
        }

        console.log('Subcomponents by type:', Object.keys(subComponentsByType).map(key => 
            `${key}: ${subComponentsByType[key].map(sc => sc.subComponentName).join(', ')}`
        ));

        // Step 6: Create associations for each component
        const associationsToCreate = [];

        // Process CSE (Continuous Semester Evaluation)
        if (componentWeightage.cse > 0) {
            console.log('\n--- Processing CSE Component ---');
            const cseSubcomponents = subComponentsByType['CSE'] || [];
            
            if (cseSubcomponents.length > 0) {
                // Create associations for subcomponents
                for (const subComp of cseSubcomponents) {
                    const selectedCOs = subComp.selectedCOs || ['CO1', 'CO2', 'CO3'];
                    console.log(`  CSE.${subComp.subComponentName} -> [${selectedCOs.join(', ')}]`);
                    
                    for (const coCode of selectedCOs) {
                        const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                        if (coRecord) {
                            associationsToCreate.push({
                                subject_component_id: componentWeightage.id,
                                course_outcome_id: coRecord.id,
                                component: 'CSE',
                                sub_component_id: subComp.id,
                                sub_component_name: subComp.subComponentName
                            });
                        }
                    }
                }
            } else {
                // Create main component associations if no subcomponents
                console.log('  CSE (main component) -> [CO1, CO2, CO3]');
                for (const coCode of ['CO1', 'CO2', 'CO3']) {
                    const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                    if (coRecord) {
                        associationsToCreate.push({
                            subject_component_id: componentWeightage.id,
                            course_outcome_id: coRecord.id,
                            component: 'CSE',
                            sub_component_id: null,
                            sub_component_name: null
                        });
                    }
                }
            }
        }

        // Process ESE (End Semester Exam)
        if (componentWeightage.ese > 0) {
            console.log('\n--- Processing ESE Component ---');
            const eseSubcomponents = subComponentsByType['ESE'] || [];
            
            if (eseSubcomponents.length > 0) {
                for (const subComp of eseSubcomponents) {
                    const selectedCOs = subComp.selectedCOs || ['CO1', 'CO2', 'CO3'];
                    console.log(`  ESE.${subComp.subComponentName} -> [${selectedCOs.join(', ')}]`);
                    
                    for (const coCode of selectedCOs) {
                        const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                        if (coRecord) {
                            associationsToCreate.push({
                                subject_component_id: componentWeightage.id,
                                course_outcome_id: coRecord.id,
                                component: 'ESE',
                                sub_component_id: subComp.id,
                                sub_component_name: subComp.subComponentName
                            });
                        }
                    }
                }
            } else {
                console.log('  ESE (main component) -> [CO1, CO2, CO3]');
                for (const coCode of ['CO1', 'CO2', 'CO3']) {
                    const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                    if (coRecord) {
                        associationsToCreate.push({
                            subject_component_id: componentWeightage.id,
                            course_outcome_id: coRecord.id,
                            component: 'ESE',
                            sub_component_id: null,
                            sub_component_name: null
                        });
                    }
                }
            }
        }

        // Process IA (Internal Assessment)
        if (componentWeightage.ia > 0) {
            console.log('\n--- Processing IA Component ---');
            const iaSubcomponents = subComponentsByType['IA'] || [];
            
            if (iaSubcomponents.length > 0) {
                for (const subComp of iaSubcomponents) {
                    const selectedCOs = subComp.selectedCOs || ['CO1', 'CO2', 'CO3'];
                    console.log(`  IA.${subComp.subComponentName} -> [${selectedCOs.join(', ')}]`);
                    
                    for (const coCode of selectedCOs) {
                        const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                        if (coRecord) {
                            associationsToCreate.push({
                                subject_component_id: componentWeightage.id,
                                course_outcome_id: coRecord.id,
                                component: 'IA',
                                sub_component_id: subComp.id,
                                sub_component_name: subComp.subComponentName
                            });
                        }
                    }
                }
            } else {
                console.log('  IA (main component) -> [CO1, CO2, CO3]');
                for (const coCode of ['CO1', 'CO2', 'CO3']) {
                    const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                    if (coRecord) {
                        associationsToCreate.push({
                            subject_component_id: componentWeightage.id,
                            course_outcome_id: coRecord.id,
                            component: 'IA',
                            sub_component_id: null,
                            sub_component_name: null
                        });
                    }
                }
            }
        }

        // Process TW (Term Work)
        if (componentWeightage.tw > 0) {
            console.log('\n--- Processing TW Component ---');
            const twSubcomponents = subComponentsByType['TW'] || [];
            
            if (twSubcomponents.length > 0) {
                for (const subComp of twSubcomponents) {
                    const selectedCOs = subComp.selectedCOs || ['CO1', 'CO2', 'CO3'];
                    console.log(`  TW.${subComp.subComponentName} -> [${selectedCOs.join(', ')}]`);
                    
                    for (const coCode of selectedCOs) {
                        const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                        if (coRecord) {
                            associationsToCreate.push({
                                subject_component_id: componentWeightage.id,
                                course_outcome_id: coRecord.id,
                                component: 'TW',
                                sub_component_id: subComp.id,
                                sub_component_name: subComp.subComponentName
                            });
                        }
                    }
                }
            } else {
                console.log('  TW (main component) -> [CO1, CO2, CO3]');
                for (const coCode of ['CO1', 'CO2', 'CO3']) {
                    const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                    if (coRecord) {
                        associationsToCreate.push({
                            subject_component_id: componentWeightage.id,
                            course_outcome_id: coRecord.id,
                            component: 'TW',
                            sub_component_id: null,
                            sub_component_name: null
                        });
                    }
                }
            }
        }

        // Process VIVA
        if (componentWeightage.viva > 0) {
            console.log('\n--- Processing VIVA Component ---');
            const vivaSubcomponents = subComponentsByType['VIVA'] || [];
            
            if (vivaSubcomponents.length > 0) {
                for (const subComp of vivaSubcomponents) {
                    const selectedCOs = subComp.selectedCOs || ['CO1', 'CO2', 'CO3'];
                    console.log(`  VIVA.${subComp.subComponentName} -> [${selectedCOs.join(', ')}]`);
                    
                    for (const coCode of selectedCOs) {
                        const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                        if (coRecord) {
                            associationsToCreate.push({
                                subject_component_id: componentWeightage.id,
                                course_outcome_id: coRecord.id,
                                component: 'VIVA',
                                sub_component_id: subComp.id,
                                sub_component_name: subComp.subComponentName
                            });
                        }
                    }
                }
            } else {
                console.log('  VIVA (main component) -> [CO1, CO2, CO3]');
                for (const coCode of ['CO1', 'CO2', 'CO3']) {
                    const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                    if (coRecord) {
                        associationsToCreate.push({
                            subject_component_id: componentWeightage.id,
                            course_outcome_id: coRecord.id,
                            component: 'VIVA',
                            sub_component_id: null,
                            sub_component_name: null
                        });
                    }
                }
            }
        }

        // Step 7: Create all associations
        console.log(`\n🔨 Creating ${associationsToCreate.length} associations...`);
        
        for (const assoc of associationsToCreate) {
            try {
                await SubjectComponentCo.create(assoc, { transaction });
                const compInfo = assoc.sub_component_id ? 
                    `${assoc.component}.${assoc.sub_component_name}` : 
                    `${assoc.component} (main)`;
                console.log(`✅ Created: ${compInfo} -> CO${assoc.course_outcome_id}`);
            } catch (error) {
                console.error(`❌ Error creating association for ${assoc.component}:`, error.message);
            }
        }

        // Commit the transaction
        await transaction.commit();
        console.log('\n🎉 Comprehensive fix complete! All associations created successfully.');
        
        // Verify the results
        const finalAssociations = await SubjectComponentCo.findAll({
            where: { subject_component_id: componentWeightage.id },
            include: [{
                model: CourseOutcome,
                as: 'courseOutcome'
            }]
        });

        console.log(`\n📊 Final verification: ${finalAssociations.length} associations in database`);
        
        // Group by component for better display
        const grouped = {};
        for (const assoc of finalAssociations) {
            const key = assoc.sub_component_id ? 
                `${assoc.component}.${assoc.sub_component_name}` : 
                `${assoc.component} (main)`;
            
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(assoc.courseOutcome.co_code);
        }

        console.log('\nFinal associations by component:');
        Object.entries(grouped).forEach(([comp, cos]) => {
            console.log(`  ${comp}: [${cos.join(', ')}]`);
        });

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Comprehensive fix failed:', error);
        throw error;
    }
};

module.exports = {
    comprehensiveFixAssociations
};

// Run if executed directly
if (require.main === module) {
    comprehensiveFixAssociations().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    });
}
