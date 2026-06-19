// server/app.js - SINGLE source of truth
const Sentry = require("@sentry/node");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// ── Sentry Initialization (server-side) ──
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.2,
  });
  console.log("[Sentry] Server-side error monitoring initialized.");
}

const shareRoutes = require("./routes/shareRoutes");
const executeRoutes = require("./routes/executeRoutes");

const app = express();

app.set('trust proxy', 1); // important for rate limiter on Vercel
app.use(cors());

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: "Too many requests, please try again later." }
});
app.use(limiter);

// Optional advanced CORS can go here in the future if needed

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/v1", shareRoutes);
app.use("/api/v1", executeRoutes);

// AI routes — loaded dynamically (Phase 2)
try {
  const aiRoutes = require("./routes/aiRoutes");
  app.use("/api/v1", aiRoutes);
  console.log("[Routes] AI routes loaded.");
} catch {
  // aiRoutes.js doesn't exist yet — skip silently
}

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── Global Error Handler (with Sentry) ──
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);

  // Report to Sentry if initialized
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

module.exports = app;