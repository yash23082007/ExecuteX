// server/controllers/runnerController.js
// Content Migration: Replaces local Docker execution with CodeX API for serverless compatibility.

const languageMap = require("../utils/languageMap");
const { executeInCodeX } = require("../utils/codeXExecutor");

/**
 * POST /api/v1/compile
 * Body: { language: "python", code: "print('hello')" }
 */
async function compileAndRun(req, res) {
  const { language, code } = req.body;

  // 1. Validate input
  if (!language || !code) {
    return res.status(400).json({
      success: false,
      error: "Both 'language' and 'code' fields are required.",
    });
  }

  const langConfig = languageMap[language];
  if (!langConfig) {
    return res.status(400).json({
      success: false,
      error: `Unsupported language: "${language}".`,
    });
  }

  try {
    console.log(`[Runner] Executing ${language} code via CodeX...`);

    // 2. Execute via CodeX API (Serverless compatible)
    const result = await executeInCodeX(
      langConfig.codeXId,
      code
    );

    console.log(
      `[Runner] Job completed in ${result.executionTime}ms (error: ${result.error})`
    );

    // 3. Return result
    return res.json({
      success: true,
      output: result.output,
      executionTime: result.executionTime,
      error: result.error,
      timedOut: result.timedOut,
      language: langConfig.displayName,
    });
  } catch (err) {
    console.error(`[Runner] Fatal error during execution:`, err);
    return res.status(500).json({
      success: false,
      error: "Internal server error during code execution.",
    });
  }
}

/**
 * GET /api/v1/languages
 * Returns list of supported languages with metadata
 */
function getLanguages(req, res) {
  const languages = Object.entries(languageMap).map(([key, config]) => ({
    key,
    displayName: config.displayName,
    category: config.category,
    boilerplate: config.boilerplate,
  }));

  res.json({ success: true, languages });
}

module.exports = { compileAndRun, getLanguages };

