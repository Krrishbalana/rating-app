const db = require("../db");
const bcrypt = require("bcryptjs");

// ------------------ GET ALL USERS (ADMIN) ------------------
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, role, address, created_at FROM users ORDER BY id ASC"
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------ GET USER BY ID (ADMIN) ------------------
exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      "SELECT id, name, email, role, address, created_at FROM users WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------ UPDATE USER (ADMIN) ------------------
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, password, address, role } = req.body;

    let hashedPassword = null;

    if (password) {
      if (password.length < 8 || password.length > 128) {
        return res
          .status(400)
          .json({ message: "Password must be 8–128 characters" });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updateQuery = `
      UPDATE users
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        address = COALESCE($4, address),
        role = COALESCE($5, role)
      WHERE id = $6
      RETURNING id, name, email, role, address, created_at
    `;

    const result = await db.query(updateQuery, [
      name || null,
      email || null,
      hashedPassword,
      address || null,
      role || null,
      id,
    ]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    return res.json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------ DELETE USER (ADMIN) ------------------
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      "DELETE FROM users WHERE id=$1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
