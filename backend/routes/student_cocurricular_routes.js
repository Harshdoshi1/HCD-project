const express = require('express');
const router = express.Router();
const {
    getStudentCoCurricularActivities,
    getActivitiesByStudentAndSemester,
    addOrUpdateActivity,
    deleteActivity
} = require('../controller/student_cocurricular_controller');

// Get all co-curricular activities for a student
router.get('/student/:studentId', getStudentCoCurricularActivities);

// Get activities by student and semester
router.get('/student/:studentId/semester/:semesterId', getActivitiesByStudentAndSemester);

// Add or update co-curricular activity
router.post('/add', addOrUpdateActivity);

// Delete co-curricular activity
router.delete('/delete/:activityId', deleteActivity);

module.exports = router;
