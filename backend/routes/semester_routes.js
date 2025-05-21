const express = require('express');
const router = express.Router();

const {
    addSemester,
    getSemestersByBatch,
    getAllSemesters
} = require('../controller/semesterController.js');

// Semester Routes
router.post('/addSemester', addSemester);
router.get('/getSemestersByBatch/:batchName', getSemestersByBatch);
router.get('/getAllSemesters', getAllSemesters);

module.exports = router;