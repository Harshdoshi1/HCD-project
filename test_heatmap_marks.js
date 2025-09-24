// Test the updated heatmap with marks instead of scores
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

// Updated getBloomScore function (returns marks)
const getBloomScore = (subjectCode, level) => {
  const subjectBloomsData = sampleBloomsData.find(data => data.code === subjectCode);
  if (subjectBloomsData && subjectBloomsData.bloomsLevels) {
    const levelData = subjectBloomsData.bloomsLevels.find(bl => bl.level === level);
    if (levelData) {
      return Math.round(levelData.marks * 100) / 100; // Round to 2 decimal places
    }
  }
  return 0;
};

// Updated getBloomClass function (works with marks)
const getBloomClass = (marks) => {
  // Calculate max marks across all subjects and levels for relative comparison
  let maxMarks = 0;
  if (sampleBloomsData && sampleBloomsData.length > 0) {
    sampleBloomsData.forEach(subject => {
      subject.bloomsLevels.forEach(level => {
        if (level.marks > maxMarks) {
          maxMarks = level.marks;
        }
      });
    });
  }
  
  if (maxMarks === 0) return "weak-bloom";
  
  // Calculate relative percentage for color coding
  const relativePercentage = (marks / maxMarks) * 100;
  
  if (relativePercentage >= 85) return "excellent-bloom";
  if (relativePercentage >= 70) return "good-bloom";
  if (relativePercentage >= 55) return "average-bloom";
  return "weak-bloom";
};

console.log('🔍 Testing Updated Heatmap with Marks:');
console.log('📊 Input Data:', JSON.stringify(sampleBloomsData, null, 2));

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const subjectCode = "01ctac";

console.log('\n🌡️ Heatmap Display Values:');
bloomLevels.forEach(level => {
  const marks = getBloomScore(subjectCode, level);
  const bloomClass = getBloomClass(marks);
  const subjectBloomsData = sampleBloomsData.find(data => data.code === subjectCode);
  const levelData = subjectBloomsData?.bloomsLevels?.find(bl => bl.level === level);
  const percentage = levelData?.score || 0;
  
  console.log(`${level}:`);
  console.log(`  Display: ${marks} marks`);
  console.log(`  Color: ${bloomClass}`);
  console.log(`  Tooltip: "${level}: ${marks} marks (${percentage}% of subject total)"`);
  console.log('');
});

// Calculate max marks for reference
let maxMarks = 0;
sampleBloomsData.forEach(subject => {
  subject.bloomsLevels.forEach(level => {
    if (level.marks > maxMarks) {
      maxMarks = level.marks;
    }
  });
});

console.log('✅ Summary:');
console.log(`- Heatmap shows actual marks (not percentages)`);
console.log(`- Max marks in dataset: ${maxMarks}`);
console.log(`- Color coding based on relative performance`);
console.log(`- Tooltip shows marks + percentage context`);
console.log(`- Better UI with larger cells and improved readability`);
