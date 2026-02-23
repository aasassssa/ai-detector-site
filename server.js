const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3005;

// ✅ Serve ONLY the public folder
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// ✅ Root route → public/index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});