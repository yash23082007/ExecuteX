// server/utils/pistonExecutor.js
// Migration: Reverts to Piston Public API (No Key Required).

const PISTON_API_URL = process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston/execute";

/**
 * Executes code using the Piston Public API (Zero Key Required).
 * @param {string} language - language identifier (pistonId)
 * @param {string} version - Language version (pistonVersion)
 * @param {string} code - Source code to execute
 */
async function executeInPiston(language, version, code) {
  const startTime = Date.now();

  try {
    const response = await fetch(PISTON_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: language,
        version: version,
        files: [
          {
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    // Piston structure: data.run { stdout, stderr, code, signal, output }
    // Some languages also have data.compile { stdout, stderr, code, signal, output }
    const run = data.run || {};
    const compile = data.compile || {};

    // Combine output: prioritizes compile error if present
    let finalOutput = "";
    let isError = false;

    if (compile.code !== undefined && compile.code !== 0) {
      finalOutput = compile.output || compile.stderr || "Compilation Error";
      isError = true;
    } else {
      finalOutput = run.output || "(No output)";
      isError = run.code !== 0 || (run.stderr && run.stderr.length > 0);
    }

    return {
      output: finalOutput,
      executionTime,
      error: isError,
      timedOut: run.signal === "SIGTERM" || compile.signal === "SIGTERM",
    };
  } catch (err) {
    console.error("[Piston] Execution failed:", err);
    return {
      output: `❌ Execution Error: ${err.message}`,
      executionTime: Date.now() - startTime,
      error: true,
      timedOut: false,
    };
  }
}

module.exports = { executeInPiston };
