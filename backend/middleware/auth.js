const jwt = require("jsonwebtoken");

// Verify JWT Token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Role-based access (supports single or multiple roles)
function ensureRole(roles) {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  ensureRole,
};
