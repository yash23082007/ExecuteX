// api/index.js
// Vercel Serverless Function entry point

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const shareRoutes = require("../server/routes/shareRoutes");

const app = express();
const MONGO_URI = process.env.MONGO_URI || "";

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Database connection (singleton for serverless)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!MONGO_URI) {
    console.log("[MongoDB] No MONGO_URI set. Share feature disabled.");
    return null;
  }
  try {
    const db = await mongoose.connect(MONGO_URI);
    cachedDb = db;
    console.log("[MongoDB] Connected successfully.");
    return db;
  } catch (err) {
    console.error("[MongoDB] Connection failed:", err.message);
    return null;
  }
}

// Routes
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

app.use("/api/v1", shareRoutes);

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
