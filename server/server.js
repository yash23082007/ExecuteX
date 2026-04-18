// server/server.js
// Forced restart
// ExecuteX API Gateway — Express Entry Point

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const helmet = require("helmet");

const shareRoutes = require("./routes/shareRoutes");
const executeRoutes = require("./routes/executeRoutes");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "";

// ─── Middleware ───────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(helmet({
  contentSecurityPolicy: false, // managed by vercel.json in prod
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── API Routes ──────────────────────────────────────────
app.use("/api/v1", shareRoutes);
app.use("/api/v1", executeRoutes);

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
  const server = app.listen(PORT, () => {
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

  process.on('SIGTERM', () => {
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000); // force kill after 10s
  });
}

start();
