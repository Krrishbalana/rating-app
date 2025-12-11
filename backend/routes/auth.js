const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// Validation rules
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

router.post(
  "/signup",
  [
    body("name")
      .isLength({ min: 20, max: 60 })
      .withMessage("Name must be 20–60 characters"),

    body("email").isEmail().withMessage("Invalid email"),

    body("password")
      .matches(passwordRegex)
      .withMessage("Password must contain 8–16 chars, 1 uppercase, 1 special"),

    body("address").optional().isLength({ max: 400 }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password, address } = req.body;

    try {
      const hashed = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO users (name, email, password_hash, address, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role
      `;
      const values = [name, email, hashed, address || null, "normal_user"];

      const { rows } = await db.query(query, values);

      res.status(201).json({ user: rows[0] });
    } catch (err) {
      if (err.code === "23505") {
        return res.status(400).json({ error: "Email already exists" });
      }
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await db.query(
    "SELECT id, email, password_hash, role FROM users WHERE email = $1",
    [email]
  );

  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token, role: user.role });
});

module.exports = router;
