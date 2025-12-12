const db = require("../db");

// ------------------ ADD RATING (normal user) ------------------
exports.addRating = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { store_id, rating, comment } = req.body;

    if (!store_id)
      return res.status(400).json({ message: "store_id is required" });

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1–5" });

    if (!comment || comment.trim() === "")
      return res.status(400).json({ message: "Comment is required" });

    const storeCheck = await db.query("SELECT id FROM stores WHERE id=$1", [
      store_id,
    ]);
    if (storeCheck.rows.length === 0)
      return res.status(404).json({ message: "Store not found" });

    const existing = await db.query(
      "SELECT id FROM ratings WHERE user_id=$1 AND store_id=$2",
      [user_id, store_id]
    );

    if (existing.rows.length > 0)
      return res.status(400).json({ message: "You already rated this store" });

    const result = await db.query(
      `INSERT INTO ratings (user_id, store_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, store_id, rating, comment]
    );

    return res.status(201).json({
      message: "Rating added successfully",
      rating: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ UPDATE RATING ------------------
exports.updateRating = async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.user.id;
    const { rating, comment } = req.body;

    const check = await db.query("SELECT * FROM ratings WHERE id=$1", [id]);
    if (check.rows.length === 0)
      return res.status(404).json({ message: "Rating not found" });

    const row = check.rows[0];

    if (row.user_id !== user_id)
      return res
        .status(403)
        .json({ message: "Not allowed to update this rating" });

    if (!comment || comment.trim() === "")
      return res.status(400).json({ message: "Comment is required" });

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1–5" });

    const result = await db.query(
      `
      UPDATE ratings
      SET rating=$1, comment=$2, updated_at=NOW()
      WHERE id=$3
      RETURNING *
      `,
      [rating, comment, id]
    );

    return res.json({
      message: "Rating updated successfully",
      rating: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ DELETE RATING ------------------
exports.deleteRating = async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.user.id;

    const check = await db.query("SELECT * FROM ratings WHERE id=$1", [id]);
    if (check.rows.length === 0)
      return res.status(404).json({ message: "Rating not found" });

    const row = check.rows[0];

    if (row.user_id !== user_id)
      return res
        .status(403)
        .json({ message: "Not authorized to delete this rating" });

    await db.query("DELETE FROM ratings WHERE id=$1", [id]);

    return res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ GET RATINGS FOR STORE ------------------
exports.getRatingsByStore = async (req, res) => {
  try {
    const store_id = req.params.store_id;

    const result = await db.query(
      `
      SELECT 
        r.id, r.rating, r.comment, r.created_at, r.updated_at,
        u.id AS user_id, u.name AS user_name
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id=$1
      ORDER BY r.created_at DESC
      `,
      [store_id]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
