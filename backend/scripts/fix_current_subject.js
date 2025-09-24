/**
 * Fix the current subject's missing associations
 */

const { ComponentWeightage, SubComponents, CourseOutcome, SubjectComponentCo } = require('../models');

const fixCurrentSubject = async () => {
    try {
        console.log('🔧 Fixing current subject associations...\n');

        // Get the latest component weightage
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

        console.log(`📋 Fixing Subject: ${latestWeightage.subjectId} (ID: ${latestWeightage.id})`);

        // Get course outcomes
        const courseOutcomes = await CourseOutcome.findAll({
            where: { subject_id: latestWeightage.subjectId }
        });

        console.log(`Found ${courseOutcomes.length} course outcomes`);

        // Fix missing associations
        const associationsToCreate = [];

        // 1. Fix missing IA.mid sem 1 -> CO1 association
        const midSem1 = latestWeightage.subComponents.find(sc => 
            sc.subComponentName === 'mid sem 1' && sc.componentType === 'IA'
        );
        
        if (midSem1) {
            const co1 = courseOutcomes.find(co => co.co_code === 'CO1');
            if (co1) {
                // Check if association already exists
                const existingAssoc = await SubjectComponentCo.findOne({
                    where: {
                        subject_component_id: latestWeightage.id,
                        course_outcome_id: co1.id,
                        component: 'IA',
                        sub_component_id: midSem1.id
                    }
                });

                if (!existingAssoc) {
                    associationsToCreate.push({
                        subject_component_id: latestWeightage.id,
                        course_outcome_id: co1.id,
                        component: 'IA',
                        sub_component_id: midSem1.id,
                        sub_component_name: 'mid sem 1'
                    });
                    console.log('📝 Will create: IA.mid sem 1 -> CO1');
                } else {
                    console.log('✅ IA.mid sem 1 -> CO1 already exists');
                }
            }
        }

        // 2. Fix missing VIVA main component associations
        if (latestWeightage.viva > 0) {
            console.log(`📝 VIVA has ${latestWeightage.viva}% weightage, creating main component associations`);
            
            for (const co of courseOutcomes) {
                // Check if association already exists
                const existingAssoc = await SubjectComponentCo.findOne({
                    where: {
                        subject_component_id: latestWeightage.id,
                        course_outcome_id: co.id,
                        component: 'VIVA',
                        sub_component_id: null
                    }
                });

                if (!existingAssoc) {
                    associationsToCreate.push({
                        subject_component_id: latestWeightage.id,
                        course_outcome_id: co.id,
                        component: 'VIVA',
                        sub_component_id: null,
                        sub_component_name: null
                    });
                    console.log(`📝 Will create: VIVA (main) -> ${co.co_code}`);
                } else {
                    console.log(`✅ VIVA (main) -> ${co.co_code} already exists`);
                }
            }
        }

        // Create all missing associations
        console.log(`\n🔨 Creating ${associationsToCreate.length} missing associations...`);
        
        for (const assoc of associationsToCreate) {
            try {
                await SubjectComponentCo.create(assoc);
                const compInfo = assoc.sub_component_id ? 
                    `${assoc.component}.${assoc.sub_component_name}` : 
                    `${assoc.component} (main)`;
                console.log(`✅ Created: ${compInfo} -> CO${assoc.course_outcome_id}`);
            } catch (error) {
                console.error(`❌ Error creating association:`, error.message);
            }
        }

        // Final verification
        const finalAssociations = await SubjectComponentCo.findAll({
            where: { subject_component_id: latestWeightage.id },
            include: [{
                model: CourseOutcome,
                as: 'courseOutcome'
            }]
        });

        console.log(`\n📊 Final verification: ${finalAssociations.length} total associations`);
        finalAssociations.forEach(assoc => {
            const compInfo = assoc.sub_component_id ? 
                `${assoc.component}.${assoc.sub_component_name}` : 
                `${assoc.component} (main)`;
            console.log(`  ✅ ${compInfo} -> ${assoc.courseOutcome.co_code}`);
        });

        console.log('\n🎉 Current subject fix completed!');

    } catch (error) {
        console.error('❌ Fix failed:', error);
        throw error;
    }
};

module.exports = { fixCurrentSubject };

// Run if executed directly
if (require.main === module) {
    fixCurrentSubject().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Fix failed:', error);
        process.exit(1);
    });
}
