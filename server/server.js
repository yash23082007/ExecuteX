// server/server.js
// ExecuteX API Gateway — Express Entry Point

require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "";

// MongoDB Connection (optional — Share feature)
async function connectDatabase() {
  if (!MONGO_URI) {
    console.log("[MongoDB] No MONGO_URI set. Share feature disabled.");
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[MongoDB] Connected successfully.");
  } catch (err) {
    console.error("[MongoDB] Connection failed:", err.message);
    console.log("[MongoDB] Share feature will be unavailable.");
  }
}

// Start Server
async function start() {
  await connectDatabase();
  const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║       ⚡ ExecuteX API Gateway ⚡         ║
║────────────────────────────────────────║
║  Port:     ${String(PORT).padEnd(29)}║
║  Env:      ${(process.env.NODE_ENV || "development").padEnd(29)}║
║  MongoDB:  ${(MONGO_URI ? "Connected" : "Disabled").padEnd(29)}║
╚════════════════════════════════════════╝
    `);
  });

  process.on('SIGTERM', () => {
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000); // force kill after 10s
  });
}

start();