const express = require("express");
const router = express.Router();
const componentWeightageController = require("../controller/componentcontroller");
const componentMarksController = require("../controller/component_marks_controller");
const subjectComponentController = require("../controller/subjectComponentController");

// 📌 Routes for Component Weightage
router.post("/createComponentWeightage", componentWeightageController.createComponentWeightage);
router.get("/weightages", componentWeightageController.getAllComponentWeightages);
router.get("/weightages/:id", componentWeightageController.getComponentWeightageById);
router.put("/weightages/:id", componentWeightageController.updateComponentWeightage);
router.delete("/weightages/:id", componentWeightageController.deleteComponentWeightage);

// 📌 Routes for Component Marks
router.post("/createComponentMarks", componentMarksController.createComponentMarks);
router.get("/marks", componentMarksController.getAllComponentMarks);
router.get("/marks/:id", componentMarksController.getComponentMarksById);
router.put("/marks/:id", componentMarksController.updateComponentMarks);
router.delete("/marks/:id", componentMarksController.deleteComponentMarks);

// 📌 Routes for Subject with Components
router.post("/addSubjectWithComponents", subjectComponentController.addSubjectWithComponents);
router.get("/subject/:subjectCode", subjectComponentController.getSubjectWithComponents);

module.exports = router;
