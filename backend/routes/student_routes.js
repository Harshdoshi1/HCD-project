// const express = require('express');
// const {
//     createStudent,
//     getStudentById,
//     getAllStudents,
//     updateStudent,
//     deleteStudent,
//     createStudents

// } = require('../controller/studentController'); // Ensure correct path

// const router = express.Router();

// // User Routes
// router.post('/createStudent', createStudent);
// // router.post('/createStudents', createStudents);

// router.get('/getStudentById', getStudentById);
// router.get('/getAllStudents', getAllStudents);
// router.put('/updateStudent', updateStudent);
// router.delete('/deleteStudent', deleteStudent);
// router.post('/bulkUpload', createStudents);
// // router.post('/createStudent', studentController.createStudent);


// module.exports = router; // ✅ Ensure this line exports the router correctly

const express = require('express');
const {
    createStudent,
    getStudentById,
    getAllStudents,
    updateStudent,
    deleteStudent,
    createStudents
} = require('../controller/studentController'); // Ensure correct path

const {
    getActivitiesByStudentAndSemester,
    addOrUpdateActivity,
    deleteActivity
} = require('../controller/student_cocurricular_controller'); // Import Co-curricular controller

const router = express.Router();

// Student Routes
router.post('/createStudent', createStudent);
router.get('/getStudentById', getStudentById);
router.get('/getAllStudents', getAllStudents);
router.put('/updateStudent', updateStudent);
router.delete('/deleteStudent', deleteStudent);
router.post('/bulkUpload', createStudents);

// Co-curricular Activity Routes
router.get('/activities/:studentId/:semesterId', getActivitiesByStudentAndSemester);
router.post('/activities/:studentId/:semesterId', addOrUpdateActivity);
router.delete('/activities/:id', deleteActivity);

module.exports = router;
