const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const testDir = path.join(__dirname, "test_job");
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

fs.writeFileSync(path.join(testDir, "test.py"), "print('hello from docker')", "utf-8");

console.log("Testing Path Mount Formats...");

const formats = [
  // 1. Raw windows path
  testDir,
  // 2. UNIX-style windows path
  testDir.replace(/\\/g, "/"),
  // 3. WSL style /c/
  "/" + testDir[0].toLowerCase() + testDir.slice(2).replace(/\\/g, "/")
];

for (const mount of formats) {
  const cmd = `docker run --rm -v "${mount}:/app" -w /app python:3.12-alpine python test.py`;
  console.log("\\nTrying:", cmd);
  try {
    const out = execSync(cmd, { shell: true, stdio: "pipe" }).toString();
    console.log("SUCCESS:", out.trim());
    break; // We found the working format!
  } catch (err) {
    console.log("FAILED:", err.message.split('\\n')[0]);
    if (err.stderr) console.log("STDERR:", err.stderr.toString().trim());
  }
}

fs.rmSync(testDir, { recursive: true, force: true });
