// Test script to verify Bloom's taxonomy data transformation
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

const getBloomsTaxonomyData = () => {
  if (sampleBloomsData && sampleBloomsData.length > 0) {
    // Aggregate Bloom's data across all subjects for the spider chart
    const bloomsAggregation = {};
    const bloomLevels = [
      "Remember",
      "Understand",
      "Apply",
      "Analyze",
      "Evaluate",
      "Create",
    ];

    // Initialize aggregation
    bloomLevels.forEach((level) => {
      bloomsAggregation[level] = { totalMarks: 0 };
    });

    // Sum actual marks from all subjects
    sampleBloomsData.forEach((subjectData) => {
      subjectData.bloomsLevels.forEach((levelData) => {
        if (bloomsAggregation[levelData.level]) {
          bloomsAggregation[levelData.level].totalMarks += levelData.marks || 0;
        }
      });
    });

    // Return total marks for each level
    return bloomLevels.map((level) => ({
      level,
      marks: Math.round(bloomsAggregation[level].totalMarks * 100) / 100, // Round to 2 decimal places
    }));
  }

  return [];
};

console.log('🔍 Testing Bloom\'s Taxonomy Data Transformation:');
console.log('📊 Input Data:', JSON.stringify(sampleBloomsData, null, 2));
console.log('📈 Transformed Data for Spider Chart:', JSON.stringify(getBloomsTaxonomyData(), null, 2));

// Expected output should show actual marks instead of percentages
const expectedOutput = [
  { level: "Remember", marks: 84.75 },
  { level: "Understand", marks: 84.75 },
  { level: "Apply", marks: 43.75 },
  { level: "Analyze", marks: 43.75 },
  { level: "Evaluate", marks: 62 },
  { level: "Create", marks: 62 }
];

console.log('✅ Expected Output:', JSON.stringify(expectedOutput, null, 2));
