const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Get all classes
router.get('/getAllClasses', classController.getAllClasses);

// Get classes by semester ID
router.get('/getClassesBySemester/:semesterId', classController.getClassesBySemester);

// Create a single class
router.post('/createClass', classController.createClass);

// Create multiple classes
router.post('/createMultipleClasses', classController.createMultipleClasses);

// Update a class
router.put('/updateClass/:id', classController.updateClass);

// Delete a class
router.delete('/deleteClass/:id', classController.deleteClass);

module.exports = router; 