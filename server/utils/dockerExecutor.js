// server/utils/dockerExecutor.js
// Wraps Docker execution with strict resource limits, timeout, and cleanup.

const { exec } = require("child_process");
const path = require("path");

const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS) || 10000;

/**
 * Executes code inside a Docker container with strict sandboxing.
 * @param {string} image - Docker image name (e.g., "gcc:alpine")
 * @param {string} cmd - The compile/run command to execute inside the container
 * @param {string} jobDir - Absolute path to the directory containing the code file
 * @param {string} jobId - Unique identifier for the job
 * @returns {Promise<{output: string, executionTime: number, error: boolean}>}
 */
function executeInDocker(image, cmd, jobDir, jobId) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    // If running in Docker-out-of-Docker, we use the named volume instead of a bind mount
    const volumeName = process.env.TEMP_JOBS_VOLUME;
    let mountFlag = `-v "${jobDir}:/app"`;
    let workDir = "/app";

    if (volumeName) {
      // Mount the entire volume to /jobs, but set working directory to the specific jobId folder
      mountFlag = `-v ${volumeName}:/jobs`;
      workDir = `/jobs/${jobId}`;
    }

    const dockerCmd = [
      "docker run",
      "--rm",                           // Auto-remove container
      "--memory=256m",                  // Max 256MB RAM
      "--cpus=0.5",                     // Half a CPU core
      "--network=none",                 // No internet access
      mountFlag,                        // Mount code directory (volume or bind)
      `-w ${workDir}`,                  // Working directory
      image,                           // Docker image
      cmd,                              // Compile/run command
    ].join(" ");

    console.log(`[Docker] Executing: ${dockerCmd}`);

    const childProcess = exec(
      dockerCmd,
      {
        timeout: TIMEOUT_MS,
        maxBuffer: 1024 * 1024, // 1MB output buffer
        shell: true,
      },
      (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;

        if (error) {
          // Check if it was a timeout
          if (error.killed) {
            resolve({
              output:
                "⏱️ Execution timed out! Your code exceeded the maximum execution time of " +
                (TIMEOUT_MS / 1000) +
                " seconds.\nThis usually means an infinite loop or a very long computation.",
              executionTime,
              error: true,
              timedOut: true,
            });
          } else {
            // Compilation or runtime error
            const errorOutput = stderr || stdout || error.message;
            resolve({
              output: errorOutput,
              executionTime,
              error: true,
              timedOut: false,
            });
          }
        } else {
          // Successful execution
          const output = stdout + (stderr ? "\n" + stderr : "");
          resolve({
            output: output || "(No output)",
            executionTime,
            error: false,
            timedOut: false,
          });
        }
      }
    );
  });
}

module.exports = { executeInDocker };
