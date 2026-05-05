const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  createAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
} = require("../controllers/appointmentController");

router.post("/", authenticateToken, createAppointments);
router.get("/doctor/:doctorId", authenticateToken, getDoctorAppointments);
router.get("/patient/me", authenticateToken, getPatientAppointments);
router.patch("/:id/status", authenticateToken, updateAppointmentStatus);
router.patch("/:id/reschedule", authenticateToken, rescheduleAppointment);

module.exports = router;
