const express = require("express");
const router = express.Router();
const { addSubject, getSubjects } = require("../controller/sub_controller");

// Add a new subject
router.post("/addSubject", addSubject);

// Get all subjects with optional filters
router.get("/", getSubjects);

module.exports = router;
