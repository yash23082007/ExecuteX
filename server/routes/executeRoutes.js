const express = require("express");
const router = express.Router();
const { z } = require("zod");
const crypto = require("crypto");
const { Redis } = require("@upstash/redis");

// Initialize Upstash Redis safely
// Fallback gracefully if keys are missing in dev
let redis = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Define basic schema for execution mapping to wandbox
const ExecuteSchema = z.object({
  code: z.string().min(1).max(50000),
  compiler: z.string().min(1).max(100),
  options: z.string().max(200).optional(),
  stdin: z.string().max(10000).optional(),
});

function getBufferByteLength(str) {
  // Rough estimate or using Buffer if available
  return Buffer.isBuffer(str) ? str.length : Buffer.from(str).length;
}

router.post("/execute", async (req, res) => {
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
        const pistonLang = compiler.split("-")[0] === "c" ? "c" : (compiler.split("-")[0] || "python");
        const pistonRes = await fetch("https://emacs.piston.rs/api/v2/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: pistonLang,
            version: "*",
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
      await redis.setex(cacheKey, 300, JSON.stringify(data)); 
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("[Execution Controller] Failed:", error.message);
    return res.status(503).json({ error: error.message || "Execution failed due to server error." });
  }
});

module.exports = router;
