# Marks Distribution Calculation Example

## How the Calculation Works

### Given Data:
- **Total Subject Marks**: 150 (fixed)
- **Student**: John Doe (ID: 123)
- **Subject**: CS101
- **Semester**: 5

### Component Configuration:

| Component | Weightage (%) | Total Marks | Student Score |
|-----------|---------------|-------------|---------------|
| ESE       | 60%          | 100         | 75/100        |
| CA Quiz 1 | 10%          | 30          | 25/30         |
| CA Quiz 2 | 10%          | 30          | 20/30         |
| IA        | 10%          | 50          | 40/50         |
| TW        | 10%          | 25          | 20/25         |
| **TOTAL** | **100%**     | -           | -             |

### CO Mapping:

- **ESE**: CO1, CO2
- **CA Quiz 1**: CO1, CO2
- **CA Quiz 2**: CO3
- **IA**: CO1, CO3
- **TW**: CO2, CO3

### Bloom's Taxonomy Mapping:

- **CO1**: Remember (1), Understand (2)
- **CO2**: Apply (3), Analyze (4)
- **CO3**: Evaluate (5), Create (6)

## Step-by-Step Calculation:

### Step 1: Calculate Weighted Marks for Each Component

#### ESE:
- Weightage: 60% of 150 = 90 marks allocated
- Student scored: 75/100 = 75%
- Weighted marks: 75% × 90 = **67.5 marks**
- Maps to CO1, CO2 → Bloom's levels: 1, 2, 3, 4
- Each Bloom's level gets: **67.5 marks**

#### CA Quiz 1:
- Weightage: 10% of 150 = 15 marks allocated
- Student scored: 25/30 = 83.33%
- Weighted marks: 83.33% × 15 = **12.5 marks**
- Maps to CO1, CO2 → Bloom's levels: 1, 2, 3, 4
- Each Bloom's level gets: **12.5 marks**

#### CA Quiz 2:
- Weightage: 10% of 150 = 15 marks allocated
- Student scored: 20/30 = 66.67%
- Weighted marks: 66.67% × 15 = **10 marks**
- Maps to CO3 → Bloom's levels: 5, 6
- Each Bloom's level gets: **10 marks**

#### IA:
- Weightage: 10% of 150 = 15 marks allocated
- Student scored: 40/50 = 80%
- Weighted marks: 80% × 15 = **12 marks**
- Maps to CO1, CO3 → Bloom's levels: 1, 2, 5, 6
- Each Bloom's level gets: **12 marks**

#### TW:
- Weightage: 10% of 150 = 15 marks allocated
- Student scored: 20/25 = 80%
- Weighted marks: 80% × 15 = **12 marks**
- Maps to CO2, CO3 → Bloom's levels: 3, 4, 5, 6
- Each Bloom's level gets: **12 marks**

### Step 2: Accumulate Marks by Bloom's Level

| Bloom's Level | From Components | Total Marks |
|---------------|-----------------|-------------|
| 1. Remember   | ESE (67.5) + CA Quiz 1 (12.5) + IA (12) | **92.0** |
| 2. Understand | ESE (67.5) + CA Quiz 1 (12.5) + IA (12) | **92.0** |
| 3. Apply      | ESE (67.5) + CA Quiz 1 (12.5) + TW (12) | **92.0** |
| 4. Analyze    | ESE (67.5) + CA Quiz 1 (12.5) + TW (12) | **92.0** |
| 5. Evaluate   | CA Quiz 2 (10) + IA (12) + TW (12) | **34.0** |
| 6. Create     | CA Quiz 2 (10) + IA (12) + TW (12) | **34.0** |
| **TOTAL**     | - | **436.0** |

### Important Notes:

1. **Marks are NOT divided among Bloom's levels** - each level gets the FULL weighted marks from its mapped components
2. **The total can exceed 150** because a single component's marks can contribute to multiple Bloom's levels
3. **This is intentional** - it shows the student's performance across different cognitive levels
4. **Each Bloom's level is stored as a separate row** in the `student_blooms_distribution` table

### Database Storage:

The `student_blooms_distribution` table will have 6 rows for this example:

```sql
| studentId | subjectId | bloomsTaxonomyId | assignedMarks |
|-----------|-----------|------------------|---------------|
| 123       | CS101     | 1                | 92.00         |
| 123       | CS101     | 2                | 92.00         |
| 123       | CS101     | 3                | 92.00         |
| 123       | CS101     | 4                | 92.00         |
| 123       | CS101     | 5                | 34.00         |
| 123       | CS101     | 6                | 34.00         |
```

## Alternative Calculation (If marks should be normalized to 150):

If the requirement is to have the total sum equal to 150, you would need to:
1. Calculate all weighted marks as above
2. Find the total sum
3. Apply a normalization factor: 150 / total_sum
4. Multiply each Bloom's level marks by this factor

Example:
- Total sum = 436
- Normalization factor = 150 / 436 = 0.344
- Remember: 92 × 0.344 = 31.65 marks
- (and so on for other levels...)
