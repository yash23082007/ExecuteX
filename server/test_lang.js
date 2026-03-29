const { executeInDocker } = require("./utils/dockerExecutor");
const languageMap = require("./utils/languageMap");
const fs = require("fs");
const path = require("path");

async function testLang(langKey, code) {
  const config = languageMap[langKey];
  const testDir = path.join(__dirname, "temp_jobs", "test_" + langKey);
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  
  const filename = "main" + config.ext;
  if (langKey === 'java' || langKey === 'csharp') {
      // actually, languageMap uses "Main.java"
  }
  const actualFilename = (langKey === 'java' || langKey === 'csharp') ? "Main" + config.ext : filename;
  
  fs.writeFileSync(path.join(testDir, actualFilename), code);
  
  console.log(`Testing ${config.displayName}...`);
  const result = await executeInDocker(config.image, config.cmd(actualFilename), testDir);
  console.log(result);
  
  fs.rmSync(testDir, { recursive: true, force: true });
}

async function runAll() {
  await testLang("c", '#include <stdio.h>\\nint main() { printf("Hello C\\n"); return 0; }');
  await testLang("cpp", '#include <iostream>\\nint main() { std::cout << "Hello C++\\n"; return 0; }');
  await testLang("typescript", 'const x: string = "Hello TS"; console.log(x);');
  await testLang("csharp", 'using System; class Program { static void Main() { Console.WriteLine("Hello C#"); } }');
}

runAll();
