const Patient = require("../models/Patient");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// URL du service Python ML
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// Classes reconnues par les modèles
const CLASSES = [
  "Non Demented",
  "Very Mild Demented",
  "Mild Demented",
  "Moderate Demented",
];

const stageRecommendations = {
  "Non Demented": {
    title: "Non Demented",
    summary: "prevention, memoire legere, hygiene de vie, marche, lecture",
    lifestyle: ["prevention", "hygiene de vie", "marche", "lecture"],
    cognitiveExercises: ["memoire legere"],
    sleep: [],
    nutrition: [],
    physicalActivity: ["marche"],
    mentalStimulation: ["memoire legere", "lecture"],
    dailyRoutine: [],
    homeSupport: [],
  },
  "Very Mild Demented": {
    title: "Very Mild Demented",
    summary: "rappels, exercices memoire courts, sommeil regulier, organisation quotidienne",
    lifestyle: ["rappels", "organisation quotidienne"],
    cognitiveExercises: ["exercices memoire courts"],
    sleep: ["sommeil regulier"],
    nutrition: [],
    physicalActivity: [],
    mentalStimulation: ["exercices memoire courts"],
    dailyRoutine: ["organisation quotidienne"],
    homeSupport: ["rappels"],
  },
  "Mild Demented": {
    title: "Mild Demented",
    summary: "routines fixes, aide legere, activite cognitive guidee, suivi nutrition",
    lifestyle: ["routines fixes", "aide legere"],
    cognitiveExercises: ["activite cognitive guidee"],
    sleep: [],
    nutrition: ["suivi nutrition"],
    physicalActivity: [],
    mentalStimulation: ["activite cognitive guidee"],
    dailyRoutine: ["routines fixes"],
    homeSupport: ["aide legere"],
  },
  "Moderate Demented": {
    title: "Moderate Demented",
    summary: "exercices simples, securite maison, aide familiale, reperes visuels",
    lifestyle: ["securite maison"],
    cognitiveExercises: ["exercices simples"],
    sleep: [],
    nutrition: [],
    physicalActivity: [],
    mentalStimulation: ["reperes visuels"],
    dailyRoutine: ["reperes visuels"],
    homeSupport: ["securite maison", "aide familiale"],
  },
  "Severe Demented": {
    title: "Severe Demented",
    summary: "confort, surveillance, stimulation douce, environnement calme",
    lifestyle: ["confort", "environnement calme"],
    cognitiveExercises: ["stimulation douce"],
    sleep: [],
    nutrition: [],
    physicalActivity: [],
    mentalStimulation: ["stimulation douce"],
    dailyRoutine: ["environnement calme"],
    homeSupport: ["surveillance", "confort"],
  },
};

function buildRecommendations(prediction) {
  return (
    stageRecommendations[prediction] || {
      title: prediction || "Soutien personnalise",
      summary: "Adaptation selon l'evolution clinique du patient.",
      lifestyle: [],
      cognitiveExercises: [],
      sleep: [],
      nutrition: [],
      physicalActivity: [],
      mentalStimulation: [],
      dailyRoutine: [],
      homeSupport: [],
    }
  );
}

/**
 * Appelle le service Python ML avec l'image.
 * Retourne { prediction, confidence, probabilities, best_model, all_models, explanation }
 * Lève une erreur si le service est inaccessible.
 */
async function callMLService(fileBuffer, mimeType, originalName) {
  const boundary = `----NeuroDetectBoundary${Date.now()}`;
  const filename = originalName || "mri.jpg";

  const header = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([header, fileBuffer, footer]);

  const response = await fetch(`${ML_SERVICE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": body.length.toString(),
    },
    body,
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ML Service error ${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Fallback local (simulation) si le service Python est indisponible.
 */
function mockMLResult() {
  const MOCK_MODELS = [
    "BestModel",
    "EfficientNetB0",
    "EfficientNetB3",
    "AlzheimerCNN",
    "EfficientNetB4",
    "UltraBestModel",
  ];
  const biasSeeds = [0.25, 0.33, 0.41, 0.29, 0.37, 0.45];
  const descriptions = {
    BestModel: "BestModel - mode simulation (service ML indisponible)",
    EfficientNetB0: "EfficientNetB0 - mode simulation (service ML indisponible)",
    EfficientNetB3: "EfficientNetB3 - mode simulation (service ML indisponible)",
    AlzheimerCNN: "AlzheimerCNN - mode simulation (service ML indisponible)",
    EfficientNetB4: "EfficientNetB4 - mode simulation (service ML indisponible)",
    UltraBestModel: "UltraBestModel - mode simulation (service ML indisponible)",
  };

  const allModels = {};
  MOCK_MODELS.forEach((name, mi) => {
    const raw = CLASSES.map((_, ci) => Math.max(0.01, Math.random() + biasSeeds[(mi + ci) % biasSeeds.length] * 0.3));
    const sum = raw.reduce((a, b) => a + b, 0);
    const probs = {};
    CLASSES.forEach((cls, ci) => { probs[cls] = +((raw[ci] / sum)).toFixed(4); });
    const best = Object.entries(probs).sort((a, b) => b[1] - a[1])[0];
    allModels[name] = {
      prediction: best[0],
      confidence: best[1],
      probabilities: probs,
      inference_time_ms: Math.floor(Math.random() * 200 + 50),
      mode: "simulated",
      description: descriptions[name] || `${name} - mode simulation (service ML indisponible)`,
    };
  });

  const bestModelName = Object.entries(allModels).sort((a, b) => b[1].confidence - a[1].confidence)[0][0];
  const best = allModels[bestModelName];
  const ranked = Object.keys(allModels).sort((a, b) => allModels[b].confidence - allModels[a].confidence);

  return {
    prediction: best.prediction,
    confidence: best.confidence,
    probabilities: best.probabilities,
    best_model: bestModelName,
    all_models: allModels,
    ranked_models: ranked,
    total_models: MOCK_MODELS.length,
    explanation: `[Mode simulation] Service ML indisponible. ${bestModelName} : ${(best.confidence * 100).toFixed(1)}% de confiance pour "${best.prediction}".`,
    total_time_ms: 0,
  };
}

function parseDataUrlImage(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    throw new Error("Image IRM introuvable ou invalide");
  }

  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    throw new Error("Format image base64 invalide");
  }

  return {
    mimeType: match[1] || "image/jpeg",
    buffer: Buffer.from(match[2], "base64"),
  };
}

async function runMlAnalysisFromBuffer(fileBuffer, mimeType, originalName) {
  try {
    const mlResult = await callMLService(fileBuffer, mimeType, originalName);
    console.log(`✅ ML Service → ${mlResult.best_model} → ${mlResult.prediction} (${(mlResult.confidence * 100).toFixed(1)}%)`);
    return mlResult;
  } catch (err) {
    console.warn(`⚠️  ML Service inaccessible (${err.message}) — fallback simulation`);
    return mockMLResult();
  }
}

async function appendMedicalHistory(patient, mlResult, scanDate, irmImageB64, recommendations) {
  if (!patient) return;

  try {
    await Patient.findByIdAndUpdate(patient._id, {
      $push: {
        medicalHistory: {
          date: scanDate,
          diagnosis: mlResult.prediction,
          notes: mlResult.explanation,
          recommendations: recommendations || null,
          probabilities: mlResult.probabilities,
          bestModel: mlResult.best_model || null,
          allModels: mlResult.all_models || {},
          rankedModels: mlResult.ranked_models || [],
          totalModels: mlResult.total_models || Object.keys(mlResult.all_models || {}).length || 1,
          irmImage: irmImageB64,
          doctor: patient.assignedDoctor || null,
        },
      },
    });
  } catch (histErr) {
    console.warn("⚠️  Historique non sauvegardé (document trop grand ?):", histErr.message);
  }
}

async function notifyAssignedDoctor(patient, mlResult, senderId) {
  if (!patient?.assignedDoctor) return;

  const doctor = await User.findById(patient.assignedDoctor);
  if (!doctor) return;

  let conversation = await Conversation.findOne({
    patient: patient._id,
    doctor: doctor._id,
  });

  if (!conversation) {
    conversation = new Conversation({
      participants: [patient._id, doctor._id],
      patient: patient._id,
      doctor: doctor._id,
    });
    await conversation.save();
  }

  const content = (
    `[${mlResult.total_models || Object.keys(mlResult.all_models || {}).length || 1} modèles IA] Nouveau scan IRM analysé.\n` +
    `Meilleur résultat : ${mlResult.best_model} → ${mlResult.prediction} (${((mlResult.confidence || 0) * 100).toFixed(1)}% confiance).\n` +
    `${mlResult.explanation}`
  );

  const message = new Message({
    conversationId: conversation._id.toString(),
    sender: senderId,
    receiver: doctor._id,
    content,
    messageType: "text",
  });
  await message.save();

  await Conversation.findByIdAndUpdate(
    conversation._id,
    { lastMessage: { content, sender: senderId, createdAt: new Date() }, updatedAt: new Date() },
    { new: true }
  );
}

exports.predict = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  const mlResult = await runMlAnalysisFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);

  const { prediction, probabilities, best_model, all_models, ranked_models, explanation, total_time_ms } = mlResult;
  const recommendations = buildRecommendations(prediction);

  const mimeType = req.file.mimetype || "image/jpeg";
  const irmImageB64 = `data:${mimeType};base64,${req.file.buffer.toString("base64")}`;
  const scanDate = new Date();

  const irmUpdate = {
    $set: {
      userId: user._id,
      email: user.email,
      prediction,
      probabilities,
      bestModel: best_model || null,
      allModels: all_models || {},
      rankedModels: ranked_models || [],
      totalModels: mlResult.total_models || Object.keys(all_models || {}).length || 1,
      explanation: explanation || "",
      recommendations,
      irmImage: irmImageB64,
      lastScanDate: scanDate,
    },
  };

  let patient = null;
  const nameRx = user.username
    ? new RegExp(user.username.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    : null;

  patient = await Patient.findOneAndUpdate(
    { userId: user._id },
    irmUpdate,
    { returnDocument: "after" }
  );
  if (patient) console.log(`✅ predict: trouvé par userId → "${patient.name}"`);

  if (!patient) {
    patient = await Patient.findOneAndUpdate(
      { email: user.email, assignedDoctor: { $exists: true, $ne: null } },
      irmUpdate,
      { returnDocument: "after" }
    );
    if (patient) console.log(`✅ predict: trouvé par email+doctor → "${patient.name}"`);
  }

  if (!patient && nameRx) {
    patient = await Patient.findOneAndUpdate(
      { name: { $regex: nameRx }, assignedDoctor: { $exists: true, $ne: null } },
      irmUpdate,
      { returnDocument: "after" }
    );
    if (patient) console.log(`✅ predict: trouvé par nom+doctor → "${patient.name}"`);
  }

  if (!patient) {
    patient = await Patient.findOneAndUpdate(
      { email: user.email },
      irmUpdate,
      { returnDocument: "after" }
    );
    if (patient) console.log(`✅ predict: trouvé par email seul → "${patient.name}"`);
  }

  if (!patient && nameRx) {
    patient = await Patient.findOneAndUpdate(
      { name: { $regex: nameRx } },
      irmUpdate,
      { returnDocument: "after" }
    );
    if (patient) console.log(`✅ predict: trouvé par nom seul → "${patient.name}"`);
  }

  if (!patient) {
    console.warn(`⚠️  predict: aucun patient trouvé pour "${user.email}" — création d'un nouveau dossier`);
    patient = await Patient.create({
      userId: user._id,
      name: user.username,
      email: user.email,
      age: null,
      phone: "",
      symptoms: [],
      prediction,
      probabilities,
      bestModel: best_model || null,
      allModels: all_models || {},
      rankedModels: ranked_models || [],
      totalModels: mlResult.total_models || Object.keys(all_models || {}).length || 1,
      explanation: explanation || "",
      recommendations,
      irmImage: irmImageB64,
      lastScanDate: scanDate,
      medicalHistory: [],
    });
  }

  await appendMedicalHistory(patient, mlResult, scanDate, irmImageB64, recommendations);
  await notifyAssignedDoctor(patient, mlResult, user._id);

  res.json({
    prediction,
    probabilities,
    heatmap_url: "",
    explanation,
    recommendations,
    best_model,
    all_models,
    ranked_models,
    total_models: mlResult.total_models || Object.keys(all_models || {}).length || 1,
    total_time_ms,
    sentToDoctor: !!(patient && patient.assignedDoctor),
  });
};

exports.reanalyzePatientScan = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient introuvable" });
    }

    const { buffer, mimeType } = parseDataUrlImage(patient.irmImage);
    const mlResult = await runMlAnalysisFromBuffer(buffer, mimeType, `${patient.name || "patient"}-reanalyze.jpg`);
    const scanDate = new Date();
    const recommendations = buildRecommendations(mlResult.prediction);

    patient.prediction = mlResult.prediction;
    patient.probabilities = mlResult.probabilities;
    patient.bestModel = mlResult.best_model || null;
    patient.allModels = mlResult.all_models || {};
    patient.rankedModels = mlResult.ranked_models || [];
    patient.totalModels = mlResult.total_models || Object.keys(mlResult.all_models || {}).length || 1;
    patient.explanation = mlResult.explanation || "";
    patient.recommendations = recommendations;
    patient.lastScanDate = scanDate;
    await patient.save();

    await appendMedicalHistory(patient, mlResult, scanDate, patient.irmImage, recommendations);

    return res.json({
      message: "Reanalyse terminee",
      patientId: patient._id,
      prediction: mlResult.prediction,
      probabilities: mlResult.probabilities,
      best_model: mlResult.best_model,
      all_models: mlResult.all_models,
      ranked_models: mlResult.ranked_models,
      total_models: mlResult.total_models || Object.keys(mlResult.all_models || {}).length || 1,
      explanation: mlResult.explanation || "",
      recommendations,
      heatmap_url: "",
      reanalyzed_at: scanDate,
    });
  } catch (error) {
    console.error("reanalyzePatientScan error:", error);
    return res.status(500).json({ message: "Echec de la reanalyse", error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non authentifie" });
    }

    const nameRx = user.username
      ? new RegExp(`^${user.username.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
      : null;

    const candidates = await Patient.find({
      $or: [
        { userId: user._id },
        { email: user.email },
        ...(nameRx ? [{ name: { $regex: nameRx } }] : []),
      ],
    });

    const patient = candidates
      .sort((a, b) => {
        const aHasScan = Boolean(a.lastScanDate || a.prediction || a.irmImage);
        const bHasScan = Boolean(b.lastScanDate || b.prediction || b.irmImage);
        if (aHasScan !== bHasScan) return Number(bHasScan) - Number(aHasScan);

        const aScanTime = new Date(a.lastScanDate || a.createdAt || 0).getTime();
        const bScanTime = new Date(b.lastScanDate || b.createdAt || 0).getTime();
        return bScanTime - aScanTime;
      })[0];

    if (!patient) {
      return res.json([]);
    }

    const historyItems = (patient.medicalHistory || [])
      .map((item, index) => ({
        id: `${patient._id}-history-${index}`,
        patientId: patient._id,
        date: item.date || patient.lastScanDate || patient.createdAt,
        createdAt: item.date || patient.createdAt,
        prediction: item.diagnosis || patient.prediction || "N/A",
        probabilities: item.probabilities || {},
        heatmap_url: "",
        explanation: item.notes || patient.explanation || "",
        recommendations: item.recommendations || buildRecommendations(item.diagnosis || patient.prediction),
        bestModel: item.bestModel || null,
        allModels: item.allModels || {},
        rankedModels: item.rankedModels || [],
        totalModels: item.totalModels || Object.keys(item.allModels || {}).length || 0,
        source: "medicalHistory",
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const currentScan = patient.prediction || Object.keys(patient.probabilities || {}).length > 0
      ? {
          id: `${patient._id}-current`,
          patientId: patient._id,
          date: patient.lastScanDate || patient.createdAt,
          createdAt: patient.createdAt,
          prediction: patient.prediction || "N/A",
          probabilities: patient.probabilities || {},
          heatmap_url: "",
          explanation: patient.explanation || "",
          recommendations: patient.recommendations || buildRecommendations(patient.prediction),
          bestModel: patient.bestModel || null,
          allModels: patient.allModels || {},
          rankedModels: patient.rankedModels || [],
          totalModels: patient.totalModels || Object.keys(patient.allModels || {}).length || 0,
          source: "current",
        }
      : null;

    const latestHistoryTime = historyItems[0]?.date ? new Date(historyItems[0].date).getTime() : null;
    const currentTime = currentScan?.date ? new Date(currentScan.date).getTime() : null;
    const mergedHistory = currentScan && currentTime !== latestHistoryTime
      ? [currentScan, ...historyItems]
      : historyItems;

    res.json(mergedHistory);
  } catch (error) {
    console.error("getHistory error:", error);
    res.status(500).json({ message: "Erreur lors du chargement de l'historique", error: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ message: "Patient not found" });
  res.json(patient);
};
