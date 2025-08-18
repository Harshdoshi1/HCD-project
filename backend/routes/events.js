const express = require('express');
const router = express.Router();
const multer = require('multer');
const eventController = require('../controller/eventController');
const { createEvent } = require('../controller/StudentEventController');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx files are allowed!'));
    }
  }
});

// Event management routes
router.get('/all', eventController.getAllEvents);
router.get('/:eventId', eventController.getEventById);
router.post('/createEvent', eventController.createEvent);
router.put('/:eventId', eventController.updateEvent);
router.delete('/:eventId', eventController.deleteEvent);

// Student event routes (existing) - moved to avoid conflict
router.post('/student-event', createEvent);

module.exports = router;
