#!/usr/bin/env node

import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { Spinner } from "../bin/spinner.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 29200;
const HEALTH_URL = `http://${HOST}:${PORT}/api/health`;
const APP_URL = `http://${HOST}:${PORT}`;

// Check if server is already running by polling the health endpoint
function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(HEALTH_URL, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on("error", () => {
      resolve(false);
    });

    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Open browser cross-platform (supporting Windows PowerShell / cmd, macOS, Linux)
function openBrowser(url) {
  console.log(`Opening browser at ${url} ...`);
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
  const spinner = new Spinner("Initializing Olan's Jira launcher...").start();

  // 1. Check if server is already running
  spinner.update("Checking for existing running server...");
  const isRunning = await checkServerRunning();
  if (isRunning) {
    spinner.succeed(`Olan's Jira is already running at ${APP_URL}`);
    console.log("[Info] Opening browser tab...");
    openBrowser(APP_URL);
    return;
  }

  // 2. Ensure frontend build exists
  const webDist = path.resolve(ROOT_DIR, "apps/web/dist");
  if (!fs.existsSync(webDist)) {
    spinner.update("Building production frontend bundle...");
    const buildProc = spawn(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["run", "build"],
      { cwd: ROOT_DIR, stdio: "inherit" }
    );

    await new Promise((resolve, reject) => {
      buildProc.on("close", (code) => {
        if (code === 0) resolve(true);
        else reject(new Error(`Build failed with exit code ${code}`));
      });
    });
    spinner.start("Continuing server launch...");
  }

  // 3. Start server bound to 127.0.0.1
  spinner.update(`Starting server bound to ${HOST}:${PORT} ...`);
  const serverPath = path.resolve(ROOT_DIR, "apps/server/dist/index.js");

  const serverProc = spawn("node", [serverPath], {
    cwd: path.resolve(ROOT_DIR, "apps/server"),
    env: {
      ...process.env,
      NODE_ENV: "production",
      HOST,
      PORT: String(PORT),
    },
    stdio: ["ignore", "pipe", "inherit"],
  });

  serverProc.on("error", (err) => {
    spinner.fail(`Failed to start server process: ${err.message}`);
    process.exit(1);
  });

  // Handle graceful termination
  const cleanup = () => {
    spinner.stop();
    console.log("\n[Shutdown] Stopping Olan's Jira server...");
    serverProc.kill("SIGINT");
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // 4. Poll until server is ready, then open browser
  spinner.update("Waiting for server to become ready...");
  let ready = false;
  for (let attempt = 1; attempt <= 30; attempt++) {
    await new Promise((r) => setTimeout(r, 400));
    ready = await checkServerRunning();
    if (ready) break;
  }

  if (ready) {
    spinner.succeed(`Server is up and running at ${APP_URL}`);
    serverProc.stdout.pipe(process.stdout);
    openBrowser(APP_URL);
  } else {
    spinner.warn("Server startup is taking longer than expected.");
    console.log(`You can check manually at: ${APP_URL}`);
  }
}

main().catch((err) => {
  console.error("[Fatal Error]", err);
  process.exit(1);
});
