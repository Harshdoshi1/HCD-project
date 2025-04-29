const express = require("express");
const router = express.Router();
const { createBatch, getAllBatches } = require("../controller/batchController");

router.post("/addBatch", createBatch);
router.get("/getAllBatches", getAllBatches);

module.exports = router;
