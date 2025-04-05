const express = require('express');
const {
    createComponentWeightage,
    getAllComponentWeightages,
    getComponentWeightageById,
    updateComponentWeightage,
    deleteComponentWeightage
} = require('../controller/componentWeightageController'); // Ensure correct path

const router = express.Router();


router.post("/createComponentWeightage", createComponentWeightage);
router.get("/weightages", getAllComponentWeightages);
router.get("/weightages/:id", getComponentWeightageById);
router.put("/weightages/:id", updateComponentWeightage);
router.delete("/weightages/:id", deleteComponentWeightage);

module.exports = router; 