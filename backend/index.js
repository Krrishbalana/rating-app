require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/stores", require("./routes/storeRoutes"));
app.use("/ratings", require("./routes/ratingRoutes"));

// Health check
app.get("/", (req, res) => res.send("Backend running"));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
