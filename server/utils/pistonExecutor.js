// server/utils/pistonExecutor.js
// Migration: Replaces local Docker execution with the Piston API for Vercel deployment.

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

/**
 * Executes code using the Piston API (serverless compatible).
 * @param {string} language - Piston language identifier
 * @param {string} version - Language version (or "" for latest)
 * @param {string} code - Source code to execute
 * @returns {Promise<{output: string, executionTime: number, error: boolean}>}
 */
async function executeInPiston(language, version, code) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(PISTON_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version: version || "*",
        files: [{ content: code }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    // Combine compilation and runtime output
    let output = "";
    if (data.compile && data.compile.output) {
      output += data.compile.output;
    }
    if (data.run && data.run.output) {
      output += (output ? "\n" : "") + data.run.output;
    }

    return {
      output: output || "(No output)",
      executionTime,
      error: (data.run && data.run.code !== 0) || (data.compile && data.compile.code !== 0),
      timedOut: false, // Piston handles timeouts internally
    };
  } catch (err) {
    console.error("[Piston] Execution failed:", err);
    return {
      output: `❌ Piston API Error: ${err.message}`,
      executionTime: Date.now() - startTime,
      error: true,
      timedOut: false,
    };
  }
}

module.exports = { executeInPiston };
