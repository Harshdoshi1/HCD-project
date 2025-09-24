const { StudentMarks, Student, UniqueSubDegree, Semester, Batch, SubComponents, ComponentWeightage, ComponentMarks } = require('../models');
const CourseOutcome = require('../models/courseOutcome');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

// Get comprehensive student analysis data
const getStudentAnalysisData = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;


        // Find the student
        const student = await Student.findOne({
            where: { enrollmentNumber: enrollmentNumber }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }


        // Get student's batch and current semester
        const batch = await Batch.findByPk(student.batchId);
        if (!batch) {
            return res.status(404).json({ error: 'Student batch not found' });
        }

        const currentSemester = batch.currentSemester || 1;

        // Fetch academic data for all semesters up to current
        const academicData = [];

        for (let semesterNum = 1; semesterNum <= currentSemester; semesterNum++) {
            // Find semester record
            const semester = await Semester.findOne({
                where: {
                    semesterNumber: semesterNum,
                    batchId: student.batchId
                }
            });

            if (!semester) {
                continue;
            }

            // Get all marks for this student in this semester using raw query
            const rawMarks = await sequelize.query(`
                SELECT sm.*, sub.sub_name, sub.sub_code 
                FROM StudentMarks sm 
                LEFT JOIN UniqueSubDegrees sub ON sm.subjectId = sub.sub_code 
                WHERE sm.studentId = :studentId 
                ORDER BY sm.subjectId, sm.componentType
            `, {
                replacements: { studentId: student.id },
                type: sequelize.QueryTypes.SELECT
            });


            // Process marks by subject using raw data
            const subjectMarks = {};
            rawMarks.forEach(mark => {
                const subjectCode = mark.subjectId;
                const subjectName = mark.sub_name || subjectCode;

                if (!subjectMarks[subjectCode]) {
                    subjectMarks[subjectCode] = {
                        subjectName,
                        subjectCode,
                        components: {},
                        totalMarks: 0,
                        totalPossible: 0
                    };
                }

                const componentType = mark.componentType;
                if (!subjectMarks[subjectCode].components[componentType]) {
                    subjectMarks[subjectCode].components[componentType] = {
                        marksObtained: 0,
                        totalMarks: 0,
                        subComponents: []
                    };
                }

                if (mark.isSubComponent) {
                    subjectMarks[subjectCode].components[componentType].subComponents.push({
                        name: mark.componentName,
                        marksObtained: parseFloat(mark.marksObtained) || 0,
                        totalMarks: parseInt(mark.totalMarks) || 0
                    });
                } else {
                    subjectMarks[subjectCode].components[componentType].marksObtained += parseFloat(mark.marksObtained) || 0;
                    subjectMarks[subjectCode].components[componentType].totalMarks += parseInt(mark.totalMarks) || 0;
                }

                subjectMarks[subjectCode].totalMarks += parseFloat(mark.marksObtained) || 0;
                subjectMarks[subjectCode].totalPossible += parseInt(mark.totalMarks) || 0;
            });

            // Calculate semester statistics
            let semesterTotalObtained = 0;
            let semesterTotalPossible = 0;
            const subjects = Object.values(subjectMarks);

            subjects.forEach(subject => {
                semesterTotalObtained += subject.totalMarks;
                semesterTotalPossible += subject.totalPossible;
            });

            const semesterPercentage = semesterTotalPossible > 0
                ? (semesterTotalObtained / semesterTotalPossible) * 100
                : 0;

            academicData.push({
                semester: semesterNum,
                subjects: subjects,
                totalMarksObtained: semesterTotalObtained,
                totalMarksPossible: semesterTotalPossible,
                percentage: Math.round(semesterPercentage * 100) / 100,
                subjectCount: subjects.length
            });
        }

        // Calculate overall academic performance
        const overallStats = academicData.reduce((acc, semester) => {
            acc.totalObtained += semester.totalMarksObtained;
            acc.totalPossible += semester.totalMarksPossible;
            acc.totalSubjects += semester.subjectCount;
            return acc;
        }, { totalObtained: 0, totalPossible: 0, totalSubjects: 0 });

        const overallPercentage = overallStats.totalPossible > 0
            ? (overallStats.totalObtained / overallStats.totalPossible) * 100
            : 0;

        // Generate academic insights
        const insights = generateAcademicInsights(academicData, overallPercentage);

        // Prepare chart data for academic performance
        const chartData = academicData.map(semester => ({
            semester: semester.semester,
            percentage: semester.percentage,
            marksObtained: semester.totalMarksObtained,
            totalMarks: semester.totalMarksPossible
        }));

        res.status(200).json({
            student: {
                id: student.id,
                name: student.name,
                enrollmentNumber: student.enrollmentNumber,
                batchId: student.batchId,
                currentSemester
            },
            academicData,
            overallStats: {
                ...overallStats,
                overallPercentage: Math.round(overallPercentage * 100) / 100
            },
            insights,
            chartData
        });

    } catch (error) {
        console.error('Error fetching student analysis data:', error);
        res.status(500).json({ error: error.message });
    }
};

// Generate academic performance insights
const generateAcademicInsights = (academicData, overallPercentage) => {
    const insights = {
        strengths: [],
        weaknesses: [],
        trends: '',
        recommendations: []
    };

    if (academicData.length === 0) {
        insights.trends = 'No academic data available';
        insights.recommendations.push('Start engaging with academic assessments');
        return insights;
    }

    // Analyze performance trends
    if (academicData.length > 1) {
        const firstSemester = academicData[0];
        const lastSemester = academicData[academicData.length - 1];
        const trend = lastSemester.percentage - firstSemester.percentage;

        if (trend > 5) {
            insights.trends = 'Improving academic performance';
            insights.strengths.push('Consistent academic improvement');
        } else if (trend < -5) {
            insights.trends = 'Declining academic performance';
            insights.weaknesses.push('Academic performance needs attention');
            insights.recommendations.push('Schedule study sessions with faculty');
        } else {
            insights.trends = 'Stable academic performance';
        }
    }

    // Analyze overall performance level
    if (overallPercentage >= 85) {
        insights.strengths.push('Excellent academic performance');
        insights.recommendations.push('Consider mentoring peers');
    } else if (overallPercentage >= 70) {
        insights.strengths.push('Good academic performance');
        insights.recommendations.push('Aim for excellence in challenging subjects');
    } else if (overallPercentage >= 50) {
        insights.weaknesses.push('Average academic performance');
        insights.recommendations.push('Focus on improving study strategies');
    } else {
        insights.weaknesses.push('Below average academic performance');
        insights.recommendations.push('Seek additional academic support immediately');
    }

    // Analyze subject-wise performance
    const latestSemester = academicData[academicData.length - 1];
    if (latestSemester && latestSemester.subjects.length > 0) {
        const subjectPerformances = latestSemester.subjects.map(subject => ({
            name: subject.subjectName,
            percentage: subject.totalPossible > 0 ? (subject.totalMarks / subject.totalPossible) * 100 : 0
        }));

        const bestSubject = subjectPerformances.reduce((max, subject) =>
            subject.percentage > max.percentage ? subject : max
        );

        const worstSubject = subjectPerformances.reduce((min, subject) =>
            subject.percentage < min.percentage ? subject : min
        );

        if (bestSubject.percentage > 80) {
            insights.strengths.push(`Strong performance in ${bestSubject.name}`);
        }

        if (worstSubject.percentage < 60) {
            insights.weaknesses.push(`Needs improvement in ${worstSubject.name}`);
            insights.recommendations.push(`Focus additional study time on ${worstSubject.name}`);
        }
    }

    return insights;
};

// Get Bloom's taxonomy distribution for a student
const getBloomsTaxonomyDistribution = async (req, res) => {
    try {
        const { enrollmentNumber, semesterNumber } = req.params;

        console.log(`🔍 [DEBUG] Fetching Bloom's taxonomy for enrollment: ${enrollmentNumber}, semester: ${semesterNumber}`);

        // Validate parameters
        if (!enrollmentNumber || !semesterNumber) {
            console.log('❌ [ERROR] Missing required parameters');
            return res.status(400).json({
                error: 'Missing required parameters',
                details: { enrollmentNumber, semesterNumber }
            });
        }

        const student = await Student.findOne({ where: { enrollmentNumber } });
        if (!student) {
            console.log(`❌ [ERROR] Student not found: ${enrollmentNumber}`);
            return res.status(404).json({ error: 'Student not found' });
        }

        console.log(`✅ [DEBUG] Student found: ID=${student.id}, Name=${student.name}`);

        // Validate semester number
        const semesterNum = parseInt(semesterNumber);
        if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
            console.log(`❌ [ERROR] Invalid semester number: ${semesterNumber}`);
            return res.status(400).json({
                error: 'Invalid semester number',
                details: { semesterNumber, parsed: semesterNum }
            });
        }

        // Fetch real data from student_blooms_distribution table
        console.log(`🔍 [DEBUG] Fetching from student_blooms_distribution table for studentId: ${student.id}, semester: ${semesterNum}`);

        const sqlQuery = `
            SELECT 
                sbd.subjectId,
                sub.sub_name as subjectName,
                bt.name as bloomsLevel,
                SUM(sbd.assignedMarks) as totalMarks
            FROM student_blooms_distribution sbd
            JOIN blooms_taxonomy bt ON sbd.bloomsTaxonomyId = bt.id
            LEFT JOIN UniqueSubDegrees sub ON sbd.subjectId = sub.sub_code
            WHERE sbd.studentId = :studentId 
            AND sbd.semesterNumber = :semesterNumber
            GROUP BY sbd.subjectId, sbd.bloomsTaxonomyId, bt.name, sub.sub_name
            ORDER BY sbd.subjectId, bt.id
        `;

        console.log(`📝 [DEBUG] SQL Query: ${sqlQuery.replace(/\s+/g, ' ').trim()}`);

        const results = await sequelize.query(sqlQuery, {
            replacements: { studentId: student.id, semesterNumber: semesterNum },
            type: sequelize.QueryTypes.SELECT
        });

        console.log(`📊 [DEBUG] Query returned ${results.length} rows`);

        // Check if we have any data
        if (results.length === 0) {
            console.log(`⚠️ [DEBUG] No data found in student_blooms_distribution for student ${enrollmentNumber} in semester ${semesterNumber}`);
            return res.status(200).json({
                semester: semesterNum,
                bloomsDistribution: [],
                message: 'No Bloom\'s taxonomy data available for this student and semester'
            });
        }

        // Group data by subject
        const subjectBloomsData = {};

        for (const row of results) {
            const subjectId = row.subjectId;
            const subjectName = row.subjectName || subjectId;

            if (!subjectBloomsData[subjectId]) {
                subjectBloomsData[subjectId] = {
                    subject: subjectName,
                    code: subjectId,
                    bloomsLevels: {},
                    totalMarks: 0
                };
            }

            // Add bloom's level data
            subjectBloomsData[subjectId].bloomsLevels[row.bloomsLevel] = parseFloat(row.totalMarks) || 0;
            subjectBloomsData[subjectId].totalMarks += parseFloat(row.totalMarks) || 0;
        }

        // Calculate percentages and format for frontend
        const bloomsData = Object.values(subjectBloomsData).map(subject => {
            const bloomsLevels = [];
            const totalSubjectMarks = subject.totalMarks;

            // Ensure all 6 Bloom's levels are included
            const allBloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

            for (const level of allBloomsLevels) {
                const marks = subject.bloomsLevels[level] || 0;
                const percentage = totalSubjectMarks > 0 ? Math.round((marks / totalSubjectMarks) * 100) : 0;

                bloomsLevels.push({
                    level,
                    marks: marks,
                    score: percentage
                });
            }

            return {
                subject: subject.subject,
                code: subject.code,
                totalMarks: totalSubjectMarks,
                bloomsLevels
            };
        });

        console.log(`✅ [DEBUG] Successfully processed Bloom's data for ${bloomsData.length} subjects`);
        console.log(`📊 [DEBUG] Sample data:`, bloomsData.length > 0 ? bloomsData[0] : 'No data');

        res.status(200).json({
            semester: semesterNum,
            bloomsDistribution: bloomsData,
            totalSubjects: bloomsData.length
        });

    } catch (error) {
        console.error('❌ [ERROR] Error fetching Bloom\'s taxonomy distribution:', error);
        console.error('❌ [ERROR] Stack trace:', error.stack);

        res.status(500).json({
            error: error.message,
            type: error.name,
            details: 'Check server logs for more information'
        });
    }
};




// Get subject-wise performance
const getSubjectWisePerformance = async (req, res) => {
    try {
        const { enrollmentNumber, semesterNumber } = req.params;

        console.log(`Fetching academic performance for enrollment: ${enrollmentNumber}, semester: ${semesterNumber}`);

        // Find the student
        const student = await Student.findOne({
            where: { enrollmentNumber: enrollmentNumber }
        });

        if (!student) {
            console.log(`Student not found with enrollment: ${enrollmentNumber}`);
            return res.status(404).json({
                error: 'Student not found',
                details: { enrollmentNumber }
            });
        }

        console.log('Student details:', {
            id: student.id,
            enrollmentNumber: student.enrollmentNumber,
            batchId: student.batchId,
            currentSemester: student.currentSemester
        });

        // Find all semesters for the student's batch for debugging
        const allSemesters = await Semester.findAll({
            where: { batchId: student.batchId },
            attributes: ['id', 'semesterNumber', 'batchId']
        });
        console.log(`Found ${allSemesters.length} semesters for batch ${student.batchId}:`,
            allSemesters.map(s => s.semesterNumber));

        // Find the specific semester
        const semester = await Semester.findOne({
            where: {
                semesterNumber: parseInt(semesterNumber),
                batchId: student.batchId
            }
        });

        if (!semester) {
            const availableSemesters = allSemesters.map(s => s.semesterNumber);
            const currentSemester = student.currentSemester || 1;
            const suggestedSemester = Math.min(currentSemester, ...availableSemesters);

            const errorMessage = availableSemesters.length === 0
                ? 'No semesters found for this batch. Please contact support.'
                : `Semester ${semesterNumber} not available. Available semesters: ${availableSemesters.join(', ')}.`;

            console.log('Semester not found. Details:', {
                requestedSemester: parseInt(semesterNumber),
                batchId: student.batchId,
                availableSemesters,
                currentSemester,
                suggestedSemester
            });

            return res.status(404).json({
                error: errorMessage,
                details: {
                    requestedSemester: parseInt(semesterNumber),
                    availableSemesters,
                    currentSemester,
                    suggestedSemester,
                    recommendation: `Try using semester ${suggestedSemester} instead.`
                }
            });
        }

        console.log(`Found semester:`, {
            semesterId: semester.id,
            semesterNumber: semester.semesterNumber,
            batchId: semester.batchId
        });

        // Rest of your existing code...

        // Get marks with subcomponent weightages for proper calculation
        const rawMarks = await sequelize.query(`
            SELECT 
                sm.subjectId,
                sm.componentType,
                sm.marksObtained,
                sm.totalMarks,
                sm.grades,
                sm.isSubComponent,
                sm.componentName,
                sm.subComponentId,
                sub.sub_name,
                sub.sub_code,
                sub.sub_credit,
                sc.subComponentName as subComponentName,
                sc.weightage as subComponentWeightage,
                sc.totalMarks as subComponentTotalMarks
           FROM StudentMarks sm 
LEFT JOIN UniqueSubDegrees sub ON sm.subjectId = sub.sub_code 
LEFT JOIN SubComponents sc ON sm.subComponentId = sc.id
LEFT JOIN ComponentWeightages cw ON sc.componentWeightageId = cw.id
            WHERE sm.studentId = :studentId 
            AND sm.enrollmentSemester = :semesterNumber
            ORDER BY sm.subjectId, sm.componentType, sm.isSubComponent
        `, {
            replacements: {
                studentId: student.id,
                semesterNumber: parseInt(semesterNumber)
            },
            type: sequelize.QueryTypes.SELECT
        });

        console.log(`Found ${rawMarks.length} marks records for semester ${semesterNumber}`);

        // Process marks by subject with weighted calculation
        const subjectData = {};
        rawMarks.forEach(mark => {
            const subjectCode = mark.subjectId;
            const subjectName = mark.sub_name || subjectCode;

            if (!subjectData[subjectCode]) {
                subjectData[subjectCode] = {
                    subject: subjectName,
                    shortName: subjectName.length > 15 ? subjectName.substring(0, 15) + '...' : subjectName,
                    code: subjectCode,
                    credits: mark.sub_credit || 3,
                    ese: 0,
                    ia: 0,
                    tw: 0,
                    viva: 0,
                    cse: 0,
                    total: 0,
                    totalPossible: 0, // Add totalPossible for dynamic calculation
                    percentage: 0,
                    grade: 'F'
                };
            }

            const componentType = mark.componentType.toUpperCase();
            let effectiveMarks = parseFloat(mark.marksObtained) || 0;


            // Map component types to table columns (normalize CA to CSE)
            const normalizedComponentType = componentType === 'CA' ? 'CSE' : componentType;
            switch (normalizedComponentType) {
                case 'ESE':
                    subjectData[subjectCode].ese += effectiveMarks;
                    break;
                case 'IA':
                    subjectData[subjectCode].ia += effectiveMarks;
                    break;
                case 'TW':
                    subjectData[subjectCode].tw += effectiveMarks;
                    break;
                case 'VIVA':
                    subjectData[subjectCode].viva += effectiveMarks;
                    break;
                case 'CSE':
                    subjectData[subjectCode].cse += effectiveMarks;
                    break;
            }

            subjectData[subjectCode].total += effectiveMarks;
            subjectData[subjectCode].totalPossible += parseFloat(mark.totalMarks) || 0;

            // Use grade if available
            if (mark.grades && mark.grades !== 'F') {
                subjectData[subjectCode].grade = mark.grades;
            }
        });

        // Calculate percentages and final grades
        Object.values(subjectData).forEach(subject => {
            subject.percentage = subject.totalPossible > 0
                ? ((subject.total / subject.totalPossible) * 100).toFixed(1)
                : 0;

            // Calculate grade based on percentage if not already set
            if (subject.grade === 'F') {
                const percentage = parseFloat(subject.percentage);
                if (percentage >= 90) subject.grade = 'A+';
                else if (percentage >= 80) subject.grade = 'A';
                else if (percentage >= 70) subject.grade = 'B+';
                else if (percentage >= 60) subject.grade = 'B';
                else if (percentage >= 50) subject.grade = 'C+';
                else if (percentage >= 40) subject.grade = 'C';
                else if (percentage >= 35) subject.grade = 'D';
                else subject.grade = 'F';
            }
        });

        const subjects = Object.values(subjectData);

        // Calculate summary statistics
        const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
        const averagePercentage = subjects.length > 0
            ? (subjects.reduce((sum, subject) => sum + parseFloat(subject.percentage), 0) / subjects.length).toFixed(1)
            : 0;
        const passedSubjects = subjects.filter(s => s.grade !== 'F').length;

        console.log(`Processed ${subjects.length} subjects for academic analysis`);

        res.status(200).json({
            semester: parseInt(semesterNumber),
            subjects: subjects,
            summary: {
                totalCredits,
                averagePercentage,
                passedSubjects,
                totalSubjects: subjects.length
            }
        });

    } catch (error) {
        console.error('Error fetching subject-wise performance:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getStudentAnalysisData,
    getSubjectWisePerformance,
    getBloomsTaxonomyDistribution
};