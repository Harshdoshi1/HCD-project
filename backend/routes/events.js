const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createEvent, processExcel } = require('../controllers/EventController');

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

// Create new event
router.post('/events', createEvent);

// Process Excel file
router.post('/events/process-excel', upload.single('excelFile'), processExcel);

module.exports = router;
