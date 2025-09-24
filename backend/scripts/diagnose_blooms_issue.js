const { 
    CoBloomsTaxonomy, 
    BloomsTaxonomy, 
    CourseOutcome, 
    StudentBloomsDistribution,
    Student
} = require('../models');

async function diagnoseBloomsIssue() {
  try {
    console.log('🔍 Diagnosing Bloom\'s Distribution Issue...');
    
    // 1. Check Bloom's taxonomy levels
    console.log('\n1️⃣ Checking Bloom\'s Taxonomy Levels:');
    const bloomsLevels = await BloomsTaxonomy.findAll({ order: [['id', 'ASC']] });
    bloomsLevels.forEach(level => {
      console.log(`   ID: ${level.id}, Name: ${level.name}`);
    });
    
    // 2. Check CO-Blooms mappings distribution
    console.log('\n2️⃣ Checking CO-Blooms Mappings:');
    const coBloomsMappings = await CoBloomsTaxonomy.findAll({
      include: [
        { model: BloomsTaxonomy, as: 'bloomsTaxonomy', attributes: ['name'] }
      ]
    });
    
    const bloomsUsage = {};
    coBloomsMappings.forEach(mapping => {
      const bloomsId = mapping.blooms_taxonomy_id;
      if (!bloomsUsage[bloomsId]) {
        bloomsUsage[bloomsId] = 0;
      }
      bloomsUsage[bloomsId]++;
    });
    
    console.log('   Bloom\'s levels used in CO mappings:');
    for (let i = 1; i <= 6; i++) {
      const count = bloomsUsage[i] || 0;
      const name = bloomsLevels.find(b => b.id === i)?.name || 'Unknown';
      console.log(`   Level ${i} (${name}): ${count} mappings`);
    }
    
    // 3. Check student distributions
    console.log('\n3️⃣ Checking Student Bloom\'s Distributions:');
    const studentDistributions = await StudentBloomsDistribution.findAll({
      limit: 50,
      order: [['studentId', 'ASC'], ['bloomsTaxonomyId', 'ASC']]
    });
    
    const studentBloomsUsage = {};
    let totalRecords = 0;
    let recordsWithMarks = 0;
    
    studentDistributions.forEach(dist => {
      const bloomsId = dist.bloomsTaxonomyId;
      const marks = parseFloat(dist.assignedMarks);
      
      if (!studentBloomsUsage[bloomsId]) {
        studentBloomsUsage[bloomsId] = { count: 0, totalMarks: 0, nonZeroCount: 0 };
      }
      
      studentBloomsUsage[bloomsId].count++;
      studentBloomsUsage[bloomsId].totalMarks += marks;
      totalRecords++;
      
      if (marks > 0) {
        studentBloomsUsage[bloomsId].nonZeroCount++;
        recordsWithMarks++;
      }
    });
    
    console.log(`   Analyzed ${totalRecords} distribution records (${recordsWithMarks} with marks > 0):`);
    for (let i = 1; i <= 6; i++) {
      const stats = studentBloomsUsage[i] || { count: 0, totalMarks: 0, nonZeroCount: 0 };
      const name = bloomsLevels.find(b => b.id === i)?.name || 'Unknown';
      console.log(`   Level ${i} (${name}): ${stats.count} total, ${stats.nonZeroCount} with marks, ${stats.totalMarks.toFixed(2)} total marks`);
    }
    
    // 4. Identify the issue
    console.log('\n4️⃣ Issue Analysis:');
    const levelsWithCOMappings = Object.keys(bloomsUsage).filter(k => bloomsUsage[k] > 0).map(k => parseInt(k));
    const levelsWithStudentMarks = Object.keys(studentBloomsUsage).filter(k => studentBloomsUsage[k].nonZeroCount > 0).map(k => parseInt(k));
    
    console.log(`   Bloom's levels with CO mappings: [${levelsWithCOMappings.join(', ')}]`);
    console.log(`   Bloom's levels with student marks: [${levelsWithStudentMarks.join(', ')}]`);
    
    if (levelsWithCOMappings.length < 6) {
      console.log('   🚨 ROOT CAUSE: Limited CO-Blooms mappings!');
      console.log('   📝 SOLUTION: Need to create more diverse CO-Blooms mappings');
    }
    
    if (levelsWithStudentMarks.length === 2 && levelsWithStudentMarks.includes(2) && levelsWithStudentMarks.includes(3)) {
      console.log('   🚨 CONFIRMED: Only levels 2 and 3 have student marks');
    }
    
    // 5. Show sample CO mappings
    console.log('\n5️⃣ Sample CO-Blooms Mappings:');
    const sampleMappings = await CoBloomsTaxonomy.findAll({
      limit: 10,
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
      ]
    });
    
    sampleMappings.forEach(mapping => {
      const coCode = mapping.courseOutcome?.co_code || 'Unknown';
      const subjectId = mapping.courseOutcome?.subject_id || 'Unknown';
      const bloomsId = mapping.blooms_taxonomy_id;
      const bloomsName = mapping.bloomsTaxonomy?.name || 'Unknown';
      console.log(`   CO ${coCode} (${subjectId}) -> Bloom's ${bloomsId} (${bloomsName})`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

diagnoseBloomsIssue();
