const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
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
    return res.status(401).json({ message: "Utilisateur non trouve" });
  }

  req.userId = user._id.toString();
  req.user = user;
  next();
};

module.exports = { authenticateToken };
