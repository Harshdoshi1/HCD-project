const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventController');
const {
    createEvent,
    insertFetchedStudents,
    getAllEventnames,
    getAllCoCurricularEventsNames,
    getAllExtraCurricularEventsNames,
    getAllParticipationTypes,
    insertIntoStudentPoints,
    fetchEventsbyEnrollandSemester,
    fetchEventsIDsbyEnroll,
    fetchEventsByIds,
    fetchEventsByEventIds,
    fetchTotalActivityPoints
} = require('../controller/StudentEventController');

// Event management routes (for creating/managing events)
router.get('/all', eventController.getAllEvents);
router.get('/:eventId', eventController.getEventById);
router.post('/createEvent', eventController.createEvent);
router.put('/:eventId', eventController.updateEvent);
router.delete('/:eventId', eventController.deleteEvent);

// Student event participation routes (existing functionality)
router.post('/student-event', createEvent);
router.get('/names/all', getAllEventnames);
router.get('/names/co-curricular', getAllCoCurricularEventsNames);
router.get('/names/extra-curricular', getAllExtraCurricularEventsNames);
router.get('/participation-types', getAllParticipationTypes);
router.post('/student-points', insertIntoStudentPoints);
router.post('/by-enrollment-semester', fetchEventsbyEnrollandSemester);
router.post('/ids-by-enrollment', fetchEventsIDsbyEnroll);
router.post('/by-ids', fetchEventsByIds);
router.post('/by-event-ids', fetchEventsByEventIds);
router.post('/total-points', fetchTotalActivityPoints);
router.post('/students', insertFetchedStudents);

module.exports = router;
