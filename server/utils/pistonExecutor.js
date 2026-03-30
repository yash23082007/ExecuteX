// server/utils/pistonExecutor.js
// Migration: Replaces Piston with Judge0 due to Piston API blocking Vercel.

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions";

// Judge0 language IDs
const JUDGE0_LANG_MAP = {
  python: 71,
  javascript: 93,
  c: 50,
  cpp: 54,
  java: 62,
  csharp: 51,
  ruby: 72,
  php: 68,
  go: 60,
  rust: 73,
  typescript: 74,
  bash: 46,
  swift: 83,
  kotlin: 78,
  scala: 81,
  lua: 64,
  perl: 85,
  r: 80,
  haskell: 61,
  julia: 104
};

/**
 * Executes code using the Judge0 API (serverless compatible).
 * @param {string} language - language identifier
 * @param {string} version - Language version
 * @param {string} code - Source code to execute
 */
async function executeInPiston(language, version, code) {
  const startTime = Date.now();
  const langId = JUDGE0_LANG_MAP[language] || 71; // Default to python if not found

  try {
    const headers = {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.JUDGE0_API_KEY || "", 
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
    };

    // 1. Submit code to Judge0
    const submissionRes = await fetch(`${JUDGE0_API_URL}?base64_encoded=false&wait=true`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: langId,
        source_code: code,
      }),
    });

    if (!submissionRes.ok) {
      if (submissionRes.status === 401 || submissionRes.status === 403) {
          throw new Error("Invalid or missing Judge0 API Key in Vercel Environment Variables. Please set JUDGE0_API_KEY.");
      }
      throw new Error(`Judge0 API error: ${submissionRes.statusText}`);
    }

    const data = await submissionRes.json();
    const executionTime = Date.now() - startTime;

    // Combine output vs errors
    let output = data.stdout || "";
    if (data.compile_output) output += "\n" + data.compile_output;
    if (data.stderr) output += "\n" + data.stderr;
    if (data.message) output += "\n" + data.message; // Usually a timeout or runtime error message

    // Judge0 status ID 3 means "Accepted/Success". Anything else is an error.
    const isError = data.status && data.status.id !== 3;

    return {
      output: output.trim() || "(No output)",
      executionTime,
      error: isError,
      timedOut: data.status && data.status.id === 5, // Status 5 is Time Limit Exceeded
    };
  } catch (err) {
    console.error("[Judge0] Execution failed:", err);
    return {
      output: `❌ API Error: ${err.message}`,
      executionTime: Date.now() - startTime,
      error: true,
      timedOut: false,
    };
  }
}

module.exports = { executeInPiston };
