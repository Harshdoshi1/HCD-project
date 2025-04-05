const express = require('express');
const {
    getSubjects,
    getDropdownData,
    assignSubject,
    getSubjectsByBatchSemesterandFaculty,
    addUniqueSubDegree,
    addUniqueSubDiploma,
    addSubjectWithComponents,
    getSubjectWithComponents,
    addSubject,
    getSubjectByCode,
    deleteSubject,
    getSubjectsByBatchAndSemester
} = require('../controller/subController');

const router = express.Router();


router.post('/addSubject', addSubject);
router.get('/getSubjectByCode', getSubjectByCode);
router.get('/getSubjects', getSubjects);
router.get('/getDropdownData', getDropdownData);
router.post('/assignSubject', assignSubject);
router.post('/getSubjectsByBatchSemesterandFaculty', getSubjectsByBatchSemesterandFaculty);


router.post('/addUniqueSubDegree', addUniqueSubDegree);
router.post('/addUniqueSubDiploma', addUniqueSubDiploma);


router.post("/addSubjectWithComponents", addSubjectWithComponents);
router.get("/subject/:subjectCode", getSubjectWithComponents);


router.get("/getSubjects/:batchName/:semesterNumber", getSubjectsByBatchAndSemester);


router.delete("/deleteSubjectbycode", deleteSubject);

module.exports = router;
