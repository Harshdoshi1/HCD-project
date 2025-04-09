const express = require('express');
const router = express.Router();
const eventsRouter = require('./events');

// Event routes
router.use('/api', eventsRouter);

module.exports = router;
