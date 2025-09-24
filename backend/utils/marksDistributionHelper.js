const {
    StudentMarks,
    ComponentWeightage,
    SubComponents,
    CourseOutcome,
    CoBloomsTaxonomy,
    BloomsTaxonomy,
    SubjectComponentCo,
    StudentBloomsDistribution,
    Student,
    Semester,
    UniqueSubDegree
} = require('../models');
const { Op } = require('sequelize');

/**
 * Calculate weighted marks for a component/subcomponent
 * @param {number} marksObtained - Marks obtained by student
 * @param {number} totalMarks - Total marks of the component/subcomponent
 * @param {number} weightagePercentage - Weightage percentage of component
 * @param {number} maxSubjectMarks - Maximum marks for subject (default 150)
 * @returns {number} Weighted marks
 */
const calculateWeightedMarks = (marksObtained, totalMarks, weightagePercentage, maxSubjectMarks = 150) => {
    if (totalMarks === 0 || !totalMarks) return 0;

    // Calculate the allocated marks for this component based on weightage
    const allocatedMarks = (weightagePercentage / 100) * maxSubjectMarks;

    // Calculate the percentage of marks obtained in this component
    const percentageObtained = marksObtained / totalMarks;

    // Calculate weighted marks
    const weightedMarks = percentageObtained * allocatedMarks;

    return parseFloat(weightedMarks.toFixed(2));
};

/**
 * Get COs and their associated Bloom's levels for a component/subcomponent
 * @param {string} subjectId - Subject code
 * @param {number} componentWeightageId - Component weightage ID
 * @param {string} componentType - Component type (ESE, CA, IA, etc.)
 * @param {number} subComponentId - Subcomponent ID (optional)
 * @returns {object} Mapping of COs to Bloom's levels
 */
const getCOsAndBloomsMapping = async (subjectId, componentWeightageId, componentType, subComponentId = null) => {
    const coBloomsMapping = {};
    let selectedCOs = [];

    console.log(`Getting CO mapping for: subjectId=${subjectId}, componentWeightageId=${componentWeightageId}, componentType=${componentType}, subComponentId=${subComponentId}`);

    if (subComponentId) {
        // For subcomponents, get COs from SubComponents table
        const subComponent = await SubComponents.findByPk(subComponentId);
        if (subComponent && subComponent.selectedCOs) {
            selectedCOs = subComponent.selectedCOs;
            console.log(`Found ${selectedCOs.length} COs for subcomponent ${subComponentId}`);
        } else {
            console.log(`No COs found for subcomponent ${subComponentId}`);
        }
    } else {
        // For main components, get COs from SubjectComponentCo table
        const componentCOs = await SubjectComponentCo.findAll({
            where: {
                subject_component_id: componentWeightageId,
                component: componentType
            },
            include: [{
                model: CourseOutcome,
                as: 'courseOutcome'
            }]
        });

        console.log(`Found ${componentCOs.length} CO mappings for component ${componentType}`);
        selectedCOs = componentCOs.map(cco => cco.course_outcome_id);
    }

    // For each CO, get associated Bloom's levels
    console.log(`Processing ${selectedCOs.length} selected COs: [${selectedCOs.join(', ')}]`);

    for (const coId of selectedCOs) {
        const coBloomsLinks = await CoBloomsTaxonomy.findAll({
            where: { course_outcome_id: coId },
            include: [{
                model: BloomsTaxonomy,
                as: 'bloomsTaxonomy'
            }]
        });

        console.log(`CO ${coId} has ${coBloomsLinks.length} Bloom's level mappings`);

        coBloomsMapping[coId] = coBloomsLinks.map(link => ({
            bloomsId: link.blooms_taxonomy_id,
            bloomsName: link.bloomsTaxonomy ? link.bloomsTaxonomy.name : 'Unknown'
        }));
    }

    return coBloomsMapping;
};

/**
 * Calculate and distribute weighted marks to COs and Bloom's levels
 * @param {number} studentId - Student ID
 * @param {string} subjectId - Subject code
 * @param {number} semesterNumber - Semester number
 * @returns {array} Array of distribution records
 */
const calculateAndDistributeMarks = async (studentId, subjectId, semesterNumber) => {
    const distributionRecords = [];

    try {
        console.log(`Calculating marks distribution for student ${studentId}, subject ${subjectId}, semester ${semesterNumber}`);

        // Get student information
        const student = await Student.findByPk(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        // Get component weightage configuration
        const componentWeightage = await ComponentWeightage.findOne({
            where: { subjectId: subjectId },
            include: [{
                model: SubComponents,
                as: 'subComponents'
            }]
        });

        if (!componentWeightage) {
            console.warn(`No component weightage found for subject ${subjectId}`);
            return distributionRecords;
        }

        // Get all student marks for this subject and semester
        const studentMarks = await StudentMarks.findAll({
            where: {
                studentId: studentId,
                subjectId: subjectId,
                enrollmentSemester: semesterNumber
            },
            include: [{
                model: SubComponents,
                as: 'subComponent'
            }]
        });

        if (studentMarks.length === 0) {
            console.log(`No marks found for student ${studentId} in subject ${subjectId}`);
            return distributionRecords;
        }

        console.log(`Found ${studentMarks.length} mark entries for processing`);

        // Map to track unique Bloom's levels and their accumulated marks
        const bloomsAccumulator = {};

        // Process each mark entry
        for (const markEntry of studentMarks) {
            console.log(`\nProcessing mark entry: ${markEntry.componentType}, isSubComponent: ${markEntry.isSubComponent}, marks: ${markEntry.marksObtained}/${markEntry.totalMarks}`);

            let weightagePercentage = 0;
            let coBloomsMapping = {};

            if (markEntry.isSubComponent && markEntry.subComponent) {
                // For subcomponents, get weightage from SubComponents table
                weightagePercentage = markEntry.subComponent.weightage;
                coBloomsMapping = await getCOsAndBloomsMapping(
                    subjectId,
                    componentWeightage.id,
                    markEntry.componentType,
                    markEntry.subComponentId
                );
            } else {
                // For main components, get weightage from ComponentWeightage table
                let componentTypeLower = markEntry.componentType.toLowerCase();

                // Handle CSE/CA mapping - ComponentWeightage table uses 'cse' field
                if (componentTypeLower === 'ca') {
                    componentTypeLower = 'cse';
                }

                weightagePercentage = componentWeightage[componentTypeLower] || 0;

                console.log(`Component: ${markEntry.componentType}, Field: ${componentTypeLower}, Weightage: ${weightagePercentage}`);

                // Skip if component has no weightage
                if (weightagePercentage === 0) {
                    console.log(`Skipping component ${markEntry.componentType} - no weightage configured`);
                    continue;
                }

                coBloomsMapping = await getCOsAndBloomsMapping(
                    subjectId,
                    componentWeightage.id,
                    markEntry.componentType,
                    null
                );
            }

            // Calculate weighted marks
            const weightedMarks = calculateWeightedMarks(
                markEntry.marksObtained,
                markEntry.totalMarks,
                weightagePercentage,
                150 // Total subject marks fixed at 150
            );

            console.log(`Component: ${markEntry.componentType}${markEntry.isSubComponent ? ' - ' + markEntry.componentName : ''}`);
            console.log(`Marks: ${markEntry.marksObtained}/${markEntry.totalMarks}, Weightage: ${weightagePercentage}%, Weighted Marks: ${weightedMarks}`);

            // Collect unique Bloom's taxonomy IDs from all COs
            const uniqueBloomsIds = new Set();
            
            console.log(`CO-Blooms mapping for ${markEntry.componentType}:`, Object.keys(coBloomsMapping).length, 'COs found');

            for (const [coId, bloomsLevels] of Object.entries(coBloomsMapping)) {
                console.log(`CO ${coId} maps to Bloom's levels: [${bloomsLevels.map(b => b.bloomsId).join(', ')}]`);
                for (const bloom of bloomsLevels) {
                    uniqueBloomsIds.add(bloom.bloomsId);
                }
            }

            // Distribute the weighted marks to EACH unique Bloom's taxonomy level ONCE
            console.log(`Unique Bloom's IDs for this component: [${Array.from(uniqueBloomsIds).join(', ')}]`);
            
            for (const bloomsId of uniqueBloomsIds) {
                // Track accumulated marks per Bloom's level
                if (!bloomsAccumulator[bloomsId]) {
                    bloomsAccumulator[bloomsId] = 0;
                }
                bloomsAccumulator[bloomsId] += weightedMarks;
                
                console.log(`Adding ${weightedMarks} marks to Bloom's level ${bloomsId} (Total so far: ${bloomsAccumulator[bloomsId]})`);
            }
        }

        // Create distribution records for each Bloom's level with accumulated marks
        for (let bloomsLevel = 1; bloomsLevel <= 6; bloomsLevel++) {
            const assignedMarks = bloomsAccumulator[bloomsLevel] || 0;
            
            const record = {
                studentId: studentId,
                semesterNumber: semesterNumber,
                subjectId: subjectId,
                studentMarksSubjectComponentId: 0, // Set to 0 as these are aggregated records
                totalMarksOfComponent: 150, // Total subject marks
                subComponentWeightage: 100, // Total weightage
                selectedCOs: [], // Will contain all COs that contributed
                courseOutcomeId: 0, // Aggregated, not specific to one CO
                bloomsTaxonomyId: bloomsLevel,
                assignedMarks: parseFloat(assignedMarks.toFixed(2)),
                calculatedAt: new Date()
            };
            
            distributionRecords.push(record);
            console.log(`Final distribution for Bloom's level ${bloomsLevel}: ${assignedMarks.toFixed(2)} marks`);
        }

        console.log(`\nGenerated ${distributionRecords.length} distribution records (one per Bloom's level)`);
        return distributionRecords;

    } catch (error) {
        console.error('Error in calculateAndDistributeMarks:', error);
        throw error;
    }
};

/**
 * Aggregate marks by Bloom's taxonomy level
 * @param {array} distributionRecords - Array of distribution records
 * @returns {object} Aggregated marks by Bloom's level
 */
const aggregateMarksByBlooms = (distributionRecords) => {
    const bloomsAggregation = {};

    distributionRecords.forEach(record => {
        if (!bloomsAggregation[record.bloomsTaxonomyId]) {
            bloomsAggregation[record.bloomsTaxonomyId] = {
                totalMarks: 0,
                records: []
            };
        }

        // Add marks (not accumulate, as each CO-Bloom pair should have unique marks)
        // Check if this component was already added for this Bloom's level
        const existingComponent = bloomsAggregation[record.bloomsTaxonomyId].records.find(
            r => r.studentMarksSubjectComponentId === record.studentMarksSubjectComponentId
        );

        if (!existingComponent) {
            bloomsAggregation[record.bloomsTaxonomyId].totalMarks += record.assignedMarks;
            bloomsAggregation[record.bloomsTaxonomyId].records.push(record);
        }
    });

    return bloomsAggregation;
};

/**
 * Ensure all 6 Bloom's taxonomy levels exist for a student-subject combination
 * @param {number} studentId - Student ID
 * @param {string} subjectId - Subject ID
 * @param {number} semesterNumber - Semester number
 */
const ensureAllBloomsLevelsExist = async (studentId, subjectId, semesterNumber) => {
    try {
        console.log(`Ensuring all Bloom's levels exist for student ${studentId}, subject ${subjectId}, semester ${semesterNumber}`);

        // Get all existing Bloom's levels for this student-subject combination
        const existingBloomsLevels = await StudentBloomsDistribution.findAll({
            where: {
                studentId: studentId,
                subjectId: subjectId,
                semesterNumber: semesterNumber
            },
            attributes: ['bloomsTaxonomyId'],
            group: ['bloomsTaxonomyId']
        });

        const existingBloomsIds = existingBloomsLevels.map(level => level.bloomsTaxonomyId);
        console.log(`Found existing Bloom's levels: [${existingBloomsIds.join(', ')}]`);

        // Create placeholder entries for missing Bloom's levels (1-6)
        const placeholderRecords = [];
        for (let bloomsLevel = 1; bloomsLevel <= 6; bloomsLevel++) {
            if (!existingBloomsIds.includes(bloomsLevel)) {
                console.log(`Creating placeholder for Bloom's level ${bloomsLevel}`);
                
                // Create a placeholder record with 0 marks
                const placeholderRecord = {
                    studentId: studentId,
                    semesterNumber: semesterNumber,
                    subjectId: subjectId,
                    studentMarksSubjectComponentId: 0, // Placeholder component ID
                    totalMarksOfComponent: 0,
                    subComponentWeightage: 0,
                    selectedCOs: [],
                    courseOutcomeId: 0, // Placeholder CO ID
                    bloomsTaxonomyId: bloomsLevel,
                    assignedMarks: 0,
                    calculatedAt: new Date()
                };
                placeholderRecords.push(placeholderRecord);
            }
        }

        if (placeholderRecords.length > 0) {
            await StudentBloomsDistribution.bulkCreate(placeholderRecords);
            console.log(`Created ${placeholderRecords.length} placeholder Bloom's level entries`);
        }

        return placeholderRecords.length;

    } catch (error) {
        console.error('Error in ensureAllBloomsLevelsExist:', error);
        throw error;
    }
};

/**
 * Update existing Bloom's level entries with new marks (accumulative)
 * @param {array} distributionRecords - New distribution records to process
 * @param {number} studentId - Student ID
 * @param {string} subjectId - Subject ID
 * @param {number} semesterNumber - Semester number
 */
const updateBloomsDistribution = async (distributionRecords, studentId, subjectId, semesterNumber) => {
    try {
        console.log(`Updating Bloom's distribution for ${distributionRecords.length} records`);

        for (const record of distributionRecords) {
            // Find existing entry for this Bloom's level
            const existingEntry = await StudentBloomsDistribution.findOne({
                where: {
                    studentId: studentId,
                    subjectId: subjectId,
                    semesterNumber: semesterNumber,
                    bloomsTaxonomyId: record.bloomsTaxonomyId,
                    courseOutcomeId: record.courseOutcomeId
                }
            });

            if (existingEntry) {
                // Update existing entry by adding new marks
                const updatedMarks = parseFloat(existingEntry.assignedMarks) + parseFloat(record.assignedMarks);
                await existingEntry.update({
                    assignedMarks: updatedMarks,
                    calculatedAt: new Date(),
                    // Update other fields if they're not placeholder values
                    ...(record.studentMarksSubjectComponentId !== 0 && {
                        studentMarksSubjectComponentId: record.studentMarksSubjectComponentId,
                        totalMarksOfComponent: record.totalMarksOfComponent,
                        subComponentWeightage: record.subComponentWeightage,
                        selectedCOs: record.selectedCOs
                    })
                });
                console.log(`Updated Bloom's level ${record.bloomsTaxonomyId}, CO ${record.courseOutcomeId}: ${existingEntry.assignedMarks} + ${record.assignedMarks} = ${updatedMarks}`);
            } else {
                // Create new entry if it doesn't exist
                await StudentBloomsDistribution.create(record);
                console.log(`Created new entry for Bloom's level ${record.bloomsTaxonomyId}, CO ${record.courseOutcomeId}: ${record.assignedMarks}`);
            }
        }

    } catch (error) {
        console.error('Error in updateBloomsDistribution:', error);
        throw error;
    }
};

/**
 * Initialize all Bloom's levels for existing students (utility function for data migration)
 * @param {number} studentId - Optional student ID to process specific student
 * @param {string} subjectId - Optional subject ID to process specific subject
 * @param {number} semesterNumber - Optional semester number to process specific semester
 */
const initializeBloomsLevelsForExistingData = async (studentId = null, subjectId = null, semesterNumber = null) => {
    try {
        console.log('Initializing Bloom\'s levels for existing data...');

        // Build where clause based on provided parameters
        const whereClause = {};
        if (studentId) whereClause.studentId = studentId;
        if (subjectId) whereClause.subjectId = subjectId;
        if (semesterNumber) whereClause.enrollmentSemester = semesterNumber;

        // Get all unique student-subject-semester combinations
        const uniqueCombinations = await StudentMarks.findAll({
            where: whereClause,
            attributes: ['studentId', 'subjectId', 'enrollmentSemester'],
            group: ['studentId', 'subjectId', 'enrollmentSemester']
        });

        console.log(`Found ${uniqueCombinations.length} unique student-subject-semester combinations to process`);

        let totalPlaceholdersCreated = 0;

        for (const combination of uniqueCombinations) {
            const placeholdersCreated = await ensureAllBloomsLevelsExist(
                combination.studentId,
                combination.subjectId,
                combination.enrollmentSemester
            );
            totalPlaceholdersCreated += placeholdersCreated;
        }

        console.log(`Initialization complete. Created ${totalPlaceholdersCreated} placeholder entries.`);

        return {
            success: true,
            combinationsProcessed: uniqueCombinations.length,
            placeholdersCreated: totalPlaceholdersCreated
        };

    } catch (error) {
        console.error('Error in initializeBloomsLevelsForExistingData:', error);
        throw error;
    }
};

/**
 * Main function to process marks distribution for a student
 * @param {number} studentId - Student ID
 * @param {number} semesterNumber - Semester number
 * @param {string} subjectId - Optional subject ID to process specific subject
 */
const processStudentMarksDistribution = async (studentId, semesterNumber, subjectId = null) => {
    try {
        console.log(`\n=== Processing marks distribution for student ${studentId}, semester ${semesterNumber} ===`);

        let subjects = [];

        if (subjectId) {
            subjects = [{ subjectId }];
        } else {
            // Get all subjects for the student in this semester
            const studentMarks = await StudentMarks.findAll({
                where: {
                    studentId: studentId,
                    enrollmentSemester: semesterNumber
                },
                attributes: ['subjectId'],
                group: ['subjectId']
            });

            subjects = studentMarks.map(sm => ({ subjectId: sm.subjectId }));
        }

        console.log(`Processing ${subjects.length} subjects`);

        for (const subject of subjects) {
            console.log(`\nProcessing subject: ${subject.subjectId}`);
            
            // Calculate distribution for this subject
            const distributionRecords = await calculateAndDistributeMarks(
                studentId,
                subject.subjectId,
                semesterNumber
            );

            if (distributionRecords.length > 0) {
                // Clear existing records for this student-subject-semester combination
                const deleteCount = await StudentBloomsDistribution.destroy({
                    where: {
                        studentId: studentId,
                        subjectId: subject.subjectId,
                        semesterNumber: semesterNumber
                    }
                });
                
                console.log(`Deleted ${deleteCount} existing records for subject ${subject.subjectId}`);

                // Insert new distribution records (one per Bloom's level)
                const createdRecords = await StudentBloomsDistribution.bulkCreate(distributionRecords);
                
                console.log(`Created ${createdRecords.length} new Bloom's distribution records for subject ${subject.subjectId}`);
                
                // Log summary of marks distribution
                console.log(`\nMarks distribution summary for subject ${subject.subjectId}:`);
                for (const record of distributionRecords) {
                    const bloomsName = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'][record.bloomsTaxonomyId - 1];
                    console.log(`  Bloom's Level ${record.bloomsTaxonomyId} (${bloomsName}): ${record.assignedMarks} marks`);
                }
            } else {
                console.log(`No marks to distribute for subject ${subject.subjectId}`);
            }
        }

        // Get all created records for return
        const allCreatedRecords = await StudentBloomsDistribution.findAll({
            where: {
                studentId: studentId,
                semesterNumber: semesterNumber,
                ...(subjectId ? { subjectId: subjectId } : {})
            },
            order: [['subjectId', 'ASC'], ['bloomsTaxonomyId', 'ASC']]
        });

        console.log(`\n=== Distribution complete: ${allCreatedRecords.length} total records ===`);

        return {
            success: true,
            recordsCreated: allCreatedRecords.length,
            distributions: allCreatedRecords
        };

    } catch (error) {
        console.error('Error in processStudentMarksDistribution:', error);
        throw error;
    }
};

module.exports = {
    calculateWeightedMarks,
    getCOsAndBloomsMapping,
    calculateAndDistributeMarks,
    aggregateMarksByBlooms,
    ensureAllBloomsLevelsExist,
    updateBloomsDistribution,
    initializeBloomsLevelsForExistingData,
    processStudentMarksDistribution
};
