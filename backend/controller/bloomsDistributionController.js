const { 
    Student, 
    StudentBloomsDistribution, 
    BloomsTaxonomy, 
    UniqueSubDegree, 
    StudentMarks
} = require('../models');

// Calculate and store Bloom's taxonomy distribution for a student using ORM
const calculateAndStoreBloomsDistribution = async (req, res) => {
    try {
        const { enrollmentNumber, semesterNumber } = req.params;
        console.log(`Calculating Bloom's distribution for enrollment: ${enrollmentNumber}, semester: ${semesterNumber}`);

        // Find the student
        const student = await Student.findOne({
            where: { enrollmentNumber: enrollmentNumber }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get student marks for the semester using ORM
        const studentMarks = await StudentMarks.findAll({
            where: {
                studentId: student.id,
                enrollmentSemester: parseInt(semesterNumber)
            },
            include: [
                {
                    model: UniqueSubDegree,
                    as: 'subject',
                    attributes: ['sub_code', 'sub_name']
                }
            ]
        });

        console.log(`Found ${studentMarks.length} student marks records`);

        // Get all Bloom's taxonomy levels using ORM
        const bloomsLevels = await BloomsTaxonomy.findAll();
        
        // Create distribution data
        const newDistributionRecords = [];
        
        // Group marks by subject
        const subjectGroups = {};
        studentMarks.forEach(mark => {
            if (!subjectGroups[mark.subjectId]) {
                subjectGroups[mark.subjectId] = {
                    totalMarks: 0,
                    obtainedMarks: 0,
                    subjectName: mark.subject?.sub_name || mark.subjectId
                };
            }
            subjectGroups[mark.subjectId].totalMarks += parseFloat(mark.totalMarks) || 0;
            subjectGroups[mark.subjectId].obtainedMarks += parseFloat(mark.marksObtained) || 0;
        });

        // Create distribution for each subject and Bloom's level
        for (const [subjectId, subjectData] of Object.entries(subjectGroups)) {
            bloomsLevels.forEach((bloomsLevel, index) => {
                // Simple equal distribution among Bloom's levels for testing
                const percentage = 100 / bloomsLevels.length;
                const distributedMarks = (subjectData.obtainedMarks * percentage) / 100;
                const totalPossibleMarks = (subjectData.totalMarks * percentage) / 100;
                
                newDistributionRecords.push({
                    studentId: student.id,
                    subjectId: subjectId,
                    semesterNumber: parseInt(semesterNumber),
                    bloomsTaxonomyId: bloomsLevel.id,
                    distributedMarks: parseFloat(distributedMarks.toFixed(2)),
                    totalPossibleMarks: parseFloat(totalPossibleMarks.toFixed(2)),
                    percentage: totalPossibleMarks > 0 ? parseFloat(((distributedMarks / totalPossibleMarks) * 100).toFixed(2)) : 0
                });
            });
        }

        // Clear existing distribution data using ORM
        await StudentBloomsDistribution.destroy({
            where: {
                studentId: student.id,
                semesterNumber: parseInt(semesterNumber)
            }
        });

        // Insert new distribution data using ORM
        if (newDistributionRecords.length > 0) {
            await StudentBloomsDistribution.bulkCreate(newDistributionRecords);
            console.log(`Stored ${newDistributionRecords.length} Bloom's distribution records`);
        }

        res.status(200).json({
            message: 'Bloom\'s taxonomy distribution calculated and stored successfully',
            recordsCreated: newDistributionRecords.length,
            distributions: newDistributionRecords
        });

    } catch (error) {
        console.error('Error calculating Bloom\'s distribution:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get stored Bloom's taxonomy distribution for a student using ORM
const getStoredBloomsDistribution = async (req, res) => {
    try {
        const { enrollmentNumber, semesterNumber } = req.params;
        console.log(`Fetching stored Bloom's distribution for enrollment: ${enrollmentNumber}, semester: ${semesterNumber}`);

        // Find the student using ORM
        const student = await Student.findOne({
            where: { enrollmentNumber: enrollmentNumber }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get stored distribution data using ORM
        const distributionData = await StudentBloomsDistribution.findAll({
            where: {
                studentId: student.id,
                semesterNumber: parseInt(semesterNumber)
            },
            include: [
                {
                    model: UniqueSubDegree,
                    as: 'subject',
                    attributes: ['sub_code', 'sub_name']
                },
                {
                    model: BloomsTaxonomy,
                    as: 'bloomsTaxonomy',
                    attributes: ['id', 'name']
                }
            ],
            order: [['subjectId', 'ASC'], ['bloomsTaxonomyId', 'ASC']]
        });

        console.log(`Found ${distributionData.length} stored distribution records`);

        // Process the data by subject
        const subjectBloomsData = {};
        distributionData.forEach(record => {
            const subjectCode = record.subjectId;
            const subjectName = record.subject?.sub_name || subjectCode;

            if (!subjectBloomsData[subjectCode]) {
                subjectBloomsData[subjectCode] = {
                    subject: subjectName,
                    code: subjectCode,
                    bloomsLevels: []
                };
            }

            subjectBloomsData[subjectCode].bloomsLevels.push({
                level: record.bloomsTaxonomy?.name || 'Unknown',
                marks: parseFloat(record.distributedMarks),
                totalMarks: parseFloat(record.totalPossibleMarks),
                percentage: parseFloat(record.percentage)
            });
        });

        // Convert to array format for frontend
        const bloomsDataArray = Object.values(subjectBloomsData);

        res.status(200).json({
            semester: parseInt(semesterNumber),
            bloomsDistribution: bloomsDataArray,
            totalRecords: distributionData.length
        });

    } catch (error) {
        console.error('Error fetching stored Bloom\'s distribution:', error);
        res.status(500).json({ error: error.message });
    }
};

// Direct function for internal use (without HTTP req/res) using ORM
const calculateAndStoreBloomsDistributionDirect = async (enrollmentNumber, semesterNumber) => {
    try {
        console.log(`Calculating Bloom's distribution for enrollment: ${enrollmentNumber}, semester: ${semesterNumber}`);

        // Find the student using ORM
        const student = await Student.findOne({
            where: { enrollmentNumber: enrollmentNumber }
        });

        if (!student) {
            throw new Error('Student not found');
        }

        // Get student marks for the semester using ORM
        const studentMarks = await StudentMarks.findAll({
            where: {
                studentId: student.id,
                enrollmentSemester: parseInt(semesterNumber)
            },
            include: [
                {
                    model: UniqueSubDegree,
                    as: 'subject',
                    attributes: ['sub_code', 'sub_name']
                }
            ]
        });

        console.log(`Found ${studentMarks.length} student marks records`);

        // Get all Bloom's taxonomy levels using ORM
        const bloomsLevels = await BloomsTaxonomy.findAll();
        
        // Create distribution data
        const directDistributionRecords = [];
        
        // Group marks by subject
        const subjectGroups = {};
        studentMarks.forEach(mark => {
            if (!subjectGroups[mark.subjectId]) {
                subjectGroups[mark.subjectId] = {
                    totalMarks: 0,
                    obtainedMarks: 0,
                    subjectName: mark.subject?.sub_name || mark.subjectId
                };
            }
            subjectGroups[mark.subjectId].totalMarks += parseFloat(mark.totalMarks) || 0;
            subjectGroups[mark.subjectId].obtainedMarks += parseFloat(mark.marksObtained) || 0;
        });

        // Create distribution for each subject and Bloom's level
        for (const [subjectId, subjectData] of Object.entries(subjectGroups)) {
            bloomsLevels.forEach((bloomsLevel, index) => {
                // Simple equal distribution among Bloom's levels for testing
                const percentage = 100 / bloomsLevels.length;
                const distributedMarks = (subjectData.obtainedMarks * percentage) / 100;
                const totalPossibleMarks = (subjectData.totalMarks * percentage) / 100;
                
                directDistributionRecords.push({
                    studentId: student.id,
                    subjectId: subjectId,
                    semesterNumber: parseInt(semesterNumber),
                    bloomsTaxonomyId: bloomsLevel.id,
                    distributedMarks: parseFloat(distributedMarks.toFixed(2)),
                    totalPossibleMarks: parseFloat(totalPossibleMarks.toFixed(2)),
                    percentage: totalPossibleMarks > 0 ? parseFloat(((distributedMarks / totalPossibleMarks) * 100).toFixed(2)) : 0
                });
            });
        }

        // Clear existing distribution data using ORM
        await StudentBloomsDistribution.destroy({
            where: {
                studentId: student.id,
                semesterNumber: parseInt(semesterNumber)
            }
        });

        // Insert new distribution data using ORM
        if (directDistributionRecords.length > 0) {
            await StudentBloomsDistribution.bulkCreate(directDistributionRecords);
            console.log(`Stored ${directDistributionRecords.length} Bloom's distribution records`);
        }

        return directDistributionRecords;

    } catch (error) {
        console.error('Error calculating Bloom\'s distribution:', error);
        throw error;
    }
};

module.exports = {
    calculateAndStoreBloomsDistribution,
    getStoredBloomsDistribution,
    calculateAndStoreBloomsDistributionDirect
};
