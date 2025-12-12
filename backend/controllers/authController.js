const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---------------------------------------------------------
// REGISTER USER
// ---------------------------------------------------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // ------------------- VALIDATIONS -------------------

    // Name must be 5–60 chars
    if (!name || name.length < 5 || name.length > 60) {
      return res.status(400).json({ message: "Name must be 5–60 characters" });
    }

    // Password must be 8–128 chars
    if (!password || password.length < 8 || password.length > 128) {
      return res
        .status(400)
        .json({ message: "Password must be 8–128 characters" });
    }

    // Email must be unique
    const emailCheck = await db.query("SELECT id FROM users WHERE email=$1", [
      email,
    ]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ------------------- CREATE USER -------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [
        name,
        email,
        hashedPassword,
        address,
        role || "normal_user", // default role
      ]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------
// LOGIN USER
// ---------------------------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email exists
    const userResult = await db.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
