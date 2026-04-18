// server/controllers/shareController.js
// Share feature: save code snippets to MongoDB and retrieve by slug

const Snippet = require("../models/Snippet");
const { nanoid } = require("nanoid");
const { z } = require("zod");
const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");

// Initialize Upstash Redis & Ratelimiter
let ratelimit;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests/min per IP
      analytics: true,
    });
  } else {
    console.warn("Upstash Redis not configured, rate limiting disabled.");
  }
} catch {
  console.warn("Upstash Redis not configured, rate limiting disabled.");
}

const ShareSchema = z.object({
  language: z.string().min(1).max(50),
  code: z.string().min(1).max(50000),
});

/**
 * POST /api/v1/share
 * Body: { language: "python", code: "print('hello')" }
 * Returns: { success: true, share: { slug: "xt78qz1a" } }
 */
async function createShare(req, res) {
  // Rate limiting check
  if (ratelimit) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return res.status(429).json({ success: false, error: 'Too many requests' });
    }
  }

  const parsed = ShareSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid input",
      details: parsed.error.flatten(),
    });
  }

  const { language, code } = parsed.data;

  try {
    const slug = nanoid(21); // 21-char URL-safe random ID
    const snippet = new Snippet({ slug, language, code });
    await snippet.save();

    console.log(`[Share] Created snippet: ${slug}`);

    return res.json({
      success: true,
      share: {
        slug,
      },
    });
  } catch (err) {
    console.error("[Share] Error creating snippet:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to save snippet.",
    });
  }
}

/**
 * GET /api/v1/share/:slug
 * Returns: { success: true, share: { language: "python", code: "print('hello')" } }
 */
async function getShare(req, res) {
  const slugSchema = z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/);
  const parsed = slugSchema.safeParse(req.params.slug);
  if (!parsed.success) return res.status(400).json({ success: false, error: "Invalid slug" });

  const slug = parsed.data;

  try {
    const snippet = await Snippet.findOne({ slug });
    if (!snippet) {
      return res.status(404).json({
        success: false,
        error: "Snippet not found or has expired.",
      });
    }

    return res.json({
      success: true,
      share: {
        language: snippet.language,
        code: snippet.code,
        createdAt: snippet.createdAt,
      },
    });
  } catch (err) {
    console.error("[Share] Error retrieving snippet:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve snippet.",
    });
  }
}

module.exports = { createShare, getShare };

