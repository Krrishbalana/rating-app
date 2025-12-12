const express = require("express");
const router = express.Router();

const { verifyToken, ensureRole } = require("../middleware/auth");
const storeController = require("../controllers/storeController");

/* --------------------------------------------------
   PUBLIC ROUTES (Accessible by normal users too)
---------------------------------------------------*/

// Get all stores (public)
router.get("/", storeController.getAllStores);

// Get store by ID (public)
router.get("/:id", storeController.getStoreById);

/* --------------------------------------------------
   PROTECTED ROUTES (Owner + Admin)
---------------------------------------------------*/

// Create store
router.post(
  "/",
  verifyToken,
  ensureRole("store_owner", "system_admin"),
  storeController.createStore
);

// Get stores for a specific owner
router.get(
  "/owner/:ownerId",
  verifyToken,
  ensureRole("store_owner", "system_admin"),
  storeController.getStoresByOwner
);

// Update store
router.put(
  "/:id",
  verifyToken,
  ensureRole("store_owner", "system_admin"),
  storeController.updateStore
);

// Delete store
router.delete(
  "/:id",
  verifyToken,
  ensureRole("store_owner", "system_admin"),
  storeController.deleteStore
);

module.exports = router;
