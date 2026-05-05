const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  relation: { type: String, required: true, trim: true },
  phone: { type: String, default: "", trim: true },
  notes: { type: String, default: "", trim: true },
  imageUrl: { type: String, default: null },
}, { _id: true });

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  time: { type: String, required: true, trim: true },
  details: { type: String, default: "", trim: true },
  done: { type: Boolean, default: false },
  lastNotifiedOn: { type: String, default: null },
}, { _id: true });

const assistantProfileSchema = new mongoose.Schema({
  patientName: { type: String, default: "", trim: true },
  age: { type: String, default: "", trim: true },
  diagnosis: { type: String, default: "Suivi cognitif Alzheimer", trim: true },
  emergencyContact: { type: String, default: "", trim: true },
  emergencyPhone: { type: String, default: "", trim: true },
  dailyNotes: { type: String, default: "", trim: true },
}, { _id: false });

const journalEntrySchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  scanPrediction: { type: String, default: "Aucun scan", trim: true },
  memory: { type: String, default: "Faible", trim: true },
  sleep: { type: String, default: "Bon", trim: true },
  mood: { type: String, default: "Stable", trim: true },
  confusion: { type: String, default: "Aucune", trim: true },
  autonomy: { type: String, default: "Bonne", trim: true },
  forgetfulness: { type: String, default: "Faible", trim: true },
  fatigue: { type: String, default: "Faible", trim: true },
  riskLevel: { type: String, default: "Medium", trim: true },
  note: { type: String, default: "", trim: true },
}, { _id: true });

const patientSchema = new mongoose.Schema({
  // Lien avec le compte utilisateur (User._id) — défini lors du premier upload
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  name: String,
  age: Number,
  email: String,
  phone: String,
  symptoms: [String],
  prediction: String,
  probabilities: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  bestModel: {
    type: String,
    default: null,
  },
  allModels: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  rankedModels: {
    type: [String],
    default: [],
  },
  totalModels: {
    type: Number,
    default: 0,
  },
  explanation: {
    type: String,
    default: "",
  },
  recommendations: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  // Image IRM stockée en base64 (format: "data:image/jpeg;base64,...")
  irmImage: {
    type: String,
    default: null,
  },
  // Date du dernier scan IRM
  lastScanDate: {
    type: Date,
    default: null,
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  medicalHistory: [{
    date: Date,
    diagnosis: String,
    notes: String,
    recommendations: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    probabilities: { type: mongoose.Schema.Types.Mixed, default: {} },
    bestModel: { type: String, default: null },
    allModels: { type: mongoose.Schema.Types.Mixed, default: {} },
    rankedModels: { type: [String], default: [] },
    totalModels: { type: Number, default: 0 },
    irmImage: { type: String, default: null },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  }],
  assistant: {
    profile: {
      type: assistantProfileSchema,
      default: () => ({}),
    },
    familyMembers: {
      type: [familyMemberSchema],
      default: [],
    },
    reminders: {
      type: [reminderSchema],
      default: [],
    },
  },
  journalEntries: {
    type: [journalEntrySchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Patient", patientSchema);
