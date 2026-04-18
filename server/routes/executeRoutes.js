const express = require("express");
const router = express.Router();
const { z } = require("zod");
const { Redis } = require("@upstash/redis");
const rateLimit = require('express-rate-limit');
const { executeCode } = require("../services/executionService");

// Initialize Upstash Redis safely
let redis = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const executeLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 15,              // 15 executions per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many executions. Please wait a minute." }
});

const VALID_COMPILERS = new Set([
  "gcc-head-c", "gcc-head", "openjdk-jdk-22+36", "mono-6.12.0.199", "cpython-3.14.0", "r-4.4.1",     
  "julia-1.10.5", "nodejs-20.17.0", "typescript-5.6.2", "php-8.3.12", "ruby-3.4.1", "go-1.23.2",     
  "rust-1.82.0", "scala-3.3.4", "ghc-9.10.1", "lua-5.4.7", "bash", "perl-5.42.0"
]);

// Define basic schema for execution mapping to wandbox
const ExecuteSchema = z.object({
  code: z.string().min(1).max(50000),
  compiler: z.string().refine(c => VALID_COMPILERS.has(c), { message: "Unknown compiler" }),
  options: z.string().max(200).optional(),
  stdin: z.string().max(10000).optional(),
});

function getBufferByteLength(str) {
  // Rough estimate or using Buffer if available
  return Buffer.isBuffer(str) ? str.length : Buffer.from(str).length;
}

router.post("/execute", executeLimiter, async (req, res) => {
  const parsed = ExecuteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });        
  }

  const { code } = parsed.data;

  const MAX_CODE_BYTES = 50 * 1024; // 50 KB
  if (getBufferByteLength(code) > MAX_CODE_BYTES) {
    return res.status(413).json({ error: "Code too large. Max 50KB." });
  }

  try {
    const data = await executeCode(parsed.data, redis);
    return res.status(200).json(data);
  } catch (error) {
    console.error("[Execution Controller] Failed:", error.message);
    if (error.message.includes("queue is full")) {
      return res.status(429).json({ error: "Server is busy. Please try again later." });
    }
    return res.status(500).json({ error: "Internal execution error." });
  }
});

module.exports = router;
