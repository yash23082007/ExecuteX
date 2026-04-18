const express = require("express");
const router = express.Router();
const { z } = require("zod");
const crypto = require("crypto");
const { Redis } = require("@upstash/redis");
const rateLimit = require('express-rate-limit');

// Initialize Upstash Redis safely
// Fallback gracefully if keys are missing in dev
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
  message: { error: "Too many executions. Please wait a minute. Apple tumhari hai" }
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

  const { code, compiler, options, stdin } = parsed.data;

  const MAX_CODE_BYTES = 50 * 1024; // 50 KB
  if (getBufferByteLength(code) > MAX_CODE_BYTES) {
    return res.status(413).json({ error: "Code too large. Max 50KB." });
  }

  try {
    let cacheKey = null;
    if (redis) {
      cacheKey = `exec:${crypto.createHash("sha256").update(compiler + code + (stdin || "") + (options || "")).digest("hex")}`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.status(200).json(typeof cached === "string" ? JSON.parse(cached) : cached);
        }
      } catch (redisErr) {
        console.warn("[Redis Cache Error]", redisErr.message);
      }
    }

    // Tier 1: Wandbox API
    let data = null;
    let providerSuccess = false;
    
    try {
      const wandboxController = new AbortController();
      const timeoutId = setTimeout(() => wandboxController.abort(), 12000);
      const wandboxRes = await fetch("https://wandbox.org/api/compile.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, compiler, options, stdin }),
        signal: wandboxController.signal
      });
      clearTimeout(timeoutId);
      
      if (wandboxRes.ok) {
        data = await wandboxRes.json();
        providerSuccess = true;
      } else {
        throw new Error("Wandbox returned non-200");
      }
    } catch (tier1Err) {
      console.warn(`[Circuit Breaker] Wandbox failed (${tier1Err.message}), falling back to Piston...`);
    }

    // Tier 2: Piston API Fallback
    if (!providerSuccess) {
      try {
        const PISTON_LANG_MAP = {
          "gcc-head-c": { language: "c", version: "*" },
          "gcc-head": { language: "c++", version: "*" },
          "openjdk-jdk-22+36": { language: "java", version: "*" },
          "mono-6.12.0.199": { language: "csharp", version: "*" },
          "cpython-3.14.0": { language: "python", version: "*" },
          "r-4.4.1": { language: "r", version: "*" },
          "julia-1.10.5": { language: "julia", version: "*" },
          "nodejs-20.17.0": { language: "javascript", version: "*" },
          "typescript-5.6.2": { language: "typescript", version: "*" },
          "php-8.3.12": { language: "php", version: "*" },
          "ruby-3.4.1": { language: "ruby", version: "*" },
          "go-1.23.2": { language: "go", version: "*" },
          "rust-1.82.0": { language: "rust", version: "*" },
          "scala-3.3.4": { language: "scala", version: "*" },
          "ghc-9.10.1": { language: "haskell", version: "*" },
          "lua-5.4.7": { language: "lua", version: "*" },
          "bash": { language: "bash", version: "*" },
          "perl-5.42.0": { language: "perl", version: "*" },
        };
        const pistonLang = PISTON_LANG_MAP[compiler]?.language || compiler.split("-")[0] || "python";
        const pistonVersion = PISTON_LANG_MAP[compiler]?.version || "*";
        const pistonRes = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: pistonLang,
            version: pistonVersion,
            files: [{ content: code }],
            stdin: stdin || "",
          }),
        });
        if (!pistonRes.ok) throw new Error("Piston API unavailable.");
        
        const pistonData = await pistonRes.json();
        
        // Normalize Piston response to Wandbox format
        data = {
          status: (pistonData.run?.code === 0) ? "0" : "1",
          program_message: pistonData.run?.stdout || pistonData.run?.stderr || "",
          compiler_message: pistonData.compile?.stderr || "",
        };
        providerSuccess = true;
      } catch (tier2Err) {
        console.error(`[Circuit Breaker] Piston failed: ${tier2Err.message}`);
        throw new Error("All execution providers unavailable.", { cause: tier2Err });
      }
    }

    // Cache the result if we have a cache
    if (redis && cacheKey && providerSuccess) {
      const safeData = {
        ...data,
        program_output: (data.program_output || "").slice(0, 65536), // 64KB max output in cache
        compiler_message: (data.compiler_message || "").slice(0, 8192),
      };
      await redis.setex(cacheKey, 300, JSON.stringify(safeData)); 
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("[Execution Controller] Failed:", error.message);
    return res.status(503).json({ error: error.message || "Execution failed due to server error." });
  }
});

module.exports = router;
