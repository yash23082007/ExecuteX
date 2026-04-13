// api/index.js
// Vercel Serverless Function entry point

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Sentry = require("@sentry/node");
const pino = require("pino");

const logger = pino({ level: "info" });

// Initialize Sentry early
Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  tracesSampleRate: 0.1,
});

const shareRoutes = require("../server/routes/shareRoutes");
const executeRoutes = require("../server/routes/executeRoutes");

const app = express();
const MONGO_URI = process.env.MONGO_URI || "";

// Middleware
app.use(cors({ 
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Database connection (singleton for serverless)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!MONGO_URI) {
    logger.warn("[MongoDB] No MONGO_URI set. Share feature disabled.");
    return null;
  }
  try {
    const db = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    cachedDb = db;
    logger.info("[MongoDB] Connected successfully.");
    return db;
  } catch (err) {
    logger.error({ err }, "[MongoDB] Connection failed");
    return null;
  }
}

// Routes
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

app.use("/api/v1", shareRoutes);
app.use("/api/v1", executeRoutes);

// Sentry error handler
Sentry.setupExpressErrorHandler(app);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    serverless: true,
    timestamp: new Date().toISOString(),
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("[Serverless Error]", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

module.exports = app;
