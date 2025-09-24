const { CoBloomsTaxonomy, BloomsTaxonomy, CourseOutcome } = require('../models');

async function checkBloomsMappings() {
    try {
        console.log('=== Checking Bloom\'s Taxonomy Mappings ===');

        // Check all Bloom's taxonomy levels
        const bloomsLevels = await BloomsTaxonomy.findAll({
            order: [['id', 'ASC']]
        });

        console.log('Available Bloom\'s Taxonomy Levels:');
        bloomsLevels.forEach(level => {
            console.log(`  ID: ${level.id}, Name: ${level.name}`);
        });

        // Check CO-Blooms mappings
        const coBloomsMappings = await CoBloomsTaxonomy.findAll({
            include: [
                {
                    model: CourseOutcome,
                    as: 'courseOutcome',
                    attributes: ['co_code', 'subject_id']
                },
                {
                    model: BloomsTaxonomy,
                    as: 'bloomsTaxonomy',
                    attributes: ['id', 'name']
                }
            ],
            order: [['course_outcome_id', 'ASC'], ['blooms_taxonomy_id', 'ASC']]
        });

        console.log(`\nFound ${coBloomsMappings.length} CO-Blooms mappings:`);

        // Group by subject
        const subjectMappings = {};
        coBloomsMappings.forEach(mapping => {
            const subjectId = mapping.courseOutcome?.subject_id || 'Unknown';
            if (!subjectMappings[subjectId]) {
                subjectMappings[subjectId] = {};
            }

            const coCode = mapping.courseOutcome?.co_code || 'Unknown';
            if (!subjectMappings[subjectId][coCode]) {
                subjectMappings[subjectId][coCode] = [];
            }

            subjectMappings[subjectId][coCode].push({
                bloomsId: mapping.blooms_taxonomy_id,
                bloomsName: mapping.bloomsTaxonomy?.name || 'Unknown'
            });
        });

        // Display mappings by subject
        for (const [subjectId, coMappings] of Object.entries(subjectMappings)) {
            console.log(`\nSubject: ${subjectId}`);
            for (const [coCode, bloomsLevels] of Object.entries(coMappings)) {
                const bloomsIds = bloomsLevels.map(b => b.bloomsId).join(', ');
                const bloomsNames = bloomsLevels.map(b => b.bloomsName).join(', ');
                console.log(`  CO ${coCode}: Bloom's IDs [${bloomsIds}] - [${bloomsNames}]`);
            }
        }

        // Check distribution of Bloom's IDs
        const bloomsDistribution = {};
        coBloomsMappings.forEach(mapping => {
            const bloomsId = mapping.blooms_taxonomy_id;
            if (!bloomsDistribution[bloomsId]) {
                bloomsDistribution[bloomsId] = 0;
            }
            bloomsDistribution[bloomsId]++;
        });

        console.log('\nDistribution of Bloom\'s ID usage:');
        for (let i = 1; i <= 6; i++) {
            const count = bloomsDistribution[i] || 0;
            const bloomsName = bloomsLevels.find(b => b.id === i)?.name || 'Unknown';
            console.log(`  Level ${i} (${bloomsName}): ${count} mappings`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkBloomsMappings();
