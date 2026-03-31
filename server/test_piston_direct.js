const { executeInPiston } = require("../server/utils/pistonExecutor");

async function test() {
  console.log("Testing Piston Public API...");
  try {
    const result = await executeInPiston("python", "3.10.0", "print('Hello from Piston!')");
    console.log("TEST RESULT:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("TEST FAILED:", err);
  }
}

test();
