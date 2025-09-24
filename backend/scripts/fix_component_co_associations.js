/**
 * Script to fix and verify component-CO associations in subject_component_cos table
 * This script will ensure all components and subcomponents are properly mapped to their COs
 */

const { 
    ComponentWeightage, 
    SubComponents, 
    CourseOutcome, 
    SubjectComponentCo,
    UniqueSubDegree 
} = require('../models');

const fixComponentCoAssociations = async (specificSubjectId = null) => {
    try {
        console.log('🔧 Starting Component-CO Association Fix...\n');

        // Get all subjects with component weightages
        const whereClause = specificSubjectId ? { subjectId: specificSubjectId } : {};
        const componentWeightages = await ComponentWeightage.findAll({
            where: whereClause,
            include: [
                {
                    model: SubComponents,
                    as: 'subComponents'
                }
            ]
        });

        console.log(`Found ${componentWeightages.length} subjects with component weightages`);

        for (const componentWeightage of componentWeightages) {
            const subjectId = componentWeightage.subjectId;
            console.log(`\n--- Processing Subject: ${subjectId} ---`);

            // Get course outcomes for this subject
            const courseOutcomes = await CourseOutcome.findAll({
                where: { subject_id: subjectId }
            });

            console.log(`Found ${courseOutcomes.length} course outcomes for subject ${subjectId}`);

            // Get existing associations for this subject
            const existingAssociations = await SubjectComponentCo.findAll({
                where: { subject_component_id: componentWeightage.id }
            });

            console.log(`Found ${existingAssociations.length} existing associations`);

            // List all components that should have associations
            const components = ['ESE', 'CSE', 'CA', 'IA', 'TW', 'VIVA'];
            const subComponents = componentWeightage.subComponents || [];

            console.log(`Subject has ${subComponents.length} subcomponents`);

            // Check for missing main component associations
            for (const component of components) {
                const componentValue = componentWeightage[component.toLowerCase()] || 
                                     (component === 'CSE' ? componentWeightage.cse : null) ||
                                     (component === 'CA' ? componentWeightage.cse : null);

                if (componentValue && componentValue > 0) {
                    console.log(`Component ${component} has weightage: ${componentValue}%`);
                    
                    // Check if this component has subcomponents
                    const componentSubcomponents = subComponents.filter(sc => 
                        sc.componentType === component || 
                        (component === 'CSE' && sc.componentType === 'CA') ||
                        (component === 'CA' && sc.componentType === 'CA')
                    );

                    if (componentSubcomponents.length > 0) {
                        console.log(`  Component ${component} has ${componentSubcomponents.length} subcomponents`);
                        
                        // Check subcomponent associations
                        for (const subComp of componentSubcomponents) {
                            const subCompAssociations = existingAssociations.filter(assoc => 
                                assoc.sub_component_id === subComp.id
                            );
                            
                            console.log(`    Subcomponent "${subComp.subComponentName}" has ${subCompAssociations.length} associations`);
                            
                            if (subComp.selectedCOs && Array.isArray(subComp.selectedCOs) && subComp.selectedCOs.length > 0) {
                                console.log(`    Expected COs: [${subComp.selectedCOs.join(', ')}]`);
                                
                                // Create missing associations for subcomponents
                                for (const coCode of subComp.selectedCOs) {
                                    const coRecord = courseOutcomes.find(co => co.co_code === coCode);
                                    if (coRecord) {
                                        const existingAssoc = existingAssociations.find(assoc => 
                                            assoc.course_outcome_id === coRecord.id && 
                                            assoc.sub_component_id === subComp.id &&
                                            assoc.component === component
                                        );

                                        if (!existingAssoc) {
                                            console.log(`    ➕ Creating missing subcomponent association: ${component}.${subComp.subComponentName} -> ${coCode}`);
                                            try {
                                                await SubjectComponentCo.create({
                                                    subject_component_id: componentWeightage.id,
                                                    course_outcome_id: coRecord.id,
                                                    component: component,
                                                    sub_component_id: subComp.id,
                                                    sub_component_name: subComp.subComponentName
                                                });
                                                console.log(`    ✅ Created successfully`);
                                            } catch (error) {
                                                console.error(`    ❌ Error creating association:`, error.message);
                                            }
                                        } else {
                                            console.log(`    ✓ Association already exists: ${component}.${subComp.subComponentName} -> ${coCode}`);
                                        }
                                    } else {
                                        console.warn(`    ⚠️ CO record not found for code: ${coCode}`);
                                    }
                                }
                            } else {
                                console.log(`    ⚠️ Subcomponent has no selectedCOs`);
                            }
                        }
                    } else {
                        console.log(`  Component ${component} has no subcomponents - should have main component association`);
                        
                        // Check for main component associations
                        const mainCompAssociations = existingAssociations.filter(assoc => 
                            assoc.component === component && assoc.sub_component_id === null
                        );
                        
                        console.log(`  Main component ${component} has ${mainCompAssociations.length} associations`);
                        
                        if (mainCompAssociations.length === 0) {
                            console.log(`  ⚠️ Main component ${component} has no CO associations - this might need manual mapping`);
                        }
                    }
                } else {
                    console.log(`Component ${component} has no weightage or is 0`);
                }
            }
        }

        console.log('\n🎉 Component-CO Association Fix Complete!');

    } catch (error) {
        console.error('❌ Error in fixComponentCoAssociations:', error);
    }
};

// Function to display current associations for debugging
const displayCurrentAssociations = async (subjectId = null) => {
    try {
        console.log('📊 Current Component-CO Associations:\n');

        const whereClause = subjectId ? { subjectId } : {};
        
        const componentWeightages = await ComponentWeightage.findAll({
            where: whereClause,
            include: [
                {
                    model: SubjectComponentCo,
                    as: 'subjectComponentCos',
                    include: [
                        {
                            model: CourseOutcome,
                            as: 'courseOutcome'
                        }
                    ]
                }
            ]
        });

        for (const cw of componentWeightages) {
            console.log(`\nSubject: ${cw.subjectId}`);
            console.log(`Component Weightage ID: ${cw.id}`);
            
            if (cw.subjectComponentCos && cw.subjectComponentCos.length > 0) {
                console.log('Associations:');
                for (const assoc of cw.subjectComponentCos) {
                    const coCode = assoc.courseOutcome ? assoc.courseOutcome.co_code : 'Unknown';
                    const subCompInfo = assoc.sub_component_id ? 
                        ` (SubComp ID: ${assoc.sub_component_id}, Name: ${assoc.sub_component_name})` : 
                        ' (Main Component)';
                    console.log(`  - ${assoc.component} -> ${coCode}${subCompInfo}`);
                }
            } else {
                console.log('  No associations found');
            }
        }

    } catch (error) {
        console.error('❌ Error displaying associations:', error);
    }
};

module.exports = {
    fixComponentCoAssociations,
    displayCurrentAssociations
};

// Run the fix if this script is executed directly
if (require.main === module) {
    fixComponentCoAssociations().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    });
}
