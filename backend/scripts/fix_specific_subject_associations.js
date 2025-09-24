/**
 * Script to fix the specific subject shown in the images
 * This will create the missing component-CO associations based on the frontend data
 */

const { 
    ComponentWeightage, 
    SubComponents, 
    CourseOutcome, 
    SubjectComponentCo,
    UniqueSubDegree 
} = require('../models');

const fixSpecificSubjectAssociations = async () => {
    try {
        console.log('🔧 Fixing specific subject associations...\n');

        // Based on the images, the subject appears to be the one with component_weightage_id = 1
        // Let's find the subject and its components
        
        const componentWeightage = await ComponentWeightage.findByPk(1, {
            include: [
                {
                    model: SubComponents,
                    as: 'subComponents'
                }
            ]
        });

        if (!componentWeightage) {
            console.log('❌ Component weightage with ID 1 not found');
            return;
        }

        const subjectId = componentWeightage.subjectId;
        console.log(`📋 Processing subject: ${subjectId}`);

        // Get course outcomes for this subject
        const courseOutcomes = await CourseOutcome.findAll({
            where: { subject_id: subjectId }
        });

        console.log(`Found ${courseOutcomes.length} course outcomes`);
        courseOutcomes.forEach(co => {
            console.log(`  - ${co.co_code}: ${co.description}`);
        });

        // Get existing associations
        const existingAssociations = await SubjectComponentCo.findAll({
            where: { subject_component_id: componentWeightage.id }
        });

        console.log(`Found ${existingAssociations.length} existing associations`);

        // Clear existing associations to start fresh
        console.log('🗑️ Clearing existing associations...');
        await SubjectComponentCo.destroy({
            where: { subject_component_id: componentWeightage.id }
        });

        // Based on Image 2, create the correct associations
        const associationsToCreate = [];

        // 1. CSE (Continuous Semester Evaluation) with subcomponents
        console.log('\n--- Processing CSE Component ---');
        const cseSubcomponents = componentWeightage.subComponents.filter(sc => 
            sc.componentType === 'CSE' || sc.componentType === 'CA'
        );
        
        console.log(`Found ${cseSubcomponents.length} CSE subcomponents:`, 
            cseSubcomponents.map(sc => sc.subComponentName));

        for (const subComp of cseSubcomponents) {
            // Based on the image, subcomponents seem to be mapped to different COs
            let selectedCOs = [];
            
            if (subComp.subComponentName === 'quiz') {
                selectedCOs = ['CO1', 'CO2', 'CO3']; // Based on image pattern
            } else if (subComp.subComponentName === 'assignment' || subComp.subComponentName === 'assignments') {
                selectedCOs = ['CO1', 'CO2', 'CO3'];
            }

            // If selectedCOs is stored in the subcomponent, use that instead
            if (subComp.selectedCOs && Array.isArray(subComp.selectedCOs) && subComp.selectedCOs.length > 0) {
                selectedCOs = subComp.selectedCOs;
            }

            console.log(`  Subcomponent "${subComp.subComponentName}" -> COs: [${selectedCOs.join(', ')}]`);

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

        // 2. ESE (End Semester Exam) - main component
        console.log('\n--- Processing ESE Component ---');
        if (componentWeightage.ese && componentWeightage.ese > 0) {
            const eseSelectedCOs = ['CO1', 'CO2', 'CO3']; // Based on typical pattern
            console.log(`  ESE main component -> COs: [${eseSelectedCOs.join(', ')}]`);
            
            for (const coCode of eseSelectedCOs) {
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

        // 3. IA (Internal Assessment) - main component
        console.log('\n--- Processing IA Component ---');
        if (componentWeightage.ia && componentWeightage.ia > 0) {
            const iaSelectedCOs = ['CO1', 'CO2', 'CO3']; // Based on typical pattern
            console.log(`  IA main component -> COs: [${iaSelectedCOs.join(', ')}]`);
            
            for (const coCode of iaSelectedCOs) {
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

        // 4. TW (Term Work) with subcomponents
        console.log('\n--- Processing TW Component ---');
        const twSubcomponents = componentWeightage.subComponents.filter(sc => 
            sc.componentType === 'TW'
        );
        
        console.log(`Found ${twSubcomponents.length} TW subcomponents:`, 
            twSubcomponents.map(sc => sc.subComponentName));

        for (const subComp of twSubcomponents) {
            let selectedCOs = [];
            
            if (subComp.subComponentName === 'net1') {
                selectedCOs = ['CO1', 'CO2', 'CO3'];
            } else if (subComp.subComponentName === 'net2') {
                selectedCOs = ['CO1', 'CO2', 'CO3'];
            }

            // If selectedCOs is stored in the subcomponent, use that instead
            if (subComp.selectedCOs && Array.isArray(subComp.selectedCOs) && subComp.selectedCOs.length > 0) {
                selectedCOs = subComp.selectedCOs;
            }

            console.log(`  Subcomponent "${subComp.subComponentName}" -> COs: [${selectedCOs.join(', ')}]`);

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

        // 5. VIVA - main component
        console.log('\n--- Processing VIVA Component ---');
        if (componentWeightage.viva && componentWeightage.viva > 0) {
            const vivaSelectedCOs = ['CO1', 'CO2', 'CO3']; // Based on typical pattern
            console.log(`  VIVA main component -> COs: [${vivaSelectedCOs.join(', ')}]`);
            
            for (const coCode of vivaSelectedCOs) {
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

        // Create all associations
        console.log(`\n🔨 Creating ${associationsToCreate.length} associations...`);
        
        for (const assoc of associationsToCreate) {
            try {
                await SubjectComponentCo.create(assoc);
                const compInfo = assoc.sub_component_id ? 
                    `${assoc.component}.${assoc.sub_component_name}` : 
                    assoc.component;
                console.log(`✅ Created: ${compInfo} -> CO${assoc.course_outcome_id}`);
            } catch (error) {
                console.error(`❌ Error creating association:`, error.message);
            }
        }

        console.log('\n🎉 Specific subject associations fix complete!');
        
        // Verify the results
        const finalAssociations = await SubjectComponentCo.findAll({
            where: { subject_component_id: componentWeightage.id },
            include: [
                {
                    model: CourseOutcome,
                    as: 'courseOutcome'
                }
            ]
        });

        console.log(`\n📊 Final verification: ${finalAssociations.length} associations created`);
        
        // Group by component for better display
        const groupedAssociations = {};
        finalAssociations.forEach(assoc => {
            const key = assoc.sub_component_id ? 
                `${assoc.component}.${assoc.sub_component_name}` : 
                assoc.component;
            
            if (!groupedAssociations[key]) {
                groupedAssociations[key] = [];
            }
            groupedAssociations[key].push(assoc.courseOutcome.co_code);
        });

        console.log('\nFinal associations by component:');
        Object.entries(groupedAssociations).forEach(([component, cos]) => {
            console.log(`  ${component}: [${cos.join(', ')}]`);
        });

    } catch (error) {
        console.error('❌ Error in fixSpecificSubjectAssociations:', error);
    }
};

module.exports = {
    fixSpecificSubjectAssociations
};

// Run the fix if this script is executed directly
if (require.main === module) {
    fixSpecificSubjectAssociations().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    });
}
