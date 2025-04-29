const express = require("express");
const {
  addSubject,
  getSubjectByCode,
  deleteSubject,
  getSubjects,
} = require("../controller/sub_controller");

const router = express.Router();

router.post("/addSubject", addSubject);
router.get("/subjects/:program", getSubjects);
router.get("/subject/:code/:courseType", getSubjectByCode);
router.delete("/subject/:code/:courseType", deleteSubject);
// router.get('/getDropdownData', getDropdownData);

module.exports = router;
