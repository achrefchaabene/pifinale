const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in backend/.env");
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    const reason = error?.message || "Unknown MongoDB connection error";
    throw new Error(`MongoDB connection failed: ${reason}`);
  }
};

module.exports = connectDB;
