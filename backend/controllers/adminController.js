// backend/controllers/adminController.js
const db = require("../db");
const bcrypt = require("bcryptjs");

// Allowed roles
const ALLOWED_ROLES = ["normal_user", "store_owner", "system_admin"];

// ---------------------------- GET ALL USERS ----------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role FROM users ORDER BY id ASC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("ADMIN getAllUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------- UPDATE USER ROLE ----------------------------
exports.updateUserRole = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ⛔ Prevent admin from modifying own role
    if (req.user.id === userId) {
      return res.status(400).json({
        message: "You cannot modify your own role",
      });
    }

    const result = await db.query(
      `UPDATE users SET role=$1 WHERE id=$2 RETURNING id, name, email, role`,
      [role, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    return res.json({
      message: "Role updated",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("ADMIN updateUserRole error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------- ADMIN STATS ----------------------------
exports.getStats = async (req, res) => {
  try {
    const users = await db.query("SELECT COUNT(*) FROM users");
    const stores = await db.query("SELECT COUNT(*) FROM stores");
    const ratings = await db.query("SELECT COUNT(*) FROM ratings");

    return res.json({
      total_users: Number(users.rows[0].count),
      total_stores: Number(stores.rows[0].count),
      total_ratings: Number(ratings.rows[0].count),
    });
  } catch (err) {
    console.error("ADMIN getStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------- CREATE USER ----------------------------
exports.createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Duplicate email check
    const existing = await db.query(`SELECT id FROM users WHERE email=$1`, [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, address, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [name, email, address, hashed, role]
    );

    return res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.log("ADMIN createUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------- USER DETAILS ----------------------------
exports.getUserDetails = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const userQuery = await db.query(
      `SELECT id, name, email, address, role 
       FROM users WHERE id=$1`,
      [userId]
    );

    if (userQuery.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = userQuery.rows[0];
    let stores = [];
    let ratings = [];

    // If store owner → fetch their stores
    if (user.role === "store_owner") {
      const storeQuery = await db.query(
        `
        SELECT 
          s.id, s.name, s.email, s.address,
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
          COUNT(r.*) AS rating_count
        FROM stores s
        LEFT JOIN ratings r ON r.store_id = s.id
        WHERE s.owner_id = $1
        GROUP BY s.id
        ORDER BY s.id ASC`,
        [userId]
      );
      stores = storeQuery.rows;
    }

    // If normal user → fetch all ratings
    if (user.role === "normal_user") {
      const ratingQuery = await db.query(
        `
        SELECT
          r.id, r.rating, r.comment, r.created_at,
          s.id AS store_id, s.name AS store_name
        FROM ratings r
        JOIN stores s ON s.id=r.store_id
        WHERE r.user_id=$1
        ORDER BY r.created_at DESC`,
        [userId]
      );
      ratings = ratingQuery.rows;
    }

    return res.json({ user, stores, ratings });
  } catch (err) {
    console.error("ADMIN getUserDetails error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET ALL STORES FOR ADMIN
exports.getAllStoresAdmin = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        u.name AS owner_name,
        u.email AS owner_email,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
        COUNT(r.*) AS rating_count
      FROM stores s
      JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      GROUP BY s.id, u.id
      ORDER BY s.id ASC;
    `);

    return res.json(result.rows);
  } catch (err) {
    console.error("ADMIN getAllStoresAdmin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------- DELETE USER ----------------------------
exports.deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // ⛔ Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const result = await db.query(
      `DELETE FROM users WHERE id=$1 RETURNING id, name, email`,
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    return res.json({
      message: "User deleted successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("ADMIN deleteUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
