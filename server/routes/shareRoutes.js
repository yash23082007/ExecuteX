// server/routes/shareRoutes.js
// Share routes — with dedicated rate limiter and content guards

const express = require("express");
const router = express.Router();
const { createLimiter } = require("../utils/rateLimiter");
const { createShare, getShare } = require("../controllers/shareController");

// Dedicated share rate limiter — tighter than the global limiter
const shareLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 share creations per minute per IP
  message: { success: false, error: "Too many share requests. Please wait a minute." },
  keyPrefix: "share",
});

// Content guard middleware — reject non-JSON or binary-looking payloads
function contentGuard(req, res, next) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    return res.status(415).json({ success: false, error: "Content-Type must be application/json." });
  }

  // Reject payloads that look binary (null bytes in the code field)
  if (req.body && req.body.code && req.body.code.indexOf(String.fromCharCode(0)) !== -1) {
    return res.status(400).json({ success: false, error: "Binary content is not allowed." });
  }

  next();
}

router.post("/share", shareLimiter, contentGuard, createShare);
router.get("/share/:slug", getShare);

module.exports = router;
