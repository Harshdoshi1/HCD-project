const express = require('express');
const router = express.Router();

const {
    addSemester,
    getSemestersByBatch,
    getSemestersByBatch
} = require('../controller/semesterController.js');

// Semester Routes
router.post('/addSemester', addSemester);
router.get('/getSemestersByBatch/:batchName', getSemestersByBatch);
router.get('/getSemestersByBatch', getSemestersByBatch);


module.exports = router;