const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["doctor", "user"],
  },
});

module.exports = mongoose.model("User", userSchema);