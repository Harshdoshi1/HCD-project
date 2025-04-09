const express = require("express");
const router = express.Router();
const {
    getStudentMarksByBatchAndSubject,
    updateStudentMarks,
    // getStudentMarksByBatchAndSubjectf
} = require("../controller/gettedMarksController");


// router.get('/api/marks/students/:batchId', getStudentMarksByBatchAndSubject);
// router.post('/api/marks/update/:studentId/:subjectId', updateStudentMarks);

router.get('/marks/students/:batchName', getStudentMarksByBatchAndSubject);
router.post('/marks/update/:studentId/:subjectId', updateStudentMarks);
// router.get('marks/studentss/:batchId', getStudentMarksByBatchAndSubjectf)


module.exports = router;
