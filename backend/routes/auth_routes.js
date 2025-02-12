const express = require('express');
const {
    registerUser,
    loginUser,
    getAllUsers,
    addFaculty,
    addBatch,
    getAllBatches,
    addSemester,
    getSemestersByBatch
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

module.exports = router;
