const express = require("express");
const router = express.Router();
const {
    createComponentMarks,
    getComponentMarksById,
    getAllComponentMarks,
    updateComponentMarks,
    deleteComponentMarks,
    addSubjectWithComponents
} = require("../controller/componentMarksController");


// 📌 Routes for Component Marks
router.post("/createComponentMarks", createComponentMarks);
router.get("/marks", getAllComponentMarks);
router.get("/marks/:id", getComponentMarksById);
router.put("/marks/:id", updateComponentMarks);
router.delete("/marks/:id", deleteComponentMarks);
router.post("/addSubjectWithComponents", addSubjectWithComponents);
module.exports = router;
