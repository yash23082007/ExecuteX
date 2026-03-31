// server/test_all_piston.js
// Script to verify multiple languages against the Piston Public API

const languageMap = require("./utils/languageMap");
const { executeInPiston } = require("./utils/pistonExecutor");

const languagesToTest = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c",
  "cpp",
  "go",
  "rust"
];

async function runTests() {
  console.log("🚀 Starting Piston API Verification...\n");

  for (const langKey of languagesToTest) {
    const config = languageMap[langKey];
    if (!config) {
      console.error(`❌ Language config not found for: ${langKey}`);
      continue;
    }

    console.log(`🧪 Testing ${config.displayName} (${config.pistonId} v${config.pistonVersion})...`);
    
    try {
      const result = await executeInPiston(config.pistonId, config.pistonVersion, config.boilerplate);
      if (result.error) {
        console.error(`  ❌ Error: ${result.output.trim()}`);
      } else {
        console.log(`  ✅ Success! Output: ${result.output.trim()} (${result.executionTime}ms)`);
      }
    } catch (err) {
      console.error(`  💥 Fatal Error: ${err.message}`);
    }
  }

  console.log("\n🏁 Verification Complete.");
}

runTests();
