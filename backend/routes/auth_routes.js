const express = require('express');
const { registerUser, loginUser,getAllUsers, addFaculty, addBatch, getAllBatches, addSemester, getSemestersByBatch } = require('../controller/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/loginUser', loginUser);
router.post('/addfaculty', addFaculty);
router.post('/addbatch', addBatch);
router.get('/getAllBatches', getAllBatches);
router.get('/getAllUsers', getAllUsers);
router.post('/addSemester', addSemester);
router.get('/getSemestersByBatch', getSemestersByBatch);
module.exports = router;
