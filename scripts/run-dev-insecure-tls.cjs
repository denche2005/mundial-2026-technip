/**
 * Solo desarrollo en redes con inspección SSL (proxy corporativo).
 * Equivale a NODE_TLS_REJECT_UNAUTHORIZED=0 para que Node confíe en
 * https://*.supabase.co y en Google Fonts durante `next dev`.
 * No usar en producción.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { spawn } = require("node:child_process");
const path = require("node:path");

const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const extra = process.argv.slice(2);
const child = spawn(process.execPath, [nextCli, "dev", ...extra], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
