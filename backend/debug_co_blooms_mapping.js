const { 
    ComponentWeightage, 
    SubComponents, 
    SubjectComponentCo,
    CourseOutcome,
    CoBloomsTaxonomy,
    BloomsTaxonomy 
} = require('./models');

/**
 * Debug script to check CO and Bloom's taxonomy mappings
 * Run this with: node debug_co_blooms_mapping.js <subjectId>
 */
async function debugCOBloomsMapping() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node debug_co_blooms_mapping.js <subjectId>');
        process.exit(1);
    }

    const subjectId = args[0];

    console.log('='.repeat(80));
    console.log('CO AND BLOOM\'S TAXONOMY MAPPING DEBUG');
    console.log('='.repeat(80));
    console.log(`Subject ID: ${subjectId}`);
    console.log('='.repeat(80));

    try {
        // Get component weightage with subcomponents
        const componentWeightage = await ComponentWeightage.findOne({
            where: { subjectId: subjectId },
            include: [{
                model: SubComponents,
                as: 'subComponents'
            }]
        });

        if (!componentWeightage) {
            console.log('❌ No component weightage found for this subject');
            process.exit(1);
        }

        console.log('\n📋 COMPONENT WEIGHTAGE CONFIGURATION:');
        console.log('-'.repeat(60));
        console.log(`ID: ${componentWeightage.id}`);
        console.log(`ESE: ${componentWeightage.ese}%`);
        console.log(`CA/CSE: ${componentWeightage.cse}%`);
        console.log(`IA: ${componentWeightage.ia}%`);
        console.log(`TW: ${componentWeightage.tw}%`);
        console.log(`VIVA: ${componentWeightage.viva}%`);

        // Check main component COs
        console.log('\n🎯 MAIN COMPONENT CO MAPPINGS:');
        console.log('-'.repeat(60));

        const componentTypes = ['ESE', 'CA', 'IA', 'TW', 'VIVA'];
        
        for (const componentType of componentTypes) {
            const componentCOs = await SubjectComponentCo.findAll({
                where: {
                    subject_component_id: componentWeightage.id,
                    component: componentType
                },
                include: [{
                    model: CourseOutcome,
                    as: 'courseOutcome'
                }]
            });

            if (componentCOs.length > 0) {
                console.log(`\n${componentType}:`);
                for (const cco of componentCOs) {
                    console.log(`  - CO${cco.course_outcome_id}: ${cco.courseOutcome ? cco.courseOutcome.description : 'No description'}`);
                }
            } else {
                console.log(`\n${componentType}: No CO mappings found`);
            }
        }

        // Check subcomponents
        if (componentWeightage.subComponents && componentWeightage.subComponents.length > 0) {
            console.log('\n📦 SUBCOMPONENTS:');
            console.log('-'.repeat(60));

            for (const subComp of componentWeightage.subComponents) {
                console.log(`\nSubcomponent: ${subComp.subComponentName}`);
                console.log(`  Component Type: ${subComp.componentType}`);
                console.log(`  Weightage: ${subComp.weightage}%`);
                console.log(`  Total Marks: ${subComp.totalMarks}`);
                console.log(`  Enabled: ${subComp.isEnabled}`);
                console.log(`  Selected COs: ${JSON.stringify(subComp.selectedCOs || [])}`);

                // Get Bloom's levels for each CO
                if (subComp.selectedCOs && subComp.selectedCOs.length > 0) {
                    console.log('  CO-Bloom\'s Mapping:');
                    
                    for (const coId of subComp.selectedCOs) {
                        const coBloomsLinks = await CoBloomsTaxonomy.findAll({
                            where: { course_outcome_id: coId },
                            include: [{
                                model: BloomsTaxonomy,
                                as: 'bloomsTaxonomy'
                            }]
                        });

                        const bloomsLevels = coBloomsLinks.map(link => 
                            `${link.bloomsTaxonomy ? link.bloomsTaxonomy.name : 'Unknown'}(${link.blooms_taxonomy_id})`
                        ).join(', ');

                        console.log(`    CO${coId} -> [${bloomsLevels || 'No Bloom\'s levels mapped'}]`);
                    }
                }
            }
        } else {
            console.log('\n📦 No subcomponents found');
        }

        // Check all COs for this subject and their Bloom's mappings
        console.log('\n🔍 ALL COURSE OUTCOMES AND BLOOM\'S LEVELS:');
        console.log('-'.repeat(60));

        const allCOs = await CourseOutcome.findAll({
            where: { subjectId: subjectId }
        });

        if (allCOs.length > 0) {
            for (const co of allCOs) {
                console.log(`\nCO${co.id}: ${co.description}`);
                
                const coBloomsLinks = await CoBloomsTaxonomy.findAll({
                    where: { course_outcome_id: co.id },
                    include: [{
                        model: BloomsTaxonomy,
                        as: 'bloomsTaxonomy'
                    }]
                });

                if (coBloomsLinks.length > 0) {
                    console.log('  Bloom\'s Levels:');
                    for (const link of coBloomsLinks) {
                        const bloomsName = link.bloomsTaxonomy ? link.bloomsTaxonomy.name : 'Unknown';
                        console.log(`    - Level ${link.blooms_taxonomy_id}: ${bloomsName}`);
                    }
                } else {
                    console.log('  ⚠️  No Bloom\'s levels mapped to this CO');
                }
            }
        } else {
            console.log('❌ No course outcomes found for this subject');
        }

        // Check all Bloom's taxonomy levels
        console.log('\n📚 ALL BLOOM\'S TAXONOMY LEVELS:');
        console.log('-'.repeat(60));

        const allBlooms = await BloomsTaxonomy.findAll({
            order: [['id', 'ASC']]
        });

        for (const bloom of allBlooms) {
            console.log(`Level ${bloom.id}: ${bloom.name} - ${bloom.description || 'No description'}`);
        }

        console.log('\n' + '='.repeat(80));
        console.log('DEBUG COMPLETED');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
    }

    process.exit(0);
}

// Run the debug
debugCOBloomsMapping();
