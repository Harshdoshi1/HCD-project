const express = require("express");
const router = express.Router();
const { 
    getActivitiesByEnrollmentAndSemester,
    addActivity,
    updateActivity,
    deleteActivity,
    getStudentExtraCurricularActivities
} = require("../controller/student_extracurricular_controller");

// Get activities by enrollment number and semester
router.get("/:enrollmentNumber/:semesterId", getActivitiesByEnrollmentAndSemester);

// Add new activity
router.post("/", addActivity);

// Update existing activity
router.put("/:id", updateActivity);

// Delete activity
router.delete("/:activityId", deleteActivity);

// Get all activities for a student by enrollment number
router.get("/student/:enrollmentNumber", getStudentExtraCurricularActivities);

module.exports = router;
