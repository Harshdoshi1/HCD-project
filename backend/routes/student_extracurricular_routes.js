const express = require("express");
const router = express.Router();
const { 
    getActivitiesByStudentAndSemester, 
    addOrUpdateActivity, 
    deleteActivity,
    getStudentExtraCurricularActivities 
} = require("../controller/student_extracurricular_controller");

// Get activities by student and semester
router.get("/:studentId/:semesterId", getActivitiesByStudentAndSemester);

// Add or update extracurricular activity
router.post("/add", addOrUpdateActivity);

// Delete extracurricular activity
router.delete("/:activityId", deleteActivity);

// Get all activities for a student
router.get("/student/:studentId", getStudentExtraCurricularActivities);

module.exports = router;
