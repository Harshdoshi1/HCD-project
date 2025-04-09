const express = require('express');
const router = express.Router();
const {
    createEvent,
    insertFetchedStudents,
    getAllEventnames
} = require('../controller/StudentEventController');

// Add new event
router.post('/', createEvent);

// Update existing event
// router.put('/:activityId', updateActivity);

// Get all event names
router.get('/all', getAllEventnames);
// Insert fetched students into database
router.post('/students', insertFetchedStudents);
module.exports = router;
