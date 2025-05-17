const express = require("express");
const router = express.Router();
const {
    addBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch
} = require("../controller/batchController");

// Create
router.post('/addBatch', addBatch);

// Read
router.get('/getAllBatches', getAllBatches);
router.get('/getBatch/:id', getBatchById);

// Update
router.put('/updateBatch/:id', updateBatch);

// Delete
router.delete('/deleteBatch/:id', deleteBatch);

module.exports = router;
