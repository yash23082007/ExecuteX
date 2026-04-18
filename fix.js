const fs = require('fs');
const content = // server/controllers/shareController.js
// Share feature: save code snippets to MongoDB and retrieve by slug

const Snippet = require("../models/Snippet");
const { nanoid } = require("nanoid");
const { z } = require("zod");

const ShareSchema = z.object({
  language: z.string().min(1).max(50),
  code: z.string().min(1).max(50000),
});

async function createShare(req, res) {
  const parsed = ShareSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "Invalid input", details: parsed.error.flatten() });
  }

  const { language, code } = parsed.data;

  try {
    const slug = nanoid(21);
    const snippet = new Snippet({ slug, language, code });
    await snippet.save();
    console.log("[Share] Created snippet:", slug);
    return res.json({ success: true, share: { slug } });
  } catch (err) {
    console.error("[Share] Error creating snippet:", err);
    return res.status(500).json({ success: false, error: "Failed to save snippet." });
  }
}

async function getShare(req, res) {
  const slugSchema = z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/);
  const parsed = slugSchema.safeParse(req.params.slug);
  if (!parsed.success) return res.status(400).json({ success: false, error: "Invalid slug" });

  const slug = parsed.data;

  try {
    const snippet = await Snippet.findOne({ slug });
    if (!snippet) return res.status(404).json({ success: false, error: "Snippet not found." });
    return res.json({ success: true, share: { language: snippet.language, code: snippet.code, createdAt: snippet.createdAt } });
  } catch (err) {
    console.error("[Share] Error retrieving snippet:", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve snippet." });
  }
}

module.exports = { createShare, getShare };
;
fs.writeFileSync('server/controllers/shareController.js', content);
