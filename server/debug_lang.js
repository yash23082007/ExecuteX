const { execSync } = require("child_process");
try {
  const c = execSync(`docker run --rm -v "c:\\Users\\yash6\\New folder (26)\\New folder\\server\\temp_jobs\\test_c":/app frolvlad/alpine-gxx sh -c "cat /app/main.c && gcc /app/main.c -o /tmp/out && /tmp/out"`, { encoding: 'utf8', stdio: 'pipe' });
  console.log("C SUCCESS:", c);
} catch (e) {
  console.log("C FAILED:", e.message, "\\nOUT:", e.stdout, "\\nERR:", e.stderr);
}
