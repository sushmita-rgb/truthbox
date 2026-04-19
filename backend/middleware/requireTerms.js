const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    if (!user.termsAccepted) {
      return res.status(403).json({ message: "Terms and conditions must be accepted before proceeding." });
    }
    
    next();
  } catch (err) {
    console.error("RequireTerms Middleware Error:", err);
    res.status(500).json({ message: "Server error verifying terms acceptance." });
  }
};
