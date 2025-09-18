const { StudentMarks, Student, UniqueSubDegree, Semester, Batch, SubComponents, ComponentWeightage, ComponentMarks } = require('../models');
const CourseOutcome = require('../models/courseOutcome');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

// Get comprehensive student analysis data
const getStudentAnalysisData = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;

        console.log('Fetching analysis data for enrollment number:', enrollmentNumber);

        // Find the student
        const student = await Student.findOne({
            where: { enrollmentNumber: enrollmentNumber }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        console.log('Found student:', student.id, student.name);

        // Get student's batch and current semester
        const batch = await Batch.findByPk(student.batchId);
        if (!batch) {
            return res.status(404).json({ error: 'Student batch not found' });
        }

        console.log('Found batch:', batch.id, batch.batchName);
        const currentSemester = batch.currentSemester || 1;
        console.log('Current semester:', currentSemester);

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
                console.log(`No semester record found for semester ${semesterNum} and batch ${student.batchId}`);
                continue;
            }
            
            console.log(`Found semester record:`, semester.id, `for semester ${semesterNum}`);

            // Get all marks for this student in this semester using raw query to check actual table structure
            console.log(`Looking for marks for student ${student.id} in semester ${semester.id}`);
            
            // First, try to get marks using raw SQL to see what's actually in the database
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

            console.log(`Found ${rawMarks.length} marks records using raw query for student ${student.id}`);
            
            if (rawMarks.length > 0) {
                console.log('Sample mark record:', JSON.stringify(rawMarks[0], null, 2));
            }

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

        console.log('Final academic data:', JSON.stringify(academicData, null, 2));
        console.log('Chart data:', JSON.stringify(chartData, null, 2));

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

        console.log(`Fetching Bloom's distribution for enrollment: ${enrollmentNumber}, semester: ${semesterNumber}`);

        // Find the student
        const student = await Student.findOne({
            where: { enrollmentNumber: enrollmentNumber }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get Bloom's taxonomy distribution using complex query
        const bloomsDistribution = await sequelize.query(`
            SELECT 
                sm.subjectId,
                sub.sub_name,
                bt.name as bloomsLevel,
                bt.id as bloomsId,
                SUM(
                    CASE 
                        WHEN sm.isSubComponent = 1 AND sc.weightage IS NOT NULL THEN
                            (sm.marksObtained / sm.totalMarks) * (sc.totalMarks * (sc.weightage / 100))
                        ELSE 
                            sm.marksObtained
                    END
                ) as totalMarks,
                COUNT(DISTINCT co.id) as coCount
            FROM StudentMarks sm 
            LEFT JOIN UniqueSubDegrees sub ON sm.subjectId = sub.sub_code 
LEFT JOIN SubComponents sc ON sm.subComponentId = sc.id            LEFT JOIN ComponentWeightages cw ON sc.componentWeightageId = cw.id
            LEFT JOIN subject_component_cos scc ON scc.subject_component_id = cw.id
            LEFT JOIN course_outcomes co ON scc.course_outcome_id = co.id
            LEFT JOIN co_blooms_taxonomy cbt ON co.id = cbt.course_outcome_id
            LEFT JOIN blooms_taxonomy bt ON cbt.blooms_taxonomy_id = bt.id
            WHERE sm.studentId = :studentId 
            AND sm.enrollmentSemester = :semesterNumber
            AND bt.id IS NOT NULL
            GROUP BY sm.subjectId, bt.id
            ORDER BY sm.subjectId, bt.id
        `, {
            replacements: { 
                studentId: student.id,
                semesterNumber: parseInt(semesterNumber)
            },
            type: sequelize.QueryTypes.SELECT
        });

        console.log(`Found ${bloomsDistribution.length} Bloom's distribution records`);

        // Process the data by subject
        const subjectBloomsData = {};
        bloomsDistribution.forEach(record => {
            const subjectCode = record.subjectId;
            const subjectName = record.sub_name || subjectCode;

            if (!subjectBloomsData[subjectCode]) {
                subjectBloomsData[subjectCode] = {
                    subject: subjectName,
                    code: subjectCode,
                    bloomsLevels: {}
                };
            }

            // Distribute marks among COs and then to Bloom's levels
            const marksPerCO = record.coCount > 0 ? record.totalMarks / record.coCount : record.totalMarks;
            
            if (!subjectBloomsData[subjectCode].bloomsLevels[record.bloomsLevel]) {
                subjectBloomsData[subjectCode].bloomsLevels[record.bloomsLevel] = 0;
            }
            
            subjectBloomsData[subjectCode].bloomsLevels[record.bloomsLevel] += marksPerCO;
        });

        // Convert to array format for frontend
        const bloomsData = Object.values(subjectBloomsData).map(subject => ({
            ...subject,
            bloomsLevels: Object.entries(subject.bloomsLevels).map(([level, marks]) => ({
                level,
                marks: Math.round(marks * 100) / 100
            }))
        }));

        res.status(200).json({
            semester: parseInt(semesterNumber),
            bloomsDistribution: bloomsData
        });

    } catch (error) {
        console.error('Error fetching Bloom\'s taxonomy distribution:', error);
        res.status(500).json({ error: error.message });
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
                    percentage: 0,
                    grade: 'F'
                };
            }

            const componentType = mark.componentType.toUpperCase();
            let effectiveMarks = parseFloat(mark.marksObtained) || 0;

            // Calculate weighted marks for subcomponents
            if (mark.isSubComponent && mark.subComponentWeightage && mark.subComponentTotalMarks) {
                // Formula: weighted marks = (obtained marks ÷ total marks) × (subcomponent total marks × subcomponent weightage%)
                const obtainedMarks = parseFloat(mark.marksObtained) || 0;
                const totalMarks = parseFloat(mark.totalMarks) || 1;
                const subComponentTotalMarks = parseFloat(mark.subComponentTotalMarks) || 0;
                const subComponentWeightage = parseFloat(mark.subComponentWeightage) || 0;
                
                effectiveMarks = (obtainedMarks / totalMarks) * (subComponentTotalMarks * (subComponentWeightage / 100));
                
                console.log(`Weighted calculation for ${subjectCode} ${componentType} ${mark.subComponentName}: 
                    (${obtainedMarks}/${totalMarks}) × (${subComponentTotalMarks} × ${subComponentWeightage}%) = ${effectiveMarks}`);
            }
            
            // Map component types to table columns
            switch(componentType) {
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
                case 'CA':
                case 'CSE':
                    subjectData[subjectCode].cse += effectiveMarks;
                    break;
            }

            subjectData[subjectCode].total += effectiveMarks;
            
            // Use grade if available
            if (mark.grades && mark.grades !== 'F') {
                subjectData[subjectCode].grade = mark.grades;
            }
        });

        // Calculate percentages and final grades
        Object.values(subjectData).forEach(subject => {
            // Assuming total marks are: ESE(100) + IA(25) + TW(25) + VIVA(15) + CSE(15) = 180
            const totalPossible = 180;
            subject.percentage = subject.total > 0 ? ((subject.total / totalPossible) * 100).toFixed(1) : 0;
            
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
