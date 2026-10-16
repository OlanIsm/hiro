#!/usr/bin/env node

import http from "node:http";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

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

// 3. Setup Networking and Database Environment
const HOST = process.env.HOST || config.host || "127.0.0.1";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (config.port || 29200);
const dbFile = path.join(dataDir, "hiro.db");
const dbUrl = "file:" + dbFile.replace(/\\/g, "/");

const HEALTH_URL = `http://${HOST}:${PORT}/api/health`;
const APP_URL = `http://${HOST}:${PORT}`;

function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(HEALTH_URL, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on("error", () => resolve(false));

    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function openBrowser(url) {
  const platform = process.platform;
  let command = "";
  let args = [];

  if (platform === "win32") {
    command = "cmd.exe";
    args = ["/c", "start", "", url];
  } else if (platform === "darwin") {
    command = "open";
    args = [url];
  } else {
    command = "xdg-open";
    args = [url];
  }

  spawn(command, args, { detached: true, stdio: "ignore" }).unref();
}

async function main() {
  // Check if server is already running
  const isRunning = await checkServerRunning();
  if (isRunning) {
    console.log(`[Hiro] Already running at ${APP_URL}`);
    console.log("[Hiro] Opening browser...");
    openBrowser(APP_URL);
    return;
  }

  // 4. Auto-Migration on Data Directory SQLite DB
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
      console.error("[Hiro] Database auto-migration warning:", migrateResult.stderr || migrateResult.stdout);
    }
  }

  // 5. Ensure Production Builds Exist
  const webDist = path.resolve(ROOT_DIR, "apps/web/dist");
  const serverDist = path.resolve(ROOT_DIR, "apps/server/dist/index.js");

  if (!fs.existsSync(webDist) || !fs.existsSync(serverDist)) {
    console.log("[Hiro] Production build missing. Performing initial build...");
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

  // 6. Print Welcome Banner
  console.log("\n=======================================================");
  console.log("   ★ HIRO — Single-User Local Internship Tracker ★    ");
  console.log("=======================================================");
  console.log(`   Local URL:    ${APP_URL}`);
  console.log(`   Database:     ${dbFile}`);
  console.log(`   Data Dir:     ${dataDir}`);
  console.log("=======================================================");
  console.log("   Press Ctrl+C to stop server.\n");

  // 7. Spawn Express Server
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

  // 8. Poll until server is healthy and open browser
  let ready = false;
  for (let attempt = 1; attempt <= 30; attempt++) {
    await new Promise((r) => setTimeout(r, 400));
    ready = await checkServerRunning();
    if (ready) break;
  }

  if (ready) {
    console.log(`[Hiro] Opening browser at ${APP_URL} ...`);
    openBrowser(APP_URL);
  }
}

main().catch((err) => {
  console.error("[Hiro] Fatal error:", err);
  process.exit(1);
});
