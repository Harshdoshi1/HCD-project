const express = require("express");
const router = express.Router();
const componentWeightageController = require("../controller/componentcontroller");

// 📌 Create Component Weightage
router.post("/createComponentWeightage", componentWeightageController.createComponentWeightage);

// 📌 Get All Component Weightages
router.get("/", componentWeightageController.getAllComponentWeightages);

// 📌 Get Component Weightage by ID
router.get("/:id", componentWeightageController.getComponentWeightageById);

// 📌 Update Component Weightage
router.put("/:id", componentWeightageController.updateComponentWeightage);

// 📌 Delete Component Weightage
router.delete("/:id", componentWeightageController.deleteComponentWeightage);

module.exports = router;
