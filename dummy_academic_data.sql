-- Dummy Academic Data for StudentAnalysis Testing
-- This file creates sample academic marks data for student with enrollment number 92300133028

-- First, let's get the student ID and related information
-- Assuming student with enrollment number 92300133028 exists

-- Insert dummy subjects if they don't exist
INSERT IGNORE INTO uniquesubdegrees (sub_code, sub_name, sub_level, sub_credit, program) VALUES
('CS101', 'Programming Fundamentals', 'department', 4, 'Degree'),
('CS102', 'Data Structures', 'department', 4, 'Degree'),
('CS103', 'Database Management Systems', 'department', 4, 'Degree'),
('CS104', 'Computer Networks', 'department', 3, 'Degree'),
('CS105', 'Software Engineering', 'department', 3, 'Degree'),
('MA101', 'Engineering Mathematics', 'central', 4, 'Degree'),
('PH101', 'Engineering Physics', 'central', 3, 'Degree');

-- Insert dummy semesters for the batch if they don't exist
INSERT IGNORE INTO semesters (semesterNumber, batchId, isActive, created_at, updated_at) VALUES
(1, (SELECT id FROM batches WHERE batchName = 'Degree 23-27' LIMIT 1), 1, NOW(), NOW()),
(2, (SELECT id FROM batches WHERE batchName = 'Degree 23-27' LIMIT 1), 0, NOW(), NOW()),
(3, (SELECT id FROM batches WHERE batchName = 'Degree 23-27' LIMIT 1), 0, NOW(), NOW());

-- Get student ID for enrollment number 92300133028
SET @student_id = (SELECT id FROM students WHERE enrollmentNumber = '92300133028' LIMIT 1);
SET @batch_id = (SELECT batchId FROM students WHERE enrollmentNumber = '92300133028' LIMIT 1);
SET @faculty_id = (SELECT id FROM users WHERE role = 'faculty' LIMIT 1);

-- Semester 1 Academic Data
SET @semester1_id = (SELECT id FROM semesters WHERE semesterNumber = 1 AND batchId = @batch_id LIMIT 1);

-- Programming Fundamentals (CS101) - Semester 1
INSERT INTO studentmarks (studentId, facultyId, subjectId, semesterId, batchId, componentType, marksObtained, totalMarks, isSubComponent, enrollmentSemester, created_at, updated_at) VALUES
(@student_id, @faculty_id, 'CS101', @semester1_id, @batch_id, 'CA', 18, 20, 0, 1, NOW(), NOW()),
(@student_id, @faculty_id, 'CS101', @semester1_id, @batch_id, 'ESE', 72, 80, 0, 1, NOW(), NOW()),
(@student_id, @faculty_id, 'CS101', @semester1_id, @batch_id, 'IA', 16, 20, 0, 1, NOW(), NOW());

-- Data Structures (CS102) - Semester 1
INSERT INTO studentmarks (studentId, facultyId, subjectId, semesterId, batchId, componentType, marksObtained, totalMarks, isSubComponent, enrollmentSemester, created_at, updated_at) VALUES
(@student_id, @faculty_id, 'CS102', @semester1_id, @batch_id, 'CA', 17, 20, 0, 1, NOW(), NOW()),
(@student_id, @faculty_id, 'CS102', @semester1_id, @batch_id, 'ESE', 68, 80, 0, 1, NOW(), NOW()),
(@student_id, @faculty_id, 'CS102', @semester1_id, @batch_id, 'IA', 18, 20, 0, 1, NOW(), NOW());

-- Engineering Mathematics (MA101) - Semester 1
INSERT INTO studentmarks (studentId, facultyId, subjectId, semesterId, batchId, componentType, marksObtained, totalMarks, isSubComponent, enrollmentSemester, created_at, updated_at) VALUES
(@student_id, @faculty_id, 'MA101', @semester1_id, @batch_id, 'CA', 15, 20, 0, 1, NOW(), NOW()),
(@student_id, @faculty_id, 'MA101', @semester1_id, @batch_id, 'ESE', 65, 80, 0, 1, NOW(), NOW()),
(@student_id, @faculty_id, 'MA101', @semester1_id, @batch_id, 'IA', 17, 20, 0, 1, NOW(), NOW());

-- Engineering Physics (PH101) - Semester 1
INSERT INTO studentmarks (studentId, facultyId, subjectId, semesterId, batchId, componentType, marksObtained, totalMarks, isSubComponent, enrollmentSemester, created_at, updated_at) VALUES
(@student_id, @faculty_id, 'PH101', @semester1_id, @batch_id, 'CA', 16, 20, 0, 1, NOW(), NOW()),
(@student_id, @faculty_id, 'PH101', @semester1_id, @batch_id, 'ESE', 70, 80, 0, 1, NOW(), NOW()),
(@student_id, @faculty_id, 'PH101', @semester1_id, @batch_id, 'IA', 19, 20, 0, 1, NOW(), NOW());

-- If student is in semester 2 or higher, add semester 2 data
-- Semester 2 Academic Data (if applicable)
SET @semester2_id = (SELECT id FROM semesters WHERE semesterNumber = 2 AND batchId = @batch_id LIMIT 1);

-- Database Management Systems (CS103) - Semester 2
INSERT INTO studentmarks (studentId, facultyId, subjectId, semesterId, batchId, componentType, marksObtained, totalMarks, isSubComponent, enrollmentSemester, created_at, updated_at) VALUES
(@student_id, @faculty_id, 'CS103', @semester2_id, @batch_id, 'CA', 19, 20, 0, 2, NOW(), NOW()),
(@student_id, @faculty_id, 'CS103', @semester2_id, @batch_id, 'ESE', 75, 80, 0, 2, NOW(), NOW()),
(@student_id, @faculty_id, 'CS103', @semester2_id, @batch_id, 'IA', 18, 20, 0, 2, NOW(), NOW()),
(@student_id, @faculty_id, 'CS103', @semester2_id, @batch_id, 'TW', 22, 25, 0, 2, NOW(), NOW());

-- Computer Networks (CS104) - Semester 2
INSERT INTO studentmarks (studentId, facultyId, subjectId, semesterId, batchId, componentType, marksObtained, totalMarks, isSubComponent, enrollmentSemester, created_at, updated_at) VALUES
(@student_id, @faculty_id, 'CS104', @semester2_id, @batch_id, 'CA', 17, 20, 0, 2, NOW(), NOW()),
(@student_id, @faculty_id, 'CS104', @semester2_id, @batch_id, 'ESE', 71, 80, 0, 2, NOW(), NOW()),
(@student_id, @faculty_id, 'CS104', @semester2_id, @batch_id, 'IA', 16, 20, 0, 2, NOW(), NOW()),
(@student_id, @faculty_id, 'CS104', @semester2_id, @batch_id, 'VIVA', 18, 20, 0, 2, NOW(), NOW());

-- Software Engineering (CS105) - Semester 2
INSERT INTO studentmarks (studentId, facultyId, subjectId, semesterId, batchId, componentType, marksObtained, totalMarks, isSubComponent, enrollmentSemester, created_at, updated_at) VALUES
(@student_id, @faculty_id, 'CS105', @semester2_id, @batch_id, 'CA', 18, 20, 0, 2, NOW(), NOW()),
(@student_id, @faculty_id, 'CS105', @semester2_id, @batch_id, 'ESE', 78, 80, 0, 2, NOW(), NOW()),
(@student_id, @faculty_id, 'CS105', @semester2_id, @batch_id, 'IA', 19, 20, 0, 2, NOW(), NOW());

-- Add some sub-component marks examples
-- First, let's create some component weightages and sub-components for CS101
INSERT IGNORE INTO componentweightages (subjectId, componentType, weightage, totalMarks, created_at, updated_at) VALUES
('CS101', 'CA', 20, 20, NOW(), NOW()),
('CS101', 'ESE', 80, 80, NOW(), NOW());

-- Get the componentWeightageId for CS101 CA
SET @ca_weightage_id = (SELECT id FROM componentweightages WHERE subjectId = 'CS101' AND componentType = 'CA' LIMIT 1);

-- Create sub-components for CS101 CA
INSERT IGNORE INTO subcomponents (componentWeightageId, componentType, subComponentName, weightage, totalMarks, selectedCOs, isEnabled, created_at, updated_at) VALUES
(@ca_weightage_id, 'CA', 'Quiz 1', 10, 10, '["CO1","CO2"]', 1, NOW(), NOW()),
(@ca_weightage_id, 'CA', 'Quiz 2', 10, 10, '["CO2","CO3"]', 1, NOW(), NOW());

-- Get sub-component IDs
SET @quiz1_id = (SELECT id FROM subcomponents WHERE subComponentName = 'Quiz 1' AND componentWeightageId = @ca_weightage_id LIMIT 1);
SET @quiz2_id = (SELECT id FROM subcomponents WHERE subComponentName = 'Quiz 2' AND componentWeightageId = @ca_weightage_id LIMIT 1);

-- Insert sub-component marks
INSERT INTO studentmarks (studentId, facultyId, subjectId, semesterId, batchId, subComponentId, componentType, componentName, marksObtained, totalMarks, isSubComponent, enrollmentSemester, created_at, updated_at) VALUES
(@student_id, @faculty_id, 'CS101', @semester1_id, @batch_id, @quiz1_id, 'CA', 'Quiz 1', 9, 10, 1, 1, NOW(), NOW()),
(@student_id, @faculty_id, 'CS101', @semester1_id, @batch_id, @quiz2_id, 'CA', 'Quiz 2', 9, 10, 1, 1, NOW(), NOW());

-- Verify data insertion
SELECT 'Data insertion completed. Verifying records...' as Status;

SELECT 
    s.name as StudentName,
    s.enrollmentNumber,
    sub.sub_name as SubjectName,
    sm.componentType,
    sm.marksObtained,
    sm.totalMarks,
    sem.semesterNumber,
    CASE WHEN sm.isSubComponent = 1 THEN sm.componentName ELSE 'Main Component' END as ComponentDetail
FROM studentmarks sm
JOIN students s ON sm.studentId = s.id
JOIN uniquesubdegrees sub ON sm.subjectId = sub.sub_code
JOIN semesters sem ON sm.semesterId = sem.id
WHERE s.enrollmentNumber = '92300133028'
ORDER BY sem.semesterNumber, sub.sub_name, sm.componentType, sm.isSubComponent;

-- Show summary statistics
SELECT 
    sem.semesterNumber,
    COUNT(DISTINCT sm.subjectId) as SubjectCount,
    SUM(sm.marksObtained) as TotalMarksObtained,
    SUM(sm.totalMarks) as TotalMarksPossible,
    ROUND((SUM(sm.marksObtained) / SUM(sm.totalMarks)) * 100, 2) as Percentage
FROM studentmarks sm
JOIN students s ON sm.studentId = s.id
JOIN semesters sem ON sm.semesterId = sem.id
WHERE s.enrollmentNumber = '92300133028' AND sm.isSubComponent = 0
GROUP BY sem.semesterNumber
ORDER BY sem.semesterNumber;
