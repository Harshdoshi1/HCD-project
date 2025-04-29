const express = require("express");
const router = express.Router();
const {
  createEvent,
  getAllEventnames,
  insertFetchedStudents,
  getAllCoCurricularEventsNames,
  getAllExtraCurricularEventsNames,
  getAllParticipationTypes,
  fetchEventsbyEnrollandSemester,
  fetchEventsIDsbyEnroll,
  fetchEventsByIds,
} = require("../controller/StudentEventController");

// Add new event
router.post("/", createEvent);

// Get all event names
router.get("/all", getAllEventnames);
router.get("/allCoCurricularnames", getAllCoCurricularEventsNames);
router.get("/allExtraCurricularnames", getAllExtraCurricularEventsNames);
router.get("/allParticipationTypes", getAllParticipationTypes);

// Get events by student
router.get(
  "/events/:enrollmentNumber/:semester",
  fetchEventsbyEnrollandSemester
);
router.get("/events/:enrollmentNumber", fetchEventsIDsbyEnroll);
router.post("/events/byIds", fetchEventsByIds);

// Insert fetched students into database
router.post("/students", insertFetchedStudents);

module.exports = router;
