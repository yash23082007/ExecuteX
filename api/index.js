// api/index.js — Vercel Serverless Entry Point
require("dotenv").config();
const Sentry = require("@sentry/node");
const mongoose = require("mongoose");

// ── Sentry Initialization (serverless) ──
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: 0.2,
  });
}

const app = require("../server/app");

const MONGO_URI = process.env.MONGO_URI || "";

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  if (!MONGO_URI) {
    console.log("[Serverless] No MONGO_URI provided.");
    return null;
  }

  try {
    const opts = { bufferCommands: false };
    cachedDb = await mongoose.connect(MONGO_URI, opts);
    console.log("[Serverless] Connected to MongoDB.");
    return cachedDb;
  } catch (err) {
    console.error("[Serverless] MongoDB connection failed:", err.message);
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err);
    }
    throw err;
  }
}

// Intercept requests to ensure DB connection is ready (for shared links)
app.use(async (req, res, next) => {
  if (req.url.startsWith("/api/v1/share")) {
    try {
      await connectToDatabase();
    } catch {
      console.warn("DB not ready, proceeding without it.");
    }
  }
  next();
});

module.exports = app;