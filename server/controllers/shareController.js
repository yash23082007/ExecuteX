// server/controllers/shareController.js
// Share feature: save code snippets to MongoDB and retrieve by slug

const Snippet = require("../models/Snippet");
const { nanoid } = require("nanoid");

/**
 * POST /api/v1/share
 * Body: { language: "python", code: "print('hello')" }
 * Returns: { slug: "xt78qz1a" }
 */
async function createShare(req, res) {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({
      success: false,
      error: "Both 'language' and 'code' are required.",
    });
  }

  try {
    const slug = nanoid(8);
    const snippet = new Snippet({ slug, language, code });
    await snippet.save();

    console.log(`[Share] Created snippet: ${slug}`);

    return res.json({
      success: true,
      slug,
      url: `/s/${slug}`,
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
 * Returns: { language: "python", code: "print('hello')" }
 */
async function getShare(req, res) {
  const { slug } = req.params;

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
      language: snippet.language,
      code: snippet.code,
      createdAt: snippet.createdAt,
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
