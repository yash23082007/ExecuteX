// server/utils/rateLimiter.js
// Rate Limiter — Upstash Redis serverless rate limiting with graceful local memory fallback

const rateLimit = require("express-rate-limit");

let upstashRedisAvailable = false;
let redisInstance = null;
let RatelimitClass = null;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    const { Redis } = require("@upstash/redis");
    const { Ratelimit } = require("@upstash/ratelimit");
    
    redisInstance = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    
    RatelimitClass = Ratelimit;
    upstashRedisAvailable = true;
    console.log("[Rate Limiter] Upstash Redis configured successfully for rate limiting.");
  } catch (err) {
    console.error("[Rate Limiter] Failed to initialize Upstash Redis:", err.message);
    upstashRedisAvailable = false;
  }
} else {
  console.log("[Rate Limiter] Upstash credentials missing, falling back to local memory rate limiting.");
}

/**
 * createLimiter
 * Creates a rate limit middleware. If Upstash Redis is available, uses sliding window rate limiting.
 * Otherwise, falls back to in-memory express-rate-limit.
 * 
 * @param {Object} options
 * @param {number} options.windowMs - Window time in milliseconds.
 * @param {number} options.max - Maximum number of requests allowed in the window.
 * @param {Object|string} options.message - The response payload/error message on rate limit block.
 * @param {string} options.keyPrefix - Prefix for Redis keys (e.g. 'execute', 'share').
 */
function createLimiter({ windowMs, max, message, keyPrefix = "global" }) {
  if (upstashRedisAvailable && redisInstance && RatelimitClass) {
    // Convert ms to seconds string for Upstash ratelimit slidingWindow (e.g., "60 s")
    const windowSeconds = Math.max(1, Math.floor(windowMs / 1000));
    const ratelimit = new RatelimitClass({
      redis: redisInstance,
      limiter: RatelimitClass.slidingWindow(max, `${windowSeconds} s`),
      analytics: true,
      prefix: `@upstash/ratelimit/${keyPrefix}`,
    });

    return async (req, res, next) => {
      // Determine client IP
      const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress || "127.0.0.1";
      // Handle array of IPs in x-forwarded-for
      const clientIp = typeof ip === "string" ? ip.split(",")[0].trim() : "127.0.0.1";

      try {
        const { success, limit, remaining, reset } = await ratelimit.limit(clientIp);

        res.setHeader("X-RateLimit-Limit", limit);
        res.setHeader("X-RateLimit-Remaining", remaining);
        res.setHeader("X-RateLimit-Reset", reset);

        if (!success) {
          return res.status(429).json(typeof message === "string" ? { error: message } : message);
        }
        next();
      } catch (err) {
        console.error(`[Rate Limiter] Redis error for route prefix '${keyPrefix}':`, err.message);
        // Fallback gracefully to allow the request on redis failures
        next();
      }
    };
  }

  // Fallback to express-rate-limit
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message,
  });
}

module.exports = { createLimiter };
