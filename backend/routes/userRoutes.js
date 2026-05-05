const express = require("express");
const router = express.Router();
const { register, login, getPatientCount, getPatientUsers, repairPatientLinks } = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.get("/patient-count", getPatientCount);
router.get("/patient-users", getPatientUsers);
router.post("/repair-links", repairPatientLinks);

module.exports = router;