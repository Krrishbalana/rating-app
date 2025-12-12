const express = require("express");
const router = express.Router();

const { verifyToken, ensureRole } = require("../middleware/auth");
const ratingController = require("../controllers/ratingController");

// Add rating (ONLY normal user)
router.post(
  "/",
  verifyToken,
  ensureRole("normal_user"),
  ratingController.addRating
);

// Update rating (only the owner)
router.put("/:id", verifyToken, ratingController.updateRating);

// Delete rating (only the owner)
router.delete("/:id", verifyToken, ratingController.deleteRating);

// Get all ratings for a store (public)
router.get("/store/:store_id", ratingController.getRatingsByStore);

module.exports = router;
