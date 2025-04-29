const express = require("express");
const router = express.Router();

const {
  createSemester,
  getSemestersByBatch,
} = require("../controller/semesterController.js");

// Semester Routes
router.post("/addSemester", createSemester);
router.get("/getSemestersByBatch/:batchName", getSemestersByBatch);

module.exports = router;
