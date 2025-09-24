const { 
    ComponentWeightage, 
    ComponentMarks, 
    SubComponents, 
    SubjectComponentCo,
    CourseOutcome,
    sequelize 
} = require('../models');

const fixSubComponentsTable = async () => {
    try {
        console.log('🔧 Starting SubComponents table fix...');
        
        // Step 1: Update the database schema to allow NULL for subComponentName
        console.log('📝 Updating database schema to allow NULL for subComponentName...');
        await sequelize.query(`
            ALTER TABLE SubComponents 
            MODIFY COLUMN subComponentName VARCHAR(255) NULL;
        `);
        console.log('✅ Schema updated successfully');

        // Step 2: Find all ComponentWeightage records
        const allWeightages = await ComponentWeightage.findAll();

        console.log(`📊 Found ${allWeightages.length} component weightage records`);

        let createdMainComponents = 0;
        let updatedAssociations = 0;

        // Step 3: Process each weightage record
        for (const weightage of allWeightages) {
            console.log(`\n🔍 Processing subject: ${weightage.subjectId}`);
            
            // Get existing sub-components for this weightage
            const existingSubComponents = await SubComponents.findAll({
                where: { componentWeightageId: weightage.id }
            });

            // Get component marks for this subject
            const componentMarks = await ComponentMarks.findOne({
                where: { subjectId: weightage.subjectId }
            });

            // Define component types and their values
            const componentTypes = [
                { type: 'CA', weightageField: 'cse', marksField: 'cse' },
                { type: 'CSE', weightageField: 'cse', marksField: 'cse' },
                { type: 'ESE', weightageField: 'ese', marksField: 'ese' },
                { type: 'IA', weightageField: 'ia', marksField: 'ia' },
                { type: 'TW', weightageField: 'tw', marksField: 'tw' },
                { type: 'VIVA', weightageField: 'viva', marksField: 'viva' }
            ];

            // Check each component type
            for (const component of componentTypes) {
                const weightageValue = weightage[component.weightageField];
                const marksValue = componentMarks ? componentMarks[component.marksField] : 0;

                // Skip if component is not enabled (weightage is 0 or null)
                if (!weightageValue || weightageValue === 0) {
                    continue;
                }

                // Check if this component type has any sub-components
                const hasSubComponents = existingSubComponents.some(sc => 
                    sc.componentType === component.type && sc.subComponentName !== null
                );

                // If no sub-components exist, create a main component entry
                if (!hasSubComponents) {
                    console.log(`  📝 Creating main component entry for ${component.type}`);
                    
                    try {
                        // Check if main component entry already exists
                        const existingMainComponent = await SubComponents.findOne({
                            where: {
                                componentWeightageId: weightage.id,
                                componentType: component.type,
                                subComponentName: null
                            }
                        });

                        if (!existingMainComponent) {
                            // Get all course outcomes for this subject
                            const courseOutcomes = await CourseOutcome.findAll({
                                where: { subject_id: weightage.subjectId }
                            });

                            const selectedCOs = courseOutcomes.map(co => co.co_code);

                            const mainComponentRecord = await SubComponents.create({
                                componentWeightageId: weightage.id,
                                componentType: component.type,
                                subComponentName: null,
                                weightage: weightageValue,
                                totalMarks: marksValue,
                                selectedCOs: selectedCOs,
                                isEnabled: true
                            });

                            createdMainComponents++;
                            console.log(`    ✅ Created main component: ${component.type} with ID: ${mainComponentRecord.id}`);

                            // Create associations for this main component
                            for (const co of courseOutcomes) {
                                try {
                                    // Check if association already exists
                                    const existingAssoc = await SubjectComponentCo.findOne({
                                        where: {
                                            subject_component_id: weightage.id,
                                            course_outcome_id: co.id,
                                            component: component.type,
                                            sub_component_id: mainComponentRecord.id
                                        }
                                    });

                                    if (!existingAssoc) {
                                        await SubjectComponentCo.create({
                                            subject_component_id: weightage.id,
                                            course_outcome_id: co.id,
                                            component: component.type,
                                            sub_component_id: mainComponentRecord.id,
                                            sub_component_name: null
                                        });
                                        updatedAssociations++;
                                        console.log(`      🔗 Created association: ${component.type} -> ${co.co_code}`);
                                    }
                                } catch (assocError) {
                                    console.error(`      ❌ Error creating association for ${component.type} -> ${co.co_code}:`, assocError.message);
                                }
                            }
                        } else {
                            console.log(`    ⚠️ Main component entry already exists for ${component.type}`);
                        }
                    } catch (error) {
                        console.error(`    ❌ Error creating main component for ${component.type}:`, error.message);
                    }
                } else {
                    console.log(`  ✅ ${component.type} already has sub-components, skipping`);
                }
            }
        }

        console.log('\n🎉 SubComponents table fix completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Created ${createdMainComponents} main component entries`);
        console.log(`   - Created ${updatedAssociations} new associations`);
        console.log(`   - Updated schema to allow NULL subComponentName`);

    } catch (error) {
        console.error('❌ Error fixing SubComponents table:', error);
        console.error('Error details:', error.message);
        throw error;
    }
};

// Run the fix if this script is executed directly
if (require.main === module) {
    fixSubComponentsTable()
        .then(() => {
            console.log('✅ Fix completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Fix failed:', error);
            process.exit(1);
        });
}

module.exports = { fixSubComponentsTable };
