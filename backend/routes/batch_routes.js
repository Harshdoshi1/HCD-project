const express = require("express");
const router = express.Router();
const {
    addBatch,
    getAllBatches
} = require("../controller/batchController");


router.post('/addBatch', addBatch);
router.get('/getAllBatches', getAllBatches);

module.exports = router;
