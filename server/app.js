// server/app.js - SINGLE source of truth
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const shareRoutes = require("./routes/shareRoutes");
const executeRoutes = require("./routes/executeRoutes");

const app = express();

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

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

module.exports = app;