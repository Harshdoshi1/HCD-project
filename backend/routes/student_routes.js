const express = require('express');
const {
    createStudent,
    getStudentById,
    getAllStudents,
    updateStudent,
    deleteStudent,
    createStudents

} = require('../controller/studentController'); // Ensure correct path

const router = express.Router();

// User Routes
router.post('/createStudent', createStudent);
// router.post('/createStudents', createStudents);

router.get('/getStudentById', getStudentById);
router.get('/getAllStudents', getAllStudents);
router.put('/updateStudent', updateStudent);
router.delete('/deleteStudent', deleteStudent);
router.post('/bulkUpload', createStudents);
// router.post('/createStudent', studentController.createStudent);


module.exports = router; // ✅ Ensure this line exports the router correctly