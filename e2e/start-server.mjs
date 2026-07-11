/**
 * Starts Next.js in production mode with .env loaded for Playwright E2E runs.
 * npm on Windows does not always forward Playwright webServer env to the child process.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvConfig(root);

const port = process.argv[2] ?? process.env.E2E_PORT ?? "3099";

const required = ["DATABASE_URL", "BETTER_AUTH_SECRET"];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error(
    `[e2e] Missing required env for production server: ${missing.join(", ")}`
  );
  process.exit(1);
}

const baseUrl = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  NODE_ENV: "production",
  PORT: port,
  E2E_DISABLE_RATE_LIMIT: "true",
  E2E_TEST: "true",
  BETTER_AUTH_URL: baseUrl,
  NEXT_PUBLIC_APP_URL: baseUrl,
  DATABASE_URL: process.env.DATABASE_URL?.trim(),
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET?.trim(),
};

const command = "npx";
const child = spawn(command, ["next", "start", "-p", port], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
