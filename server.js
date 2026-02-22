const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3005;

app.use(express.json());
app.use(express.static("public"));

/* ================= DATABASE ================= */

const dbPath = path.join(__dirname, "database.json");

let database = {
  users: [],
  submissions: []
};

if (fs.existsSync(dbPath)) {
  try {
    database = JSON.parse(fs.readFileSync(dbPath));
  } catch {
    console.log("Database read error — starting fresh");
  }
}

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
}

/* ================= LOGIN ================= */

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = database.users.find(
    u =>
      (u.username === username || u.email === username) &&
      u.password === password
  );

  if (!user) return res.json({ success: false });

  res.json({
    success: true,
    username: user.username || user.email,
    isAdmin: user.isAdmin || user.admin || false
  });
});

/* ================= SIGNUP ================= */

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.json({ success: false });

  const exists = database.users.find(
    u => u.username === username || u.email === username
  );

  if (exists) return res.json({ success: false });

  database.users.push({
    username,
    password,
    isAdmin: false
  });

  saveDB();
  res.json({ success: true });
});

/* ================= GET USERS ================= */

app.get("/getUsers", (req, res) => {
  const list = database.users.map(u => ({
    username: u.username || u.email
  }));
  res.json(list);
});

/* ================= OVERRIDE (MEMORY ONLY) ================= */
/* This CANNOT persist or stick */

let tempOverrides = {};

// admin sets override
app.post("/admin/override", (req, res) => {
  const { targetUser, value } = req.body;

  if (!targetUser)
    return res.json({ success: false });

  if (value === "CLEAR") {
    delete tempOverrides[targetUser];
  } else {
    tempOverrides[targetUser] = Number(value);
  }

  res.json({ success: true });
});

// detector reads override ONCE
app.get("/override", (req, res) => {
  const username = req.query.username;

  if (!username)
    return res.json({ override: null });

  if (!(username in tempOverrides))
    return res.json({ override: null });

  const val = tempOverrides[username];

  delete tempOverrides[username]; // one-time use

  res.json({ override: val });
});

/* ================= REAL AI DETECTOR ================= */
/* deterministic — no randomness */

app.post("/detect", (req, res) => {
  const { text } = req.body;

  if (!text || text.length < 20)
    return res.json({ score: 0 });

  const words = text.trim().split(/\s+/);
  const wordCount = words.length;

  const sentences = text
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0);

  const sentenceCount = sentences.length || 1;

  const avgSentenceLength = wordCount / sentenceCount;

  const cleaned = words.map(w =>
    w.toLowerCase().replace(/[^a-z]/g, "")
  );

  const unique = new Set(cleaned);
  const diversity = unique.size / wordCount;

  let score = 0;

  if (avgSentenceLength > 18) score += 25;
  if (avgSentenceLength > 25) score += 25;

  if (diversity < 0.55) score += 25;
  if (diversity < 0.45) score += 25;

  if (
    /(therefore|furthermore|moreover|thus|overall|in conclusion)/i.test(text)
  )
    score += 20;

  score = Math.max(0, Math.min(100, Math.round(score)));

  res.json({ score });
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});