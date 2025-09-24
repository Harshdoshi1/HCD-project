// Test the Bloom's taxonomy chart data transformation
const sampleBloomsData = [
  {
    "subject": "ac",
    "code": "01ctac",
    "totalMarks": 381,
    "bloomsLevels": [
      {"level": "Remember", "marks": 84.75, "score": 22},
      {"level": "Understand", "marks": 84.75, "score": 22},
      {"level": "Apply", "marks": 43.75, "score": 11},
      {"level": "Analyze", "marks": 43.75, "score": 11},
      {"level": "Evaluate", "marks": 62, "score": 16},
      {"level": "Create", "marks": 62, "score": 16}
    ]
  }
];

// Spider Chart Data (Marks)
const getBloomsTaxonomyData = () => {
  if (sampleBloomsData && sampleBloomsData.length > 0) {
    const bloomsAggregation = {};
    const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

    bloomLevels.forEach((level) => {
      bloomsAggregation[level] = { totalMarks: 0 };
    });

    sampleBloomsData.forEach((subjectData) => {
      subjectData.bloomsLevels.forEach((levelData) => {
        if (bloomsAggregation[levelData.level]) {
          bloomsAggregation[levelData.level].totalMarks += levelData.marks || 0;
        }
      });
    });

    return bloomLevels.map((level) => ({
      level,
      marks: Math.round(bloomsAggregation[level].totalMarks * 100) / 100,
    }));
  }
  return [];
};

// Pie Chart Data (Percentages)
const getBloomsPieChartData = () => {
  if (sampleBloomsData && sampleBloomsData.length > 0) {
    const bloomsAggregation = {};
    const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

    bloomLevels.forEach((level) => {
      bloomsAggregation[level] = { totalMarks: 0 };
    });

    sampleBloomsData.forEach((subjectData) => {
      subjectData.bloomsLevels.forEach((levelData) => {
        if (bloomsAggregation[levelData.level]) {
          bloomsAggregation[levelData.level].totalMarks += levelData.marks || 0;
        }
      });
    });

    const totalMarks = Object.values(bloomsAggregation).reduce((sum, level) => sum + level.totalMarks, 0);
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];
    
    return bloomLevels.map((level, index) => ({
      level,
      marks: Math.round(bloomsAggregation[level].totalMarks * 100) / 100,
      percentage: totalMarks > 0 ? Math.round((bloomsAggregation[level].totalMarks / totalMarks) * 100) : 0,
      fill: colors[index]
    }));
  }
  return [];
};

console.log('🔍 Testing Bloom\'s Taxonomy Chart Data:');
console.log('📊 Input Data:', JSON.stringify(sampleBloomsData, null, 2));
console.log('\n🕷️ Spider Chart Data (Marks):');
console.log(JSON.stringify(getBloomsTaxonomyData(), null, 2));
console.log('\n🥧 Pie Chart Data (Percentages):');
console.log(JSON.stringify(getBloomsPieChartData(), null, 2));

// Verify totals
const spiderData = getBloomsTaxonomyData();
const pieData = getBloomsPieChartData();
const totalMarks = spiderData.reduce((sum, item) => sum + item.marks, 0);
const totalPercentage = pieData.reduce((sum, item) => sum + item.percentage, 0);

console.log('\n✅ Verification:');
console.log(`Total Marks: ${totalMarks}`);
console.log(`Total Percentage: ${totalPercentage}%`);
console.log(`Expected Total: 381 marks, 100%`);
