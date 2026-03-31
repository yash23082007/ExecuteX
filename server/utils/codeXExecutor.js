// server/utils/codeXExecutor.js
// Execution engine switched to CodeX API (Zero-Host configuration)

const CODEX_API_URL = process.env.CODEX_API_URL || "https://api.codex.jaagrav.in";

/**
 * Executes code using the Public CodeX API.
 * @param {string} language - language identifier for CodeX (e.g. py, cpp)
 * @param {string} code - Source code to execute
 */
async function executeInCodeX(language, code) {
  const startTime = Date.now();

  try {
    const response = await fetch(CODEX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
        language: language,
        input: ""
      }),
    });

    if (!response.ok) {
      throw new Error(`CodeX API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    // CodeX response: { output: string, error: string, info: string, timestamp: number }
    let finalOutput = "";
    let isError = false;

    if (data.error && data.error.length > 0) {
      finalOutput = data.error;
      isError = true;
    } else {
      finalOutput = data.output || "(No output)";
      isError = false;
    }

    return {
      output: finalOutput,
      executionTime,
      error: isError,
      timedOut: false,
    };
  } catch (err) {
    console.error("[CodeX] Execution failed:", err);
    return {
      output: `❌ Execution Error: ${err.message}`,
      executionTime: Date.now() - startTime,
      error: true,
      timedOut: false,
    };
  }
}

module.exports = { executeInCodeX };