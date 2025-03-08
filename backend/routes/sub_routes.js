const express = require('express');
const {
    addSubject,
    getSubjects,
    getSubjectByCode,
    deleteSubject,
    getAllSubjects
} = require('../controller/sub_controller'); // Ensure correct path

const router = express.Router();

router.post('/addSubject', addSubject);
router.get('/getAllSubjects', getAllSubjects);
router.get('/getSubjectByCode/:code/:courseType', getSubjectByCode);
router.delete('/deleteSubject/:code/:courseType', deleteSubject);
router.get('/subjects/:program/:batchId/:semesterId', getSubjects);

module.exports = router;
