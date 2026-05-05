const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getAssistantData,
  updateAssistantProfile,
  addFamilyMember,
  deleteFamilyMember,
  addReminder,
  updateReminder,
  deleteReminder,
  getJournalEntries,
  addJournalEntry,
} = require("../controllers/assistantController");

const router = express.Router();

router.get("/me", authenticateToken, getAssistantData);
router.put("/profile", authenticateToken, updateAssistantProfile);
router.post("/family", authenticateToken, addFamilyMember);
router.delete("/family/:memberId", authenticateToken, deleteFamilyMember);
router.post("/reminders", authenticateToken, addReminder);
router.patch("/reminders/:reminderId", authenticateToken, updateReminder);
router.delete("/reminders/:reminderId", authenticateToken, deleteReminder);
router.get("/journal", authenticateToken, getJournalEntries);
router.post("/journal", authenticateToken, addJournalEntry);

module.exports = router;
