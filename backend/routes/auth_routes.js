const express = require('express');
const { registerUser, loginUser, addFaculty } = require('../controller/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/loginUser', loginUser);
router.post('/addfaculty', addFaculty);

module.exports = router;
