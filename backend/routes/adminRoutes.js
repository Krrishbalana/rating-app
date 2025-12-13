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

router.get(
  "/stats",
  verifyToken,
  ensureRole("system_admin"),
  adminController.getStats
);

router.delete(
  "/users/:id",
  verifyToken,
  ensureRole("system_admin"),
  adminController.deleteUser
);

router.post(
  "/users/create",
  verifyToken,
  ensureRole("system_admin"),
  adminController.createUser
);

router.get(
  "/stores",
  verifyToken,
  ensureRole("system_admin"),
  adminController.getAllStoresAdmin
);

// Get full details of a specific user
router.get(
  "/users/:id/details",
  verifyToken,
  ensureRole("system_admin"),
  adminController.getUserDetails
);

module.exports = router;
