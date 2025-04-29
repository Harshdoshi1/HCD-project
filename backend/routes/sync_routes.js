/**
 * Sync Routes
 * 
 * API routes for synchronizing data between local MySQL database and Supabase.
 */

const express = require('express');
const router = express.Router();
const syncController = require('../controller/syncController');

// Sync all data
router.post('/all', syncController.syncAllData);

// Sync individual tables
router.post('/users', syncController.syncUsers);
router.post('/batches', syncController.syncBatches);
router.post('/semesters', syncController.syncSemesters);
router.post('/faculties', syncController.syncFaculties);
router.post('/subjects', syncController.syncSubjects);
router.post('/unique-sub-degrees', syncController.syncUniqueSubDegrees);
router.post('/unique-sub-diplomas', syncController.syncUniqueSubDiplomas);
router.post('/assign-subjects', syncController.syncAssignSubjects);
router.post('/component-weightages', syncController.syncComponentWeightages);
router.post('/component-marks', syncController.syncComponentMarks);
router.post('/students', syncController.syncStudents);
router.post('/getted-marks', syncController.syncGettedmarks);
router.post('/participation-types', syncController.syncParticipationTypes);

module.exports = router;
