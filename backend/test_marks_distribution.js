const { processStudentMarksDistribution } = require('./utils/marksDistributionHelper');
const { StudentMarks, StudentBloomsDistribution, ComponentWeightage, SubComponents } = require('./models');

/**
 * Test script to verify marks distribution calculation
 * Run this with: node test_marks_distribution.js <studentId> <semesterNumber> [subjectId]
 */
async function testMarksDistribution() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: node test_marks_distribution.js <studentId> <semesterNumber> [subjectId]');
        process.exit(1);
    }

    const studentId = parseInt(args[0]);
    const semesterNumber = parseInt(args[1]);
    const subjectId = args[2] || null;

    console.log('='.repeat(80));
    console.log('MARKS DISTRIBUTION TEST');
    console.log('='.repeat(80));
    console.log(`Student ID: ${studentId}`);
    console.log(`Semester: ${semesterNumber}`);
    console.log(`Subject: ${subjectId || 'All subjects'}`);
    console.log('='.repeat(80));

    try {
        // Get and display current marks before calculation
        console.log('\n📊 CURRENT STUDENT MARKS:');
        console.log('-'.repeat(60));
        
        const whereClause = {
            studentId: studentId,
            enrollmentSemester: semesterNumber
        };
        
        if (subjectId) {
            whereClause.subjectId = subjectId;
        }

        const studentMarks = await StudentMarks.findAll({
            where: whereClause,
            include: [{
                model: SubComponents,
                as: 'subComponent'
            }],
            order: [['subjectId', 'ASC'], ['componentType', 'ASC']]
        });

        for (const mark of studentMarks) {
            const componentName = mark.isSubComponent 
                ? `${mark.componentType} - ${mark.componentName}`
                : mark.componentType;
            
            console.log(`Subject: ${mark.subjectId}`);
            console.log(`  Component: ${componentName}`);
            console.log(`  Marks: ${mark.marksObtained}/${mark.totalMarks} (${((mark.marksObtained/mark.totalMarks)*100).toFixed(1)}%)`);
            
            if (mark.isSubComponent && mark.subComponent) {
                console.log(`  Weightage: ${mark.subComponent.weightage}%`);
                console.log(`  COs: ${JSON.stringify(mark.subComponent.selectedCOs)}`);
            }
            console.log();
        }

        // Get component weightage configuration
        if (subjectId) {
            console.log('\n⚙️ COMPONENT WEIGHTAGE CONFIGURATION:');
            console.log('-'.repeat(60));
            
            const componentWeightage = await ComponentWeightage.findOne({
                where: { subjectId: subjectId }
            });

            if (componentWeightage) {
                console.log(`Subject: ${subjectId}`);
                console.log(`  ESE: ${componentWeightage.ese}%`);
                console.log(`  CA/CSE: ${componentWeightage.cse}%`);
                console.log(`  IA: ${componentWeightage.ia}%`);
                console.log(`  TW: ${componentWeightage.tw}%`);
                console.log(`  VIVA: ${componentWeightage.viva}%`);
                console.log(`  Total: ${componentWeightage.ese + componentWeightage.cse + componentWeightage.ia + componentWeightage.tw + componentWeightage.viva}%`);
            }
        }

        // Process marks distribution
        console.log('\n🔄 PROCESSING MARKS DISTRIBUTION...');
        console.log('-'.repeat(60));
        
        const result = await processStudentMarksDistribution(
            studentId,
            semesterNumber,
            subjectId
        );

        console.log(`\n✅ Distribution completed successfully!`);
        console.log(`Records created: ${result.recordsCreated}`);

        // Display the final distribution
        console.log('\n📈 FINAL BLOOM\'S TAXONOMY DISTRIBUTION:');
        console.log('-'.repeat(60));

        const finalDistribution = await StudentBloomsDistribution.findAll({
            where: whereClause,
            order: [['subjectId', 'ASC'], ['bloomsTaxonomyId', 'ASC']]
        });

        // Group by subject for better display
        const distributionBySubject = {};
        for (const dist of finalDistribution) {
            if (!distributionBySubject[dist.subjectId]) {
                distributionBySubject[dist.subjectId] = [];
            }
            distributionBySubject[dist.subjectId].push(dist);
        }

        const bloomsNames = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

        for (const [subject, distributions] of Object.entries(distributionBySubject)) {
            console.log(`\n📚 Subject: ${subject}`);
            console.log('  ' + '-'.repeat(50));
            
            let totalMarks = 0;
            for (const dist of distributions) {
                const bloomsName = bloomsNames[dist.bloomsTaxonomyId - 1] || `Level ${dist.bloomsTaxonomyId}`;
                console.log(`  ${bloomsName.padEnd(12)}: ${parseFloat(dist.assignedMarks).toFixed(2).padStart(7)} marks`);
                totalMarks += parseFloat(dist.assignedMarks);
            }
            
            console.log('  ' + '-'.repeat(50));
            console.log(`  TOTAL:        ${totalMarks.toFixed(2).padStart(7)} marks (out of 150)`);
            
            // Calculate percentage
            const percentage = (totalMarks / 150) * 100;
            console.log(`  Percentage:   ${percentage.toFixed(2)}%`);
        }

        console.log('\n' + '='.repeat(80));
        console.log('TEST COMPLETED SUCCESSFULLY');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
    }

    process.exit(0);
}

// Run the test
testMarksDistribution();
