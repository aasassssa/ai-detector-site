// server.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

// Hosting platforms provide PORT automatically
const PORT = process.env.PORT || 3005;

// Example database file
const dbPath = path.join(__dirname, "db.json");

// Ensure db file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({}));
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Root route (prevents "Cannot GET /")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});