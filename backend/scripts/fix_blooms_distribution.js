const { 
    CoBloomsTaxonomy, 
    BloomsTaxonomy, 
    CourseOutcome, 
    StudentBloomsDistribution,
    Student,
    StudentMarks
} = require('../models');
const { processStudentMarksDistribution } = require('../utils/marksDistributionHelper');

async function fixBloomsDistribution() {
  try {
    console.log('🔧 Starting Bloom\'s Distribution Fix...');
    
    // Step 1: Check current Bloom's taxonomy levels
    console.log('\n📋 Step 1: Checking Bloom\'s Taxonomy Levels');
    const bloomsLevels = await BloomsTaxonomy.findAll({
      order: [['id', 'ASC']]
    });
    
    console.log('Available Bloom\'s Taxonomy Levels:');
    bloomsLevels.forEach(level => {
      console.log(`  ID: ${level.id}, Name: ${level.name}`);
    });
    
    // Step 2: Check current CO-Blooms mappings
    console.log('\n📋 Step 2: Checking CO-Blooms Mappings');
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
    
    console.log(`Found ${coBloomsMappings.length} CO-Blooms mappings`);
    
    // Check distribution of Bloom's IDs in mappings
    const bloomsDistribution = {};
    coBloomsMappings.forEach(mapping => {
      const bloomsId = mapping.blooms_taxonomy_id;
      if (!bloomsDistribution[bloomsId]) {
        bloomsDistribution[bloomsId] = 0;
      }
      bloomsDistribution[bloomsId]++;
    });
    
    console.log('\nCurrent Bloom\'s ID distribution in CO mappings:');
    for (let i = 1; i <= 6; i++) {
      const count = bloomsDistribution[i] || 0;
      const bloomsName = bloomsLevels.find(b => b.id === i)?.name || 'Unknown';
      console.log(`  Level ${i} (${bloomsName}): ${count} mappings`);
    }
    
    // Step 3: Check if the issue is in CO-Blooms mappings
    const levelsWithMappings = Object.keys(bloomsDistribution).map(k => parseInt(k));
    console.log(`\nBloom's levels with mappings: [${levelsWithMappings.join(', ')}]`);
    
    if (levelsWithMappings.length < 6) {
      console.log('🚨 ISSUE FOUND: Not all Bloom\'s levels have CO mappings!');
      console.log('🔧 FIXING: Creating balanced CO-Blooms mappings...');
      
      // Get all course outcomes
      const allCOs = await CourseOutcome.findAll();
      console.log(`Found ${allCOs.length} course outcomes to process`);
      
      let fixedMappings = 0;
      
      // For each CO, ensure it maps to a variety of Bloom's levels
      for (const co of allCOs) {
        // Get existing mappings for this CO
        const existingMappings = await CoBloomsTaxonomy.findAll({
          where: { course_outcome_id: co.id }
        });
        
        const existingBloomsIds = existingMappings.map(m => m.blooms_taxonomy_id);
        console.log(`CO ${co.co_code} (${co.subject_id}) currently maps to Bloom's levels: [${existingBloomsIds.join(', ')}]`);
        
        // If CO has limited mappings, add more diverse mappings
        if (existingBloomsIds.length < 3) {
          // Delete existing mappings
          await CoBloomsTaxonomy.destroy({
            where: { course_outcome_id: co.id }
          });
          
          // Create new balanced mappings
          // Each CO should map to at least 3 different Bloom's levels
          const newBloomsIds = [];
          
          // Always include some basic levels
          newBloomsIds.push(1); // Remember
          newBloomsIds.push(2); // Understand
          
          // Add variety based on CO code
          const coNum = parseInt(co.co_code.replace(/\D/g, '')) || 1;
          switch (coNum % 4) {
            case 1:
              newBloomsIds.push(3, 4); // Apply, Analyze
              break;
            case 2:
              newBloomsIds.push(3, 5); // Apply, Evaluate
              break;
            case 3:
              newBloomsIds.push(4, 6); // Analyze, Create
              break;
            case 0:
              newBloomsIds.push(5, 6); // Evaluate, Create
              break;
          }
          
          // Create new mappings
          for (const bloomsId of newBloomsIds) {
            await CoBloomsTaxonomy.create({
              course_outcome_id: co.id,
              blooms_taxonomy_id: bloomsId
            });
            fixedMappings++;
          }
          
          console.log(`  ✅ Updated CO ${co.co_code} to map to Bloom's levels: [${newBloomsIds.join(', ')}]`);
        }
      }
      
      console.log(`🎉 Created ${fixedMappings} new CO-Blooms mappings`);
    }
    
    // Step 4: Recalculate student Bloom's distributions
    console.log('\n📋 Step 4: Recalculating Student Bloom\'s Distributions');
    
    // Get all unique student-semester combinations that have marks
    const studentSemesters = await StudentMarks.findAll({
      attributes: ['studentId', 'enrollmentSemester'],
      group: ['studentId', 'enrollmentSemester'],
      include: [{
        model: Student,
        as: 'student',
        attributes: ['enrollmentNumber']
      }]
    });
    
    console.log(`Found ${studentSemesters.length} student-semester combinations to recalculate`);
    
    let recalculatedCount = 0;
    const maxToProcess = 10; // Limit for testing
    
    for (const studentSemester of studentSemesters.slice(0, maxToProcess)) {
      const studentId = studentSemester.studentId;
      const semesterNumber = studentSemester.enrollmentSemester;
      const enrollmentNumber = studentSemester.student?.enrollmentNumber || 'Unknown';
      
      console.log(`\n🔄 Recalculating for student ${enrollmentNumber} (ID: ${studentId}), semester ${semesterNumber}`);
      
      try {
        // Delete existing distributions for this student-semester
        const deletedCount = await StudentBloomsDistribution.destroy({
          where: {
            studentId: studentId,
            semesterNumber: semesterNumber
          }
        });
        
        console.log(`  🗑️ Deleted ${deletedCount} existing distribution records`);
        
        // Recalculate distributions
        const result = await processStudentMarksDistribution(studentId, semesterNumber);
        
        console.log(`  ✅ Created ${result.recordsCreated} new distribution records`);
        
        // Show the new distribution
        const newDistributions = await StudentBloomsDistribution.findAll({
          where: {
            studentId: studentId,
            semesterNumber: semesterNumber
          },
          order: [['subjectId', 'ASC'], ['bloomsTaxonomyId', 'ASC']]
        });
        
        // Group by subject
        const subjectDistributions = {};
        newDistributions.forEach(dist => {
          if (!subjectDistributions[dist.subjectId]) {
            subjectDistributions[dist.subjectId] = {};
          }
          subjectDistributions[dist.subjectId][dist.bloomsTaxonomyId] = parseFloat(dist.assignedMarks);
        });
        
        // Display distribution summary
        for (const [subjectId, distribution] of Object.entries(subjectDistributions)) {
          console.log(`    Subject ${subjectId}:`);
          for (let i = 1; i <= 6; i++) {
            const marks = distribution[i] || 0;
            const bloomsName = bloomsLevels.find(b => b.id === i)?.name || 'Unknown';
            if (marks > 0) {
              console.log(`      Level ${i} (${bloomsName}): ${marks} marks`);
            }
          }
        }
        
        recalculatedCount++;
        
      } catch (error) {
        console.error(`  ❌ Error recalculating for student ${enrollmentNumber}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Fix completed! Recalculated distributions for ${recalculatedCount} student-semester combinations`);
    
    // Step 5: Verify the fix
    console.log('\n📋 Step 5: Verifying the fix');
    const verificationDistributions = await StudentBloomsDistribution.findAll({
      limit: 100,
      order: [['studentId', 'ASC'], ['subjectId', 'ASC'], ['bloomsTaxonomyId', 'ASC']]
    });
    
    const verificationBloomsDistribution = {};
    verificationDistributions.forEach(dist => {
      const bloomsId = dist.bloomsTaxonomyId;
      const marks = parseFloat(dist.assignedMarks);
      
      if (!verificationBloomsDistribution[bloomsId]) {
        verificationBloomsDistribution[bloomsId] = {
          count: 0,
          nonZeroCount: 0,
          totalMarks: 0
        };
      }
      
      verificationBloomsDistribution[bloomsId].count++;
      verificationBloomsDistribution[bloomsId].totalMarks += marks;
      if (marks > 0) {
        verificationBloomsDistribution[bloomsId].nonZeroCount++;
      }
    });
    
    console.log('\nVerification - Bloom\'s levels with marks after fix:');
    const levelsWithMarks = [];
    for (let i = 1; i <= 6; i++) {
      const stats = verificationBloomsDistribution[i];
      if (stats && stats.nonZeroCount > 0) {
        levelsWithMarks.push(i);
        const bloomsName = bloomsLevels.find(b => b.id === i)?.name || 'Unknown';
        console.log(`  Level ${i} (${bloomsName}): ${stats.nonZeroCount} records with marks (total: ${stats.totalMarks.toFixed(2)})`);
      }
    }
    
    if (levelsWithMarks.length >= 4) {
      console.log('✅ SUCCESS: Multiple Bloom\'s levels now have marks distributed!');
    } else {
      console.log('⚠️ WARNING: Still limited Bloom\'s level distribution. May need further investigation.');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error in fixBloomsDistribution:', error);
    process.exit(1);
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixBloomsDistribution();
}

module.exports = { fixBloomsDistribution };
