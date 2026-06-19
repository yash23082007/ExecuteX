// server/routes/aiRoutes.js
// AI routes — inline completion, code review, and status check

const express = require("express");
const router = express.Router();
const { z } = require("zod");
const { createLimiter } = require("../utils/rateLimiter");
const { isAvailable, generateCompletion, generateReview } = require("../services/aiService");

// ── Rate Limiters ──

const completionLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,             // 20 completions per minute per IP
  message: { success: false, error: "Too many AI completion requests. Please wait." },
  keyPrefix: "ai-complete"
});

const reviewLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 5,              // 5 reviews per minute per IP
  message: { success: false, error: "Too many AI review requests. Please wait." },
  keyPrefix: "ai-review"
});

// ── Schemas ──

const CompletionSchema = z.object({
  language: z.string().min(1).max(50),
  prefix: z.string().max(8192),   // 8KB max prefix
  suffix: z.string().max(8192),   // 8KB max suffix
});

const ReviewSchema = z.object({
  language: z.string().min(1).max(50),
  code: z.string().min(1).max(20480), // 20KB max code for review
});

// ── GET /ai/status ──
// Returns whether the AI feature is available (API key configured)
router.get("/ai/status", (req, res) => {
  res.json({ available: isAvailable() });
});

// ── POST /ai/complete ──
// Ghost-text inline completion
router.post("/ai/complete", completionLimiter, async (req, res) => {
  if (!isAvailable()) {
    return res.status(503).json({ success: false, error: "AI service not configured." });
  }

  const parsed = CompletionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "Invalid input", details: parsed.error.flatten() });
  }

  const { language, prefix, suffix } = parsed.data;

  try {
    const result = await generateCompletion(language, prefix, suffix);
    return res.json({ success: true, completion: result.completion });
  } catch (err) {
    console.error("[AI Route] Completion failed:", err.message);
    return res.status(502).json({ success: false, error: "AI completion failed." });
  }
});

// ── POST /ai/review ──
// On-demand code review with structured suggestions
router.post("/ai/review", reviewLimiter, async (req, res) => {
  if (!isAvailable()) {
    return res.status(503).json({ success: false, error: "AI service not configured." });
  }

  const parsed = ReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "Invalid input", details: parsed.error.flatten() });
  }

  const { language, code } = parsed.data;

  try {
    const result = await generateReview(language, code);
    return res.json({ success: true, suggestions: result.suggestions });
  } catch (err) {
    console.error("[AI Route] Review failed:", err.message);
    return res.status(502).json({ success: false, error: "AI review failed." });
  }
});

module.exports = router;
