const crypto = require("crypto");
const PQueue = require("p-queue").default || require("p-queue");

// Concurrency queue
const executeQueue = new PQueue({ concurrency: 10 });

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

async function executeCode(payload) {
  return executeQueue.add(async () => {
    let data = null;

    try {
      data = await executeViaWandbox(payload);
      return data;
    } catch (tier1Err) {
      console.error("[Circuit Breaker] Wandbox failed: " + tier1Err.message);
      throw new Error("All execution providers unavailable.", { cause: tier1Err });
    }
  });
}

module.exports = { executeCode };
