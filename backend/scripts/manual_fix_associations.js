/**
 * Manual fix for the missing associations with detailed error handling
 */

const { ComponentWeightage, SubComponents, CourseOutcome, SubjectComponentCo, sequelize } = require('../models');

const manualFixAssociations = async () => {
    try {
        console.log('🔧 Manual fix for missing associations...\n');

        // Get the latest component weightage
        const latestWeightage = await ComponentWeightage.findByPk(1, {
            include: [{
                model: SubComponents,
                as: 'subComponents'
            }]
        });

        if (!latestWeightage) {
            console.log('❌ Component weightage not found');
            return;
        }

        console.log(`📋 Subject: ${latestWeightage.subjectId} (ID: ${latestWeightage.id})`);

        // Get course outcomes
        const courseOutcomes = await CourseOutcome.findAll({
            where: { subject_id: latestWeightage.subjectId }
        });

        console.log(`Found ${courseOutcomes.length} course outcomes`);

        // Manual creation with raw SQL to bypass validation issues
        const associationsToCreate = [
            // IA.mid sem 1 -> CO1
            {
                subject_component_id: 1,
                course_outcome_id: 1, // CO1
                component: 'IA',
                sub_component_id: 3, // mid sem 1
                sub_component_name: 'mid sem 1'
            },
            // VIVA main -> CO1
            {
                subject_component_id: 1,
                course_outcome_id: 1, // CO1
                component: 'VIVA',
                sub_component_id: null,
                sub_component_name: null
            },
            // VIVA main -> CO2
            {
                subject_component_id: 1,
                course_outcome_id: 2, // CO2
                component: 'VIVA',
                sub_component_id: null,
                sub_component_name: null
            },
            // VIVA main -> CO3
            {
                subject_component_id: 1,
                course_outcome_id: 3, // CO3
                component: 'VIVA',
                sub_component_id: null,
                sub_component_name: null
            }
        ];

        console.log(`🔨 Creating ${associationsToCreate.length} associations manually...`);

        for (const assoc of associationsToCreate) {
            try {
                // Check if already exists
                const existing = await SubjectComponentCo.findOne({
                    where: {
                        subject_component_id: assoc.subject_component_id,
                        course_outcome_id: assoc.course_outcome_id,
                        component: assoc.component,
                        sub_component_id: assoc.sub_component_id
                    }
                });

                if (existing) {
                    console.log(`⚠️ Already exists: ${assoc.component}${assoc.sub_component_name ? '.' + assoc.sub_component_name : ' (main)'} -> CO${assoc.course_outcome_id}`);
                    continue;
                }

                // Use raw SQL to insert
                const now = new Date();
                await sequelize.query(`
                    INSERT INTO subject_component_cos 
                    (subject_component_id, course_outcome_id, component, sub_component_id, sub_component_name, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, {
                    replacements: [
                        assoc.subject_component_id,
                        assoc.course_outcome_id,
                        assoc.component,
                        assoc.sub_component_id,
                        assoc.sub_component_name,
                        now,
                        now
                    ]
                });

                const compInfo = assoc.sub_component_id ? 
                    `${assoc.component}.${assoc.sub_component_name}` : 
                    `${assoc.component} (main)`;
                console.log(`✅ Created: ${compInfo} -> CO${assoc.course_outcome_id}`);

            } catch (error) {
                console.error(`❌ Error creating association:`, error.message);
                console.error('Full error:', error);
            }
        }

        // Final verification
        const finalAssociations = await SubjectComponentCo.findAll({
            where: { subject_component_id: 1 },
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

        console.log('\n🎉 Manual fix completed!');

    } catch (error) {
        console.error('❌ Manual fix failed:', error);
        throw error;
    }
};

module.exports = { manualFixAssociations };

// Run if executed directly
if (require.main === module) {
    manualFixAssociations().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Manual fix failed:', error);
        process.exit(1);
    });
}
