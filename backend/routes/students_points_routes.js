const express = require('express');
const router = express.Router();

const {
    createEvent,
    processExcel

} = require('../controller/StudentEventController.js');

router.post('/createEvent', createEvent);
router.post('/uploadExcell', processExcel)


module.exports = router;
