const express = require("express");
const router = express.Router();

const { verifyToken, ensureRole } = require("../middleware/auth");
const userController = require("../controllers/userController");

// ALL USER ROUTES ONLY FOR SYSTEM ADMIN
router.get(
  "/",
  verifyToken,
  ensureRole("system_admin"),
  userController.getAllUsers
);

router.get(
  "/:id",
  verifyToken,
  ensureRole("system_admin"),
  userController.getUserById
);

router.put(
  "/:id",
  verifyToken,
  ensureRole("system_admin"),
  userController.updateUser
);

router.delete(
  "/:id",
  verifyToken,
  ensureRole("system_admin"),
  userController.deleteUser
);

module.exports = router;
