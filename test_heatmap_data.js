// Test the Subject-wise Bloom's Heatmap data transformation
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

// Simulate the heatmap functions
const getHeatmapSubjects = () => {
  if (sampleBloomsData && sampleBloomsData.length > 0) {
    return sampleBloomsData.map(subject => ({
      id: subject.code,
      code: subject.code,
      subject: subject.subject,
      shortName: subject.subject.length > 15 ? subject.subject.substring(0, 15) + '...' : subject.subject
    }));
  }
  return [];
};

const getBloomScore = (subjectCode, level) => {
  const subjectBloomsData = sampleBloomsData.find(data => data.code === subjectCode);
  if (subjectBloomsData && subjectBloomsData.bloomsLevels) {
    const levelData = subjectBloomsData.bloomsLevels.find(bl => bl.level === level);
    if (levelData) {
      return Math.round(levelData.score);
    }
  }
  return 0;
};

const getBloomClass = (score) => {
  if (score >= 85) return "excellent-bloom";
  if (score >= 70) return "good-bloom";
  if (score >= 55) return "average-bloom";
  return "weak-bloom";
};

console.log('🔍 Testing Subject-wise Bloom\'s Heatmap Data:');
console.log('📊 Input Data:', JSON.stringify(sampleBloomsData, null, 2));

const heatmapSubjects = getHeatmapSubjects();
console.log('\n📋 Heatmap Subjects:', JSON.stringify(heatmapSubjects, null, 2));

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
console.log('\n🌡️ Heatmap Data:');

heatmapSubjects.forEach(subject => {
  console.log(`\nSubject: ${subject.subject} (${subject.code})`);
  bloomLevels.forEach(level => {
    const score = getBloomScore(subject.code, level);
    const bloomClass = getBloomClass(score);
    const subjectBloomsData = sampleBloomsData.find(data => data.code === subject.code);
    const levelData = subjectBloomsData?.bloomsLevels?.find(bl => bl.level === level);
    const marks = levelData?.marks || 0;
    
    console.log(`  ${level}: ${score}% (${marks} marks) - ${bloomClass}`);
  });
});

console.log('\n✅ Heatmap will show:');
console.log('- Subject names in rows');
console.log('- Bloom\'s levels in columns');
console.log('- Percentage scores in cells with color coding');
console.log('- Tooltip shows: Subject, Level, Score%, and Marks on hover');
