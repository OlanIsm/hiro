#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { Spinner } from "./spinner.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const schemaPath = path.resolve(ROOT_DIR, "apps/server/prisma/schema.prisma");
if (!fs.existsSync(schemaPath)) {
  process.exit(0);
}

const spinner = new Spinner("Generating Prisma database client...", { compact: true }).start();

let prismaCli = path.resolve(ROOT_DIR, "node_modules/prisma/build/index.js");
if (!fs.existsSync(prismaCli)) {
  prismaCli = path.resolve(ROOT_DIR, "apps/server/node_modules/prisma/build/index.js");
}

let command = process.execPath;
let args = [prismaCli, "generate", `--schema=${schemaPath}`];

if (!fs.existsSync(prismaCli)) {
  command = process.platform === "win32" ? "npx.cmd" : "npx";
  args = ["prisma", "generate", `--schema=${schemaPath}`];
}

const proc = spawn(command, args, {
  cwd: ROOT_DIR,
  stdio: "pipe",
  env: process.env,
});

let output = "";
proc.stdout?.on("data", (d) => {
  output += d.toString();
});
proc.stderr?.on("data", (d) => {
  output += d.toString();
});

proc.on("close", (code) => {
  if (code === 0) {
    spinner.succeed("Prisma database client generated successfully.");
    process.exit(0);
  } else {
    const clientExists = fs.existsSync(path.resolve(ROOT_DIR, "node_modules/.prisma/client/index.js"));
    if (clientExists && output.includes("EPERM")) {
      spinner.warn("Prisma database client already active in a running process; existing build kept.");
      process.exit(0);
    }
    spinner.fail("Failed to generate Prisma database client.");
    if (output.trim()) {
      console.error(output.trim());
    }
    process.exit(code || 1);
  }
});
