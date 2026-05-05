const User = require("../models/User");
const Patient = require("../models/Patient");

const buildAuthResponse = (user) => ({
  id: user._id.toString(),
  name: user.username,
  email: user.email,
  role: user.role,
  token: user._id.toString(),
});

// Register
exports.register = async (req, res) => {
  const { name, email, password, role, doctorKey } = req.body;

  // Verification pour le role docteur
  if (role === "doctor") {
    const validKey = process.env.DOCTOR_SECRET_KEY || "NEURO2026";
    if (doctorKey !== validKey) {
      return res.status(401).json({ message: "Clé secrète médecin invalide. Inscription refusée." });
    }
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email already in use" });

  const user = new User({ username: name, email, password, role });
  await user.save();

  if (role === "user") {
    // 1. Chercher un dossier patient déjà créé par l'admin (même email)
    let patient = await Patient.findOne({ email });

    // 2. Sinon chercher par nom (l'admin a utilisé le même prénom/nom)
    if (!patient && name) {
      const nameRx = new RegExp(
        `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i"
      );
      patient = await Patient.findOne({ name: { $regex: nameRx } });
    }

    if (patient) {
      // Lier le dossier existant à ce compte — pas de doublon créé
      await Patient.findByIdAndUpdate(patient._id, {
        $set: { userId: user._id, email },
      });
      console.log(`✅ register: compte "${email}" lié au dossier patient existant "${patient.name}" (${patient._id})`);
    } else {
      // Aucun dossier existant → en créer un nouveau avec userId déjà renseigné
      const newPatient = new Patient({
        userId: user._id,
        name,
        email,
        age: null,
        phone: "",
        symptoms: [],
        medicalHistory: [],
      });
      await newPatient.save();
      console.log(`✅ register: nouveau dossier patient créé pour "${email}"`);
    }
  }

  res.json(buildAuthResponse(user));
};

// Login (simple version)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  res.json(buildAuthResponse(user));
};

// Get count of users with role 'user'
exports.getPatientCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ role: "user" });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient count" });
  }
};

// Get all users with role 'user' (patients)
exports.getPatientUsers = async (req, res) => {
  try {
    const patients = await User.find({ role: "user" }, "username email _id");
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient users" });
  }
};

/**
 * POST /api/users/repair-links
 * Pour chaque compte utilisateur "user" :
 *  1. Cherche le dossier "officiel" (assignedDoctor défini) par email ou nom
 *  2. Cherche le dossier "doublon" (créé à l'inscription, sans médecin) par email
 *  3. Si le doublon a une image IRM et que l'officiel n'en a pas → transfère l'image
 *  4. Lie le dossier officiel au compte (userId)
 *  5. Supprime le doublon pour éviter les conflits futurs
 */
exports.repairPatientLinks = async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    const report = [];

    for (const user of users) {
      const entry = { user: user.email, action: "" };

      // ── Trouver tous les dossiers potentiels pour cet utilisateur ──────────
      const nameRx = user.username
        ? new RegExp(`^${user.username.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
        : null;

      // Dossier avec médecin assigné (le "bon" dossier) — priorité au plus récent
      let officialPatient = await Patient.findOne({
        assignedDoctor: { $exists: true, $ne: null },
        $or: [
          { email: user.email },
          ...(nameRx ? [{ name: { $regex: nameRx } }] : []),
        ],
      }).sort({ createdAt: -1 });

      // Dossier sans médecin — probablement le doublon créé à l'inscription
      const duplicateByEmail = await Patient.findOne({
        email: user.email,
        $or: [
          { assignedDoctor: { $exists: false } },
          { assignedDoctor: null },
        ],
      });

      // ── Déjà lié au bon dossier ? ──────────────────────────────────────────
      const alreadyLinked = await Patient.findOne({ userId: user._id });
      if (alreadyLinked && alreadyLinked.assignedDoctor) {
        entry.action = "already-linked-with-doctor";
        report.push(entry);
        continue;
      }

      // ── Cas 1 : dossier officiel trouvé ────────────────────────────────────
      if (officialPatient) {
        // Transférer l'image du doublon si le dossier officiel n'en a pas
        if (duplicateByEmail && duplicateByEmail._id.toString() !== officialPatient._id.toString()) {
          const dupFull = await Patient.findById(duplicateByEmail._id).select("irmImage lastScanDate prediction probabilities bestModel allModels rankedModels totalModels explanation");
          if (dupFull?.irmImage && !officialPatient.irmImage) {
            await Patient.findByIdAndUpdate(officialPatient._id, {
              $set: {
                irmImage:      dupFull.irmImage,
                lastScanDate:  dupFull.lastScanDate,
                prediction:    dupFull.prediction,
                probabilities: dupFull.probabilities,
                bestModel:     dupFull.bestModel,
                allModels:     dupFull.allModels,
                rankedModels:  dupFull.rankedModels,
                totalModels:   dupFull.totalModels,
                explanation:   dupFull.explanation,
              },
            });
            entry.imageTransferred = true;
          }
          // Supprimer le doublon
          await Patient.findByIdAndDelete(duplicateByEmail._id);
          entry.duplicateRemoved = true;
        }

        await Patient.findByIdAndUpdate(officialPatient._id, {
          $set: { userId: user._id, email: user.email },
        });
        entry.action = "linked-to-official";
        report.push(entry);
        continue;
      }

      // ── Cas 2 : seulement un doublon sans médecin ──────────────────────────
      if (duplicateByEmail) {
        await Patient.findByIdAndUpdate(duplicateByEmail._id, {
          $set: { userId: user._id },
        });
        entry.action = "linked-to-duplicate-no-doctor";
        report.push(entry);
        continue;
      }

      // ── Cas 3 : aucun dossier → créer ─────────────────────────────────────
      await Patient.create({
        userId: user._id,
        name: user.username,
        email: user.email,
        age: null, phone: "", symptoms: [], medicalHistory: [],
      });
      entry.action = "created";
      report.push(entry);
    }

    const counts = report.reduce((acc, e) => {
      acc[e.action] = (acc[e.action] || 0) + 1;
      return acc;
    }, {});

    res.json({ message: "Reparation terminee", counts, details: report });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la reparation", error: error.message });
  }
};
