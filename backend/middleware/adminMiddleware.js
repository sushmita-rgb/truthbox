const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const adminSecret = process.env.JWT_SECRET;
  const token = req.cookies?.admin_token;

  if (!token) {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  try {
    const decoded = jwt.verify(token, adminSecret);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid admin token" });
  }
};
