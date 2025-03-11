const Gettedmarks = require("../models/gettedmarks");
const Student = require("../models/students");
const UniqueSubDegree = require("../models/uniqueSubDegree");
const Batch = require("../models/batch");
exports.getStudentMarksByBatchAndSubject = async (req, res) => {
    try {
        const { batchId } = req.params;
        console.log('Fetching marks for batch:', batchId);
        // find id from batch table 
        const batch = await Batch.findOne({ where: { batchName: batchId } });
        console.log('Batch:', batch);
        // Get students from the specified batch with their marks
        const students = await Student.findAll({
            where: { batchId: batch.id },
            // include: [{
            //     model: Gettedmarks,
            //     where: { subjectId },
            //     required: false // Left join to get all students even if they don't have marks yet
            // }]
        });

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching student marks:", error);
        res.status(500).json({ message: "Error fetching student marks", error: error.message });
    }
};

exports.updateStudentMarks = async (req, res) => {
    try {
        const { studentId, subjectId } = req.params;
        const { ese, cse, ia, tw, viva, facultyId } = req.body;
        console.log('Updating marks for student:', studentId, 'and subject:', subjectId);
        console.log('Marks data:', { 
            facultyId,
            ese,
            cse,
            ia,
            tw,
            viva
        });

        const [marks, created] = await Gettedmarks.findOrCreate({
            where: { studentId, subjectId },
            defaults: {
                facultyId,
                ese: ese || 0,
                cse: cse || 0,
                ia: ia || 0,
                tw: tw || 0,
                viva: viva || 0
            }
        });

        if (!created) {
            await marks.update({
                ese: ese || marks.ese,
                cse: cse || marks.cse,
                ia: ia || marks.ia,
                tw: tw || marks.tw,
                viva: viva || marks.viva
            });
        }

        res.status(200).json(marks);
    } catch (error) {
        console.error("Error updating student marks:", error);
        res.status(500).json({ message: "Error updating student marks", error: error.message });
    }
};
