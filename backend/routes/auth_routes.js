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
router.get('/getAllUsers', getAllUsers);


// Faculty Routes
router.post('/addFaculty', addFaculty);

// Batch Routes
router.post('/addBatch', addBatch);
router.get('/getAllBatches', getAllBatches);

// Semester Routes
router.post('/addSemester', addSemester);
router.get('/getSemestersByBatch/:batchName', getSemestersByBatch);
router.get('/getSemestersByBatch', getSemestersByBatch);

router.post('/addSubject', addSubject);
router.get("/getSubjects/:batchName/:semesterNumber", getSubjectsByBatchAndSemester);

router.post('/addUniqueSubDegree', addUniqueSubDegree);
router.post('/addUniqueSubDiploma', addUniqueSubDiploma);

router.post('/getSubjects', getSubjects);
router.get('/getDropdownData', getDropdownData);
router.post('/assignSubject', assignSubject);
module.exports = router;
