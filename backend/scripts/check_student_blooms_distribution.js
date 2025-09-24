const { StudentBloomsDistribution, Student, BloomsTaxonomy } = require('../models');

async function checkStudentBloomsDistribution() {
  try {
    console.log('=== Checking Student Bloom\'s Distribution ===');
    
    // Get all records from student_blooms_distribution
    const distributions = await StudentBloomsDistribution.findAll({
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['enrollmentNumber', 'name']
        },
        {
          model: BloomsTaxonomy,
          as: 'bloomsTaxonomy',
          attributes: ['id', 'name']
        }
      ],
      order: [['studentId', 'ASC'], ['subjectId', 'ASC'], ['bloomsTaxonomyId', 'ASC']],
      limit: 50 // Limit to first 50 records for analysis
    });
    
    console.log(`Found ${distributions.length} distribution records (showing first 50):`);
    
    // Group by student and subject
    const studentSubjectDistribution = {};
    const bloomsIdDistribution = {};
    
    distributions.forEach(dist => {
      const studentId = dist.studentId;
      const subjectId = dist.subjectId;
      const bloomsId = dist.bloomsTaxonomyId;
      const marks = parseFloat(dist.assignedMarks);
      
      // Track distribution by student-subject
      const key = `${studentId}-${subjectId}`;
      if (!studentSubjectDistribution[key]) {
        studentSubjectDistribution[key] = {
          studentId,
          subjectId,
          enrollmentNumber: dist.student?.enrollmentNumber || 'Unknown',
          bloomsDistribution: {}
        };
      }
      
      studentSubjectDistribution[key].bloomsDistribution[bloomsId] = marks;
      
      // Track overall Bloom's ID usage
      if (!bloomsIdDistribution[bloomsId]) {
        bloomsIdDistribution[bloomsId] = {
          count: 0,
          totalMarks: 0,
          nonZeroCount: 0
        };
      }
      bloomsIdDistribution[bloomsId].count++;
      bloomsIdDistribution[bloomsId].totalMarks += marks;
      if (marks > 0) {
        bloomsIdDistribution[bloomsId].nonZeroCount++;
      }
    });
    
    // Display first few student-subject combinations
    console.log('\nFirst 10 Student-Subject Distributions:');
    const keys = Object.keys(studentSubjectDistribution).slice(0, 10);
    keys.forEach(key => {
      const dist = studentSubjectDistribution[key];
      console.log(`\nStudent ${dist.enrollmentNumber} (ID: ${dist.studentId}), Subject: ${dist.subjectId}`);
      for (let i = 1; i <= 6; i++) {
        const marks = dist.bloomsDistribution[i] || 0;
        console.log(`  Bloom's Level ${i}: ${marks} marks`);
      }
    });
    
    // Display Bloom's ID distribution summary
    console.log('\n=== Bloom\'s ID Distribution Summary ===');
    for (let i = 1; i <= 6; i++) {
      const stats = bloomsIdDistribution[i] || { count: 0, totalMarks: 0, nonZeroCount: 0 };
      const avgMarks = stats.count > 0 ? (stats.totalMarks / stats.count).toFixed(2) : 0;
      console.log(`Bloom's Level ${i}:`);
      console.log(`  Total records: ${stats.count}`);
      console.log(`  Records with marks > 0: ${stats.nonZeroCount}`);
      console.log(`  Total marks: ${stats.totalMarks.toFixed(2)}`);
      console.log(`  Average marks: ${avgMarks}`);
    }
    
    // Check if the issue is that only levels 2 and 3 have marks
    const levelsWithMarks = [];
    for (let i = 1; i <= 6; i++) {
      const stats = bloomsIdDistribution[i];
      if (stats && stats.nonZeroCount > 0) {
        levelsWithMarks.push(i);
      }
    }
    
    console.log(`\nBloom's levels with non-zero marks: [${levelsWithMarks.join(', ')}]`);
    
    if (levelsWithMarks.length === 2 && levelsWithMarks.includes(2) && levelsWithMarks.includes(3)) {
      console.log('🚨 ISSUE CONFIRMED: Only Bloom\'s levels 2 and 3 have marks!');
      console.log('This indicates a problem in the CO-Blooms mapping or distribution logic.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkStudentBloomsDistribution();
