// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, ensureRole } = require("../middleware/auth");

// All admin routes – only accessible by system_admin
router.get(
  "/users",
  verifyToken,
  ensureRole("system_admin"),
  adminController.getAllUsers
);

router.put(
  "/users/:id/role",
  verifyToken,
  ensureRole("system_admin"),
  adminController.updateUserRole
);

router.delete(
  "/users/:id",
  verifyToken,
  ensureRole("system_admin"),
  adminController.deleteUser
);

module.exports = router;
