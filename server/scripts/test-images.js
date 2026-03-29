// server/scripts/test-images.js
const { execSync } = require('child_process');
const languageMap = require('../utils/languageMap');

const uniqueImages = [...new Set(Object.values(languageMap).map(l => l.image))];
console.log(`Checking ${uniqueImages.length} images...`);

const results = {};
for (const img of uniqueImages) {
  try {
    // Just pinging the registry to see if the tag exists without pulling it all
    // using Docker manifest inspect (requires experimental features, mostly enabled on Docker Desktop)
    execSync(`docker manifest inspect ${img}`, { stdio: 'ignore' });
    results[img] = 'VALID';
    console.log(`✅ ${img}`);
  } catch (err) {
    results[img] = 'INVALID';
    console.log(`❌ ${img}`);
  }
}
console.log(JSON.stringify(results, null, 2));
