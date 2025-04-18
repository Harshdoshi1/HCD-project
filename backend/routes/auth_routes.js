const express = require('express');
const {
    registerUser,
    loginUser,
    getAllUsers,

} = require('../controller/authController'); // Ensure correct path

const router = express.Router();

// User Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getAllUsers', getAllUsers);


module.exports = router;
