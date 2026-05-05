const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Patient = require("../models/Patient");
const User = require("../models/User");

// Middleware pour vérifier l'authentification
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  // Pour simplifier, on accepte soit l'ID MongoDB soit l'email en tant que token
  let user = null;
  try {
    user = await User.findById(token);
  } catch (error) {
    // Si ce n'est pas un ObjectId valide, essayer comme email
    user = await User.findOne({ email: token });
  }

  if (!user) {
    return res.status(401).json({ message: "Utilisateur non trouvé" });
  }

  req.userId = user._id.toString();
  req.user = user;
  next();
};

// Créer ou obtenir une conversation
router.post("/conversations", authenticateToken, async (req, res) => {
  try {
    const { patientId, patientEmail, doctorId } = req.body;

    // Résoudre le patient par ID ou email
    let patient = null;
    if (patientId) {
      patient = await Patient.findById(patientId);
    }
    if (!patient && patientEmail) {
      patient = await Patient.findOne({ email: patientEmail });
      if (!patient) {
        // Créer automatiquement le patient si l'utilisateur existe mais n'a pas encore de profil Patient
        const user = await User.findOne({ email: patientEmail, role: "user" });
        if (user) {
          patient = new Patient({
            name: user.username,
            email: user.email,
            age: null,
            phone: "",
            symptoms: [],
            medicalHistory: [],
          });
          await patient.save();
        }
      }
    }
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Vérifier que le médecin existe
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    // Chercher une conversation existante
    let conversation = await Conversation.findOne({
      patient: patient._id,
      doctor: doctorId,
    });

    if (!conversation) {
      // Créer une nouvelle conversation
      conversation = new Conversation({
        participants: [patient._id, doctorId],
        patient: patient._id,
        doctor: doctorId,
      });
      await conversation.save();

      // Assigner automatiquement le médecin au patient lors de la création de la conversation
      await Patient.findByIdAndUpdate(
        patient._id,
        { assignedDoctor: doctorId },
        { new: true }
      );
    }

    // Retourner la conversation avec les champs doctor et patient peuplés
    conversation = await Conversation.findById(conversation._id)
      .populate("patient", "name email")
      .populate("doctor", "username email");

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Obtenir les conversations d'un utilisateur
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    let conversations;
    if (user.role === "doctor") {
      conversations = await Conversation.find({ doctor: user._id })
        .populate("patient", "name email")
        .populate("doctor", "username email")
        .sort({ updatedAt: -1 });
    } else {
      // Pour les patients, trouver leurs conversations
      conversations = await Conversation.find({ patient: user._id })
        .populate("patient", "name email")
        .populate("doctor", "username email")
        .sort({ updatedAt: -1 });
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Obtenir les messages d'une conversation
router.get("/conversations/:conversationId/messages", authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate("sender", "username email role")
      .populate("receiver", "username email role")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Envoyer un message
router.post("/messages", authenticateToken, async (req, res) => {
  try {
    const { conversationId, receiverId, content, messageType = "text" } = req.body;
    const senderId = req.userId;

    const message = new Message({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
    });

    await message.save();

    // Mettre à jour la dernière activité de la conversation
    await Conversation.findOneAndUpdate(
      { _id: conversationId },
      {
        lastMessage: {
          content,
          sender: senderId,
          createdAt: new Date(),
        },
        updatedAt: new Date(),
      }
    );

    const conversation = await Conversation.findById(conversationId);
    if (conversation && conversation.patient && conversation.doctor) {
      await Patient.findByIdAndUpdate(
        conversation.patient,
        { assignedDoctor: conversation.doctor },
        { new: true }
      );
    }

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username email role")
      .populate("receiver", "username email role");

    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Marquer les messages comme lus
router.put("/messages/:messageId/read", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    await Message.findByIdAndUpdate(messageId, { isRead: true });

    res.json({ message: "Message marqué comme lu" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Assigner un médecin à un patient
router.put("/patients/assign-doctor", authenticateToken, async (req, res) => {
  try {
    const { patientId, patientEmail, doctorId } = req.body;

    let patient = null;
    if (patientId) {
      patient = await Patient.findById(patientId);
    }
    if (!patient && patientEmail) {
      patient = await Patient.findOne({ email: patientEmail });
    }

    // Vérifier que le médecin existe et a le bon rôle
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      patient._id,
      { assignedDoctor: doctorId },
      { new: true }
    ).populate("assignedDoctor", "username email");

    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Obtenir la liste des médecins disponibles
router.get("/doctors", authenticateToken, async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }, "username email _id");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;