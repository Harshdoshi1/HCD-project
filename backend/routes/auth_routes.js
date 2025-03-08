const express = require('express');
const {
    registerUser,
    loginUser,
    getAllUsers,
    addFaculty,
    addBatch,
    getAllBatches,
    addSemester,
    getSemestersByBatch,
    addSubject,
    getSubjectsByBatchAndSemester,
    addUniqueSubDegree,
    addUniqueSubDiploma,
    getSubjects,
    getDropdownData,
    assignSubject
} = require('../controller/authController'); // Ensure correct path

const router = express.Router();

// User Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', getAllUsers);


// Faculty Routes
router.post('/faculty', addFaculty);

// Batch Routes
router.post('/batch', addBatch);
router.get('/getAllBatches', getAllBatches);

// Semester Routes
router.post('/semester', addSemester);
router.get('/getSemestersByBatch/:batchName', getSemestersByBatch);
router.get('/getSemestersByBatch', getSemestersByBatch);

router.post('/addSubject', addSubject);
router.get("/getSubjectsByBatchAndSemester/:batchName/:semesterNumber", getSubjectsByBatchAndSemester);

router.post('/uniqueSubDegree', addUniqueSubDegree);
router.post('/uniqueSubDiploma', addUniqueSubDiploma);

router.post('/getSubjects', getSubjects);
router.get('/getDropdownData', getDropdownData);
router.post('/assignSubject', assignSubject);
module.exports = router;
