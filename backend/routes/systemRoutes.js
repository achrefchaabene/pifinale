const express = require("express");
const multer = require("multer");
const upload = multer();
const User = require("../models/User");
const { predict, getHistory, getPatientById, reanalyzePatientScan } = require("../controllers/systemController");

const router = express.Router();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  let user = null;
  try {
    user = await User.findById(token);
  } catch (error) {
    user = await User.findOne({ email: token });
  }

  if (!user) {
    return res.status(401).json({ message: "Utilisateur non trouvé" });
  }

  req.user = user;
  next();
};

router.post("/predict", authenticateToken, upload.single("file"), predict);
router.get("/history", authenticateToken, getHistory);
router.get("/patient/:id", getPatientById);
router.post("/patient/:id/reanalyze", authenticateToken, reanalyzePatientScan);

module.exports = router;
