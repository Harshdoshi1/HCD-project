const express = require('express');
const router = express.Router();
const multer = require('multer');
const studentCPIController = require('../controller/studentCPIController');

// Configure multer for Excel file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'), false);
        }
    }
});

// Upload student CPI/SPI data from Excel
router.post('/upload', upload.single('file'), studentCPIController.uploadStudentCPI);

// Get all student CPI/SPI data
router.get('/all', studentCPIController.getAllStudentCPI);

// Get student CPI/SPI data by batch
router.get('/batch/:batchId', studentCPIController.getStudentCPIByBatch);

// Get student CPI/SPI data by enrollment number
router.get('/enrollment/:enrollmentNumber', studentCPIController.getStudentCPIByEnrollment);

module.exports = router;