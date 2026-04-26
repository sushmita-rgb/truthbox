const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: "Server misconfiguration: missing JWT secret." });
  }

  // Get token from cookies or Authorization header
  let token = req.cookies?.token;
  
  if (!token) {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied. Please log in." });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // add user to request payload
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
