const express = require("express");
const router = express.Router();
const {
    addBatch,
    getAllBatches,
    getBatchIdByName
} = require("../controller/batchController");


router.post('/addBatch', addBatch);
router.get('/getAllBatches', getAllBatches);
router.get('/getBatchIdByName/:batchName', getBatchIdByName);

module.exports = router;
