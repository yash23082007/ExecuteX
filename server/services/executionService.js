// server/services/executionService.js
// Execution service — proxies code to Wandbox with concurrency throttling and Piston fallback

const PQueue = require("p-queue");

// Bounded queue: max 5 concurrent outbound requests
const executionQueue = new PQueue({ concurrency: 5 });

// Mapping from Wandbox compiler IDs to Piston language keys
const COMPILER_TO_PISTON_LANG = {
  "gcc-head-c": "c",
  "gcc-head": "cpp",
  "openjdk-jdk-22+36": "java",
  "mono-6.12.0.199": "csharp",
  "cpython-3.14.0": "python",
  "r-4.4.1": "r",
  "julia-1.10.5": "julia",
  "nodejs-20.17.0": "javascript",
  "typescript-5.6.2": "typescript",
  "php-8.3.12": "php",
  "ruby-3.4.1": "ruby",
  "go-1.23.2": "go",
  "rust-1.82.0": "rust",
  "scala-3.3.4": "scala",
  "ghc-9.10.1": "haskell",
  "lua-5.4.7": "lua",
  "bash": "bash",
  "perl-5.42.0": "perl"
};

async function executeViaWandbox(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 14000);

  const res = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (res.ok) {
    return await res.json();
  }

  throw new Error("Wandbox returned non-200: " + res.status);
}

async function executeViaPiston(pistonLang, code, stdin) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 14000);

  const res = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: pistonLang,
      version: "*",
      files: [{ content: code }],
      stdin: stdin || "",
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (res.ok) {
    const data = await res.json();
    return mapPistonToWandbox(data);
  }

  throw new Error("Piston returned non-200: " + res.status);
}

function mapPistonToWandbox(pistonRes) {
  const exitCode = pistonRes.run.code !== null ? String(pistonRes.run.code) : "0";
  return {
    status: exitCode,
    signal: pistonRes.run.signal || "",
    compiler_output: "",
    compiler_error: "",
    compiler_message: "",
    program_output: pistonRes.run.stdout || "",
    program_error: pistonRes.run.stderr || "",
    program_message: pistonRes.run.output || "",
  };
}

/**
 * executeCode — queues the request through p-queue to avoid overloading execution engines.
 * Attempts Wandbox first. If it fails or times out, falls back to Piston.
 * Throws a descriptive error on failure so the route layer can return the right status.
 */
async function executeCode(payload) {
  const { compiler, code, stdin } = payload;
  const pistonLang = COMPILER_TO_PISTON_LANG[compiler];

  try {
    // Tier 1: Wandbox
    console.log(`[Execution] Attempting Tier 1 (Wandbox) for compiler: ${compiler}`);
    const data = await executionQueue.add(() => executeViaWandbox(payload));
    return { ...data, provider: "wandbox" };
  } catch (wandboxErr) {
    console.error(`[Execution] Tier 1 (Wandbox) failed: ${wandboxErr.message}`);

    if (pistonLang) {
      try {
        // Tier 2: Piston Fallback
        console.log(`[Execution] Attempting Tier 2 Fallback (Piston) for language: ${pistonLang}`);
        const data = await executionQueue.add(() => executeViaPiston(pistonLang, code, stdin));
        return { ...data, provider: "piston" };
      } catch (pistonErr) {
        console.error(`[Execution] Tier 2 Fallback (Piston) also failed: ${pistonErr.message}`);
      }
    }

    // Degraded state: both execution paths failed
    const errorType = wandboxErr.name === "AbortError" ? "timed out" : "unavailable";
    const degraded = new Error(`Execution service ${errorType}. Please try again later.`);
    degraded.isDegraded = true;
    degraded.cause = wandboxErr;
    throw degraded;
  }
}

module.exports = { executeCode };
