const express = require("express");
const router = express.Router();

const { verifyToken, ensureRole } = require("../middleware/auth");
const storeController = require("../controllers/storeController");
const adminController = require("../controllers/adminController");

/* --------------------------------------------------
   PUBLIC ROUTES
---------------------------------------------------*/

router.get("/", storeController.getAllStores);
router.get("/:id", storeController.getStoreById);

/* --------------------------------------------------
   PROTECTED ROUTES
---------------------------------------------------*/

router.post(
  "/",
  verifyToken,
  ensureRole("store_owner", "system_admin"),
  storeController.createStore
);

router.get(
  "/owner/:ownerId",
  verifyToken,
  ensureRole("store_owner", "system_admin"),
  storeController.getStoresByOwner
);

// 🔥 ADMIN GET ALL STORES
router.get(
  "/admin/all",
  verifyToken,
  ensureRole("system_admin"),
  adminController.getAllStoresAdmin
);

// ADMIN: Create store for any owner
router.post(
  "/admin-create",
  verifyToken,
  ensureRole("system_admin"),
  storeController.adminCreateStore
);

router.put(
  "/:id",
  verifyToken,
  ensureRole("store_owner", "system_admin"),
  storeController.updateStore
);

router.delete(
  "/:id",
  verifyToken,
  ensureRole("store_owner", "system_admin"),
  storeController.deleteStore
);

module.exports = router;
