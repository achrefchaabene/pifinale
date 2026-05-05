const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const PORT = 5000;

const startServer = async () => {
  await connectDB();

  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json());

  app.use("/api/users", require("./routes/userRoutes"));
  app.use("/api/patients", require("./routes/patientRoutes"));
  app.use("/api/assistant", require("./routes/assistantRoutes"));
  app.use("/api/articles", require("./routes/articleRoutes"));
  app.use("/api/messages", require("./routes/messageRoutes"));
  app.use("/api/appointments", require("./routes/appointmentRoutes"));
  app.use("/api", require("./routes/systemRoutes"));

  app.get("/api/test", (_req, res) => {
    res.json({ message: "API is accessible", timestamp: new Date().toISOString() });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Accessible via network at http://192.168.1.25:${PORT} (if that's your IP)`);
  });
};

startServer().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
