// server/controllers/runnerController.js
// Core compilation controller: stages code file → executes in Docker → returns output

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const languageMap = require("../utils/languageMap");
const { executeInDocker } = require("../utils/dockerExecutor");

const TEMP_DIR = path.join(__dirname, "..", "temp_jobs");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * POST /api/v1/compile
 * Body: { language: "python", code: "print('hello')" }
 */
async function compileAndRun(req, res) {
  const { language, code } = req.body;

  // Validate input
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
      error: `Unsupported language: "${language}". Supported: ${Object.keys(languageMap).join(", ")}`,
    });
  }

  // Generate unique job ID to isolate concurrent executions
  const jobId = uuidv4();
  const jobDir = path.join(TEMP_DIR, jobId);
  
  if (!fs.existsSync(jobDir)) {
    fs.mkdirSync(jobDir, { recursive: true });
  }

  // Use generic Main for Java or UUID for others to prevent class name mismatched, all isolated!
  const filename = language === "java" || language === "csharp" ? "Main" + langConfig.ext : "main" + langConfig.ext;
  const filePath = path.join(jobDir, filename);

  try {
    // Stage 1: Write code to isolated temp dir file
    fs.writeFileSync(filePath, code, "utf-8");
    console.log(`[Runner] Staged job ${jobId} → ${jobDir}`);

    // Stage 2: Execute in Docker, mounting ONLY the isolated job folder
    const { image, cmd } = langConfig;
    const result = await executeInDocker(image, cmd(filename), jobDir, jobId);

    console.log(
      `[Runner] Job ${jobId} completed in ${result.executionTime}ms (error: ${result.error})`
    );

    // Stage 3: Return result
    return res.json({
      success: true,
      output: result.output,
      executionTime: result.executionTime,
      error: result.error,
      timedOut: result.timedOut || false,
      language: langConfig.displayName,
    });
  } catch (err) {
    console.error(`[Runner] Fatal error for job ${jobId}:`, err);
    return res.status(500).json({
      success: false,
      error: "Internal server error during code execution.",
    });
  } finally {
    // Stage 4: Cleanup — always delete temp isolated folder
    try {
      if (fs.existsSync(jobDir)) {
        fs.rmSync(jobDir, { recursive: true, force: true });
        console.log(`[Runner] Cleaned up job directory ${jobId}`);
      }
    } catch (cleanupErr) {
      console.error(`[Runner] Cleanup failed for job directory ${jobId}:`, cleanupErr);
    }
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
