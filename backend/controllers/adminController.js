// backend/controllers/adminController.js
const db = require("../db");

// Helper: allowed roles
const ALLOWED_ROLES = ["normal_user", "store_owner", "system_admin"];

// GET /admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const q = `SELECT id, name, email, role FROM users ORDER BY id ASC`;
    const result = await db.query(q);
    return res.json(result.rows);
  } catch (err) {
    console.error("ADMIN getAllUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Do not allow demoting or changing yourself? (optional)
    // if (req.user.id === userId) { ... }

    const q = `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`;
    const result = await db.query(q, [role, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Role updated", user: result.rows[0] });
  } catch (err) {
    console.error("ADMIN updateUserRole error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Prevent deleting yourself optionally:
    // if (req.user.id === userId) return res.status(400).json({ message: "Cannot delete yourself" });

    // Delete user
    const q = `DELETE FROM users WHERE id=$1 RETURNING id, name, email`;
    const result = await db.query(q, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    console.error("ADMIN deleteUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
