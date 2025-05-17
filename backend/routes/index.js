const express = require('express');
const router = express.Router();
const eventsRouter = require('./events');
const dashboardRouter = require('./dashboard_routes');

// Event routes
router.use('/api', eventsRouter);

// Dashboard routes
router.use('/api/dashboard', dashboardRouter);

module.exports = router;
