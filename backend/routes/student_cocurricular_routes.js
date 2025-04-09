const express = require('express');
const router = express.Router();
const {
    addActivity,
    updateActivity,
    deleteActivity,
    getStudentActivities
} = require('../controller/studentCocurricularController');

// Add new co-curricular activity
router.post('/', addActivity);

// Update existing co-curricular activity
router.put('/:activityId', updateActivity);

// Delete co-curricular activity
router.delete('/:activityId', deleteActivity);

// Get activities for a student by enrollment number
router.post('/students', getStudentActivities);

module.exports = router;
