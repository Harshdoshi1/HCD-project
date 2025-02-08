const express = require('express');
const { registerUser, loginUser, addFaculty, addBatch, getAllBatches } = require('../controller/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/loginUser', loginUser);
router.post('/addfaculty', addFaculty);
router.post('/addbatch', addBatch);
router.get('/getAllBatches', getAllBatches);
module.exports = router;
