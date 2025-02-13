const express = require('express');
const {
    addSubject
} = require('../controller/sub_controller'); // Ensure correct path

const router = express.Router();

router.post('/addSubject', addSubject);
// router.get('/getAllSubjects', getSubjects);
// router.get('/getSubjectByCode/:code/:courseType', getSubjectByCode);
// router.delete('/deleteSubject/:code/:courseType', deleteSubject);
// router.get('/subjects/:program/:batchId/:semesterId', cascadingdropdownsub);
// router.get('/getSubjects', getSubjects);
// router.get('/getDropdownData', getDropdownData);


module.exports = router;
