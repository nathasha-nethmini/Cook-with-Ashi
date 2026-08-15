const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_super_secret");
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = auth;
