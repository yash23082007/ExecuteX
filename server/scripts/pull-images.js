const { execSync } = require("child_process");
const languageMap = require("../utils/languageMap");

console.log("🚀 Starting to pull required Docker executor images for ExecuteX...\n");

const images = Object.values(languageMap).map(lang => lang.image);
// Filter out duplicates (like gcc:alpine which is used multiple times)
const uniqueImages = [...new Set(images)];

let successCount = 0;
let failCount = 0;

for (let i = 0; i < uniqueImages.length; i++) {
  const image = uniqueImages[i];
  console.log(`[${i + 1}/${uniqueImages.length}] Pulling: ${image}`);
  try {
    // Run docker pull synchronously
    execSync(`docker pull ${image}`, { stdio: "inherit" });
    successCount++;
    console.log(`✅ Successfully pulled ${image}\n`);
  } catch (error) {
    failCount++;
    console.error(`❌ Failed to pull ${image}\n`);
  }
}

console.log(`\n🎉 Image pull complete!`);
console.log(`✅ Success: ${successCount} | ❌ Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
