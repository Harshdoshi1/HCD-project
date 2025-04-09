const Gettedmarks = require("../models/gettedmarks");
const Student = require("../models/students");
const UniqueSubDegree = require("../models/uniqueSubDegree");
const Batch = require("../models/batch");

<<<<<<< HEAD

exports.getStudentMarksByBatchAndSubject = async (req, res) => {
=======
const getStudentMarksByBatchAndSubject = async (req, res) => {
>>>>>>> 2e802401986c644057b50467ad4d329e339fa83e
    try {
        const { batchName } = req.params;

<<<<<<< HEAD
        // const batch = await Batch.findOne({ where: { id: batchId } });
        // if (!batch) {
        //     return res.status(404).json({ message: "Batch not found" });
        // }

        // console.log('Batch:', batch);

        const students = await Student.findAll({ where: { batchId: batchId} });

        if (!students || students.length === 0) {
            return res.status(404).json({ message: "No students found for this batch" });
        }

        console.log('Students:', students);

        res.status(200).json(students.map(student => student.toJSON()));
    } catch (error) {
        console.error("Error fetching student marks:", error);
        res.status(500).json({ message: "Error fetching student marks", error: error.stack });
    }
};

exports.getStudentMarksByBatchAndSubject1 = async (req, res) => {
    try {
        const { batchId } = req.params;
        console.log("Received check:", batchId);

        const batch = await Batch.findOne({ where: { batchName: batchId } });
=======
        console.log("Received check:", batchName);

        const batch = await Batch.findOne({ where: { batchName: batchName } });
>>>>>>> 2e802401986c644057b50467ad4d329e339fa83e
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // console.log('Batch:', batch);

        const students = await Student.findAll({ where: { batchId: batch.id } });

        if (!students || students.length === 0) {
            return res.status(404).json({ message: "No students found for this batch" });
        }

        console.log('Students:', students);

        res.status(200).json(students.map(student => student.toJSON()));
    } catch (error) {
        console.error("Error fetching student marks:", error);
        res.status(500).json({ message: "Error fetching student marks", error: error.stack });
    }
};

<<<<<<< HEAD
exports.updateStudentMarks = async (req, res) => {
=======
// exports.getStudentMarksByBatchAndSubjectf = async (req, res) => {
//     try {
//         const { batchId } = req.params;
//         console.log("recieved check==", batchId)
//         console.log('Fetching marks for batch:', batchId);
//         // find id from batch table 
//         const batch = await Batch.findOne({ where: { batchName: batchId } });
//         console.log('Batch:', batch);
//         // Get students from the specified batch with their marks
//         const students = await Student.findAll({
//             where: { batchId: batch.id }
//             // include: [{
//             //     model: Gettedmarks,
//             //     where: { subjectId },
//             //     required: false // Left join to get all students even if they don't have marks yet
//             // }]
//         });
//         console.log('cccccc ===Students:', students);
//         res.status(200).json(students);
//     } catch (error) {
//         console.error("Error fetching student marks:", error);
//         res.status(500).json({ message: "Error fetching student marks", error: error.message });
//     }
// };


const updateStudentMarks = async (req, res) => {
>>>>>>> 2e802401986c644057b50467ad4d329e339fa83e
    try {
        const { studentId, subjectId } = req.params;
        const { ese, cse, ia, tw, viva, facultyId, response } = req.body;

        console.log('Updating marks for student:', studentId, 'and subject:', subjectId);

        // Ensure subject exists
        const subjectExists = await UniqueSubDegree.findOne({
            where: { sub_code: subjectId }
        });

        if (!subjectExists) {
            return res.status(400).json({ error: `Subject ID ${subjectId} does not exist.` });
        }

        const [marks, created] = await Gettedmarks.findOrCreate({
            where: { studentId, subjectId },
            defaults: {
                facultyId,
                ese: ese || 0,
                cse: cse || 0,
                ia: ia || 0,
                tw: tw || 0,
                viva: viva || 0,
                facultyResponse: response || ''
            }
        });

        if (!created) {
            await marks.update({
                facultyId,
                ...(ese !== undefined && { ese }),
                ...(cse !== undefined && { cse }),
                ...(ia !== undefined && { ia }),
                ...(tw !== undefined && { tw }),
                ...(viva !== undefined && { viva }),
                ...(response !== undefined && { facultyResponse: response })
            });
        }

        res.status(200).json({ message: 'Marks updated successfully', data: marks });

    } catch (error) {
        console.error('Error updating student marks:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};


module.exports = {
    updateStudentMarks,
    getStudentMarksByBatchAndSubject,
    // getStudentMarksByBatchAndSubjectf
};

