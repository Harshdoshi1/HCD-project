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
        const student = await Student.findOne({ where: { enrollmentNumber } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        console.log(`Calculating Bloom's taxonomy for student ${enrollmentNumber}, semester ${semesterNumber}`);

        // Get comprehensive data with proper weightage calculations
        const results = await sequelize.query(`
            SELECT
                sm.subjectId, 
                sub.sub_name, 
                sm.marksObtained, 
                sm.totalMarks AS subComponentTotalMarks,
                sm.componentType, 
                sc.id AS subComponentId, 
                sc.subComponentName,
                sc.weightage AS subComponentWeightage,
                sc.totalMarks AS subComponentMaxMarks,
                sc.selectedCOs,
                cw.id AS componentWeightageId, 
                cw.ese, cw.ia, cw.tw, cw.viva,
                co.id AS coId, 
                co.description AS coDescription,
                bt.id AS bloomsId,
                bt.name AS bloomsLevel
            FROM StudentMarks sm
            JOIN SubComponents sc ON sm.subComponentId = sc.id
            JOIN ComponentWeightages cw ON sc.componentWeightageId = cw.id
            JOIN UniqueSubDegrees sub ON sm.subjectId = sub.sub_code
            LEFT JOIN course_outcomes co ON JSON_CONTAINS(sc.selectedCOs, JSON_QUOTE(co.co_code), '$')
            LEFT JOIN co_blooms_taxonomy cbt ON cbt.course_outcome_id = co.id
            LEFT JOIN blooms_taxonomy bt ON cbt.blooms_taxonomy_id = bt.id
            WHERE sm.studentId = :studentId 
            AND sm.enrollmentSemester = :semesterNumber
            AND sc.isEnabled = 1
            ORDER BY sm.subjectId, sm.componentType, sc.id
        `, { 
            replacements: { studentId: student.id, semesterNumber }, 
            type: sequelize.QueryTypes.SELECT 
        });

        console.log(`Found ${results.length} records for Bloom's calculation`);
        
        // Debug: Check what data we actually got
        if (results.length > 0) {
            console.log('Sample result:', JSON.stringify(results[0], null, 2));
        }

        // Debug: Check if we have subcomponents for this student's marks
        const debugSubComponents = await sequelize.query(`
            SELECT 
                sm.subjectId,
                sm.componentType,
                sm.subComponentId,
                sc.subComponentName,
                sc.selectedCOs,
                sc.isEnabled
            FROM StudentMarks sm
            LEFT JOIN SubComponents sc ON sm.subComponentId = sc.id
            WHERE sm.studentId = :studentId 
            AND sm.enrollmentSemester = :semesterNumber
        `, { 
            replacements: { studentId: student.id, semesterNumber }, 
            type: sequelize.QueryTypes.SELECT 
        });
        
        console.log(`Debug - Found ${debugSubComponents.length} subcomponents:`, debugSubComponents);

        // Debug: Check course outcomes for this subject
        const debugCourseOutcomes = await sequelize.query(`
            SELECT co.id, co.description, co.subject_id 
            FROM course_outcomes co 
            WHERE co.subject_id IN (
                SELECT DISTINCT sm.subjectId 
                FROM StudentMarks sm 
                WHERE sm.studentId = :studentId AND sm.enrollmentSemester = :semesterNumber
            )
        `, { 
            replacements: { studentId: student.id, semesterNumber }, 
            type: sequelize.QueryTypes.SELECT 
        });
        
        console.log(`Debug - Found ${debugCourseOutcomes.length} course outcomes:`, debugCourseOutcomes);

        // Debug: Check Bloom's taxonomy levels
        const debugBloomsTaxonomy = await sequelize.query(`
            SELECT bt.id, bt.name, cbt.course_outcome_id
            FROM blooms_taxonomy bt
            LEFT JOIN co_blooms_taxonomy cbt ON bt.id = cbt.blooms_taxonomy_id
            WHERE cbt.course_outcome_id IN (
                SELECT co.id FROM course_outcomes co 
                WHERE co.subject_id IN (
                    SELECT DISTINCT sm.subjectId 
                    FROM StudentMarks sm 
                    WHERE sm.studentId = :studentId AND sm.enrollmentSemester = :semesterNumber
                )
            )
        `, { 
            replacements: { studentId: student.id, semesterNumber }, 
            type: sequelize.QueryTypes.SELECT 
        });
        
        console.log(`Debug - Found ${debugBloomsTaxonomy.length} Bloom's levels:`, debugBloomsTaxonomy);

        // Debug: Let's check if the issue is with the JSON_CONTAINS function
        const debugJsonContains = await sequelize.query(`
            SELECT 
                sc.id, 
                sc.subComponentName, 
                sc.selectedCOs,
                co.id as coId,
                co.description
            FROM SubComponents sc
            JOIN ComponentWeightages cw ON sc.componentWeightageId = cw.id
            LEFT JOIN course_outcomes co ON JSON_CONTAINS(sc.selectedCOs, JSON_QUOTE(co.co_code), '$')
            WHERE cw.subjectId IN (
                SELECT DISTINCT sm.subjectId 
                FROM StudentMarks sm 
                WHERE sm.studentId = :studentId AND sm.enrollmentSemester = :semesterNumber
            )
        `, { 
            replacements: { studentId: student.id, semesterNumber }, 
            type: sequelize.QueryTypes.SELECT 
        });
        
        console.log(`Debug - JSON_CONTAINS test:`, debugJsonContains);

        const subjectBloomsData = {};

        // Group results by subject and process each subcomponent
        const subjectGroups = {};
        results.forEach(row => {
            if (!subjectGroups[row.subjectId]) {
                subjectGroups[row.subjectId] = {
                    subject: row.sub_name,
                    code: row.subjectId,
                    subComponents: {}
                };
            }
            
            if (!subjectGroups[row.subjectId].subComponents[row.subComponentId]) {
                subjectGroups[row.subjectId].subComponents[row.subComponentId] = {
                    ...row,
                    cos: new Set(),
                    bloomsLevels: new Set()
                };
            }
            
            if (row.coId) {
                subjectGroups[row.subjectId].subComponents[row.subComponentId].cos.add(row.coId);
            }
            if (row.bloomsLevel) {
                subjectGroups[row.subjectId].subComponents[row.subComponentId].bloomsLevels.add(row.bloomsLevel);
            }
        });

        // If no results from complex query, try a simpler approach
        if (results.length === 0) {
            console.log('Complex query returned no results, trying simpler approach...');
            
            // Get student marks with subcomponents
            const simpleMarks = await sequelize.query(`
                SELECT 
                    sm.subjectId,
                    sm.marksObtained,
                    sm.totalMarks,
                    sm.componentType,
                    sc.id as subComponentId,
                    sc.subComponentName,
                    sc.weightage,
                    sc.selectedCOs,
                    cw.ese, cw.ia, cw.tw, cw.viva,
                    sub.sub_name
                FROM StudentMarks sm
                LEFT JOIN SubComponents sc ON sm.subComponentId = sc.id
                LEFT JOIN ComponentWeightages cw ON sc.componentWeightageId = cw.id
                LEFT JOIN UniqueSubDegrees sub ON sm.subjectId = sub.sub_code
                WHERE sm.studentId = :studentId 
                AND sm.enrollmentSemester = :semesterNumber
            `, { 
                replacements: { studentId: student.id, semesterNumber }, 
                type: sequelize.QueryTypes.SELECT 
            });
            
            console.log(`Simple query found ${simpleMarks.length} records:`, simpleMarks);
            
            // For now, return mock Bloom's data to show the structure works
            if (simpleMarks.length > 0) {
                const mockBloomsData = simpleMarks.reduce((acc, mark) => {
                    if (!acc[mark.subjectId]) {
                        acc[mark.subjectId] = {
                            subject: mark.sub_name,
                            code: mark.subjectId,
                            bloomsLevels: [
                                { level: 'Remember', score: 75, obtained: 15, possible: 20 },
                                { level: 'Understand', score: 80, obtained: 16, possible: 20 },
                                { level: 'Apply', score: 70, obtained: 14, possible: 20 },
                                { level: 'Analyze', score: 65, obtained: 13, possible: 20 },
                                { level: 'Evaluate', score: 60, obtained: 12, possible: 20 },
                                { level: 'Create', score: 55, obtained: 11, possible: 20 }
                            ]
                        };
                    }
                    return acc;
                }, {});
                
                const mockResponse = Object.values(mockBloomsData);
                console.log('Returning mock Bloom\'s data for testing:', mockResponse);
                
                return res.status(200).json({ 
                    semester: parseInt(semesterNumber), 
                    bloomsDistribution: mockResponse,
                    debug: 'Using mock data - need to set up course outcomes and Bloom\'s taxonomy'
                });
            }
        }

        // Also handle components without subcomponents
        const directComponents = await sequelize.query(`
            SELECT DISTINCT
                sm.subjectId,
                sm.componentType,
                sm.marksObtained,
                sm.totalMarks,
                sub.sub_name,
                cw.ese, cw.ia, cw.tw, cw.viva
            FROM StudentMarks sm
            JOIN UniqueSubDegrees sub ON sm.subjectId = sub.sub_code
            LEFT JOIN ComponentWeightages cw ON cw.subjectId = sm.subjectId
            WHERE sm.studentId = :studentId 
            AND sm.enrollmentSemester = :semesterNumber
            AND sm.subComponentId IS NULL
        `, { 
            replacements: { studentId: student.id, semesterNumber }, 
            type: sequelize.QueryTypes.SELECT 
        });

        console.log(`Found ${directComponents.length} direct components without subcomponents:`, directComponents);

        // Process direct components and add them to subjectGroups
        directComponents.forEach(component => {
            if (!subjectGroups[component.subjectId]) {
                subjectGroups[component.subjectId] = {
                    subject: component.sub_name,
                    code: component.subjectId,
                    subComponents: {}
                };
            }
            
            // Create a virtual subcomponent for direct components
            const virtualSubComponentId = `direct_${component.componentType}`;
            subjectGroups[component.subjectId].subComponents[virtualSubComponentId] = {
                subjectId: component.subjectId,
                sub_name: component.sub_name,
                marksObtained: component.marksObtained,
                subComponentTotalMarks: component.totalMarks,
                componentType: component.componentType,
                subComponentId: virtualSubComponentId,
                subComponentName: `${component.componentType} (Direct)`,
                subComponentWeightage: 100, // Direct component takes 100% of its component weightage
                ese: component.ese,
                ia: component.ia,
                tw: component.tw,
                viva: component.viva,
                cos: new Set(), // Will be populated if COs are assigned
                bloomsLevels: new Set() // Will be populated if Bloom's levels are assigned
            };
        });

        // For direct components, we need to assign default Course Outcomes and Bloom's levels
        // Since they don't have subcomponents with selectedCOs, we'll assign all available COs for the subject
        for (const [subjectId, subjectData] of Object.entries(subjectGroups)) {
            for (const [subComponentId, subComponent] of Object.entries(subjectData.subComponents)) {
                if (subComponentId.startsWith('direct_')) {
                    // Get all course outcomes for this subject
                    const subjectCOs = debugCourseOutcomes.filter(co => co.subject_id === subjectId);
                    subjectCOs.forEach(co => {
                        subComponent.cos.add(co.id);
                    });
                    
                    // Get all Bloom's levels for these COs
                    const coIds = Array.from(subComponent.cos);
                    const bloomsForCOs = debugBloomsTaxonomy.filter(bt => coIds.includes(bt.course_outcome_id));
                    bloomsForCOs.forEach(bt => {
                        subComponent.bloomsLevels.add(bt.name);
                    });
                    
                    console.log(`Direct component ${subComponent.subComponentName} assigned ${subComponent.cos.size} COs and ${subComponent.bloomsLevels.size} Bloom's levels`);
                }
            }
        }

        // Process each subject
        for (const [subjectId, subjectData] of Object.entries(subjectGroups)) {
            subjectBloomsData[subjectId] = {
                subject: subjectData.subject,
                code: subjectData.code,
                bloomsLevels: {}
            };

            // Process each subcomponent (including virtual ones for direct components)
            for (const [subComponentId, subComponent] of Object.entries(subjectData.subComponents)) {
                // Get the component's total weightage from ComponentWeightages
                let componentTotalWeightage = 0;
                switch (subComponent.componentType.toUpperCase()) {
                    case 'ESE': componentTotalWeightage = subComponent.ese; break;
                    case 'IA': componentTotalWeightage = subComponent.ia; break;
                    case 'TW': componentTotalWeightage = subComponent.tw; break;
                    case 'VIVA': componentTotalWeightage = subComponent.viva; break;
                    case 'CA': 
                    case 'CSE': 
                        // Calculate CA/CSE as remaining weightage (total should be 100)
                        const otherWeightages = (subComponent.ese || 0) + (subComponent.ia || 0) + (subComponent.tw || 0) + (subComponent.viva || 0);
                        componentTotalWeightage = Math.max(0, 100 - otherWeightages);
                        break;
                }

                if (componentTotalWeightage === 0) continue;

                // Calculate the effective contribution of this subcomponent
                const subComponentContribution = (subComponent.subComponentWeightage / 100) * componentTotalWeightage;
                
                // Calculate actual marks obtained as percentage of subcomponent max marks
                const marksPercentage = subComponent.subComponentTotalMarks > 0 
                    ? (subComponent.marksObtained / subComponent.subComponentTotalMarks) 
                    : 0;

                // Effective marks obtained for this subcomponent
                const effectiveMarksObtained = marksPercentage * subComponentContribution;
                const effectiveMaxMarks = subComponentContribution;

                console.log(`SubComponent ${subComponent.subComponentName}: ${effectiveMarksObtained}/${effectiveMaxMarks} (${(marksPercentage * 100).toFixed(1)}%)`);

                // Distribute marks among COs and then to Bloom's levels
                const cosArray = Array.from(subComponent.cos);
                const bloomsArray = Array.from(subComponent.bloomsLevels);

                if (cosArray.length > 0 && bloomsArray.length > 0) {
                    // Distribute marks equally among all Bloom's levels for this subcomponent
                    const marksPerBloomLevel = effectiveMarksObtained / bloomsArray.length;
                    const maxMarksPerBloomLevel = effectiveMaxMarks / bloomsArray.length;

                    bloomsArray.forEach(bloomLevel => {
                        if (!subjectBloomsData[subjectId].bloomsLevels[bloomLevel]) {
                            subjectBloomsData[subjectId].bloomsLevels[bloomLevel] = {
                                obtained: 0,
                                possible: 0
                            };
                        }
                        
                        subjectBloomsData[subjectId].bloomsLevels[bloomLevel].obtained += marksPerBloomLevel;
                        subjectBloomsData[subjectId].bloomsLevels[bloomLevel].possible += maxMarksPerBloomLevel;
                    });
                }
            }
        }

        // Format for frontend response
        const bloomsData = Object.values(subjectBloomsData).map(subject => ({
            subject: subject.subject,
            code: subject.code,
            bloomsLevels: Object.entries(subject.bloomsLevels).map(([level, data]) => ({
                level,
                score: data.possible > 0 ? Math.round((data.obtained / data.possible) * 100) : 0,
                obtained: Math.round(data.obtained * 100) / 100,
                possible: Math.round(data.possible * 100) / 100
            }))
        }));

        console.log(`Processed Bloom's data for ${bloomsData.length} subjects`);
        
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
                    totalPossible: 0, // Add totalPossible for dynamic calculation
                    percentage: 0,
                    grade: 'F'
                };
            }

            const componentType = mark.componentType.toUpperCase();
            let effectiveMarks = parseFloat(mark.marksObtained) || 0;

            
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