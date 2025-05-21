const express = require('express');
const router = express.Router();

const {
    createStudent,
    getStudentById,
    getAllStudents,
    updateStudent,
    deleteStudent,
    createStudents,
    updateStudentSemesters,
    getStudentsByBatch,
    loginStudent,
    getAcademicDataByEmail,
    getSPIByEmail
} = require('../controller/studentController');

router.post('/createStudent', createStudent);
router.get('/academicData/:email', getAcademicDataByEmail);
router.get('/studentCPIemail/:email', getSPIByEmail);
router.get('/getStudentById', getStudentById);
router.get('/getAllStudents', getAllStudents);
router.put('/updateStudent', updateStudent);
router.delete('/deleteStudent', deleteStudent);
router.post('/bulkUpload', createStudents);
router.post('/updateStudentSemesters', updateStudentSemesters);
router.get('/getStudentsByBatch/:batchId', getStudentsByBatch);
router.post('/login', loginStudent);

module.exports = router;


// const {
    //     addActivity,
    //     updateActivity,
    //     deleteActivity,
    //     getStudentActivities
    // } = require('../controller/student_cocurricular_controller');
    
// // Co-curricular Activity Routes
// router.post('/activities', addActivity);
// router.put('/activities/:activityId', updateActivity);
// router.delete('/activities/:activityId', deleteActivity);
// router.post('/activities/students', getStudentActivities);
