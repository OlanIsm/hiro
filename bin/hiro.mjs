#!/usr/bin/env node

import http from "node:http";
import net from "node:net";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// CLI Argument Handling
const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(ROOT_DIR, "package.json"), "utf8"));
    console.log(`Hiro v${pkg.version || "1.0.0"}`);
  } catch {
    console.log("Hiro v1.0.0");
  }
  process.exit(0);
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Hiro — Local-First Single-User Internship Tracker

Usage:
  hiro [options]

Options:
  --port <number>       Specify custom port (default: 29200)
  --host <address>      Specify bind host (default: 127.0.0.1)
  --reset-password      Clear master password to reinitialize without losing data
  -v, --version         Show current version
  -h, --help            Show this help message

Data Location:
  Database:   ~/.hiro/hiro.db
  Config:     ~/.hiro/config.json
`);
  process.exit(0);
}

// 1. Resolve User Data Directory (Zero-Config, keeps DB safe across updates)
const userHome = os.homedir();
const dataDir = process.env.HIRO_DATA_DIR || path.join(userHome, ".hiro");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 2. Resolve Config & Secrets
const configFile = path.join(dataDir, "config.json");
let config = {};
if (fs.existsSync(configFile)) {
  try {
    config = JSON.parse(fs.readFileSync(configFile, "utf8"));
  } catch {
    config = {};
  }
}

let configChanged = false;
if (!config.sessionSecret) {
  config.sessionSecret = crypto.randomBytes(32).toString("hex");
  configChanged = true;
}
if (!config.tokenEncryptionKey) {
  config.tokenEncryptionKey = crypto.randomBytes(32).toString("hex");
  configChanged = true;
}
if (!config.port) {
  config.port = 29200;
  configChanged = true;
}
if (!config.host) {
  config.host = "127.0.0.1";
  configChanged = true;
}
if (configChanged) {
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2), "utf8");
}

const dbFile = path.join(dataDir, "hiro.db");
const dbUrl = "file:" + dbFile.replace(/\\/g, "/");

// 3. Handle --reset-password using built-in node:sqlite
if (args.includes("--reset-password")) {
  if (fs.existsSync(dbFile)) {
    try {
      const { DatabaseSync } = await import("node:sqlite");
      const db = new DatabaseSync(dbFile);
      db.exec("DELETE FROM AppSettings WHERE key = 'auth_password_hash';");
      console.log("[Hiro] Master password has been reset successfully.");
      console.log("[Hiro] You will be prompted to create a new password upon launch.\n");
    } catch (err) {
      console.error("[Hiro] Could not reset password:", err.message);
    }
  } else {
    console.log("[Hiro] No existing database found. A fresh password setup will appear upon launch.\n");
  }
}

// 4. Resolve Port and Host with Command Line Overrides
let targetPort = config.port || 29200;
const portArgIdx = args.findIndex((a) => a === "--port" || a === "-p");
if (portArgIdx >= 0 && args[portArgIdx + 1]) {
  const p = parseInt(args[portArgIdx + 1], 10);
  if (!isNaN(p)) targetPort = p;
} else if (process.env.PORT) {
  targetPort = parseInt(process.env.PORT, 10);
}

let HOST = config.host || "127.0.0.1";
const hostArgIdx = args.findIndex((a) => a === "--host");
if (hostArgIdx >= 0 && args[hostArgIdx + 1]) {
  HOST = args[hostArgIdx + 1];
} else if (process.env.HOST) {
  HOST = process.env.HOST;
}

// 5. Port Availability & Collision Check
function checkHiroRunning(port, host) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}/api/health`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.service === "olans-jira-server");
        } catch {
          resolve(false);
        }
      });
    });

    req.on("error", () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function isPortAvailable(port, host) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", () => resolve(false));
    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port, host);
  });
}

async function resolveWorkingPort(desiredPort, host) {
  // If Hiro is already running on this port, return it directly
  if (await checkHiroRunning(desiredPort, host)) {
    return { port: desiredPort, isAlreadyRunning: true };
  }

  // If port is available, use it
  if (await isPortAvailable(desiredPort, host)) {
    return { port: desiredPort, isAlreadyRunning: false };
  }

  // Fallback to next available port
  console.log(`[Hiro] Port ${desiredPort} is occupied by another process. Searching for available port...`);
  for (let candidate = desiredPort + 1; candidate < desiredPort + 50; candidate++) {
    if (await isPortAvailable(candidate, host)) {
      console.log(`[Hiro] Using alternative port ${candidate}.`);
      return { port: candidate, isAlreadyRunning: false };
    }
  }

  throw new Error(`No available ports found between ${desiredPort} and ${desiredPort + 50}`);
}

function openBrowser(url) {
  const platform = process.platform;
  let command = "";
  let cmdArgs = [];

  if (platform === "win32") {
    command = "cmd.exe";
    cmdArgs = ["/c", "start", "", url];
  } else if (platform === "darwin") {
    command = "open";
    cmdArgs = [url];
  } else {
    command = "xdg-open";
    cmdArgs = [url];
  }

  spawn(command, cmdArgs, { detached: true, stdio: "ignore" }).unref();
}

async function main() {
  const { port: PORT, isAlreadyRunning } = await resolveWorkingPort(targetPort, HOST);
  const APP_URL = `http://${HOST}:${PORT}`;

  if (isAlreadyRunning) {
    console.log(`[Hiro] Already active at ${APP_URL}`);
    console.log("[Hiro] Opening existing session in browser...");
    openBrowser(APP_URL);
    process.exit(0);
  }

  // 6. Programmatic DB Migration
  const schemaPath = path.resolve(ROOT_DIR, "apps/server/prisma/schema.prisma");
  let prismaCli = path.resolve(ROOT_DIR, "node_modules/prisma/build/index.js");
  if (!fs.existsSync(prismaCli)) {
    prismaCli = path.resolve(ROOT_DIR, "apps/server/node_modules/prisma/build/index.js");
  }

  if (fs.existsSync(prismaCli) && fs.existsSync(schemaPath)) {
    const migrateResult = spawnSync(
      process.execPath,
      [prismaCli, "migrate", "deploy", `--schema=${schemaPath}`],
      {
        env: { ...process.env, DATABASE_URL: dbUrl },
        stdio: "pipe",
        encoding: "utf8",
      }
    );

    if (migrateResult.status !== 0) {
      console.error("[Hiro] Database migration notice:", migrateResult.stderr || migrateResult.stdout);
    }
  }

  // 7. Ensure Production Builds Exist
  const webDist = path.resolve(ROOT_DIR, "apps/web/dist");
  const serverDist = path.resolve(ROOT_DIR, "apps/server/dist/index.js");

  if (!fs.existsSync(webDist) || !fs.existsSync(serverDist)) {
    console.log("[Hiro] Preparing production assets (one-time setup)...");
    const buildProc = spawnSync(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["run", "build"],
      { cwd: ROOT_DIR, stdio: "inherit" }
    );

    if (buildProc.status !== 0) {
      console.error("[Hiro] Build failed.");
      process.exit(1);
    }
  }

  // 8. Welcome Banner
  console.log("\n=======================================================");
  console.log("   ★ HIRO — Single-User Local Internship Tracker ★    ");
  console.log("=======================================================");
  console.log(`   Local URL:    ${APP_URL}`);
  console.log(`   Database:     ${dbFile}`);
  console.log(`   Data Dir:     ${dataDir}`);
  console.log("=======================================================");
  console.log("   Press Ctrl+C to stop server.\n");

  // 9. Spawn Server Process
  const serverProc = spawn(process.execPath, [serverDist], {
    cwd: path.resolve(ROOT_DIR, "apps/server"),
    env: {
      ...process.env,
      NODE_ENV: "production",
      HOST,
      PORT: String(PORT),
      DATABASE_URL: dbUrl,
      SESSION_SECRET: config.sessionSecret,
      GMAIL_TOKEN_ENCRYPTION_KEY: config.tokenEncryptionKey,
      STATIC_PATH: webDist,
    },
    stdio: "inherit",
  });

  serverProc.on("error", (err) => {
    console.error("[Hiro] Failed to start server:", err.message);
    process.exit(1);
  });

  const cleanup = () => {
    console.log("\n[Hiro] Stopping server...");
    serverProc.kill("SIGINT");
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // 10. Wait for Server Health & Open Browser
  let ready = false;
  for (let attempt = 1; attempt <= 30; attempt++) {
    await new Promise((r) => setTimeout(r, 400));
    ready = await checkHiroRunning(PORT, HOST);
    if (ready) break;
  }

  if (ready) {
    console.log(`[Hiro] Server is ready. Opening browser at ${APP_URL} ...`);
    openBrowser(APP_URL);
  }
}

main().catch((err) => {
  console.error("[Hiro] Fatal error:", err);
  process.exit(1);
});
