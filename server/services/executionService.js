const crypto = require("crypto");
const PQueue = require("p-queue").default || require("p-queue");

// Concurrency queue
const executeQueue = new PQueue({ concurrency: 10 });

// Piston Mapping
const PISTON_LANG_MAP = {
  "gcc-head-c": { language: "c", version: "*" },
  "gcc-head": { language: "c++", version: "*" },
  "openjdk-jdk-22+36": { language: "java", version: "*" },
  "mono-6.12.0.199": { language: "csharp", version: "*" },
  "cpython-3.14.0": { language: "python", version: "*" },
  "r-4.4.1": { language: "r", version: "*" },
  "julia-1.10.5": { language: "julia", version: "*" },
  "nodejs-20.17.0": { language: "javascript", version: "*" },
  "typescript-5.6.2": { language: "typescript", version: "*" },
  "php-8.3.12": { language: "php", version: "*" },
  "ruby-3.4.1": { language: "ruby", version: "*" },
  "go-1.23.2": { language: "go", version: "*" },
  "rust-1.82.0": { language: "rust", version: "*" },
  "scala-3.3.4": { language: "scala", version: "*" },
  "ghc-9.10.1": { language: "haskell", version: "*" },
  "lua-5.4.7": { language: "lua", version: "*" },
  "bash": { language: "bash", version: "*" },
  "perl-5.42.0": { language: "perl", version: "*" },
};

async function executeViaWandbox(payload) {
  const wandboxController = new AbortController();
  const timeoutId = setTimeout(() => wandboxController.abort(), 12000);
  const wandboxRes = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: wandboxController.signal
  });
  clearTimeout(timeoutId);

  if (wandboxRes.ok) {
    return await wandboxRes.json();
  }
  throw new Error("Wandbox returned non-200");
}

async function executeViaPiston(payload) {
  const { compiler, code, stdin } = payload;
  const pistonLang = PISTON_LANG_MAP[compiler]?.language || compiler.split("-")[0] || "python";
  const pistonVersion = PISTON_LANG_MAP[compiler]?.version || "*";

  const pistonRes = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: pistonLang,
      version: pistonVersion,
      files: [{ content: code }],
      stdin: stdin || "",
    }),
  });
  
  if (!pistonRes.ok) throw new Error("Piston API unavailable.");
  const pistonData = await pistonRes.json();

  return {
    status: (pistonData.run?.code === 0) ? "0" : "1",
    program_message: pistonData.run?.stdout || pistonData.run?.stderr || "",
    compiler_message: pistonData.compile?.stderr || "",
  };
}

async function executeCode(payload, redis) {
  return executeQueue.add(async () => {
    const { code, compiler, options, stdin } = payload;
    let cacheKey = null;

    if (redis) {
      cacheKey = `exec:${crypto.createHash("sha256").update(compiler + code + (stdin || "") + (options || "")).digest("hex")}`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return typeof cached === "string" ? JSON.parse(cached) : cached;
        }
      } catch (redisErr) {
        console.warn("[Redis Cache Error]", redisErr.message);
      }
    }

    let data = null;
    let providerSuccess = false;

    // Tier 1
    try {
      data = await executeViaWandbox(payload);
      providerSuccess = true;
    } catch (tier1Err) {
      console.warn(`[Circuit Breaker] Wandbox failed (${tier1Err.message}), falling back to Piston...`);
    }

    // Tier 2
    if (!providerSuccess) {
      try {
        data = await executeViaPiston(payload);
        providerSuccess = true;
      } catch (tier2Err) {
        console.error(`[Circuit Breaker] Piston failed: ${tier2Err.message}`);
        throw new Error("All execution providers unavailable.", { cause: tier2Err });
      }
    }

    // Cache result
    if (redis && cacheKey && providerSuccess) {
      const safeData = {
        ...data,
        program_output: (data.program_output || "").slice(0, 65536),
        compiler_message: (data.compiler_message || "").slice(0, 8192),
      };
      await redis.setex(cacheKey, 300, JSON.stringify(safeData));
    }

    return data;
  });
}

module.exports = { executeCode };