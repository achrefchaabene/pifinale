const Patient = require("../models/Patient");

// Ajouter patient
exports.createPatient = async (req, res) => {
  const patient = new Patient(req.body);
  await patient.save();
  res.json(patient);
};

// Liste patients — irmImage exclu pour garder la réponse légère
exports.getPatients = async (req, res) => {
  const patients = await Patient.find()
    .select("-irmImage")
    .populate("assignedDoctor", "username email");
  res.json(patients);
};

exports.getPatientById = async (req, res) => {
  // Endpoint détail : inclut tout sauf irmImage (trop lourd)
  const patient = await Patient.findById(req.params.id)
    .select("-irmImage")
    .populate("assignedDoctor", "username email");
  if (!patient) return res.status(404).json({ message: "Patient not found" });
  res.json(patient);
};

// Mettre à jour un patient
exports.updatePatient = async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" })
    .populate("assignedDoctor", "username email");
  if (!patient) return res.status(404).json({ message: "Patient not found" });
  res.json(patient);
};

// Assigner un médecin à un patient
exports.assignDoctor = async (req, res) => {
  const { doctorId } = req.body;
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { assignedDoctor: doctorId },
    { returnDocument: "after" }
  ).populate("assignedDoctor", "username email");

  if (!patient) return res.status(404).json({ message: "Patient not found" });
  res.json(patient);
};

exports.getHistory = async (req, res) => {
  const history = await Patient.find().sort({ createdAt: -1 }).limit(50);
  res.json(history);
};

/**
 * Retourne UNIQUEMENT l'image IRM, les probabilités et la date de scan.
 * Auto-réparateur : si le dossier principal n'a pas d'image, cherche dans
 * les dossiers doublons (même email ou même nom) et transfère l'image.
 * GET /api/patients/:id/irm
 */
exports.getPatientIrmImage = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .select("name email userId irmImage lastScanDate probabilities prediction bestModel allModels rankedModels totalModels explanation createdAt");

    if (!patient) {
      return res.status(404).json({ message: "Patient introuvable" });
    }

    // ── Image déjà présente : retour direct ────────────────────────────────
    if (patient.irmImage) {
      return res.json({
        _id:           patient._id,
        name:          patient.name,
        irmImage:      patient.irmImage,
        lastScanDate:  patient.lastScanDate ?? null,
        probabilities: patient.probabilities ?? {},
        prediction:    patient.prediction  ?? null,
        bestModel:     patient.bestModel ?? null,
        allModels:     patient.allModels ?? {},
        rankedModels:  patient.rankedModels ?? [],
        totalModels:   patient.totalModels ?? 0,
        explanation:   patient.explanation ?? "",
        createdAt:     patient.createdAt,
      });
    }

    // ── Pas d'image : chercher dans les dossiers liés (doublons) ──────────
    const nameRx = patient.name
      ? new RegExp(patient.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      : null;

    const orConditions = [];
    if (patient.email)  orConditions.push({ email: patient.email });
    if (nameRx)         orConditions.push({ name: { $regex: nameRx } });
    if (patient.userId) orConditions.push({ userId: patient.userId });

    let irmImage = patient.irmImage ?? null;
    let lastScanDate = patient.lastScanDate ?? null;
    let prediction = patient.prediction ?? null;
    let probabilities = patient.probabilities ?? {};
    let bestModel = patient.bestModel ?? null;
    let allModels = patient.allModels ?? {};
    let rankedModels = patient.rankedModels ?? [];
    let totalModels = patient.totalModels ?? 0;
    let explanation = patient.explanation ?? "";

    if (orConditions.length > 0) {
      const related = await Patient.findOne({
        _id:      { $ne: patient._id },
        irmImage: { $exists: true, $ne: null },
        $or: orConditions,
      }).select("irmImage lastScanDate prediction probabilities bestModel allModels rankedModels totalModels explanation");

      if (related?.irmImage) {
        // Transférer l'image vers le dossier officiel pour les prochaines requêtes
        await Patient.findByIdAndUpdate(patient._id, {
          $set: {
            irmImage:      related.irmImage,
            lastScanDate:  related.lastScanDate  || null,
            prediction:    related.prediction    || patient.prediction,
            probabilities: related.probabilities || patient.probabilities,
            bestModel:     related.bestModel     || patient.bestModel,
            allModels:     related.allModels     || patient.allModels,
            rankedModels:  related.rankedModels  || patient.rankedModels,
            totalModels:   related.totalModels   || patient.totalModels,
            explanation:   related.explanation   || patient.explanation,
          },
        });
        irmImage      = related.irmImage;
        lastScanDate  = related.lastScanDate ?? null;
        prediction    = related.prediction  ?? null;
        probabilities = related.probabilities ?? {};
        bestModel     = related.bestModel ?? null;
        allModels     = related.allModels ?? {};
        rankedModels  = related.rankedModels ?? [];
        totalModels   = related.totalModels ?? 0;
        explanation   = related.explanation ?? "";
        console.log(`🔧 getPatientIrmImage: image auto-transférée vers "${patient.name}" (${patient._id})`);
      }
    }

    res.json({
      _id:           patient._id,
      name:          patient.name,
      irmImage:      irmImage,
      lastScanDate:  lastScanDate,
      probabilities: probabilities,
      prediction:    prediction,
      bestModel:     bestModel,
      allModels:     allModels,
      rankedModels:  rankedModels,
      totalModels:   totalModels,
      explanation:   explanation,
      createdAt:     patient.createdAt,
    });
  } catch (error) {
    console.error("getPatientIrmImage error:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Récupérer les patients assignés à un médecin
exports.getPatientsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    // irmImage exclu de la liste — fetch via /:id/irm a la demande
    const patients = await Patient.find({ assignedDoctor: doctorId })
      .select("-irmImage")
      .populate("assignedDoctor", "username email")
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
