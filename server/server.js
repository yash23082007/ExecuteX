// server/server.js
// Forced restart
// ExecuteX API Gateway — Express Entry Point

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const compileRoutes = require("./routes/compileRoutes");
const shareRoutes = require("./routes/shareRoutes");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "";

// ─── Middleware ───────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Ensure temp_jobs directory ──────────────────────────
const tempDir = path.join(__dirname, "temp_jobs");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ─── API Routes ──────────────────────────────────────────
app.use("/api/v1", compileRoutes);
app.use("/api/v1", shareRoutes);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// ─── MongoDB Connection (optional — Share feature) ───────
async function connectDatabase() {
  if (!MONGO_URI) {
    console.log("[MongoDB] No MONGO_URI set. Share feature disabled.");
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[MongoDB] Connected successfully.");
  } catch (err) {
    console.error("[MongoDB] Connection failed:", err.message);
    console.log("[MongoDB] Share feature will be unavailable.");
  }
}

// ─── Start Server ────────────────────────────────────────
async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║       ⚡ ExecuteX API Gateway ⚡         ║
║──────────────────────────────────────────║
║  Port:     ${String(PORT).padEnd(29)}║
║  Env:      ${(process.env.NODE_ENV || "development").padEnd(29)}║
║  MongoDB:  ${(MONGO_URI ? "Connected" : "Disabled").padEnd(29)}║
╚══════════════════════════════════════════╝
    `);
  });
}

start();
