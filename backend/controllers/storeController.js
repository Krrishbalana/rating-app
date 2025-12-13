const db = require("../db");

// ------------------ CREATE STORE (Store Owner + Admin) ------------------
exports.createStore = async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const owner_id = req.user.id;

    if (!name)
      return res.status(400).json({ message: "Store name is required" });

    const result = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, address, owner_id]
    );

    return res.status(201).json({
      message: "Store created successfully",
      store: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// ------------------ GET ALL STORES (PUBLIC) ------------------
exports.getAllStores = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.*,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS average_rating,
        COUNT(r.*) AS rating_count
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      GROUP BY s.id
      ORDER BY s.id ASC;
    `);

    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching stores:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ GET STORES FOR SPECIFIC OWNER ------------------
exports.getStoresByOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    if (req.user.role !== "system_admin" && req.user.id != ownerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const result = await db.query(
      `
      SELECT
        s.*,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS average_rating,
        COUNT(r.*) AS rating_count
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.owner_id = $1
      GROUP BY s.id
      ORDER BY s.id ASC;
      `,
      [ownerId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ GET STORE BY ID (WITH BREAKDOWN) ------------------
exports.getStoreById = async (req, res) => {
  try {
    const id = req.params.id;

    // Get main store details + avg + count
    const result = await db.query(
      `
      SELECT
        s.*,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS average_rating,
        COUNT(r.*) AS rating_count
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.id = $1
      GROUP BY s.id;
      `,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Store not found" });

    const store = result.rows[0];

    // Rating Breakdown
    const breakdownQuery = await db.query(
      `
      SELECT rating, COUNT(*) AS count
      FROM ratings
      WHERE store_id = $1
      GROUP BY rating
      `,
      [id]
    );

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    breakdownQuery.rows.forEach((row) => {
      breakdown[row.rating] = Number(row.count);
    });

    store.rating_breakdown = breakdown;

    return res.json(store);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ UPDATE STORE ------------------
exports.updateStore = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, address } = req.body;

    const storeCheck = await db.query("SELECT * FROM stores WHERE id=$1", [id]);
    if (storeCheck.rows.length === 0)
      return res.status(404).json({ message: "Store not found" });

    const store = storeCheck.rows[0];

    if (req.user.role !== "system_admin" && req.user.id !== store.owner_id) {
      return res.status(403).json({ message: "Not authorized to update" });
    }

    const result = await db.query(
      `UPDATE stores
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           address = COALESCE($3, address)
       WHERE id=$4
       RETURNING *`,
      [name || null, email || null, address || null, id]
    );

    return res.json({
      message: "Store updated successfully",
      store: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------- GET ALL STORES (ADMIN) ----------------------------
exports.getAllStoresAdmin = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        u.name AS owner_name,
        u.email AS owner_email,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
        COUNT(r.*) AS rating_count
      FROM stores s
      JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      GROUP BY s.id, u.name, u.email
      ORDER BY s.id ASC
    `);

    return res.json(result.rows);
  } catch (err) {
    console.error("ADMIN getAllStores error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// ------------------ ADMIN CREATE STORE (assign to any owner) ------------------
exports.adminCreateStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (!name || !owner_id) {
      return res
        .status(400)
        .json({ message: "Store name & owner_id required" });
    }

    // Check owner exists & is store_owner
    const ownerCheck = await db.query(
      "SELECT id, role FROM users WHERE id=$1",
      [owner_id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ message: "Owner not found" });
    }

    if (ownerCheck.rows[0].role !== "store_owner") {
      return res.status(400).json({ message: "User is not a store owner" });
    }

    // Create store assigned to specific owner
    const result = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, address, owner_id]
    );

    return res.status(201).json({
      message: "Store created successfully",
      store: result.rows[0],
    });
  } catch (err) {
    console.error("adminCreateStore error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ DELETE STORE ------------------
exports.deleteStore = async (req, res) => {
  try {
    const id = req.params.id;

    const storeCheck = await db.query("SELECT * FROM stores WHERE id=$1", [id]);
    if (storeCheck.rows.length === 0)
      return res.status(404).json({ message: "Store not found" });

    const store = storeCheck.rows[0];

    if (req.user.role !== "system_admin" && req.user.id !== store.owner_id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this store" });
    }

    await db.query("DELETE FROM stores WHERE id=$1", [id]);

    return res.json({ message: "Store deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
