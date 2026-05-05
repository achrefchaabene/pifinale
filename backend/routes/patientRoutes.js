const express = require("express");
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  assignDoctor,
  getPatientsByDoctor,
  getPatientIrmImage,
} = require("../controllers/patientController");

router.post("/", createPatient);
router.get("/", getPatients);
router.get("/doctor/:doctorId", getPatientsByDoctor);
// Route dédiée image IRM — AVANT /:id pour éviter le conflit de route
router.get("/:id/irm", getPatientIrmImage);
router.get("/:id", getPatientById);
router.put("/:id", updatePatient);
router.put("/:id/assign-doctor", assignDoctor);

module.exports = router;