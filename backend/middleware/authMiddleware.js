const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("Authorization");

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied. Please log in." });
  }

  // Verify token
  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET || "secret_key"
    );
    req.user = decoded; // add user to request payload
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
