// server/utils/wandboxExecutor.js
// Execution engine switched to Wandbox API (Zero-Host configuration)

const WANDBOX_API_URL = process.env.WANDBOX_API_URL || "https://wandbox.org/api/compile.json";

/**
 * Executes code using the Public Wandbox API.
 * @param {string} compiler - compiler identifier for Wandbox (e.g. cpython-3.14.0)
 * @param {string} code - Source code to execute
 */
async function executeInWandbox(compiler, code) {
  const startTime = Date.now();

  try {
    const response = await fetch(WANDBOX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
        compiler: compiler,
      }),
    });

    if (!response.ok) {
      throw new Error(`Wandbox API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    // Wandbox response fields
    let finalOutput = "";
    let isError = false;

    if (data.status !== "0" && (data.compiler_error || data.program_error)) {
        finalOutput = data.compiler_error ? data.compiler_error : data.program_error;
        isError = true;
    } else {
        finalOutput = data.program_output || "(No output)";
        isError = false;
    }

    return {
      output: finalOutput,
      executionTime,
      error: isError,
      timedOut: false,
    };
  } catch (err) {
    console.error("[Wandbox] Execution failed:", err);
    return {
      output: `❌ Execution Error: ${err.message}`,
      executionTime: Date.now() - startTime,
      error: true,
      timedOut: false,
    };
  }
}

module.exports = { executeInWandbox };